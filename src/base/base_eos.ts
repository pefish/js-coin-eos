/**
 * Created by joy on 12/09/2017.
 */

/**
 * EOS系基类
 */
class BaseEosLike {
  encodeAmount (amount, symbol, decimals) {
    return amount.unShiftedBy_(decimals).remainDecimal_(decimals) + ' ' + symbol
  }

  decodeAmount (str) {
    const [amountWithDecimals, symbol] = str.split(' ')
    const [_, decimalsZero] = amountWithDecimals.split('.')
    return {
      amount: amountWithDecimals.shiftedBy_(decimalsZero.length),
      symbol,
      decimals: decimalsZero.length
    }
  }
}

export default BaseEosLike
