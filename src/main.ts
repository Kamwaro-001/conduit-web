import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// vue-flow syles
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import { VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'

const app = createApp(App)

app.use(createPinia())
app.use(router)

const components = {
  VueFlow,
  Background,
}

Object.entries(components).forEach(([name, component]) => {
  app.component(name, component)
})

app.mount('#app')
