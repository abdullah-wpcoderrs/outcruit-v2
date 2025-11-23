// Dynamic Open Graph image generation for social sharing.
// Produces a 1200x630 PNG image using Next.js App Router.
import { ImageResponse } from 'next/og'

// Run on the Edge for fast response times
export const runtime = 'edge'

// OG metadata
export const alt = 'Outcruit - Recruitment Workflow Automation'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  // Return a branded image with accent and subtitle
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom right, #fbfbfb, #f0f0f0)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Decorative Background Circle */}
        <div
          style={{
            position: 'absolute',
            top: '-200px',
            right: '-100px',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'rgba(22, 163, 74, 0.1)',
            filter: 'blur(80px)',
          }}
        />

        {/* Logo / Brand Name */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 100,
            fontWeight: 800,
            color: '#1a1a1a',
            marginBottom: 20,
          }}
        >
          Outcruit
        </div>

        {/* Subtitle / Description */}
        <div
          style={{
            fontSize: 32,
            color: '#666',
            textAlign: 'center',
            maxWidth: '80%',
          }}
        >
          Recruitment Workflow Automation
        </div>

        {/* Accent Bar */}
        <div
          style={{
            marginTop: 50,
            width: '200px',
            height: '8px',
            background: '#16a34a',
            borderRadius: '4px',
          }}
        />
      </div>
    ),
    { ...size }
  )
}