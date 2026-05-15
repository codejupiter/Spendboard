import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatCurrency } from '../lib/format'

export type SpendOverTimePoint = {
  month: string
  spend: number
}

export type SpendByCategoryPoint = {
  category: string
  spend: number
}

type SpendChartsProps = {
  spendOverTime: SpendOverTimePoint[]
  spendByCategory: SpendByCategoryPoint[]
  onCategorySelect: (category: string) => void
}

export default function SpendCharts({ spendOverTime, spendByCategory, onCategorySelect }: SpendChartsProps) {
  return (
    <section className="chart-row" aria-label="Spend charts">
      <div className="chart-panel">
        <div className="panel-title">Spend over time</div>
        <ResponsiveContainer width="100%" height={112}>
          <AreaChart data={spendOverTime} margin={{ top: 12, right: 12, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="spend-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.28} />
                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border-soft)" vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} interval={1} />
            <YAxis hide domain={['dataMin', 'dataMax']} />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Area
              type="monotone"
              dataKey="spend"
              stroke="var(--accent)"
              fill="url(#spend-fill)"
              strokeWidth={2}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-panel">
        <div className="panel-title">Spend by category</div>
        <ResponsiveContainer width="100%" height={112}>
          <BarChart data={spendByCategory} margin={{ top: 12, right: 0, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="var(--border-soft)" vertical={false} />
            <XAxis dataKey="category" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis hide />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Bar
              dataKey="spend"
              fill="var(--accent)"
              radius={[3, 3, 0, 0]}
              isAnimationActive={false}
              onClick={(data) => {
                const category = data?.payload?.category
                if (typeof category === 'string') onCategorySelect(category)
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
