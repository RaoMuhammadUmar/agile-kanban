import React, { useState, useEffect } from 'react';
import { LayoutGrid, Plus, Trash2, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';

export default function BoardList({ onSelectBoard }) {
  const { user, logout } = useAuth();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadBoards();
  }, []);

  async function loadBoards() {
    try {
      setLoading(true);
      const data = await api.getBoards();
      setBoards(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      setCreating(true);
      const board = await api.createBoard(newTitle.trim());
      setNewTitle('');
      setShowCreate(false);
      onSelectBoard(board.id);
    } catch (err) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(e, boardId) {
    e.stopPropagation();
    if (!confirm('Delete this board and everything on it? This cannot be undone.')) return;
    try {
      await api.deleteBoard(boardId);
      setBoards((prev) => prev.filter((b) => b.id !== boardId));
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-brand-600 text-white p-2 rounded-xl">
              <LayoutGrid size={20} />
            </div>
            <div>
              <h1 className="font-bold text-slate-800 leading-tight">Your Boards</h1>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 text-sm font-medium px-3 py-2 rounded-lg transition-colors"
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-slate-500 text-sm">Loading boards...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {boards.map((board) => (
              <button
                key={board.id}
                onClick={() => onSelectBoard(board.id)}
                className="group text-left bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md hover:border-brand-300 transition-all relative"
              >
                <h3 className="font-semibold text-slate-800 mb-1 pr-6">{board.title}</h3>
                <p className="text-xs text-slate-400">
                  Created {new Date(board.created_at).toLocaleDateString()}
                </p>
                <span
                  onClick={(e) => handleDelete(e, board.id)}
                  title="Delete board"
                  className="absolute top-4 right-4 text-slate-300 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
                >
                  <Trash2 size={16} />
                </span>
              </button>
            ))}

            {showCreate ? (
              <form
                onSubmit={handleCreate}
                className="bg-white border-2 border-brand-300 rounded-xl p-5 space-y-2"
              >
                <input
                  autoFocus
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Board name..."
                  className="w-full text-sm px-2 py-1.5 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <div className="flex gap-1.5">
                  <button
                    type="submit"
                    disabled={creating}
                    className="text-xs bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white px-2.5 py-1.5 rounded-md"
                  >
                    {creating ? 'Creating...' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="text-xs text-slate-500 hover:text-slate-700 px-2.5 py-1.5"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowCreate(true)}
                className="flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:text-brand-600 border-2 border-dashed border-slate-200 hover:border-brand-300 rounded-xl p-5 min-h-[92px] transition-colors"
              >
                <Plus size={20} />
                <span className="text-sm font-medium">New board</span>
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
