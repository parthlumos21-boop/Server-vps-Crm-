import React, { useEffect, useMemo, useRef, useState } from 'react'
import { FaArrowRight, FaChevronDown, FaChevronLeft, FaChevronRight, FaClock, FaPhoneAlt } from 'react-icons/fa'
import { useLocation, useNavigate } from 'react-router-dom'
import { useData } from '../../../context/DataContext'
import { useAuth } from '../../../context/AuthContext'
import { supportRequestApi } from '../../../services/supportRequestApi'
import {
  SUPPORT_REQUEST_TYPE_OPTIONS,
  formatShortDate,
  formatSupportRequestType,
  getSupportRequestBasePath,
} from './SupportRequestShared'
import './SupportRequestView.css'

const STATUS_COLUMNS = [
  { key: 'active', label: 'Active', aliases: ['active', 'open', 'new'] },
  { key: 'attending', label: 'Attending', aliases: ['attending'] },
  { key: 'on-site', label: 'On Site', aliases: ['on site', 'on-site', 'onsite'] },
  { key: 'in-progress', label: 'In Progress', aliases: ['in progress', 'in-progress', 'progress'] },
  { key: 'on-hold', label: 'On Hold', aliases: ['on hold', 'on-hold', 'hold'] },
  { key: 'postponed', label: 'Postponed', aliases: ['postponed'] },
]

const normalizeValue = (value) => String(value || '').trim().toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ')

const getStatusColumnKey = (status) => {
  const normalizedStatus = normalizeValue(status)
  const column = STATUS_COLUMNS.find((entry) => entry.aliases.includes(normalizedStatus))
  return column?.key || 'active'
}

const getStatusLabel = (status) => (
  STATUS_COLUMNS.find((entry) => entry.key === getStatusColumnKey(status))?.label || status || 'Active'
)

const getRequestAgeLabel = (supportRequest) => {
  const rawDate = supportRequest.updatedAt || supportRequest.createdAt || supportRequest.srDate
  if (!rawDate) return '-'

  const date = new Date(rawDate)
  if (Number.isNaN(date.getTime())) return '-'

  const days = Math.max(0, Math.floor((Date.now() - date.getTime()) / 86400000))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 365) return `${days} days ago`
  return `${Math.floor(days / 365)} years ago`
}

const getDateRange = (supportRequest) => {
  const startDate = formatShortDate(supportRequest.srDate || supportRequest.createdAt)
  const endDate = formatShortDate(supportRequest.closedOn || supportRequest.updatedAt || supportRequest.createdAt)

  if (startDate === '-' && endDate === '-') return '-'
  if (startDate === endDate || endDate === '-') return startDate
  return `${startDate} - ${endDate}`
}

const FilterMenu = ({ label, options, selectedValues, onToggle, onLoad }) => {
  const [isOpen, setIsOpen] = useState(false)
  const selectedCount = selectedValues.length

  return (
    <div className="sr-status-filter">
      <button
        type="button"
        className="sr-status-filter-trigger btn-red-theme"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
      >
        <span>{label} ({selectedCount})</span>
        <FaChevronDown />
      </button>

      {isOpen ? (
        <div className="sr-status-filter-menu">
          <div className="sr-status-filter-options">
            {options.map((option) => (
              <label key={option.value} className="sr-status-filter-option">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option.value)}
                  onChange={() => onToggle(option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>

          <button
            type="button"
            className="sr-status-filter-load btn-red-theme"
            onClick={() => {
              onLoad()
              setIsOpen(false)
            }}
          >
            <span>Load</span>
            <FaArrowRight />
          </button>
        </div>
      ) : null}
    </div>
  )
}

const SupportRequestView = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { supportRequests, refreshSupportRequests } = useData()
  const { user } = useAuth()
  const scrollRef = useRef(null)
  const basePath = getSupportRequestBasePath(location.pathname)
  const [selectedStatuses, setSelectedStatuses] = useState(STATUS_COLUMNS.map((entry) => entry.key))
  const [selectedTypes, setSelectedTypes] = useState(SUPPORT_REQUEST_TYPE_OPTIONS.map((entry) => entry.value))

  const isAuthorizedToClose = ['parth@support.com', 'rushabh@support.com'].includes(user?.email)

  const activeRequests = useMemo(() => (
    supportRequests
      .filter((supportRequest) => normalizeValue(supportRequest.status) !== 'closed')
      .sort((left, right) => (
        new Date(right.updatedAt || right.createdAt || 0).getTime()
        - new Date(left.updatedAt || left.createdAt || 0).getTime()
      ))
  ), [supportRequests])

  const availableTypeOptions = useMemo(() => {
    const knownTypes = new Set(SUPPORT_REQUEST_TYPE_OPTIONS.map((option) => option.value))
    const dynamicOptions = activeRequests
      .map((supportRequest) => supportRequest.requestType)
      .filter(Boolean)
      .filter((value, index, values) => values.indexOf(value) === index && !knownTypes.has(value))
      .map((value) => ({ value, label: formatSupportRequestType(value) }))

    return [...SUPPORT_REQUEST_TYPE_OPTIONS, ...dynamicOptions]
  }, [activeRequests])

  useEffect(() => {
    setSelectedTypes((currentValues) => {
      const allTypeValues = availableTypeOptions.map((option) => option.value)
      const missingValues = allTypeValues.filter((value) => !currentValues.includes(value))

      return missingValues.length > 0 ? [...currentValues, ...missingValues] : currentValues
    })
  }, [availableTypeOptions])

  const filteredRequests = useMemo(() => (
    activeRequests.filter((supportRequest) => (
      selectedStatuses.includes(getStatusColumnKey(supportRequest.status))
      && selectedTypes.includes(supportRequest.requestType)
    ))
  ), [activeRequests, selectedStatuses, selectedTypes])

  const requestsByStatus = useMemo(() => (
    STATUS_COLUMNS.reduce((lookup, column) => {
      lookup[column.key] = filteredRequests.filter((supportRequest) => getStatusColumnKey(supportRequest.status) === column.key)
      return lookup
    }, {})
  ), [filteredRequests])

  const visibleColumns = STATUS_COLUMNS.filter((column) => selectedStatuses.includes(column.key))

  const toggleStatus = (statusKey) => {
    setSelectedStatuses((currentValues) => (
      currentValues.includes(statusKey)
        ? currentValues.filter((value) => value !== statusKey)
        : [...currentValues, statusKey]
    ))
  }

  const toggleType = (typeKey) => {
    setSelectedTypes((currentValues) => (
      currentValues.includes(typeKey)
        ? currentValues.filter((value) => value !== typeKey)
        : [...currentValues, typeKey]
    ))
  }

  const handleScroll = (direction) => {
    const container = scrollRef.current
    if (!container) return

    const column = container.querySelector('.sr-status-board-column')
    const columnWidth = column ? column.getBoundingClientRect().width : 380
    container.scrollBy({ left: direction * (columnWidth + 12), behavior: 'smooth' })
  }

  const handleCloseRequest = async (e, id) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to close this ticket?')) return
    try {
      await supportRequestApi.closeTicket(id)
      await refreshSupportRequests()
    } catch (err) {
      console.error('Error closing ticket:', err)
      alert(err.response?.data?.message || 'Failed to close ticket.')
    }
  }

  const isTableView = selectedStatuses.length === 1 || selectedTypes.length === 1

  return (
    <div className="support-request-view-page">
      <section className="sr-status-board-shell">
        <header className="sr-status-board-toolbar">
          <div>
            <h1>Support Request View</h1>
            <p>{filteredRequests.length} SR records by status and type</p>
          </div>

          <div className="sr-status-board-filters">
            <FilterMenu
              label="Status"
              options={STATUS_COLUMNS.map((entry) => ({ value: entry.key, label: entry.label }))}
              selectedValues={selectedStatuses}
              onToggle={toggleStatus}
              onLoad={() => {}}
            />
            <FilterMenu
              label="Type"
              options={availableTypeOptions}
              selectedValues={selectedTypes}
              onToggle={toggleType}
              onLoad={() => {}}
            />
          </div>
        </header>

        {isTableView ? (
          <div className="support-request-legacy-table-shell" style={{ margin: '16px', overflowX: 'auto' }}>
            <table className="support-request-legacy-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Request Details</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th>Contact</th>
                  <th>Date</th>
                  {isAuthorizedToClose && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((supportRequest, index) => (
                  <tr key={supportRequest.id}>
                    <td style={{ textAlign: 'center' }}>{index + 1}</td>
                    <td>
                      <strong>{formatSupportRequestType(supportRequest.requestType)} [{supportRequest.srNumber || 'SR'}]</strong>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="sr-status-dot" style={{ display: 'inline-block', marginRight: '6px' }} />
                      {getStatusLabel(supportRequest.status)}
                    </td>
                    <td>{supportRequest.contactMobile || supportRequest.contactPhone || supportRequest.customerPhone || '-'}</td>
                    <td>{getDateRange(supportRequest)}</td>
                    {isAuthorizedToClose && (
                      <td onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="btn-red-theme"
                          onClick={(e) => handleCloseRequest(e, supportRequest.id)}
                          style={{ padding: '6px 12px', fontSize: '13px' }}
                        >
                          Close Request
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                {filteredRequests.length === 0 && (
                  <tr>
                    <td colSpan={isAuthorizedToClose ? 6 : 5} style={{ textAlign: 'center', padding: '32px', color: '#666' }}>
                      No support requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="sr-status-board-wrap">
            <button type="button" className="sr-status-board-edge sr-status-board-edge-left" onClick={() => handleScroll(-1)} aria-label="Scroll status columns left">
              <FaChevronLeft />
            </button>

            <div ref={scrollRef} className="sr-status-board-scroll">
              <div className="sr-status-board-columns">
                {visibleColumns.map((column) => {
                  const columnRequests = requestsByStatus[column.key] || []

                  return (
                    <section key={column.key} className="sr-status-board-column">
                      <header className="sr-status-board-column-header">
                        {column.label} ({columnRequests.length})
                      </header>

                      <div className="sr-status-board-column-body">
                        {columnRequests.map((supportRequest) => (
                          <div
                            key={supportRequest.id}
                            className="sr-status-board-card"
                          >
                            <strong className="sr-status-board-card-title">
                              {formatSupportRequestType(supportRequest.requestType)} [{supportRequest.srNumber || 'SR'}]
                            </strong>

                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--text-primary)', margin: '4px 0' }}>
                              <span>{getDateRange(supportRequest)}</span>
                              <span>{getStatusLabel(supportRequest.status)}</span>
                              <span>{supportRequest.srNumber || '-'}</span>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }} className="sr-status-board-card-muted">
                                <FaClock /> {getRequestAgeLabel(supportRequest)}
                              </span>
                            </div>

                            <span className="sr-status-board-card-line" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <FaPhoneAlt />
                              {supportRequest.contactMobile || supportRequest.contactPhone || supportRequest.customerPhone || '-'}
                            </span>

                            {isAuthorizedToClose && (
                              <div style={{ marginTop: '12px' }}>
                                <button
                                  type="button"
                                  className="btn-red-theme"
                                  onClick={(e) => handleCloseRequest(e, supportRequest.id)}
                                  style={{ width: '100%', padding: '6px' }}
                                >
                                  Close Request
                                </button>
                              </div>
                            )}
                          </div>
                        ))}

                        {columnRequests.length === 0 ? (
                          <div className="sr-status-board-empty" />
                        ) : null}
                      </div>
                    </section>
                  )
                })}
              </div>
            </div>

            <button type="button" className="sr-status-board-edge sr-status-board-edge-right" onClick={() => handleScroll(1)} aria-label="Scroll status columns right">
              <FaChevronRight />
            </button>
          </div>
        )}
      </section>
    </div>
  )
}

export default SupportRequestView
