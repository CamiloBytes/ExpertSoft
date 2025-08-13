// We import the xlsx library to be able to read Excel files
import * as XLSX from 'xlsx';
import axios from 'axios';
import { alertaExcelError, alertaExcelExito } from './alert';

// Function to normalize dates from Excel
function handleExcelDate(value) {
    if (!value) return null;

    try {
        let date;

        // Handle Excel serial numbers
        if (typeof value === 'number') {
            date = new Date((value - 25569) * 86400 * 1000);
        } 
        // Handle date strings
        else if (typeof value === 'string') {
            const cleanValue = value.trim();
            if (!cleanValue) return null;

            // Detect DD/MM/YYYY or DD-MM-YYYY format
            const dateRegex = /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/;
            const match = cleanValue.match(dateRegex);
            
            if (match) {
                const [, day, month, year] = match;
                date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            } else {
                date = new Date(cleanValue);
            }
        } 
        // Handle Date objects
        else if (value instanceof Date) {
            date = value;
        } else {
            return null;
        }

        // Formatear a ISO string
        return date.toISOString().slice(0, 19).replace('T', ' ');
    } catch (error) {
        console.error('Error normalizando fecha:', error);
        return null;
    }
}




// Función para leer el contenido del archive Excel
export function leerExcel(archive) {
    const lector = new FileReader();

    // Cuando se termina de leer el archive
    lector.onload = async function (eventReading) {
        const data = new Uint8Array(eventReading.target.result);
        const libro = XLSX.read(data, { type: 'array' });

        // Tomamos la primera leaf del archive
        const nameFirstleaf = libro.SheetNames[0];
        const leaf = libro.Sheets[nameFirstleaf];

        // Convertimos la leaf a un arreglo de objetos JSON
        const dataJSON = XLSX.utils.sheet_to_json(leaf, { defval: "" });

        // Declaramos arreglos para separar los data por tabla
        const customers = [];
        const invoices = [];
        const payment_platforms = new Set(); // Usamos Set para evitar payment_platforms duplicados
        const transaction_status = new Set();
        const transactions = [];

        // Recorremos cada row del Excel
        dataJSON.forEach(row => {
            // agrego los customer al arreiglo customer
            customers.push({
                name_customer: row["Nombre del Cliente"],
                identification_customer : row["Número de Identificación"],
                direction: row["Dirección"],
                phone: row["Teléfono"],
                email:row["Correo Electrónico"]
            });
            // agrego los invoices al arreiglo invoices
            invoices.push({
                invoice_number: row["Número de Factura"],
                bulling_period: row["Periodo de Facturación"],
                identification_customer : row["Número de Identificación"],
                invoiced_amount: parseInt(row["Monto Facturado"]),
                amount_pay : parseInt(row["Monto Pagado"])
            });
            // Agrego los payment_platforms al Set para evitar duplicados
            payment_platforms.add(row["Plataforma Utilizada"]);

            transaction_status.add(row["Estado de la Transacción"])

            // Normalizar fechas desde Excel
            const normalizedDateTime = handleExcelDate(row["Fecha y Hora de la Transacción"]);
            
            // agrego los data al arreiglo de los transaction
            transactions.push({
                date_time: normalizedDateTime,
                transaction_amount: row["Monto de la Transacción"],
                trasaction_type: row["Tipo de Transacción"],
                identification_customer: row["Número de Identificación"],
                invoice_number: row["Número de Factura"],
                name_state: row["Estado de la Transacción"],
                name_payment: row["Plataforma Utilizada"]
            });
        });
        let error = false;
        try {
            // Enviamos los data a los endpoints del backend
            // endpoint de customer

            await enviardata('/api/customer', customers);
            
            // endpoint de invoices
            await enviardata('/api/invoices', invoices);
            // endpoint de payment_platforms, convertimos el Set a un Array
            await enviardata('/api/payment', Array.from(payment_platforms));
            await enviardata('/api/status', Array.from(transaction_status));
            // endpoint de transaction
            await enviardata('/api/transaction', transactions);
        } catch (error) {
            error = true;
        }
        // Mostramos alerta de éxito o error
        // Dependiendo de si hubo un error al enviar los data 
        if (error) {
            alertaExcelError('Excel');
        } else {
            alertaExcelExito('Excel');
        }

    };

    // Iniciamos la lectura del archive como ArrayBuffer
    lector.readAsArrayBuffer(archive);
}

// Función para enviar data al servidor mediante fetch
async function enviardata(url, data) {
    try {
        const dataSend = await axios.post(`http://localhost:3000${url}`, data)
        console.log(`${url} enviado correctamente:`, dataSend);
    } catch (error) {
        console.error(`Error al enviar data a ${url}:`, error);
    }
}
// Función para cargar customer al hacer clic en el botón