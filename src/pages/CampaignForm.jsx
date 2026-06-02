import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { IconFileSpreadsheet, IconUpload } from '@tabler/icons-react'
import { FormField, formInputClass } from '../components/FilterField'
import { Topbar } from '../components/Topbar'
import { useAuth } from '../context/AuthContext'

const TYPES = ['', 'DSP', 'YouTube', 'Floating', 'Takeover', 'Image Takeover']
const STATUSES = ['live', 'ended', 'paused']

export function CampaignForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { api } = useAuth()

  const fileInputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [draft, setDraft] = useState({
    name: '',
    description: '',
    type: '',
    status: 'live',
    start_date: '',
    end_date: '',
    brief: '',
    screenshot: '',
  })

  useEffect(() => {
    if (!isEdit) return
    let cancelled = false
    api
      .get(`/campaigns/${id}/`)
      .then((res) => {
        if (cancelled) return
        const c = res.data
        setDraft({
          name: c.name || '',
          description: c.description || '',
          type: c.type || '',
          status: c.status || 'live',
          start_date: c.start_date || '',
          end_date: c.end_date || '',
          brief: c.brief || '',
          screenshot: c.screenshot || '',
        })
      })
      .catch((e) => {
        if (!cancelled) setError(e?.response?.data?.detail || 'Failed to load campaign')
      })
    return () => {
      cancelled = true
    }
  }, [api, id, isEdit])

  const payload = useMemo(
    () => ({
      name: draft.name,
      description: draft.description,
      type: draft.type,
      status: draft.status,
      start_date: draft.start_date || null,
      end_date: draft.end_date || null,
      brief: draft.brief,
      screenshot: draft.screenshot,
    }),
    [draft],
  )

  async function save() {
    setBusy(true)
    setError('')
    setSuccess('')
    try {
      if (isEdit) {
        await api.patch(`/campaigns/${id}/`, payload)
        setSuccess('Campaign updated')
      } else {
        const res = await api.post('/campaigns/', payload)
        setSuccess('Campaign created')
        navigate(`/app/campaigns/${res.data.id}/edit`, { replace: true })
      }
    } catch (e) {
      setError(e?.response?.data?.detail || 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  function pickFile(file) {
    if (!file || !isEdit) return
    const name = file.name.toLowerCase()
    if (!name.endsWith('.xlsx')) {
      setError('Please choose an Excel file (.xlsx).')
      setSelectedFile(null)
      return
    }
    setError('')
    setSelectedFile(file)
  }

  async function uploadExcel(file = selectedFile) {
    if (!file || !isEdit) return
    setUploading(true)
    setError('')
    setSuccess('')
    try {
      const form = new FormData()
      form.append('file', file)
      await api.post(`/campaigns/${id}/upload/`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setSuccess('Upload successful')
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (e) {
      const msg = e?.response?.data?.detail || 'Upload failed'
      setError(String(msg))
    } finally {
      setUploading(false)
    }
  }

  function onDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    pickFile(file)
  }

  return (
    <div className="flex min-h-full flex-col">
      <Topbar
        title={isEdit ? 'Update Campaign' : 'Create Campaign'}
        right={
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-full border border-gray-200 bg-[#f7f6ee] px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-black/5"
              onClick={() => navigate('/app/campaigns')}
            >
              Back
            </button>
            <button
              type="button"
              disabled={busy}
              className="rounded-full bg-[#378ADD] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              onClick={save}
            >
              {busy ? 'Saving…' : 'Save'}
            </button>
          </div>
        }
      />

      <div className="flex-1 overflow-auto bg-[#f5f4ea] p-5">
        {error ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        ) : null}

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Campaign name" htmlFor="campaign-name" className="col-span-2">
              <input
                id="campaign-name"
                value={draft.name}
                onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
                className={formInputClass}
                placeholder="Enter campaign name"
              />
            </FormField>
            <FormField label="Description" htmlFor="campaign-description" className="col-span-2">
              <input
                id="campaign-description"
                value={draft.description}
                onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))}
                className={formInputClass}
                placeholder="Short description of the campaign"
              />
            </FormField>
            <FormField label="Campaign type" htmlFor="campaign-type">
              <select
                id="campaign-type"
                value={draft.type}
                onChange={(e) => setDraft((p) => ({ ...p, type: e.target.value }))}
                className={formInputClass}
              >
                <option value="">Select campaign type</option>
                {TYPES.filter(Boolean).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Status" htmlFor="campaign-status">
              <select
                id="campaign-status"
                value={draft.status}
                onChange={(e) => setDraft((p) => ({ ...p, status: e.target.value }))}
                className={formInputClass}
              >
                <option value="">Select status</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Start date" htmlFor="campaign-start-date">
              <input
                id="campaign-start-date"
                type="date"
                value={draft.start_date || ''}
                onChange={(e) => setDraft((p) => ({ ...p, start_date: e.target.value }))}
                className={formInputClass}
                placeholder="YYYY-MM-DD"
              />
            </FormField>
            <FormField label="End date" htmlFor="campaign-end-date">
              <input
                id="campaign-end-date"
                type="date"
                value={draft.end_date || ''}
                onChange={(e) => setDraft((p) => ({ ...p, end_date: e.target.value }))}
                className={formInputClass}
                placeholder="YYYY-MM-DD"
              />
            </FormField>
            <FormField label="Brief" htmlFor="campaign-brief" className="col-span-2">
              <input
                id="campaign-brief"
                value={draft.brief}
                onChange={(e) => setDraft((p) => ({ ...p, brief: e.target.value }))}
                className={formInputClass}
                placeholder="Brief file path or URL"
              />
            </FormField>
            <FormField label="Screenshot" htmlFor="campaign-screenshot" className="col-span-2">
              <input
                id="campaign-screenshot"
                value={draft.screenshot}
                onChange={(e) => setDraft((p) => ({ ...p, screenshot: e.target.value }))}
                className={formInputClass}
                placeholder="Screenshot file path or URL"
              />
            </FormField>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#dbeafe] text-[#1d4ed8]">
              <IconFileSpreadsheet size={22} stroke={1.75} />
            </span>
            <div>
              <div className="text-sm font-semibold text-gray-900">Campaign data upload</div>
              <p className="mt-1 text-sm text-gray-600">
                Excel (.xlsx) with columns:{' '}
                <span className="font-medium text-gray-800">date</span>,{' '}
                <span className="font-medium text-gray-800">impressions</span>,{' '}
                <span className="font-medium text-gray-800">clicks</span>,{' '}
                <span className="font-medium text-gray-800">spend</span>,{' '}
                <span className="font-medium text-gray-800">publisher</span>.
              </p>
            </div>
          </div>

          {!isEdit ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Save the campaign first, then you can upload metrics here.
            </div>
          ) : (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="sr-only"
                disabled={busy || uploading}
                onChange={(e) => {
                  pickFile(e.target.files?.[0])
                }}
              />

              <div
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    fileInputRef.current?.click()
                  }
                }}
                onDragEnter={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={(e) => {
                  e.preventDefault()
                  setIsDragging(false)
                }}
                onDrop={onDrop}
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={`mt-4 cursor-pointer rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
                  isDragging
                    ? 'border-[#378ADD] bg-blue-50/80'
                    : 'border-gray-200 bg-[#f7f6ee] hover:border-[#378ADD]/50 hover:bg-[#f0efe6]'
                } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
              >
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-white shadow-sm ring-1 ring-gray-200">
                  <IconUpload size={24} className="text-[#378ADD]" stroke={1.75} />
                </div>
                <p className="mt-3 text-sm font-semibold text-gray-900">
                  {isDragging ? 'Drop your file here' : 'Drag & drop or click to browse'}
                </p>
                <p className="mt-1 text-xs text-gray-500">.xlsx only · max one file per upload</p>
              </div>

              {selectedFile ? (
                <div className="mt-3 flex flex-col gap-3 rounded-xl border border-gray-200 bg-[#f7f6ee] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                      disabled={uploading}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedFile(null)
                        if (fileInputRef.current) fileInputRef.current.value = ''
                      }}
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-full bg-[#378ADD] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                      disabled={uploading}
                      onClick={(e) => {
                        e.stopPropagation()
                        uploadExcel()
                      }}
                    >
                      <IconUpload size={18} />
                      {uploading ? 'Uploading…' : 'Upload file'}
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

