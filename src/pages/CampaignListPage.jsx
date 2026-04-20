import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

const PAGE_SIZE = 10

function normalizePaginatedData(data) {
  if (Array.isArray(data)) {
    return {
      results: data,
      count: data.length,
      next: null,
      previous: null,
    }
  }
  return {
    results: Array.isArray(data?.results) ? data.results : [],
    count: typeof data?.count === 'number' ? data.count : 0,
    next: data?.next || null,
    previous: data?.previous || null,
  }
}

export function CampaignListPage() {
  const { isAdmin } = useAuth()
  const [campaigns, setCampaigns] = useState([])
  const [advertisers, setAdvertisers] = useState([])
  const [filters, setFilters] = useState({
    name: '',
    date_from: '',
    date_to: '',
    advertiser_id: '',
  })
  const [draftFilters, setDraftFilters] = useState({
    name: '',
    date_from: '',
    date_to: '',
    advertiser_id: '',
  })
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrev, setHasPrev] = useState(false)
  const [error, setError] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(async (requestedPage = 1) => {
    setError(null)
    try {
      const res = await api.get('/campaigns/', {
        params: {
          page: requestedPage,
          ...(filters.name ? { name: filters.name } : {}),
          ...(filters.date_from ? { date_from: filters.date_from } : {}),
          ...(filters.date_to ? { date_to: filters.date_to } : {}),
          ...(filters.advertiser_id ? { advertiser_id: filters.advertiser_id } : {}),
        },
      })
      const payload = normalizePaginatedData(res.data)
      const resolvedTotalPages = Math.max(
        1,
        Math.ceil((payload.count || 0) / PAGE_SIZE),
      )

      if (
        requestedPage > 1 &&
        payload.results.length === 0 &&
        payload.count > 0
      ) {
        load(requestedPage - 1)
        return
      }

      setCampaigns(payload.results)
      setTotalCount(payload.count)
      setPage(requestedPage)
      setTotalPages(resolvedTotalPages)
      setHasNext(Boolean(payload.next))
      setHasPrev(Boolean(payload.previous))
    } catch (e) {
      setError(e.response?.data?.detail || 'Could not load campaigns')
    }
  }, [filters])

  useEffect(() => {
    load(1)
  }, [load])

  useEffect(() => {
    if (!isAdmin) return
    api
      .get('/accounts/advertisers/', { params: { page_size: 100 } })
      .then((res) => setAdvertisers(normalizePaginatedData(res.data).results))
      .catch(() => {})
  }, [isAdmin])

  async function createCampaign(e) {
    e.preventDefault()
    setError(null)
    try {
      await api.post('/campaigns/', { name, description })
      setName('')
      setDescription('')
      load(1)
    } catch (err) {
      setError(err.response?.data?.detail || 'Create failed.')
    }
  }

  async function removeCampaign(id) {
    if (!window.confirm('Delete this campaign and all of its metrics?')) return
    setBusyId(id)
    try {
      await api.delete(`/campaigns/${id}/`)
      load(page)
    } catch (err) {
      setError(err.response?.data?.detail || 'Delete failed.')
    } finally {
      setBusyId(null)
    }
  }

  async function uploadFile(campaignId, file) {
    if (!file) return
    const form = new FormData()
    form.append('file', file)
    setBusyId(campaignId)
    setError(null)
    try {
      await api.post(`/campaigns/${campaignId}/upload/`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      load(page)
    } catch (err) {
      const d = err.response?.data?.detail
      setError(typeof d === 'string' ? d : 'Upload failed.')
    } finally {
      setBusyId(null)
    }
  }

  async function saveAssignments(campaignId, userIds) {
    setBusyId(campaignId)
    setError(null)
    try {
      await api.post(`/campaigns/${campaignId}/assignments/`, {
        user_ids: userIds,
      })
      load(page)
    } catch (err) {
      const d = err.response?.data?.detail
      setError(typeof d === 'string' ? d : 'Could not update assignments.')
    } finally {
      setBusyId(null)
    }
  }

  function applyFilters(e) {
    e.preventDefault()
    setFilters({
      name: draftFilters.name.trim(),
      date_from: draftFilters.date_from,
      date_to: draftFilters.date_to,
      advertiser_id: draftFilters.advertiser_id,
    })
  }

  function resetFilters() {
    const blank = { name: '', date_from: '', date_to: '', advertiser_id: '' }
    setDraftFilters(blank)
    setFilters(blank)
  }

  return (
    <div className="stack">
      <header className="page-head">
        <h1>Campaigns</h1>
        <p className="muted">
          Advertisers only see campaigns assigned to them.
        </p>
      </header>

      {isAdmin && (
        <form className="card form-row" onSubmit={createCampaign}>
          <h2>New campaign</h2>
          <div className="inline">
            <label className="field grow">
              <span>Name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>
            <label className="field grow">
              <span>Description</span>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
            <button className="btn btn-primary" type="submit">
              Create
            </button>
          </div>
        </form>
      )}

      <form className="card form-row" onSubmit={applyFilters}>
        <h2>Filters</h2>
        <div className="inline">
          <label className="field grow">
            <span>Campaign name</span>
            <input
              placeholder="Search by name"
              value={draftFilters.name}
              onChange={(e) =>
                setDraftFilters((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </label>
          <label className="field">
            <span>Date from</span>
            <input
              type="date"
              value={draftFilters.date_from}
              onChange={(e) =>
                setDraftFilters((prev) => ({
                  ...prev,
                  date_from: e.target.value,
                }))
              }
            />
          </label>
          <label className="field">
            <span>Date to</span>
            <input
              type="date"
              value={draftFilters.date_to}
              onChange={(e) =>
                setDraftFilters((prev) => ({ ...prev, date_to: e.target.value }))
              }
            />
          </label>
          {isAdmin && (
            <label className="field">
              <span>Advertiser</span>
              <select
                value={draftFilters.advertiser_id}
                onChange={(e) =>
                  setDraftFilters((prev) => ({
                    ...prev,
                    advertiser_id: e.target.value,
                  }))
                }
              >
                <option value="">All advertisers</option>
                {advertisers.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.username}
                  </option>
                ))}
              </select>
            </label>
          )}
          <button className="btn btn-primary" type="submit">
            Apply
          </button>
          <button className="btn" type="button" onClick={resetFilters}>
            Reset
          </button>
        </div>
      </form>

      {error && <p className="error">{error}</p>}

      <section className="card">
        <h2>All campaigns</h2>
        {campaigns.length === 0 ? (
          <p className="muted">No campaigns found for selected filters.</p>
        ) : (
          <>
            <div className="table-wrap campaign-table-wrap">
              <table className="table campaign-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Report</th>
                    {isAdmin && <th>Upload Excel</th>}
                    {isAdmin && <th>Assign advertisers</th>}
                    {isAdmin && <th />}
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c) => (
                    <CampaignRow
                      key={c.id}
                      campaign={c}
                      isAdmin={isAdmin}
                      advertisers={advertisers}
                      busy={busyId === c.id}
                      onDelete={() => removeCampaign(c.id)}
                      onUpload={(file) => uploadFile(c.id, file)}
                      onSaveAssignments={(ids) => saveAssignments(c.id, ids)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-pagination">
              <span className="muted small">
                Showing {(page - 1) * PAGE_SIZE + 1}-
                {Math.min(page * PAGE_SIZE, totalCount)} of {totalCount}
              </span>
              <div className="table-pagination__actions">
                <button
                  type="button"
                  className="btn btn-small"
                  disabled={!hasPrev}
                  onClick={() => load(page - 1)}
                >
                  Previous
                </button>
                <span className="muted small">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  className="btn btn-small"
                  disabled={!hasNext}
                  onClick={() => load(page + 1)}
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

function CampaignRow({
  campaign,
  isAdmin,
  advertisers,
  busy,
  onDelete,
  onUpload,
  onSaveAssignments,
}) {
  const [localIds, setLocalIds] = useState(() =>
    (campaign.assigned_users || []).map((u) => u.id),
  )
  const [assignOpen, setAssignOpen] = useState(false)
  const [assignSearch, setAssignSearch] = useState('')
  const fileInputId = useId()
  const assignRef = useRef(null)

  useEffect(() => {
    setLocalIds((campaign.assigned_users || []).map((u) => u.id))
    setAssignOpen(false)
    setAssignSearch('')
  }, [campaign])

  useEffect(() => {
    if (!assignOpen) return

    function onPointerDown(event) {
      if (!assignRef.current?.contains(event.target)) {
        setAssignOpen(false)
      }
    }

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        setAssignOpen(false)
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [assignOpen])

  const filteredAdvertisers = advertisers.filter((u) =>
    u.username.toLowerCase().includes(assignSearch.trim().toLowerCase()),
  )
  const selectedAdvertisers = advertisers.filter((u) => localIds.includes(u.id))
  const selectedText =
    selectedAdvertisers.length > 0
      ? selectedAdvertisers.map((u) => u.username).join(', ')
      : 'Select advertisers'

  function toggleAdvertiser(id) {
    setLocalIds((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id],
    )
  }

  return (
    <tr className={assignOpen ? 'campaign-row campaign-row--assign-open' : 'campaign-row'}>
      <td>
        <div className="strong">{campaign.name}</div>
        {campaign.description && (
          <div className="muted small">{campaign.description}</div>
        )}
      </td>
      <td>
        <Link className="btn btn-small" to={`/campaigns/${campaign.id}/report`}>
          Open report
        </Link>
      </td>
      {isAdmin && (
        <td>
          <input
            id={fileInputId}
            className="sr-only"
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0]
              e.target.value = ''
              onUpload(f)
            }}
          />
          <label
            htmlFor={fileInputId}
            className={`btn btn-small upload-btn${busy ? ' upload-btn--disabled' : ''}`}
          >
            Upload Excel
          </label>
        </td>
      )}
      {isAdmin && (
        <td>
          <div ref={assignRef} className="assign-search-select">
            <button
              type="button"
              className="assign-search-select__trigger"
              onClick={() => setAssignOpen((open) => !open)}
            >
              {selectedText}
            </button>
            {assignOpen && (
              <div className="assign-search-select__menu">
                <input
                  type="text"
                  className="assign-search-select__input"
                  placeholder="Search advertiser"
                  value={assignSearch}
                  onChange={(e) => setAssignSearch(e.target.value)}
                />
                <div className="assign-search-select__list">
                  {filteredAdvertisers.map((u) => (
                    <label key={u.id} className="assign-search-select__option">
                      <input
                        type="checkbox"
                        checked={localIds.includes(u.id)}
                        onChange={() => toggleAdvertiser(u.id)}
                      />
                      <span>{u.username}</span>
                    </label>
                  ))}
                  {filteredAdvertisers.length === 0 && (
                    <span className="muted small">No advertiser found.</span>
                  )}
                </div>
              </div>
            )}
          </div>
          <button
            type="button"
            className="btn btn-small btn-primary"
            disabled={busy}
            onClick={() => {
              setAssignOpen(false)
              onSaveAssignments(localIds)
            }}
          >
            Save assignments
          </button>
        </td>
      )}
      {isAdmin && (
        <td>
          <button
            type="button"
            className="btn btn-small btn-danger"
            disabled={busy}
            onClick={onDelete}
          >
            Delete
          </button>
        </td>
      )}
    </tr>
  )
}
