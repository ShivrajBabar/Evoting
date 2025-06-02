import { query } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { ward_id } = req.query;
    const booths = await query({
      query: 'SELECT id, name FROM booths WHERE ward_id = ? ORDER BY name',
      values: [ward_id]
    });
    res.status(200).json(booths);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch booths' });
  }
}