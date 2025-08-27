import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_AI_SERVER_URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const aiService = {
  getValuation: async (policyData: any) => {
    const response = await api.post('/api/valuation', policyData)
    return response.data
  },
  
  getHealthCheck: async () => {
    const response = await api.get('/health')
    return response.data
  }
}

export default api
