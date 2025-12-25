<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>编辑失物信息</h2>
        <button @click="$emit('close')" class="close-btn">
          <XIcon />
        </button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="modal-form">
        <div class="form-group">
          <label for="title">失物标题 *</label>
          <input
            id="title"
            v-model="form.title"
            type="text"
            placeholder="请输入失物标题"
            required
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label for="description">详细描述 *</label>
          <textarea
            id="description"
            v-model="form.description"
            placeholder="请详细描述失物的特征、颜色、大小等信息"
            required
            rows="4"
            class="form-textarea"
          ></textarea>
        </div>
        
        <div class="form-group">
          <label for="location">发现地点 *</label>
          <input
            id="location"
            v-model="form.location"
            type="text"
            placeholder="请输入发现失物的具体地点"
            required
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label for="finderName">发现人姓名 *</label>
          <input
            id="finderName"
            v-model="form.finderName"
            type="text"
            placeholder="请输入发现人姓名"
            required
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label for="finderContact">联系方式 *</label>
          <input
            id="finderContact"
            v-model="form.finderContact"
            type="text"
            placeholder="请输入联系方式"
            required
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label for="image">失物照片</label>
          <div class="image-upload-area">
            <input
              id="image"
              ref="fileInput"
              type="file"
              accept="image/*"
              @change="handleImageSelect"
              class="file-input"
            />
            <div v-if="!imagePreview" class="upload-placeholder" @click="triggerFileInput">
              <div class="upload-icon">📷</div>
              <div class="upload-text">点击上传失物照片</div>
              <div class="upload-hint">支持 JPG、PNG 格式，最大 10MB</div>
            </div>
            <div v-else class="image-preview">
              <img :src="imagePreview" alt="失物照片预览" class="preview-image" />
              <div class="image-actions">
                <button type="button" @click="triggerFileInput" class="change-btn">更换</button>
                <button type="button" @click="removeImage" class="remove-btn">删除</button>
              </div>
            </div>
          </div>
          <div v-if="uploadError" class="error-message">{{ uploadError }}</div>
        </div>
        
        <div class="form-group">
          <label for="publishTime">发布时间</label>
          <input
            id="publishTime"
            v-model="form.publishTime"
            type="datetime-local"
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label for="status">状态</label>
          <select
            id="status"
            v-model="form.status"
            class="form-select"
          >
            <option value="AVAILABLE">可认领</option>
            <option value="PENDING_REVIEW">审核中</option>
            <option value="CLAIMED">已认领</option>
            <option value="RETURNED">已归还</option>
          </select>
        </div>
        
        <div class="form-actions">
          <button type="button" @click="$emit('close')" class="cancel-btn">
            取消
          </button>
          <button type="submit" :disabled="submitting" class="submit-btn">
            {{ submitting ? '保存中...' : '保存修改' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, h } from 'vue'
import { uploadImage } from '../api/lostFound'

const XIcon = () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' }, [
  h('line', { x1: 18, y1: 6, x2: 6, y2: 18 }),
  h('line', { x1: 6, y1: 6, x2: 18, y2: 18 })
])

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'submit'])

const submitting = ref(false)
const fileInput = ref(null)
const imagePreview = ref('')
const uploadError = ref('')
const selectedFile = ref(null)

const form = reactive({
  title: '',
  description: '',
  location: '',
  finderName: '',
  finderContact: '',
  publishTime: '',
  status: 'AVAILABLE',
  imageUrl: ''
})

// 将ISO时间字符串转换为datetime-local格式
function formatDateTimeForInput(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ''
  
  // 转换为本地时间的ISO字符串，去掉秒和毫秒部分
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function triggerFileInput() {
  fileInput.value?.click()
}

function handleImageSelect(event) {
  const file = event.target.files[0]
  if (!file) return
  
  uploadError.value = ''
  
  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    uploadError.value = '请选择图片文件'
    return
  }
  
  // 验证文件大小 (10MB)
  if (file.size > 10 * 1024 * 1024) {
    uploadError.value = '图片大小不能超过10MB'
    return
  }
  
  selectedFile.value = file
  
  // 创建预览
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

function removeImage() {
  imagePreview.value = ''
  selectedFile.value = null
  form.imageUrl = ''
  uploadError.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

async function uploadSelectedImage() {
  if (!selectedFile.value) return null
  
  try {
    const result = await uploadImage(selectedFile.value)
    return result.url
  } catch (error) {
    uploadError.value = '图片上传失败: ' + (error.response?.data?.error || error.message)
    throw error
  }
}

// 当item变化时，更新表单数据
watch(() => props.item, (newItem) => {
  if (newItem) {
    Object.assign(form, {
      title: newItem.title || '',
      description: newItem.description || '',
      location: newItem.location || '',
      finderName: newItem.finderName || '',
      finderContact: newItem.finderContact || '',
      publishTime: formatDateTimeForInput(newItem.createdAt),
      status: newItem.status || 'AVAILABLE',
      imageUrl: newItem.imageUrl || ''
    })
    
    // 如果有现有图片，显示预览
    if (newItem.imageUrl) {
      imagePreview.value = newItem.imageUrl
      selectedFile.value = null // 清除选择的文件，因为这是现有图片
    } else {
      imagePreview.value = ''
      selectedFile.value = null
    }
  }
}, { immediate: true })

async function handleSubmit() {
  if (submitting.value) return
  
  submitting.value = true
  uploadError.value = ''
  
  try {
    // 如果有选择的新图片，先上传
    if (selectedFile.value) {
      const imageUrl = await uploadSelectedImage()
      form.imageUrl = imageUrl
    }
    
    await new Promise(resolve => setTimeout(resolve, 500)) // 模拟网络延迟
    
    // 准备提交数据，将publishTime转换为ISO格式
    const submitData = { ...form }
    if (submitData.publishTime) {
      // 将datetime-local格式转换为ISO字符串
      const localDate = new Date(submitData.publishTime)
      submitData.createdAt = localDate.toISOString()
    }
    
    emit('submit', submitData)
  } catch (error) {
    // 错误已经在uploadSelectedImage中处理
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
.form-textarea,
.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-select {
  background: white;
  cursor: pointer;
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

/* 图片上传样式 */
.image-upload-area {
  position: relative;
}

.file-input {
  display: none;
}

.upload-placeholder {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #f9fafb;
}

.upload-placeholder:hover {
  border-color: #667eea;
  background: #f0f4ff;
}

.upload-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.upload-text {
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
}

.upload-hint {
  font-size: 0.75rem;
  color: #6b7280;
}

.image-preview {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: #f3f4f6;
}

.preview-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.image-actions {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.5rem;
}

.change-btn,
.remove-btn {
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.change-btn {
  background: rgba(59, 130, 246, 0.9);
  color: white;
}

.change-btn:hover {
  background: rgba(59, 130, 246, 1);
}

.remove-btn {
  background: rgba(239, 68, 68, 0.9);
  color: white;
}

.remove-btn:hover {
  background: rgba(239, 68, 68, 1);
}

.error-message {
  margin-top: 0.5rem;
  color: #ef4444;
  font-size: 0.75rem;
}
</style>
