import '@pefish/js-node-assist'
import assert from 'assert'
import EosRemoteHelper from './remote'
import { Remote } from 'src';
import EosRemoteRio from './remote_rio';


describe('EosRemoteRio', () => {

  let helper: EosRemoteRio

  before(async () => {
    helper = new EosRemoteRio()
    global[`logger`] = console
  })

  it('getActionsV1', async () => {
    try {
      const result = await helper.getActionsV1(`zgeosdeposit`, 0, 1)
      // console.error('result', result)
      assert.strictEqual(result['actions'].length === 2, true)
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('getTransactionV1', async () => {
    try {
      const result = await helper.getTransactionV1(`6bbef907b78d94676378d16bff51bc77ac8e83c5d2e13542711f78848b218aa3`)
      // console.error('result', result)
      assert.strictEqual(result.id, `6bbef907b78d94676378d16bff51bc77ac8e83c5d2e13542711f78848b218aa3`)
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  }) 
  
  it('getTransactionV2', async () => {
    try {
      const result = await helper.getTransactionV2(`6bbef907b78d94676378d16bff51bc77ac8e83c5d2e13542711f78848b218aa3`)
      // console.error('result', result)
      assert.strictEqual(result.trx_id, `6bbef907b78d94676378d16bff51bc77ac8e83c5d2e13542711f78848b218aa3`)
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  }) 
})

