import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false

// 在 Vue 2 中，使用 `Vue.use()` 来安装插件
new Vue({
  // 在 Vue 2 中，使用 `render` 函数来渲染根组件
  // 導入 store 和 router, 使用 Vuex 和 Vue Router
  router,
  store,
  render: h => h(App)
}).$mount('#app')
