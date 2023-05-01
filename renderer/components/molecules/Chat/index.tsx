import {
  Box,
  VStack,
  Input,
  Button,
  Flex,
  SlideFade,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Checkbox,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger
} from '@chakra-ui/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ipcRenderer } from 'electron'
import {
  ChatMessage as ChatMessageType,
  MessageType
} from '../../../lib/types/chat'
import AudioRecorder from '../AudioRecorder'
import {
  HiCheck,
  HiOutlineListBullet,
  HiOutlinePaperAirplane
} from 'react-icons/hi2'
import getChatCompletion from '../../../lib/utils/llm/completion'
import ChatMessage from '../ChatMessage'

const Chat: React.FC = () => {
  const [useVoice, setUseVoice] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [isRecording, setIsRecording] = useState(false)

  const [messages, setMessages] = useState<Array<ChatMessageType>>([
    // { text: '27367', tool: 'bitcoinPrice', type: 'tool' }
  ])
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isThinking, isRecording])

  const pushMessage = useCallback((message: ChatMessageType) => {
    setMessages((prev) => [...prev, message])
  }, [])

  useEffect(() => {
    ipcRenderer.on('app-focus', () => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    })
    ipcRenderer.on('paste-highlighted-text', (_event, highlightedText) => {
      const alreadyInChat = messages.some(
        (message) => message.text === highlightedText
      )
      if (alreadyInChat) return
      const newPasteMessage = {
        text: highlightedText,
        type: MessageType.Human
      }
      pushMessage(newPasteMessage)
    })

    return () => {
      ipcRenderer.removeAllListeners('app-focus')
      ipcRenderer.removeAllListeners('paste-highlighted-text')
    }
  }, [])

  const handleSendMessage = async ({
    t,
    useTool
  }: {
    t?: string
    useTool?: {
      tool: string
      toolInput: string
    }
  }) => {
    const newMessages = messages
    if (t || input) {
      newMessages.push({ text: t || input, type: MessageType.Human })
    }
    setIsThinking(true)
    setMessages(newMessages)
    setInput('')
    const response = await getChatCompletion({
      messages: newMessages,
      useTool,
      pushMessage
    })
    console.log('👉 ~ response:', response)
    if (response) {
      pushMessage({
        text: response.text,
        type: response.type || MessageType.AI,
        tool: response.tool,
        toolInput: response.toolInput,
        data: response.data
      })
    }
    setIsThinking(false)
  }

  const addRecording = (text: string) => {
    handleSendMessage({ t: text })
  }

  return (
    <Flex
      direction="column"
      justifyContent="flex-end"
      maxW="xl"
      height="87vh"
      sx={{
        marginX: 'auto',
        '& ::-webkit-scrollbar': {
          display: 'none'
        }
      }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (input) {
            handleSendMessage({})
          }
        }}
        style={{
          overflow: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        <VStack
          ref={scrollRef}
          spacing={3}
          sx={{
            pt: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            height: '100%',
            width: '100%',
            overflow: 'auto'
          }}
        >
          {messages
            .filter((message) => message.type !== MessageType.System)
            .map((message, index) => (
              <SlideFade
                in={true}
                offsetY="20px"
                key={index}
                className={message.type === MessageType.Human ? 'user' : ''}
              >
                {message.type === MessageType.Info ? (
                  <Button
                    as="div"
                    variant="ghost"
                    size="xs"
                    ml={10}
                    mt={-2}
                    sx={{
                      cursor: 'default',
                      '&:hover': {
                        backgroundColor: 'transparent'
                      }
                    }}
                    colorScheme="blackAlpha"
                    leftIcon={<HiCheck />}
                  >
                    {message.text}
                  </Button>
                ) : (
                  <ChatMessage
                    message={message}
                    useVoice={useVoice}
                    handleSendMessage={handleSendMessage}
                  />
                )}
              </SlideFade>
            ))}
          <Box h="3rem" pl={9}>
            {isThinking ? (
              <Button
                as="div"
                isLoading
                loadingText="thinking..."
                variant="ghost"
                alignSelf="flex-start"
              />
            ) : null}
            {isRecording ? (
              <Button
                as="div"
                isLoading
                loadingText="listening..."
                variant="ghost"
                alignSelf="flex-end"
              />
            ) : null}
          </Box>
        </VStack>
        <Flex
          flexDirection="column"
          sx={{
            width: '100%',
            backgroundColor: 'white',
            my: 4,
            position: 'absolute',
            bottom: 0
          }}
          maxW="xl"
        >
          <InputGroup>
            <InputLeftElement
              ml={1}
              color="gray.600"
              children={
                <AudioRecorder
                  setText={addRecording}
                  setIsRecording={setIsRecording}
                  isRecording={isRecording}
                />
              }
            />
            <Input
              ref={inputRef}
              fontSize="sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              tabIndex={0}
            />
            <InputRightElement
              color="gray.600"
              mr={1}
              children={
                <Button
                  disabled={isThinking || isRecording}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'transparent'
                    }
                  }}
                  variant="ghost"
                  type="submit"
                  leftIcon={<HiOutlinePaperAirplane size={20} />}
                />
              }
            />
          </InputGroup>
          <Popover placement="top">
            <PopoverTrigger>
              <Button
                size="xs"
                w="3rem"
                mt={2}
                mr={1}
                alignSelf={'flex-end'}
                variant="ghost"
                iconSpacing={0}
                leftIcon={<HiOutlineListBullet size={20} />}
              />
            </PopoverTrigger>
            <PopoverContent w={150}>
              <PopoverArrow />
              <PopoverCloseButton />
              <PopoverHeader fontSize={13}>Settings</PopoverHeader>
              <PopoverBody>
                <VStack spacing={3}>
                  <Button
                    alignSelf={'flex-start'}
                    mt={1}
                    mr={2}
                    type="button"
                    size="xs"
                    variant="outline"
                    colorScheme="blackAlpha"
                    onClick={() => {
                      setMessages([])
                    }}
                  >
                    clear chat
                  </Button>
                  <Checkbox
                    alignSelf={'flex-start'}
                    isChecked={useVoice}
                    onChange={(e) => {
                      setMessages([])
                      setUseVoice(e.target.checked)
                    }}
                    colorScheme="gray"
                    size="md"
                  >
                    <Box as="span" ml={1} fontSize={13} fontWeight={500}>
                      voice
                    </Box>
                  </Checkbox>
                </VStack>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </Flex>
      </form>
    </Flex>
  )
}

export default Chat
