import { NativeCurrency } from '@sushiswap/core-sdk'
import { WrappedTokenInfo } from 'app/state/lists/wrappedTokenInfo'
import { BigNumber } from 'bignumber.js'

const noExponents = (num: number) => {
  const data = String(num).split(/[eE]/)
  if (data.length === 1) return data[0]

  let z = ''
  const sign = num < 0 ? '-' : ''
  const str = data[0].replace('.', '')
  let mag = Number(data[1]) + 1

  if (mag < 0) {
    z = `${sign}0.`
    while (mag) {
      mag += 1
      z += '0'
    }
    return z + str.replace(/^-/, '')
  }
  mag -= str.length
  while (mag) {
    mag -= 1
    z += '0'
  }
  return str + z
}

export function numberFormatter(balance: number | string) {
  const number = new BigNumber(balance)
  const numberAsString = number.toString()
  const toNum = parseFloat(numberAsString.slice(0, numberAsString.indexOf('.') + 9))
  const formatNumber = noExponents(toNum)

  return formatNumber
}

export const getTokenFromCurrency = (
  currency: NativeCurrency | false | 0 | undefined | any
): currency is WrappedTokenInfo => currency
