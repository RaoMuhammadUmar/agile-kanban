import React from 'react';
import {
  LayoutGrid,
  Search,
  LogOut,
  Plus,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar({
  boardTitle,
  searchTerm,
  onSearchChange,
  priorityFilter,
  onPriorityFilterChange,
  onAddTask,
  onBack,
}) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 px-3 pt-3">
      <div className="glass-strong max-w-7xl mx-auto rounded-2xl">
        <div className="px-4 py-3 flex flex-wrap items-center gap-3 justify-between">

          {/* Left side */}
          <div className="flex items-center gap-3 min-w-0">
            {onBack && (
              <button
                onClick={onBack}
                title="Back to boards"
                className="
                  p-2 rounded-xl
                  text-slate-400
                  hover:text-indigo-600
                  hover:bg-indigo-50/70
                  transition-all duration-200
                  hover:scale-105
                "
              >
                <ArrowLeft size={18} />
              </button>
            )}

            <div
              className="
                w-10 h-10 shrink-0
                flex items-center justify-center
                rounded-xl
                text-white
                bg-gradient-to-br from-indigo-500 to-blue-500
                shadow-lg shadow-blue-500/20
              "
            >
              <LayoutGrid size={20} />
            </div>

            <div className="min-w-0">
              <h1 className="font-semibold text-slate-800 leading-tight truncate">
                {boardTitle || 'Loading...'}
              </h1>

              <p className="text-xs text-slate-400 truncate max-w-[180px]">
                {user?.email}
              </p>
            </div>
          </div>

          {/* Search + filter */}
          <div className="flex items-center gap-2 flex-1 max-w-xl">

            <div className="relative flex-1">
              <Search
                size={16}
                className="
                  absolute left-3 top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search tasks..."
                className="
                  glass-input
                  w-full
                  pl-9 pr-3 py-2
                  rounded-xl
                  text-sm
                  text-slate-700
                  placeholder:text-slate-400
                "
              />
            </div>

            <select
              value={priorityFilter}
              onChange={(e) => onPriorityFilterChange(e.target.value)}
              className="
                glass-input
                rounded-xl
                px-3 py-2
                text-sm
                text-slate-600
                cursor-pointer
              "
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">

            <button
              onClick={onAddTask}
              className="
                flex items-center gap-1.5
                bg-gradient-to-br from-indigo-500 to-blue-500
                hover:from-indigo-600 hover:to-blue-600
                text-white
                text-sm font-medium
                px-3.5 py-2
                rounded-xl
                shadow-lg shadow-blue-500/20
                transition-all duration-200
                hover:-translate-y-0.5
                active:translate-y-0
              "
            >
              <Plus size={16} />
              New Task
            </button>

            <button
              onClick={logout}
              title="Log out"
              className="
                flex items-center justify-center
                w-9 h-9
                rounded-xl
                text-slate-400
                hover:text-red-500
                hover:bg-red-50/70
                transition-all duration-200
              "
            >
              <LogOut size={16} />
            </button>

          </div>
        </div>
      </div>
    </header>
  );
}