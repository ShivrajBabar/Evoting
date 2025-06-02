import { query } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { district_id } = req.query;
    const localBodies = await query({
      query: 'SELECT id, name FROM local_bodies WHERE district_id = ? ORDER BY name',
      values: [district_id]
    });
    res.status(200).json(localBodies);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch local bodies' });
  }
}