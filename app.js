const express = require('express');
const mysql = require('mysql2');

const app = express();
const port = 3000;

app.use(express.json()); // For parsing application/json

// Simulating CRM Storage
let CRM = [];

// Create a MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: 'love',
    database: 'crud'
});

// Connect to the MySQL database
connection.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

// 1. Create Contact
app.post('/createContact', (req, res) => {
    const { first_name, last_name, email, mobile_number, data_store } = req.body;
    
    if (data_store === 'CRM') {
        const newContact = {
            id: CRM.length + 1,
            first_name,
            last_name,
            email,
            mobile_number
        };
        CRM.push(newContact);
        res.status(201).send({ message: 'Contact created in CRM', contact: newContact });
    } else if (data_store === 'DATABASE') {
        const query = 'INSERT INTO contacts (first_name, last_name, email, mobile_number) VALUES (?, ?, ?, ?)';
        connection.query(query, [first_name, last_name, email, mobile_number], (err, results) => {
            if (err) {
                console.error('Error inserting into DATABASE:', err);
                return res.status(500).send('Error inserting contact into database');
            }
            res.status(201).send({ message: 'Contact created in DATABASE', id: results.insertId });
        });
    } else {
        res.status(400).send('Invalid data_store value');
    }
});

// 2. Get Contact
app.post('/getContact', (req, res) => {
    const { contact_id, data_store } = req.body;

    if (data_store === 'CRM') {
        const contact = CRM.find(c => c.id === parseInt(contact_id));
        if (!contact) {
            return res.status(404).send('Contact not found in CRM');
        }
        res.status(200).send(contact);
    } else if (data_store === 'DATABASE') {
        const query = 'SELECT * FROM contacts WHERE id = ?';
        connection.query(query, [contact_id], (err, results) => {
            if (err) {
                console.error('Error fetching from DATABASE:', err);
                return res.status(500).send('Error fetching contact from database');
            }
            if (results.length === 0) {
                return res.status(404).send('Contact not found in DATABASE');
            }
            res.status(200).send(results[0]);
        });
    } else {
        res.status(400).send('Invalid data_store value');
    }
});

// 3. Update Contact
app.post('/updateContact', (req, res) => {
    const { contact_id, new_email, new_mobile_number, data_store } = req.body;

    if (data_store === 'CRM') {
        const contact = CRM.find(c => c.id === parseInt(contact_id));
        if (!contact) {
            return res.status(404).send('Contact not found in CRM');
        }
        contact.email = new_email;
        contact.mobile_number = new_mobile_number;
        res.status(200).send({ message: 'Contact updated in CRM', contact });
    } else if (data_store === 'DATABASE') {
        const query = 'UPDATE contacts SET email = ?, mobile_number = ? WHERE id = ?';
        connection.query(query, [new_email, new_mobile_number, contact_id], (err, results) => {
            if (err) {
                console.error('Error updating contact in DATABASE:', err);
                return res.status(500).send('Error updating contact in database');
            }
            if (results.affectedRows === 0) {
                return res.status(404).send('Contact not found in DATABASE');
            }
            res.status(200).send('Contact updated successfully in DATABASE');
        });
    } else {
        res.status(400).send('Invalid data_store value');
    }
});

// 4. Delete Contact
app.post('/deleteContact', (req, res) => {
    const { contact_id, data_store } = req.body;

    if (data_store === 'CRM') {
        const contactIndex = CRM.findIndex(c => c.id === parseInt(contact_id));
        if (contactIndex === -1) {
            return res.status(404).send('Contact not found in CRM');
        }
        // CRM.splice(contactIndex, 1);
        res.status(200).send('Contact deleted from CRM');
    } else if (data_store === 'DATABASE') {
        const query = 'DELETE FROM contacts WHERE id = ?';
        connection.query(query, [contact_id], (err, results) => {
            if (err) {
                console.error('Error deleting contact from DATABASE:', err);
                return res.status(500).send('Error deleting contact from database');
            }
            if (results.affectedRows === 0) {
                return res.status(404).send('Contact not found in DATABASE');
            }
            res.status(200).send('Contact deleted from DATABASE');
        });
    } else {
        res.status(400).send('Invalid data_store value');
    }
});

app.listen(3000)


