import { Interface } from '@ethersproject/abi'
import { ExternalProvider } from '@ethersproject/providers'
import { Currency, CurrencyAmount, JSBI, NATIVE, Token } from '@sushiswap/core-sdk'
import ERC20_ABI from 'app/constants/abis/erc20.json'
import { getErc20Contract } from 'app/functions'
import { isAddress } from 'app/functions/validate'
import { useInterfaceMulticall } from 'app/hooks/useContract'
import {
  useMultipleContractSingleDataWithChainId,
  useSingleContractMultipleDataWithChainId,
} from 'app/lib/hooks/multicall'
import { useActiveWeb3React } from 'app/services/web3'
import { getWeb3Provider, getWeb3ProviderInstance } from 'connectors/web3Providers'
import { ethers } from 'ethers'
import { useCallback, useEffect, useMemo, useState } from 'react'

/**
 * Returns a map of the given addresses to their eventually consistent ETH balances.
 */
export function useNativeCurrencyBalances(
  uncheckedAddresses?: (string | undefined)[],
  chainIdParam?: number
): {
  [address: string]: CurrencyAmount<Currency> | undefined
} {
  const { chainId: web3ChainId } = useActiveWeb3React()
  const chainId = chainIdParam ?? web3ChainId
  const multicallContract = useInterfaceMulticall()

  const validAddressInputs: [string][] = useMemo(
    () =>
      uncheckedAddresses
        ? uncheckedAddresses
            .map(isAddress)
            .filter((a): a is string => a !== false)
            .sort()
            .map((addr) => [addr])
        : [],
    [uncheckedAddresses]
  )

  const results = useSingleContractMultipleDataWithChainId(
    chainId,
    multicallContract,
    'getEthBalance',
    validAddressInputs
  )

  return useMemo(
    () =>
      validAddressInputs.reduce<{
        [address: string]: CurrencyAmount<Currency>
      }>((memoP, [address], i) => {
        const memo = memoP
        const value = results?.[i]?.result?.[0]
        if (value && chainId)
          memo[address] = CurrencyAmount.fromRawAmount((NATIVE as any)[chainId], JSBI.BigInt(value.toString()))
        return memo
      }, {}),
    [validAddressInputs, chainId, results]
  )
}

const ERC20Interface = new Interface(ERC20_ABI)
const tokenBalancesGasRequirement = { gasRequired: 125_000 }

/**
 * Returns a map of token addresses to their eventually consistent token balances for a single account.
 */
export function useTokenBalancesWithLoadingIndicator(
  address?: string,
  tokens?: (Token | undefined)[],
  chainIdParam?: number
): [{ [tokenAddress: string]: CurrencyAmount<Token> | undefined }, boolean] {
  const validatedTokens: Token[] = useMemo(
    () => tokens?.filter((t?: Token): t is Token => isAddress(t?.address) !== false) ?? [],
    [tokens]
  )

  const { chainId: web3ChainId } = useActiveWeb3React()
  const chainId = chainIdParam ?? web3ChainId
  const validatedTokenAddresses = useMemo(() => validatedTokens.map((vt) => vt.address), [validatedTokens])
  const multicallContract = useInterfaceMulticall()

  const balances = useMultipleContractSingleDataWithChainId(
    useMemo(() => chainId, [chainId]),
    validatedTokenAddresses,
    ERC20Interface,
    'balanceOf',
    useMemo(() => [address], [address]),
    tokenBalancesGasRequirement
  )

  const anyLoading: boolean = useMemo(() => balances.some((callState) => callState.loading), [balances])

  return useMemo(
    () => [
      address && validatedTokens.length > 0
        ? validatedTokens.reduce<{
            [tokenAddress: string]: CurrencyAmount<Token> | undefined
          }>((memoP, token, i) => {
            const memo = memoP
            const value = balances?.[i]?.result?.[0]
            const amount = value ? JSBI.BigInt(value.toString()) : undefined
            if (amount) {
              memo[token.address] = CurrencyAmount.fromRawAmount(token, amount)
            }
            return memo
          }, {})
        : {},
      anyLoading,
    ],
    [address, validatedTokens, anyLoading, balances]
  )
}

export function useTokenBalances(
  address?: string,
  tokens?: (Token | undefined)[],
  chainId?: number
): { [tokenAddress: string]: CurrencyAmount<Token> | undefined } {
  return useTokenBalancesWithLoadingIndicator(address, tokens, chainId)[0]
}

// get the balance for a single token/account combo
export function useTokenBalance(account?: string, token?: Token, chainId?: number): CurrencyAmount<Token> | undefined {
  const tokenBalances = useTokenBalances(
    account,
    useMemo(() => [token], [token]),
    useMemo(() => chainId, [chainId])
  )
  if (!token) return undefined
  return tokenBalances[token.address]
}

export function useCurrencyBalances(
  account?: string,
  currencies?: (Currency | undefined)[],
  chainId?: number
): (CurrencyAmount<Currency> | undefined)[] {
  const tokens = useMemo(
    () => currencies?.filter((currency): currency is Token => currency?.isToken ?? false) ?? [],
    [currencies]
  )

  const tokenBalances = useTokenBalances(
    account,
    tokens,
    useMemo(() => chainId, [chainId])
  )

  const containsETH: boolean = useMemo(() => currencies?.some((currency) => currency?.isNative) ?? false, [currencies])

  const ethBalance = useNativeCurrencyBalances(
    useMemo(() => (containsETH ? [account] : []), [containsETH, account]),
    useMemo(() => chainId, [chainId])
  )

  return useMemo(
    () =>
      currencies?.map((currency) => {
        if (!account || !currency) return undefined
        if (currency.isToken) return tokenBalances[currency.address]
        if (currency.isNative) return ethBalance[account]
        return undefined
      }) ?? [],
    [account, currencies, ethBalance, tokenBalances, chainId]
  )
}

export default function useCurrencyBalance(
  account?: string,
  currency?: Currency,
  chainId?: number
): CurrencyAmount<Currency> | undefined {
  return useCurrencyBalances(
    account,
    useMemo(() => [currency], [currency]),
    useMemo(() => chainId, [chainId])
  )[0]
}

export function useTokenAndEtherBalanceFromContract(account?: string, token?: Token, chainId?: number) {
  const web3 = getWeb3ProviderInstance(chainId)
  const provider = new ethers.providers.Web3Provider(getWeb3Provider(chainId) as ExternalProvider)
  const [balance, setBalance] = useState<number>(0)

  // if (!account) {
  //     return null
  // }

  const erc20Contract = getErc20Contract(
    token?.address ?? '',
    provider
    // account ?? ''
  )
  const fetchBalance = useCallback(async () => {
    async function getBalance(): Promise<any> {
      try {
        let bal
        if (token && (!token?.address || !erc20Contract)) {
          bal = await web3.eth.getBalance(account ?? '')
        } else if (token?.address && erc20Contract) {
          bal = await erc20Contract?.balanceOf(account)
        }
        return bal
      } catch (e) {
        return 0
      }
    }
    const b = await getBalance()
    const formattedBal = b ? web3.utils.fromWei(b.toString(), 'ether') : '0'
    setBalance(parseFloat(formattedBal))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balance, setBalance, token, chainId, account])

  useEffect(() => {
    if (account && chainId) {
      fetchBalance()
    }
  }, [balance, setBalance, token, chainId, account, fetchBalance])

  return balance
}
