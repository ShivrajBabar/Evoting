import { query } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const states = await query({
      query: 'SELECT id, name FROM states ORDER BY name'
    });
    res.status(200).json(states);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch states' });
  }
}