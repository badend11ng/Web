import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminLogin } from '../api'
import { useAuth } from '../store/authStore'

export default function AdminLoginPage() {
  const { loginAdmin } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const r = await adminLogin(form.email, form.password)
      loginAdmin(r.data.access_token)
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка входа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
      padding: 20,
    }}>
      <div className="auth-card" style={{ maxWidth: 420 }}>
        <div style={{
          width: 64, height: 64, background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)',
          borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', fontSize: 28, color: 'white',
        }}>
          <i className="fa-solid fa-shield-halved" />
        </div>
        <h1 style={{ textAlign: 'center' }}>Панель администратора</h1>
        <p className="subtitle" style={{ textAlign: 'center' }}>Войдите для управления соревнованиями</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={submit}>
          <div className="field">
            <label>Email</label>
            <input name="email" type="email" placeholder="admin@sportreg.ru"
              value={form.email} onChange={handle} required />
          </div>
          <div className="field">
            <label>Пароль</label>
            <input name="password" type="password" placeholder="Пароль"
              value={form.password} onChange={handle} required />
          </div>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
        <div className="auth-footer">
          <a href="/" style={{ color: 'var(--gray)' }}>← Вернуться на сайт</a>
        </div>
      </div>
    </div>
  )
}
