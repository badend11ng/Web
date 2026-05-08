import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register, getRanks } from '../api'
import { useAuth } from '../store/authStore'

export default function RegisterPage() {
  const { loginUser } = useAuth()
  const navigate = useNavigate()
  const [ranks, setRanks] = useState([])
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', password: '',
    phone: '', rank_id: '', team: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => { getRanks().then(r => setRanks(r.data)) }, [])

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setErrors({}); setLoading(true)
    try {
      const payload = { ...form, rank_id: form.rank_id ? Number(form.rank_id) : null }
      const r = await register(payload)
      await loginUser(r.data.access_token)
      navigate('/cabinet', { replace: true })
    } catch (err) {
      const detail = err.response?.data?.detail
      if (typeof detail === 'string') setErrors({ _: detail })
      else if (Array.isArray(detail)) {
        const errs = {}
        detail.forEach(d => { errs[d.loc?.[1] || '_'] = d.msg })
        setErrors(errs)
      } else {
        setErrors({ _: 'Ошибка регистрации' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 560 }}>
        <h1>Регистрация</h1>
        <p className="subtitle">Заполните данные для участия в соревнованиях</p>

        {errors._ && <div className="auth-error">{errors._}</div>}

        <form onSubmit={submit}>
          <div className="form-grid-2">
            <div className="field">
              <label>Имя *</label>
              <input name="first_name" placeholder="Иван" value={form.first_name} onChange={handle} required />
              {errors.first_name && <span className="field-error">{errors.first_name}</span>}
            </div>
            <div className="field">
              <label>Фамилия *</label>
              <input name="last_name" placeholder="Иванов" value={form.last_name} onChange={handle} required />
              {errors.last_name && <span className="field-error">{errors.last_name}</span>}
            </div>
            <div className="field">
              <label>Разряд</label>
              <select name="rank_id" value={form.rank_id} onChange={handle}>
                <option value="">— не указан —</option>
                {ranks.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Команда</label>
              <input name="team" placeholder="Название команды" value={form.team} onChange={handle} />
            </div>
          </div>

          <div className="field">
            <label>Email *</label>
            <input name="email" type="email" placeholder="email@example.com"
              value={form.email} onChange={handle} required />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>
          <div className="field">
            <label>Телефон</label>
            <input name="phone" type="tel" placeholder="+7 (999) ..."
              value={form.phone} onChange={handle} />
          </div>
          <div className="field">
            <label>Пароль *</label>
            <input name="password" type="password" placeholder="Минимум 6 символов"
              value={form.password} onChange={handle} required />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Создание...' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="auth-footer">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </div>
      </div>
    </div>
  )
}
