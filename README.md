# EXPERTSOFT - Sistema de Gestión de Clientes y Transacciones

Sistema integral de gestión empresarial que permite administrar clientes, facturas, transacciones y plataformas de pago. Incluye carga masiva de datos desde Excel y gestión completa del ciclo de ventas.

## 🚀 Características Principales

- **Gestión de Clientes**: CRUD completo de clientes con búsqueda y filtrado
- **Facturación Electrónica**: Creación y gestión de facturas asociadas a clientes
- **Transacciones**: Registro y seguimiento de transacciones de pago
- **Plataformas de Pago**: Integración con múltiples plataformas de pago
- **Carga Masiva**: Importación de datos desde archivos Excel
- **Dashboard**: Visualización de estadísticas y reportes en tiempo real
- **API REST**: Backend robusto con endpoints bien documentados

## 📁 Estructura del Proyecto

```
ExpertSoft/
├── backend/                 # Servidor Express.js
│   ├── index.js            # Punto de entrada del servidor
│   ├── db.js               # Configuración de base de datos
│   ├── package.json        # Dependencias del backend
│   ├── routes/             # Rutas de la API
│   │   ├── customer.js     # Gestión de clientes
│   │   ├── invoices.js     # Gestión de facturas
│   │   ├── transaction.js  # Gestión de transacciones
│   │   ├── payment_platforms.js # Plataformas de pago
│   │   ├── transation_status.js # Estados de transacción
│   │   └── postman.js      # Colección Postman
│   └── utils/              # Utilidades del backend
│       └── dateNormalizer.js # Normalización de fechas
├── frontend/               # Aplicación Vite.js
│   ├── index.html          # HTML principal
│   ├── src/
│   │   ├── main.js         # Punto de entrada de la app
│   │   ├── style.css       # Estilos globales
│   │   └── js/             # JavaScript modules
│   │       ├── router.js   # Enrutamiento de la app
│   │       ├── views.js    # Vistas de la aplicación
│   │       ├── read_excel.js # Lectura de archivos Excel
│   │       ├── endpoint.js # Configuración de endpoints
│   │       └── alert.js    # Sistema de alertas
├── docs/                   # Documentación
│   ├── base.sql           # Esquema base de la BD
│   ├── Expertsoft.sql     # Script completo de la BD
│   └── Diagrama sin título.drawio.svg # Diagrama de la BD
└── README.md              # Este archivo
```

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** - Entorno de ejecución
- **Express.js** - Framework web
- **MySQL** - Base de datos relacional
- **CORS** - Manejo de CORS
- **Dotenv** - Variables de entorno

### Frontend
- **Vite** - Build tool y servidor de desarrollo
- **JavaScript Vanilla** - Sin frameworks adicionales
- **CSS3** - Estilos modernos
- **Fetch API** - Comunicación con el backend

## 📋 Requisitos Previos

- Node.js (v14 o superior)
- npm o yarn
- MySQL Server
- Navegador web moderno

## 🔧 Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone [URL_DEL_REPOSITORIO]
cd ExpertSoft
```

### 2. Configurar la Base de Datos
1. Ejecutar el script `docs/Expertsoft.sql` en tu servidor MySQL
2. Configurar las credenciales en `backend/db.js`:
```javascript
const pool = mysql.createPool({
    host: 'localhost',
    user: 'tu_usuario',
    password: 'tu_contraseña',
    database: 'expertsoft_db',
    port: 3306
});
```

### 3. Instalar Dependencias del Backend
```bash
cd backend
npm install
```

### 4. Instalar Dependencias del Frontend
```bash
cd ../frontend
npm install
```

## 🚀 Iniciar la Aplicación

### Backend
```bash
cd backend
npm run server
# El servidor estará disponible en http://localhost:3000
```

### Frontend
```bash
cd frontend
npm run dev
# La aplicación estará disponible en http://localhost:5173
```

## 📡 API Endpoints

### Clientes
- `GET /api/customers` - Listar todos los clientes
- `GET /api/customers/:id` - Obtener cliente por ID
- `POST /api/customers` - Crear nuevo cliente
- `PUT /api/customers/:id` - Actualizar cliente
- `DELETE /api/customers/:id` - Eliminar cliente

### Facturas
- `GET /api/invoices` - Listar todas las facturas
- `GET /api/invoices/:id` - Obtener factura por ID
- `POST /api/invoices` - Crear nueva factura
- `PUT /api/invoices/:id` - Actualizar factura
- `DELETE /api/invoices/:id` - Eliminar factura

### Transacciones
- `GET /api/transactions` - Listar todas las transacciones
- `GET /api/transactions/:id` - Obtener transacción por ID
- `POST /api/transactions` - Crear nueva transacción
- `PUT /api/transactions/:id` - Actualizar transacción

### Plataformas de Pago
- `GET /api/payment-platforms` - Listar plataformas disponibles
- `POST /api/payment-platforms` - Agregar nueva plataforma

## 📊 Carga de Datos Masiva

La aplicación permite cargar datos desde archivos Excel con las siguientes columnas:
- **Clientes**: nombre, email, telefono, direccion, fecha_registro
- **Facturas**: cliente_id, monto, fecha_emision, estado
- **Transacciones**: factura_id, monto, fecha_pago, metodo_pago

## 🔍 Uso de la Aplicación

1. **Inicio**: Accede a http://localhost:5173
2. **Carga de Datos**: Usa el botón "Cargar Excel" para importar datos
3. **Gestión de Clientes**: Navega a la sección de clientes para ver, editar o eliminar
4. **Facturación**: Crea facturas asociadas a clientes existentes
5. **Reportes**: Visualiza estadísticas en el dashboard principal

## 🐛 Solución de Problemas

### Error de Conexión a BD
Verifica que:
- MySQL esté ejecutándose
- Las credenciales en `backend/db.js` sean correctas
- La base de datos `expertsoft_db` exista

### Error de CORS
Asegúrate de que el backend esté ejecutándose antes del frontend

### Error de Puerto en Uso
- Backend: Cambia el puerto en `backend/index.js`
- Frontend: Vite asignará automáticamente otro puerto si el 5173 está ocupado

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Contacto

- **Email**: camiloandres02222@gmail.com
- **clan**: Ciegana
- **CC**: 1043136986

---


