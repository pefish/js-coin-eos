/** @module */
import '@pefish/js-node-assist'
import BaseEosLike from './base/base_eos'
import { Api, JsonRpc, Serialize } from 'eosjs'
import eosEcc from 'eosjs-crypt'
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig'
import { TextDecoder, TextEncoder } from 'text-encoding'
import crypto from 'crypto'
import EosRemoteHelper from './remote'

export default class EosWalletHelperV1 extends BaseEosLike {

  privateKey: string
  remoteClient: EosRemoteHelper
  sigProvider: JsSignatureProvider
  api: Api
  chainId: string

  constructor (chainId = `aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906`) {
    super()
    this.chainId = chainId
  }

  initRemoteClient (url: string) {
    this.remoteClient = new EosRemoteHelper(url)
  }

  installPrivateKey (privateKey) {
    this.privateKey = privateKey
    this.sigProvider = new JsSignatureProvider([privateKey])
    this.api = new Api({
      chainId: this.chainId,
      rpc: this.remoteClient.rpc,
      signatureProvider: this.sigProvider,
      textDecoder: new TextDecoder(),
      textEncoder: new TextEncoder()
    })
  }

  /**
   * 对交易进行签名
   * @param txObj {object} action被编码后的明文交易
   * @returns {Promise<*>}
   */
  async signTxObjForSig(txObj) {
    const data = await this.sigProvider.sign({
      chainId: this.chainId,
      requiredKeys: [this.getPubkeyFromWif(this.privateKey)],
      serializedTransaction: this.api.serializeTransaction(txObj),
      abis: null,
    })
    return data[`signatures`][0]
  }

  isPublicKey (str) {
    return eosEcc.isValidPublic(str)
  }

  getAllBySeedAndIndex(seed, index) {
    const privateKeyObj = eosEcc.PrivateKey.fromSeed(seed + index)
    return {
      seed,
      index,
      privateKey: privateKeyObj.toString(),
      publicKey: privateKeyObj.toPublic().toString(),
      wif: privateKeyObj.toWif()
    }
  }

  getPubkeyFromWif(wif) {
    const privateKeyObj = eosEcc.PrivateKey.fromString(wif)
    return privateKeyObj.toPublic().toString()
  }

  decryptMemo (toWif, fromPKey, encryptedMemo, nonce) {
    return eosEcc.Aes.decryptWithoutChecksum(
      toWif,
      fromPKey,
      nonce,
      encryptedMemo.hexToBuffer_()
    ).toString()
  }

  /**
   * 加密memo
   * @param fromWif
   * @param toPKey
   * @param memo {string}
   * @param nonce {number}
   * @returns {{nonce, message: *, checksum}}
   */
  encryptMemo (fromWif, toPKey, memo, nonce = null) {
    const result = eosEcc.Aes.encrypt(
      fromWif,
      toPKey,
      memo,
      nonce === null ? undefined : nonce
    )
    return {
      nonce: result['nonce'].toString(),
      message: result['message'].toHexString_(false),
      checksum: result['checksum']
    }
  }

  /**
   * 解码actions
   * @param actions {array} 编码后的action数组
   * @returns {Promise<Promise<Action[]> | *>}
   */
  async decodeActions (actions) {
    return this.api.deserializeActions(actions)
  }

  async encodeActions (actions) {
    return this.api.serializeActions(actions)
  }

  getHexFromTxObj (txObj) {
    const serializedTransaction = this.api.serializeTransaction(txObj)
    return Serialize.arrayToHex(serializedTransaction)
  }

  getTxObjFromHex (hex) {
    const serializedTransaction = Serialize.hexToUint8Array(hex)
    return this.api.deserializeTransaction(serializedTransaction)
  }

  async buildTransaction(actions, expirationSecond = 300, sign = false, broadcast = false) {
    const trx = await this.api.transact({
      actions
    }, {
      blocksBehind: 3,
      expireSeconds: expirationSecond,
      broadcast,
      sign
    })
    const txHex = Serialize.arrayToHex(trx[`serializedTransaction`])
    return {
      signatures: trx[`signatures`],
      txId: crypto.createHash('sha256').update(Buffer.from(txHex, 'hex')).digest().toString('hex'),
      txObj: this.api.deserializeTransaction(trx[`serializedTransaction`]), // action被编码的交易
      txHex,
      tx: await this.api.deserializeTransactionWithActions(trx[`serializedTransaction`])  // action没有被编码的交易
    }
  }

  serializeTransaction (txObj: object) {
    return this.api.serializeTransaction(txObj)
  }
}

