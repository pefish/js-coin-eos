import '@pefish/js-node-assist'
import assert from 'assert'
import EosRemoteHelper from './remote'


describe('EosRemoteHelper', () => {

  let helper

  before(async () => {
    helper = new EosRemoteHelper({
      protocol: 'https',
      host: 'eos.greymass.com'
    })
    await helper.init()
  })

  it('getInfo', async () => {
    try {
      const result = await helper.getInfo()
      global.logger.error('result', result)
      assert.strictEqual(result['chain_id'], '43ec0b688b955f163c435a4e4927dd94b835de73af315def93e8a51ba3d084cc')
    } catch (err) {
      global.logger.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('getBalance', async () => {
    try {
      const result = await helper.getBalance('eosio.token', 'withdraw', 'SYS')
      global.logger.error('result', result)
      assert.strictEqual(result.add(1).gt(0), true)
    } catch (err) {
      global.logger.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('getChainId', async () => {
    try {
      const result = await helper.getChainId()
      // logger.error('result', result)
      assert.strictEqual(result, '43ec0b688b955f163c435a4e4927dd94b835de73af315def93e8a51ba3d084cc')
    } catch (err) {
      global.logger.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('getControlledAccounts', async () => {
    try {
      const result = await helper.getControlledAccounts('test')
      // logger.error('result', JSON.stringify(result))
      // assert.strictEqual(result.length > 0, true)
    } catch (err) {
      global.logger.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('getKeyAccounts', async () => {
    try {
      const result = await helper.getKeyAccounts('EOS8DULkPK25CsbkTuoTzuLdU44FY7k5qJoaNN9Aqg8jpkJT6ZHGX')
      // logger.error('result', JSON.stringify(result))
      assert.strictEqual(result.length === 0, true)
    } catch (err) {
      global.logger.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('getTransaction', async () => {
    try {
      const result = await helper.getTransaction('ef11e9916c66029b623b74744683fe0676c73b64dc0db231f5dbccdd67f368b1')
      // logger.error('result', JSON.stringify(result))
      assert.strictEqual(result['id'], 'ef11e9916c66029b623b74744683fe0676c73b64dc0db231f5dbccdd67f368b1')
    } catch (err) {
      global.logger.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('getActions', async () => {
    try {
      const result = await helper.getActions('test', -1, 0)
      // logger.error('result', JSON.stringify(result))
      // assert.strictEqual(result['supply'], '1000000000.0000 EOS')
    } catch (err) {
      global.logger.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('getCurrencyStats', async () => {
    try {
      const result = await helper.getCurrencyStats('eosio.token', 'EOS')
      // logger.error('result', result)
      assert.strictEqual(result['supply'], '1000000000.0000 EOS')
    } catch (err) {
      global.logger.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('abiBinToJson', async () => {
    try {
      const result = await helper.abiBinToJson('eosio.token', 'transfer', '000000000090b1ca000000dcdcd4b2e3102700000000000000454f53000000000468616861')
      // logger.error('result', result)
      assert.strictEqual(result['quantity'], '10000 EOS')
    } catch (err) {
      global.logger.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('abiJsonToBin', async () => {
    try {
      const result = await helper.abiJsonToBin('eosio.token', 'transfer', {
        from: 'test',
        to: 'withdraw',
        quantity: '10000 EOS',
        memo: 'haha'
      })
      // logger.error('result', result)
      assert.strictEqual(result, '000000000090b1ca000000dcdcd4b2e3102700000000000000454f53000000000468616861')
    } catch (err) {
      global.logger.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('help', async () => {
    try {
      // await helper.help('getInfo')
      // assert.strictEqual(result, 'Aatqqnhk5T3APLPDYzCuAXuTyGEufu8LEL')
    } catch (err) {
      global.logger.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('getLatestHeight', async () => {
    try {
      const result = await helper.getLatestHeight()
      // logger.error('result', result)
      assert.strictEqual(result.gt(0), true)
    } catch (err) {
      global.logger.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('getBlock', async () => {
    try {
      const result = await helper.getBlock(1000)
      // logger.error('result', result)
      assert.strictEqual(result['transactions'] instanceof Array, true)
    } catch (err) {
      global.logger.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('getAccount', async () => {
    try {
      const result = await helper.getAccount('withdraw')
      // logger.error('result', result)
      assert.strictEqual(result['account_name'], 'withdraw')
    } catch (err) {
      global.logger.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('getAbi', async () => {
    try {
      const result = await helper.getAbi('eosio.token')
      // logger.error('result', result)
      assert.strictEqual(result['account_name'], 'eosio.token')
    } catch (err) {
      global.logger.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('getCode', async () => {
    try {
      const result = await helper.getCode('eosio.token')
      // logger.error('result', result)
      assert.strictEqual(result['account_name'], 'eosio.token')
    } catch (err) {
      global.logger.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('getBalance', async () => {
    try {
      const result = await helper.getBalance('eosio.token', 'withdraw')
      // logger.error('result', result)
      assert.strictEqual(result.add(1).gt(0), true)
    } catch (err) {
      global.logger.error(err)
      assert.throws(() => {}, err)
    }
  })
})

