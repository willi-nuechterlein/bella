import React, { useState } from 'react'
import { Button } from '@chakra-ui/react'
import { HiOutlineMicrophone, HiOutlineStop } from 'react-icons/hi2'

const AudioRecorder = ({
  setText,
  isRecording,
  setIsRecording
}: {
  setText: (text: string) => void
  isRecording: boolean
  setIsRecording: (isRecording: boolean) => void
}) => {
  const [mediaRecorder, setMediaRecorder] = useState(null)

  const startRecording = async () => {
    if (!isRecording) {
      setIsRecording(true)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      const recorder = new MediaRecorder(stream)
      setMediaRecorder(recorder)

      const chunks = []

      recorder.ondataavailable = (event) => {
        chunks.push(event.data)
      }

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/wav' })
        const file = new File([blob], 'audio.wav', { type: 'audio/wav' })
        const data = new FormData()
        data.append('file', file)
        data.append('model', 'whisper-1')
        data.append('language', 'en')
        try {
          const response = await fetch(
            ' https://api.openai.com/v1/audio/transcriptions',
            {
              headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPEN_AI_KEY}`
              },
              method: 'POST',
              body: data
            }
          )
          const json = await response.json()
          const { text } = json
          setText(text)
        } catch (error) {
          console.error('Error sending audio:', error)
        }
      }

      recorder.start()
    } else {
      setIsRecording(false)
      mediaRecorder?.stop()
      setMediaRecorder(null)
    }
  }

  const stopRecording = () => {
    setIsRecording(false)
    mediaRecorder?.stop()
    mediaRecorder?.stream?.getTracks().forEach((track) => track.stop())
    setMediaRecorder(null)
  }

  //   useEffect(() => {
  //     const handleKeyDown = (event) => {
  //       if (event.code === 'Space' && !isRecording) {
  //         startRecording()
  //       }
  //     }

  //     const handleKeyUp = (event) => {
  //       if (event.code === 'Space' && isRecording) {
  //         stopRecording()
  //       }
  //     }

  //     window.addEventListener('keydown', handleKeyDown)
  //     window.addEventListener('keyup', handleKeyUp)

  //     return () => {
  //       window.removeEventListener('keydown', handleKeyDown)
  //       window.removeEventListener('keyup', handleKeyUp)
  //     }
  //   }, [isRecording])
  return (
    <Button
      tabIndex={-1}
      onMouseDown={startRecording}
      onMouseUp={stopRecording}
      variant="ghost"
      sx={{
        '&:hover': {
          backgroundColor: 'transparent'
        }
      }}
      leftIcon={
        isRecording ? (
          <HiOutlineStop size={20} />
        ) : (
          <HiOutlineMicrophone size={20} />
        )
      }
    />
  )
}

export default AudioRecorder
