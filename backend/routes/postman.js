//  Importamos express para crear la ruta
import express from 'express'

//  Importamos la conexión a la base de datos
import db from '../db.js'

//  Creamos un enrutador con Express
const router = express.Router()

router.get('/',async(req,res)=>{
    const [transactions] = await db.promise().query(`
    SELECT 
    customer.id_customer,
    customer.name_customer,
    cistomer.identification_customer,
    invoice.amount_pay
    FROM transactions transaction
    INNER JOIN customers customer ON transaction.id_customer = customer.id_customer
    INNER JOIN invoices invoice ON transaction.id_invoice = invoice.id_invoice
    INNER JOIN estados estado ON transaction.id_estado = estado.id_estado
    ORDER BY customer.id_customer ASC;
    `)
})