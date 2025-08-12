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
        const invoices = Array.isArray(req.body) ? req.body : [req.body]

        let insertados = 0 // Contador de préstamos que sí se insertan

        for (const [indice, invoice] of invoices.entries()) {
            const {
                invoice_number,
                bulling_period,
                identification_customer,
                invoiced_amount,
                amount_pay 
            } = invoice || {}

            // Validación básica: campos obligatorios
            if (!invoice_number|| !bulling_period|| !identification_customer || !invoiced_amount || !amount_pay ) {
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

            // Comprobar si ya existe ese invoice (mismo customer, número de invoice y fecha)
            const [existingInvoice] = await db.promise().query(
                `SELECT id_invoice 
                FROM invoices 
                WHERE id_customer = ? 
                AND invoice_number = ? 
                AND date_time = ?`,
                [customer[0].id_customer, invoice_number, bulling_period]
            )

            if (existingInvoice.length === 0) {
                // Si NO existe → lo insertamos
                await db.promise().query(
                    `INSERT INTO invoices (
                    id_customer, invoice_number, date_time, invoiced_amount, amount_pay
                    ) VALUES (?, ?, ?, ?, ?)`,
                    [
                        customer[0].id_customer,
                        invoice_number,
                        bulling_period,
                        invoiced_amount,
                        amount_pay
                    ]
                )
                insertados++
            } else {
                // Si ya existe → solo mostramos el error en consola y no insertamos
                console.error(`Fila ${indice}: Invoice duplicado → customer ${identification_customer}, invoice ${invoice_number}, Fecha ${bulling_period}`)
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
        const [invoices] = await db.promise().query(`
    SELECT 
        invoice.id_invoice AS id_de_la_transaccion,
        customer.nombre AS Nombre_del_cliente,
        customer.identificacion AS documento_de_identidad,
        customer.correo AS email_del_clien,
        customer.telefono AS telefono_contacto,
        invoice.titulo AS titulo_del_invoice,
        invoice.isbn AS codigo_isbn,
        invoice.año_publicacion AS año_de_publicacion,
        invoice.autor AS autor_del_invoice,
        invoice.identification_customer AS fecha_de_invoice,
        invoice.invoice_number AS fecha_de_devolucion,
        estado.nombre_estado AS estado_del_invoice,
        invoice.created_at AS fecha_creacion_registro,
        invoice.updated_at AS fecha_ultima_actualizacion
    FROM invoices invoice
    INNER JOIN customers customer ON invoice.id_customer = customer.id_customer
    INNER JOIN invoices invoice ON invoice.id_invoice = invoice.id_invoice
    INNER JOIN estados estado ON invoice.id_estado = estado.id_estado
    ORDER BY customer.id_customer ASC;
    `);

        res.status(200).json({
            mensaje: 'Lista de préstamos obtenida exitosamente',
            total_invoices: invoices.length,
            invoices_encontrados: invoices
        });

    } catch (error) {
        console.error('Error al consultar los préstamos:', error);
        res.status(500).json({
            error: 'Error interno del servidor al obtener préstamos',
            detalle_tecnico: error.message
        });
    }
});

// creo el endpoint de elliminar un dato de la tabla invoice
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    // verifico si me esta enviando el id para enviarlo
    if (!id) return res.status(400).json({ error: 'ID requerido' });

    try {
        const [result] = await db.promise().query(
            'DELETE FROM invoices WHERE id_invoice = ?',
            [id]
        );

        // Reiniciar el contador AUTO_INCREMENT si la tabla está vacía
        const [rows] = await db.promise().query('SELECT COUNT(*) AS total FROM invoices');
        if (rows[0].total === 0) {
            await db.promise().query('ALTER TABLE invoices AUTO_INCREMENT = 1');
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
            `UPDATE invoices 
        SET id_estado = ?, invoice_number = ? 
        WHERE id_invoice = ?`
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
