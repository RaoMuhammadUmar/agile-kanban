import express from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

// Helper: confirms the requesting user owns the board that a column belongs to
// (or owns the board directly, when boardId is passed instead of columnId).
async function userOwnsBoard(userId, boardId) {
  const result = await pool.query(
    'SELECT id FROM boards WHERE id = $1 AND user_id = $2',
    [boardId, userId]
  );
  return result.rows.length > 0;
}

// POST /api/columns - create a new column on a board
router.post('/', async (req, res) => {
  try {
    const { boardId, title } = req.body;
    if (!boardId || !title || !title.trim()) {
      return res.status(400).json({ error: 'boardId and title are required.' });
    }

    const owns = await userOwnsBoard(req.user.userId, boardId);
    if (!owns) {
      return res.status(403).json({ error: 'You do not have access to this board.' });
    }

    const positionResult = await pool.query(
      'SELECT COALESCE(MAX(position), -1) + 1 AS next_position FROM columns WHERE board_id = $1',
      [boardId]
    );
    const nextPosition = positionResult.rows[0].next_position;

    const result = await pool.query(
      'INSERT INTO columns (board_id, title, position) VALUES ($1, $2, $3) RETURNING id, board_id, title, position',
      [boardId, title.trim(), nextPosition]
    );

    res.status(201).json({ ...result.rows[0], tasks: [] });
  } catch (err) {
    console.error('Create column error:', err);
    res.status(500).json({ error: 'Failed to create column.' });
  }
});

// PUT /api/columns/:columnId - rename a column
router.put('/:columnId', async (req, res) => {
  try {
    const { columnId } = req.params;
    const { title } = req.body;

    const result = await pool.query(
      `UPDATE columns SET title = $1
       WHERE id = $2 AND board_id IN (SELECT id FROM boards WHERE user_id = $3)
       RETURNING id, board_id, title, position`,
      [title.trim(), columnId, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Column not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update column error:', err);
    res.status(500).json({ error: 'Failed to update column.' });
  }
});

// DELETE /api/columns/:columnId
router.delete('/:columnId', async (req, res) => {
  try {
    const { columnId } = req.params;
    const result = await pool.query(
      `DELETE FROM columns
       WHERE id = $1 AND board_id IN (SELECT id FROM boards WHERE user_id = $2)
       RETURNING id`,
      [columnId, req.user.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Column not found.' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Delete column error:', err);
    res.status(500).json({ error: 'Failed to delete column.' });
  }
});

export default router;
