import '@/js/global.js';
import Vue from 'vue';
import router from '@/router';
import store from '@/store';

import '@/js/fastclick.js';
import '@/icons'; // icon
import App from './App.vue';
import loading from '@/plugins/loading';

Vue.use(loading);
Vue.config.productionTip = false;
Vue.config.ignoredElements = ['ads-template']

// 收集 vue 错误
Vue.config.errorHandler = (err, vm, info) => {
  console.error('vue errorHandler', err.message, info);
}

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
