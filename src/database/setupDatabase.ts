
import { initDB } from '../api/db';
import { seedDatabase } from './seedData';
import path from 'path';
import fs from 'fs';

// Path to the database file
const DB_PATH = path.resolve(process.cwd(), 'election_db.sqlite');

// Function to check if the database file exists
export async function checkDatabaseExists() {
  try {
    return fs.existsSync(DB_PATH);
  } catch (error) {
    console.error('Error checking database file:', error);
    return false;
  }
}

// Function to setup the database
export async function setupDatabase() {
  try {
    console.log('Setting up database...');
    
    // Check if database exists
    const dbExists = await checkDatabaseExists();
    
    // Initialize database (create tables if they don't exist)
    await initDB();
    
    // Seed database with initial data if it's a new database
    if (!dbExists) {
      console.log('New database created, seeding with initial data...');
      await seedDatabase();
    }
    
    console.log('Database setup completed successfully');
    return true;
  } catch (error) {
    console.error('Error setting up database:', error);
    throw error;
  }
}

// Export database file path
export const getDatabasePath = () => DB_PATH;
