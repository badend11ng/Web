import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './store/authStore'
import Layout from './components/common/Layout'
import HomePage from './pages/HomePage'
import CompetitionsPage from './pages/CompetitionsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CabinetPage from './pages/CabinetPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminPanelPage from './pages/AdminPanelPage'
import AdminEditPage from './pages/AdminEditPage'

function PrivateRoute({ children }) {
  const { role, loading } = useAuth()
  if (loading) return null
  return role === 'user' ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { role, loading } = useAuth()
  if (loading) return null
  return role === 'admin' ? children : <Navigate to="/admin/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/"            element={<HomePage />} />
        <Route path="/competitions" element={<CompetitionsPage />} />
        <Route path="/login"       element={<LoginPage />} />
        <Route path="/register"    element={<RegisterPage />} />
        <Route path="/cabinet"     element={<PrivateRoute><CabinetPage /></PrivateRoute>} />
      </Route>

      <Route path="/admin/login"  element={<AdminLoginPage />} />
      <Route path="/admin"        element={<AdminRoute><AdminPanelPage /></AdminRoute>} />
      <Route path="/admin/competitions/:id/edit"
                                  element={<AdminRoute><AdminEditPage /></AdminRoute>} />
    </Routes>
  )
}
