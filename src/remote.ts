import '@pefish/js-node-assist'
import ErrorHelper from '@pefish/js-error'
import BaseEosLike from './base/base_eos'

export default class EosRemoteHelper extends BaseEosLike {
  _Lib: any
  url: string
  eos: any
  _network: string

  constructor (url, lib = null, network = 'mainnet') {
    super()
    if (typeof url !== 'string') {
      url = `${url['protocol']}://${url['host']}${url['port'] ? `:${url['port']}` : (url['protocol'] === `https` ? `:443` : `:80`)}${url['path'] || ''}`
    }
    this._Lib = lib || require('p_eos.js')
    this.url = url
    this._network = network
  }

  async init () {
    this.eos = this._Lib({
      chainId: this._network === 'mainnet' ? null : await this.getChainId(),  // 跟签名直接相关
      keyProvider: [],
      httpEndpoint: this.url,
      expireInSeconds: 60,
      broadcast: false,
      verbose: false,
      sign: false
    })
  }

  async help (methodName) {
    await this.eos[methodName]() // 不给参数，会打印用法
  }

  async getChainId () {
    const result = await this._Lib({
      httpEndpoint: this.url
    }).getInfo({})
    return result['chain_id']
  }

  async getInfo () {
    return await this.eos.getInfo({})
  }

  /**
   * 获取最新高度
   * @param isIrreversible {boolean} 是不是不可回滚的
   * @returns {Promise<*>}
   */
  async getLatestHeight (isIrreversible = true) {
    const result = await this.getInfo()
    return isIrreversible === true ? result['last_irreversible_block_num'].toString() : result['head_block_number'].toString()
  }

  async getBlock (blockNumOrId) {
    return await this.eos.getBlock({
      block_num_or_id: blockNumOrId
    })
  }

  async getAccount (accountName) {
    return await this.eos.getAccount({
      account_name: accountName
    })
  }

  /**
   * 获取合约账户的abi
   * @param accountName
   * @returns {Promise<*>}
   */
  async getAbi (accountName) {
    return await this.eos.getAbi({
      account_name: accountName
    })
  }

  /**
   * 获取合约账户的代码
   * @param accountName
   * @param asWasm
   * @returns {Promise<*>}
   */
  async getCode (accountName, asWasm = false) {
    return await this.eos.getCode({
      account_name: accountName,
      code_as_wasm: asWasm
    })
  }

  /**
   * 获取合约中的数据
   * @param contractAccountName
   * @param primaryKey {string} 表的主键值,类似redis中的key
   * @param tableName
   * @param toJson
   * @param start
   * @param end
   * @param limit
   * @returns {Promise<*>}
   */
  async getTableRows (contractAccountName, primaryKey, tableName, toJson, start = 0, end = -1, limit = 10) {
    return await this.eos.getTableRows({
      scope: primaryKey,
      code: contractAccountName,
      table: tableName,
      json: toJson,
      lower_bound: start,
      upper_bound: end,
      limit
    })
  }

  /**
   * 查询余额
   * @param contractAccountName {string} 合约账户名
   * @param accountName {string} 账户名
   * @param symbol {string} 要查询的币种
   * @returns {Promise<*>}
   */
  async getBalance (contractAccountName, accountName, symbol = 'EOS') {
    const strArr = await this.eos.getCurrencyBalance({
      code: contractAccountName,
      account: accountName,
      symbol
    })
    if (strArr.length === 0) {
      return '0'
    }
    return strArr[0].removeLast_(symbol.length + 1).shiftedBy_(4)
  }

  /**
   * action转bin
   * @param contractAccountName {string} 合约账户名
   * @param actionName {string} 行为名
   * @param params {object} 参数
   * @returns {Promise<*>}
   */
  async abiJsonToBin (contractAccountName, actionName, params) {
    const result = await this.eos.abiJsonToBin({
      code: contractAccountName,
      action: actionName,
      args: params
    })
    if (!result || !result['binargs']) {
      throw new ErrorHelper(`错误`)
    }
    return result['binargs']
  }

  async abiBinToJson (contractAccountName, actionName, bin) {
    const result = await this.eos.abiBinToJson({
      code: contractAccountName,
      action: actionName,
      binargs: bin
    })
    if (!result || !result['args']) {
      throw new ErrorHelper(`错误`)
    }
    return result['args']
  }

  async getRequiredKeys (txObj, availableKeys) {
    return await this.eos.abiBinToJson({
      transaction: txObj,
      available_keys: availableKeys
    })
  }

  async getCurrencyStats (contractAccountName, symbol) {
    const result = await this.eos.getCurrencyStats({
      code: contractAccountName,
      symbol
    })
    if (!result[symbol]) {
      throw new ErrorHelper(`错误`)
    }
    return result[symbol]
  }

  async getProducers (start = 0, limit = 0, toJson = false) {
    return await this.eos.getProducers({
      lower_bound: start,
      limit,
      json: toJson
    })
  }

  async pushBlock (timestamp, producer, confirmed, previous, transaction_mroot, action_mroot, version, new_producers, header_extensions, producer_signature, transactions, block_extensions) {
    return await this.eos.pushBlock({
      timestamp,
      producer,
      confirmed,
      previous,
      transaction_mroot,
      action_mroot,
      version,
      new_producers,
      header_extensions,
      producer_signature,
      transactions,
      block_extensions
    })
  }

  async pushTransaction (txObj) {
    return await this.eos.pushTransaction(txObj)
  }

  async pushTransactions (txObjs) {
    return await this.eos.pushTransactions(txObjs)
  }

  /**
   * 读取跟某账户有关的所有交易记录.
   * @param accountName
   * @param pos {number} 表示从哪个位置开始取. 从0开始. -1则表示最后一个的后一个, pos-1 offset-1 查到的就是最后一条
   * @param offset {number} 正表示从pos处向后多取 offset 个，负表示从pos处向前多取 offset 个
   * @returns {Promise<void>}
   */
  async getActions (accountName, pos = 0, offset = 0) {
    return await this.eos.getActions({
      pos,
      offset,
      account_name: accountName
    })
  }

  async getTransaction (txHash) {
    return await this.eos.getTransaction({
      id: txHash,
    })
  }

  /**
   * 根据公钥获取使用它的所有账户名
   * @param publicKey
   * @returns {Promise<*>}
   */
  async getKeyAccounts (publicKey) {
    const result = await this.eos.getKeyAccounts({
      public_key: publicKey,
    })
    if (!result['account_names']) {
      throw new ErrorHelper(`错误`)
    }
    return result['account_names']
  }

  async getControlledAccounts (controllingAccount) {
    return await this.eos.getControlledAccounts({
      controlling_account: controllingAccount,
    })
  }
}

