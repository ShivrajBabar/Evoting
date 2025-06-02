
/**
 * This file contains custom scripts for the project.
 * 
 * Note: Since package.json is read-only, we're creating a separate file
 * with scripts that can be run using Node.js. Run these scripts with:
 * 
 * node src/package-scripts.js [script-name]
 */

const { execSync } = require('child_process');

const scripts = {
  // Create SQLite database file
  'create-db': () => {
    try {
      console.log('Creating SQLite database file...');
      require('./database/createDbFile');
    } catch (error) {
      console.error('Error creating database:', error);
    }
  },
  
  // Convert SQLite to MySQL format
  'convert-to-mysql': () => {
    try {
      console.log('Converting database to MySQL format...');
      require('./database/sqliteToMysql');
    } catch (error) {
      console.error('Error converting database:', error);
    }
  },
  
  // Initialize database with sample data
  'seed-db': () => {
    try {
      console.log('Seeding database with sample data...');
      require('./database/seedData');
    } catch (error) {
      console.error('Error seeding database:', error);
    }
  },
  
  // Run all database scripts in sequence
  'setup-db': () => {
    scripts['create-db']();
    scripts['seed-db']();
    scripts['convert-to-mysql']();
  }
};

// Get script name from command line arguments
const scriptName = process.argv[2];

// Run the specified script
if (scriptName && scripts[scriptName]) {
  scripts[scriptName]();
} else {
  console.log('Available scripts:');
  Object.keys(scripts).forEach(script => {
    console.log(`- ${script}`);
  });
}
