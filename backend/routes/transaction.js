// Importamos el router de express y la conexión a la base de datos
import { Router } from 'express'
import db from '../db.js'
import { format, isValid } from 'date-fns'

const router = Router()

// Utilidades para normalizar fechas provenientes de Excel o strings


// Reemplazo simple de tu función actual
export function normalizeDateInput(input) {
    if (input == null || input === '') return null

    try {
        const date = typeof input === 'number'
            ? new Date((input - 25569) * 86400 * 1000) // Excel serial
            : new Date(input) // String o Date object

        return isValid(date) ? format(date, 'yyyy-MM-dd') : null
    } catch {
        return null
    }
}

router.post('/', async (req, res) => {
    try {
        const transactions = Array.isArray(req.body) ? req.body : [req.body]

        let insertados = 0 // Contador de préstamos que sí se insertan

        for (const [indice, transaction] of transactions.entries()) {
            const {
                date_time,
                transaction_amount,
                trasaction_type,
                identification_customer,
                invoice_number,
                name_state,
                name_payment
            } = transaction || {}

            // Validación básica: campos obligatorios
            if (!identification_customer|| !invoice_number|| !name_state || !name_payment) {
                console.error(`Fila ${indice}: Faltan campos requeridos`)
                continue
            }

            // Buscar ID del customer
            const [customer] = await db.promise().query(
                'SELECT id_customer FROM customers WHERE identification_customer = ?',
                [identification_customer]
            )
            if (customer.length === 0) {
                console.error(`Fila ${indice}: customer no encontrado (${date_time})`)
                continue
            }

            // Buscar ID del invoice
            const [invoice] = await db.promise().query(
                'SELECT id_invoice FROM invoices WHERE invoice_number = ?',
                [invoice_number]
            )
            if (invoice.length === 0) {
                console.error(`Fila ${indice}: invoice no encontrado (${transaction_amount})`)
                continue
            }

            // Buscar ID del estado
            const [status ] = await db.promise().query(
                'SELECT id_states FROM transaction_status WHERE name_state = ?',
                [name_state]
            )
            if (status.length === 0) {
                console.error(`Fila ${indice}: Estado no encontrado (${trasaction_type})`)
                continue
            }

            const [payment ] = await db.promise().query(
                'SELECT id_payment FROM payment_platforms WHERE name_payment = ?',
                [name_payment]
            )
            if (payment.length === 0) {
                console.error(`Fila ${indice}: Estado no encontrado (${trasaction_type})`)
                continue
            }

            // Normalizamos las fechas
            const fechatransactionISO = normalizeDateInput(date_time)

            // Comprobar si ya existe ese préstamo (mismo customer, invoice y fecha)
            const [transactionExistente] = await db.promise().query(
                `SELECT id_transaction 
                FROM transactions 
                WHERE id_customer = ? 
                AND id_invoice = ? 
                AND identification_customer = ?`,
                [customer[0].id_customer, invoice[0].id_invoice, fechatransactionISO]
            )

            if (transactionExistente.length === 0) {
                // Si NO existe → lo insertamos
                await db.promise().query(
                    `INSERT INTO transactions (
                    id_invoice, id_states, id_payment, date_time,transaction_amount,trasaction_type 
                    ) VALUES (?, ?, ?, ?, ?,?)`,
                    [
                        customer[0].id_customer,
                        invoice[0].id_invoice,
                        status[0].id_estado,
                        fechatransactionISO,
                        transaction_amount,
                        trasaction_type 
                    ]
                )
                insertados++
            } else {
                // Si ya existe → solo mostramos el error en consola y no insertamos
                console.error(`Fila ${indice}: Préstamo duplicado → customer ${date_time}, invoice ${transaction_amount}, Fecha ${fechatransactionISO}`)
            }
        }

        return res.status(201).json({
            mensaje: 'Proceso completado',
            insertados
        })

    } catch (error) {
        console.error('Error al insertar el préstamo:', error)
        res.status(500).json({ error: 'Error interno del servidor' })
    }
})

// creo el enpoid para traer los datos de al frontend
router.get('/', async (req, res) => {
    try {
        const [transactions] = await db.promise().query(`
    SELECT 
        transaction.id_transaction AS id_de_la_transaccion,
        customer.nombre AS Nombre_del_cliente,
        customer.identificacion AS documento_de_identidad,
        customer.correo AS email_del_clien,
        customer.telefono AS telefono_contacto,
        invoice.titulo AS titulo_del_invoice,
        invoice.isbn AS codigo_isbn,
        invoice.año_publicacion AS año_de_publicacion,
        invoice.autor AS autor_del_invoice,
        transaction.identification_customer AS fecha_de_transaction,
        transaction.invoice_number AS fecha_de_devolucion,
        estado.nombre_estado AS estado_del_transaction,
        transaction.created_at AS fecha_creacion_registro,
        transaction.updated_at AS fecha_ultima_actualizacion
    FROM transactions transaction
    INNER JOIN customers customer ON transaction.id_customer = customer.id_customer
    INNER JOIN invoices invoice ON transaction.id_invoice = invoice.id_invoice
    INNER JOIN estados estado ON transaction.id_estado = estado.id_estado
    ORDER BY customer.id_customer ASC;
    `);

        res.status(200).json({
            mensaje: 'Lista de préstamos obtenida exitosamente',
            total_transactions: transactions.length,
            transactions_encontrados: transactions
        });

    } catch (error) {
        console.error('Error al consultar los préstamos:', error);
        res.status(500).json({
            error: 'Error interno del servidor al obtener préstamos',
            detalle_tecnico: error.message
        });
    }
});

// creo el endpoint de elliminar un dato de la tabla transaction
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    // verifico si me esta enviando el id para enviarlo
    if (!id) return res.status(400).json({ error: 'ID requerido' });

    try {
        const [result] = await db.promise().query(
            'DELETE FROM transactions WHERE id_transaction = ?',
            [id]
        );

        // Reiniciar el contador AUTO_INCREMENT si la tabla está vacía
        const [rows] = await db.promise().query('SELECT COUNT(*) AS total FROM transactions');
        if (rows[0].total === 0) {
            await db.promise().query('ALTER TABLE transactions AUTO_INCREMENT = 1');
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Préstamo no encontrado' });
        }

        res.json({ mensaje: 'Préstamo eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar préstamo:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    // verifico si me esta enviando el id para enviarlo
    if (!id) return res.status(400).json({ error: 'ID requerido' });

    try {
        const [result] = await db.promise().query(
            `UPDATE transactions 
       SET id_estado = ?, invoice_number = ? 
       WHERE id_transaction = ?`
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Préstamo no encontrado' });
        }

        res.json({ mensaje: 'Préstamo eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar préstamo:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});



export default router
