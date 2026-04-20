import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'

const CHART_W = 720
const CHART_H = 200
const PAD = { t: 16, r: 12, b: 28, l: 12 }

const fmtMoney = (n) =>
  n.toLocaleString(undefined, { style: 'currency', currency: 'BDT' })
const fmtInt = (n) => n.toLocaleString()

function KpiCard({ label, value, hint, icon, variant = 'indigo' }) {
  return (
    <div className={`dash-kpi dash-kpi--${variant}`}>
      <div className="dash-kpi__top">
        <span className="dash-kpi__icon" aria-hidden>
          {icon}
        </span>
        <span className="dash-kpi__label">{label}</span>
      </div>
      <div className="dash-kpi__value">{value}</div>
      {hint ? <div className="dash-kpi__hint">{hint}</div> : null}
    </div>
  )
}

function TrendChart({ daily }) {
  const innerW = CHART_W - PAD.l - PAD.r
  const innerH = CHART_H - PAD.t - PAD.b

  const { pathLine, pathArea, ticks } = useMemo(() => {
    if (!daily?.length) {
      return { pathLine: '', pathArea: '', ticks: [] }
    }
    const vals = daily.map((d) => Number(d.impressions) || 0)
    const max = Math.max(...vals, 1)
    const min = 0
    const span = daily.length
    if (span < 2) {
      const y = innerH - ((vals[0] - min) / (max - min || 1)) * innerH
      const x = PAD.l + innerW / 2
      const line = `M ${x} ${PAD.t + y} L ${x} ${PAD.t + y}`
      const area = `M ${PAD.l} ${PAD.t + innerH} L ${x} ${PAD.t + y} L ${PAD.l + innerW} ${PAD.t + innerH} Z`
      return {
        pathLine: line,
        pathArea: area,
        ticks: [{ x: x - PAD.l, label: daily[0].date.slice(5) }],
      }
    }
    const pts = vals.map((v, i) => {
      const x = PAD.l + (i / (span - 1)) * innerW
      const y = PAD.t + innerH - ((v - min) / (max - min)) * innerH
      return [x, y]
    })
    const lineD = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ')
    const first = pts[0]
    const last = pts[pts.length - 1]
    const areaD = `${lineD} L ${last[0]} ${PAD.t + innerH} L ${first[0]} ${PAD.t + innerH} Z`
    const tickCount = Math.min(6, span)
    const tks = []
    for (let i = 0; i < tickCount; i++) {
      const idx = Math.round((i / (tickCount - 1)) * (span - 1))
      const [x] = pts[idx]
      tks.push({ x: x - PAD.l, label: daily[idx].date.slice(5) })
    }
    return { pathLine: lineD, pathArea: areaD, ticks: tks }
  }, [daily, innerH, innerW])

  if (!daily?.length) {
    return (
      <div className="dash-chart dash-chart--empty">
        <p>No time-series data yet. Upload metrics to see the trend.</p>
      </div>
    )
  }

  return (
    <div className="dash-chart">
      <div className="dash-chart__head">
        <div>
          <h3 className="dash-chart__title">Performance trend</h3>
          <p className="dash-chart__sub">Impressions by day across your campaigns</p>
        </div>
      </div>
      <svg
        className="dash-chart__svg"
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        role="img"
        aria-label="Daily impressions trend"
      >
        <defs>
          <linearGradient id="dash-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={pathArea} fill="url(#dash-area)" />
        <path
          d={pathLine}
          fill="none"
          stroke="#a5b4fc"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {ticks.map((t, ti) => (
          <text
            key={`${t.label}-${ti}`}
            x={t.x + PAD.l}
            y={CHART_H - 6}
            fill="#5c668d"
            fontSize="10"
            textAnchor="middle"
          >
            {t.label}
          </text>
        ))}
      </svg>
    </div>
  )
}

function SkeletonDashboard() {
  return (
    <div className="dash dash--loading" aria-busy>
      <div className="dash-hero">
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-line w-40" />
      </div>
      <div className="dash-kpi-grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton skeleton-kpi" />
        ))}
      </div>
      <div className="skeleton skeleton-chart" />
      <div className="skeleton skeleton-panel" />
    </div>
  )
}

export function DashboardPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [campaignPage, setCampaignPage] = useState(1)
  const [dailyPage, setDailyPage] = useState(1)

  useEffect(() => {
    let cancelled = false
    setError(null)
    api
      .get('/dashboard/', {
        params: {
          campaign_page: campaignPage,
          daily_page: dailyPage,
        },
      })
      .then((res) => {
        if (!cancelled) setData(res.data)
      })
      .catch((e) =>
        setError(e.response?.data?.detail || 'Could not load dashboard'),
      )
    return () => {
      cancelled = true
    }
  }, [campaignPage, dailyPage])

  const today = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date())
    } catch {
      return ''
    }
  }, [])

  if (error) {
    return (
      <div className="dash">
        <div className="dash-alert dash-alert--error">{error}</div>
      </div>
    )
  }

  if (!data) {
    return <SkeletonDashboard />
  }

  const { totals, campaigns, daily, daily_trend: dailyTrend } = data
  const campaignRows = campaigns?.results || []
  const dailyRows = daily?.results || []
  const totalCampaignPages = Math.max(1, Math.ceil((campaigns?.count || 0) / 10))
  const totalDailyPages = Math.max(1, Math.ceil((daily?.count || 0) / 10))
  const campaignCount = campaigns?.count || 0
  const hasData =
    totals.impressions > 0 ||
    totals.clicks > 0 ||
    Number(totals.spend) > 0

  return (
    <div className="dash">
      <header className="dash-hero">
        <div className="dash-hero__text">
          <p className="dash-eyebrow">{today}</p>
          <h1 className="dash-title">Dashboard</h1>
          <p className="dash-subtitle">
            Real-time rollups for{' '}
            <strong>{campaignCount}</strong>{' '}
            {campaignCount === 1 ? 'campaign' : 'campaigns'} you can access.
          </p>
        </div>
        <div className="dash-hero__actions">
          <Link className="dash-btn dash-btn--ghost" to="/campaigns">
            View campaigns
          </Link>
          <span className="dash-pill">
            {hasData ? 'Live data' : 'Waiting for uploads'}
          </span>
        </div>
      </header>

      <section className="dash-kpi-grid" aria-label="Key metrics">
        <KpiCard
          variant="indigo"
          label="Impressions"
          value={fmtInt(totals.impressions)}
          hint="Reach across selected period"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 13h4l3-8 4 14 3-6h4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
        />
        <KpiCard
          variant="cyan"
          label="Clicks"
          value={fmtInt(totals.clicks)}
          hint="Engagement volume"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 11V5.5a2.5 2.5 0 0 1 5 0V11M9 11H5v8h14v-8h-4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
        />
        <KpiCard
          variant="amber"
          label="Spend"
          value={fmtMoney(totals.spend)}
          hint="Investment to date"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 3v18M17 8H9.5a2.5 2.5 0 1 0 0 5H14a2.5 2.5 0 1 1 0 5H7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
        />
        <KpiCard
          variant="rose"
          label="CTR"
          value={`${(totals.ctr * 100).toFixed(2)}%`}
          hint="Click-through rate"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 20V10M12 10l4 4M12 10l-4 4M4 4h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
        />
      </section>

      <section className="dash-panel">
        <TrendChart daily={dailyTrend || dailyRows} />
      </section>

      <section className="dash-panel dash-panel--table">
        <div className="dash-panel__head">
          <div>
            <h2 className="dash-panel__title">Campaign performance</h2>
            <p className="dash-panel__desc">
              Totals aggregated for every campaign you can view.
            </p>
          </div>
        </div>
        {(campaigns?.count || 0) === 0 ? (
          <div className="dash-empty">
            <div className="dash-empty__icon" aria-hidden>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <p className="dash-empty__title">No metrics yet</p>
            <p className="dash-empty__text">
              Create a campaign and upload an Excel file to populate this view.
            </p>
            <Link className="dash-btn dash-btn--primary" to="/campaigns">
              Go to campaigns
            </Link>
          </div>
        ) : (
          <>
            <div className="table-scroll">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Campaign</th>
                    <th className="num">Impressions</th>
                    <th className="num">Clicks</th>
                    <th className="num">Spend</th>
                  </tr>
                </thead>
                <tbody>
                  {campaignRows.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <span className="dash-cell-title">{c.name}</span>
                      </td>
                      <td className="num mono">{fmtInt(c.impressions)}</td>
                      <td className="num mono">{fmtInt(c.clicks)}</td>
                      <td className="num mono">{fmtMoney(c.spend)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-pagination dash-table-pagination">
              <span className="muted small">
                Showing {(campaignPage - 1) * 10 + 1}-
                {Math.min(campaignPage * 10, campaigns?.count || 0)} of{' '}
                {campaigns?.count || 0}
              </span>
              <div className="table-pagination__actions">
                <button
                  type="button"
                  className="btn btn-small"
                  disabled={!campaigns?.previous}
                  onClick={() =>
                    setCampaignPage((p) => Math.max(1, p - 1))
                  }
                >
                  Previous
                </button>
                <span className="muted small">
                  Page {campaignPage} of {totalCampaignPages}
                </span>
                <button
                  type="button"
                  className="btn btn-small"
                  disabled={!campaigns?.next}
                  onClick={() =>
                    setCampaignPage((p) => Math.min(totalCampaignPages, p + 1))
                  }
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {(daily?.count || 0) > 0 && (
        <section className="dash-panel dash-panel--table">
          <div className="dash-panel__head">
            <div>
              <h2 className="dash-panel__title">Daily breakdown</h2>
              <p className="dash-panel__desc">Rows summed by calendar date.</p>
            </div>
          </div>
          <div className="table-scroll">
            <table className="dash-table dash-table--compact">
              <thead>
                <tr>
                  <th>Date</th>
                  <th className="num">Impressions</th>
                  <th className="num">Clicks</th>
                  <th className="num">Spend</th>
                </tr>
              </thead>
              <tbody>
                {dailyRows.map((d) => (
                  <tr key={d.date}>
                    <td className="mono">{d.date}</td>
                    <td className="num mono">{fmtInt(d.impressions)}</td>
                    <td className="num mono">{fmtInt(d.clicks)}</td>
                    <td className="num mono">{fmtMoney(d.spend)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-pagination dash-table-pagination">
            <span className="muted small">
              Showing {(dailyPage - 1) * 10 + 1}-
              {Math.min(dailyPage * 10, daily?.count || 0)} of {daily?.count || 0}
            </span>
            <div className="table-pagination__actions">
              <button
                type="button"
                className="btn btn-small"
                disabled={!daily?.previous}
                onClick={() => setDailyPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <span className="muted small">
                Page {dailyPage} of {totalDailyPages}
              </span>
              <button
                type="button"
                className="btn btn-small"
                disabled={!daily?.next}
                onClick={() =>
                  setDailyPage((p) => Math.min(totalDailyPages, p + 1))
                }
              >
                Next
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
