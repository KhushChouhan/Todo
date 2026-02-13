import { useEffect, useState, useMemo } from 'react'
import API from '../components/API'

const TodoApp = () => {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState({ title: '', description: '' })

  const fetchTodos = async () => {
    try {
      const res = await API.get('/todos')
      setTodos(res.data.data)
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTodos() }, [])

  // Advanced Feature: Filtered Search
  const filteredTodos = useMemo(() => {
    return todos.filter(t =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [todos, searchQuery])

  const handleAddTodo = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    // Optimistic Update: Add to UI immediately
    const tempId = Date.now().toString()
    const newTodo = { ...formData, _id: tempId, createdAt: new Date(), sync: false }
    setTodos([newTodo, ...todos])
    setFormData({ title: '', description: '' })

    try {
      await API.post('/createTodo', formData)
      fetchTodos() // Sync with server
    } catch (err) {
      setTodos(todos.filter(t => t._id !== tempId)) // Rollback on error
      alert("Failed to save todo.")
    }
  }

  const handleDelete = async (id) => {
    // Optimistic Update: Remove from UI immediately
    setTodos(todos.filter(t => t._id !== id))
    try {
      await API.delete(`/deleteTodo/${id}`)
    } catch (err) {
      fetchTodos() // Revert UI if delete fails
    }
  }

  return (
    <div className="app-wrapper">
      <header className="header">
        <h1>Task Manager</h1>
        <p>{todos.length} items remaining</p>
      </header>

      <div className="main-content">
        {/* Search Bar */}
        <input
          className="search-input"
          placeholder="🔍 Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Input Form */}
        <form onSubmit={handleAddTodo} className="todo-form">
          <input
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            placeholder="What needs to be done?"
            className="main-input"
            required
          />
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Add a description..."
            rows="2"
          />
          <button type="submit" className="add-btn">Add Task</button>
        </form>

        {/* List Section */}
        <div className="todo-list">
          {loading ? (
            <div className="skeleton">Loading tasks...</div>
          ) : filteredTodos.length > 0 ? (
            filteredTodos.map((todo) => (
              <div key={todo._id} className="todo-card">
                <div className="card-content">
                  <h3>{todo.title}</h3>
                  <p>{todo.description}</p>
                  <span>{new Date(todo.createdAt).toLocaleDateString()}</span>
                </div>
                <button className="del-btn" onClick={() => handleDelete(todo._id)}>
                  Delete
                </button>
              </div>
            ))
          ) : (
            <div className="empty-state">No tasks found. Relax! ☕</div>
          )}
        </div>
      </div>

      <style>{`
        .app-wrapper {
          max-width: 600px;
          margin: 40px auto;
          font-family: 'Inter', sans-serif;
          color: #1a1a1a;
          padding: 20px;
        }
        .header h1 { font-size: 2.5rem; font-weight: 800; margin-bottom: 0; }
        .header p { color: #666; margin-top: 5px; }

        .search-input {
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid #e0e0e0;
          margin-bottom: 20px;
          background: #f9f9f9;
        }

        .todo-form {
          background: #ffffff;
          padding: 20px;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 30px;
        }

        .todo-form input, .todo-form textarea {
          border: none;
          padding: 10px;
          background: #f5f5f5;
          border-radius: 8px;
          font-size: 1rem;
        }

        .add-btn {
          background: #000;
          color: white;
          padding: 12px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
        }

        .todo-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: white;
          border-radius: 12px;
          margin-bottom: 12px;
          border: 1px solid #eee;
          transition: transform 0.2s;
        }

        .todo-card:hover { transform: translateY(-2px); }
        .card-content h3 { margin: 0; font-size: 1.1rem; }
        .card-content p { margin: 4px 0; color: #555; font-size: 0.9rem; }
        .card-content span { font-size: 0.75rem; color: #aaa; }

        .del-btn {
          background: #fee2e2;
          color: #ef4444;
          border: none;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 0.8rem;
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}

export default TodoApp
