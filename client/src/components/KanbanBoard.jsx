import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import Navbar from './Navbar.jsx';
import Column from './Column.jsx';
import TaskModal from './TaskModal.jsx';
import { api } from '../api.js';

export default function KanbanBoard({ boardId, onBack }) {
  const [board, setBoard] = useState(null); // { id, title, columns: [{ id, title, tasks: [] }] }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [modalDefaultColumnId, setModalDefaultColumnId] = useState(null);

  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  const loadBoard = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getBoardFull(boardId);
      setBoard(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  // Filtered view of the board's columns/tasks, derived from search + priority filter.
  const filteredColumns = useMemo(() => {
    if (!board) return [];
    return board.columns.map((col) => ({
      ...col,
      tasks: col.tasks.filter((t) => {
        const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
        return matchesSearch && matchesPriority;
      }),
    }));
  }, [board, searchTerm, priorityFilter]);

  // ---------- Drag and drop ----------
  async function handleDragEnd(result) {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    setBoard((prev) => {
      if (!prev) return prev;
      const columns = prev.columns.map((c) => ({ ...c, tasks: [...c.tasks] }));

      const sourceCol = columns.find((c) => c.id === source.droppableId);
      const destCol = columns.find((c) => c.id === destination.droppableId);

      const [movedTask] = sourceCol.tasks.splice(source.index, 1);
      movedTask.column_id = destCol.id;
      destCol.tasks.splice(destination.index, 0, movedTask);

      // Persist the new order for whichever column(s) changed.
      const affected = source.droppableId === destination.droppableId ? [sourceCol] : [sourceCol, destCol];
      api
        .reorderTasks(affected.map((c) => ({ columnId: c.id, taskIds: c.tasks.map((t) => t.id) })))
        .catch((err) => {
          console.error('Failed to persist reorder:', err);
          loadBoard(); // fall back to server truth if the write failed
        });

      return { ...prev, columns };
    });
  }

  // ---------- Task CRUD ----------
  function openCreateModal(columnId) {
    setEditingTask(null);
    setModalDefaultColumnId(columnId || board?.columns[0]?.id);
    setModalOpen(true);
  }

  function openEditModal(task) {
    setEditingTask(task);
    setModalOpen(true);
  }

  async function handleQuickAddTask(columnId, title) {
    try {
      const task = await api.createTask(columnId, title, '', 'Medium');
      setBoard((prev) => ({
        ...prev,
        columns: prev.columns.map((c) => (c.id === columnId ? { ...c, tasks: [...c.tasks, task] } : c)),
      }));
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleCreateTask(columnId, title, description, priority) {
    try {
      const task = await api.createTask(columnId, title, description, priority);
      setBoard((prev) => ({
        ...prev,
        columns: prev.columns.map((c) => (c.id === columnId ? { ...c, tasks: [...c.tasks, task] } : c)),
      }));
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleSaveTask(taskId, updates, newColumnId) {
    try {
      const updated = await api.updateTask(taskId, updates);
      setBoard((prev) => {
        const columns = prev.columns.map((c) => ({ ...c, tasks: c.tasks.filter((t) => t.id !== taskId) }));
        const targetCol = columns.find((c) => c.id === newColumnId) || columns.find((c) => c.id === updated.column_id);
        targetCol.tasks.push({ ...updated, column_id: targetCol.id });

        if (newColumnId && newColumnId !== updated.column_id) {
          // Task moved to a different column via the modal's dropdown; persist position too.
          api
            .reorderTasks([{ columnId: newColumnId, taskIds: targetCol.tasks.map((t) => t.id) }])
            .catch(() => loadBoard());
        }
        return { ...prev, columns };
      });
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDeleteTask(taskId) {
    if (!confirm('Delete this task?')) return;
    try {
      await api.deleteTask(taskId);
      setBoard((prev) => ({
        ...prev,
        columns: prev.columns.map((c) => ({ ...c, tasks: c.tasks.filter((t) => t.id !== taskId) })),
      }));
    } catch (err) {
      alert(err.message);
    }
  }

  // ---------- Column CRUD ----------
  async function handleAddColumn(e) {
    e.preventDefault();
    if (!newColumnTitle.trim()) return;
    try {
      const column = await api.createColumn(boardId, newColumnTitle.trim());
      setBoard((prev) => ({ ...prev, columns: [...prev.columns, column] }));
      setNewColumnTitle('');
      setShowAddColumn(false);
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDeleteColumn(columnId) {
    if (!confirm('Delete this column and all its tasks?')) return;
    try {
      await api.deleteColumn(columnId);
      setBoard((prev) => ({ ...prev, columns: prev.columns.filter((c) => c.id !== columnId) }));
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading board...</div>;
  }
  if (error || !board) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error || 'Board could not be loaded.'}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        boardTitle={board.title}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        onAddTask={() => openCreateModal()}
        onBack={onBack}
      />

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-x-auto px-4 py-6">
          <div className="flex gap-4 h-full items-start">
            {filteredColumns.map((column) => (
              <Column
                key={column.id}
                column={column}
                tasks={column.tasks}
                onTaskClick={openEditModal}
                onDeleteTask={handleDeleteTask}
                onQuickAddTask={handleQuickAddTask}
                onDeleteColumn={handleDeleteColumn}
              />
            ))}

            <div className="w-72 shrink-0">
              {showAddColumn ? (
                <form onSubmit={handleAddColumn} className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                  <input
                    autoFocus
                    value={newColumnTitle}
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                    placeholder="Column title..."
                    className="w-full text-sm px-2 py-1.5 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <div className="flex gap-1.5">
                    <button type="submit" className="text-xs bg-brand-600 hover:bg-brand-700 text-white px-2.5 py-1 rounded-md">
                      Add Column
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddColumn(false)}
                      className="text-xs text-slate-500 hover:text-slate-700 px-2.5 py-1"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowAddColumn(true)}
                  className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-brand-600 border-2 border-dashed border-slate-200 hover:border-brand-300 w-full px-3 py-3 rounded-xl transition-colors"
                >
                  <Plus size={16} /> Add another column
                </button>
              )}
            </div>
          </div>
        </div>
      </DragDropContext>

      {modalOpen && (
        <TaskModal
          task={editingTask}
          columns={board.columns}
          defaultColumnId={modalDefaultColumnId}
          onClose={() => setModalOpen(false)}
          onCreate={handleCreateTask}
          onSave={handleSaveTask}
        />
      )}
    </div>
  );
}
