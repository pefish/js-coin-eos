import '@pefish/js-node-assist'
import HttpRequest from '@pefish/js-util-httprequest'

export default class EosRemoteRio {
  endpoint: string

  constructor(endpoint: string = `https://eos.hyperion.eosrio.io`) {
    this.endpoint = endpoint
  }

  /**
   * 读取跟某账户有关的所有交易记录.
   * @param accountName
   * @param pos {number} 表示从哪个位置开始往前取. 0就是从最后一条往前取（包含最后一条）
   * @param offset {number} 表示往前取多少位。2表示往前取2位，包含第0条，也就是返回3条action。（但如果是0，则往前取20条）
   * @returns {Promise<void>}
   */
  async getActionsV1(accountName: string, pos: number = 0, offset: number = 1): Promise<any> {
    return await HttpRequest.post(`${this.endpoint}/v1/history/get_actions`, {
      params: {
        account_name: accountName,
        pos,
        offset,
        sort: `desc`,
      }
    })
  }

  async getActionsV2(opts: {
    account: string,
    skip?: number,
    limit?: number,
    sort?: string,
  }): Promise<{
    actions: {
      act: {
        authorization: {actor: string, permission: string}[],
        data: {
          from: string,
          to: string,
          amount: number,
          symbol: string,
          memo: string,
        },
        account: string,
        name: string,
      },
      [`@timestamp`]: string,
      block_num: number,
      producer: string,
      trx_id: string,
      global_sequence: number,
      notified: string[],
    }[],
    [x: string]: any,
  }> {
    return await HttpRequest.get(`${this.endpoint}/v2/history/get_actions`, {
      params: {
        account: opts.account,
        skip: opts.skip || 0,
        limit: opts.limit || 10,
        sort: opts.sort || `desc`,
      }
    })
  }

  async getTransactionV1(txHash: string): Promise<any> {
    return await HttpRequest.post(`${this.endpoint}/v1/history/get_transaction`, {
      params: {
        id: txHash,
      }
    })
  }

  async getTransactionV2(txHash: string): Promise<any> {
    return await HttpRequest.get(`${this.endpoint}/v2/history/get_transaction`, {
      params: {
        id: txHash,
      }
    })
  }

}

