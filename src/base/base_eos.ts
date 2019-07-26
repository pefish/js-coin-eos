/**
 * Created by joy on 12/09/2017.
 */

/**
 * EOS系基类
 */
class BaseEosLike {
  /**
   * 编码amount
   * @param amount 最小单位
   * @param symbol 货币名
   * @param decimals 精度
   */
  encodeAmount (amount: string, symbol: string, decimals: number): string {
    return amount.unShiftedBy_(decimals).remainDecimal_(decimals) + ' ' + symbol
  }

  decodeAmount (str: string): {amount: string, symbol: string, decimals: number} {
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
