import express from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

const VALID_PRIORITIES = ['Low', 'Medium', 'High'];

// Confirms the column belongs to a board owned by the requesting user.
async function userOwnsColumn(userId, columnId) {
  const result = await pool.query(
    `SELECT c.id
     FROM columns c
     JOIN boards b ON c.board_id = b.id
     WHERE c.id = $1
       AND b.user_id = $2`,
    [columnId, userId]
  );

  return result.rows.length > 0;
}

// POST /api/tasks
router.post('/', async (req, res) => {
  try {
    const { columnId, title, description, priority } = req.body;

    if (!columnId || !title || !title.trim()) {
      return res.status(400).json({
        error: 'columnId and title are required.',
      });
    }

    const finalPriority = VALID_PRIORITIES.includes(priority)
      ? priority
      : 'Medium';

    const owns = await userOwnsColumn(req.user.userId, columnId);

    if (!owns) {
      return res.status(403).json({
        error: 'You do not have access to this column.',
      });
    }

    const positionResult = await pool.query(
      `SELECT COALESCE(MAX(position), -1) + 1 AS next_position
       FROM tasks
       WHERE column_id = $1`,
      [columnId]
    );

    const nextPosition = positionResult.rows[0].next_position;

    const result = await pool.query(
      `INSERT INTO tasks
        (column_id, title, description, priority, position)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING
        id,
        column_id,
        title,
        description,
        priority,
        position,
        created_at`,
      [
        columnId,
        title.trim(),
        description || '',
        finalPriority,
        nextPosition,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create task error:', err);

    res.status(500).json({
      error: 'Failed to create task.',
    });
  }
});

// PUT /api/tasks/:taskId
router.put('/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, priority } = req.body;

    if (title !== undefined && (!title || !title.trim())) {
      return res.status(400).json({
        error: 'Task title cannot be empty.',
      });
    }

    if (
      priority !== undefined &&
      !VALID_PRIORITIES.includes(priority)
    ) {
      return res.status(400).json({
        error: 'Priority must be Low, Medium, or High.',
      });
    }

    const result = await pool.query(
      `UPDATE tasks t
       SET
         title = COALESCE($1, t.title),
         description = COALESCE($2, t.description),
         priority = COALESCE($3, t.priority)
       FROM columns c, boards b
       WHERE t.id = $4
         AND t.column_id = c.id
         AND c.board_id = b.id
         AND b.user_id = $5
       RETURNING
         t.id,
         t.column_id,
         t.title,
         t.description,
         t.priority,
         t.position,
         t.created_at`,
      [
        title !== undefined ? title.trim() : undefined,
        description,
        priority,
        taskId,
        req.user.userId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Task not found.',
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update task error:', err);

    res.status(500).json({
      error: 'Failed to update task.',
    });
  }
});

// DELETE /api/tasks/:taskId
router.delete('/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;

    const result = await pool.query(
      `DELETE FROM tasks t
       USING columns c, boards b
       WHERE t.id = $1
         AND t.column_id = c.id
         AND c.board_id = b.id
         AND b.user_id = $2
       RETURNING t.id`,
      [taskId, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Task not found.',
      });
    }

    res.json({
      success: true,
    });
  } catch (err) {
    console.error('Delete task error:', err);

    res.status(500).json({
      error: 'Failed to delete task.',
    });
  }
});

// POST /api/tasks/reorder
router.post('/reorder', async (req, res) => {
  const client = await pool.connect();

  try {
    const { columns } = req.body;

    if (!Array.isArray(columns) || columns.length === 0) {
      return res.status(400).json({
        error: 'columns array is required.',
      });
    }

    // Prevent duplicate column entries.
    const columnIds = columns.map((col) => col?.columnId);

    if (
      columnIds.some((id) => !id) ||
      new Set(columnIds).size !== columnIds.length
    ) {
      return res.status(400).json({
        error: 'Each column must have a unique columnId.',
      });
    }

    // Verify every referenced column belongs to the current user.
    for (const col of columns) {
      if (!Array.isArray(col.taskIds)) {
        return res.status(400).json({
          error: 'taskIds must be an array for every column.',
        });
      }

      const owns = await userOwnsColumn(
        req.user.userId,
        col.columnId
      );

      if (!owns) {
        return res.status(403).json({
          error: 'You do not have access to one or more of these columns.',
        });
      }
    }

    // Prevent the same task from appearing multiple times.
    const allTaskIds = columns.flatMap((col) => col.taskIds);

    if (new Set(allTaskIds).size !== allTaskIds.length) {
      return res.status(400).json({
        error: 'A task cannot appear more than once.',
      });
    }

    /*
     * Important security check:
     *
     * Every task being reordered must already belong to a column
     * on a board owned by the authenticated user.
     */
    if (allTaskIds.length > 0) {
      const taskResult = await client.query(
        `SELECT t.id
         FROM tasks t
         JOIN columns c ON t.column_id = c.id
         JOIN boards b ON c.board_id = b.id
         WHERE t.id = ANY($1::uuid[])
           AND b.user_id = $2`,
        [allTaskIds, req.user.userId]
      );

      const ownedTaskIds = new Set(
        taskResult.rows.map((row) => row.id)
      );

      for (const taskId of allTaskIds) {
        if (!ownedTaskIds.has(taskId)) {
          return res.status(403).json({
            error: 'You do not have access to one or more of these tasks.',
          });
        }
      }
    }

    await client.query('BEGIN');

    for (const col of columns) {
      const { columnId, taskIds } = col;

      for (let index = 0; index < taskIds.length; index++) {
        await client.query(
          `UPDATE tasks
           SET column_id = $1,
               position = $2
           WHERE id = $3`,
          [columnId, index, taskIds[index]]
        );
      }
    }

    await client.query('COMMIT');

    res.json({
      success: true,
    });
  } catch (err) {
    await client.query('ROLLBACK');

    console.error('Reorder error:', err);

    res.status(500).json({
      error: 'Failed to save the new task order.',
    });
  } finally {
    client.release();
  }
});

export default router;