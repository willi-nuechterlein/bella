import React from 'react'
import Head from 'next/head'
import Chat from '../components/molecules/Chat'

function Home() {
  return (
    <>
      <Head>
        <title>Bella</title>
      </Head>
      <Chat />
    </>
  )
}

export default Home
