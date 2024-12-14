import localforage from 'localforage';

const initConfig = () => {
  localforage.config({
    name: 'reader-novel',
    storeName: 'chapter-list',
  });
};
const getLocalItem = key => localforage.getItem(key);
const setLocalItem = (key, value) => localforage.setItem(key, value);
const removeLocalItem = key => localforage.removeItem(key);
const clearLocalData = () => localforage.clear();

export default {
  initConfig,
  getLocalItem,
  setLocalItem,
  removeLocalItem,
  clearLocalData,
};

