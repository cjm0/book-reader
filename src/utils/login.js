import jsbridge from './jsbridge';

export const nativeLoginKit = async () => await jsbridge.call('login');

export const checkLoginKit = async () => await jsbridge.call('hasLogin');