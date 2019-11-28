import '@pefish/js-node-assist'
import ErrorHelper from '@pefish/js-error'
import { JsonRpc } from 'pefish-eosjs'
import fetch from 'node-fetch'
import BaseEosLike from './base/base_eos';
export default class EosRemote extends BaseEosLike {
  rpc: any
  url: string

  constructor(url: string) {
    super()
    this.url = url
    this.rpc = new JsonRpc(url, { fetch })
  }

  async getChainId(): Promise<string> {
    const result = await this.rpc.get_info({})
    return result['chain_id']
  }

  async getTokenBalance(contractAccountName: string, accountName: string, tokenName: string): Promise<string> {
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

  async getInfo(): Promise<any> {
    return await this.rpc.get_info({})
  }

  /**
   * 获取最新高度
   * @param isIrreversible {boolean} 是不是不可回滚的
   * @returns {Promise<*>}
   */
  async getLatestHeight(isIrreversible: boolean = true): Promise<number> {
    const result = await this.getInfo()
    return isIrreversible === true ? result['last_irreversible_block_num'] : result['head_block_number']
  }

  async getBlock(blockNumOrId: number): Promise<any> {
    return await this.rpc.get_block(blockNumOrId)
  }

  async getAccount(accountName: string): Promise<any> {
    return await this.rpc.get_account(accountName)
  }

  /**
   * 获取合约账户的abi
   * @param accountName
   * @returns {Promise<*>}
   */
  async getAbi(accountName: string): Promise<any> {
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
  async getTableRows(contractAccountName: string, primaryKey: string, tableName: string, toJson: boolean, start: number = 0, end: number = -1, limit: number = 10): Promise<any> {
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
  async getCurrencyBalance(contractAccountName: string, accountName: string, symbol: string = 'EOS'): Promise<string> {
    const strArr = await this.rpc.get_currency_balance(contractAccountName, accountName, symbol)
    if (strArr.length === 0) {
      return '0'
    }
    return strArr[0].removeLast_(symbol.length + 1).shiftedBy_(4)
  }

  async getCurrencyStats(contractAccountName: string, symbol: string): Promise<any> {
    const result = await this.rpc.get_currency_stats(contractAccountName, symbol)
    if (!result[symbol]) {
      throw new ErrorHelper(`错误`)
    }
    return result[symbol]
  }

  async getProducers(start: number = 0, limit: number = 0, toJson: boolean = false): Promise<any> {
    return await this.rpc.get_producers({
      lower_bound: start,
      limit,
      json: toJson
    })
  }

  async pushTransaction(signatures: Array<string>, txToSend: Uint8Array): Promise<any> {
    return await this.rpc.push_transaction({
      signatures,
      serializedTransaction: txToSend
    })
  }

  /**
   * 根据公钥获取使用它的所有账户名
   * @param publicKey
   * @returns {Promise<*>}
   */
  async getKeyAccounts(publicKey: string): Promise<any> {
    const result = await this.rpc.history_get_key_accounts({
      public_key: publicKey,
    })
    if (!result['account_names']) {
      throw new ErrorHelper(`错误`)
    }
    return result['account_names']
  }

  async getControlledAccounts(controllingAccount: string): Promise<any> {
    return await this.rpc.history_get_controlled_accounts({
      controlling_account: controllingAccount,
    })
  }
}

