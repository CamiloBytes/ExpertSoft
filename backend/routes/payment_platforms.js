// We import express to create the route
import express from 'express'

// We import the connection to the database
import db from '../db.js'

// We create a router with Express
const router = express.Router()

// We create a POST route to insert the payments that come from the frontend
router.post('/', async (req, res) => {
    try {
        //  Recibimos el arreglo de payments
        const payments = req.body

        for (const payment of payments) {
            // We check if a payment with that name already exists
            const [exists] = await db.promise().query(
                'SELECT * FROM payment_platforms WHERE name_payment = ?',
                [payment]
            )

           // If it does not exist, we insert it
            if (exists.length === 0) {
                await db.promise().query(
                    'INSERT INTO payment_platforms  (name_payment) VALUES (?)',
                    [payment]
                )
            } else {
                // If it already exists, we ignore it to avoid duplicates
                console.log(`payment duplicado: ${payment}`)
            }
        }

        // We respond to the client
        res.status(200).json({ mensaje: ' payments insertados correctamente' })
    } catch (error) {
        // If there is an error, we show it
        console.error(' Error insertando payments:', error.message)
        res.status(500).json({ error: 'Error al insertar payments' })
    }
})

// We export the router to be used in index.js
export default router