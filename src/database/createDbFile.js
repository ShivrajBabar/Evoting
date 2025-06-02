

const { initDB } = require('../api/db');
const fs = require('fs');
const path = require('path');

// Function to create and export the database
async function createAndExportDatabase() {
  console.log('Initializing database...');
  
  // Initialize database
  const db = await initDB();
  
  console.log('Creating database export...');
  
  // Make sure export directory exists
  const exportDir = path.join(process.cwd(), 'exports');
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }
  
  // Export file path
  const exportPath = path.join(exportDir, 'election_db.sql');
  
  // Export schema
  const schema = await db.all(`SELECT sql FROM sqlite_master 
                              WHERE sql IS NOT NULL 
                              AND type='table' 
                              AND name != 'sqlite_sequence'
                              ORDER BY name`);
  
  let exportData = '-- Election Management System Database Schema\n';
  exportData += '-- Created: ' + new Date().toISOString() + '\n\n';
  
  // Add schema creation SQL
  for (const table of schema) {
    exportData += table.sql + ';\n\n';
  }
  
  // Write export file
  fs.writeFileSync(exportPath, exportData);
  
  // Also copy SQLite database file for direct import
  const dbPath = path.join(process.cwd(), 'election_db.sqlite');
  const dbCopyPath = path.join(exportDir, 'election_db.sqlite');
  
  if (fs.existsSync(dbPath)) {
    fs.copyFileSync(dbPath, dbCopyPath);
    console.log(`SQLite database file copied to: ${dbCopyPath}`);
  }
  
  console.log(`Database SQL export created: ${exportPath}`);
  console.log('Done!');
  
  // Close database connection
  await db.close();
}

// Run the function
createAndExportDatabase().catch(err => {
  console.error('Error creating database export:', err);
  process.exit(1);
});
