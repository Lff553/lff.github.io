<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>我的发布</h2>
        <button @click="$emit('close')" class="close-btn">
          <XIcon />
        </button>
      </div>
      
      <div class="modal-body">
        <div class="filter-tabs">
          <button
            v-for="status in statusFilters"
            :key="status.value"
            :class="['filter-tab', { active: activeFilter === status.value }]"
            @click="activeFilter = status.value"
          >
            {{ status.label }}
          </button>
        </div>
        
        <div class="items-list">
          <div v-if="filteredItems.length === 0" class="empty-state">
            <PackageIcon class="empty-icon" />
            <p>暂无相关失物</p>
          </div>
          
          <div v-else>
            <div v-for="item in filteredItems" :key="item.id" class="item-card">
              <div class="item-header">
                <h3>{{ item.title }}</h3>
                <span :class="['status-badge', getStatusVariant(item.status)]">
                  {{ translateLostItemStatus(item.status).label }}
                </span>
              </div>
              
              <div class="item-content">
                <p class="item-description">{{ item.description }}</p>
                <div class="item-meta">
                  <span><LocationIcon class="meta-icon" />{{ item.location }}</span>
                  <span><CalendarIcon class="meta-icon" />{{ formatDate(item.createdAt) }}</span>
                </div>
              </div>
              
              <div v-if="item.claims && item.claims.length > 0" class="item-claims">
                <h4>认领记录 ({{ item.claims.length }})</h4>
                <div class="claims-list">
                  <div v-for="claim in item.claims.slice(0, 3)" :key="claim.id" class="claim-item">
                    <div class="claim-info">
                      <span class="claim-name">{{ claim.claimerName }}</span>
                      <span class="claim-contact">{{ claim.claimerContact }}</span>
                    </div>
                    <span :class="['claim-status', getClaimStatusVariant(claim.status)]">
                      {{ translateClaimStatus(claim.status).label }}
                    </span>
                  </div>
                  <div v-if="item.claims.length > 3" class="more-claims">
                    还有 {{ item.claims.length - 3 }} 条认领记录...
                  </div>
                </div>
              </div>
              
              <div class="item-actions">
                <button @click="editItem(item)" class="action-btn edit-btn">
                  <EditIcon class="btn-icon" />
                  编辑
                </button>
                <button @click="deleteItem(item)" class="action-btn delete-btn">
                  <TrashIcon class="btn-icon" />
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 编辑弹窗 -->
    <EditItemModal
      v-if="showEditModal && editingItem"
      :item="editingItem"
      @close="closeEditModal"
      @submit="handleEditSubmit"
    />
  </div>
</template>

<script setup>
import { ref, computed, h, onMounted } from 'vue'
import { useLostFoundStore } from '@/stores/useLostFoundStore'
import { formatDate, translateLostItemStatus, translateClaimStatus } from '@/utils/formatters'
import EditItemModal from './EditItemModal.vue'

const XIcon = () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' }, [
  h('line', { x1: 18, y1: 6, x2: 6, y2: 18 }),
  h('line', { x1: 6, y1: 6, x2: 18, y2: 18 })
])

const PackageIcon = () => h('svg', { width: 48, height: 48, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' }, [
  h('line', { x1: 16.5, y1: 9.4, x2: 7.5, y2: 4.21 }),
  h('path', { d: 'm21 16-4 2-4-2' }),
  h('path', { d: 'm21 8-4 2-4-2' }),
  h('path', { d: 'm5 12-4 2-4-2' }),
  h('path', { d: 'm9 12 4 2 4-2' }),
  h('path', { d: 'm17 12 4 2-4 2-4-2' }),
  h('path', { d: 'm13 12-4-2-4 2' })
])

const LocationIcon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' }, [
  h('path', { d: 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z' }),
  h('circle', { cx: 12, cy: 10, r: 3 })
])

const CalendarIcon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' }, [
  h('rect', { width: 18, height: 18, x: 3, y: 4, rx: 2, ry: 2 }),
  h('line', { x1: 16, x2: 16, y1: 2, y2: 6 }),
  h('line', { x1: 8, x2: 8, y1: 2, y2: 6 }),
  h('line', { x1: 3, x2: 21, y1: 10, y2: 10 })
])

const EditIcon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' }, [
  h('path', { d: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' }),
  h('path', { d: 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' })
])

const TrashIcon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' }, [
  h('polyline', { points: '3,6 5,6 21,6' }),
  h('path', { d: 'm19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2' })
])

defineEmits(['close'])

const store = useLostFoundStore()
const activeFilter = ref('all')
const showEditModal = ref(false)
const editingItem = ref(null)

onMounted(async () => {
  try {
    await store.loadMyItems()
  } catch (error) {
    console.error('加载我的发布失败:', error)
  }
})

const statusFilters = [
  { value: 'all', label: '全部' },
  { value: 'AVAILABLE', label: '可认领' },
  { value: 'PENDING_REVIEW', label: '审核中' },
  { value: 'CLAIMED', label: '已认领' },
  { value: 'RETURNED', label: '已归还' }
]

// 获取用户发布的失物
const myItems = computed(() => {
  return store.myItems
})

const filteredItems = computed(() => {
  if (activeFilter.value === 'all') {
    return myItems.value
  }
  return myItems.value.filter(item => item.status === activeFilter.value)
})

function getStatusVariant(status) {
  return translateLostItemStatus(status).variant
}

function getClaimStatusVariant(status) {
  return translateClaimStatus(status).variant
}

async function editItem(item) {
  editingItem.value = { ...item }
  showEditModal.value = true
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

function closeEditModal() {
  showEditModal.value = false
  editingItem.value = null
}

async function handleEditSubmit(formData) {
  try {
    await store.editItem(editingItem.value.id, formData)
    closeEditModal()
    alert('修改成功')
  } catch (error) {
    console.error('修改失败:', error)
    alert('修改失败，请重试')
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.filter-tab {
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
  color: #6b7280;
}

.filter-tab:hover {
  background: #e5e7eb;
}

.filter-tab.active {
  background: #667eea;
  color: white;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 2rem;
  color: #6b7280;
  text-align: center;
}

.empty-icon {
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 1.1rem;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.item-card {
  background: #f9fafb;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.item-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  flex-shrink: 0;
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

.item-content {
  margin-bottom: 1rem;
}

.item-description {
  margin: 0 0 0.75rem 0;
  color: #4b5563;
  line-height: 1.5;
}

.item-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.item-meta span {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.meta-icon {
  flex-shrink: 0;
}

.item-claims {
  margin-bottom: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.item-claims h4 {
  margin: 0 0 0.75rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.claims-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.claim-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 6px;
}

.claim-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.claim-name {
  font-weight: 500;
  color: #1f2937;
  font-size: 0.875rem;
}

.claim-contact {
  font-size: 0.75rem;
  color: #6b7280;
}

.claim-status {
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.claim-status.neutral {
  background: #f3f4f6;
  color: #374151;
}

.claim-status.warning {
  background: #fef3c7;
  color: #92400e;
}

.claim-status.success {
  background: #d1fae5;
  color: #065f46;
}

.claim-status.danger {
  background: #fee2e2;
  color: #991b1b;
}

.more-claims {
  padding: 0.5rem 0.75rem;
  text-align: center;
  font-size: 0.75rem;
  color: #6b7280;
  font-style: italic;
}

.item-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}

.edit-btn {
  background: #3b82f6;
  color: white;
}

.edit-btn:hover {
  background: #2563eb;
}

.delete-btn {
  background: #ef4444;
  color: white;
}

.delete-btn:hover {
  background: #dc2626;
}

.btn-icon {
  flex-shrink: 0;
}
</style>
