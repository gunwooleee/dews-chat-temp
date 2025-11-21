import CryptoJS from "crypto-js";
import forge from "node-forge";
import axios from "axios";

export default class Crypto {
  private static instance: Crypto | null = null;
  private iv: CryptoJS.lib.WordArray | null = null;
  private constructor() {}

  public static getInstace(): Crypto {
    if (Crypto.instance === null) {
      Crypto.instance = new Crypto();
    }
    return Crypto.instance;
  }

  public getIv(): CryptoJS.lib.WordArray {
    if (this.iv === null) {
      this.iv = CryptoJS.lib.WordArray.random(16);
    }
    return this.iv;
  }

  encodeByAES256(key: CryptoJS.lib.WordArray, data: string) {
    const keyBytes = CryptoJS.enc.Hex.parse(CryptoJS.enc.Hex.stringify(key));
    const ivBytes = this.getIv();
    const encrypted = CryptoJS.AES.encrypt(data, keyBytes, {
      iv: ivBytes,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    const encryptedHex = encrypted.ciphertext.toString(CryptoJS.enc.Hex);
    return encryptedHex;
  }

  rsaEncrypt(publicKeyPem: string, data: CryptoJS.lib.WordArray) {
    const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
    const encrypted = publicKey.encrypt(
      this.hexStringToAscii(CryptoJS.enc.Hex.stringify(data)),
      "RSA-OAEP",
      {
        md: forge.md.sha256.create(),
      },
    );
    return forge.util.bytesToHex(encrypted);
  }

  hexStringToAscii(hexString: string) {
    const hexArray = hexString.match(/.{1,2}/g);
    const byteValues = hexArray?.map((hex) => parseInt(hex, 16));
    const asciiString = String.fromCharCode(...(byteValues ?? []));
    return asciiString;
  }

  async encode(data: string) {
    const res = await axios.post(
      `/api/crypto/publickey`,
    );
    console.log("res", res);
    const publicKey = res.data.public_key;
    console.log("publicKey", publicKey);
    const aesKey = CryptoJS.lib.WordArray.random(16);
    const iv = this.getIv();
    const AES = this.encodeByAES256(aesKey, data);
    const RSA = this.rsaEncrypt(publicKey, aesKey);
    return `${RSA}.${iv}.${AES}`;
  }
}
