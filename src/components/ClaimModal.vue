<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>认领失物</h2>
        <button @click="$emit('close')" class="close-btn">
          <XIcon />
        </button>
      </div>
      
      <div class="item-summary">
        <h3>{{ item.title }}</h3>
        <p>{{ item.description }}</p>
        <div class="item-meta">
          <span><LocationIcon class="meta-icon" />{{ item.location }}</span>
          <span><CalendarIcon class="meta-icon" />{{ formatDate(item.createdAt) }}</span>
        </div>
      </div>
      
      <form @submit.prevent="handleSubmit" class="modal-form">
        <div class="form-group">
          <label for="claimerName">您的姓名 *</label>
          <input
            id="claimerName"
            v-model="form.claimerName"
            type="text"
            placeholder="请输入您的真实姓名"
            required
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label for="claimerContact">联系方式 *</label>
          <input
            id="claimerContact"
            v-model="form.claimerContact"
            type="text"
            placeholder="请输入手机号或微信号"
            required
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label for="reason">认领理由 *</label>
          <textarea
            id="reason"
            v-model="form.reason"
            placeholder="请详细说明您认领此物品的理由，如：物品特征、丢失时间地点等"
            required
            rows="4"
            class="form-textarea"
          ></textarea>
        </div>
        
        <div class="notice">
          <InfoIcon class="notice-icon" />
          <div class="notice-content">
            <h4>认领须知</h4>
            <ul>
              <li>请确保您提供的信息真实有效</li>
              <li>认领申请提交后，管理员会进行审核</li>
              <li>审核通过后，请联系发现人进行物品交接</li>
              <li>恶意认领将承担相应法律责任</li>
            </ul>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" @click="$emit('close')" class="cancel-btn">
            取消
          </button>
          <button type="submit" :disabled="submitting" class="submit-btn">
            {{ submitting ? '提交中...' : '提交认领申请' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, h } from 'vue'
import { formatDate } from '@/utils/formatters'

const XIcon = () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' }, [
  h('line', { x1: 18, y1: 6, x2: 6, y2: 18 }),
  h('line', { x1: 6, y1: 6, x2: 18, y2: 18 })
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

const InfoIcon = () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' }, [
  h('circle', { cx: 12, cy: 12, r: 10 }),
  h('line', { x1: 12, y1: 16, x2: 12, y2: 12 }),
  h('line', { x1: 12, y1: 8, x2: 12.01, y2: 8 })
])

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'submit'])

const submitting = ref(false)

const form = reactive({
  claimerName: '',
  claimerContact: '',
  reason: ''
})

async function handleSubmit() {
  if (submitting.value) return
  
  submitting.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500)) // 模拟网络延迟
    emit('submit', { ...form })
  } finally {
    submitting.value = false
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
  max-width: 500px;
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

.item-summary {
  margin: 0 1.5rem 1.5rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.item-summary h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.item-summary p {
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

.modal-form {
  padding: 0 1.5rem 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.notice {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: #fffbeb;
  border: 1px solid #fbbf24;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.notice-icon {
  flex-shrink: 0;
  color: #f59e0b;
  margin-top: 0.125rem;
}

.notice-content h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #92400e;
}

.notice-content ul {
  margin: 0;
  padding-left: 1rem;
  font-size: 0.75rem;
  color: #92400e;
  line-height: 1.5;
}

.notice-content li {
  margin-bottom: 0.25rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-btn,
.submit-btn {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: #f3f4f6;
  color: #374151;
}

.cancel-btn:hover {
  background: #e5e7eb;
}

.submit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
