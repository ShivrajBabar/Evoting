import { query } from '../../../lib/db';

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      try {
        const elections = await query({
          query: `
            SELECT e.*, s.name as state_name, d.name as district_name
            FROM elections e
            LEFT JOIN states s ON e.state_id = s.id
            LEFT JOIN districts d ON e.district_id = d.id
          `
        });
        res.status(200).json(elections);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch elections' });
      }
      break;

    case 'POST':
      try {
        const {
          name, type, election_date, application_start_date,
          application_end_date, result_date, state_id, district_id,
          description, status
        } = req.body;

        await query({
          query: `INSERT INTO elections (
            name, type, election_date, application_start_date,
            application_end_date, result_date, state_id, district_id,
            description, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          values: [
            name, type, election_date, application_start_date,
            application_end_date, result_date, state_id, district_id,
            description, status
          ]
        });

        res.status(201).json({ message: 'Election created successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to create election' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}