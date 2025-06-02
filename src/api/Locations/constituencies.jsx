import { query } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { state_id, district_id, type } = req.query;

    let constituencies;
    if (type === 'loksabha') {
      constituencies = await query({
        query: 'SELECT id, name FROM loksabha_constituencies WHERE state_id = ? ORDER BY name',
        values: [state_id]
      });
    } else if (type === 'vidhansabha') {
      constituencies = await query({
        query: 'SELECT id, name FROM vidhansabha_constituencies WHERE district_id = ? ORDER BY name',
        values: [district_id]
      });
    }

    res.status(200).json(constituencies);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch constituencies' });
  }
}