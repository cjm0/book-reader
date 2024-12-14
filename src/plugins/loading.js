import Loading from '@/components/Loading';

function install(Vue) {
  const LoadingConstructor = Vue.extend(Loading);
  const vm = new LoadingConstructor();
  vm.$mount(document.createElement('div'));
  document.body.appendChild(vm.$el);

  // 添加 显示loading方法
  Vue.prototype.$showLoading = (bgColor) => {
    vm.isShow = true;
    vm.bgColor = bgColor;
  };
  // 添加关闭loading方法
  Vue.prototype.$hideLoading = () => {
    vm.isShow = false;
  };
}

export default { install };
