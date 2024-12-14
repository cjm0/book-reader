import Vue from 'vue';
import SvgIcon from '@/components/SvgIcon'; // svg component

// register globally
Vue.component('svg-icon', SvgIcon);

// 使用 require.context() 方法来创建自己的（模块）上下文
const req = require.context('./svg', false, /\.svg$/);
const requireAll = requireContext => requireContext.keys().map(requireContext);
requireAll(req);
