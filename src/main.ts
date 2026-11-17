import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useTenantStore } from './stores/tenant'
import { useAuthStore } from './stores/auth'
import './assets/main.css'

async function bootstrap() {
  const app = createApp(App)
  const pinia = createPinia()
  app.use(pinia)

  const tenantStore = useTenantStore()
  const authStore = useAuthStore()

  await Promise.all([tenantStore.initTenant(), authStore.initAuth()])

  app.use(router)
  app.mount('#app')
}

bootstrap()
