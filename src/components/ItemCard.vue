<template>
  <div class="item-card" @click="$emit('click', item)">
    <div v-if="item.imageUrl" class="item-image">
      <img :src="item.imageUrl" :alt="item.title" class="image" />
    </div>
    
    <div class="item-header">
      <h3 class="item-title">{{ item.title }}</h3>
      <span :class="['status-badge', statusInfo.variant]">
        {{ statusInfo.label }}
      </span>
    </div>
    
    <div class="item-content">
      <p class="item-description">{{ item.description }}</p>
      <div class="item-meta">
        <div class="meta-item">
          <LocationIcon class="meta-icon" />
          <span>{{ item.location }}</span>
        </div>
        <div class="meta-item">
          <CalendarIcon class="meta-icon" />
          <span>{{ formatDate(item.createdAt) }}</span>
        </div>
      </div>
    </div>
    
    <div class="item-footer" v-if="item.status === 'AVAILABLE'">
      <button 
        @click.stop="$emit('claim', item)" 
        class="claim-btn"
      >
        <HandIcon class="btn-icon" />
        我要认领
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, h } from 'vue'
import { formatDate, translateLostItemStatus } from '@/utils/formatters'

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

defineEmits(['click', 'claim'])

const statusInfo = computed(() => translateLostItemStatus(props.item.status))
</script>

<style scoped>
.item-card {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #e5e7eb;
}

.item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.item-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.4;
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
  color: #6b7280;
  font-size: 0.9rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.meta-icon {
  flex-shrink: 0;
  opacity: 0.7;
}

.item-footer {
  border-top: 1px solid #e5e7eb;
  padding-top: 0.75rem;
}

.claim-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.claim-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-icon {
  flex-shrink: 0;
}

.item-image {
  margin-bottom: 1rem;
  border-radius: 8px;
  overflow: hidden;
}

.image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  display: block;
}
</style>
