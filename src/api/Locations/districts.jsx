import { query } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { state_id } = req.query;
    const districts = await query({
      query: 'SELECT id, name FROM districts WHERE state_id = ? ORDER BY name',
      values: [state_id]
    });
    res.status(200).json(districts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch districts' });
  }
}