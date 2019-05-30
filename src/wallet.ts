/** @module */
import '@pefish/js-node-assist'
import ErrorHelper from 'p-js-error'
import BaseEosLike from './base/base_eos'
import { Api, JsonRpc, Serialize } from 'eosjs'
import eosEcc from 'eosjs-crypt'
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig'
import { TextDecoder, TextEncoder } from 'text-encoding'
import fetch from 'node-fetch'
import crypto from 'crypto'

export default class EosWalletHelperV1 extends BaseEosLike {

  _privateKey: string
  _rpc: JsonRpc | null
  _sigProvider: JsSignatureProvider
  _api: Api


  constructor(url = null, privateKey = null) {
    super()
    this._privateKey = privateKey
    if (url === null) {
      this._rpc = null
      this._sigProvider = new JsSignatureProvider(privateKey ? [privateKey] : [])
      this._api = new Api({
        rpc: this._rpc,
        signatureProvider: this._sigProvider,
        textDecoder: new TextDecoder(),
        textEncoder: new TextEncoder()
      })
    } else {
      this._rpc = new JsonRpc(url, { fetch })
      this._sigProvider = new JsSignatureProvider(privateKey ? [privateKey] : [])
      this._api = new Api({
        rpc: this._rpc,
        signatureProvider: this._sigProvider,
        textDecoder: new TextDecoder(),
        textEncoder: new TextEncoder()
      })
    }

  }

  installPrivateKey (privateKey) {
    this._privateKey = privateKey
    this._sigProvider = new JsSignatureProvider([privateKey])
    this._api = new Api({
      rpc: this._rpc,
      signatureProvider: this._sigProvider,
      textDecoder: new TextDecoder(),
      textEncoder: new TextEncoder()
    })
  }

  /**
   * 对交易进行签名
   * @param txObj {object} action被编码后的明文交易
   * @param chainId {string} 默认是正式链
   * @returns {Promise<*>}
   */
  async signTxObjForSig(txObj, chainId = `aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906`) {
    const data = await this._sigProvider.sign({
      chainId,
      requiredKeys: [this.getPubkeyFromWif(this._privateKey)],
      serializedTransaction: this._api.serializeTransaction(txObj),
      abis: null,
    })
    return data[`signatures`][0]
  }

  async getChainId () {
    if (this._rpc === null) {
      throw new ErrorHelper(`init rpc please`)
    }

    const result = await this._rpc.get_info()
    return result['chain_id']
  }

  async getChainInfo () {
    if (this._rpc === null) {
      throw new ErrorHelper(`init rpc please`)
    }

    return await this._rpc.get_info()
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
    return this._api.deserializeActions(actions)
  }

  async encodeActions (actions) {
    return this._api.serializeActions(actions)
  }

  getHexFromTxObj (txObj) {
    const serializedTransaction = this._api.serializeTransaction(txObj)
    return Serialize.arrayToHex(serializedTransaction)
  }

  getTxObjFromHex (hex) {
    const serializedTransaction = Serialize.hexToUint8Array(hex)
    return this._api.deserializeTransaction(serializedTransaction)
  }

  async buildTransaction(actions, expirationSecond = 300, sign = false, broadcast = false) {
    const trx = await this._api.transact({
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
      txObj: this._api.deserializeTransaction(trx[`serializedTransaction`]), // action被编码的交易
      txHex,
      tx: await this._api.deserializeTransactionWithActions(trx[`serializedTransaction`])  // action没有被编码的交易
    }
  }

  async getTokenInfo (contractAccountName, tokenName) {
    if (this._rpc === null) {
      throw new ErrorHelper(`init rpc please`)
    }

    const result = await this._rpc.get_table_rows({
      json: true,
      code: contractAccountName,
      scope: tokenName,
      table: 'stat',
      lower_bound: 0,
      upper_bound: -1,
      limit: 10,
    })
    if (result['rows'].length === 0) {
      throw new ErrorHelper(`没有此token. token: ${tokenName}`)
    }
    return result['rows'][0]
  }

  async getTransaction (txHash) {
    if (this._rpc === null) {
      throw new ErrorHelper(`init rpc please`)
    }

    return await this._rpc.history_get_transaction(txHash)
  }

  async getActions (accountName, pos = 0, offset = 0) {
    if (this._rpc === null) {
      throw new ErrorHelper(`init rpc please`)
    }

    return await this._rpc.history_get_actions(accountName, pos, offset)
  }

  async getTokenBalance (contractAccountName, accountName, tokenName) {
    if (this._rpc === null) {
      throw new ErrorHelper(`init rpc please`)
    }

    const result = await this._rpc.get_table_rows({
      json: true,
      code: contractAccountName,
      scope: accountName,
      table: 'accounts',
      lower_bound: 0,
      upper_bound: -1,
      limit: 10,
    })
    if (result['rows'].length === 0) {
      return '0'
    }
    for (const { balance } of result['rows']) {
      const { amount, symbol, decimals } = this.decodeAmount(balance)
      if (symbol === tokenName) {
        return amount
      }
    }
    return '0'
  }

  async pushTransaction (signatures, txObj) {
    if (this._rpc === null) {
      throw new ErrorHelper(`init rpc please`)
    }

    const serializedTransaction = this._api.serializeTransaction(txObj)
    return await this._rpc.push_transaction({
      signatures,
      serializedTransaction
    })
  }
}

