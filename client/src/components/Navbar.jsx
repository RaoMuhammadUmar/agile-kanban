import React from 'react';
import { LayoutGrid, Search, LogOut, Plus, ArrowLeft } from 'lucide-react';
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
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              title="Back to boards"
              className="text-slate-400 hover:text-brand-600 hover:bg-brand-50 p-2 rounded-lg transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div className="bg-brand-600 text-white p-2 rounded-xl">
            <LayoutGrid size={20} />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 leading-tight">{boardTitle || 'Loading...'}</h1>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            />
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => onPriorityFilterChange(e.target.value)}
            className="border border-slate-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          >
            <option value="All">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onAddTask}
            className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
          >
            <Plus size={16} /> New Task
          </button>
          <button
            onClick={logout}
            title="Log out"
            className="flex items-center gap-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 text-sm font-medium px-3 py-2 rounded-lg transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
