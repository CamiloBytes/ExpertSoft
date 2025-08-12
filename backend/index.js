// Importamos express (el servidor web que vamos a usar para las rutas)
import express from 'express'

// Importamos cors para que el frontend (por ejemplo, Vite) pueda comunicarse con el backend sin problemas
import cors from 'cors'

// Importamos los archivos que tienen las rutas de cada tabla
import customerRoutes from './routes/customer.js'
import invoicesRoutes from './routes/invoices.js'
import paymentRoutes from './routes/payment_platforms.js'
import transationRoutes from './routes/transaction.js'
import statusRouter from './routes/transation_status.js'
import postmanRouter from './routes/postman.js'
// Creamos la aplicación de Express (esto es como el servidor en sí)
const app = express()

// Usamos cors para permitir peticiones desde otros orígenes (como Vite en localhost:5173)
app.use(cors())

// Le decimos al servidor que entienda datos en formato JSON (para recibir datos del Excel en el frontend)
app.use(express.json())

// Configuramos las rutas para que cuando alguien acceda a /api/usuarios, se use el archivo correspondiente


app.use('/api/customer', customerRoutes)
app.use('/api/invoices', invoicesRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/transation', transationRoutes)
app.use('/api/status',statusRouter)
app.use('/postman/total-paid-by-customer',postmanRouter)
app.use('/postman/pending-invoices',postmanRouter)
app.use('/postman/transactions-by-platform/:platform',postmanRouter)
app.use('/postman/platforms',postmanRouter)

// Encendemos el servidor en el puerto 3000. Cuando esté listo, muestra un mensaje en la consola.
app.listen(3000, () => {
    console.log('Servidor backend encendido en http://localhost:3000')
})