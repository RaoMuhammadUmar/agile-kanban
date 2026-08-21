
import React, { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import {
  Plus,
  MoreVertical,
  Trash2,
} from 'lucide-react';
import TaskCard from './TaskCard.jsx';

export default function Column({
  column,
  tasks,
  onTaskClick,
  onDeleteTask,
  onQuickAddTask,
  onDeleteColumn,
}) {
  const [showQuickAdd, setShowQuickAdd] =
    useState(false);

  const [quickTitle, setQuickTitle] =
    useState('');

  const [menuOpen, setMenuOpen] =
    useState(false);

  function submitQuickAdd(e) {
    e.preventDefault();

    if (!quickTitle.trim()) return;

    onQuickAddTask(
      column.id,
      quickTitle.trim()
    );

    setQuickTitle('');
    setShowQuickAdd(false);
  }

  const isDone =
    column.title.toLowerCase() === 'done';

  const isInProgress =
    column.title.toLowerCase() ===
    'in progress';

  const isTodo =
    column.title.toLowerCase() === 'to do';

  return (
    <div
      className="
        glass-panel
        flex
        flex-col
        rounded-2xl
        w-72
        shrink-0
        max-h-full
        overflow-hidden
        transition-all
        duration-300
        hover:-translate-y-0.5
      "
    >
      {/* Column header */}

      <div className="px-4 py-3.5 border-b border-white/50">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-2.5">

            {/* Status indicator */}

            <div
              className={`
                w-2.5
                h-2.5
                rounded-full
                ${
                  isDone
                    ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.45)]'
                    : isInProgress
                    ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                    : isTodo
                    ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]'
                    : 'bg-slate-400'
                }
              `}
            />

            <h3 className="text-sm font-semibold text-slate-700">
              {column.title}
            </h3>

            <span
              className="
                text-[11px]
                font-medium
                bg-white/60
                text-slate-500
                border
                border-white/70
                px-2
                py-0.5
                rounded-full
                backdrop-blur-sm
              "
            >
              {tasks.length}
            </span>

          </div>

          {/* Column menu */}

          <div className="relative">

            <button
              onClick={() =>
                setMenuOpen((value) => !value)
              }
              className="
                w-8
                h-8
                flex
                items-center
                justify-center
                rounded-xl
                text-slate-400
                hover:text-slate-700
                hover:bg-white/60
                transition-all
              "
              title="Column options"
            >
              <MoreVertical size={16} />
            </button>

            {menuOpen && (
              <div
                className="
                  absolute
                  right-0
                  top-full
                  mt-1.5
                  bg-white/90
                  backdrop-blur-xl
                  border
                  border-white/80
                  rounded-xl
                  shadow-xl
                  z-30
                  w-40
                  overflow-hidden
                "
              >
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDeleteColumn(column.id);
                  }}
                  className="
                    flex
                    items-center
                    gap-2
                    w-full
                    text-left
                    px-3
                    py-2.5
                    text-sm
                    text-red-600
                    hover:bg-red-50/70
                    transition-colors
                  "
                >
                  <Trash2 size={14} />
                  Delete column
                </button>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Tasks */}

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`
              flex-1
              overflow-y-auto
              thin-scroll
              px-2.5
              py-2.5
              min-h-[100px]
              transition-all
              duration-200
              ${
                snapshot.isDraggingOver
                  ? 'bg-indigo-500/[0.06]'
                  : ''
              }
            `}
          >
            {tasks.length === 0 ? (
              <div
                className="
                  flex
                  items-center
                  justify-center
                  min-h-[90px]
                  rounded-xl
                  border
                  border-dashed
                  border-slate-300/60
                  text-xs
                  text-slate-400
                "
              >
                Drop tasks here
              </div>
            ) : (
              tasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={index}
                  onClick={onTaskClick}
                  onDelete={onDeleteTask}
                />
              ))
            )}

            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Quick add */}

      <div
        className="
          px-2.5
          pb-2.5
          pt-1
          border-t
          border-white/40
        "
      >
        {showQuickAdd ? (
          <form
            onSubmit={submitQuickAdd}
            className="space-y-2"
          >
            <input
              autoFocus
              value={quickTitle}
              onChange={(e) =>
                setQuickTitle(e.target.value)
              }
              placeholder="Task title..."
              className="
                glass-input
                w-full
                text-sm
                px-3
                py-2
                rounded-xl
              "
            />

            <div className="flex gap-2">

              <button
                type="submit"
                className="
                  text-xs
                  font-medium
                  bg-gradient-to-br
                  from-indigo-500
                  to-blue-500
                  hover:from-indigo-600
                  hover:to-blue-600
                  text-white
                  px-3
                  py-2
                  rounded-xl
                  shadow-sm
                  transition-all
                "
              >
                Add
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowQuickAdd(false)
                }
                className="
                  text-xs
                  text-slate-500
                  hover:text-slate-700
                  px-3
                  py-2
                  rounded-xl
                  hover:bg-white/60
                  transition-all
                "
              >
                Cancel
              </button>

            </div>
          </form>
        ) : (
          <button
            onClick={() =>
              setShowQuickAdd(true)
            }
            className="
              flex
              items-center
              justify-center
              gap-1.5
              text-sm
              text-slate-400
              hover:text-indigo-600
              hover:bg-white/50
              backdrop-blur-sm
              w-full
              px-3
              py-2.5
              rounded-xl
              transition-all
              duration-200
            "
          >
            <Plus size={14} />
            Add task
          </button>
        )}
      </div>
    </div>
  );
}

