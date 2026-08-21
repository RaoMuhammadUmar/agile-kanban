import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { AlignLeft, Trash2 } from 'lucide-react';

const PRIORITY_STYLES = {
  Low: `
    bg-emerald-50/70
    text-emerald-700
    border-emerald-200/70
  `,

  Medium: `
    bg-amber-50/70
    text-amber-700
    border-amber-200/70
  `,

  High: `
    bg-red-50/70
    text-red-700
    border-red-200/70
  `,
};

export default function TaskCard({
  task,
  index,
  onClick,
  onDelete,
}) {
  return (
    <Draggable
      draggableId={task.id}
      index={index}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(task)}
          className={`
            group
            mb-2.5
            p-3.5
            rounded-2xl

            bg-white/65
            backdrop-blur-xl
            border border-white/80

            cursor-pointer

            shadow-[0_6px_20px_rgba(15,23,42,0.06)]

            transition-all duration-200

            hover:bg-white/80
            hover:-translate-y-0.5
            hover:shadow-[0_12px_28px_rgba(15,23,42,0.09)]

            ${
              snapshot.isDragging
                ? `
                  ring-2 ring-indigo-400/50
                  rotate-1
                  scale-[1.02]
                  shadow-[0_20px_40px_rgba(15,23,42,0.15)]
                `
                : ''
            }
          `}
        >

          {/* Header */}
          <div className="flex items-start justify-between gap-2">

            <h4 className="
              text-sm
              font-medium
              text-slate-800
              leading-snug
            ">
              {task.title}
            </h4>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
              className="
                opacity-0
                group-hover:opacity-100

                text-slate-300
                hover:text-red-500

                transition-all duration-200

                shrink-0
              "
              title="Delete task"
            >
              <Trash2 size={14} />
            </button>

          </div>

          {/* Description */}
          {task.description && (
            <div className="
              flex items-center gap-1.5
              mt-2
              text-slate-400
            ">
              <AlignLeft size={12} />

              <p className="
                text-xs
                truncate
              ">
                {task.description}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="
            mt-3
            flex
            items-center
            justify-between
          ">

            <span
              className={`
                text-[11px]
                font-medium
                px-2.5
                py-1
                rounded-full
                border
                backdrop-blur-sm
                ${PRIORITY_STYLES[task.priority]}
              `}
            >
              {task.priority}
            </span>

          </div>

        </div>
      )}
    </Draggable>
  );
}