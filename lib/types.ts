export type UserRole = "user" | "admin"
export type AccountStatus = "active" | "blocked" | "pending"
export type KYCStatus = "pending" | "approved" | "rejected"
export type TransactionType = "deposit" | "withdrawal" | "profit" | "bonus" | "referral" | "investment"
export type TransactionStatus = "pending" | "approved" | "rejected" | "processing"
export type TradeStatus = "open" | "closed" | "pending"
export type InvestmentStatus = "active" | "completed" | "cancelled"
export type PlanType = "basic" | "silver" | "gold" | "platinum" | "diamond"

export interface User {
  id: string
  full_name: string
  email: string
  phone_number?: string
  country: string
  currency: string
  role: UserRole
  account_status: AccountStatus
  kyc_status: KYCStatus
  balance_deposit: number
  balance_profit: number
  balance_bonus: number
  can_trade: boolean
  can_withdraw: boolean
  required_trades: number
  completed_trades: number
  withdrawal_code?: string
  current_plan: PlanType
  is_signal_provider: boolean
  is_copy_expert: boolean
  referral_code?: string
  referred_by?: string
  created_at: string
  updated_at: string
}

export interface InvestmentPlan {
  id: string
  name: string
  plan_type: PlanType
  min_amount: number
  max_amount: number
  roi_percentage: number
  duration_days: number
  description?: string
  features: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Investment {
  id: string
  user_id: string
  plan_id: string
  amount: number
  expected_return: number
  current_return: number
  status: InvestmentStatus
  start_date: string
  end_date?: string
  completed_at?: string
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  type: TransactionType
  status: TransactionStatus
  amount: number
  currency: string
  crypto_type?: string
  wallet_address?: string
  transaction_hash?: string
  admin_notes?: string
  approved_by?: string
  approved_at?: string
  created_at: string
  updated_at: string
}

export interface Trade {
  id: string
  user_id: string
  symbol: string
  trade_type: "buy" | "sell"
  amount: number
  leverage: number
  entry_price: number
  exit_price?: number
  profit_loss: number
  status: TradeStatus
  expiration?: string
  closed_at?: string
  placed_by_admin?: string
  created_at: string
  updated_at: string
}

export interface CopyExpert {
  id: string
  user_id: string
  display_name: string
  bio?: string
  total_followers: number
  success_rate: number
  total_profit: number
  is_active: boolean
  created_at: string
}

export interface SignalProvider {
  id: string
  user_id: string
  display_name: string
  description?: string
  price: number
  success_rate: number
  total_signals: number
  is_active: boolean
  created_at: string
}

export interface Notification {
  id: string
  user_id?: string
  title: string
  message: string
  type: string
  is_read: boolean
  link?: string
  created_at: string
}

export interface SupportTicket {
  id: string
  user_id: string
  subject: string
  message: string
  status: "open" | "in_progress" | "closed"
  priority: "low" | "normal" | "high" | "urgent"
  admin_response?: string
  responded_by?: string
  created_at: string
  updated_at: string
}
