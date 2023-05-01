import { Tool } from 'langchain/tools'

export const parseOutput = async (text) => {
  let jsonOutput = text.trim()
  if (jsonOutput.includes('```json')) {
    jsonOutput = jsonOutput.split('```json')[1].trimStart()
  }
  if (jsonOutput.includes('```')) {
    jsonOutput = jsonOutput.split('```')[0].trimEnd()
  }
  if (jsonOutput.startsWith('```')) {
    jsonOutput = jsonOutput.slice(3).trimStart()
  }
  if (jsonOutput.endsWith('```')) {
    jsonOutput = jsonOutput.slice(0, -3).trimEnd()
  }
  let response
  try {
    response = JSON.parse(jsonOutput)
  } catch (error) {
    return { returnValues: { output: text } }
  }

  const { action, action_input } = response

  if (action === 'Final Answer') {
    return { returnValues: { output: action_input }, log: text }
  }
  return { tool: action, toolInput: action_input, log: text }
}

export const validateTools = (tools: Tool[]) => {
  const invalidTool = tools.find((tool) => !tool.description)
  if (invalidTool) {
    const msg =
      `Got a tool ${invalidTool.name} without a description.` +
      ` This agent requires descriptions for all tools.`
    throw new Error(msg)
  }
}
