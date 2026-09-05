import { getVisibleAccountStages } from '../config/accountStages'
import { isSameCrmOwner } from '../../users/crmUserDirectory'
import { getAccountsBoardData } from './getAccountsBoardData'

const normalizeCompareValue = (value) => String(value || '').trim().toLowerCase()

const buildBoardDataFromRecords = (records = []) => {
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
    if (!rowsByStage[record.stage]) {
      rowsByStage[record.stage] = []
      countsByStage[record.stage] = 0
    }

    rowsByStage[record.stage].push(record)
    countsByStage[record.stage] += 1
  })

  return {
    records,
    stages,
    countsByStage,
    rowsByStage,
    totalRecords: records.length,
  }
}

const isOwnedByCurrentUser = (record, user) => {
  if (!user) return false

  const raw = record.raw || {}

  // Match by id against creator id on the raw record.
  const userId = normalizeCompareValue(user.id)
  if (userId) {
    const matchingIds = [
      raw.userId,
      raw.createdByUserId,
    ].map(normalizeCompareValue)

    if (matchingIds.includes(userId)) {
      return true
    }
  }

  // Match by added-by name using CRM-aware comparison
  const candidateCreators = [
    record.addedBy,
    record.addedByDisplay,
    raw.addedBy,
    raw.addedByName,
  ]

  const userNames = [
    user.name,
    user.ownerDisplayName,
    user.username,
    user.email,
  ]

  return candidateCreators.some((candidate) => (
    userNames.some((userName) => isSameCrmOwner(candidate, userName))
  ))
}

export const getMyAccountsBoardData = (accounts = [], user = null) => {
  const boardData = getAccountsBoardData(accounts)
  const records = boardData.records.filter((record) => isOwnedByCurrentUser(record, user))
  return buildBoardDataFromRecords(records)
}
