// 阅读相关设置
export const THEMES = [ // 主题色
  // 灰色
  {
    theme: '1',
    bg: '#fff',
    paper: '#FAFAFA',
    activePaper: 'var(--color-theme)',
    slider: 'var(--color-primary)',
    color: 'var(--color-text-primary)',
    sliderLeftButtonColor: '#cdcdcd',
    sliderButtonColor: '#fff',
    sliderBgColor: '#F7F7F7',
    sliderBgActiveColor: '#F0F0F0',
    border: 'var(--color-theme)',
  },
  // 黄色
  {
    theme: '2',
    bg: '#FAF5E2',
    paper: '#F5EFD9',
    activePaper: '#9C701A',
    slider: '#886F49',
    color: 'var(--color-text-primary)',
    sliderLeftButtonColor: '#BFB79A',
    sliderButtonColor: '#FAF5E2',
    sliderBgColor: '#F3EEDB',
    sliderBgActiveColor: '#ECE7D4',
    border: '#9C701A',
  },
  // 绿色
  {
    theme: '3',
    bg: '#E0EFD2',
    paper: '#DBEACB',
    activePaper: '#4C7225',
    slider: '#61803F',
    color: 'var(--color-text-primary)',
    sliderLeftButtonColor: '#A3B794',
    sliderButtonColor: '#E0EFD2',
    sliderBgColor: '#D9E8CC',
    sliderBgActiveColor: '#D3E1C6',
    border: '#4C7225',
  },
  // 蓝色
  {
    theme: '4',
    bg: '#DAE6F4',
    paper: '#D3DFED',
    activePaper: '#246286',
    slider: '#416289',
    color: 'var(--color-text-primary)',
    sliderLeftButtonColor: '#99A9BD',
    sliderButtonColor: '#DAE6F4',
    sliderBgColor: '#D3DFED',
    sliderBgActiveColor: '#CDD8E6',
    border: '#246286',
  },
];
export const DARK_MODE =  { // 夜间模式
  theme: 'dark',
  bg: '#191919',
  paper: '#000000',
  activePaper: 'var(--color-theme)',
  slider: 'var(--color-primary)',
  color: 'rgba(255, 255, 255, 0.6)',
  sliderLeftButtonColor: '#101010',
  sliderButtonColor: '#4D4D4D',
  sliderBgColor: '#252525',
  sliderBgActiveColor: '#303030',
  border: '#fff',
};

export const FONTSIZES = [16, 18, 20, 22, 24, 28, 32, 36]; // 字体大小设置
export const LINE_HEIGHTS = [1.7, 2, 2.5]; // 行间距设置

export const TOOL_BTNS = [ // 阅读页工具栏按钮
  { name: 'list',
    name_act: 'list',
    name_dark: 'list_dark',
    name_darkact: 'list_dark',
    text: '目录',
    eventId: 'jg_G01',
  },
  { name: 'progress',
    name_act: 'progress_act',
    name_dark: 'progress_dark',
    name_darkact: 'progress_darkact',
    text: '进度',
    eventId: 'jg_G19',
  },
  { name: 'mode',
    name_act: 'mode',
    name_dark: 'mode_act',
    name_darkact: 'mode_act',
    text: '夜间',
    eventId: 'jg_G10',
  },
  { name: 'settings',
    name_act: 'settings_act',
    name_dark: 'settings_dark',
    name_darkact: 'settings_darkact',
    text: '设置',
    eventId: 'jg_G06',
  },
];
export const PAGE_CHANGE_MODE = { // 翻页模式
  HORIZONTAL: 'HORIZONTAL', // 左右翻页
  VERTICAL: 'VERTICAL', // 上下滑动
};
export const BOOTM_BAR_HEIGHT = 64; // 底部菜单栏高度

// 异常提示
export const REQUEST_ERROR_TIPS = { // ajax相关的错误提示
  needToken: {
    code: -1,
    msg: '未获取到登录信息',
  },
  dataFormat: {
    code: -2,
    msg: '返回的数据格式异常',
  },
  network: {
    code: -4,
    msg: '网络异常，请稍后再试',
  },
  server: {
    code: -5,
    msg: '服务端异常，请稍后再试',
  },
};
export const ERROR_CODE = { // kit 异常 code
  KIT_PARAMS: '10000', // kit参数
  KIT_NETWORK: '10001', // kit网络异常
  KIT_OTHER: '10002', // kit其他异常
  KIT_INIT: '10003', // kit初始化失败
  KIT_TIMEOUT: '10004', // kit接口超时
  KIT_SERVER: '10005', // kit云侧异常
  YW_OFFLINE: 1010, // 书籍下架
};
export const APIKIT_ERROR_TIPS = { // kit 异常提示语
  [ERROR_CODE.KIT_PARAMS]: 'kit参数错误',
  [ERROR_CODE.KIT_NETWORK]: '网络异常',
  [ERROR_CODE.KIT_OTHER]: '其他异常',
  [ERROR_CODE.KIT_INIT]: '初始化失败',
  [ERROR_CODE.KIT_TIMEOUT]: '接口超时',
  [ERROR_CODE.KIT_SERVER]: '云侧接口异常',
};

// 广告
export const APP_STATUS = { // 下载按钮的状态
  DOWNLOAD: 'DOWNLOAD', // 下载未开始，应用初始状态
  DOWNLOADING: 'DOWNLOADING', // 下载中
  DOWNLOADED: 'DOWNLOADED', // 下载成功
  DOWNLOADFAILED: 'DOWNLOADFAILED', // 下载失败
  DOWNLOADCANCELLED: 'DOWNLOADCANCELLED', // 下载取消
  WAITING: 'WAITING', // 下载等待中
  WAITING_FOR_WIFI: 'WAITING_FOR_WIFI,', // 等待Wifi下载
  PAUSE: 'PAUSE', // 下载暂停
  RESUME: 'RESUME', // 继续下载
  INSTALL: 'INSTALL', // 等待安装
  INSTALLING: 'INSTALLING', // 安装中
  INSTALLED: 'INSTALLED', // 安装完成
};
export const HWAD_TYPE = { // 广告位所处模块-华为数据
  INSERT: '22', // 插页
  LOCK: '37', // 锁章
  DOWNAD: '38', // 激励下载广告
  REWARD: '29', // 激励视频
  BOTTOM: '23', // 固底
  BANNER: '35', // 公告栏广告
};
export const AD_TYPE = { // 广告类型-阅文数据
  INSERT: '61', // 插页 （广告位：阅文配置+华为配置）
  INSERTREWARD: '29', // 激励插页广告 （广告位：独立配置+阅文配置+华为配置）
  DOWNAD: '26', // 激励下载广告 （广告位：写死v11gdkgqm4）
  REWARD: '27', // 激励视频 （广告位：华为配置）
  BOTTOM: '59', // 固底 （广告位：阅文配置+华为配置）
  BANNER: '69', // 公告栏广告 （广告位：写死n8lbzo6yqz）
  BANNERHOT: '75', // 热启广告  （广告位：写死n8lbzo6yqz，公告栏广告样式）
};
export const AD_WIDTHMAP = { // 广告手机、手机折叠屏、pad、pad折叠屏等宽度适配
  hw_fold: 312,
  hw_fold_max: 352,
  hw_pad: 368,
  hw_pad_max: 497
}
export const ADP_WIDTHMAP = {
  hw_fold: 0.46,
  hw_fold_max: 0.46,
  hw_pad: 0.46,
  hw_pad_max: 0.388,
}
export const MIN_DISTANCE = 8

// 数据上报
export const EVENT_CASE = { // 事件上报的原因
  PERFORMANCE: '0', // 性能事件
  ADVERTISE: '1', // 广告事件
  READING: '2', // 阅读事件
};
export const READ_PROGRESS_CAUSE = { // 阅读时长上报时机
  CHANGE_CHAPTER: '1', // 切章
  SWIPER: '2', // 翻页
  SLIDER: '3', // 滑动
  EXIT: '4', // 退出阅读器
};

export const LOGIN_DIALOG_ACTIVATE_TYPE = {
  ADDSHELF: '0',
  ENTRE: '1',
}
