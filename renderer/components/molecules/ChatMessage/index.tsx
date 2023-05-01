import { Box, Button, Flex } from '@chakra-ui/react'
import {
  HiOutlinePlay,
  HiOutlineSparkles,
  HiOutlineUser
} from 'react-icons/hi2'
import { ChatMessage, MessageType } from '../../../lib/types/chat'
import Voice from '../Voice'
import { useEffect, useState } from 'react'
import { sendTextToSpeech } from '../../../lib/utils/textToSpeech'
import { bitcoinPrice } from '../../../lib/utils/llm/tools/bitcoinPrice'
import PriceWidget from '../PriceWidget'

interface ChatMessageProps {
  message: ChatMessage
  useVoice: boolean
  handleSendMessage: ({
    t,
    useTool
  }: {
    t?: string
    useTool?: {
      tool: string
      toolInput: string
    }
  }) => void
}

const ChatMessage = ({
  message,
  useVoice,
  handleSendMessage
}: ChatMessageProps) => {
  const [showToolBtn, setShowToolBtn] = useState(true)
  const [isSpeaking, setIsSpeaking] = useState(true)
  const [voice, setVoice] = useState<string | undefined>()
  const isAI = message.type === MessageType.AI
  const isTool = message.type === MessageType.Tool
  useEffect(() => {
    if (useVoice && isAI) {
      sendTextToSpeech(message.text, setVoice)
    }
  }, [useVoice])
  if (useVoice && isAI && !voice) {
    return null
  }
  if (isTool) {
    switch (message.tool) {
      case bitcoinPrice.name:
        return <PriceWidget currentPrice={message.text} data={message.data} />
      default:
        return <Box>Unkown tool</Box>
    }
  }
  return (
    <>
      <Flex>
        <Box
          color="gray.500"
          sx={{
            p: 3
          }}
        >
          {message.type === MessageType.Human ? (
            <HiOutlineUser size={20} />
          ) : (
            <HiOutlineSparkles size={20} />
          )}
        </Box>
        <Box>
          <Box
            borderWidth="1px"
            borderRadius="lg"
            maxW="xl"
            py={2}
            px={3}
            sx={{
              whiteSpace: 'pre-wrap',
              backgroundColor: isAI ? 'gray.50' : 'transparent',
              color: isAI ? 'gray.800' : 'gray.700'
            }}
            fontSize="sm"
          >
            {message.text}
          </Box>
          <Flex>
            {message.tool && showToolBtn ? (
              <Button
                variant="outline"
                colorScheme="green"
                mt={3}
                mr={2}
                size="xs"
                fontSize={12}
                fontWeight={500}
                onClick={() => {
                  handleSendMessage({
                    useTool: {
                      tool: message.tool,
                      toolInput: message.toolInput
                    }
                  })
                  setShowToolBtn(false)
                }}
                leftIcon={<HiOutlinePlay />}
              >
                Use {message.tool}
              </Button>
            ) : null}
            {isAI && useVoice && isSpeaking ? (
              <Voice voice={voice} setIsSpeaking={setIsSpeaking} />
            ) : null}
          </Flex>
        </Box>
      </Flex>
    </>
  )
}

export default ChatMessage
