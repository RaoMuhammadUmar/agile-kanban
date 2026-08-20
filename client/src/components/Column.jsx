import React, { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Plus, MoreVertical, Trash2 } from 'lucide-react';
import TaskCard from './TaskCard.jsx';

export default function Column({ column, tasks, onTaskClick, onDeleteTask, onQuickAddTask, onDeleteColumn }) {
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  function submitQuickAdd(e) {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    onQuickAddTask(column.id, quickTitle.trim());
    setQuickTitle('');
    setShowQuickAdd(false);
  }

  return (
    <div className="flex flex-col bg-slate-50 rounded-xl border border-slate-200 w-72 shrink-0 max-h-full">
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-700">{column.title}</h3>
          <span className="text-xs bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full">{tasks.length}</span>
        </div>
        <div className="relative">
          <button onClick={() => setMenuOpen((v) => !v)} className="text-slate-400 hover:text-slate-600">
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 w-36">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onDeleteColumn(column.id);
                }}
                className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 size={14} /> Delete column
              </button>
            </div>
          )}
        </div>
      </div>

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto thin-scroll px-2 pb-2 min-h-[80px] transition-colors ${
              snapshot.isDraggingOver ? 'bg-brand-50' : ''
            }`}
          >
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} onClick={onTaskClick} onDelete={onDeleteTask} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <div className="px-2 pb-2">
        {showQuickAdd ? (
          <form onSubmit={submitQuickAdd} className="space-y-1.5">
            <input
              autoFocus
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              placeholder="Task title..."
              className="w-full text-sm px-2 py-1.5 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <div className="flex gap-1.5">
              <button
                type="submit"
                className="text-xs bg-brand-600 hover:bg-brand-700 text-white px-2.5 py-1 rounded-md"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setShowQuickAdd(false)}
                className="text-xs text-slate-500 hover:text-slate-700 px-2.5 py-1"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowQuickAdd(true)}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-600 hover:bg-brand-50 w-full px-2 py-1.5 rounded-md transition-colors"
          >
            <Plus size={14} /> Add task
          </button>
        )}
      </div>
    </div>
  );
}
