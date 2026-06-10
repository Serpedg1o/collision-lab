export class UIManager {
  private container: HTMLDivElement
  private speedEl: HTMLDivElement
  private maxSpeedEl: HTMLDivElement
  private boostEl: HTMLDivElement
  private fpsEl: HTMLDivElement
  private velEl: HTMLDivElement

  private maxSpeedRecorded = 0
  private lastTime = performance.now()
  private frameCount = 0
  private fps = 0

  constructor() {
    this.container = document.createElement('div')
    Object.assign(this.container.style, {
      position: 'fixed',
      top: '16px',
      left: '16px',
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#fff',
      lineHeight: '1.8',
      pointerEvents: 'none',
      userSelect: 'none',
      textShadow: '0 1px 3px rgba(0,0,0,0.8)',
    })

    this.speedEl    = this.makeEl()
    this.maxSpeedEl = this.makeEl()
    this.boostEl    = this.makeEl()
    this.fpsEl      = this.makeEl()
    this.velEl      = this.makeEl()

    document.body.appendChild(this.container)
  }

  private makeEl(): HTMLDivElement {
    const el = document.createElement('div')
    this.container.appendChild(el)
    return el
  }

  update(speed: number, boostActive: boolean, vx: number, vy: number, vz: number): void {
    if (speed > this.maxSpeedRecorded) this.maxSpeedRecorded = speed

    this.frameCount++
    const now = performance.now()
    if (now - this.lastTime >= 500) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastTime))
      this.frameCount = 0
      this.lastTime = now
    }

    this.speedEl.textContent    = `Speed:     ${speed.toFixed(2)} u/s`
    this.maxSpeedEl.textContent = `Max Speed: ${this.maxSpeedRecorded.toFixed(2)} u/s`
    this.boostEl.textContent    = `Boost:     ${boostActive ? 'ON  [SHIFT]' : 'off'}`
    this.fpsEl.textContent      = `FPS:       ${this.fps}`
    this.velEl.textContent      = `VX:${vx.toFixed(2)} VY:${vy.toFixed(2)} VZ:${vz.toFixed(2)}`
  }
}