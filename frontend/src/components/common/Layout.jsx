import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../store/authStore'
import logo from '../../assets/logo.png'
import vk from '../../assets/vk.png'
import tg from '../../assets/tg.png'

export default function Layout() {
  const { user, role, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header className="header">
        <NavLink to="/" className="logo-container">
          <img src={logo} alt="SportReg" className="logo-img" />
          <span className="logo-text">SportReg</span>
        </NavLink>

        <nav className="header-nav">
          <NavLink to="/" end>Главная</NavLink>
          <NavLink to="/competitions">Соревнования</NavLink>
          {role === 'user' && <NavLink to="/cabinet">Личный кабинет</NavLink>}

          <div className="social">
            <a href="https://vk.com" target="_blank" rel="noopener">
              <img src={vk} alt="VK" className="social-icon-img" />
            </a>
            <a href="https://t.me" target="_blank" rel="noopener">
              <img src={tg} alt="Telegram" className="social-icon-img" />
            </a>
          </div>

          <span className="phone-nav">+7 (999) 123-45-67</span>

          {role === 'user'
            ? <button className="btn-login" onClick={handleLogout}>Выйти</button>
            : role === 'admin'
              ? <button className="btn-login" onClick={handleLogout}>Выйти</button>
              : <NavLink to="/login" className="btn-login">Войти</NavLink>
          }
        </nav>
      </header>

      <main style={{ flex: 1, marginTop: 72 }}>
        <Outlet />
      </main>

      <footer className="footer">
        <div>
          <div className="footer-logo">SportReg</div>
          <div className="footer-org">Спортивная организация "SportReg"</div>
          <div className="footer-rights">Все права защищены © 2026</div>
        </div>
        <div className="footer-contacts">
          <div className="social-footer">
            <div className="social">
              <a href="https://vk.com" target="_blank" rel="noopener">
                <img src={vk} alt="VK" className="social-icon-img" />
              </a>
              <a href="https://t.me" target="_blank" rel="noopener">
                <img src={tg} alt="Telegram" className="social-icon-img" />
              </a>
            </div>
          </div>
          <div className="phone">+7 (999) 123-45-67</div>
          <div className="email">info@sportreg.ru</div>
        </div>
      </footer>
    </div>
  )
}
