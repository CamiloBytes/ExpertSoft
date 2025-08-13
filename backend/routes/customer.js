// Importamos express para crear la ruta
import express from 'express'

// Importamos la conexión a la base de datos
import db from '../db.js'

// Creamos el router, que es como el manejador de esta ruta
const router = express.Router()

// Ruta POST: esta recibe los customers que vienen del frontend
router.post('/', async (req, res) => {
    try {
        const customers = req.body //  Recibimos el arreglo de customers

        for (const customer of customers) {
            // Revisamos si ya exists un usuario con esa identificación o correo
            const [exists] = await db.promise().query(
                'SELECT * FROM customers WHERE identification_customer = ?  ',
                [customer.identification_customer]
            )

            if (exists.length === 0) {
                // Si no exists, lo insertamos
                await db.promise().query(
                    'INSERT INTO customers (name_customer, identification_customer, direction, phone, email) VALUES (?, ?, ?, ?, ?)',
                    [customer.name_customer, customer.identification_customer, customer.direction, customer.phone, customer.email]
                )
            } else {
                //  Si ya exists, lo ignoramos (evitamos duplicados)
                console.log(`Usuario duplicado: ${u.identificacion}`)
            }
        }
        res.status(200).json({ message: 'customers insertados correctamente' })
    } catch (error) {
        console.error(' Error insertando customers:', error.message)
        res.status(500).json({ error: 'Error al insertar customers' })
    }
})

// New GET route: list all customers
router.get('/', async (req, res) => {
    try {
        const [customers] = await db.promise().query(
            'SELECT id_customer, name_customer, identification_customer, direction, phone, email FROM customers ORDER BY id_customer ASC'
        )
        res.status(200).json({
            mensaje: 'Lista de customers obtenida exitosamente',
            total_customers: customers.length,
            customers_encontrados: customers
        })
    } catch (error) {
        console.error(' Error obteniendo customers:', error.message)
        res.status(500).json({ error: 'Error al obtener customers' })
    }
})

// I create the endpoint to delete data from the loan table
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    // I check if it is sending me the id to send it
    if (!id) return res.status(400).json({ error: 'ID requerido' });

    try {
        const [result] = await db.promise().query(
            'DELETE FROM customers WHERE id_customer = ?',
            [id]
        );

        // Reset the AUTO_INCREMENT counter if the table is empty
        const [rows] = await db.promise().query('SELECT COUNT(*) AS total FROM customers');
        if (rows[0].total === 0) {
            await db.promise().query('ALTER TABLE customers AUTO_INCREMENT = 1');
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ mensaje: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});


// We export the router to use it in index.js
export default router