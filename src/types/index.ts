export type Role = 'SC' | 'CD' | 'PM' | 'BO'

export type Stage =
  | '新規接触'
  | '有効会話'
  | 'アポ獲得'
  | '一次商談'
  | 'MQL'
  | 'SQL'
  | '本提案'
  | '契約'
  | '失注'

export interface Client {
  id: string
  name: string
  industry?: string
  website?: string
  phone?: string
  address?: string
  status?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Member {
  id: string
  name: string
  role: Role
  email?: string
  is_active: boolean
  created_at: string
}

export interface Deal {
  id: string
  client_id?: string
  title: string
  stage: Stage
  amount?: number
  probability?: number
  channels?: string
  sc_id?: string
  cd_id?: string
  pm_id?: string
  bo_id?: string
  expected_close_date?: string
  actual_close_date?: string
  description?: string
  created_at: string
  updated_at: string
  // joined
  client?: Client
  sc?: Member
  cd?: Member
  pm?: Member
  bo?: Member
}

export interface Contact {
  id: string
  client_id?: string
  name: string
  title?: string
  email?: string
  phone?: string
  is_primary: boolean
  notes?: string
  created_at: string
  updated_at: string
  client?: Client
}

export interface Activity {
  id: string
  deal_id?: string
  client_id?: string
  member_id?: string
  type?: string
  subject: string
  body?: string
  activity_date?: string
  created_at: string
  member?: Member
  deal?: Deal
  client?: Client
}

export interface Task {
  id: string
  deal_id?: string
  client_id?: string
  assignee_id?: string
  title: string
  due_date?: string
  status: string
  priority: string
  notes?: string
  created_at: string
  updated_at: string
  assignee?: Member
  client?: Client
}

export interface Performance {
  id: string
  member_id: string
  date: string
  new_contact: number
  valid_conversation: number
  appointment: number
  first_meeting: number
  hearing: number
  mql: number
  sql: number
  proposal: number
  contracts: number
  mrr: number
  contract_clients?: string
  created_at: string
  updated_at: string
  member?: Member
}

export const STAGES: Stage[] = [
  '新規接触', '有効会話', 'アポ獲得', '一次商談',
  'MQL', 'SQL', '本提案', '契約', '失注'
]

export const STAGE_COLORS: Record<Stage, { bg: string; text: string; bar: string }> = {
  '新規接触': { bg: 'rgba(26,26,26,0.07)',   text: '#4a4a4a', bar: '#4a4a4a' },
  '有効会話': { bg: 'rgba(80,0,10,0.08)',    text: '#6b0010', bar: '#8b0015' },
  'アポ獲得': { bg: 'rgba(140,0,20,0.09)',   text: '#8c0014', bar: '#b0001a' },
  '一次商談': { bg: 'rgba(180,0,22,0.10)',   text: '#b00016', bar: '#d00020' },
  'MQL':      { bg: 'rgba(210,0,24,0.10)',   text: '#c0001a', bar: '#d8001c' },
  'SQL':      { bg: 'rgba(232,0,28,0.11)',   text: '#c0001a', bar: '#e8001c' },
  '本提案':   { bg: 'rgba(232,0,28,0.11)',   text: '#c0001a', bar: '#e8001c' },
  '契約':     { bg: 'rgba(232,0,28,0.12)',   text: '#c0001a', bar: '#e8001c' },
  '失注':     { bg: 'rgba(180,180,180,0.10)', text: '#9a9a9a', bar: '#d0d0d0' },
}

export const PERF_METRICS = [
  { key: 'new_contact',        label: '新規接触数',  isMrr: false },
  { key: 'valid_conversation', label: '有効会話数',  isMrr: false },
  { key: 'appointment',        label: 'アポ獲得数',  isMrr: false },
  { key: 'first_meeting',      label: '一次商談数',  isMrr: false },
  { key: 'hearing',            label: 'ヒアリング数', isMrr: false },
  { key: 'mql',                label: 'MQL企業数',  isMrr: false },
  { key: 'sql',                label: 'SQL企業数',  isMrr: false },
  { key: 'proposal',           label: '本提案数',   isMrr: false },
  { key: 'contracts',          label: '契約企業数',  isMrr: false },
  { key: 'mrr',                label: '契約MRR',   isMrr: true  },
] as const
