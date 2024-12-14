module.exports = {
  plugins: {
    'postcss-preset-env': {
      autoprefixer: {
        flexbox: 'no-2009',
      },
      stage: 3,
    },
    // 'postcss-px-to-viewport': {
    //   viewportWidth: 360,
    // },
    autoprefixer: {},
  },
};
