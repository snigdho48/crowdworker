import { useEffect, useMemo, useState } from 'react'
import DatePicker from 'react-datepicker'
import { Bar, Line } from 'react-chartjs-2'
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  BarElement,
  Tooltip,
} from 'chart.js'
import {
  IconChartBar,
  IconFileText,
  IconPhoto,
} from '@tabler/icons-react'
import { FilterField, filterInputClass } from '../components/FilterField'
import { Topbar } from '../components/Topbar'
import { MetricCard } from '../components/MetricCard'
import { TypeBadge } from '../components/TypeBadge'
import { formatBDT, formatCompact, formatInt, formatRange } from '../lib/format'
import { useAuth } from '../context/AuthContext'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Filler,
)

const TYPE_COLORS = {
  DSP: '#378ADD',
  YouTube: '#E24B4A',
  Floating: '#639922',
  Takeover: '#EF9F27',
  'Image Takeover': '#EF9F27',
}

function toISO(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function inRange(iso, start, end) {
  if (start && iso < start) return false
  if (end && iso > end) return false
  return true
}

export function Dashboard() {
  const { api } = useAuth()
  const [range, setRange] = useState(() => {
    const end = new Date('2026-05-08T00:00:00')
    const start = new Date('2026-05-01T00:00:00')
    return [start, end]
  })

  const [startDate, endDate] = range
  const startISO = startDate ? toISO(startDate) : ''
  const endISO = endDate ? toISO(endDate) : ''

  const [server, setServer] = useState(null)
  const [error, setError] = useState('')
  const [campaignPage, setCampaignPage] = useState(0)
  const campaignPageSize = 10

  useEffect(() => {
    setCampaignPage(0)
  }, [startISO, endISO])

  useEffect(() => {
    let cancelled = false
    api
      .get('/dashboard/', {
        params: {
          date_from: startISO || undefined,
          date_to: endISO || undefined,
          status: 'live',
          page: campaignPage + 1,
          page_size: campaignPageSize,
        },
      })
      .then((res) => {
        if (!cancelled) setServer(res.data)
      })
      .catch((e) => {
        if (!cancelled) setError(e?.response?.data?.detail || 'Failed to load dashboard')
      })
    return () => {
      cancelled = true
    }
  }, [api, startISO, endISO, campaignPage, campaignPageSize])

  const campaigns = useMemo(() => server?.campaigns || [], [server])

  const filteredDaily = useMemo(() => {
    const daily = server?.daily || []
    return daily.filter((d) => inRange(d.date, startISO, endISO))
  }, [server, startISO, endISO])

  const totals = useMemo(() => {
    const impressions = Number(server?.totals?.impressions || 0)
    const clicks = Number(server?.totals?.clicks || 0)
    const totalBudget = Number(server?.totals?.spend || 0)
    const ctr = Number(server?.totals?.ctr || 0) * 100
    const active = Number(server?.stats?.active || 0)
    const ended = Number(server?.stats?.ended || 0)
    return { totalBudget, impressions, clicks, ctr, active, ended }
  }, [server])

  const clicksByType = useMemo(
    () =>
      server?.stats?.clicks_by_type || {
        DSP: 0,
        YouTube: 0,
        Floating: 0,
        Takeover: 0,
      },
    [server],
  )

  const campaignsTotal = Number(server?.stats?.campaigns_total ?? campaigns.length)

  const lineData = useMemo(() => {
    return {
      labels: filteredDaily.map((d) => d.date.slice(5)),
      datasets: [
        {
          data: filteredDaily.map((d) => d.impressions),
          borderColor: '#378ADD',
          backgroundColor: 'rgba(55, 138, 221, 0.12)',
          tension: 0.35,
          pointRadius: 0,
          fill: true,
        },
      ],
    }
  }, [filteredDaily])

  const barData = useMemo(() => {
    const labels = ['DSP', 'YouTube', 'Floating', 'Takeover']
    return {
      labels,
      datasets: [
        {
          data: labels.map((k) => clicksByType[k]),
          backgroundColor: labels.map((k) => TYPE_COLORS[k]),
          borderRadius: 8,
        },
      ],
    }
  }, [clicksByType])

  const commonOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
    }),
    [],
  )

  const lineOptions = useMemo(() => {
    return {
      ...commonOptions,
      scales: {
        x: { grid: { display: false }, ticks: { color: '#6b7280' } },
        y: {
          ticks: {
            color: '#6b7280',
            callback: (value) => formatCompact(value),
          },
          grid: { color: '#e5e7eb' },
        },
      },
    }
  }, [commonOptions])

  const barOptions = useMemo(() => {
    return {
      ...commonOptions,
      scales: {
        x: { grid: { display: false }, ticks: { color: '#6b7280' } },
        y: { grid: { color: '#e5e7eb' }, ticks: { color: '#6b7280' } },
      },
    }
  }, [commonOptions])

  const ongoing = campaigns
  const campaignsCount = Number(server?.campaigns_count ?? ongoing.length)
  const campaignsPageCount = Math.max(1, Math.ceil(campaignsCount / campaignPageSize))

  return (
    <div className="flex min-h-full flex-col">
      <Topbar
        title="Dashboard"
        right={
          <FilterField label="Date range" htmlFor="dashboard-date-range" className="w-[260px]">
            <DatePicker
              id="dashboard-date-range"
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={(next) => setRange(next)}
              className={filterInputClass}
              placeholderText="Select start and end dates"
            />
          </FilterField>
        }
      />

      <div className="flex-1 overflow-auto bg-slate-50 p-4 md:p-5">
        {error ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MetricCard
            label="Total Budget"
            value={formatBDT(totals.totalBudget)}
          />
          <MetricCard
            label="Total Impressions"
            value={formatCompact(totals.impressions)}
          />
          <MetricCard
            label="Total Clicks"
            value={formatCompact(totals.clicks)}
            sub={`${totals.ctr.toFixed(2)}% CTR`}
          />
          <MetricCard
            label="Total Campaigns"
            value={String(campaignsTotal)}
            sub={`${totals.active} active · ${totals.ended} ended`}
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-3 text-sm font-semibold text-gray-900">
              Daily impressions
            </div>
            <div className="h-[260px]">
              <Line data={lineData} options={lineOptions} />
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-3 text-sm font-semibold text-gray-900">
              Clicks by campaign type
            </div>
            <div className="h-[260px]">
              <Bar data={barData} options={barOptions} />
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <div>
              <div className="text-sm font-semibold text-gray-900">
                Ongoing campaigns
              </div>
              <div className="text-xs text-gray-500">
                Status: live · Range: {startISO && endISO ? formatRange(startISO, endISO) : 'All'}
              </div>
            </div>
          </div>

          <div className="overflow-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border-b border-gray-200 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Campaign title
                  </th>
                  <th className="border-b border-gray-200 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Type
                  </th>
                  <th className="border-b border-gray-200 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Duration
                  </th>
                  <th className="border-b border-gray-200 px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Impressions
                  </th>
                  <th className="border-b border-gray-200 px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Clicks
                  </th>
                  <th className="border-b border-gray-200 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Brief
                  </th>
                  <th className="border-b border-gray-200 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Screenshot
                  </th>
                  <th className="border-b border-gray-200 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Report
                  </th>
                </tr>
              </thead>
              <tbody>
                {ongoing.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="border-b border-gray-200 px-3 py-2 font-medium text-gray-900">
                      {c.name}
                    </td>
                    <td className="border-b border-gray-200 px-3 py-2">
                      <TypeBadge type={c.type || 'DSP'} />
                    </td>
                    <td className="border-b border-gray-200 px-3 py-2 text-gray-700">
                      {c.start_date && c.end_date
                        ? formatRange(c.start_date, c.end_date)
                        : '—'}
                    </td>
                    <td className="border-b border-gray-200 px-3 py-2 text-right text-gray-700">
                      {formatInt(c.impressions)}
                    </td>
                    <td className="border-b border-gray-200 px-3 py-2 text-right text-gray-700">
                      {formatInt(c.clicks)}
                    </td>
                    <td className="border-b border-gray-200 px-3 py-2 text-center">
                      <button
                        type="button"
                        className="inline-flex rounded-md border border-gray-200 p-1 text-gray-700 hover:bg-gray-50"
                        onClick={() => {}}
                        aria-label="Open brief"
                      >
                        <IconFileText size={18} />
                      </button>
                    </td>
                    <td className="border-b border-gray-200 px-3 py-2 text-center">
                      <button
                        type="button"
                        className="inline-flex rounded-md border border-gray-200 p-1 text-gray-700 hover:bg-gray-50"
                        onClick={() => {}}
                        aria-label="Open screenshot"
                      >
                        <IconPhoto size={18} />
                      </button>
                    </td>
                    <td className="border-b border-gray-200 px-3 py-2 text-center">
                      <button
                        type="button"
                        className="inline-flex rounded-md border border-gray-200 p-1 text-gray-700 hover:bg-gray-50"
                        onClick={() => {}}
                        aria-label="Open report"
                      >
                        <IconChartBar size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 text-sm">
            <div className="text-gray-600">
              Showing <span className="font-semibold text-gray-900">{ongoing.length}</span> of{' '}
              <span className="font-semibold text-gray-900">{campaignsCount}</span> live campaigns
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-full border border-gray-200 bg-[#f7f6ee] px-3 py-1 text-gray-800 disabled:opacity-50"
                disabled={campaignPage <= 0}
                onClick={() => setCampaignPage((p) => Math.max(0, p - 1))}
              >
                Prev
              </button>
              <span className="text-gray-600">
                Page {campaignPage + 1} of {campaignsPageCount}
              </span>
              <button
                type="button"
                className="rounded-full border border-gray-200 bg-[#f7f6ee] px-3 py-1 text-gray-800 disabled:opacity-50"
                disabled={campaignPage + 1 >= campaignsPageCount}
                onClick={() => setCampaignPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

