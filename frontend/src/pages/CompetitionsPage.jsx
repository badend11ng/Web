import { useEffect, useState } from 'react'
import { getCompetitions, getTypes, getMyRegs } from '../api'
import { useAuth } from '../store/authStore'
import CompetitionCard from '../components/competitions/CompetitionCard'

export default function CompetitionsPage() {
  const { role } = useAuth()
  const [competitions, setCompetitions] = useState([])
  const [types, setTypes] = useState([])
  const [registeredIds, setRegisteredIds] = useState(new Set())
  const [filterType, setFilterType] = useState('')
  const [filterSearch, setFilterSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('active')

  useEffect(() => {
    getCompetitions().then(r => setCompetitions(r.data))
    getTypes().then(r => setTypes(r.data))
    if (role === 'user') {
      getMyRegs().then(r => setRegisteredIds(new Set(r.data.map(reg => reg.competition.id))))
    }
  }, [role])

  const handleRegistered = (id) => setRegisteredIds(prev => new Set([...prev, id]))

  const filtered = competitions.filter(c => {
    const matchStatus = c.status === filterStatus
    const matchType = !filterType || c.type_name.toLowerCase().includes(filterType.toLowerCase())
    const matchSearch = !filterSearch ||
      c.title.toLowerCase().includes(filterSearch.toLowerCase()) ||
      c.location.toLowerCase().includes(filterSearch.toLowerCase())
    return matchStatus && matchType && matchSearch
  })

  return (
    <>
      <section style={{ padding: '100px 5% 60px', background: 'linear-gradient(135deg, #F8FAFC, #E2E8F0)' }}>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, textAlign: 'center', marginBottom: 12 }}>
          Соревнования по спортивному ориентированию
        </h1>
        <p style={{ textAlign: 'center', color: 'var(--gray)', marginBottom: 36 }}>
          Первенства России · Области · Школьные лиги
        </p>

        <div style={{ maxWidth: 860, margin: '0 auto', background: 'white', borderRadius: 16, padding: '20px 24px', boxShadow: 'var(--shadow-sm)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <select className="form-input" style={{ flex: 1, minWidth: 160 }} value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">Все типы</option>
            {types.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
          </select>
          <input className="form-input" style={{ flex: 2, minWidth: 200 }} placeholder="Поиск по названию / месту"
            value={filterSearch} onChange={e => setFilterSearch(e.target.value)} />
          <button className="btn-outline" onClick={() => { setFilterType(''); setFilterSearch('') }}>
            Сбросить
          </button>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 48 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
          {['active', 'inactive'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} style={{
              padding: '10px 28px', border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: 14, color: 'white',
              background: s === 'active'
                ? (filterStatus === s ? '#059669' : '#6EE7B7')
                : (filterStatus === s ? '#DC2626' : '#FCA5A5'),
              borderRadius: s === 'active' ? '20px 0 0 20px' : '0 20px 20px 0',
              transition: '.2s',
            }}>
              {s === 'active' ? '🟢 Активные' : '🔴 Завершённые'}
            </button>
          ))}
        </div>

        <div className="comp-grid">
          {filtered.map(c => (
            <CompetitionCard
              key={c.id} comp={c}
              registeredIds={registeredIds}
              onRegistered={handleRegistered}
            />
          ))}
          {filtered.length === 0 && (
            <p style={{ color: 'var(--gray)', textAlign: 'center', gridColumn: '1/-1', padding: 40 }}>
              Соревнований не найдено
            </p>
          )}
        </div>
      </section>
    </>
  )
}
