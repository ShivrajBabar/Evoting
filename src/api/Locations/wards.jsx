import { query } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { local_body_id } = req.query;
    const wards = await query({
      query: 'SELECT id, name FROM wards WHERE local_body_id = ? ORDER BY name',
      values: [local_body_id]
    });
    res.status(200).json(wards);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch wards' });
  }
}