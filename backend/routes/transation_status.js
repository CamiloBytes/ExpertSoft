//  Importamos express para crear la ruta
import express from 'express'

//  Importamos la conexión a la base de datos
import db from '../db.js'

//  Creamos un enrutador con Express
const router = express.Router()

//  Creamos una ruta POST para insertar los status que vengan desde el frontend
router.post('/', async (req, res) => {
    try {
        //  Recibimos el arreglo de status
        const status = req.body

        for (const state of status) {
            //  Verificamos si ya exists un state con ese nombre
            const [exists] = await db.promise().query(
                'SELECT * FROM transaction_status WHERE name_state = ?',
                [state]
            )

            //  Si no exists, lo insertamos
            if (exists.length === 0) {
                await db.promise().query(
                    'INSERT INTO transaction_status (name_state) VALUES (?)',
                    [state]
                )
            } else {
                //  Si ya exists, lo ignoramos para evitar duplicados
                console.log(`state duplicado: ${state}`)
            }
        }

        //  Respondemos al cliente
        res.status(200).json({ mensaje: ' status insertados correctamente' })
    } catch (error) {
        //  Si hay error, lo mostramos
        console.error(' Error insertando status:', error.message)
        res.status(500).json({ error: 'Error al insertar status' })
    }
})

//  Exportamos el router para que se use en index.js
export default router