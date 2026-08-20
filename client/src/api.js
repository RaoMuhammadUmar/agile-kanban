const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('kanban_token');
}

// Core request helper: attaches the JWT (if present), parses JSON, and turns
// non-2xx responses into thrown Errors carrying the server's error message.
async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw new Error('Could not reach the server. Check your connection and try again.');
  }

  // Session expired or invalid token — clear local auth state so the UI
  // falls back to the login screen instead of looping on failed requests.
  if (response.status === 401 && auth) {
    localStorage.removeItem('kanban_token');
    localStorage.removeItem('kanban_user');
  }

  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const message = data?.error || `Request failed with status ${response.status}.`;
    throw new Error(message);
  }

  return data;
}

export const api = {
  // ---------- Auth ----------
  register(email, password) {
    return request('/auth/register', { method: 'POST', body: { email, password }, auth: false });
  },
  login(email, password) {
    return request('/auth/login', { method: 'POST', body: { email, password }, auth: false });
  },
  me() {
    return request('/auth/me');
  },

  // ---------- Boards ----------
  getBoards() {
    return request('/boards');
  },
  createBoard(title) {
    return request('/boards', { method: 'POST', body: { title } });
  },
  getBoardFull(boardId) {
    return request(`/boards/${boardId}/full`);
  },
  deleteBoard(boardId) {
    return request(`/boards/${boardId}`, { method: 'DELETE' });
  },

  // ---------- Columns ----------
  createColumn(boardId, title) {
    return request('/columns', { method: 'POST', body: { boardId, title } });
  },
  renameColumn(columnId, title) {
    return request(`/columns/${columnId}`, { method: 'PUT', body: { title } });
  },
  deleteColumn(columnId) {
    return request(`/columns/${columnId}`, { method: 'DELETE' });
  },

  // ---------- Tasks ----------
  createTask(columnId, title, description, priority) {
    return request('/tasks', { method: 'POST', body: { columnId, title, description, priority } });
  },
  updateTask(taskId, updates) {
    return request(`/tasks/${taskId}`, { method: 'PUT', body: updates });
  },
  deleteTask(taskId) {
    return request(`/tasks/${taskId}`, { method: 'DELETE' });
  },
  // `columns` is an array of { columnId, taskIds } — see server/routes/tasks.js
  // for the exact contract. This wraps it in the { columns } envelope the
  // reorder endpoint expects.
  reorderTasks(columns) {
    return request('/tasks/reorder', { method: 'POST', body: { columns } });
  },
};
