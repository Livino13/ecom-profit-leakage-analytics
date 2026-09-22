import { useState, useRef, useEffect } from 'react'
import {
  LineChart, Line, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, ReferenceLine, LabelList,
  AreaChart, Area, PieChart, Pie
} from 'recharts'
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";

// ─── Palette — Lemonade / Key Lime / Diamond / Crème / Orchid ─────────────────
const C = {
  // Brand swatches
  lemonade:  '#fff680',
  keyLime:   '#e0ef70',
  diamond:   '#c0eaff',
  creme:     '#fffbe1',
  orchid:    '#ed9ac1',

  // Semantic roles
  primary:   '#9abe30',   // deep Key Lime — interactive / nav
  primaryL:  '#f0facc',   // light Key Lime tint
  primaryM:  '#b8d840',   // mid Key Lime

  cyan:      '#6ec8f0',   // deep Diamond
  cyanL:     '#e2f5ff',   // light Diamond tint

  green:     '#9abe30',   // deep Key Lime = positive / profit
  greenL:    '#f0facc',

  orange:    '#d4b800',   // deep Lemonade = caution / AOV
  orangeL:   '#fffde0',

  red:       '#c8608a',   // deep Orchid = negative / leakage
  redL:      '#fce4f0',

  // Neutrals
  background: '#fdfaf6',
  card:       '#ffffff',
  border:     '#eceacc',  // warm hairline

  text:       '#2C2E45',
  textS:      '#5A5C72',
  textM:      '#9497B0',

  // Map bubble / choropleth
  mapLow:     '#f0facc',
  mapMedium:  '#d8f070',
  mapHigh:    '#b8d840',
  mapHighest: '#9abe30',
  mapNegative:'#fce4f0',

  // Aliases
  bg:        '#fdfaf6',
  pink:      '#ed9ac1',
  pinkL:     '#fce4f0',
  blue:      '#c0eaff',
  blueL:     '#e2f5ff',
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const revenueProfit = [
  { month: 'Jan', revenue: 32.4, profit: 5.8 },
  { month: 'Feb', revenue: 36.1, profit: 6.2 },
  { month: 'Mar', revenue: 34.8, profit: 7.1 },
  { month: 'Apr', revenue: 39.5, profit: 6.4 },
  { month: 'May', revenue: 41.8, profit: 5.9 },
  { month: 'Jun', revenue: 43.2, profit: 5.2 },
  { month: 'Jul', revenue: 45.7, profit: 7.8 },
  { month: 'Aug', revenue: 42.1, profit: 6.9 },
  { month: 'Sep', revenue: 38.6, profit: 7.3 },
  { month: 'Oct', revenue: 44.9, profit: 8.1 },
  { month: 'Nov', revenue: 52.3, profit: 9.4 },
  { month: 'Dec', revenue: 48.6, profit: 8.8 },
]

const leakageSources = [
  { name: 'Discounts',      amount: 2.4, pct: 5.8, color: '#c8608a' },
  { name: 'Returns',        amount: 1.7, pct: 4.1, color: '#d4b800' },
  { name: 'Shipping',       amount: 1.2, pct: 2.9, color: '#6ec8f0' },
  { name: 'Failed Delivery',amount: 0.7, pct: 1.7, color: '#9abe30' },
  { name: 'Payment Fees',   amount: 0.4, pct: 1.0, color: '#ed9ac1' },
]

const categoryProfit = [
  { name: 'Electronics', revenue: 12.4, profit: 2.8, margin: 22.6 },
  { name: 'Fashion', revenue: 8.6, profit: 1.4, margin: 16.3 },
  { name: 'Home & Garden', revenue: 6.2, profit: 1.6, margin: 25.8 },
  { name: 'Beauty', revenue: 5.1, profit: 1.3, margin: 25.5 },
  { name: 'Sports', revenue: 4.8, profit: 1.0, margin: 20.8 },
  { name: 'Grocery', revenue: 4.7, profit: -0.3, margin: -6.4 },
]

const products = [
  { name: 'Sony 4K TV 65"', category: 'Electronics', revenue: 4.8, profit: 1.2, discount: 12, returns: 3 },
  { name: 'iPhone 15 Pro', category: 'Electronics', revenue: 4.2, profit: 1.0, discount: 8, returns: 2 },
  { name: 'Nike Air Max', category: 'Fashion', revenue: 2.1, profit: 0.7, discount: 18, returns: 9 },
  { name: 'Dyson V15', category: 'Home', revenue: 1.9, profit: 0.6, discount: 10, returns: 4 },
  { name: "Levi's 511 Slim", category: 'Fashion', revenue: 1.6, profit: 0.5, discount: 22, returns: 14 },
  { name: 'MacBook Air M3', category: 'Electronics', revenue: 3.8, profit: 0.4, discount: 5, returns: 1 },
  { name: 'Adidas Ultraboost', category: 'Fashion', revenue: 1.4, profit: 0.3, discount: 28, returns: 18 },
  { name: "L'Oréal Kit", category: 'Beauty', revenue: 1.1, profit: 0.3, discount: 15, returns: 6 },
  { name: 'Organic Dal 5kg', category: 'Grocery', revenue: 0.8, profit: -0.2, discount: 32, returns: 2 },
  { name: 'Party Wear Set', category: 'Fashion', revenue: 1.2, profit: -0.3, discount: 40, returns: 25 },
]

const scatterData = [
  { discount: 5, profit: 22, category: 'Electronics', name: 'iPhone 15 Pro' },
  { discount: 8, profit: 25, category: 'Electronics', name: 'Sony TV' },
  { discount: 10, profit: 18, category: 'Home', name: 'Dyson V15' },
  { discount: 12, profit: 20, category: 'Electronics', name: 'iPad Air' },
  { discount: 15, profit: 14, category: 'Beauty', name: 'Skincare Kit' },
  { discount: 18, profit: 11, category: 'Fashion', name: 'Nike Air Max' },
  { discount: 22, profit: 7, category: 'Fashion', name: "Levi's Jeans" },
  { discount: 28, profit: 2, category: 'Fashion', name: 'Adidas Boost' },
  { discount: 32, profit: -3, category: 'Grocery', name: 'Organic Dal' },
  { discount: 40, profit: -8, category: 'Fashion', name: 'Party Set' },
]

const regionData = [
  { region: 'North', shipping: 0.42, failed: 7.2, orders: 3240, x: 148, y: 82 },
  { region: 'South', shipping: 0.31, failed: 4.1, orders: 2980, x: 158, y: 268 },
  { region: 'East', shipping: 0.28, failed: 5.8, orders: 2410, x: 226, y: 158 },
  { region: 'West', shipping: 0.38, failed: 6.4, orders: 2810, x: 78, y: 162 },
  { region: 'Central', shipping: 0.21, failed: 2.8, orders: 1100, x: 158, y: 172 },
]

const customers = [
  { id: 'C001', name: 'Rajesh Kumar', segment: 'High', revenue: 1.84, profit: 0.42, orders: 28, aov: 6571, returnRate: 2, clv: 12400 },
  { id: 'C002', name: 'Priya Sharma', segment: 'High', revenue: 1.62, profit: 0.38, orders: 24, aov: 6750, returnRate: 3, clv: 11200 },
  { id: 'C003', name: 'Amit Patel', segment: 'High', revenue: 1.45, profit: 0.31, orders: 19, aov: 7632, returnRate: 1, clv: 9800 },
  { id: 'C004', name: 'Sunita Verma', segment: 'Medium', revenue: 0.92, profit: 0.18, orders: 12, aov: 7667, returnRate: 7, clv: 5600 },
  { id: 'C005', name: 'Deepak Singh', segment: 'Medium', revenue: 0.78, profit: 0.14, orders: 10, aov: 7800, returnRate: 9, clv: 4200 },
  { id: 'C006', name: 'Meena Iyer', segment: 'Medium', revenue: 0.65, profit: 0.11, orders: 9, aov: 7222, returnRate: 11, clv: 3800 },
  { id: 'C007', name: 'Vikram Nair', segment: 'Low', revenue: 0.32, profit: 0.04, orders: 4, aov: 8000, returnRate: 18, clv: 1200 },
  { id: 'C008', name: 'Anita Joshi', segment: 'Low', revenue: 0.28, profit: 0.02, orders: 3, aov: 9333, returnRate: 22, clv: 800 },
  { id: 'C009', name: 'Ravi Menon', segment: 'Low', revenue: 0.18, profit: -0.01, orders: 2, aov: 9000, returnRate: 28, clv: 200 },
]

const waterfallData = [
  { name: 'Revenue', value: 41.8, type: 'total' },
  { name: 'Discounts', value: -2.4, type: 'loss' },
  { name: 'Returns', value: -1.7, type: 'loss' },
  { name: 'Shipping', value: -1.2, type: 'loss' },
  { name: 'Failed Del.', value: -0.7, type: 'loss' },
  { name: 'Pay Fees', value: -0.4, type: 'loss' },
  { name: 'Net Profit', value: 7.8, type: 'profit' },
]

const countryProfit = [
  { country: 'United States',  profit:  3.94, revenue: 18.2, orders: 3240 },
  { country: 'Australia',      profit:  3.23, revenue: 14.8, orders: 1820 },
  { country: 'Germany',        profit:  1.87, revenue:  9.4, orders: 2140 },
  { country: 'France',         profit:  1.62, revenue:  8.1, orders: 1680 },
  { country: 'United Kingdom', profit:  1.44, revenue:  7.6, orders: 2090 },
  { country: 'China',          profit:  1.28, revenue:  8.9, orders: 4120 },
  { country: 'India',          profit:  0.97, revenue:  6.2, orders: 2870 },
  { country: 'Brazil',         profit:  0.89, revenue:  5.8, orders: 1240 },
  { country: 'Japan',          profit:  0.76, revenue:  4.9, orders: 1560 },
  { country: 'Canada',         profit:  0.71, revenue:  4.2, orders:  980 },
  { country: 'Mexico',         profit:  0.58, revenue:  3.8, orders:  890 },
  { country: 'South Africa',   profit:  0.42, revenue:  2.9, orders:  620 },
  { country: 'Indonesia',      profit:  0.38, revenue:  2.6, orders:  740 },
  { country: 'Nigeria',        profit:  0.19, revenue:  1.8, orders:  410 },
  { country: 'Ukraine',        profit: -0.30, revenue:  2.1, orders:  380 },
]

const COUNTRY_PROFIT_LOOKUP = Object.fromEntries(countryProfit.map(d => [d.country, d]))

const SEGMENT_COLOR: Record<string, string> = {
  High: '#9abe30', Medium: '#6ec8f0', Low: '#c8608a',
}

// ─── Shipping country data ────────────────────────────────────────────────────
const shippingCountryData = [
  { country: 'United States',  code: 'US', shippingCost: 48.2, orders: 3240, failedPct: 3.2, avgDays: 4.1, coordinates: [-100,  38] as [number,number] },
  { country: 'Australia',      code: 'AU', shippingCost: 62.8, orders: 1820, failedPct: 4.8, avgDays: 7.2, coordinates: [ 134, -26] as [number,number] },
  { country: 'Germany',        code: 'DE', shippingCost: 31.4, orders: 2140, failedPct: 2.1, avgDays: 3.4, coordinates: [  10,  51] as [number,number] },
  { country: 'France',         code: 'FR', shippingCost: 29.6, orders: 1680, failedPct: 3.8, avgDays: 3.8, coordinates: [   2,  47] as [number,number] },
  { country: 'United Kingdom', code: 'GB', shippingCost: 27.3, orders: 2090, failedPct: 2.9, avgDays: 2.9, coordinates: [  -2,  54] as [number,number] },
  { country: 'China',          code: 'CN', shippingCost: 18.4, orders: 4120, failedPct: 5.6, avgDays: 6.8, coordinates: [ 105,  35] as [number,number] },
  { country: 'India',          code: 'IN', shippingCost: 12.1, orders: 2870, failedPct: 7.2, avgDays: 5.4, coordinates: [  79,  21] as [number,number] },
  { country: 'Brazil',         code: 'BR', shippingCost: 41.6, orders: 1240, failedPct: 8.4, avgDays: 8.9, coordinates: [ -51, -10] as [number,number] },
  { country: 'Japan',          code: 'JP', shippingCost: 24.8, orders: 1560, failedPct: 1.4, avgDays: 2.1, coordinates: [ 138,  36] as [number,number] },
  { country: 'Canada',         code: 'CA', shippingCost: 44.9, orders:  980, failedPct: 3.6, avgDays: 5.2, coordinates: [ -96,  57] as [number,number] },
  { country: 'Mexico',         code: 'MX', shippingCost: 22.3, orders:  890, failedPct: 6.1, avgDays: 6.4, coordinates: [-102,  24] as [number,number] },
  { country: 'South Africa',   code: 'ZA', shippingCost: 35.7, orders:  620, failedPct: 9.2, avgDays: 9.8, coordinates: [  25, -29] as [number,number] },
  { country: 'Indonesia',      code: 'ID', shippingCost: 16.8, orders:  740, failedPct: 6.8, avgDays: 7.6, coordinates: [ 113,  -1] as [number,number] },
  { country: 'Nigeria',        code: 'NG', shippingCost: 28.4, orders:  410, failedPct:12.4, avgDays:11.2, coordinates: [   8,  10] as [number,number] },
]

// Name aliases: topojson names → our dataset names
const GEO_NAME_MAP: Record<string, string> = {
  'United States of America': 'United States',
  'United Kingdom of Great Britain and Northern Ireland': 'United Kingdom',
  'Republic of South Africa': 'South Africa',
  'Federal Republic of Nigeria': 'Nigeria',
  'Federative Republic of Brazil': 'Brazil',
  'Republic of Indonesia': 'Indonesia',
  'United Mexican States': 'Mexico',
}

const SHIPPING_MAP = Object.fromEntries(shippingCountryData.map(d => [d.country, d]))

const shippingByCountry = [...shippingCountryData].sort((a, b) => b.shippingCost - a.shippingCost)

// Distinct pastel fill per country
const COUNTRY_PASTELS: Record<string, string> = {
  'United States':  '#b8cef8',
  'Australia':      '#f4b8d0',
  'Germany':        '#b8e8c8',
  'France':         '#ffd6a0',
  'United Kingdom': '#c8b8f8',
  'China':          '#f8e0a0',
  'India':          '#a8e0f0',
  'Brazil':         '#f0b8b8',
  'Japan':          '#b8f0d8',
  'Canada':         '#e8c8f8',
  'Mexico':         '#f8d8a8',
  'South Africa':   '#b8e0f8',
  'Indonesia':      '#f8c8e0',
  'Nigeria':        '#d0f0b8',
}

const fmt = (n: number) => n < 0 ? `-₹${Math.abs(n).toFixed(2)}L` : `₹${n.toFixed(2)}L`
const fmtS = (n: number) => `₹${n.toFixed(1)}L`

// ─── World Profit Choropleth ──────────────────────────────────────────────────
const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

const PROFIT_GEO_ALIASES: Record<string, string> = {
  'United States of America': 'United States',
  'United Kingdom of Great Britain and Northern Ireland': 'United Kingdom',
  'Republic of South Africa': 'South Africa',
  'Federal Republic of Nigeria': 'Nigeria',
  'Federative Republic of Brazil': 'Brazil',
  'Republic of Indonesia': 'Indonesia',
  'United Mexican States': 'Mexico',
  'Ukraine': 'Ukraine',
}

const maxProfit = Math.max(...countryProfit.filter(d => d.profit > 0).map(d => d.profit))

function getProfitFill(geoName: string): string {
  const name = PROFIT_GEO_ALIASES[geoName] ?? geoName
  const d = COUNTRY_PROFIT_LOOKUP[name]
  if (!d) return '#edeef3'
  if (d.profit < 0) return '#f4c4d0'
  const r = d.profit / maxProfit
  if (r >= 0.66) return '#c0b4f0'   // pastel lavender — high
  if (r >= 0.33) return '#b0c8f4'   // pastel blue — medium
  return '#d8ecfc'                   // very light blue — low
}

function WorldProfitMap() {
  const [tip, setTip] = useState<{ d: typeof countryProfit[0]; x: number; y: number } | null>(null)

  return (
    <div style={{ position: 'relative', background: '#f6f8fc', borderRadius: 12, overflow: 'hidden' }}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 128, center: [10, 18] }}
        style={{ width: '100%', height: 232 }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map(geo => {
              const geoName: string = geo.properties?.name ?? ''
              const name = PROFIT_GEO_ALIASES[geoName] ?? geoName
              const d = COUNTRY_PROFIT_LOOKUP[name]
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={getProfitFill(geoName)}
                  stroke="#ffffff"
                  strokeWidth={0.4}
                  style={{ cursor: d ? 'pointer' : 'default', outline: 'none' }}
                  onMouseEnter={e => d && setTip({ d, x: e.clientX, y: e.clientY })}
                  onMouseLeave={() => setTip(null)}
                />
              )
            })
          }
        </Geographies>
      </ComposableMap>

      {/* Legend */}
      <div style={{ position: 'absolute', bottom: 8, left: 10, display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, color: C.textM }}>
        <span style={{ fontWeight: 600 }}>Profit ($)</span>
        <span style={{ marginLeft: 2 }}>Low</span>
        <div style={{ width: 52, height: 5, borderRadius: 3, background: 'linear-gradient(to right, #d8ecfc, #b0c8f4, #c0b4f0)' }} />
        <span>High</span>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#f4c4d0', marginLeft: 8, border: '1px solid #e8aac0' }} />
        <span>Negative</span>
      </div>

      {/* Hover tooltip */}
      {tip && (
        <div style={{ position: 'fixed', left: tip.x + 12, top: tip.y - 10, zIndex: 500, background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', fontSize: 11, fontFamily: 'Inter', color: C.text, boxShadow: '0 6px 24px rgba(0,0,0,0.12)', pointerEvents: 'none', minWidth: 160 }}>
          <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 6, borderBottom: `1px solid ${C.border}`, paddingBottom: 4 }}>{tip.d.country}</div>
          <div style={{ color: C.textS, marginBottom: 2 }}>Revenue: <strong style={{ color: C.text }}>${tip.d.revenue.toFixed(1)}L</strong></div>
          <div style={{ color: C.textS, marginBottom: 2 }}>Profit: <strong style={{ color: tip.d.profit < 0 ? '#c8608a' : '#9abe30' }}>{tip.d.profit < 0 ? '-' : ''}${Math.abs(tip.d.profit).toFixed(2)}L</strong></div>
          <div style={{ color: C.textS, marginBottom: 2 }}>Profit Margin: <strong style={{ color: tip.d.profit < 0 ? '#c8608a' : C.text }}>{((tip.d.profit / tip.d.revenue) * 100).toFixed(1)}%</strong></div>
          <div style={{ color: C.textS }}>Orders: <strong style={{ color: C.text }}>{tip.d.orders.toLocaleString()}</strong></div>
        </div>
      )}
    </div>
  )
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────
const ChartTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', fontSize: 11, fontFamily: 'Inter', color: C.text, boxShadow: '0 4px 20px rgba(0,0,0,0.10)' }}>
      <div style={{ fontWeight: 700, color: C.text, marginBottom: 4 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 2 }}>
          <span style={{ color: p.color, fontSize: 9 }}>●</span>
          <span style={{ color: C.textS }}>{p.name}:</span>
          <span style={{ fontWeight: 600, color: C.text }}>{typeof p.value === 'number' ? p.value : p.value}</span>
        </div>
      ))}
    </div>
  )
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
interface KpiProps {
  label: string
  value: string
  sub?: string
  delta?: number
  color: string
  gradFrom: string
  gradTo: string
}

function KpiCard({ label, value, sub, delta, color, gradFrom, gradTo }: KpiProps) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${gradFrom} 0%, ${gradTo} 100%)`,
      borderRadius: 16,
      padding: '20px 20px 16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      border: `1px solid ${color}22`,
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: C.textS, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: C.text, lineHeight: 1.1, letterSpacing: '-0.01em' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: C.textM }}>{sub}</div>}
      {delta !== undefined && (
        <div style={{ fontSize: 11, fontWeight: 600, color: delta >= 0 ? '#5BAD8A' : '#C8727B', display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
          <span style={{ fontSize: 9 }}>{delta >= 0 ? '▲' : '▼'}</span>
          <span>{Math.abs(delta).toFixed(1)}% vs last period</span>
        </div>
      )}
    </div>
  )
}

// ─── Calendar ─────────────────────────────────────────────────────────────────
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa']

interface CalRange { start: Date | null; end: Date | null }

function CalendarPicker({ onClose, onApply }: { onClose: () => void; onApply: (label: string) => void }) {
  const today = new Date(2025, 8, 22) // Sep 22 2025
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [range, setRange] = useState<CalRange>({ start: null, end: null })
  const [hovDate, setHovDate] = useState<Date | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const cells: (Date | null)[] = Array(firstDay).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewYear, viewMonth, d))

  const isSame = (a: Date | null, b: Date | null) =>
    a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

  const inRange = (d: Date) => {
    const lo = range.start, hi = range.end || hovDate
    if (!lo || !hi) return false
    return d >= lo && d <= hi || d >= hi && d <= lo
  }

  const handleDay = (d: Date) => {
    if (!range.start || (range.start && range.end)) {
      setRange({ start: d, end: null })
    } else {
      const sorted = d < range.start ? { start: d, end: range.start } : { start: range.start, end: d }
      setRange(sorted)
    }
  }

  const presets = [
    { label: 'Last 7 Days', days: 7 },
    { label: 'Last 30 Days', days: 30 },
    { label: 'Last Quarter', days: 90 },
    { label: 'Last 12 Months', days: 365 },
  ]

  const handlePreset = (days: number, label: string) => {
    const end = new Date(today)
    const start = new Date(today)
    start.setDate(start.getDate() - days)
    setRange({ start, end })
    onApply(label)
    onClose()
  }

  const applyRange = () => {
    if (!range.start) return
    const s = range.start
    const e = range.end || range.start
    const label = `${s.getDate()} ${MONTHS[s.getMonth()].slice(0,3)} – ${e.getDate()} ${MONTHS[e.getMonth()].slice(0,3)} ${e.getFullYear()}`
    onApply(label)
    onClose()
  }

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute', top: '110%', left: 0, zIndex: 200,
        background: '#fff', border: `1px solid ${C.border}`,
        borderRadius: 16, boxShadow: '0 8px 40px rgba(0,0,0,0.14)',
        padding: 20, width: 340, fontFamily: 'Inter'
      }}
    >
      {/* Presets */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
        {presets.map(p => (
          <button
            key={p.label}
            onClick={() => handlePreset(p.days, p.label)}
            style={{
              fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 20,
              border: `1px solid ${C.border}`, background: C.bg, color: C.textS, cursor: 'pointer'
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = C.primaryL; (e.currentTarget as HTMLButtonElement).style.color = C.primary }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = C.bg; (e.currentTarget as HTMLButtonElement).style.color = C.textS }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Month nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <button
          onClick={() => { const d = new Date(viewYear, viewMonth - 1); setViewYear(d.getFullYear()); setViewMonth(d.getMonth()) }}
          style={{ border: 'none', background: C.bg, borderRadius: 8, width: 28, height: 28, cursor: 'pointer', fontSize: 14, color: C.textS }}
        >‹</button>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{MONTHS[viewMonth]} {viewYear}</span>
        <button
          onClick={() => { const d = new Date(viewYear, viewMonth + 1); setViewYear(d.getFullYear()); setViewMonth(d.getMonth()) }}
          style={{ border: 'none', background: C.bg, borderRadius: 8, width: 28, height: 28, cursor: 'pointer', fontSize: 14, color: C.textS }}
        >›</button>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 4 }}>
        {DAYS.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 600, color: C.textM, padding: '2px 0' }}>{d}</div>)}
      </div>

      {/* Days grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} />
          const isStart = isSame(d, range.start)
          const isEnd = isSame(d, range.end)
          const isToday = isSame(d, today)
          const inR = inRange(d)
          return (
            <div
              key={i}
              onClick={() => handleDay(d)}
              onMouseEnter={() => setHovDate(d)}
              onMouseLeave={() => setHovDate(null)}
              style={{
                textAlign: 'center', padding: '5px 2px', fontSize: 12, borderRadius: 8, cursor: 'pointer',
                fontWeight: isStart || isEnd ? 700 : isToday ? 600 : 400,
                background: isStart || isEnd ? C.primary : inR ? C.primaryL : 'transparent',
                color: isStart || isEnd ? '#fff' : inR ? C.primary : isToday ? C.primary : C.text,
                transition: 'all 0.1s',
              }}
            >
              {d.getDate()}
            </div>
          )
        })}
      </div>

      {/* Apply */}
      <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
        <button
          onClick={onClose}
          style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, fontSize: 12, fontWeight: 500, color: C.textS, cursor: 'pointer' }}
        >Cancel</button>
        <button
          onClick={applyRange}
          disabled={!range.start}
          style={{
            flex: 1, padding: '8px 0', borderRadius: 8, border: 'none',
            background: range.start ? C.primary : C.border,
            color: range.start ? '#fff' : C.textM,
            fontSize: 12, fontWeight: 600, cursor: range.start ? 'pointer' : 'default'
          }}
        >Apply Range</button>
      </div>
    </div>
  )
}

// ─── India Region Map ─────────────────────────────────────────────────────────
function IndiaRegionMap({ activeRegion, onRegion }: { activeRegion: string; onRegion: (r: string) => void }) {
  const [hov, setHov] = useState<string | null>(null)

  // Simplified India SVG paths (approximate schematic)
  const regions = [
    {
      name: 'North',
      color: '#9abe30',
      lightColor: '#f0facc',
      path: 'M 100,18 L 148,10 L 200,16 L 220,32 L 240,58 L 238,82 L 218,88 L 178,96 L 148,98 L 118,92 L 96,78 L 88,56 Z',
      cx: 164, cy: 55,
    },
    {
      name: 'West',
      color: '#d4b800',
      lightColor: '#fffde0',
      path: 'M 88,56 L 118,92 L 108,128 L 82,168 L 60,198 L 48,224 L 52,250 L 76,268 L 88,256 L 96,232 L 110,210 L 120,188 L 118,160 L 108,138 L 96,78 Z',
      cx: 80, cy: 165,
    },
    {
      name: 'Central',
      color: '#6ec8f0',
      lightColor: '#e2f5ff',
      path: 'M 118,92 L 148,98 L 178,96 L 218,88 L 238,82 L 242,108 L 238,138 L 220,165 L 196,176 L 166,178 L 140,172 L 118,160 L 108,138 L 108,128 Z',
      cx: 178, cy: 132,
    },
    {
      name: 'East',
      color: '#c8608a',
      lightColor: '#fce4f0',
      path: 'M 218,88 L 238,82 L 258,96 L 278,118 L 286,148 L 278,172 L 258,186 L 236,196 L 220,165 L 238,138 L 242,108 Z',
      cx: 256, cy: 143,
    },
    {
      name: 'South',
      color: '#b8a010',
      lightColor: '#fffbd0',
      path: 'M 118,160 L 140,172 L 166,178 L 196,176 L 220,165 L 236,196 L 228,226 L 210,258 L 192,284 L 172,308 L 156,320 L 138,310 L 120,284 L 104,256 L 90,232 L 88,256 L 76,268 L 52,250 L 48,224 L 60,198 L 82,168 L 108,138 Z',
      cx: 163, cy: 238,
    },
  ]

  return (
    <div style={{ position: 'relative', display: 'flex', gap: 20, alignItems: 'flex-start' }}>
      <div style={{ flex: '0 0 auto' }}>
        <svg viewBox="0 0 320 340" width={220} height={260} style={{ overflow: 'visible' }}>
          <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.08)" />
            </filter>
          </defs>
          {regions.map(r => {
            const isActive = activeRegion === r.name || activeRegion === 'All Regions'
            const isHov = hov === r.name
            return (
              <g key={r.name}>
                <path
                  d={r.path}
                  fill={isHov ? r.color : isActive ? r.lightColor : '#f1f5f9'}
                  stroke={isActive || isHov ? r.color : C.border}
                  strokeWidth={isHov ? 2 : 1}
                  style={{ cursor: 'pointer', transition: 'all 0.2s', filter: 'url(#shadow)' }}
                  onClick={() => onRegion(r.name === activeRegion ? 'All Regions' : r.name)}
                  onMouseEnter={() => setHov(r.name)}
                  onMouseLeave={() => setHov(null)}
                />
                <text
                  x={r.cx} y={r.cy}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={9} fontWeight={600} fontFamily="Inter"
                  fill={isHov ? '#fff' : isActive ? r.color : C.textM}
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {r.name}
                </text>
              </g>
            )
          })}
        </svg>
        <p style={{ fontSize: 10, color: C.textM, textAlign: 'center', marginTop: 4 }}>Click region to filter</p>
      </div>

      {/* Region stats */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {regionData.map(r => {
          const reg = regions.find(x => x.name === r.region)!
          const isActive = activeRegion === r.region || activeRegion === 'All Regions'
          return (
            <div
              key={r.region}
              onClick={() => onRegion(r.region === activeRegion ? 'All Regions' : r.region)}
              style={{
                padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                border: `1px solid ${isActive ? reg?.color : C.border}`,
                background: isActive ? reg?.lightColor : '#fafafa',
                transition: 'all 0.18s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: reg?.color }}>{r.region}</span>
                <span style={{ fontSize: 10, color: C.textM }}>{r.orders.toLocaleString('en-IN')} orders</span>
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
                <span style={{ fontSize: 11, color: C.textS }}>Shipping: <strong style={{ color: reg?.color }}>₹{r.shipping}L</strong></span>
                <span style={{ fontSize: 11, color: C.textS }}>Failed: <strong style={{ color: r.failed > 6 ? C.red : C.textS }}>{r.failed}%</strong></span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Filter types ─────────────────────────────────────────────────────────────
type Filters = { date: string; category: string; region: string; segment: string; payment: string }

const initialFilters: Filters = {
  date: 'Last 12 Months', category: 'All Categories',
  region: 'All Regions', segment: 'All Segments', payment: 'All Methods',
}

// ─── Page 1: Executive Overview ───────────────────────────────────────────────
function Page1({ filters, setFilters }: { filters: Filters; setFilters: (f: Filters) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 24 }}>

      {/* Hero banner */}
      <div style={{
        background: 'linear-gradient(120deg, #fffde0 0%, #f0facc 45%, #e2f5ff 100%)',
        borderRadius: 20,
        padding: '28px 36px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        border: '1px solid #eceacc',
        boxShadow: '0 2px 16px rgba(180,210,60,0.10)',
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.textM, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 8 }}>
            FY 2024–25 · Executive Summary
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: C.text, lineHeight: 1.2, letterSpacing: '-0.01em' }}>
            ₹6.4L in Profit Leakage Identified
          </div>
          <div style={{ fontSize: 13, color: C.textM, marginTop: 8 }}>
            15.3% of revenue lost to discounts, returns, shipping &amp; fees across FY 2024–25
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.textM, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>Net Profit Margin</div>
          <div style={{ fontSize: 40, fontWeight: 800, color: '#9abe30', lineHeight: 1 }}>18.7%</div>
          <div style={{ fontSize: 12, color: C.textM, marginTop: 4 }}>₹7.8L of ₹41.8L revenue</div>
        </div>
      </div>

      {/* Filters — below Executive Summary */}
      <FilterBar filters={filters} setFilters={setFilters} />

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
        <KpiCard label="Total Revenue" value="₹41.8L" sub="FY 2024–25" delta={6.3} color="#c8608a" gradFrom="#ffd6e7" gradTo="#ffe8f2" />
        <KpiCard label="Total Orders" value="12,540" sub="Transactions" delta={4.1} color="#6e9a10" gradFrom="#e0eea3" gradTo="#eef4c4" />
        <KpiCard label="Net Profit" value="₹7.8L" sub="After all deductions" delta={-2.8} color="#10a8a4" gradFrom="#c4faf8" gradTo="#ddfdf9" />
        <KpiCard label="Avg Order Value" value="₹3,332" sub="Per transaction" delta={2.1} color="#b020c0" gradFrom="#fcc2ff" gradTo="#fde0ff" />
        <KpiCard label="Profit Leakage" value="₹6.4L" sub="15.3% of revenue" delta={8.2} color="#c8a000" gradFrom="#fff4b7" gradTo="#fffad6" />
      </div>

      {/* Revenue vs Profit Trend  +  Profit by Country — side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '63fr 37fr', gap: 16, alignItems: 'stretch' }}>

        {/* LEFT: Revenue vs Profit Trend */}
        <div style={{ background: C.card, borderRadius: 16, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Revenue vs Profit Trend</div>
              <div style={{ fontSize: 12, color: C.textM, marginTop: 2 }}>High revenue months do not always mean high profit</div>
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 11, fontWeight: 500 }}>
              <span style={{ color: '#c8608a' }}>■ Revenue</span>
              <span style={{ color: '#9abe30' }}>■ Profit</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueProfit} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ed9ac1" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#ed9ac1" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e0ef70" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#e0ef70" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 6" stroke="#eceacc" />
              <XAxis dataKey="month" tick={{ fill: C.textM, fontSize: 11, fontFamily: 'Inter' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: C.textM, fontSize: 11, fontFamily: 'Inter' }} tickLine={false} axisLine={false} tickFormatter={v => `₹${v}L`} />
              <Tooltip content={<ChartTip />} />
              <Area type="monotone" dataKey="revenue" name="Revenue ₹L" stroke="#c8608a" strokeWidth={2.5} fill="url(#revGrad)" dot={false} activeDot={{ r: 5, fill: '#c8608a' }} />
              <Area type="monotone" dataKey="profit" name="Profit ₹L" stroke="#9abe30" strokeWidth={2.5} fill="url(#profGrad)" dot={false} activeDot={{ r: 5, fill: '#9abe30' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* RIGHT: Profit by Country — World Map */}
        <div style={{ background: C.card, borderRadius: 16, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Profit by Country</div>
            <div style={{ fontSize: 12, color: C.textM, marginTop: 2 }}>Geographic profitability</div>
          </div>
          <div style={{ flex: 1 }}>
            <WorldProfitMap />
          </div>
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Leakage Sources */}
        <div style={{ background: C.card, borderRadius: 16, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>Profit Leakage Sources</div>
          <div style={{ fontSize: 12, color: C.textM, marginBottom: 16 }}>₹6.4L identified across 5 categories</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {leakageSources.map(s => (
              <div key={s.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: C.textS }}>{s.name}</span>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: s.color }}>₹{s.amount}L</span>
                    <span style={{ fontSize: 11, color: C.textM }}>{s.pct}%</span>
                  </div>
                </div>
                <div style={{ height: 6, borderRadius: 999, background: '#f0f2f8', overflow: 'hidden' }}>
                  <div style={{ height: 6, borderRadius: 999, background: s.color, width: `${(s.amount / 2.4) * 100}%`, transition: 'width 0.6s' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Profit */}
        <div style={{ background: C.card, borderRadius: 16, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>Profit by Category</div>
          <div style={{ fontSize: 12, color: C.textM, marginBottom: 12 }}>Grocery is margin-negative (–6.4%)</div>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={categoryProfit} layout="vertical" margin={{ top: 0, right: 50, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 6" stroke="#f0f2f8" horizontal={false} />
              <XAxis type="number" tick={{ fill: C.textM, fontSize: 10, fontFamily: 'Inter' }} tickLine={false} axisLine={false} tickFormatter={v => `₹${v}L`} />
              <YAxis dataKey="name" type="category" tick={{ fill: C.textS, fontSize: 10, fontFamily: 'Inter' }} tickLine={false} axisLine={false} width={78} />
              <Tooltip content={<ChartTip />} />
              <Bar dataKey="profit" name="Profit ₹L" radius={[0, 6, 6, 0]}>
                {categoryProfit.map(e => <Cell key={e.name} fill={e.profit < 0 ? '#ed9ac1' : '#9abe30'} />)}
                <LabelList dataKey="profit" position="right" formatter={(v: any) => `₹${v}L`} style={{ fill: C.textM, fontSize: 10, fontFamily: 'Inter' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Products Table */}
      <div style={{ background: C.card, borderRadius: 16, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 16 }}>Product Profitability</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                {['Product','Category','Revenue','Profit','Margin','Discount','Returns'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: C.textS, letterSpacing: '0.04em', fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {productsByProfit.map((p, i) => {
                const margin = (p.profit / p.revenue) * 100
                return (
                  <tr
                    key={p.name}
                    style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? '#fff' : '#FAFBFE', transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#F2F0FF')}
                    onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#FAFBFE')}
                  >
                    <td style={{ padding: '10px 12px', fontWeight: 500, color: C.text }}>{p.name}</td>
                    <td style={{ padding: '0 12px', color: C.textS }}>{p.category}</td>
                    <td style={{ padding: '0 12px', color: C.primary, fontWeight: 600 }}>{fmtS(p.revenue)}</td>
                    <td style={{ padding: '0 12px', color: p.profit < 0 ? C.red : C.green, fontWeight: 600 }}>{fmt(p.profit)}</td>
                    <td style={{ padding: '0 12px' }}>
                      <span style={{
                        display: 'inline-block', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                        background: margin < 0 ? C.redL : margin < 10 ? C.orangeL : C.greenL,
                        color: margin < 0 ? C.red : margin < 10 ? C.orange : C.green,
                      }}>{margin.toFixed(1)}%</span>
                    </td>
                    <td style={{ padding: '0 12px', color: p.discount > 25 ? C.red : C.textS }}>{p.discount}%</td>
                    <td style={{ padding: '0 12px', color: p.returns > 15 ? C.red : C.textS }}>{p.returns}%</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Global Shipping Section ─────────────────────────────────────────────────
function GlobalShippingSection() {
  const [activeCountry, setActiveCountry] = useState<string | null>(null)
  const [tip, setTip] = useState<{ d: typeof shippingCountryData[0]; x: number; y: number } | null>(null)
  const maxCost = Math.max(...shippingCountryData.map(c => c.shippingCost))

  const getCountryFill = (geoName: string) => {
    const name = GEO_NAME_MAP[geoName] ?? geoName
    const d = SHIPPING_MAP[name]
    if (!d) return '#eaecf2'
    if (activeCountry && name !== activeCountry) return '#dde0e8'
    return COUNTRY_PASTELS[name] ?? '#d8dff0'
  }

  const filteredData = activeCountry
    ? shippingCountryData.filter(d => d.country === activeCountry)
    : shippingByCountry

  const summarySource = activeCountry
    ? shippingCountryData.filter(d => d.country === activeCountry)
    : shippingCountryData

  const highestCost    = [...summarySource].sort((a,b) => b.shippingCost - a.shippingCost)[0]
  const highestFailed  = [...summarySource].sort((a,b) => b.failedPct - a.failedPct)[0]
  const highestOrders  = [...summarySource].sort((a,b) => b.orders - a.orders)[0]
  const longestDelivery= [...summarySource].sort((a,b) => b.avgDays - a.avgDays)[0]

  const summaryCards = [
    { title: 'Highest Shipping Cost', sub: highestCost?.country, val: `$${highestCost?.shippingCost.toFixed(1)}K`, grad: ['#dff0ff','#eef7ff'], accent: '#6ec8f0' },
    { title: 'Highest Failed Delivery', sub: highestFailed?.country, val: `${highestFailed?.failedPct.toFixed(1)}%`, grad: ['#fce4f0','#fff0f6'], accent: '#c8608a' },
    { title: 'Highest Order Volume', sub: highestOrders?.country, val: highestOrders?.orders.toLocaleString(), grad: ['#f0facc','#f8fde8'], accent: '#9abe30' },
    { title: 'Longest Avg Delivery', sub: longestDelivery?.country, val: `${longestDelivery?.avgDays.toFixed(1)} days`, grad: ['#ffe8d0','#fff4ea'], accent: '#d4880a' },
  ]

  const chartData = (activeCountry ? filteredData : shippingByCountry.slice(0, 10))

  return (
    <div style={{ background: C.card, borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: `1px solid ${C.border}` }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>Global Shipping &amp; Delivery Analysis</div>
          <div style={{ fontSize: 12, color: C.textM, marginTop: 3 }}>Analyze shipping costs, delivery performance, and failed deliveries across countries.</div>
        </div>
        {activeCountry && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.primary }}>Active: {activeCountry}</span>
            <button
              onClick={() => setActiveCountry(null)}
              style={{ fontSize: 11, fontWeight: 600, color: C.red, background: C.redL, border: `1px solid ${C.red}40`, borderRadius: 8, padding: '3px 10px', cursor: 'pointer' }}
            >
              Clear filter ×
            </button>
          </div>
        )}
      </div>

      {/* Map + Summary cards row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 16, marginBottom: 20 }}>
        {/* World choropleth map */}
        <div style={{ background: '#f4f7fb', borderRadius: 12, overflow: 'hidden', position: 'relative' }}>
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ scale: 155, center: [10, 15] }}
            style={{ width: '100%', height: 360 }}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map(geo => {
                  const geoName: string = geo.properties?.name ?? ''
                  const name = GEO_NAME_MAP[geoName] ?? geoName
                  const d = SHIPPING_MAP[name]
                  const isActive = activeCountry === name
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={getCountryFill(geoName)}
                      stroke={isActive ? '#6ec8f0' : '#ffffff'}
                      strokeWidth={isActive ? 1.5 : 0.4}
                      style={{ cursor: d ? 'pointer' : 'default', outline: 'none' }}
                      onClick={() => d && setActiveCountry(activeCountry === name ? null : name)}
                      onMouseEnter={e => d && setTip({ d, x: e.clientX, y: e.clientY })}
                      onMouseLeave={() => setTip(null)}
                    />
                  )
                })
              }
            </Geographies>
          </ComposableMap>

          {/* Map legend */}
          <div style={{ position: 'absolute', bottom: 8, left: 10, display: 'flex', alignItems: 'center', gap: 6, fontSize: 9, color: C.textM }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: '#b8cef8', border: '1px solid #c0cce0' }} />
            <span>Countries with data</span>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: '#eaecf2', border: '1px solid #d0d4e0', marginLeft: 6 }} />
            <span>No data</span>
          </div>

          <div style={{ position: 'absolute', top: 8, left: 10, fontSize: 10, color: C.textM, fontWeight: 500 }}>
            Click a country to filter
          </div>
        </div>

        {/* Summary cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {summaryCards.map(card => (
            <div key={card.title} style={{
              background: `linear-gradient(135deg, ${card.grad[0]}, ${card.grad[1]})`,
              borderRadius: 12, padding: '12px 14px',
              border: `1px solid ${card.accent}22`,
              flex: 1,
            }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: C.textM, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 4 }}>{card.title}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.text, lineHeight: 1.1 }}>{card.val}</div>
              <div style={{ fontSize: 10, color: card.accent, fontWeight: 600, marginTop: 3 }}>{card.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Shipping cost bar chart */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>Shipping Cost by Country</div>
          <div style={{ fontSize: 11, color: C.textM, marginBottom: 12 }}>Top countries by total shipping spend (USD)</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 56, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 6" stroke="#f0f2f8" horizontal={false} />
              <XAxis type="number" tick={{ fill: C.textM, fontSize: 9, fontFamily: 'Inter' }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}K`} />
              <YAxis dataKey="country" type="category" tick={{ fill: C.textS, fontSize: 9, fontFamily: 'Inter' }} tickLine={false} axisLine={false} width={100} />
              <Tooltip content={<ChartTip />} />
              <Bar dataKey="shippingCost" name="Shipping Cost $K" radius={[0, 6, 6, 0]}>
                {chartData.map((d) => (
                  <Cell key={d.country} fill={COUNTRY_PASTELS[d.country] ?? '#d8dff0'} />
                ))}
                <LabelList dataKey="shippingCost" position="right" formatter={(v: any) => `$${v}K`} style={{ fill: C.textM, fontSize: 9, fontFamily: 'Inter' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Delivery performance */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>Delivery Performance by Country</div>
          <div style={{ fontSize: 11, color: C.textM, marginBottom: 12 }}>Avg delivery days vs failed delivery rate</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 56, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 6" stroke="#f0f2f8" horizontal={false} />
              <XAxis type="number" tick={{ fill: C.textM, fontSize: 9, fontFamily: 'Inter' }} tickLine={false} axisLine={false} />
              <YAxis dataKey="country" type="category" tick={{ fill: C.textS, fontSize: 9, fontFamily: 'Inter' }} tickLine={false} axisLine={false} width={100} />
              <Tooltip content={<ChartTip />} />
              <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'Inter', paddingTop: 4 }} />
              <Bar dataKey="avgDays" name="Avg Delivery Days" fill="#b8cef8" radius={[0, 4, 4, 0]} barSize={7} />
              <Bar dataKey="failedPct" name="Failed Delivery %" fill="#f4b8d0" radius={[0, 4, 4, 0]} barSize={7} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hover tooltip */}
      {tip && (
        <div style={{ position: 'fixed', left: tip.x + 12, top: tip.y - 10, zIndex: 500, background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', fontSize: 11, fontFamily: 'Inter', color: C.text, boxShadow: '0 6px 24px rgba(0,0,0,0.12)', pointerEvents: 'none', minWidth: 160 }}>
          <div style={{ fontWeight: 700, color: C.text, marginBottom: 6, borderBottom: `1px solid ${C.border}`, paddingBottom: 4 }}>{tip.d.country}</div>
          <div style={{ color: C.textS, marginBottom: 2 }}>Shipping Cost: <strong style={{ color: '#6ec8f0' }}>${tip.d.shippingCost}K</strong></div>
          <div style={{ color: C.textS, marginBottom: 2 }}>Orders: <strong style={{ color: C.text }}>{tip.d.orders.toLocaleString()}</strong></div>
          <div style={{ color: C.textS, marginBottom: 2 }}>Failed Delivery: <strong style={{ color: tip.d.failedPct > 7 ? C.red : C.textS }}>{tip.d.failedPct}%</strong></div>
          <div style={{ color: C.textS }}>Avg Delivery: <strong style={{ color: C.text }}>{tip.d.avgDays} days</strong></div>
        </div>
      )}
    </div>
  )
}

// ─── Page 2: Profit Leakage ───────────────────────────────────────────────────
function Page2({ filters, setFilters }: { filters: Filters; setFilters: (f: Filters) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 24 }}>

      {/* Leakage Table */}
      <div style={{ background: C.card, borderRadius: 16, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>Profit Leakage Breakdown</div>
        <div style={{ fontSize: 12, color: C.textM, marginBottom: 16 }}>Revenue: ₹41.8L · Identified leakage: ₹6.4L · Net profit: ₹7.8L</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                {['Source','Amount','% Revenue','Severity','Primary Driver'].map(h => (
                  <th key={h} style={{ padding: '8px 14px', textAlign: 'left', fontWeight: 600, color: C.textS, fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { src: 'Discounts', amt: 2.4, pct: 5.8, sev: 'Critical', driver: 'Fashion & Grocery (30–40% avg discount)', color: C.red },
                { src: 'Returns / Refunds', amt: 1.7, pct: 4.1, sev: 'High', driver: 'Fashion (18% return rate)', color: C.orange },
                { src: 'Shipping Costs', amt: 1.2, pct: 2.9, sev: 'High', driver: 'North region (₹0.42L cost)', color: '#f59e0b' },
                { src: 'Failed Deliveries', amt: 0.7, pct: 1.7, sev: 'Medium', driver: 'North region (7.2% failure rate)', color: C.primary },
                { src: 'Payment Fees', amt: 0.4, pct: 1.0, sev: 'Low', driver: 'COD transactions overhead', color: C.cyan },
              ].map(row => (
                <tr key={row.src} style={{ borderBottom: `1px solid ${C.border}` }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fafbff')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '11px 14px', fontWeight: 600, color: C.text }}>{row.src}</td>
                  <td style={{ padding: '0 14px', color: row.color, fontWeight: 700 }}>₹{row.amt}L</td>
                  <td style={{ padding: '0 14px', color: row.color, fontWeight: 600 }}>{row.pct}%</td>
                  <td style={{ padding: '0 14px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${row.color}18`, color: row.color, border: `1px solid ${row.color}40` }}>
                      {row.sev}
                    </span>
                  </td>
                  <td style={{ padding: '0 14px', color: C.textS }}>{row.driver}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Waterfall */}
        <div style={{ background: C.card, borderRadius: 16, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>Revenue → Profit Waterfall</div>
          <div style={{ fontSize: 12, color: C.textM, marginBottom: 12 }}>Where did the ₹41.8L go?</div>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={waterfallData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 6" stroke="#f0f2f8" />
              <XAxis dataKey="name" tick={{ fill: C.textM, fontSize: 9, fontFamily: 'Inter' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: C.textM, fontSize: 10, fontFamily: 'Inter' }} tickLine={false} axisLine={false} tickFormatter={v => `₹${v}L`} />
              <Tooltip content={<ChartTip />} />
              <Bar dataKey="value" name="₹L" radius={[5, 5, 0, 0]}>
                {waterfallData.map(e => <Cell key={e.name} fill={e.type === 'total' ? C.primary : e.type === 'profit' ? C.green : C.red} />)}
                <LabelList dataKey="value" position="top" formatter={(v: any) => `₹${Math.abs(v)}L`} style={{ fill: C.textM, fontSize: 9, fontFamily: 'Inter' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Discount Scatter */}
        <div style={{ background: C.card, borderRadius: 16, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>Discount vs Profit Margin</div>
          <div style={{ fontSize: 12, color: C.textM, marginBottom: 12 }}>Above 25% discount → consistent margin erosion</div>
          <ResponsiveContainer width="100%" height={230}>
            <ScatterChart margin={{ top: 4, right: 16, left: 0, bottom: 16 }}>
              <CartesianGrid strokeDasharray="3 6" stroke="#f0f2f8" />
              <XAxis type="number" dataKey="discount" name="Discount %" tick={{ fill: C.textM, fontSize: 10, fontFamily: 'Inter' }} tickLine={false} axisLine={false} label={{ value: 'Discount %', position: 'insideBottom', offset: -8, fill: C.textM, fontSize: 10 }} />
              <YAxis type="number" dataKey="profit" name="Margin %" tick={{ fill: C.textM, fontSize: 10, fontFamily: 'Inter' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
              <ReferenceLine y={0} stroke="#ed9ac1" strokeDasharray="4 4" strokeWidth={1.5} />
              <ReferenceLine x={25} stroke="#d4b800" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: '25% ⚠', fill: '#d4b800', fontSize: 9, position: 'top' }} />
              <Tooltip cursor={{ stroke: C.border }} content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const d = payload[0]?.payload
                return (
                  <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', fontSize: 11, fontFamily: 'Inter', color: C.text, boxShadow: '0 4px 20px rgba(0,0,0,0.10)' }}>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>{d.name}</div>
                    <div style={{ color: C.textS }}>Discount: <strong style={{ color: '#d4b800' }}>{d.discount}%</strong></div>
                    <div style={{ color: C.textS }}>Margin: <strong style={{ color: d.profit < 0 ? '#c8608a' : '#9abe30' }}>{d.profit}%</strong></div>
                  </div>
                )
              }} />
              <Scatter data={scatterData} fill={C.primary}>
                {scatterData.map((e, i) => <Cell key={i} fill={e.profit < 0 ? '#ed9ac1' : e.profit < 8 ? '#fff680' : '#e0ef70'} />)}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      <GlobalShippingSection />
    </div>
  )
}

// ─── Pre-sorted data (computed once to avoid recharts read-only array errors) ──
const customersByClv = [...customers].sort((a, b) => b.clv - a.clv)
const productsByProfit = [...products].sort((a, b) => b.profit - a.profit)
const lowMarginProducts = products
  .filter(p => p.profit / p.revenue < 0.1)
  .sort((a, b) => a.profit / a.revenue - b.profit / b.revenue)

// ─── Page 3: Customer Value ───────────────────────────────────────────────────
function Page3() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 24 }}>
      {/* Segment cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        {[
          { seg: 'High', count: 3, revenue: 4.91, profit: 1.11, avgClv: 11133, avgAov: 6984, icon: '🏆', color: '#9abe30', colorL: '#f0facc' },
          { seg: 'Medium', count: 3, revenue: 2.35, profit: 0.43, avgClv: 4533, avgAov: 7563, icon: '⭐', color: '#6ec8f0', colorL: '#e2f5ff' },
          { seg: 'Low', count: 3, revenue: 0.78, profit: 0.05, avgClv: 733, avgAov: 9111, icon: '📊', color: '#d4b800', colorL: '#fffde0' },
        ].map(s => (
          <div key={s.seg} style={{ background: C.card, borderRadius: 16, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: `1px solid ${s.color}30` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: s.colorL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{s.seg} Value</div>
                <div style={{ fontSize: 11, color: C.textM }}>{s.count} customers</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Revenue', val: fmtS(s.revenue), col: s.color },
                { label: 'Profit', val: fmt(s.profit), col: s.profit > 0 ? C.green : C.red },
                { label: 'Avg CLV', val: `₹${s.avgClv.toLocaleString('en-IN')}`, col: C.text },
                { label: 'Avg AOV', val: `₹${s.avgAov.toLocaleString('en-IN')}`, col: C.text },
              ].map(m => (
                <div key={m.label}>
                  <div style={{ fontSize: 10, color: C.textM, marginBottom: 2 }}>{m.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: m.col }}>{m.val}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Customer scatter */}
        <div style={{ background: C.card, borderRadius: 16, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>Customer Value Map</div>
          <div style={{ fontSize: 12, color: C.textM, marginBottom: 12 }}>Revenue contribution vs profit generated</div>
          <ResponsiveContainer width="100%" height={220}>
            <ScatterChart margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 6" stroke="#f0f2f8" />
              <XAxis type="number" dataKey="revenue" name="Revenue ₹L" tick={{ fill: C.textM, fontSize: 10, fontFamily: 'Inter' }} tickLine={false} axisLine={false} tickFormatter={v => `₹${v}L`} />
              <YAxis type="number" dataKey="profit" name="Profit ₹L" tick={{ fill: C.textM, fontSize: 10, fontFamily: 'Inter' }} tickLine={false} axisLine={false} tickFormatter={v => `₹${v}L`} />
              <Tooltip cursor={{ stroke: C.border }} content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const d = payload[0]?.payload as typeof customers[0]
                return (
                  <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', fontSize: 11, fontFamily: 'Inter', color: C.text, boxShadow: '0 4px 20px rgba(0,0,0,0.10)' }}>
                    <div style={{ fontWeight: 700, color: C.text, marginBottom: 4 }}>{d.name}</div>
                    <div style={{ color: C.textS }}>Revenue: <strong>{fmtS(d.revenue)}</strong></div>
                    <div style={{ color: C.textS }}>Profit: <strong style={{ color: SEGMENT_COLOR[d.segment] }}>{fmt(d.profit)}</strong></div>
                    <div style={{ color: C.textS }}>CLV: <strong>₹{d.clv.toLocaleString('en-IN')}</strong></div>
                  </div>
                )
              }} />
              <Scatter data={customers} fill={C.primary}>
                {customers.map((c, i) => <Cell key={i} fill={SEGMENT_COLOR[c.segment]} r={7} />)}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 16, fontSize: 11, fontWeight: 500, marginTop: 8 }}>
            {['High','Medium','Low'].map(s => <span key={s} style={{ color: SEGMENT_COLOR[s] }}>■ {s}</span>)}
          </div>
        </div>

        {/* CLV Bar */}
        <div style={{ background: C.card, borderRadius: 16, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>Customer Lifetime Value</div>
          <div style={{ fontSize: 12, color: C.textM, marginBottom: 12 }}>High-value customers drive disproportionate profit</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={customersByClv} layout="vertical" margin={{ top: 0, right: 60, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 6" stroke="#f0f2f8" horizontal={false} />
              <XAxis type="number" tick={{ fill: C.textM, fontSize: 9, fontFamily: 'Inter' }} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
              <YAxis dataKey="name" type="category" tick={{ fill: C.textS, fontSize: 9, fontFamily: 'Inter' }} tickLine={false} axisLine={false} width={88} />
              <Tooltip content={<ChartTip />} />
              <Bar dataKey="clv" name="CLV ₹" radius={[0, 6, 6, 0]}>
                {customersByClv.map(c => <Cell key={c.id} fill={SEGMENT_COLOR[c.segment]} />)}
                <LabelList dataKey="clv" position="right" formatter={(v: any) => `₹${(v / 1000).toFixed(1)}K`} style={{ fill: C.textM, fontSize: 9, fontFamily: 'Inter' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Customer table */}
      <div style={{ background: C.card, borderRadius: 16, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 16 }}>Customer Detail — Value, Behaviour & Profitability</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                {['Customer','Segment','Revenue','Profit','Orders','AOV','Return Rate','CLV'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: C.textS, fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customersByClv.map(c => (
                <tr key={c.id} style={{ borderBottom: `1px solid ${C.border}` }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fafbff')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: C.text }}>{c.name}</td>
                  <td style={{ padding: '0 12px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${SEGMENT_COLOR[c.segment]}18`, color: SEGMENT_COLOR[c.segment] }}>
                      {c.segment}
                    </span>
                  </td>
                  <td style={{ padding: '0 12px', color: C.primary, fontWeight: 600 }}>{fmtS(c.revenue)}</td>
                  <td style={{ padding: '0 12px', color: c.profit < 0 ? C.red : C.green, fontWeight: 600 }}>{fmt(c.profit)}</td>
                  <td style={{ padding: '0 12px', color: C.textS }}>{c.orders}</td>
                  <td style={{ padding: '0 12px', color: C.textS }}>₹{c.aov.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '0 12px', color: c.returnRate > 15 ? C.red : C.textS }}>{c.returnRate}%</td>
                  <td style={{ padding: '0 12px', color: C.orange, fontWeight: 600 }}>₹{c.clv.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Page 4: Product Analysis ─────────────────────────────────────────────────
function Page4() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Category Revenue vs Profit */}
        <div style={{ background: C.card, borderRadius: 16, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>Category: Revenue vs Profit</div>
          <div style={{ fontSize: 12, color: C.textM, marginBottom: 12 }}>Grocery revenue does not convert to profit</div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={categoryProfit} margin={{ top: 4, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 6" stroke="#f0f2f8" />
              <XAxis dataKey="name" tick={{ fill: C.textM, fontSize: 9, fontFamily: 'Inter' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: C.textM, fontSize: 10, fontFamily: 'Inter' }} tickLine={false} axisLine={false} tickFormatter={v => `₹${v}L`} />
              <Tooltip content={<ChartTip />} />
              <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'Inter' }} />
              <Bar dataKey="revenue" name="Revenue ₹L" fill="#c0eaff" radius={[3, 3, 0, 0]} />
              <Bar dataKey="profit" name="Profit ₹L" radius={[3, 3, 0, 0]}>
                {categoryProfit.map(e => <Cell key={e.name} fill={e.profit < 0 ? '#ed9ac1' : '#9abe30'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Product Profit Ranking */}
        <div style={{ background: C.card, borderRadius: 16, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>Product Profit Ranking</div>
          <div style={{ fontSize: 12, color: C.textM, marginBottom: 12 }}>High-revenue ≠ high-profit</div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={productsByProfit} layout="vertical" margin={{ top: 0, right: 50, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 6" stroke="#f0f2f8" horizontal={false} />
              <XAxis type="number" tick={{ fill: C.textM, fontSize: 9, fontFamily: 'Inter' }} tickLine={false} axisLine={false} tickFormatter={v => `₹${v}L`} />
              <YAxis dataKey="name" type="category" tick={{ fill: C.textS, fontSize: 8, fontFamily: 'Inter' }} tickLine={false} axisLine={false} width={100} />
              <ReferenceLine x={0} stroke={C.border} strokeWidth={1.5} />
              <Tooltip content={<ChartTip />} />
              <Bar dataKey="profit" name="Profit ₹L" radius={[0, 5, 5, 0]}>
                {productsByProfit.map(p => <Cell key={p.name} fill={p.profit < 0 ? '#ed9ac1' : '#9abe30'} />)}
                <LabelList dataKey="profit" position="right" formatter={(v: any) => `₹${v}L`} style={{ fill: C.textM, fontSize: 9, fontFamily: 'Inter' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Margin vs Discount by Category */}
      <div style={{ background: C.card, borderRadius: 16, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>Category: Profit Margin vs Avg Discount</div>
        <div style={{ fontSize: 12, color: C.textM, marginBottom: 16 }}>Higher discount rates are consistently reducing margins across all categories</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={categoryProfit.map(c => ({
              ...c,
              discount: c.name === 'Fashion' ? 28 : c.name === 'Grocery' ? 30 : c.name === 'Electronics' ? 8 : c.name === 'Beauty' ? 14 : c.name === 'Sports' ? 12 : 10,
              marginPct: parseFloat(((c.profit / c.revenue) * 100).toFixed(1)),
            }))}
            margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 6" stroke="#f0f2f8" />
            <XAxis dataKey="name" tick={{ fill: C.textM, fontSize: 10, fontFamily: 'Inter' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: C.textM, fontSize: 10, fontFamily: 'Inter' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
            <Tooltip content={<ChartTip />} />
            <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'Inter' }} />
            <ReferenceLine y={0} stroke={C.border} strokeWidth={1.5} />
            <Bar dataKey="discount" name="Avg Discount %" fill="#fff680" radius={[3, 3, 0, 0]} />
            <Bar dataKey="marginPct" name="Profit Margin %" radius={[3, 3, 0, 0]}>
              {categoryProfit.map(e => <Cell key={e.name} fill={e.margin < 0 ? '#ed9ac1' : '#9abe30'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Action Required Table */}
      <div style={{ background: C.card, borderRadius: 16, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: `2px solid ${C.red}30` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: C.redL, color: C.red, border: `1px solid ${C.red}40` }}>
            ⚠ Action Required
          </span>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Low / Negative Margin Products</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                {['Product','Category','Revenue','Profit','Margin','Discount','Returns','Issue'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: C.textS, fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lowMarginProducts.map(p => {
                const margin = (p.profit / p.revenue) * 100
                const issue = p.discount > 30 ? 'Over-discounted' : p.returns > 18 ? 'High returns' : p.profit < 0 ? 'Margin-negative' : 'Low margin'
                return (
                  <tr key={p.name} style={{ borderBottom: `1px solid ${C.border}` }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#fff5f5')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: C.text }}>{p.name}</td>
                    <td style={{ padding: '0 12px', color: C.textS }}>{p.category}</td>
                    <td style={{ padding: '0 12px', color: C.primary, fontWeight: 600 }}>{fmtS(p.revenue)}</td>
                    <td style={{ padding: '0 12px', color: p.profit < 0 ? C.red : C.orange, fontWeight: 600 }}>{fmt(p.profit)}</td>
                    <td style={{ padding: '0 12px', color: margin < 0 ? C.red : C.orange, fontWeight: 600 }}>{margin.toFixed(1)}%</td>
                    <td style={{ padding: '0 12px', color: p.discount > 25 ? C.red : C.textS }}>{p.discount}%</td>
                    <td style={{ padding: '0 12px', color: p.returns > 15 ? C.red : C.textS }}>{p.returns}%</td>
                    <td style={{ padding: '0 12px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: C.redL, color: C.red, border: `1px solid ${C.red}40` }}>
                        {issue}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const NAV = [
  { id: 1, label: 'Executive Overview', dot: C.primary },
  { id: 2, label: 'Profit Leakage',     dot: C.red },
  { id: 3, label: 'Customer Value',     dot: C.cyan },
  { id: 4, label: 'Product Analysis',   dot: C.orange },
]

function Sidebar({ page, setPage }: { page: number; setPage: (p: number) => void }) {
  return (
    <aside style={{
      width: 216, minHeight: '100vh', background: C.card,
      borderRight: `1px solid ${C.border}`, flexShrink: 0,
      display: 'flex', flexDirection: 'column',
      boxShadow: '2px 0 8px rgba(0,0,0,0.04)',
    }}>
      {/* Logo */}
      <div style={{ padding: '22px 20px 18px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #e0ef70, #6ec8f0)', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.text, lineHeight: 1.1, letterSpacing: '-0.01em' }}>ProfitLens</div>
            <div style={{ fontSize: 9, color: C.textM, letterSpacing: '0.06em', fontWeight: 600, marginTop: 1 }}>ANALYTICS SUITE</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '16px 12px', flex: 1 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: C.textM, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 8px', marginBottom: 10 }}>
          Dashboard
        </div>
        {NAV.map(n => {
          const active = page === n.id
          return (
            <button
              key={n.id}
              onClick={() => setPage(n.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 10, border: 'none',
                background: active ? C.primaryL : 'transparent',
                color: active ? C.primary : C.textS,
                fontSize: 12, fontWeight: active ? 700 : 400,
                cursor: 'pointer', textAlign: 'left',
                marginBottom: 2, transition: 'all 0.13s',
                fontFamily: 'Inter',
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = '#F4F2FF' }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.dot, flexShrink: 0, opacity: active ? 1 : 0.45 }} />
              <span>{n.label}</span>
              {active && <div style={{ marginLeft: 'auto', width: 3, height: 16, borderRadius: 2, background: C.primary }} />}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '14px 20px', borderTop: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 20, background: '#E7F7EE', border: '1px solid #B8E8CE' }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#5BAD8A' }} />
            <span style={{ fontSize: 10, fontWeight: 600, color: '#5BAD8A' }}>Live Data</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #9abe30, #6ec8f0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff', fontWeight: 700, flexShrink: 0 }}>A</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>Admin</div>
            <div style={{ fontSize: 10, color: C.textM }}>analytics@store.in</div>
          </div>
        </div>
      </div>
    </aside>
  )
}

// ─── Filter Bar ───────────────────────────────────────────────────────────────
function FilterBar({ filters, setFilters }: { filters: Filters; setFilters: (f: Filters) => void }) {
  const [calOpen, setCalOpen] = useState(false)

  const selStyle: React.CSSProperties = {
    fontSize: 11, padding: '6px 10px', borderRadius: 8,
    border: `1px solid ${C.border}`, background: '#F8F9FC', color: C.textS,
    fontFamily: 'Inter', cursor: 'pointer', outline: 'none',
  }

  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8,
      background: '#F8F9FC', border: `1px solid ${C.border}`,
      borderRadius: 14, padding: '10px 16px',
    }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: C.textM, letterSpacing: '0.04em', marginRight: 2 }}>FILTERS</span>

      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setCalOpen(o => !o)}
          style={{
            ...selStyle,
            display: 'flex', alignItems: 'center', gap: 6,
            background: calOpen ? C.primaryL : '#F8F9FC',
            color: calOpen ? C.primary : C.textS,
            border: `1px solid ${calOpen ? C.primary : C.border}`,
          }}
        >
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><rect x="1" y="2" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M4 1v2M8 1v2M1 5h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
          <span>{filters.date}</span>
          <span style={{ fontSize: 8, opacity: 0.5 }}>▼</span>
        </button>
        {calOpen && (
          <CalendarPicker
            onClose={() => setCalOpen(false)}
            onApply={(label) => setFilters({ ...filters, date: label })}
          />
        )}
      </div>

      {[
        { key: 'category' as const, opts: ['All Categories','Electronics','Fashion','Home & Garden','Beauty','Grocery'] },
        { key: 'segment' as const, opts: ['All Segments','High Value','Medium Value','Low Value'] },
        { key: 'payment' as const, opts: ['All Methods','UPI','Credit Card','Debit Card','COD','NetBanking'] },
      ].map(({ key, opts }) => (
        <select key={key} value={filters[key]} onChange={e => setFilters({ ...filters, [key]: e.target.value })} style={selStyle}>
          {opts.map(o => <option key={o}>{o}</option>)}
        </select>
      ))}

      <div style={{ marginLeft: 'auto', fontSize: 11, color: C.textM, fontWeight: 500 }}>FY 2024–25 · 12,540 orders</div>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<Filters>(initialFilters)
  const currentPage = NAV.find(n => n.id === page)!

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Sidebar page={page} setPage={setPage} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top header */}
        <header style={{
          background: C.card, borderBottom: `1px solid ${C.border}`,
          padding: '0 24px', display: 'flex', alignItems: 'center',
          height: 52, flexShrink: 0, gap: 12,
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: C.textM, marginBottom: 1, letterSpacing: '0.03em' }}>ProfitLens / {currentPage.label}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.text, letterSpacing: '-0.01em' }}>{currentPage.label}</div>
          </div>
          <div style={{ fontSize: 11, color: C.textM }}>22 Sep 2025, 14:32 IST</div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto' }}>
          {page === 1 && <Page1 filters={filters} setFilters={setFilters} />}
          {page === 2 && <Page2 filters={filters} setFilters={setFilters} />}
          {page === 3 && <Page3 />}
          {page === 4 && <Page4 />}
        </main>
      </div>
    </div>
  )
}
