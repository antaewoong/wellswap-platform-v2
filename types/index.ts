export interface User {
  id: string
  email: string
  full_name?: string
  phone?: string
  avatar_url?: string
}

export interface InsurancePolicy {
  id: string
  policy_number: string
  insurance_type: string
  premium_amount: number
  sum_assured: number
  start_date: string
  end_date: string
  status: string
}

export interface AIValuation {
  policy_id: string
  estimated_value: number
  market_score: number
  risk_assessment: string
  recommendations: string[]
}
