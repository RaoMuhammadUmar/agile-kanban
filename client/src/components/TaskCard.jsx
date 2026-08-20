import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { AlignLeft, Trash2 } from 'lucide-react';

const PRIORITY_STYLES = {
  Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  High: 'bg-red-50 text-red-700 border-red-200',
};

export default function TaskCard({ task, index, onClick, onDelete }) {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(task)}
          className={`group bg-white rounded-lg border border-slate-200 p-3 mb-2 cursor-pointer shadow-sm hover:shadow-md transition-shadow ${
            snapshot.isDragging ? 'ring-2 ring-brand-400 rotate-1' : ''
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-medium text-slate-800 leading-snug">{task.title}</h4>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
              className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-opacity shrink-0"
              title="Delete task"
            >
              <Trash2 size={14} />
            </button>
          </div>

          {task.description && (
            <div className="flex items-center gap-1 mt-1.5 text-slate-400">
              <AlignLeft size={12} />
              <p className="text-xs truncate">{task.description}</p>
            </div>
          )}

          <div className="mt-2.5 flex items-center justify-between">
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${PRIORITY_STYLES[task.priority]}`}
            >
              {task.priority}
            </span>
          </div>
        </div>
      )}
    </Draggable>
  );
}
