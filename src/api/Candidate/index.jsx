import { query } from '../../../lib/db';

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      try {
        const candidates = await query({
          query: `SELECT * FROM candidates`
        });
        res.status(200).json(candidates);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch candidates' });
      }
      break;

    case 'POST':
      try {
        const {
          name, email, aadhar, phone, dob, district_id, state_id,
          election_id, party, income, education, religion, photo
        } = req.body;

        const result = await query({
          query: `INSERT INTO candidates (
            name, email, aadhar, phone, dob, district_id, state_id,
            election_id, party, income, education, religion, photo, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
          values: [
            name, email, aadhar, phone, dob, district_id, state_id,
            election_id, party, income, education, religion, photo
          ]
        });
        res.status(201).json({ message: 'Candidate created successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to create candidate' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}