import axios from 'axios'

const getApiBaseUrl = () => {
  // 开发环境：使用代理
  if (import.meta.env.DEV) {
    return ''  // 会被 Vite 代理转发
  }
  
  // 生产环境：使用完整地址
  return 'https://involved-robinett-lostandfound-c03d715f.koyeb.app/api'
}

const apiBaseUrl = getApiBaseUrl()
console.log('🔧 API地址:', apiBaseUrl)

console.log('🌐 后端地址:', apiBaseUrl)

const http = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
})


// 请求拦截器 - 添加认证头
http.interceptors.request.use(
  (config) => {
    // 从localStorage获取用户信息
    const storedUser = localStorage.getItem('user')
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    
    if (storedUser && isLoggedIn === 'true') {
      try {
        const user = JSON.parse(storedUser)
        if (user.studentId) {
          config.headers['X-Student-Id'] = user.studentId
        }
      } catch (error) {
        console.error('解析用户数据失败:', error)
      }
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
http.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.response?.data?.errors || error.message || '请求失败，请稍后再试'
    return Promise.reject(new Error(typeof message === 'string' ? message : JSON.stringify(message)))
  }
)

export default http