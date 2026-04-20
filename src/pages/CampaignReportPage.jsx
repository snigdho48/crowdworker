import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client'

function toLocalDateInput(dateObj) {
  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getPresetRange(daysBack) {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - daysBack + 1)
  return {
    from: toLocalDateInput(start),
    to: toLocalDateInput(end),
  }
}

export function CampaignReportPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [campaignName, setCampaignName] = useState('')
  const [campaigns, setCampaigns] = useState([])
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [draftFrom, setDraftFrom] = useState('')
  const [draftTo, setDraftTo] = useState('')

  const [tableView, setTableView] = useState('date')
  const [selectedCampaignId, setSelectedCampaignId] = useState(String(id || ''))
  const [tablePage, setTablePage] = useState(1)

  useEffect(() => {
    setSelectedCampaignId(String(id || ''))
  }, [id])

  useEffect(() => {
    let cancelled = false
    api
      .get(`/campaigns/${id}/`, {})
      .then((res) => {
        if (!cancelled) setCampaignName(res.data.name)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    let cancelled = false
    api
      .get('/campaigns/', { params: { page_size: 100 } })
      .then((res) => {
        if (cancelled) return
        const list = Array.isArray(res.data) ? res.data : res.data.results || []
        setCampaigns(list)
      })
      .catch(() => {
        if (!cancelled) setCampaigns([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)
    const params = {}
    if (dateFrom) params.date_from = dateFrom
    if (dateTo) params.date_to = dateTo
    params.table_view = tableView
    params.page = tablePage
    api
      .get(`/campaigns/${id}/metrics/`, { params })
      .then((res) => {
        if (!cancelled) {
          setData(res.data)
          setIsLoading(false)
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e.response?.data?.detail || 'Could not load report.')
          setIsLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [id, dateFrom, dateTo, tableView, tablePage])

  const tablePayload = data?.table || {
    count: 0,
    next: null,
    previous: null,
    results: [],
  }
  const tableData = tablePayload.results || []
  const firstColumnName = tableView === 'publisher' ? 'Publisher' : 'Date'
  const totalTablePages = Math.max(1, Math.ceil((tablePayload.count || 0) / 10))

  useEffect(() => {
    setTablePage(1)
  }, [id, tableView, dateFrom, dateTo])

  function applyFilters() {
    setDateFrom(draftFrom)
    setDateTo(draftTo)
  }

  function resetFilters() {
    setDraftFrom('')
    setDraftTo('')
    setDateFrom('')
    setDateTo('')
    setTableView('date')
  }

  function applyPreset(daysBack) {
    const { from, to } = getPresetRange(daysBack)
    setDraftFrom(from)
    setDraftTo(to)
    setDateFrom(from)
    setDateTo(to)
  }

  function isPresetActive(daysBack) {
    const { from, to } = getPresetRange(daysBack)
    return draftFrom === from && draftTo === to
  }

  if (error) {
    return (
      <div className="stack">
        <p className="error">{error}</p>
        <Link to="/campaigns">← Back to campaigns</Link>
      </div>
    )
  }

  if (isLoading || !data) {
    return <p className="muted">Loading report…</p>
  }

  const { summary } = data

  return (
    <div className="stack">
      <div className="page-head">
        <Link className="muted small" to="/campaigns">
          ← Campaigns
        </Link>
        <h1>{campaignName || 'Campaign report'}</h1>
        <p className="muted">
          Filter by date (optional). Excel columns: date, impressions, clicks,
          spend, publisher.
        </p>
      </div>

      <div className="card report-filters">
        <div className="report-filters__head">
          <h2>Filters</h2>
          <p className="muted small">Date range, campaign, and table view</p>
        </div>
        <div className="report-filters__grid">
          <label className="field">
            <span>Campaign</span>
            <select
              value={selectedCampaignId}
              onChange={(e) => {
                const nextId = e.target.value
                setSelectedCampaignId(nextId)
                if (nextId && String(nextId) !== String(id)) {
                  navigate(`/campaigns/${nextId}/report`)
                }
              }}
            >
              {campaigns.length === 0 ? (
                <option value={selectedCampaignId || ''}>
                  {campaignName || 'Current campaign'}
                </option>
              ) : (
                campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </option>
                ))
              )}
            </select>
          </label>
          <label className="field">
            <span>Table view</span>
            <select
              value={tableView}
              onChange={(e) => setTableView(e.target.value)}
            >
              <option value="date">Date wise</option>
              <option value="publisher">Publisher wise</option>
            </select>
          </label>
          <label className="field">
            <span>Date from</span>
            <input
              type="date"
              value={draftFrom}
              onChange={(e) => setDraftFrom(e.target.value)}
            />
          </label>
          <label className="field">
            <span>Date to</span>
            <input
              type="date"
              value={draftTo}
              onChange={(e) => setDraftTo(e.target.value)}
            />
          </label>
        </div>
        <div className="report-filters__footer">
          <div className="report-filters__presets">
            <span className="muted small">Quick range:</span>
            <button
              type="button"
              className={`btn btn-small report-filters__chip${
                isPresetActive(7) ? ' report-filters__chip--active' : ''
              }`}
              onClick={() => applyPreset(7)}
            >
              Last 7 days
            </button>
            <button
              type="button"
              className={`btn btn-small report-filters__chip${
                isPresetActive(30) ? ' report-filters__chip--active' : ''
              }`}
              onClick={() => applyPreset(30)}
            >
              Last 30 days
            </button>
          </div>
          <div className="report-filters__actions">
            <button type="button" className="btn btn-primary" onClick={applyFilters}>
              Apply filters
            </button>
            <button type="button" className="btn" onClick={resetFilters}>
              Reset
            </button>
          </div>
        </div>
      </div>

      <section className="stats-grid">
        <div className="stat">
          <div className="stat-label">Impressions</div>
          <div className="stat-value">{summary.impressions.toLocaleString()}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Clicks</div>
          <div className="stat-value">{summary.clicks.toLocaleString()}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Spend</div>
          <div className="stat-value">
            {summary.spend.toLocaleString(undefined, {
              style: 'currency',
              currency: 'BDT',
            })}
          </div>
        </div>
        <div className="stat">
          <div className="stat-label">CTR</div>
          <div className="stat-value">{(summary.ctr * 100).toFixed(2)}%</div>
        </div>
      </section>

      <section className="card">
        <div className="report-table-head">
          <div>
            <h2>Report table ({firstColumnName} wise)</h2>
            <p className="muted small">
              Columns: {firstColumnName}, impressions, clicks, CTR, spend.
            </p>
          </div>
        </div>
        {tableData.length === 0 ? (
          <p className="muted">No data available for selected view.</p>
        ) : (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>{firstColumnName}</th>
                    <th className="num">Impressions</th>
                    <th className="num">Clicks</th>
                    <th className="num">CTR</th>
                    <th className="num">Spend</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((r, idx) => {
                    return (
                      <tr key={`${r.label}-${idx}`}>
                        <td>{r.label}</td>
                        <td className="num">{r.impressions.toLocaleString()}</td>
                        <td className="num">{r.clicks.toLocaleString()}</td>
                        <td className="num">{((r.ctr || 0) * 100).toFixed(2)}%</td>
                        <td className="num">
                          {r.spend.toLocaleString(undefined, {
                            style: 'currency',
                            currency: 'BDT',
                          })}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="table-pagination">
              <span className="muted small">
                Showing {(tablePage - 1) * 10 + 1}-
                {Math.min(tablePage * 10, tablePayload.count || 0)} of{' '}
                {tablePayload.count || 0}
              </span>
              <div className="table-pagination__actions">
                <button
                  type="button"
                  className="btn btn-small"
                  disabled={!tablePayload.previous}
                  onClick={() => setTablePage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <span className="muted small">
                  Page {tablePage} of {totalTablePages}
                </span>
                <button
                  type="button"
                  className="btn btn-small"
                  disabled={!tablePayload.next}
                  onClick={() =>
                    setTablePage((p) => Math.min(totalTablePages, p + 1))
                  }
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
