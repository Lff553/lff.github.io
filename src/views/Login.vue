<template>
  <div class="login-container">
    <div class="login-card">
      <!-- 头部标题 -->
      <div class="header">
        <h1 class="title">杭州电子科技大学信息工程学院</h1>
        <h2 class="subtitle">校园失物招领系统</h2>
      </div>

      <!-- 登录表单 -->
      <div class="form-container">
        <div class="tab-buttons">
          <button 
            :class="['tab-btn', { active: !isRegister }]" 
            @click="isRegister = false"
          >
            登录
          </button>
          <button 
            :class="['tab-btn', { active: isRegister }]" 
            @click="isRegister = true"
          >
            注册
          </button>
        </div>

        <!-- 登录表单 -->
        <form v-if="!isRegister" @submit.prevent="handleLogin" class="form">
          <div class="form-group">
            <label for="loginStudentId">学号</label>
            <input
              id="loginStudentId"
              v-model="loginForm.studentId"
              type="text"
              placeholder="请输入学号"
              required
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="loginPassword">密码</label>
            <input
              id="loginPassword"
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              required
              class="form-input"
            />
          </div>

          <button type="submit" :disabled="isLoading" class="submit-btn">
            <span v-if="isLoading">登录中...</span>
            <span v-else>登录</span>
          </button>
        </form>

        <!-- 注册表单 -->
        <form v-else @submit.prevent="handleRegister" class="form">
          <div class="form-group">
            <label for="registerStudentId">学号</label>
            <input
              id="registerStudentId"
              v-model="registerForm.studentId"
              type="text"
              placeholder="请输入8-12位学号"
              required
              pattern="[0-9]{8,12}"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="registerName">姓名</label>
            <input
              id="registerName"
              v-model="registerForm.name"
              type="text"
              placeholder="请输入真实姓名"
              required
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="registerPassword">密码</label>
            <input
              id="registerPassword"
              v-model="registerForm.password"
              type="password"
              placeholder="请输入6-20位密码"
              required
              minlength="6"
              maxlength="20"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="confirmPassword">确认密码</label>
            <input
              id="confirmPassword"
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              required
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="registerPhone">手机号</label>
            <input
              id="registerPhone"
              v-model="registerForm.phone"
              type="tel"
              placeholder="请输入手机号（可选）"
              pattern="1[3-9]\d{9}"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="registerEmail">邮箱</label>
            <input
              id="registerEmail"
              v-model="registerForm.email"
              type="email"
              placeholder="请输入邮箱（可选）"
              class="form-input"
            />
          </div>

          <button type="submit" :disabled="isLoading" class="submit-btn">
            <span v-if="isLoading">注册中...</span>
            <span v-else>注册</span>
          </button>
        </form>

        <!-- 错误信息 -->
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <!-- 成功信息 -->
        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI } from '@/api/auth'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const isRegister = ref(false)
    const isLoading = ref(false)
    const errorMessage = ref('')
    const successMessage = ref('')

    const loginForm = reactive({
      studentId: '',
      password: ''
    })

    const registerForm = reactive({
      studentId: '',
      name: '',
      password: '',
      confirmPassword: '',
      phone: '',
      email: ''
    })

    const clearMessages = () => {
      errorMessage.value = ''
      successMessage.value = ''
    }

    const handleLogin = async () => {
      clearMessages()
      
      if (!loginForm.studentId || !loginForm.password) {
        errorMessage.value = '请填写完整的登录信息'
        return
      }

      isLoading.value = true

      try {
        const response = await authAPI.login({
          studentId: loginForm.studentId,
          password: loginForm.password
        })

        if (response.success) {
          successMessage.value = response.message
          
          // 保存用户信息到localStorage
          localStorage.setItem('user', JSON.stringify(response.user))
          localStorage.setItem('isLoggedIn', 'true')

          // 根据用户角色跳转到不同页面
          setTimeout(() => {
            if (response.user.role === 'ADMIN') {
              router.push('/admin')
            } else {
              router.push('/')
            }
          }, 1000)
        } else {
          errorMessage.value = response.message
        }
      } catch (error) {
        console.error('登录失败:', error)
        errorMessage.value = '登录失败，请检查网络连接'
      } finally {
        isLoading.value = false
      }
    }

    const handleRegister = async () => {
      clearMessages()

      // 表单验证
      if (!registerForm.studentId || !registerForm.name || !registerForm.password || !registerForm.confirmPassword) {
        errorMessage.value = '请填写完整的注册信息'
        return
      }

      if (registerForm.password !== registerForm.confirmPassword) {
        errorMessage.value = '两次输入的密码不一致'
        return
      }

      if (registerForm.password.length < 6 || registerForm.password.length > 20) {
        errorMessage.value = '密码长度应在6-20位之间'
        return
      }

      if (!/^[0-9]{8,12}$/.test(registerForm.studentId)) {
        errorMessage.value = '学号格式不正确，应为8-12位数字'
        return
      }

      if (registerForm.phone && !/^1[3-9]\d{9}$/.test(registerForm.phone)) {
        errorMessage.value = '手机号格式不正确'
        return
      }

      isLoading.value = true

      try {
        // 构建请求数据，过滤空字符串
        const requestData = {
          studentId: registerForm.studentId,
          name: registerForm.name,
          password: registerForm.password,
          confirmPassword: registerForm.confirmPassword
        }
        
        // 只有非空时才添加可选字段
        if (registerForm.phone && registerForm.phone.trim()) {
          requestData.phone = registerForm.phone.trim()
        }
        if (registerForm.email && registerForm.email.trim()) {
          requestData.email = registerForm.email.trim()
        }
        
        const response = await authAPI.register(requestData)

        if (response.success) {
          successMessage.value = response.message + '，请登录'
          
          // 清空注册表单
          Object.keys(registerForm).forEach(key => {
            registerForm[key] = ''
          })

          // 切换到登录表单
          setTimeout(() => {
            isRegister.value = false
            successMessage.value = ''
          }, 2000)
        } else {
          errorMessage.value = response.message
        }
      } catch (error) {
        console.error('注册失败:', error)
        errorMessage.value = '注册失败，请检查网络连接'
      } finally {
        isLoading.value = false
      }
    }

    return {
      isRegister,
      isLoading,
      errorMessage,
      successMessage,
      loginForm,
      registerForm,
      handleLogin,
      handleRegister
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 100%;
  max-width: 450px;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px 20px;
  text-align: center;
}

.title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.subtitle {
  font-size: 16px;
  font-weight: 400;
  margin: 0;
  opacity: 0.9;
}

.form-container {
  padding: 30px;
}

.tab-buttons {
  display: flex;
  margin-bottom: 30px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e1e5e9;
}

.tab-btn {
  flex: 1;
  padding: 12px;
  border: none;
  background: #f8f9fa;
  color: #6c757d;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn.active {
  background: #667eea;
  color: white;
}

.tab-btn:hover:not(.active) {
  background: #e9ecef;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-input {
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: white;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input::placeholder {
  color: #9ca3af;
}

.submit-btn {
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.error-message {
  background: #fee2e2;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  margin-top: 16px;
  border-left: 4px solid #dc2626;
}

.success-message {
  background: #d1fae5;
  color: #065f46;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  margin-top: 16px;
  border-left: 4px solid #10b981;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-container {
    padding: 10px;
  }
  
  .login-card {
    max-width: 100%;
  }
  
  .header {
    padding: 20px 15px;
  }
  
  .title {
    font-size: 18px;
  }
  
  .subtitle {
    font-size: 14px;
  }
  
  .form-container {
    padding: 20px;
  }
}
</style>
