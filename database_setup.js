require("dotenv").config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');

// Create a connection to the MySQL server
const connection = mysql.createConnection({
  host: process.env.host,
  user: process.env.user,
  password: process.env.DBpassword
});

// Connect to MySQL
connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL server');
  
  // Create database if it doesn't exist
  connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.database}`, err => {
    if (err) {
      console.error('Error creating database:', err);
      connection.end();
      return;
    }
    console.log(`Database '${process.env.database}' created or already exists`);
    
    // Use the database
    connection.query(`USE ${process.env.database}`, err => {
      if (err) {
        console.error('Error selecting database:', err);
        connection.end();
        return;
      }
      
      // Read SQL schema file
      const schemaPath = path.join(__dirname, 'database_schema.sql');
      fs.readFile(schemaPath, 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading schema file:', err);
          connection.end();
          return;
        }
        
        // Split SQL statements
        const statements = data.split(';').filter(stmt => stmt.trim() !== '');
        
        // Execute each statement
        let completed = 0;
        statements.forEach(stmt => {
          connection.query(stmt, err => {
            if (err) {
              console.error('Error executing statement:', err);
              console.error('Statement:', stmt);
            }
            
            completed++;
            if (completed === statements.length) {
              console.log('Database setup completed');
              connection.end();
            }
          });
        });
      });
    });
  });
});