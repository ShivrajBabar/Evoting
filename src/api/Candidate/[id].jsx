import { query } from '../../../lib/db';

export default async function handler(req, res) {
  const { id } = req.query;

  switch (req.method) {
    case 'GET':
      try {
        const candidate = await query({
          query: 'SELECT * FROM candidates WHERE id = ?',
          values: [id]
        });
        if (candidate.length > 0) {
          res.status(200).json(candidate[0]);
        } else {
          res.status(404).json({ message: 'Candidate not found' });
        }
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch candidate' });
      }
      break;

    case 'PUT':
      try {
        const { name, email, status } = req.body;
        await query({
          query: 'UPDATE candidates SET name = ?, email = ?, status = ? WHERE id = ?',
          values: [name, email, status, id]
        });
        res.status(200).json({ message: 'Candidate updated successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to update candidate' });
      }
      break;

    case 'DELETE':
      try {
        await query({
          query: 'DELETE FROM candidates WHERE id = ?',
          values: [id]
        });
        res.status(200).json({ message: 'Candidate deleted successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete candidate' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}