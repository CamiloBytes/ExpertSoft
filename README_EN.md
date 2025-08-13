# EXPERTSOFT - Customer and Transaction Management System

Comprehensive business management system that allows managing customers, invoices, transactions, and payment platforms. Includes bulk data loading from Excel and complete sales cycle management.

## 🚀 Key Features

- **Customer Management**: Complete CRUD of customers with search and filtering
- **Electronic Invoicing**: Creation and management of invoices associated with customers
- **Transactions**: Registration and tracking of payment transactions
- **Payment Platforms**: Integration with multiple payment platforms
- **Bulk Loading**: Data import from Excel files
- **Dashboard**: Real-time statistics and reports visualization
- **REST API**: Robust backend with well-documented endpoints

## 📁 Project Structure

```
ExpertSoft/
├── backend/                 # Express.js Server
│   ├── index.js            # Server entry point
│   ├── db.js               # Database configuration
│   ├── package.json        # Backend dependencies
│   ├── routes/             # API routes
│   │   ├── customer.js     # Customer management
│   │   ├── invoices.js     # Invoice management
│   │   ├── transaction.js  # Transaction management
│   │   ├── payment_platforms.js # Payment platforms
│   │   ├── transation_status.js # Transaction status
│   │   └── postman.js      # Postman collection
│   └── utils/              # Backend utilities
│       └── dateNormalizer.js # Date normalization
├── frontend/               # Vite.js Application
│   ├── index.html          # Main HTML
│   ├── src/
│   │   ├── main.js         # App entry point
│   │   ├── style.css       # Global styles
│   │   └── js/             # JavaScript modules
│   │       ├── router.js   # App routing
│   │       ├── views.js    # Application views
│   │       ├── read_excel.js # Excel file reading
│   │       ├── endpoint.js # Endpoint configuration
│   │       └── alert.js    # Alert system
├── docs/                   # Documentation
│   ├── base.sql           # Database base schema
│   ├── Expertsoft.sql     # Complete database script
│   └── Diagrama sin título.drawio.svg # Database diagram
└── README.md              # This file
```

## 🛠️ Technologies Used

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Relational database
- **CORS** - CORS handling
- **Dotenv** - Environment variables

### Frontend
- **Vite** - Build tool and development server
- **Vanilla JavaScript** - No additional frameworks
- **CSS3** - Modern styles
- **Fetch API** - Communication with backend

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MySQL Server
- Modern web browser

## 🔧 Installation and Configuration

### 1. Clone Repository
```bash
git clone https://github.com/CamiloBytes/ExpertSoft.git
cd ExpertSoft
```

### 2. Configure Database
1. Run the `docs/Expertsoft.sql` script in your MySQL server
2. Configure credentials in `backend/db.js`:
```javascript
const pool = mysql.createPool({
    host: 'localhost',
    user: 'your_user',
    password: 'your_password',
    database: 'expertsoft_db',
    port: 3306
});
```

### 3. Install Backend Dependencies
```bash
cd backend
npm install
```

### 4. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

## 🚀 Start Application

### Backend
```bash
cd backend
npm run server
# Server will be available at http://localhost:3000
```

### Frontend
```bash
cd frontend
npm run dev
# Application will be available at http://localhost:5173
```

## 📡 API Endpoints

### Customers
- `GET /api/customers` - List all customers
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Invoices
- `GET /api/invoices` - List all invoices
- `GET /api/invoices/:id` - Get invoice by ID
- `POST /api/invoices` - Create new invoice
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice

### Transactions
- `GET /api/transactions` - List all transactions
- `GET /api/transactions/:id` - Get transaction by ID
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction

### Payment Platforms
- `GET /api/payment-platforms` - List available platforms
- `POST /api/payment-platforms` - Add new platform

## 📊 Bulk Data Loading

The application allows loading data from Excel files with the following columns:
- **Customers**: name, email, phone, address, registration_date
- **Invoices**: customer_id, amount, issue_date, status
- **Transactions**: invoice_id, amount, payment_date, payment_method

## 🔍 Application Usage

1. **Start**: Access http://localhost:5173
2. **Data Loading**: Use the "Upload Excel" button to import data
3. **Customer Management**: Navigate to customers section to view, edit or delete
4. **Invoicing**: Create invoices associated with existing customers
5. **Reports**: View statistics on the main dashboard

## 🐛 Troubleshooting

### Database Connection Error
Verify that:
- MySQL is running
- Credentials in `backend/db.js` are correct
- Database `expertsoft_db` exists

### CORS Error
Ensure backend is running before frontend

### Port in Use Error
- Backend: Change port in `backend/index.js`
- Frontend: Vite will automatically assign another port if 5173 is busy

## 🤝 Contributions

Contributions are welcome. Please:
1. Fork the project
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is under MIT License - see [LICENSE](LICENSE) file for details.

## 👥 Contact

- **Email**: camiloandres02222@gmail.com
- **clan**: ciegana
- **ID**: 1043136986

---

**Developed with ❤️ by ExpertSoft Team**
