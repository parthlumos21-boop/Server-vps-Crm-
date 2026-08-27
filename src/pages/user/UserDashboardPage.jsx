import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaBell,
  FaChartLine,
  FaClipboardList,
  FaHandshake,
  FaUsers,
} from 'react-icons/fa'
import Badge from '../../components/common/Badge'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import apiClient from '../../services/apiClient'
import {
  formatCurrency,
  formatDate,
  getPriorityColor,
  getStatusColor,
} from '../../utils/helpers'
import './UserDashboardPage.css'

const formatTodoDateTime = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const UserDashboardPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    accounts,
    deals,
    tasks,
    notifications,
    supportRequests,
    reminders,
    updateReminder,
  } = useData()
  const [todoReplies, setTodoReplies] = useState([])

  const fetchTodoReplies = useCallback(async () => {
    try {
      const res = await apiClient.get('/support-requests/todo/replies')
      setTodoReplies(Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []))
    } catch (error) {
      console.error('Failed to fetch todo replies:', error)
    }
  }, [])

  useEffect(() => {
    fetchTodoReplies()
  }, [fetchTodoReplies])

  const stats = useMemo(() => {
    const pendingTasks = tasks.filter((task) => task.status === 'pending')
    const openDeals = deals.filter((deal) => !['won', 'lost'].includes(String(deal.status || '').toLowerCase()))
    const openSupportRequests = supportRequests.filter((supportRequest) => String(supportRequest.status || '').toLowerCase() !== 'closed')

    return {
      accounts: accounts.length,
      deals: deals.length,
      dealValue: deals.reduce((sum, deal) => sum + (Number(deal.value) || 0), 0),
      openDeals: openDeals.length,
      tasks: tasks.length,
      pendingTasks: pendingTasks.length,
      supportRequests: supportRequests.length,
      openSupportRequests: openSupportRequests.length,
      notifications: notifications.length,
    }
  }, [accounts, deals, notifications.length, supportRequests, tasks])

  const recentDeals = useMemo(() => (
    [...deals]
      .sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime())
      .slice(0, 5)
  ), [deals])

  const upcomingTasks = useMemo(() => (
    tasks
      .filter((task) => task.status !== 'completed')
      .sort((left, right) => new Date(left.dueDate || left.createdAt || 0).getTime() - new Date(right.dueDate || right.createdAt || 0).getTime())
      .slice(0, 5)
  ), [tasks])

  const latestNotifications = useMemo(() => (
    [...notifications]
      .sort((left, right) => new Date(right.timestamp || 0).getTime() - new Date(left.timestamp || 0).getTime())
      .slice(0, 5)
  ), [notifications])

  const todoItems = useMemo(() => {
    const reminderItems = (reminders || [])
      .filter((reminder) => String(reminder.status || '').toLowerCase() !== 'closed')
      .filter((reminder) => String(reminder.assignedTo || reminder.createdBy || '') === String(user?.id || ''))
      .slice(0, 6)
      .map((reminder) => ({
        id: `reminder-${reminder.id}`,
        type: 'Reminder',
        title: reminder.title || 'Reminder',
        meta: formatTodoDateTime(reminder.remindAt || reminder.reminderDate),
        message: reminder.message || reminder.note || '-',
        date: reminder.remindAt || reminder.reminderDate,
        reminder,
        onClick: () => navigate('/reminders/my', {
          state: {
            activeMyReminderTab: 'today',
            reminderId: reminder.id,
          },
        }),
      }))

    const replyItems = todoReplies.slice(0, 6).map((reply, index) => {
      const requestId = reply.support_request_id || reply.supportRequestId || ''
      const matchedRequest = supportRequests.find((request) => (
        [request.id, request.mongoId, request._id, request.legacyId].some((value) => String(value || '') === String(requestId || ''))
      ))
      const targetRequestId = matchedRequest?.id || requestId
      return {
        id: `reply-${reply._id || reply.id || index}`,
        type: 'Reply',
        title: reply.sender_email || reply.senderEmail || 'Support Reply',
        meta: formatTodoDateTime(reply.created_at || reply.createdAt),
        message: reply.message || '-',
        date: reply.created_at || reply.createdAt,
        onClick: () => navigate('/tickets', {
          state: {
            activeTab: 'replied',
            expandedTicketId: targetRequestId,
            supportRequestId: targetRequestId,
          },
        }),
      }
    })

    return [...replyItems, ...reminderItems]
      .sort((left, right) => new Date(right.date || 0).getTime() - new Date(left.date || 0).getTime())
      .slice(0, 10)
  }, [navigate, reminders, supportRequests, todoReplies, user?.id])

  const handleTodoReminderActive = (reminder, event) => {
    event?.stopPropagation()
    navigate('/reminders/active', {
      state: {
        reminderId: reminder.id,
      },
    })
  }

  const handleTodoReminderClose = async (reminder, event) => {
    event?.stopPropagation()
    await updateReminder(reminder.id, { status: 'closed' })
    navigate('/reminders/closed', {
      state: {
        reminderId: reminder.id,
      },
    })
  }

  return (
    <div className="ud-page">
      <div className="ud-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user?.name || 'User'}! Here&apos;s your live work summary.</p>
      </div>

      <div className="ud-stats-grid">
        <div className="ud-stat-card">
          <div className="ud-stat-icon ud-stat-icon--blue">
            <FaUsers />
          </div>
          <div className="ud-stat-details">
            <div className="ud-stat-value">{stats.accounts}</div>
            <div className="ud-stat-label">Accounts</div>
            <div className="ud-stat-subtext">Assigned to you</div>
          </div>
        </div>

        <div className="ud-stat-card">
          <div className="ud-stat-icon ud-stat-icon--green">
            <FaHandshake />
          </div>
          <div className="ud-stat-details">
            <div className="ud-stat-value">{stats.openDeals}</div>
            <div className="ud-stat-label">Open Deals</div>
            <div className="ud-stat-subtext">{formatCurrency(stats.dealValue)} pipeline</div>
          </div>
        </div>

        <div className="ud-stat-card">
          <div className="ud-stat-icon ud-stat-icon--red">
            <FaClipboardList />
          </div>
          <div className="ud-stat-details">
            <div className="ud-stat-value">{stats.pendingTasks}</div>
            <div className="ud-stat-label">Pending Tasks</div>
            <div className="ud-stat-subtext">{stats.tasks} total tasks</div>
          </div>
        </div>

        <div className="ud-stat-card">
          <div className="ud-stat-icon ud-stat-icon--purple">
            <FaBell />
          </div>
          <div className="ud-stat-details">
            <div className="ud-stat-value">{stats.notifications}</div>
            <div className="ud-stat-label">Notifications</div>
            <div className="ud-stat-subtext">{stats.openSupportRequests} active support requests</div>
          </div>
        </div>
      </div>

      <div className="ud-content-grid ud-content-grid--3col">
        <div className="ud-card">
          <div className="ud-card-header">
            <h3>Recent Deals</h3>
            <button type="button" className="ud-view-all-btn" onClick={() => navigate('/deals')}>
              View All &rarr;
            </button>
          </div>
          <div className="ud-list">
            {recentDeals.length > 0 ? recentDeals.map((deal) => (
              <div key={deal.id} className="ud-list-item">
                <div className="ud-item-info">
                  <div className="ud-item-title">{deal.name || '-'}</div>
                  <div className="ud-item-desc">
                    <Badge variant={getStatusColor(deal.status)}>
                      {deal.status || '-'}
                    </Badge>
                  </div>
                </div>
                <div className="ud-item-meta">
                  <div className="ud-item-value">{formatCurrency(deal.value || 0)}</div>
                  <div className="ud-item-date">{formatDate(deal.createdAt)}</div>
                </div>
              </div>
            )) : (
              <div className="ud-empty-state">No deals available</div>
            )}
          </div>
        </div>

        <div className="ud-card">
          <div className="ud-card-header">
            <h3>To Do List</h3>
            <button type="button" className="ud-view-all-btn" onClick={fetchTodoReplies}>
              Refresh
            </button>
          </div>
          <div className="ud-todo-list">
            {todoItems.length > 0 ? todoItems.map((item) => (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                className="ud-todo-item"
                onClick={item.onClick}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    item.onClick()
                  }
                }}
              >
                <span className="ud-todo-kicker">{item.type}</span>
                <span className="ud-todo-title">{item.title}</span>
                <span className="ud-todo-meta">{item.meta}</span>
                <span className="ud-todo-message">{item.message}</span>
                {item.reminder ? (
                  <span className="ud-todo-actions">
                    <button type="button" className="ud-todo-mini-btn" onClick={(event) => handleTodoReminderActive(item.reminder, event)}>
                      Active
                    </button>
                    <button type="button" className="ud-todo-mini-btn ud-todo-mini-btn--close" onClick={(event) => handleTodoReminderClose(item.reminder, event)}>
                      Close
                    </button>
                  </span>
                ) : null}
              </div>
            )) : (
              <div className="ud-empty-state">No todo items</div>
            )}
          </div>
        </div>

        <div className="ud-card">
          <div className="ud-card-header">
            <h3>Upcoming Tasks</h3>
          </div>
          <div className="ud-list">
            {upcomingTasks.length > 0 ? upcomingTasks.map((task) => (
              <div key={task.id} className="ud-list-item">
                <div className="ud-item-info">
                  <div className="ud-item-title">{task.title}</div>
                  <div className="ud-item-desc">{task.description || 'No description'}</div>
                </div>
                <div className="ud-item-meta">
                  <Badge variant={getPriorityColor(task.priority)}>
                    {task.priority || 'medium'}
                  </Badge>
                  <div className="ud-item-date">{task.dueDate ? formatDate(task.dueDate) : '-'}</div>
                </div>
              </div>
            )) : (
              <div className="ud-empty-state">No upcoming tasks</div>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}

export default UserDashboardPage
