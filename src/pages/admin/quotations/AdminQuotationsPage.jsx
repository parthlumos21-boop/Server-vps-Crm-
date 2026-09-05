import { useEffect, useMemo, useState } from 'react'
import {
  FaCheck,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaClone,
  FaDownload,
  FaEye,
  FaEllipsisV,
  FaEdit,
  FaFilePdf,
  FaPlus,
  FaPrint,
  FaSearch,
  FaSearchMinus,
  FaSearchPlus,
  FaSort,
  FaTimes,
  FaUpload,
  FaUserFriends,
} from 'react-icons/fa'
import { useNavigate, useSearchParams } from 'react-router-dom'
import swatiLogo from '../../../assets/swati-logo.png'
import lumosLogo from '../../../assets/lumos-logo.svg'
import { normalizeAccountRecord } from '../../../features/adminAccounts/adapters/normalizeAccountRecord'
import { compareAccountsByNumberAsc } from '../../../features/adminAccounts/selectors/getAccountsBoardData'
import { useData } from '../../../context/DataContext'
import { useAuth } from '../../../context/AuthContext'
import { exportExcelWorkbook, exportCsvWorkbook } from '../../../utils/excelExport'
import { formatCurrency } from '../../../utils/helpers'
import { customViewApi } from '../../../services/customViewApi'
import { ExcelExportActionButton, ExcelExportMenuButton } from '../../../components/common/ExcelExportButton'
import './AdminQuotationsPage.css'

const PAGE_SIZE = 6
const ACCOUNT_LIST_PAGE_SIZE = 8
const ADMIN_QUOTATION_LAYOUT_STORAGE_KEY = 'crm-admin-quotation-manager-layout'
const ADMIN_QUOTATION_LAYOUT_VIEW_ENTITY_TYPE = 'quotation_layout_preferences'
const ADMIN_QUOTATION_LAYOUT_VIEW_NAME = 'Admin Quotation Manager Layout'
const MAX_UPLOAD_QUOTATION_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_UPLOAD_QUOTATION_EXTENSIONS = ['pdf', 'xls', 'xlsx']

const INITIAL_FILTERS = {
  num: '',
  owner: '',
  date: '',
  company: '',
  amount: '',
  status: '',
  project: '',
}

const INITIAL_ACCOUNT_FILTERS = {
  accountNumber: '',
  name: '',
  email: '',
  phone: '',
  accountOwner: '',
}

const UPLOAD_QUOTATION_STATUS_OPTIONS = [
  { value: '', label: 'Select' },
  { value: 'open', label: 'Open' },
  { value: 'approved', label: 'Approved' },
  { value: 'customer_approved', label: 'Customer Approved' },
  { value: 'customer_rejected', label: 'Customer Rejected' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
]

const QUOTATION_CURRENCY_OPTIONS = [
  { value: 'INR', label: 'INR' },
  { value: 'USD', label: 'USD' },
  { value: 'AED', label: 'AED' },
  { value: 'NZD', label: 'NZ$' },
  { value: 'CAD', label: 'CAD' },
  { value: 'SEK', label: 'SEK' },
  { value: 'SGD', label: 'SGD' },
  { value: 'AUD', label: 'AUD' },
  { value: 'JPY', label: 'JPY' },
  { value: 'EUR', label: 'Euro' },
  { value: 'GBP', label: 'GBP' },
  { value: 'QAR', label: 'QAR' },
  { value: 'SAR', label: 'SAR' },
  { value: 'OMR', label: 'OMR' },
]

const getTodayInputValue = () => new Date().toISOString().slice(0, 10)

const addDaysToInputValue = (dateValue, days) => {
  const nextDate = new Date(dateValue || getTodayInputValue())
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate.toISOString().slice(0, 10)
}

const createInitialUploadQuotationForm = () => {
  const quotationDate = getTodayInputValue()

  return {
    selectedAccountId: '',
    selectedAccountLabel: '',
    clientAccountNumber: '',
    companyName: '',
    contactPerson: '',
    address: '',
    email: '',
    phone: '',
    accountOwner: '',
    quoteNumber: '',
    quotationDate,
    totalAmount: '',
    amountCurrency: 'INR',
    totalProductTax: '',
    taxCurrency: 'INR',
    quotationStatus: '',
    validUntilDate: addDaysToInputValue(quotationDate, 30),
    quoteFile: null,
    quoteFileName: '',
  }
}

const ADMIN_QUOTATION_FIELD_DEFINITIONS = [
  { key: 'num', label: 'Quotation Number', exportValue: (row) => row.num },
  { key: 'date', label: 'Quotation Date', exportValue: (row) => row.date },
  { key: 'owner', label: 'Quotation Owner', exportValue: (row) => row.owner },
  { key: 'company', label: 'Company Name', exportValue: (row) => row.company },
  { key: 'project', label: 'Project Name', exportValue: (row) => row.project },
  { key: 'amount', label: 'Amount', exportValue: (row) => row.amountLabel },
  { key: 'status', label: 'Status', exportValue: (row) => row.statusLabel },
]

const ADMIN_QUOTATION_MANAGER_EXPORT_COLUMNS = [
  { key: 'num', label: 'Quotation Number', type: 'text', width: 18 },
  { key: 'date', label: 'Quotation Date', type: 'date', align: 'center', width: 18 },
  { key: 'owner', label: 'Quotation Owner', type: 'text', width: 22 },
  { key: 'company', label: 'Company Name', type: 'text', width: 28 },
  { key: 'project', label: 'Project Name', type: 'text', width: 28 },
  { key: 'amountLabel', label: 'Amount', type: 'text', width: 18 },
  { key: 'statusLabel', label: 'Status', type: 'text', width: 16 },
]

const DEFAULT_SELECTED_ADMIN_QUOTATION_FIELDS = [
  'num', 'owner', 'date', 'amount', 'status', 'company', 'project'
]

const orderQuotationNumberFirst = (fieldKeys = [], activeTab = 'deal') => {
  const cleanKeys = fieldKeys.filter(Boolean)
  const preferredOrder = activeTab === 'account'
    ? ['num', 'owner', 'date', 'company', 'amount', 'status', 'project']
    : ['num', 'owner', 'date', 'amount', 'status', 'company', 'project']
  const orderedKeys = preferredOrder.filter((fieldKey) => cleanKeys.includes(fieldKey))
  cleanKeys.forEach((fieldKey) => {
    if (!orderedKeys.includes(fieldKey)) orderedKeys.push(fieldKey)
  })
  return orderedKeys
}

const readAdminQuotationLayout = () => {
  try {
    const rawValue = window.localStorage.getItem(ADMIN_QUOTATION_LAYOUT_STORAGE_KEY)
    const parsedValue = rawValue ? JSON.parse(rawValue) : null
    const selectedFields = Array.isArray(parsedValue?.selectedFields) && parsedValue.selectedFields.length > 0
      ? parsedValue.selectedFields.filter((fieldKey) => ADMIN_QUOTATION_FIELD_DEFINITIONS.some((field) => field.key === fieldKey))
      : DEFAULT_SELECTED_ADMIN_QUOTATION_FIELDS

    return { selectedFields: orderQuotationNumberFirst(selectedFields) }
  } catch {
    return { selectedFields: DEFAULT_SELECTED_ADMIN_QUOTATION_FIELDS }
  }
}

const sanitizeAdminQuotationLayout = (layoutValue = {}) => {
  const selectedFields = Array.isArray(layoutValue?.selectedFields) && layoutValue.selectedFields.length > 0
    ? layoutValue.selectedFields.filter((fieldKey) => ADMIN_QUOTATION_FIELD_DEFINITIONS.some((field) => field.key === fieldKey))
    : DEFAULT_SELECTED_ADMIN_QUOTATION_FIELDS

  return {
    selectedFields: orderQuotationNumberFirst(selectedFields.length > 0 ? selectedFields : DEFAULT_SELECTED_ADMIN_QUOTATION_FIELDS),
  }
}

const SWATI_PROFILE_FALLBACK = {
  brandKey: 'swati',
  organizationName: 'Swati Switchgears India Pvt Ltd',
  organizationLegalName: 'Swati Switchgears (India) Pvt. Ltd.',
  organizationAddress: '36 Shubhlaxmi Industrial Estate, Sarkhej Bavla Road, Changodar, Ahmedabad - 382210',
  organizationAddressLines: [
    '36 Shubhlaxmi Industrial Estate,',
    'Sarkhej Bavla Road, Changodar,',
    'Ahmedabad - 382210',
  ],
  organizationEmail: 'mkt@swatiswitchgears.com',
  organizationPhone: '9913536307',
  organizationGstin: '24AAACZ0615P1Z7',
  organizationStateCode: '24',
  website: 'www.swatiswitchgears.com',
  organizationTagline: '',
  logoType: 'image',
}

const LUMOS_PROFILE_FALLBACK = {
  brandKey: 'lumos',
  organizationName: 'Lumos Building Automation Pvt Ltd',
  organizationLegalName: 'Lumos Building Automation Pvt. Ltd.',
  organizationAddress: 'Vadodara, Gujarat, India',
  organizationEmail: 'sales@lumosbuildingautomation.com',
  organizationPhone: '+91 265 4000 222',
  organizationGstin: '24AAECL9020K1ZY',
  organizationStateCode: '24',
  website: 'www.lumosbuildingautomation.com',
  organizationTagline: 'Building automation, controls and smart infrastructure solutions.',
  logoType: 'image',
}

const PROFILE_FALLBACKS = {
  swati: SWATI_PROFILE_FALLBACK,
  'swati-switch': SWATI_PROFILE_FALLBACK,
  'swati-switch-gear': SWATI_PROFILE_FALLBACK,
  lumos: LUMOS_PROFILE_FALLBACK,
  'lumos-building': LUMOS_PROFILE_FALLBACK,
}

export const ACTIONS = [
  { key: 'pdf', label: 'View As PDF', icon: FaFilePdf, iconClass: 'aqp-action-icon--pdf' },
  { key: 'preview', label: 'Preview', icon: FaEye },
  { key: 'view', label: 'View Quote', icon: FaEye },
  { key: 'approve', label: 'Approve Quote', icon: FaCheck },
  { key: 'reject', label: 'Reject Quote', icon: FaTimes },
  { key: 'clone', label: 'Clone Quote', icon: FaClone },
  { key: 'account', label: 'View Account', icon: FaUserFriends },
]

export const safeLower = (value) => String(value || '').trim().toLowerCase()

const splitDisplayLines = (value) => String(value || '')
  .split(/\r?\n|,/)
  .map((part) => part.trim())
  .filter(Boolean)

const buildUploadAccountAddress = (account = {}) => (
  [
    account.address,
    account.location,
    account.state,
  ].filter(Boolean).join(', ')
)

const getUploadQuotationFileExtension = (fileName = '') => {
  const segments = String(fileName || '').split('.')
  return segments.length > 1 ? safeLower(segments.pop()) : ''
}

const validateUploadQuotationFile = (file) => {
  if (!file) {
    return 'Quote File is required.'
  }

  const fileExtension = getUploadQuotationFileExtension(file.name)
  if (!ALLOWED_UPLOAD_QUOTATION_EXTENSIONS.includes(fileExtension)) {
    return 'Only PDF, XLS and XLSX files are allowed.'
  }

  if (file.size > MAX_UPLOAD_QUOTATION_FILE_SIZE) {
    return 'Quote File size must be 5 MB or less.'
  }

  return ''
}

const getProfileFallback = (quotation = {}) => {
  const profileKey = safeLower(quotation.profileKey)
  if (profileKey && PROFILE_FALLBACKS[profileKey]) {
    return PROFILE_FALLBACKS[profileKey]
  }

  const profileName = safeLower(quotation.profileName || quotation.organizationName)
  if (profileName.includes('swati')) return SWATI_PROFILE_FALLBACK
  if (profileName.includes('lumos')) return LUMOS_PROFILE_FALLBACK
  return {}
}

const isSwatiProfile = (quotation = {}) => getProfileFallback(quotation).brandKey === 'swati'
const isLumosProfile = (quotation = {}) => getProfileFallback(quotation).brandKey === 'lumos'

const getBrandLogoSource = (brandKey) => {
  if (brandKey === 'lumos') return lumosLogo
  if (brandKey === 'swati') return swatiLogo
  return null
}

const getBrandClassName = (brandKey) => {
  if (brandKey === 'lumos') return 'lumos'
  if (brandKey === 'swati') return 'swati'
  return ''
}

const isImageProfile = (quotation = {}) => {
  const profileFallback = getProfileFallback(quotation)
  if (profileFallback.logoType) return profileFallback.logoType === 'image'

  const profileName = safeLower(quotation.profileName || quotation.organizationName)
  return profileName.includes('swati')
}

export const formatListDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}-${month}-${year}`
}

const formatDocumentDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export const toNumber = (value) => {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const escapeHtml = (value) => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const normalizeStatusKey = (value) => {
  const normalized = safeLower(value).replace(/[\s-]+/g, '_')
  if (!normalized) return 'draft'
  if (normalized === 'accepted') return 'approved'
  if (normalized === 'new') return 'draft'
  return normalized
}

export const formatStatusLabel = (value) => {
  const key = normalizeStatusKey(value)
  const labels = {
    draft: 'Draft',
    sent: 'Sent',
    approved: 'Approved',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
    open: 'Open',
  }

  if (labels[key]) return labels[key]
  return key
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export const getStatusClassName = (value) => {
  const key = normalizeStatusKey(value)
  if (key === 'approved') return 'aqp-status--approved'
  if (key === 'rejected') return 'aqp-status--rejected'
  if (key === 'sent') return 'aqp-status--sent'
  return 'aqp-status--open'
}

export const getActionBadgeClassName = (value) => {
  const key = normalizeStatusKey(value)
  return key === 'approved' || key === 'cancelled' ? 'aqp-num-badge--orange' : 'aqp-num-badge--teal'
}

const getUserIdentityValues = (user = {}) => (
  [
    user?.name,
    user?.username,
    user?.email,
  ]
    .map((value) => safeLower(value))
    .filter(Boolean)
)

const getAllowedQuotationActionKeys = (user, row) => {
  const role = safeLower(user?.role)
  const isAdmin = role === 'admin' || role === 'super_admin'
  if (isAdmin) {
    return ACTIONS.map((action) => action.key)
  }

  const ownerValues = [
    row?.owner,
    row?.raw?.selectedAccountOwner,
    row?.raw?.ownerName,
    row?.raw?.createdBy,
  ].map((value) => safeLower(value))
  const identityValues = getUserIdentityValues(user)
  const isOwner = ownerValues.some((value) => value && identityValues.includes(value))
  const canApprove = Boolean(user?.permissions?.approveQuotes || user?.permissions?.approveQuotation)

  if (role === 'viewer' || (!isOwner && !canApprove)) {
    return ['pdf', 'preview', 'view']
  }

  const actionKeys = ['pdf', 'preview', 'view', 'clone']
  if (canApprove) {
    actionKeys.push('approve', 'reject')
  }

  return actionKeys
}

export const getAllowedQuotationActions = (user, row) => {
  const allowedActionKeys = new Set(getAllowedQuotationActionKeys(user, row))
  return ACTIONS.filter((action) => allowedActionKeys.has(action.key))
}

export const buildVisiblePages = (currentPage, totalPages) => {
  const maxVisible = 5
  const start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
  const end = Math.min(totalPages, start + maxVisible - 1)
  const adjustedStart = Math.max(1, end - maxVisible + 1)

  return Array.from({ length: end - adjustedStart + 1 }, (_, index) => adjustedStart + index)
}

const sectionValue = (value) => value || '-'
const displayValue = (value) => {
  const text = String(value ?? '').trim()
  return text.replace(/^-+\s*/, '')
}

const buildAddress = (...parts) => parts
  .map((part) => String(part || '').trim())
  .filter(Boolean)
  .join(', ')

const buildLineItems = (quotation = {}) => {
  const items = Array.isArray(quotation.lineItems) ? quotation.lineItems : []
  const mappedItems = items
    .filter((item) => String(item?.description || '').trim())
    .map((item, index) => {
      const quantity = toNumber(item.quantity || item.qty || 0)
      const rate = toNumber(item.rate || item.price || item.unitPrice || 0)
      const amount = Number.isFinite(Number(item.amount))
        ? Number(item.amount)
        : quantity * rate

      return {
        id: item.id || `line-${index + 1}`,
        srNo: index + 1,
        description: item.description,
        quantity,
        unit: item.unit || 'Nos',
        rate,
        amount,
      }
    })

  if (mappedItems.length > 0) {
    return mappedItems
  }

  const fallbackDescription = [
    quotation.product,
    quotation.otherProduct,
    quotation.otherService,
    quotation.projectName,
  ].filter(Boolean).join(' / ')

  if (!fallbackDescription && !toNumber(quotation.amount)) {
    return []
  }

  return [{
    id: quotation.id || 'line-1',
    srNo: 1,
    description: fallbackDescription || quotation.companyName || 'Quotation Item',
    quantity: 1,
    unit: 'Nos',
    rate: toNumber(quotation.amount),
    amount: toNumber(quotation.amount),
  }]
}

const numberToWordsBelowThousand = (value) => {
  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

  if (value === 0) return ''
  if (value < 10) return units[value]
  if (value < 20) return teens[value - 10]
  if (value < 100) {
    return `${tens[Math.floor(value / 10)]}${value % 10 ? ` ${units[value % 10]}` : ''}`
  }

  return `${units[Math.floor(value / 100)]} Hundred${value % 100 ? ` ${numberToWordsBelowThousand(value % 100)}` : ''}`
}

const numberToWords = (value) => {
  const amount = Math.floor(Math.abs(toNumber(value)))
  if (!amount) return 'Zero'

  const segments = [
    { divisor: 10000000, label: 'Crore' },
    { divisor: 100000, label: 'Lakh' },
    { divisor: 1000, label: 'Thousand' },
    { divisor: 1, label: '' },
  ]

  let remaining = amount
  const words = []

  segments.forEach(({ divisor, label }) => {
    if (remaining >= divisor) {
      const segmentValue = Math.floor(remaining / divisor)
      remaining %= divisor
      if (segmentValue > 0) {
        words.push(numberToWordsBelowThousand(segmentValue))
        if (label) words.push(label)
      }
    }
  })

  return words.join(' ').trim()
}

export const resolveLinkedAccount = (quotation, accounts) => {
  if (!quotation) return null

  const byId = accounts.find((account) => String(account.id) === String(quotation.selectedAccountId || ''))
  if (byId) return byId

  const accountNumber = safeLower(quotation.clientAccountNumber)
  if (accountNumber) {
    const byAccountNumber = accounts.find((account) => safeLower(account.accountNumber) === accountNumber)
    if (byAccountNumber) return byAccountNumber
  }

  const companyName = safeLower(quotation.companyName)
  if (companyName) {
    const byCompanyName = accounts.find((account) => safeLower(account.name) === companyName)
    if (byCompanyName) return byCompanyName
  }

  return null
}

export const buildQuotationDocumentData = (quotation, linkedAccount) => {
  const profileFallback = getProfileFallback(quotation)
  const resolvedProfileFallback = profileFallback.brandKey ? profileFallback : SWATI_PROFILE_FALLBACK
  const isSwatiDocument = isSwatiProfile(quotation) || !profileFallback.brandKey
  const isLumosDocument = isLumosProfile(quotation)
  const isKnownProfileDocument = Boolean(profileFallback.brandKey)
  const brandKey = resolvedProfileFallback.brandKey || (isSwatiDocument ? 'swati' : isLumosDocument ? 'lumos' : 'swati')
  const logoSource = getBrandLogoSource(brandKey)
  const lineItems = buildLineItems(quotation)
  const subtotal = lineItems.reduce((sum, item) => sum + toNumber(item.amount), 0)
  const cgst = toNumber(quotation.cgstAmount || quotation.cgst || 0)
  const sgst = toNumber(quotation.sgstAmount || quotation.sgst || 0)
  const igst = toNumber(quotation.igstAmount || quotation.igst || 0)
  const otherTax = toNumber(quotation.taxAmount || 0)
  const storedAmount = toNumber(quotation.amount)
  const calculatedTotal = subtotal + cgst + sgst + igst + otherTax
  const total = storedAmount > 0 ? Math.max(storedAmount, calculatedTotal) : calculatedTotal
  const logoType = quotation.logoType || profileFallback.logoType || (isImageProfile(quotation) ? 'image' : 'text')
  const clientAddressDetails = quotation.clientAddressDetails
    || buildAddress(linkedAccount?.address, linkedAccount?.location, linkedAccount?.state)
    || '-'
  const organizationName = isKnownProfileDocument
    ? resolvedProfileFallback.organizationName
    : quotation.organizationName || resolvedProfileFallback.organizationName || quotation.profileName || SWATI_PROFILE_FALLBACK.organizationName
  const organizationLegalName = isKnownProfileDocument
    ? resolvedProfileFallback.organizationLegalName || organizationName
    : quotation.organizationLegalName || resolvedProfileFallback.organizationLegalName || organizationName
  const organizationAddress = isKnownProfileDocument
    ? resolvedProfileFallback.organizationAddress || ''
    : quotation.organizationAddress || resolvedProfileFallback.organizationAddress || SWATI_PROFILE_FALLBACK.organizationAddress
  const organizationAddressLines = resolvedProfileFallback.organizationAddressLines || splitDisplayLines(organizationAddress)
  const organizationEmail = isKnownProfileDocument
    ? resolvedProfileFallback.organizationEmail || ''
    : quotation.organizationEmail || resolvedProfileFallback.organizationEmail || SWATI_PROFILE_FALLBACK.organizationEmail
  const organizationPhone = isKnownProfileDocument
    ? resolvedProfileFallback.organizationPhone || ''
    : quotation.organizationPhone || resolvedProfileFallback.organizationPhone || SWATI_PROFILE_FALLBACK.organizationPhone
  const organizationGstin = isKnownProfileDocument
    ? resolvedProfileFallback.organizationGstin || ''
    : quotation.organizationGstin || resolvedProfileFallback.organizationGstin || SWATI_PROFILE_FALLBACK.organizationGstin
  const organizationStateCode = isKnownProfileDocument
    ? resolvedProfileFallback.organizationStateCode || ''
    : quotation.organizationStateCode || resolvedProfileFallback.organizationStateCode || SWATI_PROFILE_FALLBACK.organizationStateCode

  return {
    id: quotation.id,
    quotationNumber: quotation.quotationNumber || '-',
    quotationDate: formatDocumentDate(quotation.quotationDate || quotation.createdAt),
    validUntil: formatDocumentDate(quotation.validUntil),
    currency: quotation.currency || resolvedProfileFallback.currency || 'INR',
    statusLabel: formatStatusLabel(quotation.status),
    profileName: quotation.profileName || '-',
    brandKey,
    brandClassName: getBrandClassName(brandKey),
    logoSource,
    isSwatiDocument,
    isLumosDocument,
    organizationName,
    organizationLegalName,
    organizationAddress,
    organizationAddressLines,
    organizationEmail,
    organizationPhone,
    organizationGstin,
    organizationStateCode,
    website: isKnownProfileDocument
      ? resolvedProfileFallback.website || ''
      : quotation.website || resolvedProfileFallback.website || SWATI_PROFILE_FALLBACK.website,
    organizationTagline: quotation.organizationTagline || resolvedProfileFallback.organizationTagline || '',
    logoType,
    companyName: quotation.companyName || linkedAccount?.name || '-',
    clientAccountNumber: quotation.clientAccountNumber || linkedAccount?.accountNumber || '-',
    contactPerson: quotation.contactPerson || linkedAccount?.contactPerson || '-',
    telephone: quotation.telephone || linkedAccount?.phone || linkedAccount?.contactPhone || '-',
    email: quotation.email || linkedAccount?.email || linkedAccount?.contactEmail || '-',
    gstin: quotation.gstin || linkedAccount?.gstin || '-',
    stateCode: quotation.stateCode || linkedAccount?.stateCode || '-',
    accountOwner: linkedAccount?.accountOwnerDisplay || quotation.selectedAccountOwner || linkedAccount?.accountOwner || '-',
    customerReferenceNumber: quotation.customerReference?.number || '-',
    customerReferenceDate: formatDocumentDate(quotation.customerReference?.date),
    customerReferenceSubject: quotation.customerReference?.subject || '-',
    quotationSubject: quotation.quotationSubject || '-',
    projectName: quotation.projectName || '-',
    clientAddressDetails,
    clientAddressLines: splitDisplayLines(clientAddressDetails === '-' ? '' : clientAddressDetails),
    product: quotation.product || '-',
    otherProduct: quotation.otherProduct || '-',
    otherService: quotation.otherService || '-',
    deliveryTerms: quotation.deliveryTerms || '-',
    paymentTerms: quotation.paymentTerms || '-',
    warrantyTerms: quotation.warrantyTerms || '-',
    quotationNotes: quotation.quotationNotes || '-',
    rejectionReason: quotation.rejectionReason || '',
    lineItems,
    subtotal,
    cgst,
    sgst,
    igst,
    otherTax,
    total,
    amountInWords: `${numberToWords(total)} ${quotation.currency === 'USD' ? 'US Dollars' : quotation.currency === 'EUR' ? 'Euros' : 'Rupees'} Only`,
  }
}

// Columns for the Line Items table inside the View Quotation export.
const VIEW_QUOTATION_LINE_ITEM_COLUMNS = [
  { key: 'srNo',        label: 'Sr No',       type: 'integer', align: 'center', width: 8 },
  { key: 'description', label: 'Description',                  align: 'left',   width: 48, wrap: true },
  { key: 'quantity',    label: 'Qty',         type: 'number',  align: 'right',  width: 10 },
  { key: 'unit',        label: 'Unit',                         align: 'center', width: 10 },
  { key: 'rate',        label: 'Rate',        type: 'currency',align: 'right',  width: 16 },
  { key: 'amount',      label: 'Amount',      type: 'currency',align: 'right',  width: 18 },
]

// Build the standard export options for the View Quotation modal. The same
// options object is reused for CSV and XLSX so both downloads carry the same
// title, subtitle, metadata block, and line-item table layout.
export const buildQuotationViewExportOptions = (doc) => {
  if (!doc) return null

  const safeValue = (value) => {
    const trimmed = String(value ?? '').trim()
    return trimmed && trimmed !== '-' ? trimmed : ''
  }

  const metadata = [
    { label: 'Quotation No.',  value: safeValue(doc.quotationNumber) },
    { label: 'Quotation Date',    value: safeValue(doc.quotationDate) },
    { label: 'Valid Until',       value: safeValue(doc.validUntil) },
    { label: 'Status',            value: safeValue(doc.statusLabel) },
    { label: 'Currency',          value: safeValue(doc.currency) },
    { label: 'Profile',           value: safeValue(doc.profileName) },
    { label: 'Customer',          value: safeValue(doc.companyName) },
    { label: 'Account No.',    value: safeValue(doc.clientAccountNumber) },
    { label: 'Contact Person',    value: safeValue(doc.contactPerson) },
    { label: 'Telephone',         value: safeValue(doc.telephone) },
    { label: 'Email',             value: safeValue(doc.email) },
    { label: 'GSTIN',             value: safeValue(doc.gstin) },
    { label: 'State Code',        value: safeValue(doc.stateCode) },
    { label: 'Account Owner',     value: safeValue(doc.accountOwner) },
    { label: 'Customer Address',  value: safeValue(doc.clientAddressDetails) },
    { label: 'Project Name',      value: safeValue(doc.projectName) },
    { label: 'Quotation Subject', value: safeValue(doc.quotationSubject) },
    { label: 'Inquiry Ref No',    value: safeValue(doc.customerReferenceNumber) },
    { label: 'Inquiry Ref Date',  value: safeValue(doc.customerReferenceDate) },
    { label: 'Inquiry Subject',   value: safeValue(doc.customerReferenceSubject) },
    { label: 'Delivery Terms',    value: safeValue(doc.deliveryTerms) },
    { label: 'Payment Terms',     value: safeValue(doc.paymentTerms) },
    { label: 'Warranty Terms',    value: safeValue(doc.warrantyTerms) },
    { label: 'Quotation Notes',   value: safeValue(doc.quotationNotes) },
  ].filter((entry) => entry.value)

  if (doc.rejectionReason) {
    metadata.push({ label: 'Rejection Reason', value: doc.rejectionReason })
  }

  // Line items, followed by Subtotal / GST / Total summary rows. The summary
  // rows reuse the Amount column so Excel keeps the currency formatting.
  const lineItemRows = (doc.lineItems || []).map((item) => ({
    srNo: item.srNo,
    description: item.description,
    quantity: item.quantity,
    unit: item.unit,
    rate: item.rate,
    amount: item.amount,
  }))

  const summaryRows = []
  const pushSummary = (label, amount) => {
    if (!Number.isFinite(Number(amount)) || Number(amount) === 0) return
    summaryRows.push({
      srNo: '',
      description: label,
      quantity: '',
      unit: '',
      rate: '',
      amount: Number(amount),
    })
  }

  pushSummary('Subtotal', doc.subtotal)
  pushSummary('CGST', doc.cgst)
  pushSummary('SGST', doc.sgst)
  pushSummary('IGST', doc.igst)
  pushSummary('Other Tax', doc.otherTax)
  pushSummary('Total', doc.total)

  if (doc.amountInWords) {
    summaryRows.push({
      srNo: '',
      description: `Amount in Words: ${doc.amountInWords}`,
      quantity: '',
      unit: '',
      rate: '',
      amount: '',
    })
  }

  const rows = [...lineItemRows, ...summaryRows]

  return {
    title: `Sales Quotation - ${safeValue(doc.quotationNumber) || 'Draft'}`,
    subtitle: safeValue(doc.companyName) || safeValue(doc.organizationName),
    sheetName: 'Quotation',
    companyName: doc.organizationName,
    metadata,
    columns: VIEW_QUOTATION_LINE_ITEM_COLUMNS,
    rows,
  }
}

export const buildPrintableHtml = (doc) => {
  const logoSource = doc.logoSource || getBrandLogoSource(doc.brandKey)
  const brandClassName = doc.brandClassName || getBrandClassName(doc.brandKey)
  const rowsHtml = doc.lineItems.map((item) => `
    <tr>
      <td class="text-center">${item.srNo}</td>
      <td class="description-cell">${escapeHtml(item.description)}</td>
      <td class="text-center">${escapeHtml(item.quantity)}</td>
      <td class="text-center">${escapeHtml(item.unit)}</td>
      <td class="money">${escapeHtml(formatCurrency(item.rate, doc.currency))}</td>
      <td class="money">${escapeHtml(formatCurrency(item.amount, doc.currency))}</td>
    </tr>
  `).join('')

  const companyBlock = logoSource
    ? `<div class="logo-wrap logo-wrap--${escapeHtml(brandClassName || 'default')}"><img src="${logoSource}" alt="${escapeHtml(doc.organizationName)}" class="logo logo--${escapeHtml(brandClassName || 'default')}" /></div>`
    : `<div class="logo-text">${escapeHtml(doc.organizationName)}</div>`

  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>${escapeHtml(doc.quotationNumber)} - Sales Quotation</title>
      <style>
        * { box-sizing: border-box; }
        body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: #1f2933; background: #ffffff; }
        .print-shell { padding: 14px; }
        .print-toolbar {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          width: 100%;
          max-width: 980px;
          margin: 0 auto 14px;
        }
        .print-toolbar button {
          padding: 10px 16px;
          border: 1px solid #1f6ea4;
          border-radius: 8px;
          background: linear-gradient(180deg, #3291d1 0%, #1f6ea4 100%);
          color: #ffffff;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }
        .print-toolbar button:last-child {
          border-color: #c7d6e2;
          background: #ffffff;
          color: #355163;
        }
        .quotation-print {
          width: 100%;
          max-width: 760px;
          margin: 0 auto;
          background: #ffffff;
          border: 1px solid #c9d5df;
        }
        .quotation-header {
          padding: 18px 16px 0;
          background: #ffffff;
        }
        .quotation-main {
          padding: 12px 16px 16px;
        }
        .quotation-footer {
          border-top: 1px solid #d5e0ea;
          padding: 12px 18px;
          text-align: center;
          font-size: 10.5px;
          line-height: 1.5;
          color: #52606d;
          background: #ffffff;
        }
        .brand-head {
          text-align: center;
          padding-bottom: 12px;
        }
        .logo-wrap {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 0;
          width: fit-content;
          max-width: 100%;
          margin: 0 auto 8px;
          padding: 0;
          border: none;
          background: transparent;
          box-shadow: none;
        }
        .logo {
          display: block;
          width: 213px;
          height: 142px;
          max-width: 100%;
          max-height: 152px;
          object-fit: contain;
          object-position: center;
          padding: 0;
          border: none;
          background: transparent;
          box-shadow: none;
          filter: none;
          opacity: 1;
        }
        .logo--swati {
          width: 196px;
          height: 148px;
          max-height: 159px;
        }
        .logo--lumos {
          width: 311px;
          height: 142px;
          max-height: 152px;
          background: transparent;
          border-radius: 0;
          padding: 0;
        }
        .logo-text {
          font-size: 18px;
          font-weight: 800;
          color: #164f7d;
          margin-bottom: 8px;
        }
        .company-name {
          margin: 0;
          font-size: 20px;
          line-height: 1.25;
          font-weight: 800;
          color: #102a43;
        }
        .company-contact {
          margin-top: 7px;
          font-size: 10px;
          line-height: 1.5;
          color: #52606d;
        }
        .party-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 10px;
        }
        .party-card {
          border: 1px solid #a9dfe3;
          border-radius: 10px;
          padding: 10px 12px;
          font-size: 10.5px;
          line-height: 1.42;
          background: #ffffff;
        }
        .section-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #1f6ea4;
          margin-bottom: 8px;
        }
        .field-row {
          display: grid;
          grid-template-columns: 92px minmax(0, 1fr);
          gap: 8px;
          margin-top: 5px;
        }
        .field-row strong {
          color: #243b53;
          font-weight: 700;
        }
        .field-row span {
          min-width: 0;
          overflow-wrap: anywhere;
        }
        h1 {
          margin: 0;
          padding: 12px 14px;
          text-align: center;
          font-size: 19px;
          line-height: 1.15;
          font-weight: 800;
          letter-spacing: 1px;
          border-top: 1px solid #d5e0ea;
          border-bottom: 1px solid #d5e0ea;
          background: #dc2626;
          border-color: #b91c1c;
          color: #ffffff;
        }
        h2, h3, p { margin: 0 0 6px; }
        .meta-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          border: 1px solid #cbd9e3;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 12px;
        }
        .meta-cell {
          padding: 9px 10px;
          border-right: 1px solid #d5e0ea;
          background: #f4f8fb;
        }
        .meta-cell:last-child { border-right: none; }
        .meta-label {
          font-size: 8px;
          font-weight: 700;
          text-transform: uppercase;
          color: #627d98;
          margin-bottom: 6px;
          letter-spacing: 0.04em;
        }
        .meta-value {
          font-size: 10px;
          font-weight: 700;
          color: #102a43;
        }
        table { width: 100%; border-collapse: collapse; }
        .items-table {
          width: 100%;
          max-width: 100%;
          table-layout: fixed;
        }
        thead { display: table-header-group; }
        tr { page-break-inside: avoid; }
        .items-table th,
        .items-table td {
          box-sizing: border-box;
          border: 1px solid #c9d5df;
          padding: 6px 6px;
          font-size: 10px;
          vertical-align: top;
          overflow-wrap: anywhere;
          word-break: break-word;
        }
        .items-table th:nth-child(1),
        .items-table td:nth-child(1) { width: 42px !important; }
        .items-table th:nth-child(2),
        .items-table td:nth-child(2) { width: auto !important; }
        .items-table th:nth-child(3),
        .items-table td:nth-child(3) { width: 50px !important; }
        .items-table th:nth-child(4),
        .items-table td:nth-child(4) { width: 58px !important; }
        .items-table th:nth-child(5),
        .items-table td:nth-child(5) { width: 84px !important; }
        .items-table th:nth-child(6),
        .items-table td:nth-child(6) { width: 92px !important; }
        .items-table th {
          background: #dc2626;
          color: #ffffff;
          font-size: 8.5px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          text-align: center;
        }
        .description-cell {
          overflow-wrap: anywhere;
          line-height: 1.3;
        }
        .text-center { text-align: center; }
        .money {
          text-align: right;
          white-space: nowrap;
        }
        .summary-layout {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          align-items: stretch;
          margin-top: 10px;
        }
        .summary-card,
        .totals-card,
        .terms-card {
          border: 1px solid #a9dfe3;
          border-radius: 10px;
          padding: 10px 12px;
          background: #ffffff;
        }
        .summary-card,
        .totals-card { min-height: 158px; }
        .detail-row,
        .total-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding: 5px 0;
          border-bottom: 1px solid #edf2f7;
          font-size: 10px;
        }
        .detail-row:last-child,
        .total-row:last-child { border-bottom: none; }
        .detail-row strong,
        .total-row strong { color: #243b53; }
        .detail-row span,
        .total-row span {
          text-align: right;
          overflow-wrap: anywhere;
        }
        .totals-table td {
          padding: 7px 8px;
          border-bottom: 1px solid #d9e2ec;
          font-size: 11px;
        }
        .totals-table td:last-child { text-align: right; }
        .totals-table tr:last-child td { border-bottom: none; }
        .grand-total td {
          border-top: 2px solid #1f6ea4;
          font-weight: 700;
          background: #eff6ff;
        }
        .amount-words {
          margin-top: 12px;
          border: 1px solid #cbd9e3;
          border-radius: 4px;
          padding: 9px 10px;
          font-size: 10px;
          line-height: 1.5;
          background: #f4f8fb;
        }
        .amount-words strong {
          display: block;
          margin-bottom: 4px;
          color: #102a43;
        }
        .terms-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin-top: 10px;
        }
        .terms-title {
          margin: 0 0 8px;
          font-size: 9px;
          text-transform: uppercase;
          color: #1f6ea4;
        }
        .terms-value {
          font-size: 10px;
          line-height: 1.5;
          white-space: pre-wrap;
          word-break: break-word;
        }
        @page {
          size: A4;
          margin: 10mm;
        }
        @media print {
          body { background: #ffffff; }
          .print-shell { padding: 0; }
          .print-toolbar { display: none; }
          .quotation-print { max-width: none; border: none; }
          .quotation-header { padding: 0 0 0; }
          .quotation-main { padding: 14px 0 16px; }
          .items-table thead { display: table-header-group; }
          tr, .party-card, .summary-card, .totals-card, .terms-card, .amount-words { page-break-inside: avoid; }
        }
        @media (max-width: 840px) {
          .print-shell { padding: 12px; }
          .party-grid,
          .meta-grid,
          .summary-layout,
          .terms-grid {
            grid-template-columns: 1fr;
          }
          .meta-cell { border-right: none; border-bottom: 1px solid #d5e0ea; }
          .meta-cell:last-child { border-bottom: none; }
        }
      </style>
    </head>
    <body>
      <div class="print-shell">
        <div class="print-toolbar">
          <button type="button" onclick="window.print()">Print / Save PDF</button>
          <button type="button" onclick="window.close()">Close</button>
        </div>
        <div class="quotation-print">
          <div class="quotation-header">
            <div class="brand-head">
              ${companyBlock}
              <h2 class="company-name">${escapeHtml(doc.organizationName)}</h2>
              <div class="company-contact">
                ${escapeHtml(doc.organizationAddress)}<br />
                Email: ${escapeHtml(doc.organizationEmail)} | Phone: ${escapeHtml(doc.organizationPhone)} | GSTIN: ${escapeHtml(doc.organizationGstin)}
              </div>
            </div>
            <div class="party-grid">
              <div class="party-card">
                <div class="section-label">Customer Details</div>
                <div class="field-row"><strong>Customer Name</strong><span>${escapeHtml(displayValue(doc.companyName))}</span></div>
                <div class="field-row"><strong>Client Account No.</strong><span>${escapeHtml(displayValue(doc.clientAccountNumber))}</span></div>
                <div class="field-row"><strong>Contact Person</strong><span>${escapeHtml(displayValue(doc.contactPerson))}</span></div>
                <div class="field-row"><strong>Email</strong><span>${escapeHtml(displayValue(doc.email))}</span></div>
                <div class="field-row"><strong>GSTIN</strong><span>${escapeHtml(displayValue(doc.gstin))}</span></div>
                <div class="field-row"><strong>Address</strong><span>${escapeHtml(displayValue(doc.clientAddressDetails))}</span></div>
              </div>
              <div class="party-card">
                <div class="section-label">Sales Details</div>
                <div class="field-row"><strong>Sales Executive</strong><span>${escapeHtml(doc.accountOwner)}</span></div>
                <div class="field-row"><strong>Mobile Number</strong><span>${escapeHtml(doc.organizationPhone)}</span></div>
                <div class="field-row"><strong>Email Address</strong><span>${escapeHtml(doc.organizationEmail)}</span></div>
                <div class="field-row"><strong>Quotation Reference</strong><span>${escapeHtml(doc.quotationNumber)}</span></div>
              </div>
            </div>
          <h1>SALES QUOTATION</h1>
          </div>
          <div class="quotation-main">
            <div class="meta-grid">
              <div class="meta-cell">
                <div class="meta-label">Quotation No.</div>
                <div class="meta-value">${escapeHtml(doc.quotationNumber)}</div>
              </div>
              <div class="meta-cell">
                <div class="meta-label">Quotation Date</div>
                <div class="meta-value">${escapeHtml(doc.quotationDate)}</div>
              </div>
              <div class="meta-cell">
                <div class="meta-label">Valid Until</div>
                <div class="meta-value">${escapeHtml(doc.validUntil)}</div>
              </div>
              <div class="meta-cell">
                <div class="meta-label">Currency</div>
                <div class="meta-value">${escapeHtml(doc.currency)}</div>
              </div>
            </div>
            <table class="items-table">
              <thead>
                <tr>
                  <th style="width:42px;">Sr.</th>
                  <th>Description</th>
                  <th style="width:50px;">Qty</th>
                  <th style="width:58px;">Unit</th>
                  <th style="width:84px;">Rate</th>
                  <th style="width:92px;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml || '<tr><td colspan="6">No quotation items available.</td></tr>'}
              </tbody>
            </table>

            <div class="summary-layout">
              <div class="summary-card">
                <div class="section-label">Quotation Details</div>
                <div class="detail-row"><strong>Profile Name</strong><span>${escapeHtml(displayValue(doc.profileName))}</span></div>
                <div class="detail-row"><strong>Project</strong><span>${escapeHtml(displayValue(doc.projectName))}</span></div>
                <div class="detail-row"><strong>Account Owner</strong><span>${escapeHtml(displayValue(doc.accountOwner))}</span></div>
                <div class="detail-row"><strong>Subject</strong><span>${escapeHtml(displayValue(doc.quotationSubject))}</span></div>
                <div class="detail-row"><strong>Product</strong><span>${escapeHtml([doc.product, doc.otherProduct].filter((value) => value && value !== '-').join(' / '))}</span></div>
                <div class="detail-row"><strong>Service</strong><span>${escapeHtml(displayValue(doc.otherService))}</span></div>
              </div>
              <div class="totals-card">
                <div class="section-label">Amount Summary</div>
                <div class="total-row"><strong>Sub Total</strong><span>${escapeHtml(formatCurrency(doc.subtotal, doc.currency))}</span></div>
                <div class="total-row"><strong>CGST</strong><span>${escapeHtml(formatCurrency(doc.cgst, doc.currency))}</span></div>
                <div class="total-row"><strong>SGST</strong><span>${escapeHtml(formatCurrency(doc.sgst, doc.currency))}</span></div>
                <div class="total-row"><strong>IGST</strong><span>${escapeHtml(formatCurrency(doc.igst, doc.currency))}</span></div>
                <div class="total-row"><strong>Other Tax</strong><span>${escapeHtml(formatCurrency(doc.otherTax, doc.currency))}</span></div>
                <div class="total-row grand-total"><strong>Total Amount</strong><span>${escapeHtml(formatCurrency(doc.total, doc.currency))}</span></div>
              </div>
            </div>

            <div class="amount-words"><strong>Amount in Words</strong>${escapeHtml(doc.amountInWords)}</div>

            <div class="terms-grid">
              <div class="terms-card">
                <h3 class="terms-title">Inquiry Reference</h3>
                <div class="terms-value">Number: ${escapeHtml(displayValue(doc.customerReferenceNumber))}&#10;Date: ${escapeHtml(displayValue(doc.customerReferenceDate))}&#10;Subject: ${escapeHtml(displayValue(doc.customerReferenceSubject))}</div>
              </div>
              <div class="terms-card">
                <h3 class="terms-title">Terms &amp; Conditions</h3>
                <div class="terms-value">Delivery: ${escapeHtml(displayValue(doc.deliveryTerms))}&#10;Payment: ${escapeHtml(displayValue(doc.paymentTerms))}&#10;Warranty: ${escapeHtml(displayValue(doc.warrantyTerms))}</div>
              </div>
              <div class="terms-card">
                <h3 class="terms-title">Quotation Notes</h3>
                <div class="terms-value">${escapeHtml(displayValue(doc.quotationNotes))}</div>
              </div>
              <div class="terms-card">
                <h3 class="terms-title">Status</h3>
                <div class="terms-value">Status: ${escapeHtml(doc.statusLabel)}${doc.rejectionReason ? `&#10;Reason: ${escapeHtml(doc.rejectionReason)}` : ''}</div>
              </div>
            </div>
          </div>
          <div class="quotation-footer">
            <strong>${escapeHtml(doc.organizationName)}</strong><br />
            Website: ${escapeHtml(doc.website || SWATI_PROFILE_FALLBACK.website)} | Email: ${escapeHtml(doc.organizationEmail)} | Phone: ${escapeHtml(doc.organizationPhone)}
          </div>
        </div>
      </div>
    </body>
  </html>`
}

export const triggerBrowserPdfSave = (documentData) => {
  if (!documentData) return

  const previousTitle = document.title
  const nextTitle = `Quotation-${documentData?.quotationNumber || 'Document'}.pdf`
  const printFrame = document.createElement('iframe')
  let cleanupTimerId = null

  printFrame.title = nextTitle
  printFrame.setAttribute('aria-hidden', 'true')
  printFrame.style.position = 'fixed'
  printFrame.style.left = '-10000px'
  printFrame.style.top = '0'
  printFrame.style.width = '1024px'
  printFrame.style.height = '768px'
  printFrame.style.border = '0'
  printFrame.style.opacity = '0'

  const cleanupPrintFrame = () => {
    if (cleanupTimerId) {
      window.clearTimeout(cleanupTimerId)
    }
    document.title = previousTitle
    window.removeEventListener('afterprint', cleanupPrintFrame)
    if (printFrame.parentNode) {
      printFrame.parentNode.removeChild(printFrame)
    }
  }

  const waitForFrameImages = () => {
    const frameDocument = printFrame.contentDocument
    if (!frameDocument) return Promise.resolve()

    const images = Array.from(frameDocument.images || [])
    return Promise.all(images.map((image) => {
      if (image.complete) return Promise.resolve()
      return new Promise((resolve) => {
        image.onload = resolve
        image.onerror = resolve
      })
    }))
  }

  printFrame.onload = () => {
    waitForFrameImages().then(() => {
      const frameWindow = printFrame.contentWindow
      if (!frameWindow) {
        cleanupPrintFrame()
        return
      }

      document.title = nextTitle
      window.addEventListener('afterprint', cleanupPrintFrame)
      cleanupTimerId = window.setTimeout(cleanupPrintFrame, 2500)
      frameWindow.focus()
      frameWindow.print()
    })
  }

  document.title = nextTitle
  document.body.appendChild(printFrame)
  printFrame.srcdoc = buildPrintableHtml(documentData)
}

export function StatusBadge({ status }) {
  return (
    <span className={`aqp-status ${getStatusClassName(status)}`}>
      {formatStatusLabel(status)}
    </span>
  )
}

export function ModalShell({ title, onClose, size = '', children, footer }) {
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  return (
    <div className="aqp-overlay" role="presentation" onClick={onClose}>
      <div className={`aqp-modal ${size}`.trim()} role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="aqp-modal-header">
          <span className="aqp-modal-title">{title}</span>
          <button type="button" className="aqp-modal-close" onClick={onClose} aria-label="Close">
            <FaTimes />
          </button>
        </div>
        <div className="aqp-modal-body">{children}</div>
        {footer ? <div className="aqp-modal-footer">{footer}</div> : null}
      </div>
    </div>
  )
}

const EditableQuotationValue = ({
  value,
  fieldKey,
  editable = false,
  multiline = false,
  className = '',
  onCommit,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [draftValue, setDraftValue] = useState(value || '')

  useEffect(() => {
    if (!isEditing) {
      setDraftValue(value || '')
    }
  }, [isEditing, value])

  const commitValue = () => {
    const nextValue = String(draftValue || '').trim()
    setIsEditing(false)
    if (nextValue !== String(value || '').trim()) {
      onCommit?.(fieldKey, nextValue)
    }
  }

  if (!editable || !fieldKey) {
    return <span className={className}>{value}</span>
  }

  if (isEditing) {
    return multiline ? (
      <textarea
        className="aqp-doc-edit-input aqp-doc-edit-input--textarea"
        value={draftValue}
        onChange={(event) => setDraftValue(event.target.value)}
        onBlur={commitValue}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setIsEditing(false)
          if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') commitValue()
        }}
        autoFocus
      />
    ) : (
      <input
        className="aqp-doc-edit-input"
        value={draftValue}
        onChange={(event) => setDraftValue(event.target.value)}
        onBlur={commitValue}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setIsEditing(false)
          if (event.key === 'Enter') commitValue()
        }}
        autoFocus
      />
    )
  }

  return (
    <span className={`aqp-doc-editable ${className}`.trim()}>
      <span className="aqp-doc-editable-value">{value}</span>
      <button
        type="button"
        className="aqp-doc-edit-btn"
        onClick={() => {
          setDraftValue(value || '')
          setIsEditing(true)
        }}
        aria-label="Edit quotation field"
      >
        <FaEdit />
      </button>
    </span>
  )
}

const renderEditableQuotationValue = (documentData, editable, onEditField) => (
  fieldKey,
  value,
  options = {}
) => (
  <EditableQuotationValue
    fieldKey={fieldKey}
    value={value}
    editable={editable}
    multiline={options.multiline}
    className={options.className}
    onCommit={onEditField}
  />
)

export function QuotationDocument({ documentData, editable = false, onEditField }) {
  const logoSource = documentData.logoSource || getBrandLogoSource(documentData.brandKey)
  const brandModifier = documentData.isLumosDocument ? 'lumos' : documentData.isSwatiDocument ? 'swati' : 'default'
  const productLabel = [documentData.product, documentData.otherProduct]
    .filter((value) => value && value !== '-')
    .join(' / ')
  const editValue = renderEditableQuotationValue(documentData, editable, onEditField)

  return (
    <div className="aqp-doc aqp-print-scope">
      <div className="aqp-doc__frame">
        <div className="aqp-doc__brand-head">
          <div className={`aqp-doc__logo-wrap aqp-doc__logo-wrap--${brandModifier}`}>
            {logoSource ? (
              <img src={logoSource} alt={documentData.organizationName} className={`aqp-doc__brand-logo aqp-doc__brand-logo--${brandModifier}`} />
            ) : (
              <div className="aqp-doc__text-logo">{documentData.organizationName}</div>
            )}
          </div>
          <h2>{documentData.organizationName}</h2>
          <p>
            {documentData.organizationAddress}
            <br />
            Email: {documentData.organizationEmail} | Phone: {documentData.organizationPhone} | GSTIN: {documentData.organizationGstin}
          </p>
        </div>

        <div className="aqp-doc__party-grid">
          <section className="aqp-doc__party-card">
            <div className="aqp-doc__eyebrow">Customer Details</div>
            <div className="aqp-doc__field-row"><strong>Customer Name</strong>{editValue('companyName', displayValue(documentData.companyName))}</div>
            <div className="aqp-doc__field-row"><strong>Client Account No.</strong>{editValue('clientAccountNumber', displayValue(documentData.clientAccountNumber))}</div>
            <div className="aqp-doc__field-row"><strong>Contact Person</strong>{editValue('contactPerson', displayValue(documentData.contactPerson))}</div>
            <div className="aqp-doc__field-row"><strong>Email</strong>{editValue('email', displayValue(documentData.email))}</div>
            <div className="aqp-doc__field-row"><strong>GSTIN</strong>{editValue('gstin', displayValue(documentData.gstin))}</div>
            <div className="aqp-doc__field-row"><strong>Address</strong>{editValue('clientAddressDetails', displayValue(documentData.clientAddressDetails), { multiline: true })}</div>
          </section>
          <section className="aqp-doc__party-card">
            <div className="aqp-doc__eyebrow">Sales Details</div>
            <div className="aqp-doc__field-row"><strong>Sales Executive</strong>{editValue('selectedAccountOwner', documentData.accountOwner)}</div>
            <div className="aqp-doc__field-row"><strong>Mobile Number</strong>{editValue('organizationPhone', documentData.organizationPhone)}</div>
            <div className="aqp-doc__field-row"><strong>Email Address</strong>{editValue('organizationEmail', documentData.organizationEmail)}</div>
            <div className="aqp-doc__field-row"><strong>Quotation Reference</strong>{editValue('quotationNumber', documentData.quotationNumber)}</div>
          </section>
        </div>

        <div className="aqp-doc__title">SALES QUOTATION</div>

        <div className="aqp-doc__meta">
          <div className="aqp-doc__meta-cell">
            <span className="aqp-doc__meta-label">Quotation No.</span>
            <strong>{editValue('quotationNumber', documentData.quotationNumber)}</strong>
          </div>
          <div className="aqp-doc__meta-cell">
            <span className="aqp-doc__meta-label">Quotation Date</span>
            <strong>{editValue('quotationDate', documentData.quotationDate)}</strong>
          </div>
          <div className="aqp-doc__meta-cell">
            <span className="aqp-doc__meta-label">Valid Until</span>
            <strong>{editValue('validUntil', documentData.validUntil)}</strong>
          </div>
          <div className="aqp-doc__meta-cell">
            <span className="aqp-doc__meta-label">Currency</span>
            <strong>{editValue('currency', documentData.currency)}</strong>
          </div>
        </div>

        <table className="aqp-doc__table">
          <thead>
            <tr>
              <th style={{ width: '42px' }}>Sr.</th>
              <th>Description</th>
              <th style={{ width: '50px' }}>Qty</th>
              <th style={{ width: '58px' }}>Unit</th>
              <th style={{ width: '84px' }}>Rate</th>
              <th style={{ width: '92px' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {documentData.lineItems.length === 0 ? (
              <tr>
                <td colSpan={6}>No quotation items available.</td>
              </tr>
            ) : documentData.lineItems.map((item) => (
              <tr key={item.id}>
                <td className="aqp-doc__num">{item.srNo}</td>
                <td className="aqp-doc__description">{editValue(`lineItems.${item.srNo - 1}.description`, item.description, { multiline: true })}</td>
                <td className="aqp-doc__num">{editValue(`lineItems.${item.srNo - 1}.quantity`, item.quantity)}</td>
                <td className="aqp-doc__num">{editValue(`lineItems.${item.srNo - 1}.unit`, item.unit)}</td>
                <td className="aqp-doc__amount">{editValue(`lineItems.${item.srNo - 1}.rate`, formatCurrency(item.rate, documentData.currency))}</td>
                <td className="aqp-doc__amount">{formatCurrency(item.amount, documentData.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="aqp-doc__summary">
          <div className="aqp-doc__summary-card">
            <div className="aqp-doc__eyebrow">Quotation Details</div>
            <div className="aqp-doc__kv-row"><strong>Profile Name</strong>{editValue('profileName', displayValue(documentData.profileName))}</div>
            <div className="aqp-doc__kv-row"><strong>Project</strong>{editValue('projectName', displayValue(documentData.projectName))}</div>
            <div className="aqp-doc__kv-row"><strong>Account Owner</strong>{editValue('selectedAccountOwner', displayValue(documentData.accountOwner))}</div>
            <div className="aqp-doc__kv-row"><strong>Subject</strong>{editValue('quotationSubject', displayValue(documentData.quotationSubject))}</div>
            <div className="aqp-doc__kv-row"><strong>Product</strong>{editValue('product', productLabel)}</div>
            <div className="aqp-doc__kv-row"><strong>Service</strong>{editValue('otherService', displayValue(documentData.otherService))}</div>
          </div>
          <div className="aqp-doc__totals">
            <div className="aqp-doc__eyebrow">Amount Summary</div>
            <div className="aqp-doc__kv-row"><strong>Sub Total</strong><span>{formatCurrency(documentData.subtotal, documentData.currency)}</span></div>
            <div className="aqp-doc__kv-row"><strong>CGST</strong><span>{formatCurrency(documentData.cgst, documentData.currency)}</span></div>
            <div className="aqp-doc__kv-row"><strong>SGST</strong><span>{formatCurrency(documentData.sgst, documentData.currency)}</span></div>
            <div className="aqp-doc__kv-row"><strong>IGST</strong><span>{formatCurrency(documentData.igst, documentData.currency)}</span></div>
            <div className="aqp-doc__kv-row"><strong>Other Tax</strong><span>{formatCurrency(documentData.otherTax, documentData.currency)}</span></div>
            <div className="aqp-doc__kv-row aqp-doc__grand-total"><strong>Total Amount</strong><span>{formatCurrency(documentData.total, documentData.currency)}</span></div>
          </div>
        </div>

        <div className="aqp-doc__amount-words">
          <strong>Amount in Words</strong>
          <span>{documentData.amountInWords}</span>
        </div>

        <div className="aqp-doc__terms">
          <section className="aqp-doc__terms-card">
            <h4>Inquiry Reference</h4>
            <p><strong>Number:</strong> {editValue('customerReference.number', displayValue(documentData.customerReferenceNumber))}</p>
            <p><strong>Date:</strong> {editValue('customerReference.date', displayValue(documentData.customerReferenceDate))}</p>
            <p><strong>Subject:</strong> {editValue('customerReference.subject', displayValue(documentData.customerReferenceSubject))}</p>
          </section>
          <section className="aqp-doc__terms-card">
            <h4>Terms &amp; Conditions</h4>
            <p><strong>Delivery:</strong> {editValue('deliveryTerms', displayValue(documentData.deliveryTerms))}</p>
            <p><strong>Payment:</strong> {editValue('paymentTerms', displayValue(documentData.paymentTerms))}</p>
            <p><strong>Warranty:</strong> {editValue('warrantyTerms', displayValue(documentData.warrantyTerms))}</p>
          </section>
          <section className="aqp-doc__terms-card">
            <h4>Quotation Notes</h4>
            <p>{editValue('quotationNotes', displayValue(documentData.quotationNotes), { multiline: true })}</p>
          </section>
          <section className="aqp-doc__terms-card">
            <h4>Status</h4>
            <p><strong>Status:</strong> {documentData.statusLabel}</p>
            {documentData.rejectionReason ? <p><strong>Reason:</strong> {documentData.rejectionReason}</p> : null}
          </section>
        </div>

        <div className="aqp-doc__footer">
          <strong>{documentData.organizationName}</strong>
          <br />
          Website: {documentData.website || SWATI_PROFILE_FALLBACK.website} | Email: {documentData.organizationEmail} | Phone: {documentData.organizationPhone}
        </div>
      </div>
    </div>
  )
}

export function QuotationPdfViewer({
  documentData,
  title,
  subtitle,
  onBack,
  onPrint,
  onDownload,
}) {
  const [zoomLevel, setZoomLevel] = useState(100)
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)

  useEffect(() => {
    setZoomLevel(100)
  }, [documentData])

  useEffect(() => {
    if (!moreMenuOpen) return undefined

    const handleClose = () => setMoreMenuOpen(false)
    window.addEventListener('click', handleClose)
    return () => window.removeEventListener('click', handleClose)
  }, [moreMenuOpen])

  const resolvedTitle = title || `QUOTATION - ${documentData?.quotationNumber || '-'}`
  const resolvedSubtitle = subtitle || documentData?.companyName || '-'

  return (
    <div className="aqp-page aqp-page--pdf">
      <div className="aqp-pdf-toolbar">
        <div className="aqp-pdf-toolbar-copy">
          <h1>{resolvedTitle}</h1>
          <p>{resolvedSubtitle}</p>
        </div>
        <div className="aqp-pdf-toolbar-actions">
          <button type="button" className="aqp-btn aqp-btn--gray" onClick={onBack}>
            Back
          </button>
          <button type="button" className="aqp-pdf-close-btn" onClick={onBack} aria-label="Close quotation PDF">
            <FaTimes />
          </button>
          <div className="aqp-pdf-toolbar-status">
            <span>PDF View</span>
          </div>
          <div className="aqp-pdf-toolbar-zoom">
            <button type="button" className="aqp-pdf-icon-btn" onClick={() => setZoomLevel((currentValue) => Math.max(70, currentValue - 10))} aria-label="Zoom out">
              <FaSearchMinus />
            </button>
            <span className="aqp-pdf-zoom-value">{zoomLevel}%</span>
            <button type="button" className="aqp-pdf-icon-btn" onClick={() => setZoomLevel((currentValue) => Math.min(160, currentValue + 10))} aria-label="Zoom in">
              <FaSearchPlus />
            </button>
          </div>
          <button type="button" className="aqp-pdf-action-btn" onClick={onPrint} aria-label="Print quotation">
            <FaPrint />
            Print
          </button>
          <button
            type="button"
            className="aqp-pdf-action-btn"
            onClick={() => {
              if (typeof onDownload === 'function') {
                onDownload()
                return
              }
              triggerBrowserPdfSave(documentData)
            }}
            aria-label="Download quotation PDF"
          >
            <FaDownload />
            Download PDF
          </button>
          <div className="aqp-pdf-more">
            <button
              type="button"
              className={`aqp-pdf-icon-btn${moreMenuOpen ? ' aqp-pdf-icon-btn--active' : ''}`}
              aria-label="More options"
              onClick={(event) => {
                event.stopPropagation()
                setMoreMenuOpen((currentValue) => !currentValue)
              }}
              aria-expanded={moreMenuOpen}
              aria-haspopup="menu"
            >
              <FaEllipsisV />
            </button>
            {moreMenuOpen ? (
              <div className="aqp-action-menu aqp-action-menu--viewer" onClick={(event) => event.stopPropagation()}>
                <button type="button" className="aqp-action-item" onClick={() => { setZoomLevel(100); setMoreMenuOpen(false) }}>
                  Reset Zoom
                </button>
                <button type="button" className="aqp-action-item" onClick={() => { setZoomLevel(90); setMoreMenuOpen(false) }}>
                  Fit Document
                </button>
                <button type="button" className="aqp-action-item" onClick={() => { onPrint(); setMoreMenuOpen(false) }}>
                  Print / Save PDF
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <div className="aqp-pdf-workspace">
        <div className="aqp-pdf-stage">
          <div className="aqp-pdf-canvas">
            <div className="aqp-pdf-zoom-surface" style={{ zoom: zoomLevel / 100 }}>
              <QuotationDocument documentData={documentData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const AdminQuotationsPage = ({ allowUsers = false, generatorPath = '/admin/quotations' }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    quotations,
    quotationsLoading,
    quotationsError,
    accounts,
    createQuotation,
    updateQuotation,
    addNotification,
  } = useData()

  // Access control: admins by default; user portal can opt in with safe routes.
  const isAuthorized = allowUsers || (user && (user.role === 'admin' || user.role === 'super_admin'))

  useEffect(() => {
    if (!isAuthorized) {
      navigate('/unauthorized', { replace: true })
    }
  }, [isAuthorized, navigate])

  const [activeTab, setActiveTab] = useState('account')
  const [showFilterRow] = useState(false)
  const [isFieldPanelOpen, setIsFieldPanelOpen] = useState(false)
  const [quotationLayout, setQuotationLayout] = useState(readAdminQuotationLayout)
  const [fieldPanelDraft, setFieldPanelDraft] = useState(readAdminQuotationLayout)
  const [savedLayoutViewId, setSavedLayoutViewId] = useState('')
  const [draggedFieldKey, setDraggedFieldKey] = useState('')
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [page, setPage] = useState(1)
  const [isUploadQuotationOpen, setIsUploadQuotationOpen] = useState(false)
  const [isAccountListOpen, setIsAccountListOpen] = useState(false)
  const [uploadQuotationForm, setUploadQuotationForm] = useState(createInitialUploadQuotationForm)
  const [uploadQuotationErrors, setUploadQuotationErrors] = useState({})
  const [uploadQuotationMessage, setUploadQuotationMessage] = useState('')
  const [uploadQuotationSaving, setUploadQuotationSaving] = useState(false)
  const [accountFilters, setAccountFilters] = useState(INITIAL_ACCOUNT_FILTERS)
  const [accountListPage, setAccountListPage] = useState(1)
  const [previewRow, setPreviewRow] = useState(null)
  const [pdfRow, setPdfRow] = useState(null)
  const [viewRow, setViewRow] = useState(null)
  const [viewRowFromUrl, setViewRowFromUrl] = useState(false)
  const [accountRow, setAccountRow] = useState(null)
  const [approveRow, setApproveRow] = useState(null)
  const [rejectRow, setRejectRow] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectError, setRejectError] = useState('')
  const [actionLoadingId, setActionLoadingId] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()
  const viewQuotationId = searchParams.get('view') || ''

  const selectedFieldDefinitions = useMemo(() => (
    orderQuotationNumberFirst(quotationLayout.selectedFields, activeTab)
      .map((fieldKey) => ADMIN_QUOTATION_FIELD_DEFINITIONS.find((field) => field.key === fieldKey))
      .filter(Boolean)
  ), [quotationLayout.selectedFields, activeTab])

  const availableFieldDefinitions = useMemo(() => (
    ADMIN_QUOTATION_FIELD_DEFINITIONS.filter((field) => !fieldPanelDraft.selectedFields.includes(field.key))
  ), [fieldPanelDraft.selectedFields])

  const normalizedAccounts = useMemo(
    () => accounts
      .map((account, index) => normalizeAccountRecord(account, index, { recordSource: 'admin-quotation-view' }))
      .sort(compareAccountsByNumberAsc),
    [accounts]
  )

  const selectedUploadAccount = useMemo(
    () => normalizedAccounts.find((account) => String(account.id) === String(uploadQuotationForm.selectedAccountId || '')) || null,
    [normalizedAccounts, uploadQuotationForm.selectedAccountId]
  )

  const filteredAccounts = useMemo(() => (
    normalizedAccounts.filter((account) => (
      Object.entries(accountFilters).every(([key, value]) => {
        const query = safeLower(value)
        if (!query) return true
        const resolvedValue = key === 'accountOwner'
          ? (account.accountOwnerDisplay || account.accountOwner || '')
          : account[key]
        return safeLower(resolvedValue).includes(query)
      })
    ))
  ), [accountFilters, normalizedAccounts])

  const totalAccountPages = useMemo(
    () => Math.max(1, Math.ceil(filteredAccounts.length / ACCOUNT_LIST_PAGE_SIZE)),
    [filteredAccounts.length]
  )

  const visibleAccountPages = useMemo(
    () => buildVisiblePages(accountListPage, totalAccountPages),
    [accountListPage, totalAccountPages]
  )

  const paginatedAccounts = useMemo(() => {
    const start = (accountListPage - 1) * ACCOUNT_LIST_PAGE_SIZE
    return filteredAccounts.slice(start, start + ACCOUNT_LIST_PAGE_SIZE)
  }, [accountListPage, filteredAccounts])

  const rows = useMemo(() => {
    return quotations
      .map((quotation, index) => {
        const linkedAccount = resolveLinkedAccount(quotation, normalizedAccounts)
        const amountNumber = toNumber(quotation.amount)
          || buildLineItems(quotation).reduce((sum, item) => sum + toNumber(item.amount), 0)

        return {
          id: quotation.id || `quotation-${index}`,
          num: quotation.quotationNumber || `Quotation ${index + 1}`,
          owner: linkedAccount?.accountOwnerDisplay || quotation.selectedAccountOwner || linkedAccount?.accountOwner || '-',
          date: formatListDate(quotation.quotationDate || quotation.createdAt),
          dateSort: quotation.quotationDate || quotation.createdAt || '',
          company: quotation.companyName || linkedAccount?.name || quotation.clientName || '-',
          amount: amountNumber,
          amountLabel: formatCurrency(amountNumber, quotation.currency || 'INR'),
          status: quotation.status || 'draft',
          statusLabel: formatStatusLabel(quotation.status),
          project: quotation.projectName || quotation.product || quotation.otherProduct || quotation.otherService || '-',
          profileName: quotation.profileName || '-',
          linkedAccount,
          raw: quotation,
        }
      })
      .sort((left, right) => new Date(right.dateSort || 0).getTime() - new Date(left.dateSort || 0).getTime())
  }, [normalizedAccounts, quotations])

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (activeTab !== 'account' && activeTab !== 'deal') {
        return false
      }

      return Object.entries(filters).every(([key, value]) => {
        const query = safeLower(value)
        if (!query) return true
        const rowValue = key === 'amount'
          ? `${row.amount} ${row.amountLabel}`
          : key === 'status'
            ? row.statusLabel
            : row[key]
        return safeLower(rowValue).includes(query)
      })
    })
  }, [activeTab, filters, rows])

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE)), [filteredRows.length])
  const visiblePages = useMemo(() => buildVisiblePages(page, totalPages), [page, totalPages])

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredRows.slice(start, start + PAGE_SIZE)
  }, [filteredRows, page])

  useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, totalPages))
  }, [totalPages])

  useEffect(() => {
    setAccountListPage((currentPage) => Math.min(currentPage, totalAccountPages))
  }, [totalAccountPages])

  useEffect(() => {
    let isActive = true

    const loadPersistedLayout = async () => {
      try {
        const views = await customViewApi.listCustomViews(ADMIN_QUOTATION_LAYOUT_VIEW_ENTITY_TYPE)
        if (!isActive) return

        const savedView = views.find((view) => view.name === ADMIN_QUOTATION_LAYOUT_VIEW_NAME) || null
        if (!savedView) return

        const nextLayout = sanitizeAdminQuotationLayout({
          selectedFields: savedView.columns,
        })

        setSavedLayoutViewId(String(savedView.id || ''))
        setQuotationLayout(nextLayout)
        setFieldPanelDraft(nextLayout)
        window.localStorage.setItem(ADMIN_QUOTATION_LAYOUT_STORAGE_KEY, JSON.stringify(nextLayout))
      } catch (_error) {
        // Keep local-storage fallback if the custom-view request is unavailable.
      }
    }

    loadPersistedLayout()
    return () => {
      isActive = false
    }
  }, [])

  const updateViewSearchParam = (quotationId) => {
    const nextParams = new URLSearchParams(searchParams)
    if (quotationId) {
      nextParams.set('view', quotationId)
    } else {
      nextParams.delete('view')
    }
    setSearchParams(nextParams, { replace: true })
  }

  const openUploadQuotationModal = () => {
    setUploadQuotationForm(createInitialUploadQuotationForm())
    setUploadQuotationErrors({})
    setUploadQuotationMessage('')
    setAccountFilters(INITIAL_ACCOUNT_FILTERS)
    setAccountListPage(1)
    setIsAccountListOpen(false)
    setIsUploadQuotationOpen(true)
  }

  const closeUploadQuotationModal = () => {
    if (uploadQuotationSaving) return

    setIsUploadQuotationOpen(false)
    setIsAccountListOpen(false)
    setUploadQuotationErrors({})
    setUploadQuotationMessage('')
  }

  const handleUploadQuotationFieldChange = (field, value) => {
    setUploadQuotationForm((currentValue) => ({
      ...currentValue,
      [field]: value,
    }))
    setUploadQuotationMessage('')
    setUploadQuotationErrors((currentValue) => {
      if (!currentValue[field]) return currentValue
      return { ...currentValue, [field]: '' }
    })
  }

  const handleOpenAccountList = () => {
    setUploadQuotationMessage('')
    setAccountFilters(INITIAL_ACCOUNT_FILTERS)
    setAccountListPage(1)
    setIsAccountListOpen(true)
  }

  const handleAccountFilterChange = (key, value) => {
    setAccountFilters((currentValue) => ({
      ...currentValue,
      [key]: value,
    }))
    setAccountListPage(1)
  }

  const handleUploadAccountSelect = (account) => {
    setUploadQuotationForm((currentValue) => ({
      ...currentValue,
      selectedAccountId: account.id || '',
      selectedAccountLabel: [account.accountNumber, account.name].filter(Boolean).join(' - '),
      clientAccountNumber: account.accountNumber || '',
      companyName: account.name || '',
      contactPerson: account.contactPerson || '',
      address: buildUploadAccountAddress(account),
      email: account.contactEmail || account.email || '',
      phone: account.contactMobile || account.contactPhone || account.phone || '',
      accountOwner: account.accountOwnerName || account.accountOwner || '',
    }))
    setUploadQuotationErrors((currentValue) => ({
      ...currentValue,
      selectedAccountId: '',
    }))
    setUploadQuotationMessage('')
    setIsAccountListOpen(false)
  }

  const handleUploadQuotationFileChange = (event) => {
    const file = event.target.files?.[0] || null
    const nextError = validateUploadQuotationFile(file)

    if (nextError) {
      setUploadQuotationForm((currentValue) => ({
        ...currentValue,
        quoteFile: null,
        quoteFileName: '',
      }))
      setUploadQuotationErrors((currentValue) => ({
        ...currentValue,
        quoteFile: nextError,
      }))
      event.target.value = ''
      return
    }

    setUploadQuotationForm((currentValue) => ({
      ...currentValue,
      quoteFile: file,
      quoteFileName: file?.name || '',
    }))
    setUploadQuotationErrors((currentValue) => ({
      ...currentValue,
      quoteFile: '',
    }))
    setUploadQuotationMessage('')
  }

  const handleUploadQuotationSave = async (event) => {
    event.preventDefault()
    if (uploadQuotationSaving) return

    const nextErrors = {}
    if (!uploadQuotationForm.selectedAccountId) nextErrors.selectedAccountId = 'Please select an account from Account List.'
    if (!uploadQuotationForm.quoteNumber.trim()) nextErrors.quoteNumber = 'Quote Number is required.'
    if (!uploadQuotationForm.quotationDate) nextErrors.quotationDate = 'Quotation Date is required.'
    if (!String(uploadQuotationForm.totalAmount).trim()) nextErrors.totalAmount = 'Total Amount is required.'
    if (!uploadQuotationForm.quotationStatus) nextErrors.quotationStatus = 'Quotation Status is required.'

    const fileError = validateUploadQuotationFile(uploadQuotationForm.quoteFile)
    if (fileError) nextErrors.quoteFile = fileError

    setUploadQuotationErrors(nextErrors)
    setUploadQuotationMessage('')
    if (Object.keys(nextErrors).length > 0) return

    const payload = {
      quotationNumber: uploadQuotationForm.quoteNumber.trim(),
      quotationDate: uploadQuotationForm.quotationDate,
      validUntil: uploadQuotationForm.validUntilDate || uploadQuotationForm.quotationDate,
      amount: Number.parseFloat(uploadQuotationForm.totalAmount) || 0,
      totalAmount: Number.parseFloat(uploadQuotationForm.totalAmount) || 0,
      taxAmount: Number.parseFloat(uploadQuotationForm.totalProductTax) || 0,
      productTax: Number.parseFloat(uploadQuotationForm.totalProductTax) || 0,
      currency: uploadQuotationForm.amountCurrency || 'INR',
      taxCurrency: uploadQuotationForm.taxCurrency || uploadQuotationForm.amountCurrency || 'INR',
      status: uploadQuotationForm.quotationStatus,
      clientName: uploadQuotationForm.contactPerson || uploadQuotationForm.companyName || uploadQuotationForm.clientAccountNumber,
      companyName: uploadQuotationForm.companyName,
      clientAccountNumber: uploadQuotationForm.clientAccountNumber,
      contactPerson: uploadQuotationForm.contactPerson,
      telephone: uploadQuotationForm.phone,
      email: uploadQuotationForm.email,
      clientAddressDetails: uploadQuotationForm.address,
      selectedAccountId: uploadQuotationForm.selectedAccountId,
      selectedAccountOwner: uploadQuotationForm.accountOwner,
      quotationFileName: uploadQuotationForm.quoteFile?.name || '',
      quotationFileSize: uploadQuotationForm.quoteFile?.size || 0,
      quotationFileType: uploadQuotationForm.quoteFile?.type || '',
      projectName: selectedUploadAccount?.projectName || uploadQuotationForm.companyName || uploadQuotationForm.clientAccountNumber,
    }

    setUploadQuotationSaving(true)
    const result = await createQuotation(payload)
    setUploadQuotationSaving(false)

    if (!result.success) {
      const isDuplicate = result.code === 'DUPLICATE_QUOTATION' || result.status === 409
      const message = result.message || 'Unable to upload quotation.'
      setUploadQuotationMessage(message)
      if (isDuplicate) {
        addNotification('warning', 'Duplicate quotation', message)
      } else {
        addNotification('error', 'Error', message)
      }
      return
    }

    addNotification('success', 'Success', 'Quotation uploaded successfully.')
    setActiveTab('account')
    setPage(1)
    setFilters(INITIAL_FILTERS)
    setIsUploadQuotationOpen(false)
    setIsAccountListOpen(false)
    setUploadQuotationForm(createInitialUploadQuotationForm())
    setUploadQuotationErrors({})
    setUploadQuotationMessage('')
  }

  const openQuotationView = (row, syncUrl = true) => {
    setViewRow(row)
    setViewRowFromUrl(syncUrl)
    if (syncUrl) {
      updateViewSearchParam(row.id)
    }
  }

  const closeQuotationView = () => {
    setViewRow(null)
    if (viewRowFromUrl || viewQuotationId) {
      setViewRowFromUrl(false)
      updateViewSearchParam('')
    }
  }

  useEffect(() => {
    if (!viewQuotationId) {
      if (viewRowFromUrl) {
        setViewRow(null)
        setViewRowFromUrl(false)
      }
      return
    }

    const matchedRow = rows.find((row) => (
      String(row.id) === String(viewQuotationId)
      || String(row.raw?.id || '') === String(viewQuotationId)
    ))

    if (!matchedRow) return

    setViewRowFromUrl(true)
    setViewRow((currentValue) => (currentValue?.id === matchedRow.id ? currentValue : matchedRow))
  }, [rows, viewQuotationId, viewRowFromUrl])

  const buildRelatedQuotationRows = (account) => {
    if (!account) return []

    return rows.filter((row) => (
      String(row.raw.selectedAccountId || '') === String(account.id || '')
      || safeLower(row.raw.clientAccountNumber) === safeLower(account.accountNumber)
      || safeLower(row.company) === safeLower(account.name)
    ))
  }

  const openPdfPage = (row) => {
    setPdfRow(row)
  }

  const closePdfPage = () => {
    setPdfRow(null)
  }

  const handlePrintPdfPage = () => {
    triggerBrowserPdfSave(pdfDocument)
  }

  const handleDownloadPdfPage = () => {
    if (!pdfDocument) return
    triggerBrowserPdfSave(pdfDocument)
  }

  const handleOpenFieldPanel = () => {
    setFieldPanelDraft({
      selectedFields: [...quotationLayout.selectedFields],
    })
    setIsFieldPanelOpen(true)
  }

  const persistAdminQuotationLayout = async (layoutValue) => {
    const sanitizedLayout = sanitizeAdminQuotationLayout(layoutValue)
    const payload = {
      entityType: ADMIN_QUOTATION_LAYOUT_VIEW_ENTITY_TYPE,
      name: ADMIN_QUOTATION_LAYOUT_VIEW_NAME,
      columns: sanitizedLayout.selectedFields,
      filters: {},
      sort: {},
      isDefault: false,
      isShared: false,
    }

    const persistedView = savedLayoutViewId
      ? await customViewApi.updateCustomView(savedLayoutViewId, payload)
      : await customViewApi.upsertCustomViewByName(payload)

    if (persistedView?.id) {
      setSavedLayoutViewId(String(persistedView.id))
    }
  }

  const handleApplyFieldPanel = async (shouldPersist) => {
    if (fieldPanelDraft.selectedFields.length === 0) {
      addNotification('error', 'Field selection required', 'Select at least one quotation field.')
      return
    }

    const nextLayout = sanitizeAdminQuotationLayout(fieldPanelDraft)
    setQuotationLayout(nextLayout)
    if (shouldPersist) {
      window.localStorage.setItem(ADMIN_QUOTATION_LAYOUT_STORAGE_KEY, JSON.stringify(nextLayout))
      try {
        await persistAdminQuotationLayout(nextLayout)
      } catch (_error) {
        addNotification('warning', 'Saved locally', 'The quotation layout was saved in this browser, but database sync is unavailable right now.')
      }
    }
    setIsFieldPanelOpen(false)
  }

  const handleAddSelectedField = (fieldKey) => {
    setFieldPanelDraft((currentValue) => (
      currentValue.selectedFields.includes(fieldKey)
        ? currentValue
        : {
          ...currentValue,
          selectedFields: [...currentValue.selectedFields, fieldKey],
        }
    ))
  }

  const handleRemoveSelectedField = (fieldKey) => {
    setFieldPanelDraft((currentValue) => {
      if (currentValue.selectedFields.length <= 1) {
        return currentValue
      }

      return {
        ...currentValue,
        selectedFields: currentValue.selectedFields.filter((entry) => entry !== fieldKey),
      }
    })
  }

  const handleSelectedFieldDrop = (targetFieldKey) => {
    if (!draggedFieldKey || draggedFieldKey === targetFieldKey) return

    setFieldPanelDraft((currentValue) => {
      const currentIndex = currentValue.selectedFields.indexOf(draggedFieldKey)
      const targetIndex = currentValue.selectedFields.indexOf(targetFieldKey)
      if (currentIndex < 0 || targetIndex < 0) return currentValue

      const nextFields = [...currentValue.selectedFields]
      nextFields.splice(currentIndex, 1)
      nextFields.splice(targetIndex, 0, draggedFieldKey)

      return {
        ...currentValue,
        selectedFields: nextFields,
      }
    })
    setDraggedFieldKey('')
  }

  const handleExportRows = (format) => {
    const fileBase = `Quotation_Manager_${activeTab}_${new Date().toISOString().slice(0, 10)}`
    const managerMetadata = [
      { label: 'View', value: activeTab.toUpperCase() },
      { label: 'Total Records', value: String(filteredRows.length) },
      { label: 'Generated On', value: new Date().toLocaleString('en-IN') },
    ]

    const structuredExportRows = filteredRows.map((row) => ({
      date: row.dateSort || row.raw?.quotationDate || row.raw?.createdAt || '',
      owner: row.owner || '',
      company: row.company || '',
      project: row.project || '',
      num: row.num || '',
      amountLabel: row.amountLabel || '',
      statusLabel: row.statusLabel || formatStatusLabel(row.status),
      oldStatus: row.oldStatus || '',
      newStatus: row.newStatus || '',
      convertToPo: row.convertToPo || '',
      poValueJobNo: row.poValueJobNo || '',
      reasonForLostOrder: row.reasonForLostOrder || '',
    }))

    if (format === 'csv') {
      exportCsvWorkbook({
        filename: `${fileBase}.csv`,
        title: 'Quotation Manager',
        subtitle: `${activeTab.toUpperCase()} quotations`,
        sheetName: 'Quotation Manager',
        metadata: managerMetadata,
        columns: ADMIN_QUOTATION_MANAGER_EXPORT_COLUMNS,
        rows: structuredExportRows,
      })
      addNotification('success', 'CSV exported', 'Quotation manager data exported to CSV.')
      return
    }

    if (format === 'excel') {
      exportExcelWorkbook({
        filename: `${fileBase}.xlsx`,
        title: 'Quotation Manager',
        subtitle: `${activeTab.toUpperCase()} quotations`,
        sheetName: 'Quotation Manager',
        metadata: managerMetadata,
        columns: ADMIN_QUOTATION_MANAGER_EXPORT_COLUMNS,
        rows: structuredExportRows,
      })
      addNotification('success', 'Excel exported', 'Quotation manager data exported to Excel.')
    }
  }

  const handleApprove = async () => {
    if (!approveRow) return

    setActionLoadingId(approveRow.id)
    const result = await updateQuotation(approveRow.id, {
      status: 'approved',
      rejectionReason: '',
      approvedAt: new Date().toISOString(),
    })
    setActionLoadingId('')

    if (!result.success) {
      addNotification('error', 'Approval failed', result.message || 'Unable to approve this quotation.')
      return
    }

    setApproveRow(null)
    addNotification('success', 'Quotation approved', 'The quotation status has been updated to Approved.')
  }

  const handleRejectSubmit = async () => {
    const trimmedReason = rejectReason.trim()
    if (!trimmedReason) {
      setRejectError('Rejection reason is required.')
      return
    }

    if (!rejectRow) return

    setRejectError('')
    setActionLoadingId(rejectRow.id)
    const result = await updateQuotation(rejectRow.id, {
      status: 'rejected',
      rejectionReason: trimmedReason,
      rejectedAt: new Date().toISOString(),
    })
    setActionLoadingId('')

    if (!result.success) {
      addNotification('error', 'Reject failed', result.message || 'Unable to reject this quotation.')
      return
    }

    setRejectRow(null)
    setRejectReason('')
    addNotification('success', 'Quotation rejected', 'The quotation has been rejected and the reason was saved.')
  }

  const normalizeInlineCurrencyValue = (value) => {
    const numericValue = Number.parseFloat(String(value || '').replace(/[^\d.-]/g, ''))
    return Number.isFinite(numericValue) ? numericValue : 0
  }

  const buildInlineQuotationPatch = (rawQuotation = {}, fieldKey = '', value = '') => {
    if (fieldKey.startsWith('customerReference.')) {
      const [, nestedKey] = fieldKey.split('.')
      return {
        customerReference: {
          ...(rawQuotation.customerReference || {}),
          [nestedKey]: value,
        },
      }
    }

    if (fieldKey.startsWith('lineItems.')) {
      const [, indexValue, lineItemKey] = fieldKey.split('.')
      const itemIndex = Number.parseInt(indexValue, 10)
      const sourceItems = Array.isArray(rawQuotation.lineItems) && rawQuotation.lineItems.length > 0
        ? rawQuotation.lineItems
        : buildLineItems(rawQuotation)
      const nextLineItems = sourceItems.map((lineItem, index) => {
        if (index !== itemIndex) return lineItem

        const nextItem = { ...lineItem }
        if (lineItemKey === 'quantity') {
          nextItem.quantity = normalizeInlineCurrencyValue(value)
        } else if (lineItemKey === 'rate') {
          nextItem.rate = normalizeInlineCurrencyValue(value)
        } else {
          nextItem[lineItemKey] = value
        }
        nextItem.amount = toNumber(nextItem.quantity) * toNumber(nextItem.rate)
        return nextItem
      })

      return {
        lineItems: nextLineItems,
        amount: nextLineItems.reduce((sum, lineItem) => sum + toNumber(lineItem.amount), 0),
        totalAmount: nextLineItems.reduce((sum, lineItem) => sum + toNumber(lineItem.amount), 0),
      }
    }

    return { [fieldKey]: value }
  }

  const handleInlineQuotationEdit = async (fieldKey, value) => {
    if (!viewRow?.id || !fieldKey) return

    const rawQuotation = viewRow.raw || {}
    const patch = buildInlineQuotationPatch(rawQuotation, fieldKey, value)
    const optimisticRaw = {
      ...rawQuotation,
      ...patch,
    }

    setViewRow((currentRow) => (
      currentRow?.id === viewRow.id
        ? { ...currentRow, raw: optimisticRaw }
        : currentRow
    ))

    const result = await updateQuotation(viewRow.id, patch)
    if (!result.success) {
      addNotification('error', 'Quotation update failed', result.message || 'Unable to save quotation field.')
      setViewRow((currentRow) => (
        currentRow?.id === viewRow.id
          ? { ...currentRow, raw: rawQuotation }
          : currentRow
      ))
      return
    }

    addNotification('success', 'Quotation updated', 'Quotation field saved.')
  }

  const handleAction = (actionKey, row) => {
    if (actionKey === 'pdf') {
      openPdfPage(row)
      return
    }

    if (actionKey === 'preview') {
      setPreviewRow(row)
      return
    }

    if (actionKey === 'view') {
      openQuotationView(row)
      return
    }

    if (actionKey === 'approve') {
      setApproveRow(row)
      return
    }

    if (actionKey === 'reject') {
      setRejectRow(row)
      setRejectReason(row.raw.rejectionReason || '')
      setRejectError('')
      return
    }

    if (actionKey === 'clone') {
      navigate(generatorPath, { state: { quotationDraft: { ...row.raw, status: 'approved', rejectionReason: '' } } })
      return
    }

    if (actionKey === 'account') {
      setAccountRow(row)
    }
  }

  const handleViewModalAction = (actionKey) => {
    if (!viewRow) return

    if (actionKey === 'view') return

    const currentRow = viewRow
    closeQuotationView()
    handleAction(actionKey, currentRow)
  }

  const handleViewQuotationExport = (format) => {
    if (!viewRow) return
    const doc = buildQuotationDocumentData(viewRow.raw, viewRow.linkedAccount)
    const options = buildQuotationViewExportOptions(doc)
    if (!options) return

    const quotationLabel = String(doc.quotationNumber || 'draft').replace(/[^A-Za-z0-9_-]+/g, '_')
    const fileBase = `Quotation_${quotationLabel}_${new Date().toISOString().slice(0, 10)}`

    if (format === 'csv') {
      exportCsvWorkbook({ ...options, filename: `${fileBase}.csv` })
      addNotification('success', 'CSV exported', `Quotation ${doc.quotationNumber} exported to CSV.`)
      return
    }

    exportExcelWorkbook({ ...options, filename: `${fileBase}.xlsx` })
    addNotification('success', 'Excel exported', `Quotation ${doc.quotationNumber} exported to Excel.`)
  }

  const previewDocument = previewRow ? buildQuotationDocumentData(previewRow.raw, previewRow.linkedAccount) : null
  const pdfDocument = pdfRow ? buildQuotationDocumentData(pdfRow.raw, pdfRow.linkedAccount) : null
  const viewDocument = viewRow ? buildQuotationDocumentData(viewRow.raw, viewRow.linkedAccount) : null
  const previewActions = previewRow ? getAllowedQuotationActions(user, previewRow) : []
  const viewActions = viewRow ? getAllowedQuotationActions(user, viewRow) : []
  const accountDetails = accountRow?.linkedAccount || null
  const relatedQuotations = useMemo(
    () => buildRelatedQuotationRows(accountDetails),
    [accountDetails, rows]
  )

  if (!isAuthorized) return null

  if (pdfDocument) {
    return (
      <QuotationPdfViewer
        documentData={pdfDocument}
        title={`QUOTATION - ${pdfDocument.quotationNumber}`}
        subtitle={pdfDocument.companyName}
        onBack={closePdfPage}
        onPrint={handlePrintPdfPage}
        onDownload={handleDownloadPdfPage}
      />
    )
  }

  return (
    <div className="aqp-page">
      <div className="aqp-titlebar">
        <h1 className="aqp-title">Quotation Manager</h1>
      </div>

      <div className="aqp-tab-bar">
        <div className="aqp-tabs">
          <button
            type="button"
            className={`aqp-tab${activeTab === 'account' ? ' aqp-tab--active' : ''}`}
            onClick={() => setActiveTab('account')}
          >
            ACCOUNT
          </button>
          <button
            type="button"
            className={`aqp-tab${activeTab === 'deal' ? ' aqp-tab--active' : ''}`}
            onClick={() => setActiveTab('deal')}
          >
            DEAL
          </button>
        </div>

        <div className="aqp-tab-actions">
          <button type="button" className="aqp-btn aqp-btn--gray" onClick={openUploadQuotationModal}>
            <FaUpload className="aqp-btn-icon" />
            Upload Quotation
          </button>
          <button type="button" className="aqp-btn aqp-btn--red aqp-btn--generate" onClick={() => navigate(generatorPath, { state: { openGenerator: true } })}>
            <FaPlus className="aqp-btn-icon" />
            Generate Quotation
          </button>
        </div>
      </div>

      <div className="aqp-content-wrapper">
        <div className="aqp-main-content">
          <div className="aqp-report-controls">
            <div className="aqp-report-controls-left">
              <div className="aqp-report-export">
                <ExcelExportMenuButton
                  label="Export"
                  title="Export quotation manager"
                  className="aqp-report-export"
                  items={[
                    {
                      key: 'quotation-manager-excel',
                      label: 'Export to Excel',
                      badge: 'XLSX',
                      onClick: () => handleExportRows('excel'),
                    },
                  ]}
                />
              </div>
            </div>
          </div>

          <div className="aqp-table-wrap">
        <table className="aqp-table">
          <thead>
            <tr className="aqp-thead-row">
              {selectedFieldDefinitions.map((field) => (
                <th key={field.key} className={`aqp-th aqp-field--${field.key}`}>
                  {field.label} <FaSort className="aqp-sort-icon" />
                </th>
              ))}
            </tr>
            <tr className="aqp-search-row">
              {selectedFieldDefinitions.map((field) => (
                <th key={field.key} className={`aqp-search-th aqp-field--${field.key}`}>
                  <input
                    className="aqp-search-input"
                    value={filters[field.key] || ''}
                    onChange={(event) => {
                      setFilters((current) => ({ ...current, [field.key]: event.target.value }))
                      setPage(1)
                    }}
                    placeholder={"Search " + field.label}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {quotationsLoading && paginatedRows.length === 0 ? (
              <tr className="aqp-row">
                <td className="aqp-td" colSpan={Math.max(1, selectedFieldDefinitions.length)}>Loading quotations...</td>
              </tr>
            ) : quotationsError && paginatedRows.length === 0 ? (
              <tr className="aqp-row">
                <td className="aqp-td" colSpan={Math.max(1, selectedFieldDefinitions.length)}>{quotationsError}</td>
              </tr>
            ) : paginatedRows.length === 0 ? (
              <tr className="aqp-row">
                <td className="aqp-td" colSpan={Math.max(1, selectedFieldDefinitions.length)}>No quotations found.</td>
              </tr>
            ) : paginatedRows.map((row) => (
              <tr
                key={row.id}
                className="aqp-row"
                onClick={() => openQuotationView(row)}
                title={`Click to view ${row.num}`}
              >
                {selectedFieldDefinitions.map((field) => {
                  if (field.key === 'num') {
                    return (
                      <td key={field.key} className={`aqp-td aqp-td--num aqp-field--${field.key}`}>
                        <button
                          type="button"
                          className={`aqp-num-badge aqp-num-badge--button ${getActionBadgeClassName(row.status)}`}
                          onClick={(event) => {
                            event.stopPropagation()
                            openQuotationView(row)
                          }}
                        >
                          {row.num}
                        </button>
                      </td>
                    )
                  }

                  if (field.key === 'status') {
                    return (
                      <td key={field.key} className={`aqp-td aqp-field--${field.key}`}>
                        <StatusBadge status={row.status} />
                      </td>
                    )
                  }

                  const value = field.exportValue(row)
                  const className = field.key === 'company'
                    ? `aqp-td aqp-td--link aqp-field--${field.key}`
                    : field.key === 'amount'
                      ? `aqp-td aqp-td--amount aqp-field--${field.key}`
                      : `aqp-td aqp-field--${field.key}`

                  return (
                    <td key={field.key} className={className}>
                      {value}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="aqp-pagination">
        <span className="aqp-page-icon">{filteredRows.length}</span>
        <span className="aqp-total-label">Total records: {filteredRows.length}</span>
        <div className="aqp-page-btns">
          <button type="button" className="aqp-page-btn" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1}>
            <FaChevronLeft />
          </button>
          {visiblePages.map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              className={`aqp-page-btn${page === pageNumber ? ' aqp-page-btn--active' : ''}`}
              onClick={() => setPage(pageNumber)}
            >
              {pageNumber}
            </button>
          ))}
          <button type="button" className="aqp-page-btn" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page === totalPages}>
            <FaChevronRight />
          </button>
        </div>
      </div>
        </div>
      </div>

      {isFieldPanelOpen ? (
        <div className="aqp-field-panel-overlay" onClick={() => setIsFieldPanelOpen(false)}>
          <div className="aqp-field-panel" onClick={(event) => event.stopPropagation()}>
            <div className="aqp-field-panel-header">
              <h2>Select Quotation Report Fields</h2>
              <div className="aqp-field-panel-actions">
                <button type="button" className="aqp-field-panel-btn aqp-field-panel-btn--ghost" onClick={() => setIsFieldPanelOpen(false)}>
                  Close
                </button>
                <button type="button" className="aqp-field-panel-btn aqp-field-panel-btn--blue" onClick={() => handleApplyFieldPanel(false)}>
                  Apply
                </button>
                <button type="button" className="aqp-field-panel-btn aqp-field-panel-btn--green" onClick={() => handleApplyFieldPanel(true)}>
                  Save &amp; Apply
                </button>
              </div>
            </div>

            <div className="aqp-field-panel-grid">
              <section className="aqp-field-box">
                <div className="aqp-field-box-header">Quotation Fields</div>
                <div className="aqp-field-box-list">
                  {availableFieldDefinitions.map((field) => (
                    <button
                      key={field.key}
                      type="button"
                      className="aqp-field-option"
                      onClick={() => handleAddSelectedField(field.key)}
                    >
                      <span>{field.label}</span>
                      <strong>+</strong>
                    </button>
                  ))}
                </div>
              </section>

              <section className="aqp-field-box">
                <div className="aqp-field-box-header">Selected Fields</div>
                <div className="aqp-field-box-list">
                  {fieldPanelDraft.selectedFields.map((fieldKey) => {
                    const field = ADMIN_QUOTATION_FIELD_DEFINITIONS.find((entry) => entry.key === fieldKey)
                    if (!field) return null

                    return (
                      <div
                        key={field.key}
                        className="aqp-field-selected"
                        draggable
                        onDragStart={() => setDraggedFieldKey(field.key)}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => handleSelectedFieldDrop(field.key)}
                      >
                        <span>{field.label}</span>
                        <button type="button" className="aqp-field-remove" onClick={() => handleRemoveSelectedField(field.key)}>
                          <FaTimes />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : null}

      {isUploadQuotationOpen ? (
        <ModalShell
          title="Upload Account Quotation"
          onClose={closeUploadQuotationModal}
          size="aqp-modal--upload"
          footer={(
            <>
              <button type="button" className="aqp-btn aqp-btn--gray" onClick={closeUploadQuotationModal} disabled={uploadQuotationSaving}>
                Close
              </button>
              <button type="submit" form="aqp-upload-quotation-form" className="aqp-btn aqp-btn--blue" disabled={uploadQuotationSaving}>
                {uploadQuotationSaving ? 'Saving...' : 'Save'}
              </button>
            </>
          )}
        >
          <form id="aqp-upload-quotation-form" className="aqp-upload-form" onSubmit={handleUploadQuotationSave}>
            <div className="aqp-upload-note">
              Please select the account from the Account List popup before saving the uploaded quotation.
            </div>

            <div className="aqp-upload-grid">
              <label className="aqp-form-field aqp-upload-grid__full">
                <span className="aqp-form-label aqp-form-label--required">Select Account</span>
                <div className="aqp-upload-account-picker">
                  <input
                    className={`aqp-upload-input${uploadQuotationErrors.selectedAccountId ? ' aqp-upload-input--error' : ''}`}
                    value={uploadQuotationForm.selectedAccountLabel}
                    placeholder="Click the search icon to select an account"
                    readOnly
                  />
                  <button
                    type="button"
                    className="aqp-upload-account-button"
                    onClick={handleOpenAccountList}
                    aria-label="Search accounts"
                  >
                    <FaSearch />
                  </button>
                </div>
                {uploadQuotationErrors.selectedAccountId ? <div className="aqp-form-error">{uploadQuotationErrors.selectedAccountId}</div> : null}
              </label>

              {selectedUploadAccount ? (
                <div className="aqp-upload-account-card aqp-upload-grid__full">
                  <div className="aqp-upload-account-note">
                    Please double click on another account in the list if you want to change this selection.
                  </div>
                  <div className="aqp-upload-account-grid">
                    <div className="aqp-upload-account-item">
                      <span className="aqp-upload-account-item-label">Account No.</span>
                      <span className="aqp-upload-account-item-value">{selectedUploadAccount.accountNumber || '-'}</span>
                    </div>
                    <div className="aqp-upload-account-item">
                      <span className="aqp-upload-account-item-label">Account Name</span>
                      <span className="aqp-upload-account-item-value">{selectedUploadAccount.name || '-'}</span>
                    </div>
                    <div className="aqp-upload-account-item">
                      <span className="aqp-upload-account-item-label">Email</span>
                      <span className="aqp-upload-account-item-value">{uploadQuotationForm.email || '-'}</span>
                    </div>
                    <div className="aqp-upload-account-item">
                      <span className="aqp-upload-account-item-label">Phone</span>
                      <span className="aqp-upload-account-item-value">{uploadQuotationForm.phone || '-'}</span>
                    </div>
                    <div className="aqp-upload-account-item">
                      <span className="aqp-upload-account-item-label">Account Owner</span>
                      <span className="aqp-upload-account-item-value">{uploadQuotationForm.accountOwner || '-'}</span>
                    </div>
                    <div className="aqp-upload-account-item aqp-upload-account-item--wide">
                      <span className="aqp-upload-account-item-label">Address</span>
                      <span className="aqp-upload-account-item-value">{uploadQuotationForm.address || '-'}</span>
                    </div>
                  </div>
                </div>
              ) : null}

              <label className="aqp-form-field">
                <span className="aqp-form-label aqp-form-label--required">Quote Number</span>
                <input
                  className={`aqp-upload-input${uploadQuotationErrors.quoteNumber ? ' aqp-upload-input--error' : ''}`}
                  value={uploadQuotationForm.quoteNumber}
                  onChange={(event) => handleUploadQuotationFieldChange('quoteNumber', event.target.value)}
                />
                {uploadQuotationErrors.quoteNumber ? <div className="aqp-form-error">{uploadQuotationErrors.quoteNumber}</div> : null}
              </label>

              <label className="aqp-form-field">
                <span className="aqp-form-label aqp-form-label--required">Quotation Date</span>
                <input
                  type="date"
                  className={`aqp-upload-input${uploadQuotationErrors.quotationDate ? ' aqp-upload-input--error' : ''}`}
                  value={uploadQuotationForm.quotationDate}
                  onChange={(event) => handleUploadQuotationFieldChange('quotationDate', event.target.value)}
                />
                {uploadQuotationErrors.quotationDate ? <div className="aqp-form-error">{uploadQuotationErrors.quotationDate}</div> : null}
              </label>

              <label className="aqp-form-field">
                <span className="aqp-form-label aqp-form-label--required">Total Amount</span>
                <div className="aqp-upload-field-inline">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className={`aqp-upload-input${uploadQuotationErrors.totalAmount ? ' aqp-upload-input--error' : ''}`}
                    value={uploadQuotationForm.totalAmount}
                    onChange={(event) => handleUploadQuotationFieldChange('totalAmount', event.target.value)}
                  />
                  <select
                    className="aqp-upload-select aqp-upload-select--currency"
                    value={uploadQuotationForm.amountCurrency}
                    onChange={(event) => handleUploadQuotationFieldChange('amountCurrency', event.target.value)}
                  >
                    {QUOTATION_CURRENCY_OPTIONS.map((currency) => (
                      <option key={currency.value} value={currency.value}>{currency.label}</option>
                    ))}
                  </select>
                </div>
                {uploadQuotationErrors.totalAmount ? <div className="aqp-form-error">{uploadQuotationErrors.totalAmount}</div> : null}
              </label>

              <label className="aqp-form-field">
                <span className="aqp-form-label">Total Product Tax</span>
                <div className="aqp-upload-field-inline">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="aqp-upload-input"
                    value={uploadQuotationForm.totalProductTax}
                    onChange={(event) => handleUploadQuotationFieldChange('totalProductTax', event.target.value)}
                  />
                  <select
                    className="aqp-upload-select aqp-upload-select--currency"
                    value={uploadQuotationForm.taxCurrency}
                    onChange={(event) => handleUploadQuotationFieldChange('taxCurrency', event.target.value)}
                  >
                    {QUOTATION_CURRENCY_OPTIONS.map((currency) => (
                      <option key={currency.value} value={currency.value}>{currency.label}</option>
                    ))}
                  </select>
                </div>
              </label>

              <label className="aqp-form-field">
                <span className="aqp-form-label aqp-form-label--required">Quotation Status</span>
                <select
                  className={`aqp-upload-select${uploadQuotationErrors.quotationStatus ? ' aqp-upload-select--error' : ''}`}
                  value={uploadQuotationForm.quotationStatus}
                  onChange={(event) => handleUploadQuotationFieldChange('quotationStatus', event.target.value)}
                >
                  {UPLOAD_QUOTATION_STATUS_OPTIONS.map((statusOption) => (
                    <option key={statusOption.value || 'select'} value={statusOption.value}>{statusOption.label}</option>
                  ))}
                </select>
                {uploadQuotationErrors.quotationStatus ? <div className="aqp-form-error">{uploadQuotationErrors.quotationStatus}</div> : null}
              </label>

              <label className="aqp-form-field">
                <span className="aqp-form-label">Valid Until Date</span>
                <input
                  type="date"
                  className="aqp-upload-input"
                  value={uploadQuotationForm.validUntilDate}
                  onChange={(event) => handleUploadQuotationFieldChange('validUntilDate', event.target.value)}
                />
              </label>

              <label className="aqp-form-field">
                <span className="aqp-form-label">Contact Person</span>
                <input
                  className="aqp-upload-input"
                  value={uploadQuotationForm.contactPerson}
                  onChange={(event) => handleUploadQuotationFieldChange('contactPerson', event.target.value)}
                />
              </label>

              <label className="aqp-form-field aqp-upload-grid__full">
                <span className="aqp-form-label">Address</span>
                <textarea
                  className="aqp-textarea"
                  rows={3}
                  value={uploadQuotationForm.address}
                  onChange={(event) => handleUploadQuotationFieldChange('address', event.target.value)}
                />
              </label>

              <label className="aqp-form-field">
                <span className="aqp-form-label">Email</span>
                <input
                  className="aqp-upload-input"
                  value={uploadQuotationForm.email}
                  onChange={(event) => handleUploadQuotationFieldChange('email', event.target.value)}
                />
              </label>

              <label className="aqp-form-field">
                <span className="aqp-form-label">Phone</span>
                <input
                  className="aqp-upload-input"
                  value={uploadQuotationForm.phone}
                  onChange={(event) => handleUploadQuotationFieldChange('phone', event.target.value)}
                />
              </label>

              <label className="aqp-form-field aqp-upload-grid__full">
                <span className="aqp-form-label aqp-form-label--required">Quote File</span>
                <input
                  type="file"
                  accept=".pdf,.xls,.xlsx,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  className={`aqp-upload-file-input${uploadQuotationErrors.quoteFile ? ' aqp-upload-file-input--error' : ''}`}
                  onChange={handleUploadQuotationFileChange}
                />
                <div className="aqp-upload-file-note">
                  Allowed file types: PDF, XLS, XLSX. Maximum size: 5 MB.
                </div>
                {uploadQuotationForm.quoteFileName ? (
                  <div className="aqp-upload-file-name">{uploadQuotationForm.quoteFileName}</div>
                ) : null}
                {uploadQuotationErrors.quoteFile ? <div className="aqp-form-error">{uploadQuotationErrors.quoteFile}</div> : null}
              </label>
            </div>

            {uploadQuotationMessage ? <div className="aqp-upload-message">{uploadQuotationMessage}</div> : null}
          </form>
        </ModalShell>
      ) : null}

      {isUploadQuotationOpen && isAccountListOpen ? (
        <ModalShell
          title="Account List"
          onClose={() => setIsAccountListOpen(false)}
          size="aqp-modal--xl"
        >
          <div className="aqp-account-list">
            <div className="aqp-account-list-note">
              Please double click on the account to select a account.
            </div>

            <div className="aqp-account-list-table-wrap">
              <table className="aqp-account-list-table">
                <thead>
                  <tr className="aqp-account-list-header-row">
                    <th>Account No.</th>
                    <th>Account Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Account Owner</th>
                  </tr>
                  <tr className="aqp-account-list-search-row">
                    <th>
                      <input
                        className="aqp-account-list-search-input"
                        value={accountFilters.accountNumber}
                        onChange={(event) => handleAccountFilterChange('accountNumber', event.target.value)}
                        placeholder="Search here ..."
                      />
                    </th>
                    <th>
                      <input
                        className="aqp-account-list-search-input"
                        value={accountFilters.name}
                        onChange={(event) => handleAccountFilterChange('name', event.target.value)}
                        placeholder="Search here ..."
                      />
                    </th>
                    <th>
                      <input
                        className="aqp-account-list-search-input"
                        value={accountFilters.email}
                        onChange={(event) => handleAccountFilterChange('email', event.target.value)}
                        placeholder="Search here ..."
                      />
                    </th>
                    <th>
                      <input
                        className="aqp-account-list-search-input"
                        value={accountFilters.phone}
                        onChange={(event) => handleAccountFilterChange('phone', event.target.value)}
                        placeholder="Search here ..."
                      />
                    </th>
                    <th>
                      <input
                        className="aqp-account-list-search-input"
                        value={accountFilters.accountOwner}
                        onChange={(event) => handleAccountFilterChange('accountOwner', event.target.value)}
                        placeholder="Search here ..."
                      />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAccounts.length > 0 ? (
                    paginatedAccounts.map((account) => (
                      <tr
                        key={account.id}
                        className={`aqp-account-list-row${uploadQuotationForm.selectedAccountId === account.id ? ' aqp-account-list-row--selected' : ''}`}
                        onDoubleClick={() => handleUploadAccountSelect(account)}
                      >
                        <td>{account.accountNumber || '-'}</td>
                        <td>{account.name || '-'}</td>
                        <td>{account.email || '-'}</td>
                        <td>{account.phone || '-'}</td>
                        <td>{account.accountOwnerDisplay || account.accountOwner || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="aqp-account-list-empty">
                        No accounts found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="aqp-account-list-pagination">
              <span className="aqp-account-list-total">Total records: {filteredAccounts.length}</span>
              <div className="aqp-account-list-pagination-actions">
                <button
                  type="button"
                  className="aqp-account-list-page-button"
                  onClick={() => setAccountListPage((currentValue) => Math.max(1, currentValue - 1))}
                  disabled={accountListPage === 1}
                >
                  prev
                </button>
                {visibleAccountPages.map((visiblePage) => (
                  <button
                    key={visiblePage}
                    type="button"
                    className={`aqp-account-list-page-button${visiblePage === accountListPage ? ' aqp-account-list-page-button--active' : ''}`}
                    onClick={() => setAccountListPage(visiblePage)}
                  >
                    {visiblePage}
                  </button>
                ))}
                <button
                  type="button"
                  className="aqp-account-list-page-button"
                  onClick={() => setAccountListPage((currentValue) => Math.min(totalAccountPages, currentValue + 1))}
                  disabled={accountListPage === totalAccountPages}
                >
                  next
                </button>
              </div>
            </div>
          </div>
        </ModalShell>
      ) : null}

      {previewDocument ? (
        <ModalShell
          title={`Quotation Preview - ${previewDocument.quotationNumber}`}
          onClose={() => setPreviewRow(null)}
          size="aqp-modal--xl"
          footer={(
            <>
              <button type="button" className="aqp-btn aqp-btn--gray" onClick={() => setPreviewRow(null)}>
                Close
              </button>
              <button type="button" className="aqp-btn aqp-btn--gray" onClick={() => triggerBrowserPdfSave(previewDocument)}>
                <FaPrint className="aqp-btn-icon" />
                Print
              </button>
              {previewActions.some((action) => action.key === 'pdf') ? (
                <button type="button" className="aqp-btn aqp-btn--blue" onClick={() => {
                  const target = previewRow
                  setPreviewRow(null)
                  openPdfPage(target)
                }}>
                  View As PDF
                </button>
              ) : null}
            </>
          )}
        >
          <QuotationDocument documentData={previewDocument} />
        </ModalShell>
      ) : null}

      {viewDocument ? (
        <ModalShell
          title={`View Quotation - ${viewDocument.quotationNumber}`}
          onClose={closeQuotationView}
          size="aqp-modal--xl"
        >
          <div className="aqp-view-top-actions">
            <div className="aqp-modal-footer-group">
              <button type="button" className="aqp-btn aqp-btn--gray" onClick={closeQuotationView}>
                Close
              </button>
              <button type="button" className="aqp-btn aqp-btn--blue" onClick={() => triggerBrowserPdfSave(viewDocument)}>
                <FaPrint className="aqp-btn-icon" />
                Print
              </button>
            </div>
          </div>
          <div className="aqp-view-quotation-document">
            <QuotationDocument
              documentData={viewDocument}
              editable
              onEditField={handleInlineQuotationEdit}
            />
          </div>
        </ModalShell>
      ) : null}

      {accountRow ? (
        <ModalShell
          title={`View Account - ${accountRow.company}`}
          onClose={() => setAccountRow(null)}
          size="aqp-modal--lg"
          footer={(
            <button type="button" className="aqp-btn aqp-btn--gray" onClick={() => setAccountRow(null)}>
              Close
            </button>
          )}
        >
          <div className="aqp-account">
            <div className="aqp-account__grid">
              <div><strong>Account No.:</strong> {sectionValue(accountDetails?.accountNumber || accountRow.raw.clientAccountNumber)}</div>
              <div><strong>Account Name:</strong> {sectionValue(accountDetails?.name || accountRow.company)}</div>
              <div><strong>Email:</strong> {sectionValue(accountDetails?.email || accountRow.raw.email)}</div>
              <div><strong>Phone:</strong> {sectionValue(accountDetails?.phone || accountRow.raw.telephone)}</div>
              <div><strong>Account Owner:</strong> {sectionValue(accountDetails?.accountOwnerDisplay || accountDetails?.accountOwner || accountRow.raw.selectedAccountOwner)}</div>
              <div><strong>GSTIN:</strong> {sectionValue(accountDetails?.gstin || accountRow.raw.gstin)}</div>
              <div><strong>State Code:</strong> {sectionValue(accountDetails?.stateCode || accountRow.raw.stateCode)}</div>
              <div><strong>Contact Person:</strong> {sectionValue(accountDetails?.contactPerson || accountRow.raw.contactPerson)}</div>
            </div>
            <div className="aqp-account__section">
              <h3>Address</h3>
              <p>{sectionValue(accountDetails?.address || accountRow.raw.clientAddressDetails)}</p>
            </div>
            <div className="aqp-account__section">
              <h3>Related Quotations</h3>
              {relatedQuotations.length === 0 ? (
                <p>No related quotations found.</p>
              ) : (
                <table className="aqp-account__table">
                  <thead>
                    <tr>
                      <th>Quotation No.</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relatedQuotations.map((row) => (
                      <tr key={row.id} onClick={() => openQuotationView(row)} title={`Click to view ${row.num}`}>
                        <td className="aqp-account__table-cell--num">
                          <button
                            type="button"
                            className={`aqp-num-badge aqp-num-badge--button ${getActionBadgeClassName(row.status)}`}
                            onClick={(event) => {
                              event.stopPropagation()
                              openQuotationView(row)
                            }}
                          >
                            {row.num}
                          </button>
                        </td>
                        <td>{row.date}</td>
                        <td>{row.statusLabel}</td>
                        <td>{row.amountLabel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </ModalShell>
      ) : null}

      {approveRow ? (
        <ModalShell
          title="Approve Quote"
          onClose={() => setApproveRow(null)}
          footer={(
            <>
              <button type="button" className="aqp-btn aqp-btn--gray" onClick={() => setApproveRow(null)} disabled={actionLoadingId === approveRow.id}>
                Cancel
              </button>
              <button type="button" className="aqp-btn aqp-btn--blue" onClick={handleApprove} disabled={actionLoadingId === approveRow.id}>
                {actionLoadingId === approveRow.id ? 'Approving...' : 'Approve'}
              </button>
            </>
          )}
        >
          <p>Are you sure you want to approve this quote?</p>
        </ModalShell>
      ) : null}

      {rejectRow ? (
        <ModalShell
          title="Reject Quote"
          onClose={() => {
            setRejectRow(null)
            setRejectError('')
            setRejectReason('')
          }}
          footer={(
            <>
              <button
                type="button"
                className="aqp-btn aqp-btn--gray"
                onClick={() => {
                  setRejectRow(null)
                  setRejectError('')
                  setRejectReason('')
                }}
                disabled={actionLoadingId === rejectRow.id}
              >
                Cancel
              </button>
              <button type="button" className="aqp-btn aqp-btn--blue" onClick={handleRejectSubmit} disabled={actionLoadingId === rejectRow.id}>
                {actionLoadingId === rejectRow.id ? 'Rejecting...' : 'Reject Quote'}
              </button>
            </>
          )}
        >
          <label className="aqp-form-field">
            <span className="aqp-form-label">Rejection Reason</span>
            <textarea
              className={`aqp-textarea${rejectError ? ' aqp-textarea--error' : ''}`}
              rows={5}
              value={rejectReason}
              onChange={(event) => {
                setRejectReason(event.target.value)
                if (rejectError) setRejectError('')
              }}
              placeholder="Enter rejection reason"
            />
          </label>
          {rejectError ? <div className="aqp-form-error">{rejectError}</div> : null}
        </ModalShell>
      ) : null}
    </div>
  )
}

export default AdminQuotationsPage
