import { home, renderPrestamos, renderUsersPage } from "./views.js";



const routes = {
    "/": home,
    "/prestamos": renderPrestamos,
    "/usuarios": renderUsersPage    
};

export function router() {
    let path = location.pathname;
    // Normaliza la ruta para que '/' y '' sean lo mismo
    if (path === '' || path === '/') {
        path = '/';
    }
    // Si tienes rutas dinámicas, puedes manejarlas aquí
    // Ejemplo: /dashboard/events/edit/:id
    if (path.startsWith("/dashboard/events/edit/")) {
        const eventId = path.split("/").pop();
        showEditevent(eventId);
        return;
    }
    const routeFunction = routes[path];
    if (routeFunction) {
        routeFunction();
    } else {
        // Si la ruta no existe, muestra la vista de inicio
        home();
    }
}