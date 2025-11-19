/**
 * Notification sound utility using Web Audio API
 * Plays a pleasant notification sound when new notifications arrive
 */

let audioContext: AudioContext | null = null

/**
 * Initialize audio context (must be called after user interaction)
 */
function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    } catch {
      return null
    }
  }
  
  return audioContext
}

/**
 * Play a notification sound
 * Creates a pleasant two-tone notification sound
 */
export function playNotificationSound(): void {
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    // Create oscillator for the first tone
    const oscillator1 = ctx.createOscillator()
    const gainNode1 = ctx.createGain()
    
    oscillator1.connect(gainNode1)
    gainNode1.connect(ctx.destination)
    
    // First tone: 800Hz
    oscillator1.frequency.value = 800
    oscillator1.type = 'sine'
    
    // Envelope for first tone
    gainNode1.gain.setValueAtTime(0, ctx.currentTime)
    gainNode1.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01)
    gainNode1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
    
    oscillator1.start(ctx.currentTime)
    oscillator1.stop(ctx.currentTime + 0.15)
    
    // Create oscillator for the second tone
    const oscillator2 = ctx.createOscillator()
    const gainNode2 = ctx.createGain()
    
    oscillator2.connect(gainNode2)
    gainNode2.connect(ctx.destination)
    
    // Second tone: 1000Hz (higher pitch)
    oscillator2.frequency.value = 1000
    oscillator2.type = 'sine'
    
    // Envelope for second tone (starts after first)
    gainNode2.gain.setValueAtTime(0, ctx.currentTime + 0.1)
    gainNode2.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.11)
    gainNode2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
    
    oscillator2.start(ctx.currentTime + 0.1)
    oscillator2.stop(ctx.currentTime + 0.3)
  } catch {
    // Silent fail if audio playback fails
  }
}

/**
 * Resume audio context (needed for some browsers after page load)
 */
export function resumeAudioContext(): void {
  const ctx = getAudioContext()
  if (ctx && ctx.state === 'suspended') {
    ctx.resume()
  }
}
