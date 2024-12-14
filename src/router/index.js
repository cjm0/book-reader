import Vue from 'vue';
import Router from 'vue-router';
import Read from '@/pages/read'
Vue.use(Router);

// 静态路由
const routes = [
  // {
  //   path: '/',
  //   redirect: '/read',
  // },
  {
    // http://127.0.0.1:8005/read/22114917000488502?functionswitch=111101110NNN&popBfWin=30&quadrant=1
    path: '/read/:cbid',
    name: 'Read',
    component: Read, // 首页要最先加载
    // component: () => import('@/pages/read'),
  },
  {
    path: '*',
    name: 'Blank',
    component: () => import('@/pages/404'),
  },
];

const createRouter = () => new Router({
  mode: 'history', // require service support
  base: '',
  routes,
});
const router = createRouter();

export default router;