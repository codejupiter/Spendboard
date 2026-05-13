import type { Transaction } from '../data/types'

const headers = ['date', 'merchant', 'category', 'card', 'amount', 'status', 'description', 'owner']

export function exportTransactionsCsv(transactions: Transaction[]) {
  const rows = transactions.map((transaction) =>
    headers
      .map((key) => {
        const value = transaction[key as keyof Transaction]
        return `"${String(value).replaceAll('"', '""')}"`
      })
      .join(','),
  )
  const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8' })
  const href = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = href
  link.download = 'spendboard-transactions.csv'
  link.click()
  URL.revokeObjectURL(href)
}
