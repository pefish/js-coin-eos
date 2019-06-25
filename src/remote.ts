import '@pefish/js-node-assist'
import ErrorHelper from '@pefish/js-error'
import BaseEosLike from './base/base_eos'
import { Api, JsonRpc, Serialize } from 'eosjs'
import fetch from 'node-fetch'
import { TextDecoder, TextEncoder } from 'text-encoding'

export default class EosRemoteHelper extends BaseEosLike {
  rpc: any

  constructor (url) {
    super()
    this.rpc = new JsonRpc(url, { fetch })
  }

  async getChainId () {
    const result = await this.rpc.get_info({})
    return result['chain_id']
  }

  async getTokenBalance (contractAccountName, accountName, tokenName) {
    const result = await this.rpc.get_table_rows({
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

  async getInfo () {
    return await this.rpc.get_info({})
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
    return await this.rpc.get_block(blockNumOrId)
  }

  async getAccount (accountName) {
    return await this.rpc.get_account(accountName)
  }

  /**
   * 获取合约账户的abi
   * @param accountName
   * @returns {Promise<*>}
   */
  async getAbi (accountName) {
    return await this.rpc.get_abi(accountName)
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
  async getTableRows (contractAccountName, primaryKey, tableName, toJson: boolean, start = 0, end = -1, limit = 10) {
    return await this.rpc.get_table_rows({
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
    const strArr = await this.rpc.get_currency_balance(contractAccountName, accountName, symbol)
    if (strArr.length === 0) {
      return '0'
    }
    return strArr[0].removeLast_(symbol.length + 1).shiftedBy_(4)
  }

  async getCurrencyStats (contractAccountName, symbol) {
    const result = await this.rpc.get_currency_stats(contractAccountName, symbol)
    if (!result[symbol]) {
      throw new ErrorHelper(`错误`)
    }
    return result[symbol]
  }

  async getProducers (start = 0, limit = 0, toJson = false) {
    return await this.rpc.get_producers({
      lower_bound: start,
      limit,
      json: toJson
    })
  }

  async pushTransaction (signatures: Array<string>, txToSend: Uint8Array) {
    return await this.rpc.push_transaction({
      signatures,
      serializedTransaction: txToSend
    })
  }

  /**
   * 读取跟某账户有关的所有交易记录.
   * @param accountName
   * @param pos {number} 表示从哪个位置开始取. 从0开始. -1则表示最后一个的后一个, pos-1 offset-1 查到的就是最后一条
   * @param offset {number} 正表示从pos处向后多取 offset 个，负表示从pos处向前多取 offset 个
   * @returns {Promise<void>}
   */
  async getActions (accountName, pos = 0, offset = 0) {
    return await this.rpc.history_get_actions(accountName, pos, offset)
  }

  async getTransaction (txHash) {
    return await this.rpc.history_get_transaction(txHash)
  }

  /**
   * 根据公钥获取使用它的所有账户名
   * @param publicKey
   * @returns {Promise<*>}
   */
  async getKeyAccounts (publicKey) {
    const result = await this.rpc.history_get_key_accounts({
      public_key: publicKey,
    })
    if (!result['account_names']) {
      throw new ErrorHelper(`错误`)
    }
    return result['account_names']
  }

  async getControlledAccounts (controllingAccount) {
    return await this.rpc.history_get_controlled_accounts({
      controlling_account: controllingAccount,
    })
  }
}

