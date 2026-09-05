import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  FaEye,
  FaFilter,
  FaTable,
  FaUsers,
  FaCog,
  FaChevronDown,
  FaEdit,
  FaFilePdf,
  FaEnvelope,
  FaSave,
  FaTrash,
  FaTimes,
  FaCheck,
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
  FaSyncAlt,
} from 'react-icons/fa'
import { useAuth } from '../../../context/AuthContext'
import { useData } from '../../../context/DataContext'
import { getSummaryReports } from '../../../features/adminReports/getSummaryReports'
import { getAccountsBoardData } from '../../../features/adminAccounts/selectors/getAccountsBoardData'
import {
  buildAddAccountReportTemplateUrl,
  buildAddCustomerReportTemplateUrl,
  buildAddDealReportTemplateUrl,
} from '../../../features/adminReports/reportTemplateStorage'
import { authService } from '../../../services/authService'
import { customerService } from '../../../services/customerService'
import { buildCsvWorkbookText, exportCsvWorkbook, exportExcelWorkbook, exportSummaryReportHtml } from '../../../utils/excelExport'
import { ExcelExportMenuButton } from '../../../components/common/ExcelExportButton'
import { getCrmOwnerDisplay, isSameCrmOwner } from '../../../features/users/crmUserDirectory'
import './SummaryReportsPage.css'

const CATEGORY_ITEMS = ['Accounts', 'Customers', 'Deals']
const MONTHLY_STATUS_STORAGE_KEY = 'crm-summary-monthly-status'
const MONTHLY_STATUS_REPORT_ID = 'summary-accounts-monthly-status'
const MONTHLY_STATUS_OPTIONS = [
  'New',
  'Follow-up',
  'Technical Offer',
  'Commercial Offer',
  'Quotation Sent',
  'Quote Revision',
  'Order Received',
  'Convert To PO',
  'Order Lost',
  'Converted',
  'Rejected',
  'Contracted',
  'Closed',
  'Priority 1',
  'Priority 2',
]
const MONTHLY_STATUS_OWNERS = [
  'Atish Shah',
  'Bhavesh Prajapati',
  'Hasmukh Chauhan',
  'Jagruti Parmar',
  'Jay Pandya',
  'Keval V Shah',
  'Krunal patel',
  'Monali Pataliya',
  'Naim Vhora',
  'Nita Bhavsar',
  'Rajeshree Parmar',
  'Samir Sheth',
  'Tajamul Rafique Solkar',
  'Vaibhavi Patel',
  'Kanu Shah',
  'Samir Jha',
]
const DEFAULT_MONTHLY_STATUS_CONFIG = {
  reportName: 'Monthly Status',
  visibility: 'All',
  statusAll: true,
  selectedStatuses: [...MONTHLY_STATUS_OPTIONS],
  compareBy: 'Account Owner',
  ownerAll: true,
  selectedOwners: [...MONTHLY_STATUS_OWNERS],
  timeField: 'Added On',
  timePeriod: 'This Month',
  configureFilters: 'YES',
}
const MONTHLY_STATUS_EXPORT_ROW_CONFIG = [
  { stageKey: 'new', label: 'New' },
  { stageKey: 'follow_up', label: 'Follow-up', aliases: ['Follow Up'] },
  { stageKey: 'technical_offer', label: 'Technical Offer' },
  { stageKey: 'commercial_offer', label: 'Commercial Offer' },
  { stageKey: 'quotation_sent', label: 'Quotation Sent' },
  { stageKey: 'quote_revision', label: 'Quote Revision' },
  { stageKey: 'order_received', label: 'Order Received' },
  { stageKey: 'convert_to_po', label: 'Convert To PO' },
  { stageKey: 'order_lost', label: 'Order Lost' },
  { stageKey: 'converted', label: 'Converted' },
  { stageKey: 'rejected', label: 'Rejected' },
  { stageKey: 'contacted', label: 'Contracted' },
  { stageKey: 'closed', label: 'Closed' },
]
const MONTHLY_STATUS_STAGE_LABEL_LOOKUP = MONTHLY_STATUS_EXPORT_ROW_CONFIG.reduce((lookup, entry) => {
  lookup[entry.stageKey] = entry.label
  return lookup
}, {})

const lineIconMap = {
  filters: FaFilter,
  countBy: FaTable,
  compareBy: FaUsers,
}

const normalizeLabel = (value) => String(value || '')
  .trim()
  .toLowerCase()
  .replace(/[\s_-]+/g, ' ')

const dedupeByNormalizedValue = (values = []) => {
  const seen = new Set()

  return values.filter((value) => {
    const normalized = normalizeLabel(value)
    if (!normalized || seen.has(normalized)) return false
    seen.add(normalized)
    return true
  })
}

const normalizeOwnerDisplayValue = (value) => getCrmOwnerDisplay(value) || String(value || '').trim()

const parseReportDate = (value) => {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const formatSummaryGeneratedOn = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const day = String(date.getDate()).padStart(2, '0')
  const month = date.toLocaleString('en-IN', { month: 'short' })
  const year = date.getFullYear()
  const weekday = date.toLocaleString('en-IN', { weekday: 'short' })
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const suffix = date.getHours() >= 12 ? 'pm' : 'am'
  let hours = date.getHours() % 12
  hours = hours === 0 ? 12 : hours

  return `${day} ${month} ${year} ${weekday} ${hours}:${minutes} ${suffix}`
}

const shouldIncludeMonthlyStatusRecord = (record, config, now = new Date()) => {
  if (config.configureFilters !== 'YES') return true

  if (config.timeField === 'Added On' && config.timePeriod === 'This Month') {
    const recordDate = parseReportDate(record.createdAt || record.accountDate || record.updatedAt)
    if (!recordDate) return false

    return (
      recordDate.getFullYear() === now.getFullYear()
      && recordDate.getMonth() === now.getMonth()
    )
  }

  return true
}

const resolveMonthlyStatusLabel = (record) => {
  const stageLabel = MONTHLY_STATUS_STAGE_LABEL_LOOKUP[String(record.stage || '').trim().toLowerCase()]
  if (stageLabel) return stageLabel

  const normalizedStatus = normalizeLabel(record.status || record.stageLabel)
  const matchingEntry = MONTHLY_STATUS_EXPORT_ROW_CONFIG.find((entry) => (
    normalizeLabel(entry.label) === normalizedStatus
    || entry.aliases?.some((alias) => normalizeLabel(alias) === normalizedStatus)
  ))

  return matchingEntry?.label || ''
}

const downloadBlobFile = (content, filename, type) => {
  const blob = new Blob([content], { type })
  const objectUrl = window.URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  setTimeout(() => window.URL.revokeObjectURL(objectUrl), 0)
}

const buildMonthlyStatusOwnerOptions = (normalizedRecords = [], availableUsers = []) => dedupeByNormalizedValue([
  ...MONTHLY_STATUS_OWNERS,
  ...availableUsers,
  ...normalizedRecords.map((record) => String(record.accountOwner || record.addedBy || '').trim()),
].map(normalizeOwnerDisplayValue))

const buildMonthlyStatusExportData = (
  normalizedRecords = [],
  config = DEFAULT_MONTHLY_STATUS_CONFIG,
  ownerOptions = MONTHLY_STATUS_OWNERS,
) => {
  const activeStatuses = dedupeByNormalizedValue(
    config.statusAll ? MONTHLY_STATUS_OPTIONS : config.selectedStatuses,
  )
  const selectedStatusSet = new Set(activeStatuses.map((entry) => normalizeLabel(entry)))
  const configuredOwners = dedupeByNormalizedValue(ownerOptions)

  const filteredRecords = normalizedRecords.filter((record) => {
    if (!shouldIncludeMonthlyStatusRecord(record, config)) return false

    const statusLabel = resolveMonthlyStatusLabel(record)
    if (!statusLabel || !selectedStatusSet.has(normalizeLabel(statusLabel))) {
      return false
    }

    return true
  })

  const recordOwners = filteredRecords.map((record) => (
    normalizeOwnerDisplayValue(String(record.accountOwner || record.addedBy || 'Unassigned').trim() || 'Unassigned')
  ))
  const owners = dedupeByNormalizedValue([
    ...configuredOwners.map(normalizeOwnerDisplayValue),
    ...recordOwners,
  ])

  const normalizedOwnerLookup = owners.reduce((lookup, owner) => {
    lookup[normalizeLabel(owner)] = owner
    return lookup
  }, {})

  const visibleRows = MONTHLY_STATUS_EXPORT_ROW_CONFIG.filter((entry) => (
    selectedStatusSet.has(normalizeLabel(entry.label))
    || entry.aliases?.some((alias) => selectedStatusSet.has(normalizeLabel(alias)))
  ))

  const matrixRows = visibleRows.map((entry) => ({
    status: entry.label,
    counts: owners.reduce((lookup, owner) => {
      lookup[owner] = 0
      return lookup
    }, {}),
    total: 0,
  }))

  const matrixByStatus = matrixRows.reduce((lookup, row) => {
    lookup[normalizeLabel(row.status)] = row
    return lookup
  }, {})

  filteredRecords.forEach((record) => {
    const statusLabel = resolveMonthlyStatusLabel(record)
    const statusRow = matrixByStatus[normalizeLabel(statusLabel)]
    if (!statusRow) return

    const ownerKey = normalizeLabel(record.accountOwner || record.addedBy || 'Unassigned')
    const ownerLabel = normalizedOwnerLookup[ownerKey]
    if (!ownerLabel) return

    statusRow.counts[ownerLabel] += 1
    statusRow.total += 1
  })

  const columns = [
    { key: 'accountStatus', label: 'Account Status', width: 24 },
    ...owners.map((owner) => ({
      key: owner,
      label: owner,
      align: 'center',
      type: 'integer',
      width: Math.max(14, owner.length + 2),
    })),
    { key: 'total', label: 'Total', align: 'center', type: 'integer', width: 12 },
  ]

  const tableRows = matrixRows.map((row) => ({
    accountStatus: row.status,
    ...owners.reduce((lookup, owner) => {
      lookup[owner] = row.counts[owner] || 0
      return lookup
    }, {}),
    total: row.total,
  }))

  const totalsRow = {
    accountStatus: 'Total',
    ...owners.reduce((lookup, owner) => {
      lookup[owner] = matrixRows.reduce((sum, row) => sum + Number(row.counts[owner] || 0), 0)
      return lookup
    }, {}),
    total: filteredRecords.length,
  }

  return {
    title: 'CRM Summary',
    reportName: config.reportName || 'Monthly Status',
    comparison: 'Account Status vs Account Owner',
    reportFilter: config.configureFilters === 'YES'
      ? `${config.timeField} ${config.timePeriod}`
      : 'All Records',
    generatedOn: formatSummaryGeneratedOn(new Date()),
    owners,
    rows: matrixRows,
    columns,
    tableRows: [...tableRows, totalsRow],
    totalRecords: filteredRecords.length,
  }
}

const readMonthlyStatusConfig = () => {
  try {
    const rawValue = window.localStorage.getItem(MONTHLY_STATUS_STORAGE_KEY)
    if (!rawValue) return DEFAULT_MONTHLY_STATUS_CONFIG
    const parsedValue = JSON.parse(rawValue)

    return {
      ...DEFAULT_MONTHLY_STATUS_CONFIG,
      ...parsedValue,
      selectedStatuses: Array.isArray(parsedValue?.selectedStatuses) && parsedValue.selectedStatuses.length > 0
        ? parsedValue.selectedStatuses
        : DEFAULT_MONTHLY_STATUS_CONFIG.selectedStatuses,
      selectedOwners: Array.isArray(parsedValue?.selectedOwners) && parsedValue.selectedOwners.length > 0
        ? parsedValue.selectedOwners
        : DEFAULT_MONTHLY_STATUS_CONFIG.selectedOwners,
    }
  } catch {
    return DEFAULT_MONTHLY_STATUS_CONFIG
  }
}

const formatToggleSummary = (isAllSelected, values) => (
  isAllSelected || values.length === 0 ? 'All' : values.join(', ')
)

const toggleConfigValue = (currentValues, value, allValues) => {
  const normalizedValue = normalizeLabel(value)
  const nextSet = new Set(currentValues.map((entry) => normalizeLabel(entry)))

  if (nextSet.has(normalizedValue)) {
    nextSet.delete(normalizedValue)
  } else {
    nextSet.add(normalizedValue)
  }

  const nextValues = allValues.filter((entry) => nextSet.has(normalizeLabel(entry)))
  return nextValues
}

const ADMIN_SUMMARY_VIEW_ROUTES = {
  Accounts: '/admin/accounts',
  Customers: '/admin/customers/my-customers',
  Deals: '/admin/deals/view',
}

const USER_SUMMARY_VIEW_ROUTES = {
  Accounts: '/accounts/my-group-accounts',
  Customers: '/customers/my-customers',
  Deals: '/deals',
}

const REPORT_EDIT_AUTHORIZED_USERS = ['Keval V Shah', 'Nita Bhavsar']
const REPORT_EDIT_UNAUTHORIZED_MESSAGE = 'You are not authorized to edit reports. Please contact your Maple CRM administrator.'

const getRequestedCategory = (search) => {
  const requestedCategory = new URLSearchParams(search).get('category')
  return CATEGORY_ITEMS.find((item) => item.toLowerCase() === String(requestedCategory || '').toLowerCase()) || null
}

const SummaryReportCard = ({
  report,
  isCollapsed,
  onView,
  onRefresh,
  onOpenSettings,
  onEdit,
  onDelete,
  onToggleCollapse,
  onExportAction,
  detailContent,
}) => (
  <article className={`summary-report-card summary-report-card--${String(report.entityType || '').toLowerCase()}`}>
    <div className="summary-report-card-accent" aria-hidden="true" />

    <div className="summary-report-card-main">
      <div className="summary-report-card-header">
        <h2>{report.title}</h2>
        <div className="summary-report-card-actions">
          <button type="button" className="summary-report-icon-btn summary-report-icon-btn-settings" title="Settings" onClick={onOpenSettings}>
            <FaCog />
          </button>
          <button type="button" className="summary-report-icon-btn summary-report-icon-btn-edit" title="Edit report" onClick={onEdit}>
            <FaEdit />
          </button>
          <button type="button" className="summary-report-icon-btn summary-report-icon-btn-delete" title="Delete report" onClick={onDelete}>
            <FaTrash />
          </button>
          <ExcelExportMenuButton
            label="Export"
            title="Export actions"
            className="summary-report-export-menu"
            buttonClassName="summary-report-icon-btn summary-report-icon-btn--export"
            menuClassName="summary-report-export-dropdown"
            responsiveHideLabel
            items={[
              {
                key: `${report.id}-excel`,
                label: 'Export to Excel',
                badge: 'XLSX',
                onClick: () => onExportAction('excel', report),
              },
              {
                key: `${report.id}-web`,
                label: 'View as Web',
                onClick: () => onExportAction('web', report),
              },
              {
                key: `${report.id}-analytics`,
                label: 'ANALYTICS',
                onClick: () => onExportAction('analytics', report),
              },
            ]}
          />
          <button type="button" className="summary-report-icon-btn summary-report-icon-btn-green" title="View list" onClick={onView}>
            <FaTable />
          </button>
          <button type="button" className="summary-report-icon-btn summary-report-icon-btn-orange" title="Refresh" onClick={onRefresh}>
            <FaSyncAlt />
          </button>
          <button type="button" className="summary-report-icon-btn summary-report-icon-btn-dark" title="Expand or collapse" onClick={onToggleCollapse}>
            <FaChevronDown className={isCollapsed ? '' : 'summary-report-icon-chevron-open'} />
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          <div className="summary-report-card-body">
            <div className="summary-report-card-lines">
              {report.lines.map((line) => {
                const LineIcon = lineIconMap[line.key] || FaTable

                return (
                  <div key={line.key} className="summary-report-line">
                    <LineIcon className="summary-report-line-icon" />
                    <div className="summary-report-line-content">
                      <strong>{line.label}-</strong> {line.value}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="summary-report-card-meta">
              <div className="summary-report-meta-row">
                <FaTable className="summary-report-line-icon" />
                <span>
                  <strong>Created By-</strong> {report.createdBy} <strong>On-</strong> {report.createdOn}
                </span>
              </div>
              <div className="summary-report-meta-row">
                <FaEye className="summary-report-line-icon" />
                <span>
                  <strong>Visibility-</strong> {report.visibility}
                </span>
              </div>
            </div>
          </div>
          {detailContent ? (
            <div className="summary-report-card-detail">
              {detailContent}
            </div>
          ) : null}
        </>
      )}
    </div>
  </article>
)

const MonthlyStatusSettingsPanel = ({
  draft,
  ownerOptions,
  onClose,
  onSave,
  onUpdate,
}) => {
  if (!draft) return null

  const handleStatusToggle = (status) => {
    const nextStatuses = toggleConfigValue(draft.selectedStatuses, status, MONTHLY_STATUS_OPTIONS)
    onUpdate({
      ...draft,
      statusAll: nextStatuses.length === MONTHLY_STATUS_OPTIONS.length,
      selectedStatuses: nextStatuses.length > 0 ? nextStatuses : draft.selectedStatuses,
    })
  }

  const handleOwnerToggle = (owner) => {
    const nextOwners = toggleConfigValue(draft.selectedOwners, owner, ownerOptions)
    onUpdate({
      ...draft,
      ownerAll: nextOwners.length === ownerOptions.length,
      selectedOwners: nextOwners.length > 0 ? nextOwners : draft.selectedOwners,
    })
  }

  return (
    <div className="monthly-status-overlay" onClick={onClose}>
      <section className="monthly-status-panel" onClick={(event) => event.stopPropagation()}>
        <header className="monthly-status-header">
          <h2>Monthly Status</h2>
          <div className="monthly-status-header-actions">
            <button
              type="button"
              className="monthly-status-action-btn monthly-status-action-btn--save"
              onClick={onSave}
            >
              <FaSave aria-hidden="true" />
              <span>Save</span>
            </button>
            <button
              type="button"
              className="monthly-status-action-btn monthly-status-action-btn--close"
              onClick={onClose}
            >
              <FaTimes aria-hidden="true" />
              <span>Close</span>
            </button>
          </div>
        </header>

        <div className="monthly-status-layout">
          <section className="monthly-status-section">
            <label className="monthly-status-field">
              <span>Report Name</span>
              <input value={draft.reportName} readOnly />
            </label>
            <label className="monthly-status-field">
              <span>Visibility</span>
              <select value={draft.visibility} onChange={(event) => onUpdate({ ...draft, visibility: event.target.value })}>
                <option value="Me Only">Me Only</option>
                <option value="All">All</option>
              </select>
            </label>
          </section>

          <section className="monthly-status-section">
            <div className="monthly-status-section-title">Count By</div>
            <p className="monthly-status-note">Report will be generated with all Account details selected below.</p>
            <div className="monthly-status-toggle-row">
              <span>Select Account Status</span>
              <button
                type="button"
                className={`monthly-status-toggle-chip${draft.statusAll ? ' monthly-status-toggle-chip--active' : ''}`}
                onClick={() => onUpdate({ ...draft, statusAll: true, selectedStatuses: [...MONTHLY_STATUS_OPTIONS] })}
              >
                All
              </button>
            </div>
            <div className="monthly-status-chip-grid">
              {MONTHLY_STATUS_OPTIONS.map((status) => {
                const isActive = draft.statusAll || draft.selectedStatuses.some((entry) => normalizeLabel(entry) === normalizeLabel(status))
                return (
                  <button
                    key={status}
                    type="button"
                    className={`monthly-status-chip${isActive ? ' monthly-status-chip--active' : ''}`}
                    onClick={() => handleStatusToggle(status)}
                  >
                    {status}
                  </button>
                )
              })}
            </div>
          </section>

          <section className="monthly-status-section">
            <div className="monthly-status-section-title">Compare By</div>
            <label className="monthly-status-field">
              <span>Compare By</span>
              <select value={draft.compareBy} onChange={(event) => onUpdate({ ...draft, compareBy: event.target.value })}>
                <option value="Account Owner">Account Owner</option>
              </select>
            </label>
            <div className="monthly-status-toggle-row">
              <span>Select Account Owner</span>
              <button
                type="button"
                className={`monthly-status-toggle-chip${draft.ownerAll ? ' monthly-status-toggle-chip--active' : ''}`}
                onClick={() => onUpdate({ ...draft, ownerAll: true, selectedOwners: [...ownerOptions] })}
              >
                All
              </button>
            </div>
            <div className="monthly-status-chip-grid">
              {ownerOptions.map((owner) => {
                const isActive = draft.ownerAll || draft.selectedOwners.some((entry) => normalizeLabel(entry) === normalizeLabel(owner))
                return (
                  <button
                    key={owner}
                    type="button"
                    className={`monthly-status-chip${isActive ? ' monthly-status-chip--active' : ''}`}
                    onClick={() => handleOwnerToggle(owner)}
                  >
                    {owner}
                  </button>
                )
              })}
            </div>
          </section>

          <section className="monthly-status-section monthly-status-section--compact">
            <div className="monthly-status-section-title">Time Period</div>
            <div className="monthly-status-field-grid">
              <label className="monthly-status-field">
                <span>Field</span>
                <select value={draft.timeField} onChange={(event) => onUpdate({ ...draft, timeField: event.target.value })}>
                  <option value="Added On">Added On</option>
                </select>
              </label>
              <label className="monthly-status-field">
                <span>Period</span>
                <select value={draft.timePeriod} onChange={(event) => onUpdate({ ...draft, timePeriod: event.target.value })}>
                  <option value="This Month">This Month</option>
                </select>
              </label>
            </div>
          </section>

          <section className="monthly-status-section monthly-status-section--compact">
            <div className="monthly-status-section-title">Report Filters</div>
            <div className="monthly-status-subpanel">
              <div className="monthly-status-subpanel-title">Configure Filters</div>
              <div className="monthly-status-toggle-row">
                <span>Configure Filters</span>
                <div className="monthly-status-yesno">
                  {['YES', 'NO'].map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={`monthly-status-toggle-chip${draft.configureFilters === value ? ' monthly-status-toggle-chip--active' : ''}`}
                      onClick={() => onUpdate({ ...draft, configureFilters: value })}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  )
}

const NEW_REPORT_OPTIONS = [
  { label: 'Account', category: 'Accounts' },
  { label: 'Customer', category: 'Customers' },
  { label: 'Deal', category: 'Deals' },
]

/* ── Quotation summary data ─────────────────────────────── */
const QUOTATION_ACTIONS = [
  { key: 'pdf',      label: 'View As PDF',       icon: FaFilePdf  },
  { key: 'preview',  label: 'Preview',           icon: FaEye      },
  { key: 'email',    label: 'Email Quote',       icon: FaEnvelope },
  { key: 'cancel',   label: 'Cancel Quote',      icon: FaTimes    },
  { key: 'approved', label: 'Customer Approved', icon: FaCheck    },
  { key: 'rejected', label: 'Customer Rejected', icon: FaTimes    },
  { key: 'deal',     label: 'View Deal',         icon: FaUsers    },
]

const QUOTATION_SUMMARY_DATA = [
  { id: 'q1', num: 'SSIPL/2026/00310', title: 'Account Quotations', total: 15, amount: 45000000, status: 'Open' },
  { id: 'q2', num: 'SSIPL/2026/00309', title: 'Deal Quotations', total: 8, amount: 32000000, status: 'Pending' },
  { id: 'q3', num: 'SSIPL/2026/00308', title: 'Approved Quotations', total: 12, amount: 28500000, status: 'Approved' },
]

/* ── Toast ──────────────────────────────────────────────── */
const TOAST_ICONS = { success: FaCheckCircle, error: FaTimesCircle, info: FaInfoCircle }

const Toast = ({ toast }) => {
  if (!toast) return null
  const Icon = TOAST_ICONS[toast.type] || FaInfoCircle
  return (
    <div className={`qr-toast qr-toast--${toast.type}`}>
      <Icon className="qr-toast-icon" />
      <span>{toast.msg}</span>
    </div>
  )
}

/* ── Quotation Detail Modal (PDF / Preview) ─────────────── */
const QuotationDetailModal = ({ modal, onClose }) => {
  if (!modal) return null
  const { quotation, title } = modal
  return (
    <div className="qr-overlay" onClick={onClose}>
      <div className="qr-modal" onClick={(e) => e.stopPropagation()}>
        <div className="qr-modal-header">
          <span className="qr-modal-title">{title}</span>
          <button type="button" className="qr-modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="qr-modal-body">
          <table className="qr-detail-table">
            <tbody>
              {[
                ['Quote Number', quotation.num],
                ['Title',        quotation.title],
                ['Total Quotes', quotation.total],
                ['Total Amount', `₹${(quotation.amount / 1000000).toFixed(1)}M`],
                ['Status',       quotation.status],
              ].map(([label, value]) => (
                <tr key={label}>
                  <td className="qr-detail-label">{label}</td>
                  <td className="qr-detail-value">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="qr-modal-footer">
          <button type="button" className="qr-modal-btn qr-modal-btn--gray" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

const QuotationActionMenu = ({ quotation, onAction, isOpen, onToggle }) => {
  const ref = useRef(null)
  const [position, setPosition] = useState('below')

  useEffect(() => {
    if (!isOpen) return

    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onToggle(null)
      }
    }

    // Check if dropdown would overflow
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      setPosition(spaceBelow < 300 ? 'above' : 'below')
    }

    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen, onToggle])

  return (
    <div className={`qr-action-menu qr-action-menu--${position}`} ref={ref}>
      <button
        type="button"
        className="qr-action-badge"
        onClick={(e) => { e.stopPropagation(); onToggle(quotation.id) }}
      >
        {quotation.num.slice(-3)}
        <FaChevronDown className="qr-action-caret" />
      </button>
      {isOpen && (
        <div className="qr-action-dropdown">
          {QUOTATION_ACTIONS.map((a) => {
            const IconComponent = a.icon
            return (
              <button
                key={a.key}
                type="button"
                className="qr-action-item"
                onClick={() => { onAction(a.key, quotation); onToggle(null) }}
              >
                <IconComponent className="qr-action-icon" />
                <span>{a.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

const QuotationSummaryCard = ({ quotation, onAction, openMenu, onMenuToggle }) => (
  <article className="quotation-summary-card">
    <div className="quotation-card-header">
      <div>
        <h3 className="quotation-card-title">{quotation.title}</h3>
        <p className="quotation-card-meta">Quote # {quotation.num}</p>
      </div>
      <QuotationActionMenu
        quotation={quotation}
        isOpen={openMenu === quotation.id}
        onToggle={onMenuToggle}
        onAction={onAction}
      />
    </div>
    <div className="quotation-card-body">
      <div className="quotation-stat">
        <span className="quotation-stat-label">Total Quotes:</span>
        <span className="quotation-stat-value">{quotation.total}</span>
      </div>
      <div className="quotation-stat">
        <span className="quotation-stat-label">Total Amount:</span>
        <span className="quotation-stat-value">₹{(quotation.amount / 1000000).toFixed(1)}M</span>
      </div>
      <div className="quotation-stat">
        <span className="quotation-stat-label">Status:</span>
        <span className={`quotation-stat-badge quotation-stat-badge--${quotation.status.toLowerCase()}`}>
          {quotation.status}
        </span>
      </div>
    </div>
  </article>
)

const SummaryReportsPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const reportBasePath = location.pathname.startsWith('/admin') ? '/admin/reports' : '/reports'
  const summaryViewRoutes = location.pathname.startsWith('/admin') ? ADMIN_SUMMARY_VIEW_ROUTES : USER_SUMMARY_VIEW_ROUTES
  const { accounts, deals, addNotification, refreshData } = useData()
  const { user } = useAuth()
  const [activeCategory, setActiveCategory] = useState('Accounts')
  const [caretOpen, setCaretOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState(null)
  const [quotations, setQuotations] = useState(QUOTATION_SUMMARY_DATA)
  const [collapsedReportIds, setCollapsedReportIds] = useState([])
  const [toast, setToast] = useState(null)
  const [detailModal, setDetailModal] = useState(null)
  const [monthlyStatusConfig, setMonthlyStatusConfig] = useState(readMonthlyStatusConfig)
  const [monthlyStatusDraft, setMonthlyStatusDraft] = useState(null)
  const splitBtnRef = useRef(null)
  const toastTimer = useRef(null)

  useEffect(() => {
    const handleOutside = (e) => {
      if (splitBtnRef.current && !splitBtnRef.current.contains(e.target)) {
        setCaretOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])
  useEffect(() => {
    const requestedCategory = getRequestedCategory(location.search)
    if (requestedCategory) {
      setActiveCategory(requestedCategory)
    }
  }, [location.search])

  const customers = useMemo(() => customerService.getCustomers(), [])
  const availableUsers = useMemo(() => (
    authService.getAvailableUsers()
      .map((entry) => entry.name)
      .filter((name) => name && name !== 'System Administrator')
  ), [])
  const normalizedAccountsBoard = useMemo(
    () => getAccountsBoardData(accounts),
    [accounts],
  )
  const monthlyStatusOwnerOptions = useMemo(
    () => buildMonthlyStatusOwnerOptions(normalizedAccountsBoard.records, availableUsers),
    [availableUsers, normalizedAccountsBoard.records],
  )
  const canEditReports = useMemo(() => {
    const userNames = [
      user?.name,
      user?.ownerDisplayName,
      user?.username,
      user?.email,
      user?.ownerCode,
    ]

    return REPORT_EDIT_AUTHORIZED_USERS.some((authorizedName) => (
      userNames.some((userName) => isSameCrmOwner(userName, authorizedName))
    ))
  }, [user?.email, user?.name, user?.ownerCode, user?.ownerDisplayName, user?.username])

  const reports = useMemo(() => {
    const baseReports = getSummaryReports({
      accounts,
      deals,
      customers,
      availableUsers,
      createdBy: user?.name || 'System Administrator',
    })

    return baseReports.map((report) => {
      if (report.id !== MONTHLY_STATUS_REPORT_ID) return report

      return {
        ...report,
        visibility: monthlyStatusConfig.visibility,
        lines: [
          {
            key: 'filters',
            label: 'Filters',
            value: monthlyStatusConfig.configureFilters === 'YES'
              ? `${monthlyStatusConfig.timeField} ${monthlyStatusConfig.timePeriod}`
              : 'Configure Filters: No',
          },
          {
            key: 'countBy',
            label: 'Count By Account Status',
            value: formatToggleSummary(monthlyStatusConfig.statusAll, monthlyStatusConfig.selectedStatuses),
          },
          {
            key: 'compareBy',
            label: 'Compare By Account Owner',
            value: `${monthlyStatusConfig.compareBy} - All Account Owners`,
          },
        ],
      }
    })
  }, [accounts, availableUsers, customers, deals, monthlyStatusConfig, user?.name])

  const visibleReports = useMemo(() => (
    reports.filter((report) => report.entityType === activeCategory)
  ), [activeCategory, reports])

  const monthlyStatusExportData = useMemo(
    () => buildMonthlyStatusExportData(
      normalizedAccountsBoard.records,
      monthlyStatusConfig,
      monthlyStatusOwnerOptions,
    ),
    [monthlyStatusConfig, monthlyStatusOwnerOptions, normalizedAccountsBoard.records],
  )

  const handleNewSummaryReport = (option) => {
    setActiveCategory(option.category)
    setCaretOpen(false)

    if (option.label === 'Account') {
      navigate(buildAddAccountReportTemplateUrl())
      return
    }

    if (option.label === 'Customer') {
      navigate(buildAddCustomerReportTemplateUrl())
      return
    }

    if (option.label === 'Deal') {
      navigate(buildAddDealReportTemplateUrl())
    }
  }

  const showToast = useCallback((type, msg) => {
    setToast({ type, msg })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2800)
  }, [])

  const handleSelectCategory = (category) => {
    setActiveCategory(category)
    navigate(`${reportBasePath}/summary?category=${encodeURIComponent(category)}`, { replace: true })
  }

  const handleViewSummary = (report) => {
    const targetRoute = summaryViewRoutes[report.entityType]
    addNotification('info', 'View list', `Opening ${report.title}.`)
    if (targetRoute) {
      navigate(targetRoute)
      return
    }

    showToast('info', `${report.title} is ready to view.`)
  }

  const handleRefreshSummary = async (report) => {
    await refreshData()
    addNotification('success', 'Summary refreshed', `${report.title} was refreshed.`)
    showToast('success', `${report.title} refreshed.`)
  }

  const buildReportFilename = useCallback((report, extension) => (
    `${String(report.title || 'summary-report').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}.${extension}`
  ), [])

  const handleSummaryExportAction = useCallback((actionKey, report) => {
    if (actionKey === 'web') {
      handleViewSummary(report)
      return
    }

    if (actionKey === 'analytics') {
      navigate(`${reportBasePath}/analytics`)
      return
    }

    if (report.id === MONTHLY_STATUS_REPORT_ID) {
      const monthlyStatusMetadata = [
        { label: 'Generated On', value: monthlyStatusExportData.generatedOn },
        { label: 'Summary Report Name', value: monthlyStatusExportData.reportName },
        { label: 'Comparison', value: monthlyStatusExportData.comparison },
        { label: 'Report Filter', value: monthlyStatusExportData.reportFilter },
        { label: 'Total Records', value: String(monthlyStatusExportData.totalRecords) },
      ]

      if (actionKey === 'csv') {
        const csvContent = buildCsvWorkbookText({
          title: monthlyStatusExportData.title,
          subtitle: '',
          metadata: monthlyStatusMetadata,
          columns: monthlyStatusExportData.columns,
          rows: monthlyStatusExportData.tableRows,
          sheetName: monthlyStatusExportData.reportName,
          compact: false,
        })

        downloadBlobFile(
          csvContent,
          buildReportFilename(report, 'csv'),
          'text/csv;charset=utf-8;',
        )
        addNotification('success', 'CSV exported', `${report.title} was exported to CSV.`)
        showToast('success', `${report.title} exported to CSV.`)
        return
      }

      if (actionKey === 'excel') {
        exportSummaryReportHtml({
          filename: buildReportFilename(report, 'xls'),
          title: monthlyStatusExportData.title,
          metadata: monthlyStatusMetadata,
          owners: monthlyStatusExportData.owners,
          rows: monthlyStatusExportData.rows,
        })
        addNotification('success', 'Excel exported', `${report.title} was exported to Excel.`)
        showToast('success', `${report.title} exported to Excel.`)
        return
      }
    }

    const rows = [
      ['Report Name', report.title],
      ['Entity Type', report.entityType],
      ['Created By', report.createdBy],
      ['Created On', report.createdOn],
      ['Visibility', report.visibility],
      ...report.lines.map((line) => [line.label, line.value]),
    ]

    const summaryExportOptions = {
      title: report.title,
      subtitle: `${report.entityType} summary export`,
      sheetName: 'Summary Report',
      metadata: [
        { label: 'Created By', value: report.createdBy },
        { label: 'Created On', value: report.createdOn },
        { label: 'Visibility', value: report.visibility },
        { label: 'Entity Type', value: report.entityType },
        { label: 'Generated On', value: new Date().toLocaleString('en-IN') },
      ],
      columns: [
        { key: 'field', label: 'Field', width: 28 },
        { key: 'value', label: 'Value', width: 50 },
      ],
      rows: rows.map(([field, value]) => ({ field, value })),
    }

    if (actionKey === 'csv') {
      exportCsvWorkbook({
        ...summaryExportOptions,
        filename: buildReportFilename(report, 'csv'),
      })
      addNotification('success', 'CSV exported', `${report.title} was exported to CSV.`)
      showToast('success', `${report.title} exported to CSV.`)
      return
    }

    if (actionKey === 'excel') {
      exportExcelWorkbook({
        ...summaryExportOptions,
        filename: buildReportFilename(report, 'xlsx'),
      })
      addNotification('success', 'Excel exported', `${report.title} was exported to Excel.`)
      showToast('success', `${report.title} exported to Excel.`)
    }
  }, [addNotification, buildReportFilename, handleViewSummary, monthlyStatusExportData, navigate, showToast])

  const handleToggleSummaryCollapse = (reportId) => {
    setCollapsedReportIds((currentValue) => (
      currentValue.includes(reportId)
        ? currentValue.filter((entry) => entry !== reportId)
        : [...currentValue, reportId]
    ))
    const report = visibleReports.find((entry) => entry.id === reportId)
    if (report) {
      const isCollapsed = collapsedReportIds.includes(reportId)
      addNotification(
        'info',
        isCollapsed ? 'Summary expanded' : 'Summary collapsed',
        `${report.title} ${isCollapsed ? 'expanded' : 'collapsed'}.`
      )
    }
  }

  const handleOpenMonthlyStatusSettings = (report) => {
    if (report.id !== MONTHLY_STATUS_REPORT_ID) return
    setMonthlyStatusDraft({
      ...monthlyStatusConfig,
      selectedStatuses: [...monthlyStatusConfig.selectedStatuses],
      selectedOwners: [...monthlyStatusConfig.selectedOwners],
    })
  }

  const showReportEditUnauthorized = useCallback(() => {
    addNotification('warning', 'Report edit restricted', REPORT_EDIT_UNAUTHORIZED_MESSAGE)
    showToast('error', REPORT_EDIT_UNAUTHORIZED_MESSAGE)
  }, [addNotification, showToast])

  const handleReportSettings = useCallback((report) => {
    if (!canEditReports) {
      showReportEditUnauthorized()
      return
    }

    if (report.id === MONTHLY_STATUS_REPORT_ID) {
      handleOpenMonthlyStatusSettings(report)
      return
    }

    showToast('info', `${report.title} settings are available from the report builder.`)
  }, [canEditReports, showReportEditUnauthorized, showToast])

  const handleEditReport = useCallback((report) => {
    if (!canEditReports) {
      showReportEditUnauthorized()
      return
    }

    if (report.id === MONTHLY_STATUS_REPORT_ID) {
      handleOpenMonthlyStatusSettings(report)
      return
    }

    showToast('info', `${report.title} can be edited from its report template.`)
  }, [canEditReports, showReportEditUnauthorized, showToast])

  const handleDeleteReport = useCallback((report) => {
    showToast('info', `${report.title} is a default summary report and cannot be deleted.`)
  }, [showToast])

  const handleCloseMonthlyStatusSettings = () => {
    setMonthlyStatusDraft(null)
  }

  const handleSaveMonthlyStatusSettings = () => {
    if (!monthlyStatusDraft) return

    const normalizedConfig = {
      ...monthlyStatusDraft,
      statusAll: monthlyStatusDraft.statusAll || monthlyStatusDraft.selectedStatuses.length === MONTHLY_STATUS_OPTIONS.length,
      ownerAll: monthlyStatusDraft.ownerAll || monthlyStatusDraft.selectedOwners.length === monthlyStatusOwnerOptions.length,
      selectedStatuses: monthlyStatusDraft.statusAll ? [...MONTHLY_STATUS_OPTIONS] : monthlyStatusDraft.selectedStatuses,
      selectedOwners: monthlyStatusDraft.ownerAll ? [...monthlyStatusOwnerOptions] : monthlyStatusDraft.selectedOwners,
    }

    setMonthlyStatusConfig(normalizedConfig)
    window.localStorage.setItem(MONTHLY_STATUS_STORAGE_KEY, JSON.stringify(normalizedConfig))
    setMonthlyStatusDraft(null)
    addNotification('success', 'Monthly Status saved', 'Summary Report settings were updated successfully.')
  }

  const handleQuotationAction = useCallback((key, quotation) => {
    setOpenMenu(null)
    switch (key) {
      case 'pdf':
        setDetailModal({ quotation, title: 'View As PDF' })
        break
      case 'preview':
        setDetailModal({ quotation, title: 'Preview' })
        break
      case 'email':
        showToast('info', `Email sent for "${quotation.title}".`)
        break
      case 'cancel':
        setQuotations((prev) => prev.map((q) => q.id === quotation.id ? { ...q, status: 'Cancelled' } : q))
        showToast('error', `"${quotation.title}" has been cancelled.`)
        break
      case 'approved':
        setQuotations((prev) => prev.map((q) => q.id === quotation.id ? { ...q, status: 'Approved' } : q))
        showToast('success', `"${quotation.title}" marked as Customer Approved.`)
        break
      case 'rejected':
        setQuotations((prev) => prev.map((q) => q.id === quotation.id ? { ...q, status: 'Rejected' } : q))
        showToast('error', `"${quotation.title}" marked as Customer Rejected.`)
        break
      case 'deal':
        navigate(location.pathname.startsWith('/admin') ? '/admin/quotation-manager/view' : '/quotation-manager/view')
        break
      default:
        break
    }
  }, [showToast, navigate])

  return (
    <div className="summary-reports-page">
      <Toast toast={toast} />
      <QuotationDetailModal modal={detailModal} onClose={() => setDetailModal(null)} />
      <MonthlyStatusSettingsPanel
        draft={monthlyStatusDraft}
        ownerOptions={monthlyStatusOwnerOptions}
        onClose={handleCloseMonthlyStatusSettings}
        onSave={handleSaveMonthlyStatusSettings}
        onUpdate={setMonthlyStatusDraft}
      />
      <div className="summary-reports-topbar">
        <h1>Summary</h1>
        <div className="summary-reports-topbar-actions">
          <div className="summary-reports-split-btn" ref={splitBtnRef}>
            <button type="button" className="summary-reports-primary-btn">New Report</button>
            <button
              type="button"
              className="summary-reports-primary-btn summary-reports-caret-btn"
              aria-label="Open report actions"
              onClick={() => setCaretOpen((v) => !v)}
            >
              <span className="summary-reports-caret-icon" aria-hidden="true" />
            </button>
            {caretOpen && (
              <div className="summary-reports-dropdown">
                {NEW_REPORT_OPTIONS.map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    className="summary-reports-dropdown-item"
                    onClick={() => handleNewSummaryReport(option)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="summary-reports-body">
        <aside className="summary-reports-sidebar">
          <div className="summary-reports-sidebar-list">
            {CATEGORY_ITEMS.map((item) => (
              <button
                key={item}
                type="button"
                className={`summary-reports-sidebar-item${activeCategory === item ? ' summary-reports-sidebar-item-active' : ''}`}
                onClick={() => handleSelectCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </aside>

        <main className="summary-reports-content">
          <section className="summary-reports-panel">
            {activeCategory === 'Quotations' ? (
              quotations.map((quotation) => (
                <QuotationSummaryCard
                  key={quotation.id}
                  quotation={quotation}
                  openMenu={openMenu}
                  onMenuToggle={setOpenMenu}
                  onAction={handleQuotationAction}
                />
              ))
            ) : (
              visibleReports.map((report) => (
                <SummaryReportCard
                  key={report.id}
                  report={report}
                  isCollapsed={collapsedReportIds.includes(report.id)}
                  detailContent={null}
                  onOpenSettings={() => handleReportSettings(report)}
                  onEdit={() => handleEditReport(report)}
                  onDelete={() => handleDeleteReport(report)}
                  onExportAction={handleSummaryExportAction}
                  onView={() => handleViewSummary(report)}
                  onRefresh={() => handleRefreshSummary(report)}
                  onToggleCollapse={() => handleToggleSummaryCollapse(report.id)}
                />
              ))
            )}
          </section>
        </main>
      </div>
    </div>
  )
}

export default SummaryReportsPage
