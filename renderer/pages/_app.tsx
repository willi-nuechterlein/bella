import React from 'react'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { ChakraProvider } from '@chakra-ui/react'
import '@shopify/polaris-viz/build/esm/styles.css'
import dynamic from 'next/dynamic'

const PolarisVizProvider = dynamic(
  () =>
    import('@shopify/polaris-viz').then((module) => module.PolarisVizProvider),
  { ssr: false }
)

import theme from '../lib/utils/chakra/theme'
import './App.css'

function App({ Component, pageProps }: AppProps) {
  return (
    <React.Fragment>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <ChakraProvider theme={theme}>
        <PolarisVizProvider>
          <div className="titleBarDraggable" />
          <Component {...pageProps} />
        </PolarisVizProvider>
      </ChakraProvider>
    </React.Fragment>
  )
}

export default App
