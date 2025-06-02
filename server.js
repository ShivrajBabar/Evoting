import express from 'express';
import cors from 'cors';
import { query } from './src/lib/db.js';

const app = express();
const port = 3000; // changed backend server port to 3000

app.use(cors());
app.use(express.json());

// API route for /api/Locations/states
app.get('/api/Locations/states', async (req, res) => {
  try {
    const states = await query({
      query: 'SELECT id, name FROM states ORDER BY name'
    });
    res.status(200).json(states);
  } catch (error) {
    console.error('Failed to fetch states:', error);
    res.status(500).json({ error: 'Failed to fetch states' });
  }
});

// Add other API routes here similarly if needed

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
