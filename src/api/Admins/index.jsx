import { query } from '../../../lib/db';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      try {
        const admins = await query({
          query: `
            SELECT a.*, u.name, u.email, u.phone, s.name as state_name, 
            d.name as district_name 
            FROM admins a 
            JOIN users u ON a.user_id = u.id
            JOIN states s ON a.state_id = s.id
            JOIN districts d ON a.district_id = d.id
          `
        });
        res.status(200).json(admins);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch admins' });
      }
      break;

    case 'POST':
      try {
        const {
          name, email, phone, password, state_id, district_id, constituency_id
        } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user first
        const userResult = await query({
          query: `INSERT INTO users (role_id, name, email, phone, password, status) 
                 VALUES (2, ?, ?, ?, ?, 'active')`,
          values: [name, email, phone, hashedPassword]
        });

        // Create admin entry
        await query({
          query: `INSERT INTO admins (user_id, state_id, district_id, constituency_id) 
                 VALUES (?, ?, ?, ?)`,
          values: [userResult.insertId, state_id, district_id, constituency_id]
        });

        res.status(201).json({ message: 'Admin created successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to create admin' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}