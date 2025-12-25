<template>
  <div class="admin-dashboard">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2>管理系统</h2>
        <p>杭州电子科技大学信息工程学院</p>
      </div>
      
      <!-- 用户信息 -->
      <div class="user-section">
        <div class="user-avatar">
          <UserIcon />
        </div>
        <div class="user-info">
          <div class="user-name">{{ userName }}</div>
          <div class="user-role">管理员</div>
          <div class="user-id">{{ userStudentId }}</div>
        </div>
      </div>
      
      <nav class="sidebar-nav">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['nav-item', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          <component :is="tab.icon" class="nav-icon" />
          {{ tab.name }}
        </button>
        
        <!-- 登出按钮 -->
        <button @click="handleLogout" class="nav-item logout-item">
          <LogOutIcon class="nav-icon" />
          登出
        </button>
      </nav>
    </aside>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 仪表盘 -->
      <div v-if="activeTab === 'dashboard'" class="dashboard">
        <div class="dashboard-header">
          <h1>数据概览</h1>
          <button @click="refreshData" class="refresh-btn">
            <RefreshIcon class="refresh-icon" />
            刷新数据
          </button>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon total">
              <PackageIcon />
            </div>
            <div class="stat-content">
              <h3>{{ stats.totalItems }}</h3>
              <p>失物总数</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon available">
              <SearchIcon />
            </div>
            <div class="stat-content">
              <h3>{{ stats.availableItems }}</h3>
              <p>可认领失物</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon pending">
              <ClockIcon />
            </div>
            <div class="stat-content">
              <h3>{{ stats.pendingClaims }}</h3>
              <p>待处理认领</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon completed">
              <CheckIcon />
            </div>
            <div class="stat-content">
              <h3>{{ stats.completedClaims }}</h3>
              <p>已完成认领</p>
            </div>
          </div>
        </div>

        <div class="recent-section">
          <h2>最近活动</h2>
          <div class="recent-items">
            <div v-for="item in recentItems" :key="item.id" class="recent-item">
              <div class="recent-item-info">
                <h4>{{ item.title }}</h4>
                <p>{{ item.description }}</p>
                <span class="recent-item-time">{{ formatDate(item.createdAt) }}</span>
              </div>
              <div class="recent-item-status">
                <span :class="['status-badge', getStatusVariant(item.status)]">
                  {{ translateLostItemStatus(item.status).label }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 失物管理 -->
      <div v-else-if="activeTab === 'items'" class="items-management">
        <div class="management-header">
          <h1>失物管理</h1>
          <div class="management-actions">
            <input
              v-model="itemSearchKeyword"
              type="text"
              placeholder="搜索失物..."
              class="search-input"
              @keyup.enter="searchItems"
            />
            <button @click="searchItems" class="search-btn">搜索</button>
          </div>
        </div>

        <div class="items-table-container">
          <table class="items-table">
            <thead>
              <tr>
                <th>标题</th>
                <th>描述</th>
                <th>发现地点</th>
                <th>状态</th>
                <th>发布时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in store.items" :key="item.id">
                <td class="item-title">{{ item.title }}</td>
                <td class="item-description">{{ item.description }}</td>
                <td>{{ item.location }}</td>
                <td>
                  <span :class="['status-badge', getStatusVariant(item.status)]">
                    {{ translateLostItemStatus(item.status).label }}
                  </span>
                </td>
                <td>{{ formatDate(item.createdAt) }}</td>
                <td class="item-actions">
                  <button @click="editItem(item)" class="action-btn edit-btn">编辑</button>
                  <button @click="deleteItem(item)" class="action-btn delete-btn">删除</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 认领管理 -->
      <div v-else-if="activeTab === 'claims'" class="claims-management">
        <div class="management-header">
          <h1>认领管理</h1>
          <div class="filter-tabs">
            <button
              v-for="status in claimStatuses"
              :key="status.value"
              :class="['filter-tab', { active: claimFilter === status.value }]"
              @click="claimFilter = status.value"
            >
              {{ status.label }}
            </button>
          </div>
        </div>

        <div class="claims-list">
          <div v-for="claim in filteredClaims" :key="claim.id" class="claim-card">
            <div class="claim-header">
              <h3>{{ claim.lostItem?.title || '失物信息缺失' }}</h3>
              <span :class="['status-badge', getClaimStatusVariant(claim.status)]">
                {{ translateClaimStatus(claim.status).label }}
              </span>
            </div>
            <div class="claim-content">
              <div class="claim-info">
                <p><strong>认领人：</strong>{{ claim.claimerName }}</p>
                <p><strong>联系方式：</strong>{{ claim.claimerContact }}</p>
                <p><strong>认领理由：</strong>{{ claim.reason }}</p>
                <p><strong>申请时间：</strong>{{ formatDate(claim.createdAt) }}</p>
              </div>
              <div class="claim-actions" v-if="claim.status === 'PENDING'">
                <button @click="approveClaim(claim)" class="action-btn approve-btn">通过</button>
                <button @click="rejectClaim(claim)" class="action-btn reject-btn">驳回</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 编辑失物弹窗 -->
    <EditItemModal
      v-if="editingItem"
      :item="editingItem"
      @close="editingItem = null"
      @submit="handleEditSubmit"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import { useLostFoundStore } from '@/stores/useLostFoundStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { formatDate, translateLostItemStatus, translateClaimStatus } from '@/utils/formatters'
import EditItemModal from '@/components/EditItemModal.vue'

// 图标组件
const DashboardIcon = () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' }, [
  h('rect', { x: 3, y: 3, width: 7, height: 7 }),
  h('rect', { x: 14, y: 3, width: 7, height: 7 }),
  h('rect', { x: 14, y: 14, width: 7, height: 7 }),
  h('rect', { x: 3, y: 14, width: 7, height: 7 })
])

const PackageIcon = () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' }, [
  h('line', { x1: 16.5, y1: 9.4, x2: 7.5, y2: 4.21 }),
  h('path', { d: 'm21 16-4 2-4-2' }),
  h('path', { d: 'm21 8-4 2-4-2' }),
  h('path', { d: 'm5 12-4 2-4-2' }),
  h('path', { d: 'm9 12 4 2 4-2' }),
  h('path', { d: 'm17 12 4 2-4 2-4-2' }),
  h('path', { d: 'm13 12-4-2-4 2' })
])

const ClipboardIcon = () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' }, [
  h('rect', { width: 8, height: 4, x: 8, y: 2, rx: 1, ry: 1 }),
  h('path', { d: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2' })
])

const UserCheckIcon = () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' }, [
  h('path', { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' }),
  h('circle', { cx: 9, cy: 7, r: 4 }),
  h('polyline', { points: '16,11 18,13 22,9' })
])

const SearchIcon = () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' }, [
  h('circle', { cx: 11, cy: 11, r: 8 }),
  h('path', { d: 'm21 21-4.35-4.35' })
])

const ClockIcon = () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' }, [
  h('circle', { cx: 12, cy: 12, r: 10 }),
  h('polyline', { points: '12,6 12,12 16,14' })
])

const CheckIcon = () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' }, [
  h('polyline', { points: '20,6 9,17 4,12' })
])

const RefreshIcon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' }, [
  h('path', { d: 'M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8' }),
  h('path', { d: 'M21 3v5h-5' }),
  h('path', { d: 'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16' }),
  h('path', { d: 'M8 16l-5-5 5-5' })
])

const UserIcon = () => h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' }, [
  h('path', { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }),
  h('circle', { cx: 12, cy: 7, r: 4 })
])

const LogOutIcon = () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' }, [
  h('path', { d: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' }),
  h('polyline', { points: '16,17 21,12 16,7' }),
  h('line', { x1: 21, y1: 12, x2: 9, y2: 12 })
])

const store = useLostFoundStore()
const authStore = useAuthStore()
const router = useRouter()

const activeTab = ref('dashboard')
const itemSearchKeyword = ref('')
const claimFilter = ref('all')
const editingItem = ref(null)

// 初始化用户状态
authStore.initFromStorage()

// 计算属性
const userName = computed(() => authStore.userName)
const userStudentId = computed(() => authStore.userStudentId)

const tabs = [
  { id: 'dashboard', name: '仪表盘', icon: DashboardIcon },
  { id: 'items', name: '失物管理', icon: PackageIcon },
  { id: 'claims', name: '认领管理', icon: UserCheckIcon }
]

const claimStatuses = [
  { value: 'all', label: '全部' },
  { value: 'PENDING', label: '待处理' },
  { value: 'APPROVED', label: '已通过' },
  { value: 'REJECTED', label: '已驳回' },
  { value: 'COMPLETED', label: '已完成' }
]

const stats = computed(() => {
  const items = store.items
  const claims = store.claims
  
  return {
    totalItems: items.length,
    availableItems: items.filter(item => item.status === 'AVAILABLE').length,
    pendingClaims: claims.filter(claim => claim.status === 'PENDING').length,
    completedClaims: claims.filter(claim => claim.status === 'COMPLETED').length
  }
})

const recentItems = computed(() => {
  return store.items
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
})

const filteredClaims = computed(() => {
  if (claimFilter.value === 'all') {
    return store.claims
  }
  return store.claims.filter(claim => claim.status === claimFilter.value)
})

onMounted(async () => {
  await refreshData()
})

async function refreshData() {
  try {
    await Promise.all([
      store.loadItems(),
      store.loadClaims()
    ])
  } catch (error) {
    console.error('刷新数据失败:', error)
  }
}

async function searchItems() {
  try {
    await store.loadItems(itemSearchKeyword.value.trim() || undefined)
  } catch (error) {
    console.error('搜索失败:', error)
  }
}

function editItem(item) {
  editingItem.value = { ...item }
}

async function deleteItem(item) {
  if (confirm(`确定要删除失物"${item.title}"吗？`)) {
    try {
      await store.removeItem(item.id)
      alert('删除成功')
    } catch (error) {
      console.error('删除失败:', error)
      alert('删除失败，请重试')
    }
  }
}

async function handleEditSubmit(data) {
  try {
    await store.editItem(editingItem.value.id, data)
    editingItem.value = null
    alert('更新成功')
  } catch (error) {
    console.error('更新失败:', error)
    alert('更新失败，请重试')
  }
}

async function approveClaim(claim) {
  if (confirm('确定要通过这个认领申请吗？')) {
    try {
      await store.changeClaimStatus(claim.id, 'APPROVED')
      alert('认领申请已通过')
    } catch (error) {
      console.error('操作失败:', error)
      alert('操作失败，请重试')
    }
  }
}

async function rejectClaim(claim) {
  if (confirm('确定要驳回这个认领申请吗？')) {
    try {
      await store.changeClaimStatus(claim.id, 'REJECTED')
      alert('认领申请已驳回')
    } catch (error) {
      console.error('操作失败:', error)
      alert('操作失败，请重试')
    }
  }
}

function handleLogout() {
  if (confirm('确定要登出吗？')) {
    authStore.logout()
    router.push('/login')
  }
}

function getStatusVariant(status) {
  return translateLostItemStatus(status).variant
}

function getClaimStatusVariant(status) {
  return translateClaimStatus(status).variant
}
</script>

<style scoped>
.admin-dashboard {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
}

.sidebar {
  width: 280px;
  background: white;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 2rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.sidebar-header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
}

.sidebar-header p {
  margin: 0;
  font-size: 0.875rem;
  color: #64748b;
}

.user-section {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 1rem;
  text-align: center;
}

.user-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin: 0 auto 0.75rem auto;
}

.user-info {
  text-align: center;
}

.user-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  display: block;
  margin-bottom: 0.25rem;
}

.user-role {
  font-size: 0.75rem;
  color: #667eea;
  font-weight: 500;
  display: block;
  margin-bottom: 0.25rem;
}

.user-id {
  font-size: 0.75rem;
  color: #64748b;
  display: block;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 0.875rem;
  color: #64748b;
}

.nav-item:hover {
  background: #f1f5f9;
}

.nav-item.active {
  background: #e0e7ff;
  color: #3730a3;
  font-weight: 500;
}

.logout-item {
  margin-top: auto;
  color: #dc2626 !important;
  border-top: 1px solid #e2e8f0;
  margin-top: 1rem;
  padding-top: 1rem;
}

.logout-item:hover {
  background: #fef2f2 !important;
  color: #dc2626 !important;
}

.nav-icon {
  flex-shrink: 0;
}

.main-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  margin: 0;
  font-size: 1.875rem;
  font-weight: 700;
  color: #1e293b;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.refresh-btn:hover {
  background: #2563eb;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  color: white;
}

.stat-icon.total { background: #3b82f6; }
.stat-icon.available { background: #10b981; }
.stat-icon.pending { background: #f59e0b; }
.stat-icon.completed { background: #8b5cf6; }

.stat-content h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.875rem;
  font-weight: 700;
  color: #1e293b;
}

.stat-content p {
  margin: 0;
  font-size: 0.875rem;
  color: #64748b;
}

.recent-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.recent-section h2 {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.recent-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.recent-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}

.recent-item-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 500;
  color: #1e293b;
}

.recent-item-info p {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  color: #64748b;
}

.recent-item-time {
  font-size: 0.75rem;
  color: #9ca3af;
}

.management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.management-header h1 {
  margin: 0;
  font-size: 1.875rem;
  font-weight: 700;
  color: #1e293b;
}

.management-actions {
  display: flex;
  gap: 0.5rem;
}

.search-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
}

.search-btn {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
}

.items-table-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.items-table {
  width: 100%;
  border-collapse: collapse;
}

.items-table th {
  background: #f8fafc;
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.items-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}

.item-title {
  font-weight: 500;
  color: #1f2937;
}

.item-description {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #6b7280;
}

.item-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 500;
}

.edit-btn {
  background: #3b82f6;
  color: white;
}

.delete-btn {
  background: #ef4444;
  color: white;
}

.approve-btn {
  background: #10b981;
  color: white;
}

.reject-btn {
  background: #ef4444;
  color: white;
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
}

.filter-tab {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.filter-tab:hover {
  background: #f9fafb;
}

.filter-tab.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.claims-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.claim-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.claim-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.claim-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
}

.claim-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.claim-info p {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  color: #4b5563;
}

.claim-actions {
  display: flex;
  gap: 0.5rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.neutral {
  background: #f3f4f6;
  color: #374151;
}

.status-badge.warning {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.success {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.danger {
  background: #fee2e2;
  color: #991b1b;
}
</style>
