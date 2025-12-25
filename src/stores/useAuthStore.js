import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref(null)
  const isLoggedIn = ref(false)

  // 计算属性
  const isAdmin = computed(() => {
    return user.value?.role === 'ADMIN'
  })

  const isStudent = computed(() => {
    return user.value?.role === 'STUDENT'
  })

  const userName = computed(() => {
    return user.value?.name || ''
  })

  const userStudentId = computed(() => {
    return user.value?.studentId || ''
  })

  // 方法
  const login = (userData) => {
    user.value = userData
    isLoggedIn.value = true
    
    // 保存到localStorage
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('isLoggedIn', 'true')
  }

  const logout = () => {
    user.value = null
    isLoggedIn.value = false
    
    // 清除localStorage
    localStorage.removeItem('user')
    localStorage.removeItem('isLoggedIn')
  }

  const initFromStorage = () => {
    const storedUser = localStorage.getItem('user')
    const storedLoginStatus = localStorage.getItem('isLoggedIn')
    
    if (storedUser && storedLoginStatus === 'true') {
      try {
        user.value = JSON.parse(storedUser)
        isLoggedIn.value = true
      } catch (error) {
        console.error('解析用户数据失败:', error)
        logout()
      }
    }
  }

  const updateUser = (userData) => {
    user.value = { ...user.value, ...userData }
    localStorage.setItem('user', JSON.stringify(user.value))
  }

  // 检查用户权限
  const hasPermission = (requiredRole) => {
    if (!user.value) return false
    
    if (requiredRole === 'ADMIN') {
      return user.value.role === 'ADMIN'
    }
    
    if (requiredRole === 'STUDENT') {
      return user.value.role === 'STUDENT' || user.value.role === 'ADMIN'
    }
    
    return true
  }

  return {
    // 状态
    user,
    isLoggedIn,
    
    // 计算属性
    isAdmin,
    isStudent,
    userName,
    userStudentId,
    
    // 方法
    login,
    logout,
    initFromStorage,
    updateUser,
    hasPermission
  }
})
