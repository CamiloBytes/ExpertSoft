// Importamos express para crear la ruta
import express from 'express'

// Importamos la conexión a la base de datos
import db from '../db.js'

// Creamos un enrutador con Express
const router = express.Router()

// 1. Total pagado por cada cliente
router.get('/total-paid-by-customer', async (req, res) => {
    try {
        const [results] = await db.promise().query(`
            SELECT 
                c.id_customer,
                c.name_customer,
                c.identification_customer,
                c.email,
                c.phone,
                COALESCE(SUM(t.transaction_amount), 0) as total_paid,
                COUNT(t.id_transaction) as total_transactions
            FROM customers c
            LEFT JOIN invoices i ON c.id_customer = i.id_customer
            LEFT JOIN transactions t ON i.id_invoice = t.id_invoice
            GROUP BY c.id_customer, c.name_customer, c.identification_customer, c.email, c.phone
            ORDER BY total_paid DESC
        `)
        
        res.status(200).json({
            success: true,
            message: 'Total pagado por cada cliente obtenido exitosamente',
            total_customers: results.length,
            data: results
        })
    } catch (error) {
        console.error('Error al obtener total pagado por cliente:', error)
        res.status(500).json({
            success: false,
            error: 'Error al obtener total pagado por cliente',
            details: error.message
        })
    }
})

// 2. Facturas pendientes con información de cliente y transacción asociada
router.get('/pending-invoices', async (req, res) => {
    try {
        const [results] = await db.promise().query(`
            SELECT 
                i.id_invoice,
                i.invoice_number,
                i.bulling_period,
                i.invoiced_amount,
                i.amount_pay as pending_amount,
                c.id_customer,
                c.name_customer,
                c.identification_customer,
                c.email,
                c.phone,
                t.id_transaction,
                t.date_time,
                t.transaction_amount,
                ts.name_state as transaction_status,
                pp.name_payment as payment_platform
            FROM invoices i
            INNER JOIN customers c ON i.id_customer = c.id_customer
            LEFT JOIN transactions t ON i.id_invoice = t.id_invoice
            LEFT JOIN transaction_status ts ON t.id_state = ts.id_state
            LEFT JOIN payment_platforms pp ON t.id_payment = pp.id_payment
            WHERE i.amount_pay > 0
            ORDER BY i.id_invoice ASC
        `)
        
        res.status(200).json({
            success: true,
            message: 'Facturas pendientes obtenidas exitosamente',
            total_pending_invoices: results.length,
            data: results
        })
    } catch (error) {
        console.error('Error al obtener facturas pendientes:', error)
        res.status(500).json({
            success: false,
            error: 'Error al obtener facturas pendientes',
            details: error.message
        })
    }
})

// 3. Listado de transacciones por plataforma
router.get('/transactions-by-platform/:platform', async (req, res) => {
    const { platform } = req.params
    
    try {
        const [results] = await db.promise().query(`
            SELECT 
                t.id_transaction,
                t.date_time,
                t.transaction_amount,
                t.trasaction_type,
                c.id_customer,
                c.name_customer,
                c.identification_customer,
                c.email,
                i.id_invoice,
                i.invoice_number,
                i.bulling_period,
                i.invoiced_amount,
                ts.name_state as transaction_status,
                pp.name_payment as payment_platform
            FROM transactions t
            INNER JOIN invoices i ON t.id_invoice = i.id_invoice
            INNER JOIN customers c ON i.id_customer = c.id_customer
            INNER JOIN transaction_status ts ON t.id_state = ts.id_state
            INNER JOIN payment_platforms pp ON t.id_payment = pp.id_payment
            WHERE pp.name_payment = ?
            ORDER BY t.date_time DESC
        `, [platform])
        
        res.status(200).json({
            success: true,
            message: `Transacciones de ${platform} obtenidas exitosamente`,
            total_transactions: results.length,
            platform: platform,
            data: results
        })
    } catch (error) {
        console.error('Error al obtener transacciones por plataforma:', error)
        res.status(500).json({
            success: false,
            error: 'Error al obtener transacciones por plataforma',
            details: error.message
        })
    }
})

// Endpoint adicional: Listar todas las plataformas disponibles
router.get('/platforms', async (req, res) => {
    try {
        const [results] = await db.promise().query(`
            SELECT id_payment, name_payment 
            FROM payment_platforms 
            ORDER BY name_payment ASC
        `)
        
        res.status(200).json({
            success: true,
            message: 'Plataformas de pago obtenidas exitosamente',
            total_platforms: results.length,
            data: results
        })
    } catch (error) {
        console.error('Error al obtener plataformas:', error)
        res.status(500).json({
            success: false,
            error: 'Error al obtener plataformas',
            details: error.message
        })
    }
})

// Endpoint raíz con documentación


// Exportamos el router para usarlo en el index.js
export default router
