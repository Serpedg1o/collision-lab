export interface InputState {
  forward: boolean
  backward: boolean
  left: boolean
  right: boolean
  boost: boolean
  reset: boolean
}

export class InputSystem {
  private keys: Record<string, boolean> = {}
  onJump: (() => void) | null = null
  onReset: (() => void) | null = null

  init(): void {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true
      if (e.code === 'Space') this.onJump?.()
      if (e.code === 'KeyR') this.onReset?.()
    })
    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false
    })
  }

  getState(): InputState {
    return {
      forward:  this.keys['KeyW'] ?? false,
      backward: this.keys['KeyS'] ?? false,
      left:     this.keys['KeyA'] ?? false,
      right:    this.keys['KeyD'] ?? false,
      boost:    this.keys['ShiftLeft'] || this.keys['ShiftRight'] ? true : false,
      reset:    this.keys['KeyR'] ?? false,
    }
  }

  consumeReset(): boolean { return false }
  consumeJump(): boolean { return false }
}