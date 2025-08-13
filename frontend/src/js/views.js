import { endPointCustomer } from "./endpoint";
import axios from "axios";
import { router } from "./router";
import { leerExcel } from "./read_excel";
import Swal from "sweetalert2";

// This function renders the home view
export function home() {
    const home = document.getElementById('app')
    home.innerHTML = `
    <section>
    <header class = "header">
        <h1>Bienvenido a el Gestor de finanza</h1>
        <p>Utiliza el menú para navegar entre las diferentes secciones.</p>
       <nav>
        <ul>
            <li><button id="btn-home">Inicio</button></li>
            <li><button id="btn-customer">clientes</button></li>        
        </ul>
      </nav>
    </header>
      <main class="main">
        <h2>Leer desde Excel</h2>
       <form id="fromExcel">
            <input type="file" id="excelInput" accept=".xlsx, .xls" />
            <button id="btnFrom" >Leer Excel</button>
        </from>
      </main>
      
    </section>
`

    // Variable to save the file selected by the customer
    let archivoSeleccionado = null;

    const from = document.getElementById('fromExcel')

    from.addEventListener('submit', (e) => {
        e.preventDefault()

        const inputArchivo = document.getElementById('excelInput');
        archivoSeleccionado = inputArchivo.files[0]

        if (!archivoSeleccionado) {
            alert('Por favor selecciona un archivo Excel antes de enviarlo.')
            return
        }
        // call the readExcel function to process the file
        leerExcel(archivoSeleccionado)
    })

    // I select the menu buttons
    const btnHome = document.getElementById('btn-home');
    const btnCustomers = document.getElementById('btn-customer');

    btnHome.addEventListener('click', (e) => {
        e.preventDefault();
        history.pushState({}, '', '/');
        router();
    });

    btnCustomers.addEventListener('click', (e) => {
        e.preventDefault();
        history.pushState({}, '', '/customers');
        router();
    });

}
// This function is to render the customer table
export function renderUsersPage(e) {
    e?.preventDefault(); 
    const app = document.getElementById('app');
    app.innerHTML = `
    <section>
      <header class = "header">
         <h1>customers</h1>
       <nav>
        <ul>
            <li><button id="btn-inicio">Inicio</button></li>
            <li><button id="btn-recargar">Recargar</button></li>    
        </ul>
      </nav>
    </header>
         
      <div style="overflow:auto; margin-top:12px;">
        <table id="tabla-customers" border="1" cellpadding="6" cellspacing="0">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre del Cliente</th>
              <th>Número de Identificación</th>
              <th>Dirección</th>
              <th>Telefono</th>
              <th>Correo Electronico</th>
              <th>delete</th>
              <th>update</th>
            </tr>
          </thead>
          <tbody>
            <tr><td colspan="7">Cargando...</td></tr>
          </tbody>
        </table>
      </div>
    </section>
  `
    // Selecciono los elementos del DOM
    const tbody = app.querySelector('#tabla-customers tbody')
    const btnReload = app.querySelector('#btn-recargar')
    const btnHome = app.querySelector('#btn-inicio');

    btnHome.addEventListener('click', (e) => {
        e.preventDefault();
        history.pushState({}, '', '/');
        router();
    });

    async function loadcustomers(e) {
        e?.preventDefault(); 
        tbody.innerHTML = `<tr><td colspan="7">Cargando...</td></tr>`
        try {
            const { data } = await axios.get(endPointCustomer);
            const customers = data.customers_encontrados

            if (!Array.isArray(customers) || customers.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7">Sin datos</td></tr>`
                console.error("El backend no devolvió un array válido:", customers)
                return
            }
            tbody.innerHTML = ''; 

            customers.forEach(customer => {
                const fila = document.createElement('tr')
                fila.innerHTML = `
                <td>${customer.id_customer}</td>
                <td>${customer.name_customer}</td>
                <td>${customer.identification_customer}</td>
                <td>${customer.direction}</td>
                <td>${customer.phone}</td>
                <td>${customer.email}</td>
                <td><button class="btn-delete" data-id="${customer.id_customer}">delete</button></td>
                <td><button class="btn-update" data-id="${customer.id_customer}">update</button></td>
            `
                tbody.appendChild(fila);
            })

            document.querySelectorAll('.btn-delete').forEach(boton => {
                boton.addEventListener('click', async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const id = boton.dataset.id;
                    Swal.fire({
                        title: `¿Seguro que quieres eliminar el customer #${id}?`,
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Sí, eliminar',
                        cancelButtonText: 'Cancelar'
                    }).then(async (result) => {
                        if (result.isConfirmed) {
                            try {
                                await axios.delete(`${endPointCustomer}/${id}`);
                                Swal.fire('Eliminado', `customer con ID ${id} eliminado correctamente.`, 'success');
                                boton.closest('tr').remove();
                            } catch (error) {
                                Swal.fire('Error', 'No se pudo delete el customer.', 'error');
                                console.error('Error al delete customer:', error.message);
                            }
                        }
                    });
                });
            });

            //update
            document.querySelectorAll('.btn-update').forEach(boton => {
                boton.addEventListener('click', async () => {
                    const id = boton.dataset.id;
                    try {
                        await axios.put(`${endPointCustomer}/${id}`, { estado_del_prestamo: "Devuelto" });
                        console.log(`Préstamo con ID ${id} actualizado`);
                        loadcustomers();
                    } catch (error) {
                        console.error('Error al actualizar préstamo:', error.message);
                    }
                });
            });
            

        } catch (e) {
            console.error('Error cargando customers:', e)
            tbody.innerHTML = `<tr><td colspan="7">Error cargando datos</td></tr>`
        }
    }

    btnReload.addEventListener('click', loadcustomers)
    loadcustomers()
}
