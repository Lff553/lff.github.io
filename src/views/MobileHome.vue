<template>
  <div class="mobile-home">
    <!-- 头部 -->
    <header class="header">
      <div class="header-content">
        <div class="header-main">
          <h2 class="subtitle">校园失物招领系统</h2>
        </div>
        <div class="user-info">
          <div class="user-details">
            <span class="user-name">{{ userName }}</span>
            <span class="user-id">{{ userStudentId }}</span>
          </div>
          <button @click="handleLogout" class="logout-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16,17 21,12 16,7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            登出
          </button>
        </div>
      </div>
    </header>

    <!-- 搜索栏 -->
    <div class="search-section">
      <div class="search-box">
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="搜索失物信息..."
          class="search-input"
          @keyup.enter="handleSearch"
        />
        <button @click="handleSearch" class="search-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- 快捷操作 -->
    <div class="quick-actions">
      <button @click="showReportModal = true" class="action-btn report-btn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="16"></line>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
        发布失物
      </button>
      <button @click="showMyItems = true" class="action-btn my-items-btn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        我的发布
      </button>
    </div>

    <!-- 失物列表 -->
    <div class="items-section">
      <div class="section-header">
        <h3>最新失物</h3>
        <span class="item-count">共 {{ store.itemCount }} 件</span>
      </div>

      <!-- 加载状态 -->
      <div v-if="store.loading" class="loading">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="store.error" class="error">
        <p>{{ store.error }}</p>
        <button @click="loadItems" class="retry-btn">重试</button>
      </div>

      <!-- 空状态 -->
      <div v-else-if="store.isEmpty" class="empty">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="16"></line>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
        <p>暂无失物信息</p>
        <button @click="showReportModal = true" class="empty-action-btn">发布第一个失物</button>
      </div>

      <!-- 失物列表 -->
      <div v-else class="items-list">
        <ItemCard
          v-for="item in store.items"
          :key="item.id"
          :item="item"
          @click="showItemDetail(item)"
          @claim="handleClaim"
        />
      </div>
    </div>

    <!-- 发布失物弹窗 -->
    <ReportModal
      v-if="showReportModal"
      @close="showReportModal = false"
      @submit="handleReportSubmit"
    />

    <!-- 失物详情弹窗 -->
    <ItemDetailModal
      v-if="selectedItem"
      :item="selectedItem"
      @close="selectedItem = null"
      @claim="handleClaim"
    />

    <!-- 我的发布弹窗 -->
    <MyItemsModal
      v-if="showMyItems"
      @close="showMyItems = false"
    />

    <!-- 认领弹窗 -->
    <ClaimModal
      v-if="claimingItem"
      :item="claimingItem"
      @close="claimingItem = null"
      @submit="handleClaimSubmit"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

import { useLostFoundStore } from '@/stores/useLostFoundStore'
import { useAuthStore } from '@/stores/useAuthStore'
import ItemCard from '@/components/ItemCard.vue'
import ReportModal from '@/components/ReportModal.vue'
import ItemDetailModal from '@/components/ItemDetailModal.vue'
import MyItemsModal from '@/components/MyItemsModal.vue'
import ClaimModal from '@/components/ClaimModal.vue'

const store = useLostFoundStore()
const authStore = useAuthStore()
const router = useRouter()

const searchKeyword = ref('')
const showReportModal = ref(false)
const showMyItems = ref(false)
const selectedItem = ref(null)
const claimingItem = ref(null)

// 初始化用户状态
authStore.initFromStorage()

// 计算属性
const userName = computed(() => authStore.userName)
const userStudentId = computed(() => authStore.userStudentId)

onMounted(() => {
  loadItems()
})

async function loadItems() {
  try {
    await store.loadItems()
  } catch (error) {
    console.error('加载失物列表失败:', error)
  }
}

async function handleSearch() {
  try {
    await store.loadItems(searchKeyword.value.trim() || undefined)
  } catch (error) {
    console.error('搜索失败:', error)
  }
}

function showItemDetail(item) {
  selectedItem.value = item
}

function handleClaim(item) {
  claimingItem.value = item
}

async function handleReportSubmit(data) {
  try {
    await store.createItem(data)
    showReportModal.value = false
    // 显示成功提示
    alert('发布成功！')
  } catch (error) {
    console.error('发布失败:', error)
    alert('发布失败，请重试')
  }
}

async function handleClaimSubmit(data) {
  try {
    await store.createClaim(claimingItem.value.id, data)
    claimingItem.value = null
    alert('认领申请提交成功！')
  } catch (error) {
    console.error('认领申请失败:', error)
    alert('认领申请失败，请重试')
  }
}

function handleLogout() {
  if (confirm('确定要登出吗？')) {
    authStore.logout()
    router.push('/login')
  }
}
</script>

<style scoped>
.mobile-home {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-bottom: 2rem;
}

.header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 2rem 1rem 1.5rem;
  color: white;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.header-main {
  text-align: center;
  flex: 1;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: white;
}

.user-details {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.user-name {
  font-size: 1rem;
  font-weight: 600;
}

.user-id {
  font-size: 0.875rem;
  opacity: 0.8;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.subtitle {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.search-section {
  padding: 1rem;
}

.search-box {
  display: flex;
  background: white;
  border-radius: 25px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  outline: none;
  font-size: 1rem;
}

.search-btn {
  padding: 0.75rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-btn:hover {
  background: #5a6fd8;
}

.quick-actions {
  display: flex;
  gap: 1rem;
  padding: 0 1rem 1rem;
}

.action-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-size: 0.9rem;
  font-weight: 500;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.report-btn {
  color: #10b981;
}

.my-items-btn {
  color: #3b82f6;
}

.items-section {
  background: white;
  margin: 0 1rem;
  border-radius: 16px;
  padding: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.section-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
}

.item-count {
  font-size: 0.9rem;
  color: #6b7280;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  color: #6b7280;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  text-align: center;
  padding: 2rem;
  color: #ef4444;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 2rem;
  color: #6b7280;
  text-align: center;
}

.empty svg {
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty p {
  margin: 0 0 1.5rem 0;
  font-size: 1.1rem;
}

.empty-action-btn {
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
