import * as React from 'react'
import type { HeadFC } from 'gatsby'
import ArcadePage from '../components/Arcade/ArcadePage'

const IndexPage = () => <ArcadePage />

export default IndexPage

export const Head: HeadFC = () => (
  <>
    <html lang="en" />
    <title>Alessandro Pani</title>
    <meta
      name="description"
      content="Alessandro Pani — Computer Science student (UCR) who builds and ships production software. Every project is a playable mini-game."
    />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,500;0,600;1,400&family=Silkscreen:wght@400;700&display=swap"
    />
  </>
)
