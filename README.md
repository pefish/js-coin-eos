
## Transfer Token
```js
StarterUtil.startAsync(async () => {
  const walletHelper = new EosWallet()
  await walletHelper.initRemoteClient(`https://eos.newdex.one`, [pkey])
  const tx = await walletHelper.buildTransaction(
    [
      {
        account: 'eosio.token',
        name: 'transfer',
        authorization: [{ actor: account, permission: 'active' }],
        data:
        {
          from: "***",
          to: '***',
          quantity: '1000000.0000 EOS',
          memo: '**'
        }
      },
    ],
    300,
    true,
    true
  )
  console.log(tx.txId)
}, null, true)
```

## Delegate

```js
StarterUtil.startAsync(async () => {
  const walletHelper = new EosWallet()
  await walletHelper.initRemoteClient(`https://eos.newdex.one`, [pkey])
  const tx = await walletHelper.buildTransaction(
    [
      {
        account: "eosio",
        name: "delegatebw",
        authorization: [{ actor: account, permission: 'active' }],
        data: {
          from: "***",
          receiver: "***",
          stake_cpu_quantity: "20.0000 EOS",
          stake_net_quantity: "0.0000 EOS",
          transfer: false
        },
      },
    ],
    300,
    true,
    true
  )
  console.log(tx.txId)
}, null, true)
```
