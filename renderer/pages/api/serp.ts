import type { NextApiRequest, NextApiResponse } from 'next'
import agentChatServer from '../../lib/utils/llm/agentChatServer'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const { query } = req.body
  console.log('👉 ~ message:', query)
  try {
    const response = await fetch(
      `https://serpapi.com/search?q=${query}&location=Berlin,Berlin,Germany&hl=en&gl=de&api_key=${process.env.SERP_API_KEY}`
    )
    const json = await response.json()
    res.status(200).send(json)
  } catch (error) {
    res.status(500).json({ error })
  }
}
