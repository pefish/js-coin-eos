import '@pefish/js-node-assist'
import assert from 'assert'
import EosWalletHelper from './wallet'

describe('EosWalletHelper', () => {

  let helper

  before(async () => {
    helper = new EosWalletHelper()
    await helper.initRemoteClient(`https://eos.greymass.com`)
  })

  it('signTxHex', async () => {
    try {
      helper.installPrivateKey(`5Hz1Sw8x2haM2xKvuuh5d4MZUkJDnnd3ffVgQQSVYKgBFSN2yWP`)
      const result = await helper.signTxObjForSig(
        JSON.parse(`{"expiration":"2019-01-22T02:20:42.000","ref_block_num":26826,"ref_block_prefix":1912720944,"max_net_usage_words":0,"max_cpu_usage_ms":0,"delay_sec":0,"context_free_actions":[],"actions":[{"account":"eosio.token","name":"transfer","authorization":[{"actor":"laijiyong123","permission":"active"}],"data":"A026FD95DE54AB49304460937AF79C89C05701000000000004454F5300000000046D616D6F"}],"transaction_extensions":[]}`)
        )
      // global.logger.error('result', result)
      assert.strictEqual(result, `SIG_K1_JzxVp1CdrFDRYJfTTbARaNgvzSYSevuFY1Q4oxKNtfWgNbByzTC3iv3AURcoHN9rqpD1TEp6b4m2d6qan7iSQvXh1LAWvz`)
    } catch (err) {
      global.logger.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('getPubkeyFromWif', async () => {
    try {
      const result = await helper.getPubkeyFromWif('5Hz1Sw8x2haM2xKvuuh5d4MZUkJDnnd3ffVgQQSVYKgBFSN2yWP')
      // global.logger.error('result', result)
      assert.strictEqual(result, `EOS5G1ixaCHP3vNMhQsKPMnwSnjCrfYqLEZB87wDmVefQ7bcjw7ir`)
    } catch (err) {
      global.logger.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('decodeActions', async () => {
    try {
      const result = await helper.decodeActions(
        [
          {
            account: 'eosio',
            name: 'updateauth',
            authorization: [{
              actor: 'myloveeos123',
              permission: 'active'
            }
            ],
            data: '3044c054a94da39700000000a8ed32320000000080ab26a7020000000003a0986afb4a9a886700000000a8ed3232010010d8a48d1ad78d7b00000000a8ed32320100304460937af79c8900000000a8ed3232010000'
          }
        ]
      )
      // global.logger.error('result', JSON.stringify(result))
      assert.strictEqual(result[0].data.account, `myloveeos123`)
    } catch (err) {
      global.logger.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('buildTransaction', async () => {
    try {
      const result = await helper.buildTransaction(
        [
          { account: 'eosio.token',
            name: 'transfer',
            authorization: [ { actor: 'laijiyong123', permission: 'active' } ],
            data:
              { from: 'dappdropzone',
                to: 'laijiyong123',
                quantity: '8.8000 EOS',
                memo: 'mamo' } }
        ], 300, false
      )
      // global.logger.error('result', JSON.stringify(result))
      assert.strictEqual(!!result.txId, true)
    } catch (err) {
      global.logger.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('decodeAmount', async () => {
    try {
      const result = await helper.decodeAmount('10.0000 EOS')
      // logger.error('result', result)
      assert.strictEqual(result['symbol'], 'EOS')
      assert.strictEqual(result['decimals'], 4)
      assert.strictEqual(result['amount'], '100000')
    } catch (err) {
      global.logger.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('decodeAmount', async () => {
    try {
      const result = await helper.encodeAmount(`1`, "EOS", 4)
      // global.logger.error('result', result)
      assert.strictEqual(result, '0.0001 EOS')
    } catch (err) {
      global.logger.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('decryptMemo', async () => {
    try {
      const nonce = '1234567'
      const result = await helper.decryptMemo('5Hz1Sw8x2haM2xKvuuh5d4MZUkJDnnd3ffVgQQSVYKgBFSN2yWP', 'EOS6fzek8UfAsdDzgdHGGx5FUGHBp7gZnru5tkT7yivFTsdP74CpX', '224aae5a00af2aff608488bebb629873', nonce)
      // logger.error('result', result)
      assert.strictEqual(result, 'test')
    } catch (err) {
      global.logger.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('encryptMemo', async () => {
    try {
      const nonce = '1234567'
      const result = await helper.encryptMemo('5Hz1Sw8x2haM2xKvuuh5d4MZUkJDnnd3ffVgQQSVYKgBFSN2yWP', 'EOS6fzek8UfAsdDzgdHGGx5FUGHBp7gZnru5tkT7yivFTsdP74CpX', 'test', nonce)
      // logger.error('result', result)
      assert.strictEqual(result['message'], '224aae5a00af2aff608488bebb629873')
    } catch (err) {
      global.logger.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('getAllBySeedAndIndex', async () => {
    try {
      const result = await helper.getAllBySeedAndIndex('da2a48a1b9fbade07552281143814b3cd7ba4b53a7de5241439417b9bb540e229c45a30b0ce32174aaccc80072df7cbdff24f0c0ae327cd5170d1f276b890173', 0)
      // global.logger.error('result', result)
      assert.strictEqual(result['privateKey'], '5Hz1Sw8x2haM2xKvuuh5d4MZUkJDnnd3ffVgQQSVYKgBFSN2yWP')
    } catch (err) {
      global.logger.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('isPublicKeyString', async () => {
    try {
      const result = await helper.isPublicKey('EOS5G1ixaCHP3vNMhQsKPMnwSnjCrfYqLEZB87wDmVefQ7bcjw7ir')
      // logger.error('result', JSON.stringify(result))
      assert.strictEqual(result, true)

      const result1 = await helper.isPublicKey('EOS5G1ixaCHP3vNMhQsKPMnwSnjCrfYqLEZB87wDmVefQ7bcjw7i')
      // logger.error('result', JSON.stringify(result))
      assert.strictEqual(result1, false)
    } catch (err) {
      global.logger.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('getTxObjFromHex', async () => {
    try {
      const result = helper.getTxObjFromHex('EDD9475C06804D0500FD0000000001309D694825875B56000000572D3CCDCD01304460937AF79C8900000000A8ED323229304460937AF79C893044C054A94DA3971027000000000000044545544800000008686168617465737400')
      // global.logger.error('result', JSON.stringify(result))
      assert.strictEqual(result.actions.length, 1)
    } catch (err) {
      global.logger.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('buildTransaction', async () => {
    try {
      const result = await helper.buildTransaction(
        [
          { account: 'ethsidechain',
            name: 'transfer',
            authorization: [
              {
                actor: 'laijiyong123',
                permission: 'active'
              }
            ],
            data: {
              from: 'laijiyong123',
              to: 'myloveeos123',
              quantity: '1.0000 EETH',
              memo: 'hahatest'
            }
          }
        ], 60 * 60
      )
      // global.logger.error('result', JSON.stringify(result))
      assert.strictEqual(result.txObj.actions.length, 1)
    } catch (err) {
      global.logger.error(err)
      assert.throws(() => {}, err)
    }
  })



})
