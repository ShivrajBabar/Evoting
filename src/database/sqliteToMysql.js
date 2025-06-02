

const fs = require('fs');
const path = require('path');

// Function to convert SQLite SQL to MySQL format
function convertSqliteToMysql(sqliteScript) {
  let mysqlScript = sqliteScript;
  
  // Replace SQLite-specific data types with MySQL equivalents
  mysqlScript = mysqlScript.replace(/TEXT PRIMARY KEY/g, 'VARCHAR(255) PRIMARY KEY');
  mysqlScript = mysqlScript.replace(/INTEGER PRIMARY KEY AUTOINCREMENT/g, 'INTEGER PRIMARY KEY AUTO_INCREMENT');
  mysqlScript = mysqlScript.replace(/datetime\('now'\)/g, 'NOW()');
  mysqlScript = mysqlScript.replace(/BOOLEAN/g, 'TINYINT(1)');
  
  // Replace SQLite check constraints with MySQL enum where applicable
  const checkConstraintRegex = /CHECK\((\w+)\s+IN\s+\(([^)]+)\)\)/g;
  mysqlScript = mysqlScript.replace(checkConstraintRegex, (match, columnName, values) => {
    // Convert to MySQL ENUM
    const enumValues = values.split(',').map(v => v.trim());
    return `ENUM(${enumValues.join(',')})`;
  });
  
  return mysqlScript;
}

// Function to create a MySQL version of the database
async function createMySQLExport() {
  console.log('Converting SQLite schema to MySQL format...');
  
  // Make sure export directory exists
  const exportDir = path.join(process.cwd(), 'exports');
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }
  
  // SQLite export file path
  const sqliteExportPath = path.join(exportDir, 'election_db.sql');
  
  // MySQL export file path
  const mysqlExportPath = path.join(exportDir, 'election_db_mysql.sql');
  
  if (fs.existsSync(sqliteExportPath)) {
    // Read SQLite schema
    const sqliteScript = fs.readFileSync(sqliteExportPath, 'utf8');
    
    // Convert to MySQL
    const mysqlScript = convertSqliteToMysql(sqliteScript);
    
    // Add MySQL-specific header
    let finalScript = '-- Election Management System Database Schema (MySQL Version)\n';
    finalScript += '-- Created: ' + new Date().toISOString() + '\n\n';
    finalScript += '-- Drop existing database if it exists\n';
    finalScript += 'DROP DATABASE IF EXISTS election_system;\n\n';
    finalScript += '-- Create database\n';
    finalScript += 'CREATE DATABASE election_system;\n\n';
    finalScript += '-- Use the database\n';
    finalScript += 'USE election_system;\n\n';
    finalScript += mysqlScript;
    
    // Write MySQL export file
    fs.writeFileSync(mysqlExportPath, finalScript);
    
    console.log(`MySQL export created: ${mysqlExportPath}`);
    console.log('Done!');
  } else {
    console.error(`SQLite export file not found: ${sqliteExportPath}`);
    console.error('Please run createDbFile.js first');
  }
}

// Run the function
createMySQLExport().catch(err => {
  console.error('Error creating MySQL export:', err);
  process.exit(1);
});
