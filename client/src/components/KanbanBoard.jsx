
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';

import { DragDropContext } from '@hello-pangea/dnd';
import {
  Plus,
  LayoutGrid,
  CheckCircle2,
  ListTodo,
  Clock3,
  AlertTriangle,
  BarChart3,
} from 'lucide-react';

import Navbar from './Navbar.jsx';
import Column from './Column.jsx';
import TaskModal from './TaskModal.jsx';
import { api } from '../api.js';

export default function KanbanBoard({ boardId, onBack }) {
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showIntro, setShowIntro] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [modalDefaultColumnId, setModalDefaultColumnId] =
    useState(null);

  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  // --------------------------------------------------
  // Load board
  // --------------------------------------------------

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

  // --------------------------------------------------
  // Intro animation
  // --------------------------------------------------

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  // --------------------------------------------------
  // Filtered columns/tasks
  // --------------------------------------------------

  const filteredColumns = useMemo(() => {
    if (!board) return [];

    return board.columns.map((column) => ({
      ...column,

      tasks: column.tasks.filter((task) => {
        const matchesSearch = task.title
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

        const matchesPriority =
          priorityFilter === 'All' ||
          task.priority === priorityFilter;

        return matchesSearch && matchesPriority;
      }),
    }));
  }, [board, searchTerm, priorityFilter]);

  // --------------------------------------------------
  // Dashboard statistics
  // --------------------------------------------------

  const stats = useMemo(() => {
    if (!board) {
      return {
        total: 0,
        completed: 0,
        remaining: 0,
        highPriority: 0,
        mediumPriority: 0,
        lowPriority: 0,
        completionRate: 0,
      };
    }

    const allTasks = board.columns.flatMap(
      (column) => column.tasks
    );

    const total = allTasks.length;

    const doneColumn = board.columns.find(
      (column) =>
        column.title.toLowerCase() === 'done'
    );

    const completed = doneColumn
      ? doneColumn.tasks.length
      : 0;

    const remaining = total - completed;

    const highPriority = allTasks.filter(
      (task) => task.priority === 'High'
    ).length;

    const mediumPriority = allTasks.filter(
      (task) => task.priority === 'Medium'
    ).length;

    const lowPriority = allTasks.filter(
      (task) => task.priority === 'Low'
    ).length;

    const completionRate =
      total === 0
        ? 0
        : Math.round((completed / total) * 100);

    return {
      total,
      completed,
      remaining,
      highPriority,
      mediumPriority,
      lowPriority,
      completionRate,
    };
  }, [board]);

  // --------------------------------------------------
  // Drag and drop
  // --------------------------------------------------

  async function handleDragEnd(result) {
    const { source, destination } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    setBoard((prev) => {
      if (!prev) return prev;

      const columns = prev.columns.map((column) => ({
        ...column,
        tasks: [...column.tasks],
      }));

      const sourceCol = columns.find(
        (column) =>
          column.id === source.droppableId
      );

      const destCol = columns.find(
        (column) =>
          column.id === destination.droppableId
      );

      if (!sourceCol || !destCol) {
        return prev;
      }

      const [movedTask] = sourceCol.tasks.splice(
        source.index,
        1
      );

      movedTask.column_id = destCol.id;

      destCol.tasks.splice(
        destination.index,
        0,
        movedTask
      );

      const affected =
        source.droppableId === destination.droppableId
          ? [sourceCol]
          : [sourceCol, destCol];

      api
        .reorderTasks(
          affected.map((column) => ({
            columnId: column.id,
            taskIds: column.tasks.map(
              (task) => task.id
            ),
          }))
        )
        .catch((err) => {
          console.error(
            'Failed to persist reorder:',
            err
          );

          loadBoard();
        });

      return {
        ...prev,
        columns,
      };
    });
  }

  // --------------------------------------------------
  // Task CRUD
  // --------------------------------------------------

  function openCreateModal(columnId) {
    setEditingTask(null);

    setModalDefaultColumnId(
      columnId ||
        board?.columns[0]?.id
    );

    setModalOpen(true);
  }

  function openEditModal(task) {
    setEditingTask(task);
    setModalOpen(true);
  }

  async function handleQuickAddTask(
    columnId,
    title
  ) {
    try {
      const task = await api.createTask(
        columnId,
        title,
        '',
        'Medium'
      );

      setBoard((prev) => ({
        ...prev,

        columns: prev.columns.map((column) =>
          column.id === columnId
            ? {
                ...column,
                tasks: [
                  ...column.tasks,
                  task,
                ],
              }
            : column
        ),
      }));
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleCreateTask(
    columnId,
    title,
    description,
    priority
  ) {
    try {
      const task = await api.createTask(
        columnId,
        title,
        description,
        priority
      );

      setBoard((prev) => ({
        ...prev,

        columns: prev.columns.map((column) =>
          column.id === columnId
            ? {
                ...column,
                tasks: [
                  ...column.tasks,
                  task,
                ],
              }
            : column
        ),
      }));
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleSaveTask(
    taskId,
    updates,
    newColumnId
  ) {
    try {
      const updated = await api.updateTask(
        taskId,
        updates
      );

      setBoard((prev) => {
        const columns = prev.columns.map(
          (column) => ({
            ...column,

            tasks: column.tasks.filter(
              (task) => task.id !== taskId
            ),
          })
        );

        const targetCol =
          columns.find(
            (column) =>
              column.id === newColumnId
          ) ||
          columns.find(
            (column) =>
              column.id ===
              updated.column_id
          );

        if (!targetCol) {
          return prev;
        }

        targetCol.tasks.push({
          ...updated,
          column_id: targetCol.id,
        });

        if (
          newColumnId &&
          newColumnId !== updated.column_id
        ) {
          api
            .reorderTasks([
              {
                columnId: newColumnId,
                taskIds:
                  targetCol.tasks.map(
                    (task) => task.id
                  ),
              },
            ])
            .catch(() => loadBoard());
        }

        return {
          ...prev,
          columns,
        };
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

        columns: prev.columns.map(
          (column) => ({
            ...column,

            tasks: column.tasks.filter(
              (task) => task.id !== taskId
            ),
          })
        ),
      }));
    } catch (err) {
      alert(err.message);
    }
  }

  // --------------------------------------------------
  // Column CRUD
  // --------------------------------------------------

  async function handleAddColumn(e) {
    e.preventDefault();

    if (!newColumnTitle.trim()) return;

    try {
      const column = await api.createColumn(
        boardId,
        newColumnTitle.trim()
      );

      setBoard((prev) => ({
        ...prev,

        columns: [
          ...prev.columns,
          column,
        ],
      }));

      setNewColumnTitle('');
      setShowAddColumn(false);
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDeleteColumn(columnId) {
    if (
      !confirm(
        'Delete this column and all its tasks?'
      )
    ) {
      return;
    }

    try {
      await api.deleteColumn(columnId);

      setBoard((prev) => ({
        ...prev,

        columns: prev.columns.filter(
          (column) =>
            column.id !== columnId
        ),
      }));
    } catch (err) {
      alert(err.message);
    }
  }

  // --------------------------------------------------
  // Intro screen
  // --------------------------------------------------

  if (showIntro) {
    return (
      <div className="intro-screen">
        <div className="intro-content">
          <div className="intro-icon">
            <LayoutGrid
              size={32}
              strokeWidth={2}
            />
          </div>

          <div className="intro-title">
            Agile Kanban
          </div>

          <div className="intro-subtitle">
            Organize. Prioritize. Ship.
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-panel px-6 py-4 rounded-2xl text-slate-500">
          Loading board...
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Error
  // --------------------------------------------------

  if (error || !board) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-panel px-6 py-4 rounded-2xl text-red-500">
          {error ||
            'Board could not be loaded.'}
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100">

      {/* Navbar */}

      <Navbar
        boardTitle={board.title}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={
          setPriorityFilter
        }
        onAddTask={() =>
          openCreateModal()
        }
        onBack={onBack}
      />

      {/* Dashboard */}

      <main className="px-4 pt-6">

        <div className="max-w-7xl mx-auto">

          {/* Dashboard heading */}

          <div className="mb-5 flex items-center justify-between">

            <div>
              <div className="flex items-center gap-2">
                <BarChart3
                  size={20}
                  className="text-brand-600"
                />

                <h2 className="text-xl font-semibold text-slate-800">
                  Overview
                </h2>
              </div>

              <p className="text-sm text-slate-500 mt-1">
                Track your board's progress
                and priorities.
              </p>
            </div>

            <div className="hidden sm:block text-sm text-slate-400">
              {stats.total} total tasks
            </div>

          </div>

          {/* Statistics */}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Total */}

            <div className="glass-panel rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-slate-500">
                    Total Tasks
                  </p>

                  <p className="text-3xl font-bold text-slate-800 mt-2">
                    {stats.total}
                  </p>
                </div>

                <div className="w-11 h-11 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                  <ListTodo
                    size={21}
                    className="text-blue-600"
                  />
                </div>

              </div>

            </div>

            {/* Completed */}

            <div className="glass-panel rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-slate-500">
                    Completed
                  </p>

                  <p className="text-3xl font-bold text-emerald-600 mt-2">
                    {stats.completed}
                  </p>
                </div>

                <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2
                    size={21}
                    className="text-emerald-600"
                  />
                </div>

              </div>

            </div>

            {/* Remaining */}

            <div className="glass-panel rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-slate-500">
                    Remaining
                  </p>

                  <p className="text-3xl font-bold text-indigo-600 mt-2">
                    {stats.remaining}
                  </p>
                </div>

                <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                  <Clock3
                    size={21}
                    className="text-indigo-600"
                  />
                </div>

              </div>

            </div>

            {/* High Priority */}

            <div className="glass-panel rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-slate-500">
                    High Priority
                  </p>

                  <p className="text-3xl font-bold text-red-600 mt-2">
                    {stats.highPriority}
                  </p>
                </div>

                <div className="w-11 h-11 rounded-2xl bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle
                    size={21}
                    className="text-red-600"
                  />
                </div>

              </div>

            </div>

          </div>

          {/* Charts */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">

            {/* Completion */}

            <div className="glass-panel rounded-2xl p-6">

              <div className="flex justify-between items-start mb-5">

                <div>
                  <h3 className="font-semibold text-slate-800">
                    Task Completion
                  </h3>

                  <p className="text-sm text-slate-500 mt-1">
                    Overall board progress
                  </p>
                </div>

                <div className="text-2xl font-bold text-emerald-600">
                  {stats.completionRate}%
                </div>

              </div>

              <div className="w-full h-3 bg-slate-200/70 rounded-full overflow-hidden">

                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${stats.completionRate}%`,
                  }}
                />

              </div>

              <div className="flex justify-between text-xs text-slate-500 mt-3">

                <span>
                  {stats.completed} completed
                </span>

                <span>
                  {stats.remaining} remaining
                </span>

              </div>

            </div>

            {/* Priority */}

            <div className="glass-panel rounded-2xl p-6">

              <div className="mb-5">

                <h3 className="font-semibold text-slate-800">
                  Priority Breakdown
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Distribution of your tasks
                </p>

              </div>

              {/* High */}

              <div className="mb-4">

                <div className="flex justify-between text-sm mb-1.5">

                  <span className="text-red-600 font-medium">
                    High
                  </span>

                  <span className="text-slate-500">
                    {stats.highPriority}
                  </span>

                </div>

                <div className="w-full h-2 bg-slate-200/70 rounded-full overflow-hidden">

                  <div
                    className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full transition-all duration-700"
                    style={{
                      width:
                        stats.total === 0
                          ? '0%'
                          : `${
                              (stats.highPriority /
                                stats.total) *
                              100
                            }%`,
                    }}
                  />

                </div>

              </div>

              {/* Medium */}

              <div className="mb-4">

                <div className="flex justify-between text-sm mb-1.5">

                  <span className="text-amber-600 font-medium">
                    Medium
                  </span>

                  <span className="text-slate-500">
                    {stats.mediumPriority}
                  </span>

                </div>

                <div className="w-full h-2 bg-slate-200/70 rounded-full overflow-hidden">

                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full transition-all duration-700"
                    style={{
                      width:
                        stats.total === 0
                          ? '0%'
                          : `${
                              (stats.mediumPriority /
                                stats.total) *
                              100
                            }%`,
                    }}
                  />

                </div>

              </div>

              {/* Low */}

              <div>

                <div className="flex justify-between text-sm mb-1.5">

                  <span className="text-blue-600 font-medium">
                    Low
                  </span>

                  <span className="text-slate-500">
                    {stats.lowPriority}
                  </span>

                </div>

                <div className="w-full h-2 bg-slate-200/70 rounded-full overflow-hidden">

                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all duration-700"
                    style={{
                      width:
                        stats.total === 0
                          ? '0%'
                          : `${
                              (stats.lowPriority /
                                stats.total) *
                              100
                            }%`,
                    }}
                  />

                </div>

              </div>

            </div>

          </div>

        </div>

      </main>

      {/* Kanban board */}

      <DragDropContext
        onDragEnd={handleDragEnd}
      >

        <div className="flex-1 overflow-x-auto px-4 py-6">

          <div className="flex gap-5 h-full items-start max-w-[1800px] mx-auto">

            {filteredColumns.map(
              (column) => (
                <Column
                  key={column.id}
                  column={column}
                  tasks={column.tasks}
                  onTaskClick={
                    openEditModal
                  }
                  onDeleteTask={
                    handleDeleteTask
                  }
                  onQuickAddTask={
                    handleQuickAddTask
                  }
                  onDeleteColumn={
                    handleDeleteColumn
                  }
                />
              )
            )}

            {/* Add column */}

            <div className="w-72 shrink-0">

              {showAddColumn ? (

                <form
                  onSubmit={
                    handleAddColumn
                  }
                  className="glass-panel rounded-2xl p-4 space-y-3"
                >

                  <input
                    autoFocus
                    value={
                      newColumnTitle
                    }
                    onChange={(e) =>
                      setNewColumnTitle(
                        e.target.value
                      )
                    }
                    placeholder="Column title..."
                    className="w-full text-sm px-3 py-2 rounded-xl border border-white/60 bg-white/60 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />

                  <div className="flex gap-2">

                    <button
                      type="submit"
                      className="text-xs bg-brand-600 hover:bg-brand-700 text-white px-3 py-2 rounded-xl transition-all hover:shadow-md"
                    >
                      Add Column
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setShowAddColumn(
                          false
                        )
                      }
                      className="text-xs text-slate-500 hover:text-slate-700 px-3 py-2 rounded-xl hover:bg-white/60 transition-all"
                    >
                      Cancel
                    </button>

                  </div>

                </form>

              ) : (

                <button
                  onClick={() =>
                    setShowAddColumn(
                      true
                    )
                  }
                  className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-brand-600 border-2 border-dashed border-white/70 hover:border-brand-300 bg-white/20 hover:bg-white/40 backdrop-blur-md w-full px-3 py-4 rounded-2xl transition-all duration-300 hover:-translate-y-0.5"
                >

                  <Plus size={16} />

                  Add another column

                </button>

              )}

            </div>

          </div>

        </div>

      </DragDropContext>

      {/* Task modal */}

      {modalOpen && (

        <TaskModal
          task={editingTask}
          columns={board.columns}
          defaultColumnId={
            modalDefaultColumnId
          }
          onClose={() =>
            setModalOpen(false)
          }
          onCreate={
            handleCreateTask
          }
          onSave={handleSaveTask}
        />

      )}

    </div>
  );
}
