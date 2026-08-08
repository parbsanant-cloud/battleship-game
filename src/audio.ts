export type CombatCue =
  | 'miss'
  | 'hit-impact'
  | 'hit-explosion'
  | 'sunk'
  | 'victory'
  | 'defeat'

const POOL_SIZE = 3
const VOLUME = 0.35

const CUE_URLS: Record<CombatCue, string> = {
  miss: '/audio/miss.wav',
  'hit-impact': '/audio/hit-impact.wav',
  'hit-explosion': '/audio/hit-explosion.wav',
  sunk: '/audio/sunk.wav',
  victory: '/audio/victory.wav',
  defeat: '/audio/defeat.wav',
}

export interface CombatAudioController {
  setMuted: (muted: boolean) => void
  play: (cue: CombatCue) => void
  dispose: () => void
}

export function createCombatAudioController(muted = false): CombatAudioController {
  const pools = new Map<CombatCue, HTMLAudioElement[]>()
  const nextIndex = new Map<CombatCue, number>()

  for (const cue of Object.keys(CUE_URLS) as CombatCue[]) {
    const pool = Array.from({ length: POOL_SIZE }, () => {
      const audio = new Audio(CUE_URLS[cue])
      audio.preload = 'auto'
      audio.volume = VOLUME
      audio.muted = muted
      return audio
    })
    pools.set(cue, pool)
    nextIndex.set(cue, 0)
  }

  function setMuted(nextMuted: boolean) {
    for (const pool of pools.values()) {
      for (const audio of pool) audio.muted = nextMuted
    }
  }

  function play(cue: CombatCue) {
    const pool = pools.get(cue)
    if (!pool) return

    const index = nextIndex.get(cue) ?? 0
    const audio = pool[index]
    nextIndex.set(cue, (index + 1) % pool.length)
    audio.currentTime = 0
    void audio.play().catch(() => undefined)
  }

  function dispose() {
    for (const pool of pools.values()) {
      for (const audio of pool) {
        audio.pause()
        audio.removeAttribute('src')
        audio.load()
      }
    }
    pools.clear()
    nextIndex.clear()
  }

  setMuted(muted)
  return { setMuted, play, dispose }
}
