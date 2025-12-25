import http from './http'

export const authAPI = {
  // 用户登录
  login: async (loginData) => {
    try {
      const response = await http.post('/auth/login', loginData)
      return response.data
    } catch (error) {
      console.error('登录API调用失败:', error)
      if (error.response?.data) {
        return error.response.data
      }
      throw error
    }
  },

  // 用户注册
  register: async (registerData) => {
    try {
      const response = await http.post('/auth/register', registerData)
      return response.data
    } catch (error) {
      console.error('注册API调用失败:', error)
      if (error.response?.data) {
        return error.response.data
      }
      throw error
    }
  },

  // 用户登出
  logout: async () => {
    try {
      const response = await http.post('/auth/logout')
      return response.data
    } catch (error) {
      console.error('登出API调用失败:', error)
      if (error.response?.data) {
        return error.response.data
      }
      throw error
    }
  },

  // 检查学号是否存在
  checkStudentId: async (studentId) => {
    try {
      const response = await http.get(`/auth/check-student-id/${studentId}`)
      return response.data
    } catch (error) {
      console.error('检查学号API调用失败:', error)
      throw error
    }
  }
}
