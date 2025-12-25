import { createRouter, createWebHistory } from 'vue-router'

const MobileHome = () => import('@/views/MobileHome.vue')
const AdminDashboard = () => import('@/views/AdminDashboard.vue')
const Login = () => import('@/views/Login.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: {
        title: '登录 - 杭州电子科技大学信息工程学院校园失物招领系统',
        requiresGuest: true, // 只有未登录用户可以访问
      },
    },
    {
      path: '/',
      name: 'mobile',
      component: MobileHome,
      meta: {
        title: '移动端 - 杭州电子科技大学信息工程学院校园失物招领系统',
        requiresAuth: true, // 需要登录
        allowedRoles: ['STUDENT', 'ADMIN'], // 允许的角色
      },
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminDashboard,
      meta: {
        title: '管理端 - 杭州电子科技大学信息工程学院校园失物招领系统',
        requiresAuth: true, // 需要登录
        allowedRoles: ['ADMIN'], // 只允许管理员
      },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 检查用户登录状态
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  const userStr = localStorage.getItem('user')
  let user = null
  
  if (userStr) {
    try {
      user = JSON.parse(userStr)
    } catch (error) {
      console.error('解析用户数据失败:', error)
      localStorage.removeItem('user')
      localStorage.removeItem('isLoggedIn')
    }
  }

  // 如果路由需要游客权限（如登录页面）
  if (to.meta.requiresGuest) {
    if (isLoggedIn && user) {
      // 已登录用户根据角色跳转到对应页面
      if (user.role === 'ADMIN') {
        next('/admin')
      } else {
        next('/')
      }
      return
    }
    next()
    return
  }

  // 如果路由需要认证
  if (to.meta.requiresAuth) {
    if (!isLoggedIn || !user) {
      next('/login')
      return
    }

    // 检查角色权限
    if (to.meta.allowedRoles && to.meta.allowedRoles.length > 0) {
      if (!to.meta.allowedRoles.includes(user.role)) {
        // 没有权限，根据用户角色跳转到对应页面
        if (user.role === 'ADMIN') {
          next('/admin')
        } else {
          next('/')
        }
        return
      }
    }
  }

  next()
})

router.afterEach((to) => {
  if (to.meta?.title) {
    document.title = to.meta.title
  }
})

export default router

