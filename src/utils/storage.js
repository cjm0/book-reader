// 本地永久存储
export const setLocal = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.log('set localStorage', error)
  }
};
// 获取本地数据
export const getLocal = (key) => {
  try {
    const value = window.localStorage.getItem(key);
    return JSON.parse(value);
  } catch (error) {
    console.log('get localStorage', error)
  }
};
// 清除某一个key的数据
export const clearOneLocal = (key) => {
  window.localStorage.removeItem(key);
};
// 清除指定数组keys的数据
export const clearArrayLocal = (keys) => {
  if (keys && keys.length) {
    keys.forEach((key) => {
      window.localStorage.removeItem(key);
    });
  }
};
// 清空本地数据
export const clearAllLocal = () => {
  window.localStorage.clear();
};
