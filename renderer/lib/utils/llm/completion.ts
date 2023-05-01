import { ChatOpenAI } from 'langchain/chat_models/openai'
import { ChatMessage, MessageType } from '../../types/chat'
import {
  DEFAULT_PREFIX,
  DEFAULT_SUFFIX,
  FORMAT_INSTRUCTIONS,
  PREFIX_END,
  TEMPLATE_TOOL_RESPONSE
} from '../../consts/prompts'
import {
  AIMessagePromptTemplate,
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
  renderTemplate
} from 'langchain/prompts'
import { parseOutput, validateTools } from './chatUtils'
import { LLMChain } from 'langchain/chains'
import { permissionTools, tools } from './tools'
import { bitcoinPrice } from './tools/bitcoinPrice'

const llm = new ChatOpenAI({
  temperature: 0,
  openAIApiKey: process.env.NEXT_PUBLIC_OPEN_AI_KEY || '',
  modelName: 'gpt-4'
})

const isPermissionTool = (toolName: string) => {
  return permissionTools.some(
    (tool) => tool.name.toLowerCase() === toolName.toLowerCase()
  )
}

const getChatCompletion = async ({
  messages,
  useTool,
  maxIterations = 3,
  currentIteration = 1,
  pushMessage
}: {
  messages: Array<ChatMessage>
  useTool?: { tool: string; toolInput: string }
  maxIterations?: number
  currentIteration?: number
  pushMessage: (message: ChatMessage) => void
}) => {
  console.log('👉 ~ currentIteration:', currentIteration)
  if (currentIteration >= maxIterations) {
    return { text: 'I exceeded the maximum number of iterations' }
  }
  validateTools(tools)

  const systemMessage = DEFAULT_PREFIX + PREFIX_END
  const toolStrings = tools
    .map((tool) => `${tool.name}: ${tool.description}`)
    .join('\n')
  const formatInstructions = renderTemplate(DEFAULT_SUFFIX, 'f-string', {
    format_instructions: FORMAT_INSTRUCTIONS
  })

  const toolsByName = Object.fromEntries(
    tools.map((t) => [t.name.toLowerCase(), t])
  )
  const toolNames = tools.map((tool) => tool.name).join('\n')
  const finalPrompt = renderTemplate(formatInstructions, 'f-string', {
    tools: toolStrings,
    tool_names: toolNames
  })

  const finalMessage = [HumanMessagePromptTemplate.fromTemplate(finalPrompt)]
  if (useTool) {
    pushMessage({
      type: MessageType.Info,
      text: `Using: "${useTool.tool}"`
    })
    console.log('👉 ~ useTool:', useTool)
    const tool = toolsByName[useTool.tool?.toLowerCase()]
    if (!tool) {
      return { text: "I don't know that tool" }
    }
    try {
      const toolOutput = await tool.call(useTool.toolInput)
      console.log('👉 ~ toolOutput:', toolOutput)
      if (tool.name === bitcoinPrice.name) {
        const toolData = JSON.parse(toolOutput)
        const { text, data } = toolData
        return { text, tool: tool.name, type: MessageType.Tool, data }
      }
      const toolOutputPrompt = renderTemplate(
        TEMPLATE_TOOL_RESPONSE,
        'f-string',
        {
          observation: String(toolOutput)
        }
      )
      finalMessage.push(AIMessagePromptTemplate.fromTemplate(toolOutputPrompt))
    } catch (error) {
      return { text: `I couldn't use that tool: ${error}` }
    }
  }
  const messagesHistory = [
    ...messages
      .filter((m) => m.type !== MessageType.Info && m.type !== MessageType.Tool)
      .map((m) => {
        if (m.type === MessageType.AI) {
          return AIMessagePromptTemplate.fromTemplate(m.text)
        }
        return HumanMessagePromptTemplate.fromTemplate(m.text)
      })
  ]

  const chatMessages = [
    SystemMessagePromptTemplate.fromTemplate(systemMessage),
    ...messagesHistory,
    ...finalMessage
    // new MessagesPlaceholder('agent_scratchpad')
  ]
  const chatPrompt = ChatPromptTemplate.fromPromptMessages(chatMessages)
  // console.log(
  //   '👉 ~ chatPrompt:',
  //   await chatPrompt.format({ input: messages[messages.length - 1].text })
  // )

  const chain = new LLMChain({
    prompt: chatPrompt,
    llm
  })
  const response = await chain.call({
    input: messages[messages.length - 1].text
  })
  const parsedOutput = await parseOutput(response.text)
  console.log('👉 ~ parsedOutput:', parsedOutput)
  if (parsedOutput.returnValues) {
    return { text: parsedOutput.returnValues.output }
  }
  const returnText = `I would like to use the tool "${String(
    parsedOutput.tool
  )}" to help you with that.`
  if (isPermissionTool(parsedOutput.tool)) {
    return {
      text: returnText,
      tool: parsedOutput.tool,
      toolInput: parsedOutput.toolInput
    }
  }
  return await getChatCompletion({
    pushMessage,
    currentIteration: currentIteration + 1,
    useTool: {
      tool: parsedOutput.tool,
      toolInput: parsedOutput.toolInput
    },
    messages: [
      ...messages,
      {
        text: returnText,
        type: MessageType.AI
      }
    ]
  })
}

export default getChatCompletion
