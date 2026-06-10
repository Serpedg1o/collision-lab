import * as THREE from 'three'
import RAPIER from '@dimforge/rapier3d-compat'
import { PhysicsWorld } from './PhysicsWorld'
import { Player } from './Player'
import { InputSystem } from './InputSystem'
import { MovementSystem } from './MovementSystem'
import { CameraSystem } from './CameraSystem'
import { UIManager } from './UIManager'
import { GROUND_SIZE, GROUND_FRICTION, JUMP_FORCE } from './config'

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

  const input = new InputSystem()
  input.init()

  const player = new Player()
  player.init(scene, physicsWorld)

  const movement = new MovementSystem()
  const cameraSystem = new CameraSystem(camera)
  const ui = new UIManager()

  // Прыжок и ресет прямо в listener — не зависит от loop
  input.onJump = () => {
    player.jump(JUMP_FORCE)
  }

  input.onReset = () => {
    player.reset()
  }

  function loop() {
    requestAnimationFrame(loop)

    const inputState = input.getState()

    player.checkGrounded()

    cameraSystem.update(player)
    movement.cameraYaw = cameraSystem.getCameraYaw(player)
    movement.apply(player, inputState)

    physicsWorld.step()
    player.syncMesh()

    const vel = player.getVelocity()
    player.updateVisualRotation(vel.x, vel.z)

    const speed = movement.getHorizontalSpeed(player)
    ui.update(speed, inputState.boost, vel.x, vel.y, vel.z)

    renderer.render(scene, camera)
  }

  loop()
}

main().catch(console.error)