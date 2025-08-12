import { router } from "./router";

// Inicializa el router al cargar la página
window.addEventListener('DOMContentLoaded', router);
// Ejecuta el router cuando el usuario navega con el historial
window.addEventListener('popstate', router);