import axios from 'axios'
import { config } from './config'

const api = axios.create({
  baseURL: config.NEXT_PUBLIC_AI_SERVER_URL,
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
