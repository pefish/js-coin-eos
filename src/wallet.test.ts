import '@pefish/js-node-assist'
import assert from 'assert'
import { EosWallet } from './index'

describe('EosWalletHelper', () => {

  let helper: EosWallet

  before(async () => {
    helper = new EosWallet()
    await helper.initRemoteClient(`https://eos.hyperion.eosrio.io`, [`5Hz1Sw8x2haM2xKvuuh5d4MZUkJDnnd3ffVgQQSVYKgBFSN2yWP`, `5Hz1Sw8x2haM2xKvuuh5d4MZUkJDnnd3ffVgQQSVYKgBFSN2yWP`])
  })

  it('signMsg', async () => {
    try {
      const result = await helper.signMsg('test', `5Hz1Sw8x2haM2xKvuuh5d4MZUkJDnnd3ffVgQQSVYKgBFSN2yWP`)
      // console.error('result', result)
      assert.strictEqual(result, `SIG_K1_KctnL5bM78p3Hq8PbCTUiH2UztG5rwLzcn13T8iwGxGdfScUiBn4C6Ki4Pta9bq6Dn6QVNtErXaUXsH6MU8npGBPhFBjxf`)
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('verifyMsg', async () => {
    try {
      const result = await helper.verifyMsg('SIG_K1_KctnL5bM78p3Hq8PbCTUiH2UztG5rwLzcn13T8iwGxGdfScUiBn4C6Ki4Pta9bq6Dn6QVNtErXaUXsH6MU8npGBPhFBjxf', `test`,`EOS5G1ixaCHP3vNMhQsKPMnwSnjCrfYqLEZB87wDmVefQ7bcjw7ir`)
      // console.error('result', result)
      assert.strictEqual(result, true)
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('getAllByPrivateKey', async () => {
    try {
      const result = await helper.getAllByPrivateKey('5Hz1Sw8x2haM2xKvuuh5d4MZUkJDnnd3ffVgQQSVYKgBFSN2yWP')
      // console.error('result', result)
      assert.strictEqual(result.publicKey, `EOS5G1ixaCHP3vNMhQsKPMnwSnjCrfYqLEZB87wDmVefQ7bcjw7ir`)
    } catch (err) {
      console.error(err)
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
      // console.error('result', JSON.stringify(result))
      assert.strictEqual(result[0].data.account, `myloveeos123`)
    } catch (err) {
      console.error(err)
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
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('decodeAmount', async () => {
    try {
      const result = await helper.encodeAmount(`1`, `EOS`, 4)
      // console.error('result', result)
      assert.strictEqual(result, '0.0001 EOS')
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('decryptMemo', async () => {
    try {
      const nonce = 1234567
      const result = await helper.decryptMemo('5Hz1Sw8x2haM2xKvuuh5d4MZUkJDnnd3ffVgQQSVYKgBFSN2yWP', 'EOS6fzek8UfAsdDzgdHGGx5FUGHBp7gZnru5tkT7yivFTsdP74CpX', '224aae5a00af2aff608488bebb629873', nonce)
      // logger.error('result', result)
      assert.strictEqual(result, 'test')
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('encryptMemo', async () => {
    try {
      const nonce = 1234567
      const result = await helper.encryptMemo('5Hz1Sw8x2haM2xKvuuh5d4MZUkJDnnd3ffVgQQSVYKgBFSN2yWP', 'EOS6fzek8UfAsdDzgdHGGx5FUGHBp7gZnru5tkT7yivFTsdP74CpX', 'test', nonce)
      // logger.error('result', result)
      assert.strictEqual(result['message'], '224aae5a00af2aff608488bebb629873')
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('getAllBySeedAndIndex', async () => {
    try {
      const result = await helper.getAllBySeedAndIndex('da2a48a1b9fbade07552281143814b3cd7ba4b53a7de5241439417b9bb540e229c45a30b0ce32174aaccc80072df7cbdff24f0c0ae327cd5170d1f276b890173', 0)
      // console.error('result', result)
      assert.strictEqual(result['privateKey'], '5Hz1Sw8x2haM2xKvuuh5d4MZUkJDnnd3ffVgQQSVYKgBFSN2yWP')
    } catch (err) {
      console.error(err)
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
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('getTxObjFromHex', async () => {
    try {
      const result = helper.getTxObjFromHex('EDD9475C06804D0500FD0000000001309D694825875B56000000572D3CCDCD01304460937AF79C8900000000A8ED323229304460937AF79C893044C054A94DA3971027000000000000044545544800000008686168617465737400')
      // console.error('result', JSON.stringify(result))
      assert.strictEqual(result.actions.length, 1)
    } catch (err) {
      console.error(err)
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
      // console.error('result', JSON.stringify(result))
      assert.strictEqual(result.txObj.actions.length, 1)
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('signTxHex', async () => {
    try {
      const result = await helper.signTxObjForSig(
        JSON.parse(`{"expiration":"2019-01-22T02:20:42.000","ref_block_num":26826,"ref_block_prefix":1912720944,"max_net_usage_words":0,"max_cpu_usage_ms":0,"delay_sec":0,"context_free_actions":[],"actions":[{"account":"eosio.token","name":"transfer","authorization":[{"actor":"laijiyong123","permission":"active"}],"data":"A026FD95DE54AB49304460937AF79C89C05701000000000004454F5300000000046D616D6F"}],"transaction_extensions":[]}`)
        )
      // console.error('result', result)
      assert.strictEqual(result[0], `SIG_K1_JzxVp1CdrFDRYJfTTbARaNgvzSYSevuFY1Q4oxKNtfWgNbByzTC3iv3AURcoHN9rqpD1TEp6b4m2d6qan7iSQvXh1LAWvz`)
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

})
