import { Calculator } from 'langchain/tools/calculator'

export const langTools = [
  // new SerpAPI(process.env.SERP_API_KEY, {
  //   location: 'Berlin,Berlin,Germany',
  //   hl: 'en',
  //   gl: 'de'
  // }),
  new Calculator()
]
