/* 错误日志上报 - 开发、测试、预发域名包 */

import * as Sentry from '@sentry/vue';
import Vue from 'vue';

Sentry.init({
  Vue,
  dsn: 'https://78088f180c3442289ad5839f3fde2048@newsentry.qidian.com/54',
  enabled: process.env.NODE_ENV === 'production', // 只有在生产模式下开启错误日志上报，开发模式禁止上报
  environment: process.env.VUE_APP_BUILD_ENV, // 环境参数，用来监控平台筛选 uat、test、pre、prod 不同环境的报错日志
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 0.2,
  release: process.env.VUE_APP_VERSION
});
