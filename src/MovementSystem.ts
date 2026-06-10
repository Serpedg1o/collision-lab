import * as THREE from 'three'
import { Player } from './Player'
import { InputState } from './InputSystem'
import {
  PLAYER_MOVE_FORCE,
  PLAYER_ACCELERATION,
  PLAYER_MAX_SPEED,
  PLAYER_BRAKE_FORCE,
  BOOST_MULTIPLIER,
  BOOST_MAX_SPEED,
} from './config'

export class MovementSystem {
  cameraYaw = 0

  apply(player: Player, input: InputState): void {
    const { forward, backward, left, right, boost } = input
    const hasInput = forward || backward || left || right
    const maxSpeed = boost ? BOOST_MAX_SPEED : PLAYER_MAX_SPEED

    const vel = player.rigidBody.linvel()
    const vx = vel.x
    const vz = vel.z

    if (hasInput) {
      const dir = new THREE.Vector3()
      if (forward)  dir.z -= 1
      if (backward) dir.z += 1
      if (left)     dir.x -= 1
      if (right)    dir.x += 1
      dir.normalize()
      dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.cameraYaw)

      const force = PLAYER_MOVE_FORCE * PLAYER_ACCELERATION * (boost ? BOOST_MULTIPLIER : 1)

      // Add impulse on top of current velocity — preserves inertia
      let newVx = vx + dir.x * force
      let newVz = vz + dir.z * force

      // Clamp to max speed
      const newSpeed = Math.sqrt(newVx * newVx + newVz * newVz)
      if (newSpeed > maxSpeed) {
        const scale = maxSpeed / newSpeed
        newVx *= scale
        newVz *= scale
      }

      player.rigidBody.setLinvel({ x: newVx, y: vel.y, z: newVz }, true)

    } else {
      // Exponential brake — feels natural, never instant
      player.rigidBody.setLinvel({
        x: vx * PLAYER_BRAKE_FORCE,
        y: vel.y,
        z: vz * PLAYER_BRAKE_FORCE,
      }, true)
    }
  }

  getHorizontalSpeed(player: Player): number {
    const vel = player.getVelocity()
    return Math.sqrt(vel.x * vel.x + vel.z * vel.z)
  }
}