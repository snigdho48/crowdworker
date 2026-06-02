import { useCallback, useEffect, useMemo, useState } from 'react'
import DatePicker from 'react-datepicker'
import { createColumnHelper } from '@tanstack/react-table'
import Select from 'react-select'
import { useNavigate } from 'react-router-dom'
import {
  IconChartBar,
  IconFileText,
  IconPhoto,
  IconPencil,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react'
import { FilterField, filterInputClass } from '../components/FilterField'
import { Topbar } from '../components/Topbar'
import { CampaignTable } from '../components/CampaignTable'
import { StatusDot } from '../components/StatusDot'
import { TypeBadge } from '../components/TypeBadge'
import { clampDateRange, formatInt, formatRange } from '../lib/format'
import { fetchAllPages, parsePaginatedResponse } from '../lib/pagination'
import { useAuth } from '../context/AuthContext'

const col = createColumnHelper()

function toISO(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function CampaignList() {
  const { api, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [range, setRange] = useState(() => {
    const end = new Date('2026-05-08T00:00:00')
    const start = new Date('2026-05-01T00:00:00')
    return [start, end]
  })
  const [selectedCampaigns, setSelectedCampaigns] = useState([])
  const [type, setType] = useState('All')
  const [status, setStatus] = useState('All')
  const [rows, setRows] = useState([])
  const [pageIndex, setPageIndex] = useState(0)
  const [pageCount, setPageCount] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [campaignOptionsSource, setCampaignOptionsSource] = useState([])
  const [error, setError] = useState('')
  const pageSize = 10
  // editing is handled on /app/campaigns/:id/edit

  const [startDate, endDate] = range
  const { start, end } = useMemo(() => {
    const clamped = clampDateRange({
      start: startDate ? toISO(startDate) : '',
      end: endDate ? toISO(endDate) : '',
    })
    return { start: clamped.start, end: clamped.end }
  }, [startDate, endDate])

  const selectedIds = useMemo(
    () => new Set(selectedCampaigns.map((o) => String(o.value))),
    [selectedCampaigns],
  )

  const listParams = useMemo(() => {
    const params = { page: pageIndex + 1, page_size: pageSize }
    if (type !== 'All') params.type = type
    if (status !== 'All') params.status = status
    if (start) params.date_from = start
    if (end) params.date_to = end
    if (selectedIds.size > 0) params.ids = Array.from(selectedIds).join(',')
    return params
  }, [pageIndex, pageSize, type, status, start, end, selectedIds])

  useEffect(() => {
    setPageIndex(0)
  }, [type, status, start, end, selectedIds])

  useEffect(() => {
    let cancelled = false
    api
      .get('/campaigns/', { params: listParams })
      .then((res) => {
        if (cancelled) return
        const { results, count } = parsePaginatedResponse(res.data)
        setRows(results)
        setTotalCount(count)
        setPageCount(Math.max(1, Math.ceil(count / pageSize)))
      })
      .catch((e) => {
        const code = e?.response?.status
        if (code === 401) logout()
        if (!cancelled) setError(e?.response?.data?.detail || 'Failed to load campaigns')
      })
    return () => {
      cancelled = true
    }
  }, [api, logout, listParams])

  useEffect(() => {
    let cancelled = false
    fetchAllPages(api, '/campaigns/')
      .then((all) => {
        if (!cancelled) setCampaignOptionsSource(all)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [api])

  const refreshCampaigns = useCallback(async () => {
    const res = await api.get('/campaigns/', { params: listParams })
    const { results, count } = parsePaginatedResponse(res.data)
    setRows(results)
    setTotalCount(count)
    setPageCount(Math.max(1, Math.ceil(count / pageSize)))
  }, [api, listParams, pageSize])

  // (edit modal removed)

  const deleteCampaign = useCallback(async (row) => {
    if (!window.confirm(`Delete "${row.name}"?`)) return
    setError('')
    try {
      await api.delete(`/campaigns/${row.id}/`)
      await refreshCampaigns()
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to delete campaign')
    }
  }, [api, refreshCampaigns])

  const columns = useMemo(
    () => [
      col.accessor('name', {
        header: 'Campaign title',
        cell: (info) => (
          <span className="font-medium text-gray-900">{info.getValue()}</span>
        ),
      }),
      col.accessor('type', {
        header: 'Type',
        cell: (info) => <TypeBadge type={info.getValue()} />,
        sortingFn: 'alphanumeric',
      }),
      col.display({
        id: 'duration',
        header: 'Duration',
        cell: ({ row }) => (
          <span className="text-gray-700">
            {row.original.start_date && row.original.end_date
              ? formatRange(row.original.start_date, row.original.end_date)
              : '—'}
          </span>
        ),
      }),
      col.accessor('impressions', {
        header: 'Impressions',
        cell: (info) => (
          <span className="tabular-nums">{formatInt(info.getValue())}</span>
        ),
      }),
      col.accessor('clicks', {
        header: 'Clicks',
        cell: (info) => (
          <span className="tabular-nums">{formatInt(info.getValue())}</span>
        ),
      }),
      col.accessor('status', {
        header: 'Status',
        cell: (info) => <StatusDot status={info.getValue()} />,
      }),
      col.display({
        id: 'brief',
        header: 'Brief',
        cell: () => (
          <button
            type="button"
            className="inline-flex rounded-md border border-gray-200 p-1 text-gray-700 hover:bg-gray-50"
            onClick={() => {}}
            aria-label="Open brief"
          >
            <IconFileText size={18} />
          </button>
        ),
      }),
      col.display({
        id: 'screenshot',
        header: 'Screenshot',
        cell: () => (
          <button
            type="button"
            className="inline-flex rounded-md border border-gray-200 p-1 text-gray-700 hover:bg-gray-50"
            onClick={() => {}}
            aria-label="Open screenshot"
          >
            <IconPhoto size={18} />
          </button>
        ),
      }),
      col.display({
        id: 'report',
        header: 'Report',
        cell: () => (
          <button
            type="button"
            className="inline-flex rounded-md border border-gray-200 p-1 text-gray-700 hover:bg-gray-50"
            onClick={() => {}}
            aria-label="Open report"
          >
            <IconChartBar size={18} />
          </button>
        ),
      }),
      col.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-[#f7f6ee] px-3 py-1 text-xs font-semibold text-gray-900 hover:bg-black/5"
              onClick={() => navigate(`/app/report?campaignId=${row.original.id}`)}
              aria-label="Open report"
            >
              <IconChartBar size={16} />
              Report
            </button>
            {isAdmin ? (
              <>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-900 hover:bg-black/5"
                  onClick={() => navigate(`/app/campaigns/${row.original.id}/edit`)}
                  aria-label="Edit campaign"
                >
                  <IconPencil size={16} />
                  Edit
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                  onClick={() => deleteCampaign(row.original)}
                  aria-label="Delete campaign"
                >
                  <IconTrash size={16} />
                  Delete
                </button>
              </>
            ) : null}
          </div>
        ),
      }),
    ],
    [deleteCampaign, isAdmin, navigate],
  )

  const campaignOptions = useMemo(
    () =>
      campaignOptionsSource
        .slice()
        .sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')))
        .map((c) => ({ value: c.id, label: c.name })),
    [campaignOptionsSource],
  )

  const selectStyles = useMemo(
    () => ({
      control: (base) => ({
        ...base,
        backgroundColor: '#f7f6ee',
        borderColor: '#e5e7eb',
        borderRadius: 9999,
        minHeight: 40,
        paddingLeft: 6,
        paddingRight: 6,
        boxShadow: 'none',
      }),
      valueContainer: (base) => ({
        ...base,
        paddingTop: 2,
        paddingBottom: 2,
      }),
      placeholder: (base) => ({ ...base, color: '#6b7280' }),
      input: (base) => ({ ...base, margin: 0, padding: 0 }),
      multiValue: (base) => ({ ...base, borderRadius: 9999, backgroundColor: 'rgba(0,0,0,0.06)' }),
      multiValueLabel: (base) => ({ ...base, fontSize: 12, color: '#111827' }),
      multiValueRemove: (base) => ({ ...base, borderRadius: 9999 }),
      menu: (base) => ({ ...base, zIndex: 50 }),
    }),
    [],
  )

  return (
    <div className="flex min-h-full flex-col">
      <Topbar
        title="Campaign List"
        right={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-[#dbeafe] px-4 py-2 text-sm font-semibold text-[#1d4ed8]"
            onClick={() => navigate('/app/campaigns/new')}
          >
            <IconPlus size={18} />
            New Campaign
          </button>
        }
      />

      <div className="flex-1 overflow-auto bg-[#f5f4ea] p-5">
        {error ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          <FilterField label="Date range" htmlFor="campaign-list-date-range">
            <DatePicker
              id="campaign-list-date-range"
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={(next) => setRange(next)}
              className={filterInputClass}
              placeholderText="Select start and end dates"
            />
          </FilterField>
          <FilterField label="Campaigns">
            <Select
              inputId="campaign-list-campaigns"
              isMulti
              isClearable
              placeholder="Select campaigns to filter"
              options={campaignOptions}
              value={selectedCampaigns}
              onChange={(next) => setSelectedCampaigns(next || [])}
              styles={selectStyles}
            />
          </FilterField>
          <FilterField label="Campaign type" htmlFor="campaign-list-type">
            <select
              id="campaign-list-type"
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
          <FilterField label="Status" htmlFor="campaign-list-status">
            <select
              id="campaign-list-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={filterInputClass}
            >
              <option value="All">All statuses</option>
              <option value="Live">Live</option>
              <option value="Ended">Ended</option>
              <option value="Paused">Paused</option>
            </select>
          </FilterField>
        </div>

        <CampaignTable
          data={rows}
          columns={columns}
          pageSize={pageSize}
          showPagination
          manualPagination
          pageIndex={pageIndex}
          pageCount={pageCount}
          totalCount={totalCount}
          onPageChange={setPageIndex}
          rowLabel="campaigns"
          getRowId={(row) => String(row.id)}
        />
      </div>
    </div>
  )
}

