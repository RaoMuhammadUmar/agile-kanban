import express from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

// GET /api/boards - list all boards owned by the logged-in user
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, created_at FROM boards WHERE user_id = $1 ORDER BY created_at ASC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch boards error:', err);
    res.status(500).json({ error: 'Failed to fetch boards.' });
  }
});

// POST /api/boards - create a new board
router.post('/', async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Board title is required.' });
    }

    const boardResult = await pool.query(
      'INSERT INTO boards (user_id, title) VALUES ($1, $2) RETURNING id, title, created_at',
      [req.user.userId, title.trim()]
    );
    const board = boardResult.rows[0];

    const defaultColumns = ['To Do', 'In Progress', 'Done'];
    for (let i = 0; i < defaultColumns.length; i++) {
      await pool.query(
        'INSERT INTO columns (board_id, title, position) VALUES ($1, $2, $3)',
        [board.id, defaultColumns[i], i]
      );
    }

    res.status(201).json(board);
  } catch (err) {
    console.error('Create board error:', err);
    res.status(500).json({ error: 'Failed to create board.' });
  }
});

// GET /api/boards/:boardId/full - board + columns + tasks, all nested, in one call
router.get('/:boardId/full', async (req, res) => {
  try {
    const { boardId } = req.params;

    const boardResult = await pool.query(
      'SELECT id, title, created_at FROM boards WHERE id = $1 AND user_id = $2',
      [boardId, req.user.userId]
    );
    const board = boardResult.rows[0];
    if (!board) {
      return res.status(404).json({ error: 'Board not found.' });
    }

    const columnsResult = await pool.query(
      'SELECT id, board_id, title, position FROM columns WHERE board_id = $1 ORDER BY position ASC',
      [boardId]
    );

    const tasksResult = await pool.query(
      `SELECT t.id, t.column_id, t.title, t.description, t.priority, t.position, t.created_at
       FROM tasks t
       JOIN columns c ON t.column_id = c.id
       WHERE c.board_id = $1
       ORDER BY t.position ASC`,
      [boardId]
    );

    const columns = columnsResult.rows.map((col) => ({
      ...col,
      tasks: tasksResult.rows.filter((t) => t.column_id === col.id),
    }));

    res.json({ ...board, columns });
  } catch (err) {
    console.error('Fetch board detail error:', err);
    res.status(500).json({ error: 'Failed to fetch board details.' });
  }
});

// DELETE /api/boards/:boardId
router.delete('/:boardId', async (req, res) => {
  try {
    const { boardId } = req.params;
    const result = await pool.query(
      'DELETE FROM boards WHERE id = $1 AND user_id = $2 RETURNING id',
      [boardId, req.user.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Board not found.' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Delete board error:', err);
    res.status(500).json({ error: 'Failed to delete board.' });
  }
});

export default router;
