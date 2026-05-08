import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyRegs, cancelReg } from '../api'
import { useAuth } from '../store/authStore'

export default function CabinetPage() {
  const { user } = useAuth()
  const [regs, setRegs] = useState([])
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  useEffect(() => {
    getMyRegs().then(r => setRegs(r.data)).catch(() => setErr('Ошибка загрузки регистраций'))
  }, [])

  const handleCancel = async (regId, title) => {
    if (!confirm(`Отменить регистрацию на «${title}»?`)) return
    try {
      await cancelReg(regId)
      setRegs(prev => prev.filter(r => r.reg_id !== regId))
      setMsg('Регистрация отменена')
    } catch (e) {
      setErr(e.response?.data?.detail || 'Ошибка')
    }
  }

  if (!user) return null

  return (
    <div style={{ padding: '40px 5% 80px', maxWidth: 1100, margin: '0 auto' }}>

      <div className="cabinet-plaque-wrap">
        <div className="cabinet-plaque-inner">
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 14 }}>
            {user.first_name} {user.last_name}
            {user.rank && (
              <span style={{
                marginLeft: 10, padding: '4px 14px', borderRadius: 20,
                fontSize: 14, background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)',
                color: 'white', fontWeight: 600, verticalAlign: 'middle',
              }}>
                {user.rank}
              </span>
            )}
          </h1>
          <p style={{ color: 'var(--gray)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="fa-solid fa-users" style={{ color: '#3B82F6' }} />
            {user.team || '—'}
          </p>
          <p style={{ color: 'var(--gray)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="fa-regular fa-envelope" style={{ color: '#3B82F6' }} />
            {user.email}
          </p>
          {user.phone && (
            <p style={{ color: 'var(--gray)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="fa-solid fa-phone" style={{ color: '#3B82F6' }} />
              {user.phone}
            </p>
          )}
        </div>
        <div className="cabinet-plaque-stats">
          <span className="stats-num">{regs.length}</span>
          <span className="stats-label">Регистраций на соревнования</span>
        </div>
      </div>

      <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 28, display: 'flex', alignItems: 'center', gap: 12 }}>
        <i className="fa-solid fa-flag-checkered" style={{ color: '#3B82F6', fontSize: 22 }} />
        Мои соревнования
      </h2>

      {msg && <div className="alert alert-success" style={{ marginBottom: 20 }}>{msg}</div>}
      {err && <div className="alert alert-error"   style={{ marginBottom: 20 }}>{err}</div>}

      {regs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--gray)' }}>
          <i className="fa-regular fa-calendar-xmark"
             style={{ fontSize: 52, color: '#CBD5E1', display: 'block', marginBottom: 16 }} />
          <p style={{ marginBottom: 20 }}>Вы ещё не зарегистрировались ни на одно соревнование</p>
          <Link to="/competitions" className="btn-primary" style={{ maxWidth: 260, margin: '0 auto' }}>
            Найти соревнование
          </Link>
        </div>
      ) : (
        <div className="comp-grid">
          {regs.map(reg => {
            const c = reg.competition
            return (
              <div className="card" key={reg.reg_id} style={{ position: 'relative' }}>
                <div
                  className="card-image"
                  style={{ backgroundImage: `url(${c.image_url || '/img/orient.jpg'})` }}
                >
                  <span className={`status-badge ${c.status}`}>
                    {c.status === 'active' ? '🟢 Активно' : '🔴 Завершено'}
                  </span>
                </div>
                <div className="card-body">
                  <div className="card-title">{c.title}</div>
                  <div className="card-type">{c.type_name}</div>
                  <div className="card-meta">
                    <span>📅 {c.date_start} — {c.date_end}</span>
                    <span>🗺️ {c.location}</span>
                  </div>
                  <div className="card-actions" style={{ marginTop: 14 }}>
                    {c.protocol_url
                      ? <a href={c.protocol_url} target="_blank" rel="noopener"
                           className="btn-outline" style={{ fontSize: 13 }}>
                          <i className="fa-solid fa-file-lines" /> Протокол
                        </a>
                      : <button className="btn-outline" disabled style={{ opacity: .5, fontSize: 13 }}>
                          <i className="fa-solid fa-file-lines" /> Протокол
                        </button>
                    }
                    {c.status === 'active' && (
                      <button
                        style={{ color: '#b91c1c', border: '2px solid #b91c1c', background: 'transparent', padding: '9px 18px', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
                        onClick={() => handleCancel(reg.reg_id, c.title)}
                      >
                        Отменить
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
