import { describe, expect, it } from 'vitest'
import { formatCompactCurrency, formatCurrency, initials } from './format'

describe('formatCurrency', () => {
  it('formats exact and compact currency values', () => {
    expect(formatCurrency(1284.5)).toBe('$1,284.50')
    expect(formatCompactCurrency(1250000)).toBe('$1.3M')
  })
})

describe('initials', () => {
  it('builds stable two-letter initials from display names', () => {
    expect(initials('Maya Chen')).toBe('MC')
    expect(initials('Jordan')).toBe('J')
    expect(initials('Avery Lynn Kim')).toBe('AL')
  })
})
