<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>失物详情</h2>
        <button @click="$emit('close')" class="close-btn">
          <XIcon />
        </button>
      </div>
      
      <div class="item-detail">
        <div class="detail-header">
          <h3 class="item-title">{{ item.title }}</h3>
          <span :class="['status-badge', statusInfo.variant]">
            {{ statusInfo.label }}
          </span>
        </div>
        
        <div class="detail-content">
          <div class="detail-section">
            <h4>详细描述</h4>
            <p>{{ item.description }}</p>
          </div>
          
          <div class="detail-section">
            <h4>发现信息</h4>
            <div class="info-grid">
              <div class="info-item">
                <LocationIcon class="info-icon" />
                <div>
                  <span class="info-label">发现地点</span>
                  <span class="info-value">{{ item.location }}</span>
                </div>
              </div>
              <div class="info-item">
                <CalendarIcon class="info-icon" />
                <div>
                  <span class="info-label">发现时间</span>
                  <span class="info-value">{{ formatDate(item.createdAt) }}</span>
                </div>
              </div>
              <div class="info-item">
                <UserIcon class="info-icon" />
                <div>
                  <span class="info-label">发现人</span>
                  <span class="info-value">{{ item.finderName }}</span>
                </div>
              </div>
              <div class="info-item">
                <PhoneIcon class="info-icon" />
                <div>
                  <span class="info-label">联系方式</span>
                  <span class="info-value">{{ item.finderContact }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="item.claims && item.claims.length > 0" class="detail-section">
            <h4>认领记录</h4>
            <div class="claims-list">
              <div v-for="claim in item.claims" :key="claim.id" class="claim-item">
                <div class="claim-info">
                  <span class="claim-name">{{ claim.claimerName }}</span>
                  <span class="claim-time">{{ formatDate(claim.createdAt) }}</span>
                </div>
                <span :class="['claim-status', getClaimStatusVariant(claim.status)]">
                  {{ translateClaimStatus(claim.status).label }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="detail-actions" v-if="item.status === 'AVAILABLE'">
          <button @click="$emit('claim', item)" class="claim-btn">
            <HandIcon class="btn-icon" />
            我要认领
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatDate, translateLostItemStatus, translateClaimStatus } from '@/utils/formatters'

const XIcon = () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' }, [
  h('line', { x1: 18, y1: 6, x2: 6, y2: 18 }),
  h('line', { x1: 6, y1: 6, x2: 18, y2: 18 })
])

const LocationIcon = () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' }, [
  h('path', { d: 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z' }),
  h('circle', { cx: 12, cy: 10, r: 3 })
])

const CalendarIcon = () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' }, [
  h('rect', { width: 18, height: 18, x: 3, y: 4, rx: 2, ry: 2 }),
  h('line', { x1: 16, x2: 16, y1: 2, y2: 6 }),
  h('line', { x1: 8, x2: 8, y1: 2, y2: 6 }),
  h('line', { x1: 3, x2: 21, y1: 10, y2: 10 })
])

const UserIcon = () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' }, [
  h('path', { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }),
  h('circle', { cx: 12, cy: 7, r: 4 })
])

const PhoneIcon = () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' }, [
  h('path', { d: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z' })
])

const HandIcon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' }, [
  h('path', { d: 'M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0' }),
  h('path', { d: 'M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2' }),
  h('path', { d: 'M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8' }),
  h('path', { d: 'M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15' })
])

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

defineEmits(['close', 'claim'])

const statusInfo = computed(() => translateLostItemStatus(props.item.status))

function getClaimStatusVariant(status) {
  return translateClaimStatus(status).variant
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
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 0;
  margin-bottom: 1rem;
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

.item-detail {
  padding: 0 1.5rem 1.5rem;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.item-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.4;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
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

.detail-section {
  margin-bottom: 2rem;
}

.detail-section h4 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.detail-section p {
  margin: 0;
  color: #4b5563;
  line-height: 1.6;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
}

.info-icon {
  flex-shrink: 0;
  color: #6b7280;
}

.info-label {
  display: block;
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.info-value {
  display: block;
  font-weight: 500;
  color: #1f2937;
}

.claims-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.claim-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
}

.claim-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.claim-name {
  font-weight: 500;
  color: #1f2937;
}

.claim-time {
  font-size: 0.875rem;
  color: #6b7280;
}

.claim-status {
  padding: 0.25rem 0.75rem;
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

.detail-actions {
  border-top: 1px solid #e5e7eb;
  padding-top: 1.5rem;
}

.claim-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 1rem;
  transition: all 0.2s;
}

.claim-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-icon {
  flex-shrink: 0;
}
</style>
