import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

const API_URL = 'http://localhost:8080'

type TaskStatus = 'todo' | 'in_progress' | 'done'

interface Task {
  id: number
  title: string
  description: string
  status: TaskStatus
}

interface TaskFormData {
  title: string
  description: string
}

const columns: { status: TaskStatus; title: string }[] = [
  { status: 'todo', title: 'A Fazer' },
  { status: 'in_progress', title: 'Em Progresso' },
  { status: 'done', title: 'Concluídas' },
]

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [saving, setSaving] = useState(false)

  async function loadTasks() {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(`${API_URL}/tasks`)

      if (!response.ok) {
        throw new Error('Não foi possível carregar as tarefas.')
      }

      const data: Task[] = await response.json()
      setTasks(data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao conectar com o servidor.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()
  }, [])

  async function createTask(data: TaskFormData) {
    try {
      setSaving(true)
      setError('')

      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          status: 'todo',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || 'Não foi possível criar a tarefa.')
      }

      const newTask: Task = await response.json()

      setTasks((current) => [...current, newTask])
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar tarefa.')
    } finally {
      setSaving(false)
    }
  }

  async function updateTask(
    id: number,
    data: TaskFormData,
    status: TaskStatus,
  ) {
    try {
      setSaving(true)
      setError('')

      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          status,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(
          errorData?.error || 'Não foi possível atualizar a tarefa.',
        )
      }

      const updatedTask: Task = await response.json()

      setTasks((current) =>
        current.map((task) =>
          task.id === updatedTask.id ? updatedTask : task,
        ),
      )

      setEditingTask(null)
      setShowForm(false)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao atualizar tarefa.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function deleteTask(id: number) {
    if (!window.confirm('Deseja realmente excluir esta tarefa?')) {
      return
    }

    try {
      setError('')

      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || 'Não foi possível excluir a tarefa.')
      }

      setTasks((current) => current.filter((task) => task.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir tarefa.')
    }
  }

  async function moveTask(task: Task, newStatus: TaskStatus) {
    try {
      setError('')

      const response = await fetch(`${API_URL}/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          status: newStatus,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || 'Não foi possível mover a tarefa.')
      }

      const updatedTask: Task = await response.json()

      setTasks((current) =>
        current.map((item) =>
          item.id === updatedTask.id ? updatedTask : item,
        ),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao mover tarefa.')
    }
  }

  function openNewTask() {
    setEditingTask(null)
    setShowForm(true)
  }

  function openEdit(task: Task) {
    setEditingTask(task)
    setShowForm(true)
  }

  function closeModal() {
    if (!saving) {
      setShowForm(false)
      setEditingTask(null)
    }
  }

  return (
    <main className="app">
      <header className="page-header">
        <div>
          <h1>Tarefas</h1>
          <p>Quadro de atividades</p>
        </div>

        <button className="primary-button" onClick={openNewTask}>
          + Nova tarefa
        </button>
      </header>

      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button onClick={() => setError('')}>Fechar</button>
        </div>
      )}

      {loading ? (
        <div className="loading">
          <div className="spinner" />
          <span>Carregando tarefas...</span>
        </div>
      ) : (
        <section className="kanban">
          {columns.map((column) => {
            const columnTasks = tasks.filter(
              (task) => task.status === column.status,
            )

            return (
              <section
                className={`column column-${column.status}`}
                key={column.status}
              >
                <header className="column-header">
                  <div>
                    <span className="column-indicator" />
                    <h2>{column.title}</h2>
                  </div>

                  <span className="task-count">{columnTasks.length}</span>
                </header>

                <div className="task-list">
                  {columnTasks.length === 0 ? (
                    <div className="empty-column">
                      Nenhuma tarefa
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <article className="task-card" key={task.id}>
                        <div className="task-card-header">
                          <span className="task-id">#{task.id}</span>

                          <div className="card-actions">
                            <button
                              title="Editar"
                              onClick={() => openEdit(task)}
                            >
                              Editar
                            </button>

                            <button
                              className="delete-button"
                              title="Excluir"
                              onClick={() => deleteTask(task.id)}
                            >
                              Excluir
                            </button>
                          </div>
                        </div>

                        <h3>{task.title}</h3>

                        {task.description && (
                          <p className="task-description">
                            {task.description}
                          </p>
                        )}

                        <div className="task-footer">
                          {task.status === 'in_progress' && (
                            <button onClick={() => moveTask(task, 'todo')}>
                              ← Voltar
                            </button>
                          )}

                          {task.status === 'done' && (
                            <button
                              onClick={() => moveTask(task, 'in_progress')}
                            >
                              ← Voltar
                            </button>
                          )}

                          {task.status === 'todo' && (
                            <button
                              onClick={() => moveTask(task, 'in_progress')}
                            >
                              Avançar →
                            </button>
                          )}

                          {task.status === 'in_progress' && (
                            <button
                              onClick={() => moveTask(task, 'done')}
                            >
                              Concluir
                            </button>
                          )}

                          {task.status === 'done' && <span>Concluída</span>}
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </section>
            )
          })}
        </section>
      )}

      {showForm && (
        <TaskModal
          task={editingTask}
          saving={saving}
          onClose={closeModal}
          onCreate={createTask}
          onUpdate={updateTask}
        />
      )}
    </main>
  )
}

interface TaskModalProps {
  task: Task | null
  saving: boolean
  onClose: () => void
  onCreate: (data: TaskFormData) => Promise<void>
  onUpdate: (
    id: number,
    data: TaskFormData,
    status: TaskStatus,
  ) => Promise<void>
}

function TaskModal({
  task,
  saving,
  onClose,
  onCreate,
  onUpdate,
}: TaskModalProps) {
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [formError, setFormError] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!title.trim()) {
      setFormError('O título é obrigatório.')
      return
    }

    const data = {
      title: title.trim(),
      description: description.trim(),
    }

    setFormError('')

    if (task) {
      onUpdate(task.id, data, task.status)
    } else {
      onCreate(data)
    }
  }

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <div>
            <span>{task ? 'EDITAR' : 'NOVA TAREFA'}</span>
            <h2>{task ? 'Editar tarefa' : 'Nova tarefa'}</h2>
          </div>

          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <label htmlFor="title">Título *</label>

          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título da tarefa"
            autoFocus
          />

          <label htmlFor="description">Descrição</label>

          <textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrição opcional"
          />

          {formError && <div className="form-error">{formError}</div>}

          <footer className="modal-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
            >
              Cancelar
            </button>

            <button className="primary-button" disabled={saving}>
              {saving
                ? 'Salvando...'
                : task
                  ? 'Salvar alterações'
                  : 'Criar tarefa'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}

export default App