export type CombatCue =
  | 'miss'
  | 'hit-impact'
  | 'hit-explosion'
  | 'sunk'
  | 'victory'
  | 'defeat'

export type VoiceCue =
  | 'player-hit'
  | 'player-sink-carrier'
  | 'player-sink-battleship'
  | 'player-sink-cruiser'
  | 'player-sink-submarine'
  | 'player-sink-destroyer'
  | 'victory'
  | 'ai-hit'
  | 'ai-sink-carrier'
  | 'ai-sink-battleship'
  | 'ai-sink-cruiser'
  | 'ai-sink-destroyer'
  | 'ai-sink-submarine'
  | 'defeat'

const POOL_SIZE = 3
const VOLUME = 0.5
const VOICE_VOLUME = 0.5

const CUE_URLS: Record<CombatCue, string> = {
  miss: '/audio/miss.wav',
  'hit-impact': '/audio/hit-impact.wav',
  'hit-explosion': '/audio/hit-explosion.wav',
  sunk: '/audio/sunk.wav',
  victory: '/audio/victory.wav',
  defeat: '/audio/defeat.wav',
}

const VOICE_URLS: Record<VoiceCue, string> = {
  'player-hit': '/voice/player-hit.mp3',
  'player-sink-carrier': '/voice/player-sink-carrier.mp3',
  'player-sink-battleship': '/voice/player-sink-battleship.mp3',
  'player-sink-cruiser': '/voice/player-sink-cruiser.mp3',
  'player-sink-submarine': '/voice/player-sink-submarine.mp3',
  'player-sink-destroyer': '/voice/player-sink-destroyer.mp3',
  victory: '/voice/victory.mp3',
  'ai-hit': '/voice/ai-hit.mp3',
  'ai-sink-carrier': '/voice/ai-sink-carrier.mp3',
  'ai-sink-battleship': '/voice/ai-sink-battleship.mp3',
  'ai-sink-cruiser': '/voice/ai-sink-cruiser.mp3',
  'ai-sink-submarine': '/voice/ai-sink-submarine.mp3',
  'ai-sink-destroyer': '/voice/ai-sink-destroyer.mp3',
  defeat: '/voice/defeat.mp3',
}

export interface CombatAudioController {
  setMuted: (muted: boolean) => void
  play: (cue: CombatCue) => void
  setVoiceMuted: (muted: boolean) => void
  enqueueVoice: (cue: VoiceCue) => void
  clearVoiceQueue: () => void
  dispose: () => void
}

export function createCombatAudioController(muted = false, voiceMuted = false): CombatAudioController {
  const pools = new Map<CombatCue, HTMLAudioElement[]>()
  const nextIndex = new Map<CombatCue, number>()
  const voiceQueue: VoiceCue[] = []
  const voiceTimers = new Set<number>()
  let voiceMutedState = voiceMuted
  let voicePlaying = false
  const voiceAudio = document.createElement('audio')
  voiceAudio.preload = 'auto'
  voiceAudio.volume = VOICE_VOLUME
  voiceAudio.muted = voiceMuted
  voiceAudio.hidden = true
  voiceAudio.dataset.audioChannel = 'voice'
  voiceAudio.addEventListener('ended', playNextVoice)
  document.body.append(voiceAudio)

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

  function playNextVoice() {
    if (voiceMutedState || voiceQueue.length === 0) {
      voicePlaying = false
      return
    }

    const cue = voiceQueue.shift()
    if (!cue) return
    voicePlaying = true
    voiceAudio.src = VOICE_URLS[cue]
    voiceAudio.currentTime = 0
    void voiceAudio.play().catch(() => {
      voicePlaying = false
      playNextVoice()
    })
  }

  function setVoiceMuted(nextMuted: boolean) {
    voiceMutedState = nextMuted
    voiceAudio.muted = nextMuted
    if (nextMuted) clearVoiceQueue()
    else if (!voicePlaying) playNextVoice()
  }

  function enqueueVoice(cue: VoiceCue) {
    if (voiceMutedState) return
    const timer = window.setTimeout(() => {
      voiceTimers.delete(timer)
      voiceQueue.push(cue)
      if (!voicePlaying) playNextVoice()
    }, 150)
    voiceTimers.add(timer)
  }

  function clearVoiceQueue() {
    for (const timer of voiceTimers) window.clearTimeout(timer)
    voiceTimers.clear()
    voiceQueue.length = 0
    voiceAudio.pause()
    voiceAudio.currentTime = 0
    voiceAudio.removeAttribute('src')
    voicePlaying = false
  }

  function dispose() {
    clearVoiceQueue()
    voiceAudio.removeEventListener('ended', playNextVoice)
    voiceAudio.remove()
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
  setVoiceMuted(voiceMuted)
  return { setMuted, play, setVoiceMuted, enqueueVoice, clearVoiceQueue, dispose }
}
