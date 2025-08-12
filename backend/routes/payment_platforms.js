//  Importamos express para crear la ruta
import express from 'express'

//  Importamos la conexión a la base de datos
import db from '../db.js'

//  Creamos un enrutador con Express
const router = express.Router()

//  Creamos una ruta POST para insertar los payments que vengan desde el frontend
router.post('/', async (req, res) => {
    try {
        //  Recibimos el arreglo de payments
        const payments = req.body

        for (const payment of payments) {
            //  Verificamos si ya exists un payment con ese nombre
            const [exists] = await db.promise().query(
                'SELECT * FROM payment_platforms WHERE name_payment = ?',
                [payment]
            )

            //  Si no exists, lo insertamos
            if (exists.length === 0) {
                await db.promise().query(
                    'INSERT INTO payment_platforms  (name_payment) VALUES (?)',
                    [payment]
                )
            } else {
                //  Si ya exists, lo ignoramos para evitar duplicados
                console.log(`payment duplicado: ${payment}`)
            }
        }

        //  Respondemos al cliente
        res.status(200).json({ mensaje: ' payments insertados correctamente' })
    } catch (error) {
        //  Si hay error, lo mostramos
        console.error(' Error insertando payments:', error.message)
        res.status(500).json({ error: 'Error al insertar payments' })
    }
})

//  Exportamos el router para que se use en index.js
export default router