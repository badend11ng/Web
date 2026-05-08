import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getCompetitions } from '../api'
import { useAuth } from '../store/authStore'
import CompetitionCard from '../components/competitions/CompetitionCard'
import hero1 from '../assets/hero1.jpg'
import hero2 from '../assets/hero2.jpg'
import hero3 from '../assets/hero3.jpg'

const SLIDES = [hero1, hero2, hero3]

export default function HomePage() {
  const { role } = useAuth()
  const [current, setCurrent] = useState(0)
  const [competitions, setCompetitions] = useState([])
  const timerRef = useRef(null)

  const goTo = (idx) => {
    setCurrent((idx + SLIDES.length) % SLIDES.length)
  }

  useEffect(() => {
    timerRef.current = setInterval(() => setCurrent(c => (c + 1) % SLIDES.length), 6000)
    return () => clearInterval(timerRef.current)
  }, [])

  const handleIndicator = (idx) => {
    clearInterval(timerRef.current)
    goTo(idx)
    timerRef.current = setInterval(() => setCurrent(c => (c + 1) % SLIDES.length), 6000)
  }

  useEffect(() => {
    getCompetitions().then(r => {
      const active = r.data.filter(c => c.status === 'active').slice(0, 3)
      setCompetitions(active)
    })
  }, [])

  return (
    <>
      <section className="hero-fixed">
        <div className="hero-backgrounds">
          {SLIDES.map((src, i) => (
            <div
              key={i}
              className={`hero-bg${i === current ? ' active' : ''}`}
              style={{ backgroundImage: `url(${src})` }}
            />
          ))}
        </div>

        <div className="hero-content">
          <h1>ЗАРЕГИСТРИРУЙСЯ НА ЛУЧШИЕ СОРЕВНОВАНИЯ</h1>
          <p>Онлайн-регистрация · Протоколы старта · Быстрые уведомления</p>
          <Link to="/competitions" className="cta-btn">Выбрать соревнование</Link>
        </div>

        <div className="hero-indicators">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              className={`hero-indicator${i === current ? ' active' : ''}`}
              onClick={() => handleIndicator(i)}
            />
          ))}
        </div>

        <button className="hero-prev" onClick={() => { clearInterval(timerRef.current); goTo(current - 1) }}>❮</button>
        <button className="hero-next" onClick={() => { clearInterval(timerRef.current); goTo(current + 1) }}>❯</button>
      </section>

      <section className="events" id="events">
        <h2 className="section-title">Ближайшие соревнования</h2>
        <div className="comp-grid">
          {competitions.map(c => <CompetitionCard key={c.id} comp={c} />)}
          {competitions.length === 0 && (
            <p style={{ color: 'var(--gray)', textAlign: 'center', gridColumn: '1/-1' }}>
              Нет ближайших соревнований
            </p>
          )}
        </div>
        <div className="section-cta">
          <Link to="/competitions" className="btn-large">Посмотреть все соревнования</Link>
        </div>
      </section>
    </>
  )
}
