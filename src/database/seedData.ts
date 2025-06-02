
import { openDB, initDB } from '../api/db';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// Function to seed the database with initial data
export async function seedDatabase() {
  try {
    console.log('Initializing database...');
    const db = await initDB();
    
    // Check if superadmin already exists
    const superadminExists = await db.get('SELECT id FROM users WHERE role = ?', ['superadmin']);
    
    if (!superadminExists) {
      console.log('Creating superadmin user...');
      
      // Create superadmin user
      const superadminId = uuidv4();
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      await db.run(`
        INSERT INTO users 
        (id, name, email, password, role, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `, [
        superadminId,
        'Super Administrator',
        'superadmin@election.com',
        hashedPassword,
        'superadmin',
        'Active'
      ]);
      
      console.log('Superadmin created successfully');
    }
    
    // Check if constituencies exist
    const constituencyCount = await db.get('SELECT COUNT(*) as count FROM constituencies');
    
    if (constituencyCount.count === 0) {
      console.log('Creating sample constituencies...');
      
      // Create some sample constituencies
      const constituencies = [
        { name: 'Delhi East', state: 'Delhi', district: 'East Delhi', type: 'Lok Sabha' },
        { name: 'Mumbai North', state: 'Maharashtra', district: 'Mumbai', type: 'Lok Sabha' },
        { name: 'Bangalore Central', state: 'Karnataka', district: 'Bangalore', type: 'Lok Sabha' },
        { name: 'Chennai South', state: 'Tamil Nadu', district: 'Chennai', type: 'Lok Sabha' },
      ];
      
      for (const constituency of constituencies) {
        await db.run(`
          INSERT INTO constituencies 
          (name, state, district, type, status, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `, [
          constituency.name,
          constituency.state,
          constituency.district,
          constituency.type,
          'Active'
        ]);
      }
      
      console.log('Sample constituencies created successfully');
    }
    
    // Check if admin users exist
    const adminCount = await db.get('SELECT COUNT(*) as count FROM users WHERE role = ?', ['admin']);
    
    if (adminCount.count === 0) {
      console.log('Creating sample admin users...');
      
      // Get constituency IDs
      const constituencies = await db.all('SELECT id FROM constituencies LIMIT 4');
      
      // Create admin users for each constituency
      for (let i = 0; i < constituencies.length; i++) {
        const adminId = uuidv4();
        const hashedPassword = await bcrypt.hash('password123', 10);
        
        await db.run(`
          INSERT INTO users 
          (id, name, email, password, role, status, constituency_id, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `, [
          adminId,
          `Admin User ${i + 1}`,
          `admin${i + 1}@election.com`,
          hashedPassword,
          'admin',
          'Active',
          constituencies[i].id
        ]);
      }
      
      console.log('Sample admin users created successfully');
    }
    
    // Check if elections exist
    const electionCount = await db.get('SELECT COUNT(*) as count FROM elections');
    
    if (electionCount.count === 0) {
      console.log('Creating sample elections...');
      
      // Create sample elections
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      
      const nextWeek = new Date(now);
      nextWeek.setDate(now.getDate() + 7);
      
      const nextMonth = new Date(now);
      nextMonth.setDate(now.getDate() + 30);
      
      const elections = [
        {
          name: 'Lok Sabha Elections 2025',
          election_date: nextMonth.toISOString(),
          nomination_start: yesterday.toISOString(),
          nomination_end: tomorrow.toISOString(),
          campaign_end: nextWeek.toISOString(),
          voting_start: nextWeek.toISOString(),
          voting_end: nextMonth.toISOString(),
          type: 'Lok Sabha',
          status: 'Upcoming'
        },
        {
          name: 'Delhi Municipal Elections 2024',
          election_date: yesterday.toISOString(),
          nomination_start: new Date(yesterday).setDate(yesterday.getDate() - 30),
          nomination_end: new Date(yesterday).setDate(yesterday.getDate() - 20),
          campaign_end: new Date(yesterday).setDate(yesterday.getDate() - 1),
          voting_start: new Date(yesterday).setDate(yesterday.getDate() - 1),
          voting_end: yesterday.toISOString(),
          type: 'Municipal',
          status: 'Completed',
          state: 'Delhi'
        }
      ];
      
      for (const election of elections) {
        await db.run(`
          INSERT INTO elections 
          (name, election_date, nomination_start, nomination_end, campaign_end, 
          voting_start, voting_end, type, status, result_published, state, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `, [
          election.name,
          election.election_date,
          election.nomination_start,
          election.nomination_end,
          election.campaign_end,
          election.voting_start,
          election.voting_end,
          election.type,
          election.status,
          false,
          election.state || null
        ]);
      }
      
      console.log('Sample elections created successfully');
    }
    
    // Add more seeding as needed
    
    console.log('Database seeding completed successfully');
    return true;
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Run seeding when file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => console.log('Database seeding completed'))
    .catch(console.error);
}
