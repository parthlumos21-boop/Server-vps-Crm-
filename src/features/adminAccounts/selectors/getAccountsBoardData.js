import { normalizeAccountRecord } from '../adapters/normalizeAccountRecord'
import { getVisibleAccountStages } from '../config/accountStages'

export const compareAccountsByNumberAsc = (left = {}, right = {}) => {
  const leftNumber = Number(resolveAccountOwnerSeriesNumber(left) || 0)
  const rightNumber = Number(resolveAccountOwnerSeriesNumber(right) || 0)

  if (leftNumber !== rightNumber) {
    return leftNumber - rightNumber
  }

  const leftId = Number(left.id) || 0
  const rightId = Number(right.id) || 0
  if (leftId !== rightId) {
    return leftId - rightId
  }

  return String(left.name || '').localeCompare(String(right.name || ''))
}

const resolveAccountOwnerSeriesNumber = (record = {}) => {
  const ownerCode = record.accountOwnerCode
    || record.ownerCode
    || record.raw?.accountOwnerCode
    || record.raw?.ownerCode
    || record.raw?.formData?.accountOwnerCode
    || record.raw?.formData?.ownerCode

  return String(ownerCode || '').trim()
}

const resolveStoredAccountNumber = (record = {}, index = 0) => {
  const storedValue = record.originalAccountNumber
    || record.accountNumber
    || record.accountNo
    || record.account_no
    || record.raw?.accountNumber
    || record.raw?.accountNo
    || record.raw?.account_no

  if (storedValue) {
    return String(storedValue)
  }

  const ownerSeriesNumber = resolveAccountOwnerSeriesNumber(record)
  return String(ownerSeriesNumber || 1001 + index)
}

export const getAccountsBoardData = (accounts = []) => {
  const records = accounts.map((account, index) =>
    normalizeAccountRecord(account, index, { recordSource: 'live' })
  ).sort(compareAccountsByNumberAsc)
    .map((record, index) => ({
      ...record,
      originalAccountNumber: record.originalAccountNumber || record.accountNumber,
      accountNumber: resolveStoredAccountNumber(record, index),
    }))

  const stages = getVisibleAccountStages()
  const countsByStage = stages.reduce((lookup, stage) => {
    lookup[stage.key] = 0
    return lookup
  }, {})

  const rowsByStage = stages.reduce((lookup, stage) => {
    lookup[stage.key] = []
    return lookup
  }, {})

  records.forEach((record) => {
    if (!countsByStage[record.stage]) {
      countsByStage[record.stage] = 0
      rowsByStage[record.stage] = []
    }

    countsByStage[record.stage] += 1
    rowsByStage[record.stage].push(record)
  })

  return {
    records,
    stages,
    countsByStage,
    rowsByStage,
    totalRecords: records.length,
  }
}
