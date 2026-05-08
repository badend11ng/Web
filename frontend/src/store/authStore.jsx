import { useState, useEffect, createContext, useContext } from 'react'
import { getMe } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null)
  const [role, setRole]     = useState(localStorage.getItem('role'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token && role === 'user') {
      getMe()
        .then(r => setUser(r.data))
        .catch(() => logout())
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const loginUser = (token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('role', 'user')
    setRole('user')
    return getMe().then(r => setUser(r.data))
  }

  const loginAdmin = (token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('role', 'admin')
    setRole('admin')
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    setUser(null)
    setRole(null)
  }

  return (
    <AuthContext.Provider value={{ user, role, loading, loginUser, loginAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
