import { DynamicTool } from 'langchain/tools'
import { format } from 'date-fns'
import numeral from 'numeral'

export const bitcoinPrice = new DynamicTool({
  name: 'bitcoinPrice',
  description:
    'bitcoin price search. get the current and past month price of bitcoin in USD.',
  func: async () => {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
    )
    const chartResponse = await fetch(
      'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=90&interval=daily'
    )
    const chartRes = await chartResponse.json()
    const chartData = chartRes.prices.map((price) => {
      return {
        value: Number(price[1].toFixed(0)),
        key: format(new Date(price[0]), 'dd.MM.yy')
      }
    })
    const res = await response.json()
    if (res.error) {
      return JSON.stringify({
        text: `Got error from bitcoin API: ${res.error}`
      })
    }

    if (res.bitcoin.usd && chartData) {
      return JSON.stringify({
        text: String(numeral(res.bitcoin.usd).format('0,0')),
        data: chartData
      })
    }

    return JSON.stringify({ text: 'No good search result found' })
  }
})
