const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const VConsolePlugin = require('vconsole-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { VantResolver } = require('unplugin-vue-components/resolvers');
const ComponentsPlugin = require('unplugin-vue-components/webpack');
// const CopyPlugin = require('copy-webpack-plugin');

const {
  NODE_ENV, BUILD_ENV,
  VUE_APP_KIT, VUE_APP_KIT_DOMAIN,
  VUE_APP_PPS, VUE_APP_PPS_DOMAIN,
  cdnUrl, port
} = process.env;
const isDev = NODE_ENV === 'development';
const isPrev = BUILD_ENV === 'pre';
const isProd = BUILD_ENV === 'prod';

function resolve(dir) {
  return path.join(__dirname, dir);
}

module.exports = {
  publicPath: cdnUrl || '/', // 部署应用包时的基本 URL: 如果你的应用被部署在 https://www.my-app.com/my-app/，则设置 publicPath 为 /my-app/
  outputDir: 'dist', // 生成的生产环境构建文件的目录
  assetsDir: '', // 放置生成的静态资源 (js、css、img、fonts) 的 (相对于 outputDir 的) 目录
  lintOnSave: isDev, // 是否在开发环境下通过 eslint-loader 在每次保存时 lint 代码
  productionSourceMap: !isProd && !isPrev, // 如果你不需要生产环境的 source map，可以将其设置为 false 以加速生产环境构建

  devServer: {
    // host: 'localhost',
    allowedHosts: ['all'],
    port: port || 8005,
    open: true,
    hot: true,
    proxy: { // 本地开发环境的请求代理
      // ajax请求
      '^/browser': {
        target: 'https://coopmain.reader.qq.com',
        // ws: true, // 启用 websockets
        // changeOrigin: true, // 开启代理，在本地创建一个虚拟服务端
        // secure: false, // 设置为 false，接受 https
      },
    },
    client: {
      overlay: false
    }
  },
  transpileDependencies: ['dom7'],
  css: {
    loaderOptions: {
      scss: {
        additionalData: `@import "~@/assets/styles/mixin.scss";`,
      },
    },
  },

  configureWebpack: (config) => {
    config.plugins.push(ComponentsPlugin({
      resolvers: [VantResolver()],
    }));

    console.log('configureWebpack', isDev, isProd, isPrev);

    // 打包 vconsole（排除本地开发环境、生产环境、预发环境）
    config.plugins.push(new VConsolePlugin({ enable: !isDev && !isPrev && !isProd }));

    if (!isDev) {
      config.optimization.minimizer = [
        new TerserPlugin({
          // sourceMap: false, // Must be set to true if using source-maps in production
          terserOptions: {
            compress: {
              drop_console: isProd, // 生产环境去掉日志
            },
          },
        }),
      ];

      config.optimization.splitChunks = {
        cacheGroups: {
          'vendors-base': {
            name: 'vendors-base',
            test: /[\\/]node_modules[\\/](vue|vue-router|axios)/,
            chunks: 'all',
            priority: 10,
            enforce: true,
          },
          'chunk-vendors': {
            name: 'chunk-vendors',
            test: /[\\/]node_modules[\\/]/,
            chunks: 'all',
            priority: 1,
            enforce: true,
          },
        },
      };
    }

    // 包分析
    if (process.VUE_CLI_SERVICE.mode === 'analyze') {
      config.plugins.push(new BundleAnalyzerPlugin());
    }
  },
  chainWebpack(config) {
    // 别名，按环境引入不同的 js
    const mockFile = isDev ? 'js/mock_local' : 'js/mock_build'
    config.resolve.alias.set('@mock', `@/${mockFile}.js`)

    // 开发、测试、预发包加 sentry 错误上报
    let sentryFile = 'js/sentry'
    if (!isDev && ['uat', 'test', 'pre'].includes(BUILD_ENV)) {
      sentryFile = 'js/sentry_test'
    }
    config.resolve.alias.set('@sentryjs', `@/${sentryFile}.js`)

    // set svg-sprite-loader
    config.module.rule('svg').exclude.add(resolve('src/icons')).end();

    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]',
      })
      .end();

    // 华为阅读器 kit 地址
    config.plugin('html').tap((args) => {
      args[0].VUE_APP_KIT = isDev ? VUE_APP_KIT : "<%= VUE_APP_KIT %>"
      args[0].VUE_APP_KIT_DOMAIN = VUE_APP_KIT_DOMAIN
      args[0].VUE_APP_PPS = VUE_APP_PPS
      args[0].VUE_APP_PPS_DOMAIN = VUE_APP_PPS_DOMAIN
      return args;
    });

    config.when(!isDev, (config) => {
      config.plugin('html').tap((args) => {
        args[0].inject = 'body';
        return args;
      });
      config.optimization.runtimeChunk('single');
    });
  },
};
