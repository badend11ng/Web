import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCompetition, getTypes, adminUpdateComp, adminGetProtocols, adminAddProtocol } from '../api'
import { useAuth } from '../store/authStore'

export default function AdminEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [types, setTypes] = useState([])
  const [protocols, setProtocols] = useState([])
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState(null)
  const [protoForm, setProtoForm] = useState({ title: '', file_url: '' })

  useEffect(() => {
    getCompetition(id).then(r => {
      const c = r.data
      setForm({
        title: c.title, date_start: c.date_start, date_end: c.date_end,
        registration_deadline: c.registration_deadline,
        location: c.location, type_id: String(c.type_id ?? ''),
        image_url: c.image_url || '',
      })
    })
    getTypes().then(r => setTypes(r.data))
    adminGetProtocols(id).then(r => setProtocols(r.data))
  }, [id])

  const fh = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const ph = e => setProtoForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSave = async e => {
    e.preventDefault()
    try {
      await adminUpdateComp(id, { ...form, type_id: Number(form.type_id), image_url: form.image_url || null })
      setMsg('Изменения сохранены')
    } catch (err) { setMsg(err.response?.data?.detail || 'Ошибка') }
  }

  const handleAddProtocol = async e => {
    e.preventDefault()
    try {
      const r = await adminAddProtocol(id, protoForm)
      setProtocols(prev => [...prev, r.data])
      setProtoForm({ title: '', file_url: '' })
      setMsg('Протокол добавлен')
    } catch (err) { setMsg(err.response?.data?.detail || 'Ошибка') }
  }

  const handleLogout = () => { logout(); navigate('/admin/login') }

  if (!form) return <div style={{ padding: 60, textAlign: 'center' }}>Загрузка...</div>

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">Sport<span>Reg</span> Admin</div>
        <nav className="sidebar-nav">
          <span className="sidebar-link" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin')}>
            <i className="fa-solid fa-arrow-left" /> Назад к списку
          </span>
          <a href="/" className="sidebar-link" target="_blank"><i className="fa-solid fa-globe" /> Открыть сайт</a>
        </nav>
        <button className="sidebar-logout" onClick={handleLogout}>
          <i className="fa-solid fa-right-from-bracket" /> Выйти
        </button>
      </aside>

      <main className="admin-main">
        <div className="page-header">
          <h1>{form.title}</h1>
          <p>Редактирование соревнования #{id}</p>
        </div>

        {msg && <div className="alert alert-success">{msg}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div className="admin-card">
            <div className="admin-card-title"><i className="fa-solid fa-pen" /> Основные данные</div>
            <form onSubmit={handleSave}>
              <div className="form-grid">
                <div className="form-group full">
                  <label>Название *</label>
                  <input className="form-input" name="title" value={form.title} onChange={fh} required />
                </div>
                <div className="form-group">
                  <label>Дата начала *</label>
                  <input className="form-input" name="date_start" type="date" value={form.date_start} onChange={fh} required />
                </div>
                <div className="form-group">
                  <label>Дата окончания *</label>
                  <input className="form-input" name="date_end" type="date" value={form.date_end} onChange={fh} required />
                </div>
                <div className="form-group">
                  <label>Дедлайн регистрации *</label>
                  <input className="form-input" name="registration_deadline" type="date" value={form.registration_deadline} onChange={fh} required />
                </div>
                <div className="form-group">
                  <label>Тип *</label>
                  <select className="form-input" name="type_id" value={form.type_id} onChange={fh} required>
                    {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="form-group full">
                  <label>Место проведения *</label>
                  <input className="form-input" name="location" value={form.location} onChange={fh} required />
                </div>
                <div className="form-group full">
                  <label>URL изображения</label>
                  <input className="form-input" name="image_url" type="url" value={form.image_url} onChange={fh} placeholder="https://..." />
                </div>
              </div>
              <div style={{ marginTop: 20 }}>
                <button type="submit" className="btn-primary">
                  <i className="fa-solid fa-floppy-disk" /> Сохранить изменения
                </button>
              </div>
            </form>
          </div>

          <div className="admin-card">
            <div className="admin-card-title"><i className="fa-solid fa-file-lines" /> Протоколы</div>

            {protocols.length === 0
              ? <p style={{ color: 'var(--gray)', textAlign: 'center', padding: '20px 0' }}>Протоколы ещё не добавлены</p>
              : <ul style={{ listStyle: 'none', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {protocols.map(p => (
                    <li key={p.id} style={{ padding: '12px 16px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                      <a href={p.file_url} target="_blank" rel="noopener" style={{ color: '#3B82F6', fontWeight: 500, fontSize: 14 }}>
                        <i className="fa-solid fa-file-pdf" style={{ marginRight: 6 }} />{p.title}
                      </a>
                      <div style={{ fontSize: 12, color: 'var(--gray)', marginTop: 2 }}>
                        {new Date(p.published_at).toLocaleString('ru')}
                      </div>
                    </li>
                  ))}
                </ul>
            }

            <form onSubmit={handleAddProtocol}>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label>Название протокола *</label>
                <input className="form-input" name="title" placeholder="Протокол старта" value={protoForm.title} onChange={ph} required />
              </div>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label>URL файла *</label>
                <input className="form-input" name="file_url" type="url" placeholder="https://..." value={protoForm.file_url} onChange={ph} required />
              </div>
              <button type="submit" className="btn-primary">
                <i className="fa-solid fa-plus" /> Добавить протокол
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
