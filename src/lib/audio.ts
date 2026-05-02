/**
 * Utility to play audio files safely without crashing on browser autoplay restrictions.
 */

export const playSound = (path: string, volume: number = 1) => {
  try {
    const audio = new Audio(path)
    audio.volume = volume
    
    const playPromise = audio.play()
    
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        // Auto-play was prevented
        console.warn(`Autoplay prevented for ${path}:`, error)
      })
    }
  } catch (err) {
    console.error(`Failed to play sound ${path}:`, err)
  }
}
