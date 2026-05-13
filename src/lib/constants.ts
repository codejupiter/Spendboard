import type { Filters, TransactionStatus } from '../data/types'

export const emptyFilters: Filters = {
  search: '',
  datePreset: 'all',
  categories: [],
  cards: [],
  statuses: [],
  minAmount: '',
  maxAmount: '',
}

export const statuses: TransactionStatus[] = ['Cleared', 'Pending', 'Flagged', 'Declined']

export const statusTone: Record<TransactionStatus, string> = {
  Cleared: 'success',
  Pending: 'warning',
  Flagged: 'danger',
  Declined: 'neutral',
}
