module.exports = {
  root: true,
  env: {
    node: true
  },
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "babel-eslint"
  },
  extends: [
    "plugin:vue/essential",
    "eslint:recommended",
  ],
  rules: { // 0表示不不处理，1表示警告，2表示错误并退出
    'max-len': 'off',
    'camelcase': [0, { properties: 'never' }], // 对于变量和函数名统一使用驼峰命名法 对属性字段不做限制
    'no-param-reassign': 0, // 不允许修改函数参数值
    'no-trailing-spaces': 0, // 行末不留空格
    'prefer-template': 0, // 必须用模版字符串
    'semi': 0, // 不要使用分号
    'eol-last': 0, // 文件末尾留一空行
    // 'prefer-destructuring': ["error", {"object": true, "array": false}],
    'prefer-destructuring': 0, // 使用解构，而不是通过成员表达式访问属性
    'comma-dangle': 0, // 不允许有多余的行末逗号
    'arrow-body-style': 0, //
    'array-callback-return': 0, // 数组操作方法的回调函数需要有明确的 return 返回
    'function-paren-newline': 0, // 函数括号换行
    'prefer-const': 0, // const
    'arrow-parens': 0, // a => b

    'indent': [0, 2], // 2 4个空格 [1, 2] [1, 4] [1, 'tab']
    'quotes': [0, 'single'], // 使用单引号
  }
};
