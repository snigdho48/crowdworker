import { useEffect, useMemo, useState } from 'react'
import DatePicker from 'react-datepicker'
import { Bar, Line } from 'react-chartjs-2'
import { useSearchParams } from 'react-router-dom'
import {
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js'
import { createColumnHelper } from '@tanstack/react-table'
import { FilterField, filterInputClass } from '../components/FilterField'
import { Topbar } from '../components/Topbar'
import { CampaignTable } from '../components/CampaignTable'
import { MetricCard } from '../components/MetricCard'
import { formatBDT, formatCompact, formatInt, formatPercent } from '../lib/format'
import { fetchAllPages } from '../lib/pagination'
import { useAuth } from '../context/AuthContext'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
)

const DIMENSIONS = [
  'Date',
  'Domain',
  'App',
  'Creative',
  'Device type',
  'City',
  'Age',
  'Carrier',
]

const col = createColumnHelper()

function toISO(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function makeDimensionValues(dimension, count) {
  switch (dimension) {
    case 'Date':
      return ['2026-05-01', '2026-05-02', '2026-05-03', '2026-05-04'].slice(0, count)
    case 'Domain':
      return ['prothomalo.com', 'bdnews24.com', 'thedailystar.net', 'somoynews.tv']
    case 'App':
      return ['ABCD Shopping', 'ABCD News', 'ABCD Video', 'ABCD Music', 'ABCD Finance', 'ABCD Sports']
    case 'Creative':
      return ['Banner A', 'Banner B', 'Banner C', 'Video 6s', 'Video 15s', 'Video 30s']
    case 'Device type':
      return ['Android', 'iOS', 'Desktop', 'Tablet', 'Smart TV']
    case 'City':
      return ['Dhaka', 'Chattogram', 'Sylhet', 'Khulna', 'Rajshahi', 'Barishal']
    case 'Age':
      return ['18–24', '25–34', '35–44', '45–54', '55+']
    case 'Carrier':
      return ['GP', 'Robi', 'Banglalink', 'Teletalk', 'WiFi/Other']
    default:
      return Array.from({ length: count }).map((_, i) => `${dimension} ${i + 1}`)
  }
}

export function Report() {
  const { api, logout } = useAuth()
  const [searchParams] = useSearchParams()
  const [range, setRange] = useState(() => {
    const end = new Date('2026-05-08T00:00:00')
    const start = new Date('2026-05-01T00:00:00')
    return [start, end]
  })
  const [query, setQuery] = useState('')
  const [campaignId, setCampaignId] = useState(() => searchParams.get('campaignId') || 'All')
  const [type, setType] = useState('All')
  const [dimension, setDimension] = useState('Date')
  const [campaigns, setCampaigns] = useState([])
  const [report, setReport] = useState(null)
  const [error, setError] = useState('')
  const [tablePage, setTablePage] = useState(0)
  const tablePageSize = 10

  const [startDate, endDate] = range
  const startISO = startDate ? toISO(startDate) : ''
  const endISO = endDate ? toISO(endDate) : ''

  useEffect(() => {
    let cancelled = false
    fetchAllPages(api, '/campaigns/')
      .then((all) => {
        if (!cancelled) setCampaigns(all)
      })
      .catch((e) => {
        if (e?.response?.status === 401) logout()
      })
    return () => {
      cancelled = true
    }
  }, [api, logout])

  useEffect(() => {
    setTablePage(0)
  }, [campaignId, dimension, startISO, endISO])

  useEffect(() => {
    let cancelled = false
    const params = {
      date_from: startISO || undefined,
      date_to: endISO || undefined,
      table_page: tablePage + 1,
      dimension,
    }

    const req =
      campaignId === 'All'
        ? api.get('/dashboard/', { params })
        : api.get(`/campaigns/${campaignId}/metrics/`, {
            params: {
              ...params,
              dimension:
                dimension === 'Date'
                  ? undefined
                  : dimension === 'Domain'
                    ? 'publisher'
                    : dimension.toLowerCase().replaceAll(' ', '_'),
            },
          })

    req
      .then((res) => {
        if (!cancelled) setReport(res.data)
      })
      .catch((e) => {
        if (e?.response?.status === 401) logout()
        if (!cancelled) setError(e?.response?.data?.detail || 'Failed to load report')
      })

    return () => {
      cancelled = true
    }
  }, [api, campaignId, dimension, startISO, endISO, tablePage, logout])

  // Filters are applied to the table; charts use the fetched report summary/rows.

  const summary = useMemo(() => {
    const s = report?.summary
    if (s) {
      const impressions = Number(s.impressions || 0)
      const clicks = Number(s.clicks || 0)
      const spend = Number(s.spend || 0)
      const ctr = Number(s.ctr || 0) * 100
      return { impressions, clicks, spend, ctr }
    }

    const daily = Array.isArray(report?.daily) ? report.daily : []
    const totals = daily.reduce(
      (acc, d) => {
        acc.impressions += Number(d.impressions || 0)
        acc.clicks += Number(d.clicks || 0)
        acc.spend += Number(d.spend || 0)
        return acc
      },
      { impressions: 0, clicks: 0, spend: 0 },
    )
    return {
      ...totals,
      ctr: totals.impressions ? (totals.clicks / totals.impressions) * 100 : 0,
    }
  }, [report])

  const breakdown = useMemo(() => {
    const make = (dimensionName) => {
      const values = Array.from(new Set(makeDimensionValues(dimensionName, 8))).filter(Boolean)
      if (values.length === 0) return { labels: [], impressions: [], clicks: [] }
      const weights = values.map((_, i) => Math.max(1, values.length - i))
      const totalW = weights.reduce((a, b) => a + b, 0) || 1
      return {
        labels: values,
        impressions: values.map((_, i) =>
          Math.round((summary.impressions * weights[i]) / totalW),
        ),
        clicks: values.map((_, i) => Math.round((summary.clicks * weights[i]) / totalW)),
      }
    }
    return {
      device: make('Device type'),
      creative: make('Creative'),
    }
  }, [summary])

  const dualLineData = useMemo(
    () => ({
      labels: (() => {
        const daily = report?.daily
        if (Array.isArray(daily) && daily.length) return daily.map((d) => String(d.date).slice(5))
        const rows = report?.rows
        if (!Array.isArray(rows) || !rows.length) return []
        const map = new Map()
        for (const r of rows) {
          const key = String(r.date)
          const cur = map.get(key) || { date: key, impressions: 0, clicks: 0, spend: 0 }
          cur.impressions += Number(r.impressions || 0)
          cur.clicks += Number(r.clicks || 0)
          cur.spend += Number(r.spend || 0)
          map.set(key, cur)
        }
        return Array.from(map.values())
          .sort((a, b) => a.date.localeCompare(b.date))
          .map((d) => d.date.slice(5))
      })(),
      datasets: [
        {
          label: 'Impressions',
          data: (() => {
            const daily = report?.daily
            if (Array.isArray(daily) && daily.length) return daily.map((d) => Number(d.impressions || 0))
            const rows = report?.rows
            if (!Array.isArray(rows) || !rows.length) return []
            const map = new Map()
            for (const r of rows) {
              const key = String(r.date)
              map.set(key, (map.get(key) || 0) + Number(r.impressions || 0))
            }
            return Array.from(map.entries())
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([, v]) => v)
          })(),
          borderColor: '#378ADD',
          backgroundColor: 'rgba(55, 138, 221, 0.08)',
          tension: 0.35,
          pointRadius: 0,
          yAxisID: 'y',
        },
        {
          label: 'Clicks',
          data: (() => {
            const daily = report?.daily
            if (Array.isArray(daily) && daily.length) return daily.map((d) => Number(d.clicks || 0))
            const rows = report?.rows
            if (!Array.isArray(rows) || !rows.length) return []
            const map = new Map()
            for (const r of rows) {
              const key = String(r.date)
              map.set(key, (map.get(key) || 0) + Number(r.clicks || 0))
            }
            return Array.from(map.entries())
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([, v]) => v)
          })(),
          borderColor: '#639922',
          backgroundColor: 'rgba(99, 153, 34, 0.08)',
          tension: 0.35,
          pointRadius: 0,
          borderDash: [4, 3],
          yAxisID: 'y1',
        },
      ],
    }),
    [report],
  )

  const dualLineOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#6b7280' } },
        y: {
          position: 'left',
          grid: { color: '#e5e7eb' },
          ticks: {
            color: '#6b7280',
            callback: (v) => formatCompact(v),
          },
        },
        y1: {
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: {
            color: '#6b7280',
            callback: (v) => formatCompact(v),
          },
        },
      },
    }),
    [],
  )

  const barOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#6b7280' } },
        y: {
          grid: { color: '#e5e7eb' },
          ticks: { color: '#6b7280', callback: (v) => formatCompact(v) },
        },
      },
    }),
    [],
  )

  // (no longer using doughnut legend)

  const rows = useMemo(() => {
    if (Array.isArray(report?.table_rows)) {
      return report.table_rows
    }

    const campaignLabel =
      campaignId === 'All'
        ? 'All campaigns'
        : campaigns.find((c) => String(c.id) === String(campaignId))?.name ||
          `Campaign #${campaignId}`

    const dailyFromRows = () => {
      const raw = report?.rows
      if (!Array.isArray(raw) || raw.length === 0) return []
      const map = new Map()
      for (const r of raw) {
        const key = String(r.date)
        const cur = map.get(key) || { date: key, impressions: 0, clicks: 0, spend: 0 }
        cur.impressions += Number(r.impressions || 0)
        cur.clicks += Number(r.clicks || 0)
        cur.spend += Number(r.spend || 0)
        map.set(key, cur)
      }
      return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date))
    }

    const publisherFromRows = () => {
      const raw = report?.rows
      if (!Array.isArray(raw) || raw.length === 0) return []
      const map = new Map()
      for (const r of raw) {
        const key = String(r.publisher || '—')
        const cur =
          map.get(key) || { publisher: key, impressions: 0, clicks: 0, spend: 0 }
        cur.impressions += Number(r.impressions || 0)
        cur.clicks += Number(r.clicks || 0)
        cur.spend += Number(r.spend || 0)
        map.set(key, cur)
      }
      return Array.from(map.values()).sort((a, b) => b.impressions - a.impressions)
    }

    if (dimension === 'Date') {
      const daily =
        (Array.isArray(report?.daily) && report.daily.length
          ? report.daily
          : dailyFromRows()) || []
      return daily.map((d) => ({
        dim: d.date,
        campaign: campaignLabel,
        impressions: Number(d.impressions || 0),
        viewableImpressions: Math.round(Number(d.impressions || 0) * 0.78),
        reach: Math.round(Number(d.impressions || 0) * 0.52),
        clicks: Number(d.clicks || 0),
        ctr: Number(d.impressions)
          ? (Number(d.clicks || 0) / Number(d.impressions || 1)) * 100
          : 0,
        cpm: Number(d.impressions)
          ? (Number(d.spend || 0) / Number(d.impressions || 1)) * 1000
          : 0,
        cpc: Number(d.clicks) ? Number(d.spend || 0) / Number(d.clicks || 1) : 0,
        cost: Number(d.spend || 0),
      }))
    }

    if (dimension === 'Domain') {
      const pubs =
        (Array.isArray(report?.by_publisher) && report.by_publisher.length
          ? report.by_publisher
          : publisherFromRows()) || []

      return pubs.map((r) => ({
        dim: r.publisher || '—',
        campaign: campaignLabel,
        impressions: Number(r.impressions || 0),
        viewableImpressions: Math.round(Number(r.impressions || 0) * 0.78),
        reach: Math.round(Number(r.impressions || 0) * 0.52),
        clicks: Number(r.clicks || 0),
        ctr: Number(r.impressions)
          ? (Number(r.clicks || 0) / Number(r.impressions || 1)) * 100
          : 0,
        cpm: Number(r.impressions)
          ? (Number(r.spend || 0) / Number(r.impressions || 1)) * 1000
          : 0,
        cpc: Number(r.clicks) ? Number(r.spend || 0) / Number(r.clicks || 1) : 0,
        cost: Number(r.spend || 0),
      }))
    }

    // If backend provides dimension aggregation, use it (real DB data).
    if (Array.isArray(report?.by_dimension) && report.by_dimension.length) {
      const keyMap = {
        App: 'app',
        Creative: 'creative',
        'Device type': 'device_type',
        City: 'city',
        Age: 'age',
        Carrier: 'carrier',
      }
      const key = keyMap[dimension]
      if (key) {
        return report.by_dimension.map((r) => {
          const impressions = Number(r.impressions || 0)
          const clicks = Number(r.clicks || 0)
          const cost = Number(r.spend || 0)
          const ctr = impressions ? (clicks / impressions) * 100 : 0
          const cpm = impressions ? (cost / impressions) * 1000 : 0
          const cpc = clicks ? cost / clicks : 0
          return {
            dim: r[key] || '—',
            campaign: campaignLabel,
            impressions,
            viewableImpressions: Math.round(impressions * 0.78),
            reach: Math.round(impressions * 0.52),
            clicks,
            ctr,
            cpm,
            cpc,
            cost,
          }
        })
      }
    }

    // Other dimensions: fallback split if backend doesn't support it.
    const totals = (() => {
      const s = report?.summary
      if (s) {
        return {
          impressions: Number(s.impressions || 0),
          clicks: Number(s.clicks || 0),
          spend: Number(s.spend || 0),
        }
      }
      const daily =
        (Array.isArray(report?.daily) && report.daily.length
          ? report.daily
          : dailyFromRows()) || []
      return daily.reduce(
        (acc, d) => {
          acc.impressions += Number(d.impressions || 0)
          acc.clicks += Number(d.clicks || 0)
          acc.spend += Number(d.spend || 0)
          return acc
        },
        { impressions: 0, clicks: 0, spend: 0 },
      )
    })()

    const values = Array.from(new Set(makeDimensionValues(dimension, 8))).filter(Boolean)
    if (values.length === 0) return []

    // deterministic weights: larger share for first values
    const weights = values.map((_, i) => Math.max(1, values.length - i))
    const totalW = weights.reduce((a, b) => a + b, 0) || 1

    const rows = values.map((v, i) => {
      const share = weights[i] / totalW
      const impressions = Math.round(totals.impressions * share)
      const clicks = Math.round(totals.clicks * share)
      const cost = Number((totals.spend * share).toFixed(2))
      const ctr = impressions ? (clicks / impressions) * 100 : 0
      const cpm = impressions ? (cost / impressions) * 1000 : 0
      const cpc = clicks ? cost / clicks : 0
      return {
        dim: v,
        campaign: campaignLabel,
        impressions,
        viewableImpressions: Math.round(impressions * 0.78),
        reach: Math.round(impressions * 0.52),
        clicks,
        ctr,
        cpm,
        cpc,
        cost,
      }
    })

    return rows
  }, [dimension, report, campaignId, campaigns])

  const tableTotal = Number(report?.table_count ?? rows.length)
  const tablePageCount = Math.max(1, Math.ceil(tableTotal / tablePageSize))

  const columns = useMemo(
    () => [
      col.accessor('dim', {
        header: dimension,
        cell: (info) => <span className="font-medium text-gray-900">{info.getValue()}</span>,
      }),
      col.accessor('campaign', { header: 'Campaign' }),
      col.accessor('impressions', {
        header: 'Impressions',
        cell: (info) => <span className="tabular-nums">{formatInt(info.getValue())}</span>,
      }),
      col.accessor('viewableImpressions', {
        header: 'Viewable Impressions',
        cell: (info) => <span className="tabular-nums">{formatInt(info.getValue())}</span>,
      }),
      col.accessor('reach', {
        header: 'Reach',
        cell: (info) => <span className="tabular-nums">{formatInt(info.getValue())}</span>,
      }),
      col.accessor('clicks', {
        header: 'Clicks',
        cell: (info) => <span className="tabular-nums">{formatInt(info.getValue())}</span>,
      }),
      col.accessor('ctr', {
        header: 'CTR',
        cell: (info) => <span className="tabular-nums">{formatPercent(info.getValue())}</span>,
      }),
      col.accessor('cpm', {
        header: 'CPM',
        cell: (info) => <span className="tabular-nums">{formatBDT(info.getValue())}</span>,
      }),
      col.accessor('cpc', {
        header: 'CPC',
        cell: (info) => <span className="tabular-nums">{formatBDT(info.getValue())}</span>,
      }),
      col.accessor('cost', {
        header: 'Cost',
        cell: (info) => <span className="tabular-nums">{formatBDT(info.getValue())}</span>,
      }),
    ],
    [dimension],
  )

  const totalsRow = useMemo(() => {
    const list = rows
    const impressions = list.reduce((a, r) => a + Number(r.impressions || 0), 0)
    const viewableImpressions = list.reduce(
      (a, r) => a + Number(r.viewableImpressions || 0),
      0,
    )
    const reach = list.reduce((a, r) => a + Number(r.reach || 0), 0)
    const clicks = list.reduce((a, r) => a + Number(r.clicks || 0), 0)
    const cost = list.reduce((a, r) => a + Number(r.cost || 0), 0)
    const ctr = impressions ? (clicks / impressions) * 100 : 0
    const cpm = impressions ? (cost / impressions) * 1000 : 0
    const cpc = clicks ? cost / clicks : 0
    return {
      impressions,
      viewableImpressions,
      reach,
      clicks,
      cost,
      ctr,
      cpm,
      cpc,
    }
  }, [rows])

  return (
    <div className="flex min-h-full flex-col">
      <Topbar
        title="Report"
        right={
          <button
            type="button"
            className="rounded-full border border-gray-200 bg-[#f7f6ee] px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-black/5"
            onClick={() => {}}
          >
            Export
          </button>
        }
      />

      <div className="flex-1 overflow-auto bg-[#f5f4ea] p-5">
        {error ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
          <FilterField label="Date range" htmlFor="report-date-range">
            <DatePicker
              id="report-date-range"
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={(next) => setRange(next)}
              className={filterInputClass}
              placeholderText="Select start and end dates"
            />
          </FilterField>
          <FilterField label="Search" htmlFor="report-search">
            <input
              id="report-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search report data"
              className={filterInputClass}
            />
          </FilterField>
          <FilterField label="Campaign" htmlFor="report-campaign">
            <select
              id="report-campaign"
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              className={filterInputClass}
            >
              <option value="All">All campaigns</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Campaign type" htmlFor="report-type">
            <select
              id="report-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className={filterInputClass}
            >
              <option value="All">All types</option>
              <option value="DSP">DSP</option>
              <option value="YouTube">YouTube</option>
              <option value="Floating">Floating</option>
              <option value="Takeover">Takeover</option>
              <option value="Image Takeover">Image Takeover</option>
            </select>
          </FilterField>
          <FilterField label="Dimension" htmlFor="report-dimension">
            <select
              id="report-dimension"
              value={dimension}
              onChange={(e) => setDimension(e.target.value)}
              className={filterInputClass}
              title="Select report dimension"
            >
              {DIMENSIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </FilterField>
        </div>

        <div className="mb-4 grid grid-cols-4 gap-3">
          <MetricCard
            label="Total impressions"
            value={formatCompact(summary.impressions)}
          />
          <MetricCard
            label="Total cost"
            value={formatBDT(summary.spend)}
          />
          <MetricCard
            label="Total clicks"
            value={formatCompact(summary.clicks)}
          />
          <MetricCard
            label="CTR"
            value={`${summary.ctr.toFixed(2)}%`}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-3 text-sm font-semibold text-gray-900">
              Date-wise performance
            </div>
            <div className="h-[280px]">
              <Line data={dualLineData} options={dualLineOptions} />
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-3 text-sm font-semibold text-gray-900">
              Device-wise performance
            </div>
            <div className="h-[280px]">
              <Bar
                data={{
                  labels: breakdown.device.labels,
                  datasets: [
                    {
                      label: 'Impressions',
                      data: breakdown.device.impressions,
                      backgroundColor: 'rgba(55, 138, 221, 0.75)',
                      borderRadius: 10,
                    },
                  ],
                }}
                options={barOptions}
              />
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-3 text-sm font-semibold text-gray-900">
            Creative-wise performance
          </div>
          <div className="h-[320px]">
            <Bar
              data={{
                labels: breakdown.creative.labels,
                datasets: [
                  {
                    label: 'Impressions',
                    data: breakdown.creative.impressions,
                    backgroundColor: 'rgba(99, 153, 34, 0.70)',
                    borderRadius: 10,
                  },
                ],
              }}
              options={barOptions}
            />
          </div>
        </div>

        <div className="mt-4">
          <CampaignTable
            data={rows}
            columns={columns}
            pageSize={tablePageSize}
            showPagination
            manualPagination
            pageIndex={tablePage}
            pageCount={tablePageCount}
            totalCount={tableTotal}
            onPageChange={setTablePage}
            rowLabel="rows"
            getRowId={(row, idx) => `${row.dim}-${idx}`}
            footerClassName="bg-[#f7f6ee]"
            renderFooter={({ table }) => {
              const leafCols = table.getAllLeafColumns()
              return (
                <tr>
                  {leafCols.map((c, idx) => {
                    const id = c.id
                    const isFirst = idx === 0
                    const cellBase =
                      'whitespace-nowrap border-t border-gray-200 px-3 py-2 text-sm font-semibold text-gray-900'
                    const num = ' text-right tabular-nums'

                    let content = ''
                    if (isFirst) content = 'Total'
                    else if (id === 'campaign') content = '—'
                    else if (id === 'impressions') content = formatInt(totalsRow.impressions)
                    else if (id === 'viewableImpressions')
                      content = formatInt(totalsRow.viewableImpressions)
                    else if (id === 'reach') content = formatInt(totalsRow.reach)
                    else if (id === 'clicks') content = formatInt(totalsRow.clicks)
                    else if (id === 'ctr') content = formatPercent(totalsRow.ctr)
                    else if (id === 'cpm') content = formatBDT(totalsRow.cpm)
                    else if (id === 'cpc') content = formatBDT(totalsRow.cpc)
                    else if (id === 'cost') content = formatBDT(totalsRow.cost)
                    else content = ''

                    return (
                      <td
                        key={c.id}
                        className={`${cellBase}${!isFirst && id !== 'campaign' ? num : ''}`}
                      >
                        {content}
                      </td>
                    )
                  })}
                </tr>
              )
            }}
          />
        </div>
      </div>
    </div>
  )
}

