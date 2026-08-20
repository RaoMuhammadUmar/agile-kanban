import React, { useState } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import BoardList from './components/BoardList.jsx';
import KanbanBoard from './components/KanbanBoard.jsx';

export default function App() {
  const { user } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [selectedBoardId, setSelectedBoardId] = useState(null);

  if (!user) {
    return authView === 'login' ? (
      <Login onSwitchToRegister={() => setAuthView('register')} />
    ) : (
      <Register onSwitchToLogin={() => setAuthView('login')} />
    );
  }

  if (!selectedBoardId) {
    return <BoardList onSelectBoard={setSelectedBoardId} />;
  }

  return (
    <KanbanBoard boardId={selectedBoardId} onBack={() => setSelectedBoardId(null)} />
  );
}
