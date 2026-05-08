import api from './client'


export const login        = (email, password) => api.post('/auth/login', { email, password })
export const adminLogin   = (email, password) => api.post('/auth/admin/login', { email, password })
export const register     = (data)            => api.post('/auth/register', data)
export const getMe        = ()                => api.get('/auth/me')


export const getCompetitions  = ()   => api.get('/competitions')
export const getCompetition   = (id) => api.get(`/competitions/${id}`)
export const getTypes         = ()   => api.get('/competitions/types')
export const registerForComp  = (id) => api.post(`/competitions/${id}/register`)
export const getMyRegs        = ()   => api.get('/competitions/my/registrations')
export const cancelReg        = (id) => api.delete(`/competitions/my/registrations/${id}`)


export const getRanks = () => api.get('/users/ranks')
export const getTeams = () => api.get('/users/teams')


export const getStats           = ()          => api.get('/admin/stats')
export const adminGetComps      = ()          => api.get('/admin/competitions')
export const adminCreateComp    = (data)      => api.post('/admin/competitions', data)
export const adminUpdateComp    = (id, data)  => api.put(`/admin/competitions/${id}`, data)
export const adminDeleteComp    = (id)        => api.delete(`/admin/competitions/${id}`)
export const adminGetProtocols  = (id)        => api.get(`/admin/competitions/${id}/protocols`)
export const adminAddProtocol   = (id, data)  => api.post(`/admin/competitions/${id}/protocols`, data)
