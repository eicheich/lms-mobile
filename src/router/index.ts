import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/school-select',
      name: 'school-select',
      component: () => import('@/views/auth/SchoolSelectView.vue'),
      meta: { public: true }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { public: true }
    },
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/tabs/HomeView.vue')
    },
    {
      path: '/lms',
      name: 'lms',
      component: () => import('@/views/tabs/LmsView.vue')
    },
    {
      path: '/lms/:courseId',
      name: 'lms-course-detail',
      component: () => import('@/views/lms/CourseDetailView.vue')
    },
    {
      path: '/cbt',
      name: 'cbt',
      component: () => import('@/views/tabs/CbtView.vue')
    },
    {
      path: '/cbt-session/:examId',
      name: 'cbt-session',
      component: () => import('@/views/cbt/ExamSessionView.vue')
    },
    {
      path: '/global',
      name: 'global',
      component: () => import('@/views/tabs/GlobalHubView.vue')
    },
    {
      path: '/programs/:id',
      name: 'program-detail',
      component: () => import('@/views/programs/ProgramDetailView.vue')
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/tabs/ProfileView.vue')
    }
  ]
})

router.beforeEach((to) => {
  const authStore = useAuthStore()
  if (!to.meta.public && !authStore.isAuthenticated) {
    return '/login'
  }
  if (to.path === '/login' && authStore.isAuthenticated) {
    return '/'
  }
  return true
})

export default router
