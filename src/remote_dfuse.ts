import '@pefish/js-node-assist'
import HttpRequest from '@pefish/js-util-httprequest'

export default class EosRemoteDefuse {
  private jwt: string
  private apiKey: string
  private apiUrl: string = `https://mainnet.eos.dfuse.io`
  private authUrl: string = `https://auth.dfuse.io`

  constructor (apiKey: string) {
    this.apiKey = apiKey
  }

  async refreshJwt () {
    const result = await HttpRequest.post(`${this.authUrl}/v1/auth/issue`, {
      params: {
        api_key: this.apiKey,
      },
    })
    this.jwt = result.token
  }

  async getTransaction(txHash: string): Promise<any> {
    return await HttpRequest.get(`${this.apiUrl}/v0/transactions/${txHash.toLowerCase()}`, {
      headers: {
        Authorization: `Bearer ${this.jwt}`
      }
    })
  }

  async searchTransactions(opts: {
    q: string, // (auth:account OR receiver:account OR data.to:account OR data.from:account OR data.receiver:account) data.to:account
    sort: `desc` | `asc`,
    limit: number,
    with_reversible: boolean,
    start_block?: number, // 从哪个块开始查找。默认值0，desc时表示最新块往下查找，asc时表示第0个块往上找
    block_count?: number, // 从start_block开始查找多少个块。默认无穷
    cursor?: string, // 游标位置，sort为 desc，limit为5则是游标向下5个，会返回最后一个元素的游标
  }): Promise<any> {
    return await HttpRequest.get(`${this.apiUrl}/v0/search/transactions`, {
      params: {
        q: opts.q,
        sort: opts.sort,
        limit: opts.limit,
        withReversible: opts.with_reversible,
        start_block: opts.start_block,
        block_count: opts.block_count,
        cursor: opts.cursor,
      },
      headers: {
        Authorization: `Bearer ${this.jwt}`
      },
    })
  }
}

