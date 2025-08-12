import Swal from 'sweetalert2';
// Función para mostrar alerta de éxito 
export function alertaExcelExito(tabla) {
    Swal.fire({
        title: 'Datos enviados',
        text: `Los datos de ${tabla} se enviaron correctamente a la base de datos.`,
        icon: 'success',
        confirmButtonText: 'OK'
    });
}

// Función para mostrar la alerta de error 
export function alertaExcelError(tabla) {
    Swal.fire({
        title: 'Error',
        text: `Hubo un error al enviar los datos de ${tabla} a la base de datos.`,
        icon: 'error',
        confirmButtonText: 'OK'
    });
}