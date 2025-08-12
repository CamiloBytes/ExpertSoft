CREATE TABLE customers(
	id_customer INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
	name_customer VARCHAR(50) NOT NULL ,
    identification_customer  VARCHAR(40) UNIQUE NOT NULL,
    direction VARCHAR(40) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(30) UNIQUE NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHECK (CHAR_LENGTH(name_customer) > 3),
	CHECK (email LIKE '%@%')
    );
    
CREATE TABLE invoices (
	id_invoice INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
	invoice_number VARCHAR(12),
    bulling_period VARCHAR(20),
    invoiced_amount INT,
    id_customer INT,
    amount_pay INT,
    FOREIGN KEY (id_customer) REFERENCES customers(id_customer) ON DELETE SET NULL ON UPDATE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHECK (CHAR_LENGTH(invoice_number)> 5)
);


CREATE TABLE transaction_status (
	id_state INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
	name_state VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHECK (CHAR_LENGTH(name_state)> 3)
);

CREATE TABLE payment_platforms (
	id_payment INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    name_payment VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE transactions (
	id_transaction VARCHAR(20) NOT NULL PRIMARY KEY,
    id_invoice INT,
    id_state INT,
    id_payment INT,
    date_time DATETIME,
    transaction_amount INT,
    trasaction_type VARCHAR(20),
	FOREIGN KEY (id_invoice) REFERENCES invoices(id_invoice) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (id_state ) REFERENCES transaction_status(id_state),
	FOREIGN KEY (id_payment) REFERENCES payment_platforms(id_payment),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);