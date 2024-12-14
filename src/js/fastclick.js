import FastClick from 'fastclick';
import { getUA } from '@/utils/helpers';

FastClick.prototype.focus = function (targetElement) {
  let length;
  // 兼容处理:在iOS7中，有一些元素（如date、datetime、month等）在setSelectionRange会出现TypeError
  // 这是因为这些元素并没有selectionStart和selectionEnd的整型数字属性，所以一旦引用就会报错，因此排除这些属性才使用setSelectionRange方法
  if (
    getUA().isIOS
    && targetElement.setSelectionRange
    && targetElement.type.indexOf('date') !== 0
    && targetElement.type !== 'time'
    && targetElement.type !== 'month'
    && targetElement.type !== 'email'
  ) {
    length = targetElement.value.length;
    targetElement.setSelectionRange(length, length);
    /* 修复bug ios 11.3不弹出键盘，这里加上聚焦代码，让其强制聚焦弹出键盘*/
    targetElement.focus();
  } else {
    targetElement.focus();
  }
};
FastClick.attach(document.body);

export default FastClick;
