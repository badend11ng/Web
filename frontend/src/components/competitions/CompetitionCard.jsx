import { useAuth } from '../../store/authStore'
import { registerForComp } from '../../api'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CompetitionCard({ comp, registeredIds = new Set(), onRegistered }) {
  const { role } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const isRegistered = registeredIds.has(comp.id)

  const handleRegister = async () => {
    if (role !== 'user') { navigate('/login'); return }
    setLoading(true)
    try {
      await registerForComp(comp.id)
      setMsg('✓ Вы зарегистрированы!')
      onRegistered && onRegistered(comp.id)
    } catch (e) {
      setMsg(e.response?.data?.detail || 'Ошибка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div
        className="card-image"
        style={{ backgroundImage: `url(${comp.image_url || '/placeholder.jpg'})` }}
      >
        <span className={`status-badge ${comp.status}`}>
          {comp.status === 'active' ? '🟢 Активно' : '🔴 Завершено'}
        </span>
      </div>
      <div className="card-body">
        <div className="card-title">{comp.title}</div>
        <div className="card-type">{comp.type_name}</div>
        <div className="card-meta">
          <span>📅 {comp.date_start} — {comp.date_end}</span>
          <span>🗺️ {comp.location}</span>
        </div>
        {msg && <div style={{ fontSize: 13, color: '#12733b', marginTop: 8 }}>{msg}</div>}
        <div className="card-actions" style={{ marginTop: 14 }}>
          {comp.status === 'active' && comp.can_register && (
            isRegistered
              ? <button className="btn-primary" disabled>✓ Зарегистрирован</button>
              : <button className="btn-primary" onClick={handleRegister} disabled={loading}>
                  {loading ? 'Загрузка...' : 'Зарегистрироваться'}
                </button>
          )}
          {comp.protocol_url
            ? <a href={comp.protocol_url} target="_blank" rel="noopener" className="btn-outline">
                <i className="fa-solid fa-file-lines" /> Протокол
              </a>
            : <button className="btn-outline" disabled style={{ opacity: .5 }}>
                <i className="fa-solid fa-file-lines" /> Протокол
              </button>
          }
        </div>
      </div>
    </div>
  )
}
