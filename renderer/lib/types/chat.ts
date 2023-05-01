export enum MessageType {
  Human = 'human',
  System = 'system',
  AI = 'ai',
  Info = 'info',
  Tool = 'tool'
}

export interface ChatMessage {
  text: string
  type: MessageType
  tool?: string
  toolInput?: string
  data?: any
}
