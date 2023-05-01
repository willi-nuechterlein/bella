import React from 'react'
import { Box, Flex } from '@chakra-ui/react'

const VoiceAnimation = () => {
  const barAnimation = (delay) => ({
    animation: `heightChange 1s ease-in-out infinite alternate ${delay}s`,
    '@keyframes heightChange': {
      '0%, 100%': {
        height: '5px'
      },
      '50%': {
        height: '15px'
      }
    }
  })

  return (
    <Flex align="center" justify="center" h="2rem">
      {Array.from({ length: 8 }, (_, index) => (
        <Box
          key={index}
          borderRadius={10}
          bg="gray.400"
          w="3px"
          h="5px"
          mx="2px"
          sx={barAnimation(index * 0.2)}
        />
      ))}
    </Flex>
  )
}

export default VoiceAnimation
