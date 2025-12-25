const lostItemStatusMap = {
  AVAILABLE: { label: '可认领', variant: 'neutral' },
  PENDING_REVIEW: { label: '审核中', variant: 'warning' },
  CLAIMED: { label: '已认领', variant: 'warning' },
  RETURNED: { label: '已归还', variant: 'success' },
}

const claimStatusMap = {
  PENDING: { label: '待处理', variant: 'warning' },
  APPROVED: { label: '已通过', variant: 'success' },
  REJECTED: { label: '已驳回', variant: 'danger' },
  COMPLETED: { label: '已完成', variant: 'neutral' },
}

export function formatDate(value) {
  if (!value) return '时间未知'
  try {
    const date = typeof value === 'string' ? new Date(value) : value
    if (Number.isNaN(date.getTime())) {
      return value
    }
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date)
  } catch (error) {
    return value
  }
}

export function translateLostItemStatus(status) {
  return lostItemStatusMap[status] || { label: '未知状态', variant: 'warning' }
}

export function translateClaimStatus(status) {
  return claimStatusMap[status] || { label: '未知状态', variant: 'warning' }
}

