import { query } from '../../../lib/db';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      try {
        const voters = await query({
          query: `
            SELECT v.*, u.name, u.email, u.phone,
            s.name as state_name, d.name as district_name
            FROM voters v
            JOIN users u ON v.user_id = u.id
            JOIN states s ON v.state_id = s.id
            JOIN districts d ON v.district_id = d.id
          `
        });
        res.status(200).json(voters);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch voters' });
      }
      break;

    case 'POST':
      try {
        const {
          name, email, phone, password, voter_id,
          state_id, district_id, booth_id, photo
        } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user first
        const userResult = await query({
          query: `INSERT INTO users (role_id, name, email, phone, password, status) 
                 VALUES (3, ?, ?, ?, ?, 'active')`,
          values: [name, email, phone, hashedPassword]
        });

        // Create voter entry
        await query({
          query: `INSERT INTO voters (user_id, voter_id, state_id, district_id, 
                 booth_id, photo) VALUES (?, ?, ?, ?, ?, ?)`,
          values: [userResult.insertId, voter_id, state_id, district_id, booth_id, photo]
        });

        res.status(201).json({ message: 'Voter registered successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to register voter' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}