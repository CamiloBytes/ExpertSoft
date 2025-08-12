import { endPointPrestamo, endPointUsuarios } from "./endpoint";
import axios from "axios";
import { router } from "./router";
import { leerExcel } from "./read_excel";
import Swal from "sweetalert2";

// Esta función renderiza la vista de inicio
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
            <li><button id="btn-invoices">facturas</button></li>
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

    // Variable para guardar el archivo seleccionado por el usuario
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
        // llamo a la funcion leerExcel para procesar el archivo 
        leerExcel(archivoSeleccionado)
    })

    // Selecciono los botones del menú
    const btnInicio = document.getElementById('btn-home');
    const btnPrestamos = document.getElementById('btn-invoices');
    const btnUsuarios = document.getElementById('btn-customer');
    // escucho los eventos para cambiar de vista
    btnInicio.addEventListener('click', (e) => {
        e.preventDefault();
        history.pushState({}, '', '/');
        router();
    });
    btnPrestamos.addEventListener('click', (e) => {
        e.preventDefault();
        history.pushState({}, '', '/prestamos');
        router();
    });
    btnUsuarios.addEventListener('click', (e) => {
        e.preventDefault();
        history.pushState({}, '', '/usuarios');
        router();
    });

}
// Esta funcion es para renderisar la tabla de los usuarios
export function renderUsersPage(e) {
    e?.preventDefault(); // Evitar el comportamiento por defecto del botón si es necesario  
    const app = document.getElementById('app');
    app.innerHTML = `
    <section>
      <header class = "header">
         <h1>Usuarios</h1>
       <nav>
        <ul>
            <li><button id="btn-inicio">Inicio</button></li>
            <li><button id="btn-prestamos">Prestamos</button></li> 
            <li><button id="btn-recargar">Recargar</button></li>    
        </ul>
      </nav>
    </header>
         
      <div style="overflow:auto; margin-top:12px;">
        <table id="tabla-usuarios" border="1" cellpadding="6" cellspacing="0">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Identificación</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th>Creado</th>
              <th>Actualizado</th>
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
    const tbody = app.querySelector('#tabla-usuarios tbody')
    const btnRecargar = app.querySelector('#btn-recargar')
    const btnInicio = app.querySelector('#btn-inicio');
    const btnPrestamos = app.querySelector('#btn-prestamos');

    btnInicio.addEventListener('click', (e) => {
        e.preventDefault();
        history.pushState({}, '', '/');
        router();
    });
    btnPrestamos.addEventListener('click', (e) => {
        e.preventDefault();
        history.pushState({}, '', '/prestamos');
        router();
    });

    async function cargarUsuarios(e) {
        e?.preventDefault(); // Evitar el comportamiento por defecto del botón si es necesario  
        // Limpio la tabla y muestro mensaje de carga
        tbody.innerHTML = `<tr><td colspan="7">Cargando...</td></tr>`
        try {
            const { data } = await axios.get(endPointUsuarios);
            const usuarios = data.usuarios_encontrados

            if (!Array.isArray(usuarios) || usuarios.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7">Sin datos</td></tr>`
                console.error("El backend no devolvió un array válido:", usuarios)
                return
            }
            tbody.innerHTML = ''; // Limpio tabla

            usuarios.forEach(usuario => {
                const fila = document.createElement('tr')
                fila.innerHTML = `
                <td>${usuario.id_usuario}</td>
                <td>${usuario.nombre}</td>
                <td>${usuario.identificacion}</td>
                <td>${usuario.correo}</td>
                <td>${usuario.telefono}</td>
                <td><button class="btn-eliminar" data-id="${usuario.id_usuario}">Eliminar</button></td>
                <td><button class="btn-actualizar" data-id="${usuario.id_usuario}">Actualizar</button></td>
            `
                tbody.appendChild(fila);
            })

            document.querySelectorAll('.btn-eliminar').forEach(boton => {
                boton.addEventListener('click', async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const id = boton.dataset.id;
                    Swal.fire({
                        title: `¿Seguro que quieres eliminar el usuario #${id}?`,
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Sí, eliminar',
                        cancelButtonText: 'Cancelar'
                    }).then(async (result) => {
                        if (result.isConfirmed) {
                            try {
                                await axios.delete(`${endPointUsuarios}/${id}`);
                                Swal.fire('Eliminado', `Usuario con ID ${id} eliminado correctamente.`, 'success');
                                boton.closest('tr').remove();
                            } catch (error) {
                                Swal.fire('Error', 'No se pudo eliminar el usuario.', 'error');
                                console.error('Error al eliminar usuario:', error.message);
                            }
                        }
                    });
                });
            });

            // Botones Actualizar
            document.querySelectorAll('.btn-actualizar').forEach(boton => {
                boton.addEventListener('click', async () => {
                    const id = boton.dataset.id;
                    try {
                        await axios.put(`${endPointUsuarios}/${id}`, { estado_del_prestamo: "Devuelto" });
                        console.log(`Préstamo con ID ${id} actualizado`);
                        cargarUsuarios();
                    } catch (error) {
                        console.error('Error al actualizar préstamo:', error.message);
                    }
                });
            });

        } catch (e) {
            console.error('Error cargando usuarios:', e)
            tbody.innerHTML = `<tr><td colspan="7">Error cargando datos</td></tr>`
        }
    }

    btnRecargar.addEventListener('click', cargarUsuarios)
    cargarUsuarios()
}

export function renderPrestamos(e) {
    e?.preventDefault(); // Evitar el comportamiento por defecto del botón si es necesario  
    // Renderizo la vista de préstamos
    const app = document.getElementById('app');
    app.innerHTML = `
    <section>
     <header class = "header">
         <h1>Usuarios</h1>
       <nav>
        <ul>
            <li><button id="btn-inicio">Inicio</button></li>
            <li><button id="btn-usuarios">Usuarios</button></li> 
            <li><button id="btn-recargar">Recargar</button></li>    
        </ul>
      </nav>
    </header>
      <div style="overflow:auto; margin-top:12px;">
       <table id="tabla-prestamos" border="1" cellpadding="6" cellspacing="0">
    <thead>
        <tr>
        <th>ID Préstamo</th>
        <th>Nombre Usuario</th>
        <th>Identificación</th>
        <th>Correo</th>
        <th>Teléfono</th>
        <th>Título Libro</th>
        <th>ISBN</th>
        <th>Año Publicación</th>
        <th>Autor</th>
        <th>Fecha Préstamo</th>
        <th>Fecha Devolución</th>
        <th>Estado Préstamo</th>
        <th>Creado</th>
        <th>Actualizado</th>
        
        </tr>
    </thead>
  <tbody>
    <tr><td colspan="15">Cargando...</td></tr>
  </tbody>
</table>
      </div>
    </section>
  `

    const tbody = app.querySelector('#tabla-prestamos tbody');
    const btnRecargar = app.querySelector('#btn-recargar');
    const btnInicio = app.querySelector('#btn-inicio');
    const btnUsuario = app.querySelector('#btn-usuarios');
    btnInicio.addEventListener('click', (e) => {
        e.preventDefault();
        history.pushState({}, '', '/');
        router();
    });
    btnUsuario.addEventListener('click', (e) => {
        e.preventDefault();
        history.pushState({}, '', '/usuarios');
        router();
    });

    async function cargarPrestamos(e) {
        e?.preventDefault(); // Evitar el comportamiento por defecto del botón si es necesario  
        tbody.innerHTML = `<tr><td colspan="15">Cargando...</td></tr>`;
        try {

            const { data } = await axios.get(endPointPrestamo);

            const prestamos = data.prestamos_encontrados;

            if (!Array.isArray(prestamos) || prestamos.length === 0) {
                tbody.innerHTML = `<tr><td colspan="15">Sin datos</td></tr>`;
                console.error("El backend no devolvió un array válido:", prestamos);
                return;
            }

            console.log(prestamos); // Verificación en consola

            tbody.innerHTML = ''; // Limpio tabla

            prestamos.forEach(prestamo => {
                const fila = document.createElement('tr');

                fila.innerHTML = `
                <td>${prestamo.id_del_prestamo}</td>
                <td>${prestamo.nombre_completo_usuario}</td>
                <td>${prestamo.documento_identificacion}</td>
                <td>${prestamo.email_usuario}</td>
                <td>${prestamo.telefono_contacto}</td>
                <td>${prestamo.titulo_del_libro}</td>
                <td>${prestamo.codigo_isbn}</td>
                <td>${prestamo.año_de_publicacion}</td>
                <td>${prestamo.autor_del_libro}</td>
                <td>${prestamo.fecha_de_prestamo}</td>
                <td>${prestamo.fecha_de_devolucion}</td>
                <td>${prestamo.estado_del_prestamo}</td>
                <td><button class="btn-eliminar" data-id="${prestamo.id_del_prestamo}">Eliminar</button></td>
                <td><button class="btn-actualizar" data-id="${prestamo.id_del_prestamo}">Actualizar</button></td>
            `;

                tbody.appendChild(fila);
            });

            // Botones Eliminar
            document.querySelectorAll('.btn-eliminar').forEach(boton => {
                boton.addEventListener('click', async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const id = boton.dataset.id;
                    Swal.fire({
                        title: `¿Seguro que quieres eliminar el usuario #${id}?`,
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Sí, eliminar',
                        cancelButtonText: 'Cancelar'
                    }).then(async (result) => {
                        if (result.isConfirmed) {
                            try {
                                await axios.delete(`${endPointPrestamo}/${id}`);
                                Swal.fire('Eliminado', `Usuario con ID ${id} eliminado correctamente.`, 'success');
                                boton.closest('tr').remove();
                            } catch (error) {
                                Swal.fire('Error', 'No se pudo eliminar el usuario.', 'error');
                                console.error('Error al eliminar usuario:', error.message);
                            }
                        }
                    });
                });
            });

            // Botones Actualizar
            document.querySelectorAll('.btn-actualizar').forEach(boton => {
                boton.addEventListener('click', async () => {
                    const id = boton.dataset.id;
                    try {
                        await axios.put(`${endPointPrestamo}/${id}`, { estado_del_prestamo: "Devuelto" });
                        console.log(`Préstamo con ID ${id} actualizado`);
                        cargarPrestamos();
                    } catch (error) {
                        console.error('Error al actualizar préstamo:', error.message);
                    }
                });
            });

        } catch (error) {
            console.error('Error al obtener préstamos:', error.message);
        }
    }
    btnRecargar.addEventListener('click', cargarPrestamos)
    cargarPrestamos()

}