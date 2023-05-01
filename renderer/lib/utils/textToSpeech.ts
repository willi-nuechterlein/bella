export const sendTextToSpeech = async (
  text: string,
  setVoice: (voice: string) => void
) => {
  const voiceId = 'EXAVITQu4vr4xnSDxMaL'
  const apiKey = process.env.NEXT_PUBLIC_ELEVEN_LABS_API_KEY || ''
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`

  const requestOptions = {
    method: 'POST',
    headers: {
      'accept': 'audio/mpeg',
      'xi-api-key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text,
      voice_settings: {
        stability: 0.55,
        similarity_boost: 0.6
      }
    })
  }

  try {
    const response = await fetch(url, requestOptions)
    const audioBlob = await response.blob()

    const blobUrl = URL.createObjectURL(audioBlob)
    setVoice(blobUrl)
  } catch (error) {
    console.error('Error fetching and playing audio:', error)
    setVoice('')
  }
}
