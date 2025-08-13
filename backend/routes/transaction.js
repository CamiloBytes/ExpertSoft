// We import the express router and the connection to the database
import { Router } from 'express'
import db from '../db.js'
import { normalizeDateTime } from '../utils/dateNormalizer.js'

const router = Router()

router.post('/', async (req, res) => {
    try {
        const transactions = Array.isArray(req.body) ? req.body : [req.body]

        let insertados = 0 
        let errores = [] 
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

           
            if (!identification_customer || !invoice_number || !name_state || !name_payment) {
                const errorMsg = `Fila ${indice}: Faltan campos requeridos - identification_customer: ${identification_customer}, invoice_number: ${invoice_number}, name_state: ${name_state}, name_payment: ${name_payment}`;
                console.error(errorMsg)
                errores.push(errorMsg)
                continue
            }

            
            const amount = parseFloat(transaction_amount)
            if (isNaN(amount)) {
                const errorMsg = `Fila ${indice}: transaction_amount no es un número válido: ${transaction_amount}`;
                console.error(errorMsg)
                errores.push(errorMsg)
                continue
            }

            try {
               
                const [customer] = await db.promise().query(
                    'SELECT id_customer FROM customers WHERE identification_customer = ?',
                    [identification_customer]
                )
                if (customer.length === 0) {
                    const errorMsg = `Fila ${indice}: customer no encontrado con identification_customer: ${identification_customer}`;
                    console.error(errorMsg)
                    errores.push(errorMsg)
                    continue
                }

                
                const [invoice] = await db.promise().query(
                    'SELECT id_invoice FROM invoices WHERE invoice_number = ?',
                    [invoice_number]
                )
                if (invoice.length === 0) {
                    const errorMsg = `Fila ${indice}: invoice no encontrado con invoice_number: ${invoice_number}`;
                    console.error(errorMsg)
                    errores.push(errorMsg)
                    continue
                }

               
                const [status] = await db.promise().query(
                    'SELECT id_state FROM transaction_status WHERE name_state = ?',
                    [name_state]
                )
                if (status.length === 0) {
                    const errorMsg = `Fila ${indice}: Estado no encontrado con name_state: ${name_state}`;
                    console.error(errorMsg)
                    errores.push(errorMsg)
                    continue
                }

               
                const [payment] = await db.promise().query(
                    'SELECT id_payment FROM payment_platforms WHERE name_payment = ?',
                    [name_payment]
                )
                if (payment.length === 0) {
                    const errorMsg = `Fila ${indice}: Payment platform no encontrado con name_payment: ${name_payment}`;
                    console.error(errorMsg)
                    errores.push(errorMsg)
                    continue
                }

               
                const fechatransactionISO = normalizeDateTime(date_time)

             
                const [transactionExistente] = await db.promise().query(
                    `SELECT id_transaction 
                    FROM transactions 
                    WHERE id_invoice = ? 
                    AND date_time = ?`,
                    [invoice[0].id_invoice, fechatransactionISO]
                )

                if (transactionExistente.length === 0) {
      
                    await db.promise().query(
                        `INSERT INTO transactions (
                        id_invoice, id_state, id_payment, date_time, transaction_amount, trasaction_type 
                        ) VALUES (?, ?, ?, ?, ?, ?)`,
                        [
                            invoice[0].id_invoice,
                            status[0].id_state,
                            payment[0].id_payment,
                            fechatransactionISO,
                            amount,
                            trasaction_type 
                        ]
                    )
                    insertados++
                } else {
                    const errorMsg = `Fila ${indice}: Transacción duplicada - invoice: ${invoice_number}, fecha: ${fechatransactionISO}`;
                    console.error(errorMsg)
                    errores.push(errorMsg)
                }
            } catch (dbError) {
                const errorMsg = `Fila ${indice}: Error en base de datos - ${dbError.message}`;
                console.error(errorMsg)
                errores.push(errorMsg)
            }
        }

        return res.status(201).json({
            mensaje: 'Proceso completado',
            insertados,
            total_filas: transactions.length,
            errores: errores.length > 0 ? errores : null
        })

    } catch (error) {
        console.error('Error al procesar transacciones:', error)
        res.status(500).json({ 
            error: 'Error interno del servidor',
            detalle: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        })
    }
})


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


router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: 'ID requerido' });

    try {
        const [result] = await db.promise().query(
            'DELETE FROM transactions WHERE id_transaction = ?',
            [id]
        );

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
