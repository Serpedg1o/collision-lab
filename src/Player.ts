import * as THREE from 'three'
import RAPIER from '@dimforge/rapier3d-compat'
import { PhysicsWorld } from './PhysicsWorld'
import {
  BALL_RADIUS,
  BALL_MASS,
  BALL_RESTITUTION,
  GROUND_FRICTION,
  RESET_POSITION,
  GRAVITY_SCALE,
} from './config'

export class Player {
  mesh!: THREE.Mesh
  rigidBody!: RAPIER.RigidBody
  private dotPivot!: THREE.Object3D
  isGrounded = false

  init(scene: THREE.Scene, physicsWorld: PhysicsWorld): void {
    const geometry = new THREE.SphereGeometry(BALL_RADIUS, 32, 32)
    const material = new THREE.MeshStandardMaterial({
      color: 0x888888,
      metalness: 0.3,
      roughness: 0.6,
    })
    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.castShadow = true
    scene.add(this.mesh)

    // Orange dot
    this.dotPivot = new THREE.Object3D()
    this.mesh.add(this.dotPivot)
    const dotGeo = new THREE.CircleGeometry(0.1, 16)
    const dotMat = new THREE.MeshBasicMaterial({ color: 0xff6600, depthTest: false })
    const dot = new THREE.Mesh(dotGeo, dotMat)
    dot.position.set(0, BALL_RADIUS + 0.01, 0)
    dot.rotation.x = -Math.PI / 2
    this.dotPivot.add(dot)

    // Physics — rotations locked, gravity scaled up for heavy feel
    const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(RESET_POSITION.x, RESET_POSITION.y, RESET_POSITION.z)
      .setLinearDamping(0.0)
      .setAngularDamping(0.0)
      .setGravityScale(GRAVITY_SCALE)

    this.rigidBody = physicsWorld.world.createRigidBody(bodyDesc)
    this.rigidBody.lockRotations(true, true)

    physicsWorld.world.createCollider(
      RAPIER.ColliderDesc.ball(BALL_RADIUS)
        .setMass(BALL_MASS)
        .setFriction(GROUND_FRICTION)
        .setRestitution(BALL_RESTITUTION),
      this.rigidBody
    )
  }

  jump(force: number): void {
    if (!this.isGrounded) return
    const vel = this.rigidBody.linvel()
    this.rigidBody.setLinvel({ x: vel.x, y: force, z: vel.z }, true)
    this.isGrounded = false
  }

  checkGrounded(): void {
    const pos = this.rigidBody.translation()
    const vel = this.rigidBody.linvel()
    // Grounded if close to floor and not moving upward
    this.isGrounded = pos.y <= RESET_POSITION.y + 0.05 && vel.y <= 0.1
  }

  reset(): void {
    this.rigidBody.wakeUp()
    this.rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true)
    this.rigidBody.setAngvel({ x: 0, y: 0, z: 0 }, true)
    this.rigidBody.resetForces(true)
    this.rigidBody.resetTorques(true)
    this.rigidBody.setTranslation(
      { x: RESET_POSITION.x, y: RESET_POSITION.y, z: RESET_POSITION.z },
      true
    )
    this.isGrounded = true
  }

  updateVisualRotation(vx: number, vz: number): void {
    const speed = Math.sqrt(vx * vx + vz * vz)
    if (speed < 0.01) return
    const angle = speed * 0.05
    const axis = new THREE.Vector3(vz, 0, -vx).normalize()
    const q = new THREE.Quaternion().setFromAxisAngle(axis, angle)
    this.dotPivot.quaternion.premultiply(q)
  }

  syncMesh(): void {
    const pos = this.rigidBody.translation()
    this.mesh.position.set(pos.x, pos.y, pos.z)
  }

  getVelocity(): THREE.Vector3 {
    const v = this.rigidBody.linvel()
    return new THREE.Vector3(v.x, v.y, v.z)
  }
}