import type { NextApiRequest, NextApiResponse } from 'next'
import agentChatServer from '../../lib/utils/llm/agentChatServer'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const { message } = req.body
  console.log('👉 ~ message:', message)
  try {
    const response = await agentChatServer({ message })
    console.log('👉 ~ response:', response)
    res.status(200).json(response)
  } catch (error) {
    res.status(500).json({ error })
  }
}
