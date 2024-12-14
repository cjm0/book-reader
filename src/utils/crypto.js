import CryptoJs from 'crypto-js';

const secretKey = 'fa3d56e89012Q4k6';
const appkey = 'huawei_browser_eB@9bd6Ac7b&1a3a4F1eT5=';
const key = CryptoJs.enc.Latin1.parse(secretKey);
export default {
  // 加密
  encrypt(input) {
    // const input = '中文123Abc';
    const output = CryptoJs.AES.encrypt(input, key, {
      iv: key,
      mode: CryptoJs.mode.CBC,
      padding: CryptoJs.pad.ZeroPadding,
    });
    return output.toString();
  },
  // 解密
  decrypt(encrypted) {
    const output = CryptoJs.AES.decrypt(encrypted, key, {
      iv: key,
      mode: CryptoJs.mode.CBC,
      padding: CryptoJs.pad.ZeroPadding,
    });
    return output.toString(CryptoJs.enc.Utf8);
  },
  sha256(timestamp, nonce) {
    return CryptoJs.HmacSHA256(nonce + timestamp, appkey).toString();
  },
};
