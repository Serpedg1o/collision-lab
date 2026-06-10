import * as THREE from 'three'
import RAPIER from '@dimforge/rapier3d-compat'
import { PhysicsWorld } from './PhysicsWorld'
import { Player } from './Player'
import { InputSystem } from './InputSystem'
import { MovementSystem } from './MovementSystem'
import { CameraSystem } from './CameraSystem'
import { UIManager } from './UIManager'
import {
  GROUND_SIZE,
  GROUND_FRICTION,
  JUMP_FORCE,
  BALL_RADIUS,
  BALL_MASS,
  BALL_RESTITUTION,
  BALL_FRICTION,
  GRAVITY_SCALE,
  STATIC_BALL_POSITIONS,
} from './config'

async function main() {
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  document.getElementById('app')!.appendChild(renderer.domElement)

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  })

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x1a1a2e)
  scene.fog = new THREE.Fog(0x1a1a2e, 60, 180)

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 400)

  scene.add(new THREE.AmbientLight(0xffffff, 0.4))
  const sun = new THREE.DirectionalLight(0xffffff, 1.2)
  sun.position.set(20, 40, 10)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  sun.shadow.camera.near = 0.5
  sun.shadow.camera.far = 200
  sun.shadow.camera.left = -80
  sun.shadow.camera.right = 80
  sun.shadow.camera.top = 80
  sun.shadow.camera.bottom = -80
  scene.add(sun)

  const groundMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(GROUND_SIZE, GROUND_SIZE, 40, 40),
    new THREE.MeshStandardMaterial({ color: 0x16213e, roughness: 0.9 })
  )
  groundMesh.rotation.x = -Math.PI / 2
  groundMesh.receiveShadow = true
  scene.add(groundMesh)
  scene.add(new THREE.GridHelper(GROUND_SIZE, 80, 0x0f3460, 0x0f3460))

  const physicsWorld = new PhysicsWorld()
  await physicsWorld.init()

  const groundBody = physicsWorld.world.createRigidBody(RAPIER.RigidBodyDesc.fixed())
  physicsWorld.world.createCollider(
    RAPIER.ColliderDesc.cuboid(GROUND_SIZE / 2, 0.1, GROUND_SIZE / 2)
      .setTranslation(0, -0.1, 0)
      .setFriction(GROUND_FRICTION),
    groundBody
  )

  // --- Static balls ---
  const ballGeo = new THREE.SphereGeometry(BALL_RADIUS, 32, 32)
  const ballMat = new THREE.MeshStandardMaterial({
    color: 0x4444ff,
    metalness: 0.85,
    roughness: 0.15,
  })

  // Store pairs for reset
  const staticBalls: { mesh: THREE.Mesh; body: RAPIER.RigidBody; startPos: { x: number; y: number; z: number } }[] = []

  for (const pos of STATIC_BALL_POSITIONS) {
    const mesh = new THREE.Mesh(ballGeo, ballMat)
    mesh.castShadow = true
    scene.add(mesh)

    const body = physicsWorld.world.createRigidBody(
      RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(pos.x, pos.y, pos.z)
        .setLinearDamping(0.3)
        .setAngularDamping(0.5)
        .setGravityScale(GRAVITY_SCALE)
    )

    physicsWorld.world.createCollider(
      RAPIER.ColliderDesc.ball(BALL_RADIUS)
        .setMass(BALL_MASS)
        .setFriction(BALL_FRICTION)
        .setRestitution(BALL_RESTITUTION),
      body
    )

    staticBalls.push({ mesh, body, startPos: { ...pos } })
  }

  const input = new InputSystem()
  input.init()

  const player = new Player()
  player.init(scene, physicsWorld)

  const movement = new MovementSystem()
  const cameraSystem = new CameraSystem(camera)
  const ui = new UIManager()

  input.onJump = () => { player.jump(JUMP_FORCE) }

  input.onReset = () => {
    // Reset player
    player.reset()

    // Reset all static balls to start positions
    for (const { body, startPos } of staticBalls) {
      body.wakeUp()
      body.setLinvel({ x: 0, y: 0, z: 0 }, true)
      body.setAngvel({ x: 0, y: 0, z: 0 }, true)
      body.resetForces(true)
      body.resetTorques(true)
      body.setTranslation({ x: startPos.x, y: startPos.y, z: startPos.z }, true)
    }
  }

  function loop() {
    requestAnimationFrame(loop)

    const inputState = input.getState()

    cameraSystem.update(player)
    movement.cameraYaw = cameraSystem.getCameraYaw(player)
    movement.apply(player, inputState)

    physicsWorld.step()

    player.checkGrounded()
    player.syncMesh()

    // Sync static ball meshes
    for (const { mesh, body } of staticBalls) {
      const pos = body.translation()
      const rot = body.rotation()
      mesh.position.set(pos.x, pos.y, pos.z)
      mesh.quaternion.set(rot.x, rot.y, rot.z, rot.w)
    }

    const vel = player.getVelocity()
    player.updateVisualRotation(vel.x, vel.z)

    const speed = movement.getHorizontalSpeed(player)
    ui.update(speed, inputState.boost, vel.x, vel.y, vel.z)

    renderer.render(scene, camera)
  }

  loop()
}

main().catch(console.error)