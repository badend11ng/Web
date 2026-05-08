import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getStats, adminGetComps, adminDeleteComp, adminCreateComp, getTypes } from '../api'
import { useAuth } from '../store/authStore'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function AdminPanelPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [competitions, setCompetitions] = useState([])
  const [types, setTypes] = useState([])
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({
    title: '', date_start: '', date_end: '',
    registration_deadline: '', location: '', type_id: '', image_url: '',
  })

  const load = () => {
    getStats().then(r => setStats(r.data))
    adminGetComps().then(r => setCompetitions(r.data))
    getTypes().then(r => setTypes(r.data))
  }

  useEffect(() => { load() }, [])

  const handleLogout = () => { logout(); navigate('/admin/login') }

  const handleDelete = async (id, title) => {
    if (!confirm(`Удалить «${title}»?`)) return
    try {
      await adminDeleteComp(id)
      setMsg('Соревнование удалено')
      load()
    } catch (e) { setMsg(e.response?.data?.detail || 'Ошибка') }
  }

  const handleCreate = async e => {
    e.preventDefault()
    try {
      const payload = {
        ...form,
        type_id: Number(form.type_id),
        image_url: form.image_url || null,
      }
      await adminCreateComp(payload)
      setMsg('Соревнование создано')
      setForm({ title: '', date_start: '', date_end: '', registration_deadline: '', location: '', type_id: '', image_url: '' })
      load()
    } catch (e) { setMsg(e.response?.data?.detail || JSON.stringify(e.response?.data) || 'Ошибка') }
  }

  const fh = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">Sport<span>Reg</span> Admin</div>
        <div className="sidebar-admin">Администратор</div>
        <nav className="sidebar-nav">
          <span className="sidebar-link active"><i className="fa-solid fa-trophy" /> Соревнования</span>
          <a href="/" className="sidebar-link" target="_blank"><i className="fa-solid fa-globe" /> Открыть сайт</a>
        </nav>
        <button className="sidebar-logout" onClick={handleLogout}>
          <i className="fa-solid fa-right-from-bracket" /> Выйти
        </button>
      </aside>

      <main className="admin-main">
        <div className="page-header">
          <h1>Управление соревнованиями</h1>
          <p>Создание, редактирование и удаление</p>
        </div>

        {msg && <div className="alert alert-success">{msg}</div>}

        {stats && (
          <>
            <div className="stats-grid">
              {[
                { num: stats.total_competitions,  label: 'Всего соревнований' },
                { num: stats.active_competitions, label: 'Активных' },
                { num: stats.total_users,         label: 'Пользователей' },
                { num: stats.total_registrations, label: 'Регистраций' },
              ].map(s => (
                <div className="stat-card" key={s.label}>
                  <div className="stat-num">{s.num}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            {stats.registrations_by_type?.length > 0 && (
              <div className="admin-card">
                <div className="admin-card-title"><i className="fa-solid fa-chart-bar" /> Регистрации по типам</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats.registrations_by_type}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3B82F6" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}

        <div className="admin-card">
          <div className="admin-card-title"><i className="fa-solid fa-plus" /> Новое соревнование</div>
          <form onSubmit={handleCreate}>
            <div className="form-grid">
              <div className="form-group full">
                <label>Название *</label>
                <input className="form-input" name="title" placeholder="Чемпионат области" value={form.title} onChange={fh} required />
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
                  <option value="">— выберите —</option>
                  {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="form-group full">
                <label>Место проведения *</label>
                <input className="form-input" name="location" placeholder="г. Москва, Лесной парк" value={form.location} onChange={fh} required />
              </div>
              <div className="form-group full">
                <label>URL изображения</label>
                <input className="form-input" name="image_url" type="url" placeholder="https://..." value={form.image_url} onChange={fh} />
              </div>
            </div>
            <div style={{ marginTop: 20 }}>
              <button type="submit" className="btn-primary">
                <i className="fa-solid fa-plus" /> Создать соревнование
              </button>
            </div>
          </form>
        </div>

        <div className="admin-card">
          <div className="admin-card-title"><i className="fa-solid fa-list" /> Все соревнования ({competitions.length})</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Название</th><th>Тип</th><th>Даты</th><th>Место</th><th>Статус</th><th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {competitions.map(c => (
                  <tr key={c.id}>
                    <td style={{ color: 'var(--gray)' }}>{c.id}</td>
                    <td><strong>{c.title}</strong></td>
                    <td>{c.type_name}</td>
                    <td style={{ fontSize: 13, color: 'var(--gray)', whiteSpace: 'nowrap' }}>
                      {c.date_start}<br />{c.date_end}
                    </td>
                    <td style={{ fontSize: 13 }}>{c.location}</td>
                    <td>
                      <span style={{
                        padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                        background: c.status === 'active' ? '#D1FAE5' : '#FEE2E2',
                        color: c.status === 'active' ? '#065F46' : '#991B1B',
                      }}>
                        {c.status === 'active' ? '🟢 Активно' : '🔴 Завершено'}
                      </span>
                    </td>
                    <td>
                      <div className="tbl-actions">
                        <Link to={`/admin/competitions/${c.id}/edit`} className="btn-outline" style={{ fontSize: 13, padding: '6px 14px' }}>
                          <i className="fa-solid fa-pen" /> Изменить
                        </Link>
                        <button className="btn-danger" style={{ fontSize: 13, padding: '6px 12px' }}
                          onClick={() => handleDelete(c.id, c.title)}>
                          <i className="fa-solid fa-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {competitions.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--gray)' }}>Соревнований пока нет</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
