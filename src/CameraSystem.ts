import * as THREE from 'three'
import { Player } from './Player'
import { CAMERA_DISTANCE, CAMERA_HEIGHT, CAMERA_LERP } from './config'

export class CameraSystem {
  private camera: THREE.PerspectiveCamera
  private yaw = Math.PI // start behind the ball

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera
  }

  update(player: Player): void {
    const ballPos = player.mesh.position

    // Desired camera position
    const desiredX = ballPos.x + Math.sin(this.yaw) * CAMERA_DISTANCE
    const desiredY = ballPos.y + CAMERA_HEIGHT
    const desiredZ = ballPos.z + Math.cos(this.yaw) * CAMERA_DISTANCE

    // Smooth follow
    this.camera.position.lerp(
      new THREE.Vector3(desiredX, desiredY, desiredZ),
      CAMERA_LERP
    )

    this.camera.lookAt(ballPos)
  }

  // Returns the yaw angle from camera to ball — used by MovementSystem
  // so that W always means "away from camera" regardless of camera position.
  getCameraYaw(player: Player): number {
    const dx = this.camera.position.x - player.mesh.position.x
    const dz = this.camera.position.z - player.mesh.position.z
    return Math.atan2(dx, dz)
  }
}
