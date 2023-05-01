import { Button, Flex } from '@chakra-ui/react'
import React, { useEffect, useRef } from 'react'
import { HiOutlineStop } from 'react-icons/hi2'
import VoiceAnimation from '../../atoms/VoiceAnimation'

const Voice = ({
  voice,
  setIsSpeaking
}: {
  voice: string
  setIsSpeaking: (isSpeaking: boolean) => void
}) => {
  const audioRef = useRef(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = voice
    }
    return () => {
      if (audioRef.current) {
        audioRef.current = null
      }
    }
  }, [voice])

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsSpeaking(false)
    }
  }

  const handleAudioEnded = () => {
    setIsSpeaking(false)
  }

  return (
    <Flex alignItems="center" mt={2}>
      {false && (
        <Button
          type="button"
          onClick={stopAudio}
          size="xs"
          variant="outline"
          colorScheme="blackAlpha"
          iconSpacing={0}
          leftIcon={<HiOutlineStop size={17} color="red" />}
          mr={2}
        />
      )}
      <VoiceAnimation />
      <audio ref={audioRef} autoPlay onEnded={handleAudioEnded} />
    </Flex>
  )
}

export default Voice
