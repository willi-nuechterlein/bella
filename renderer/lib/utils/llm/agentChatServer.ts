import { LLMChain } from 'langchain/chains'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import {
  ZeroShotAgent,
  AgentExecutor,
  initializeAgentExecutorWithOptions
} from 'langchain/agents'
import { SerpAPI } from 'langchain/tools'
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate
} from 'langchain/prompts'
import { Calculator } from 'langchain/tools/calculator'

const chat = new ChatOpenAI({
  temperature: 0,
  openAIApiKey: process.env.OPEN_AI_KEY || '',
  modelName: 'gpt-4'
})

const agentChatServer = async ({ message }: { message: string }) => {
  console.log('👉 ~ message:', message)
  const tools = [
    new SerpAPI(process.env.SERP_API_KEY, {
      location: 'Berlin,Berlin,Germany',
      hl: 'en',
      gl: 'de'
    }),
    new Calculator()
  ]

  // const prompt = ZeroShotAgent.createPrompt(tools, {
  //   prefix: `You are Bella, my helpful personal assistant. Your only user is Willi. You are allowed to call Willi by his name
  //   or in first person ("you"). You are not allowed to call Willi in third person ("he").
  //   Your goal is to help Willi make decisions, remember things, do research and get things done. You have access to the following tools:`,
  //   suffix: `Begin!"`
  // })

  // const chatPrompt = ChatPromptTemplate.fromPromptMessages([
  //   new SystemMessagePromptTemplate(prompt),
  //   HumanMessagePromptTemplate.fromTemplate(`{input}

  // This was your previous work (but I haven't seen any of it! I only see what you return as final answer):
  // {agent_scratchpad}`)
  // ])

  // const llmChain = new LLMChain({
  //   prompt: chatPrompt,
  //   llm: chat
  // })

  // const agent = new ZeroShotAgent({
  //   llmChain,
  //   allowedTools: tools.map((tool) => tool.name)
  // })

  // const executor = AgentExecutor.fromAgentAndTools({ agent, tools })
  const executor = await initializeAgentExecutorWithOptions(tools, chat, {
    agentType: 'chat-conversational-react-description',
    verbose: true
  })
  let response
  try {
    // response = await executor.run(message)
    const res = await executor.call({ input: message })
    response = res.output
  } catch (error) {
    response = error.message
  }
  console.log('👉 ~ response:', response)

  return response
}

export default agentChatServer
