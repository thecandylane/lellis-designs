'use client'

import React, { useRef, useEffect } from 'react'
import {
  Clock,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  WebGLRendererParameters,
  SRGBColorSpace,
  MathUtils,
  Vector2,
  Vector3,
  MeshStandardMaterial,
  Color,
  Object3D,
  InstancedMesh,
  PMREMGenerator,
  CylinderGeometry,
  AmbientLight,
  PointLight,
  ACESFilmicToneMapping,
  Raycaster,
  Plane,
  TextureLoader,
  Texture,
  Group,
  Mesh,
  DoubleSide
} from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

// ============================================================================
// Three.js Scene Manager (X class)
// ============================================================================

interface XConfig {
  canvas?: HTMLCanvasElement
  id?: string
  rendererOptions?: Partial<WebGLRendererParameters>
  size?: 'parent' | { width: number; height: number }
}

interface SizeData {
  width: number
  height: number
  wWidth: number
  wHeight: number
  ratio: number
  pixelRatio: number
}

class X {
  #config: XConfig
  #resizeObserver?: ResizeObserver
  #intersectionObserver?: IntersectionObserver
  #resizeTimer?: number
  #animationFrameId: number = 0
  #clock: Clock = new Clock()
  #animationState = { elapsed: 0, delta: 0 }
  #isAnimating: boolean = false
  #isVisible: boolean = false

  canvas!: HTMLCanvasElement
  camera!: PerspectiveCamera
  cameraMinAspect?: number
  cameraMaxAspect?: number
  cameraFov!: number
  maxPixelRatio?: number
  minPixelRatio?: number
  scene!: Scene
  renderer!: WebGLRenderer
  size: SizeData = {
    width: 0,
    height: 0,
    wWidth: 0,
    wHeight: 0,
    ratio: 0,
    pixelRatio: 0
  }

  render: () => void = this.#render.bind(this)
  onBeforeRender: (state: { elapsed: number; delta: number }) => void = () => {}
  onAfterRender: (state: { elapsed: number; delta: number }) => void = () => {}
  onAfterResize: (size: SizeData) => void = () => {}
  isDisposed: boolean = false

  constructor(config: XConfig) {
    this.#config = { ...config }
    this.#initCamera()
    this.#initScene()
    this.#initRenderer()
    this.resize()
    this.#initObservers()
  }

  #initCamera() {
    this.camera = new PerspectiveCamera()
    this.cameraFov = this.camera.fov
  }

  #initScene() {
    this.scene = new Scene()
  }

  #initRenderer() {
    if (this.#config.canvas) {
      this.canvas = this.#config.canvas
    } else if (this.#config.id) {
      const elem = document.getElementById(this.#config.id)
      if (elem instanceof HTMLCanvasElement) {
        this.canvas = elem
      }
    }
    if (!this.canvas) return
    this.canvas.style.display = 'block'
    const rendererOptions: WebGLRendererParameters = {
      canvas: this.canvas,
      powerPreference: 'high-performance',
      ...(this.#config.rendererOptions ?? {})
    }
    this.renderer = new WebGLRenderer(rendererOptions)
    this.renderer.outputColorSpace = SRGBColorSpace
  }

  #initObservers() {
    if (!(this.#config.size instanceof Object)) {
      window.addEventListener('resize', this.#onResize.bind(this))
      if (this.#config.size === 'parent' && this.canvas?.parentNode) {
        this.#resizeObserver = new ResizeObserver(this.#onResize.bind(this))
        this.#resizeObserver.observe(this.canvas.parentNode as Element)
      }
    }
    if (this.canvas) {
      this.#intersectionObserver = new IntersectionObserver(this.#onIntersection.bind(this), {
        root: null,
        rootMargin: '0px',
        threshold: 0
      })
      this.#intersectionObserver.observe(this.canvas)
    }
    document.addEventListener('visibilitychange', this.#onVisibilityChange.bind(this))
  }

  #onResize() {
    if (this.#resizeTimer) clearTimeout(this.#resizeTimer)
    this.#resizeTimer = window.setTimeout(this.resize.bind(this), 100)
  }

  resize() {
    let w: number, h: number
    if (this.#config.size instanceof Object) {
      w = this.#config.size.width
      h = this.#config.size.height
    } else if (this.#config.size === 'parent' && this.canvas?.parentNode) {
      w = (this.canvas.parentNode as HTMLElement).offsetWidth
      h = (this.canvas.parentNode as HTMLElement).offsetHeight
    } else {
      w = window.innerWidth
      h = window.innerHeight
    }
    this.size.width = w
    this.size.height = h
    this.size.ratio = w / h
    this.#updateCamera()
    this.#updateRenderer()
    this.onAfterResize(this.size)
  }

  #updateCamera() {
    this.camera.aspect = this.size.width / this.size.height
    if (this.camera.isPerspectiveCamera && this.cameraFov) {
      if (this.cameraMinAspect && this.camera.aspect < this.cameraMinAspect) {
        this.#adjustFov(this.cameraMinAspect)
      } else if (this.cameraMaxAspect && this.camera.aspect > this.cameraMaxAspect) {
        this.#adjustFov(this.cameraMaxAspect)
      } else {
        this.camera.fov = this.cameraFov
      }
    }
    this.camera.updateProjectionMatrix()
    this.updateWorldSize()
  }

  #adjustFov(aspect: number) {
    const tanFov = Math.tan(MathUtils.degToRad(this.cameraFov / 2))
    const newTan = tanFov / (this.camera.aspect / aspect)
    this.camera.fov = 2 * MathUtils.radToDeg(Math.atan(newTan))
  }

  updateWorldSize() {
    if (this.camera.isPerspectiveCamera) {
      const fovRad = (this.camera.fov * Math.PI) / 180
      this.size.wHeight = 2 * Math.tan(fovRad / 2) * this.camera.position.length()
      this.size.wWidth = this.size.wHeight * this.camera.aspect
    }
  }

  #updateRenderer() {
    this.renderer?.setSize(this.size.width, this.size.height)
    let pr = window.devicePixelRatio
    if (this.maxPixelRatio && pr > this.maxPixelRatio) {
      pr = this.maxPixelRatio
    } else if (this.minPixelRatio && pr < this.minPixelRatio) {
      pr = this.minPixelRatio
    }
    this.renderer?.setPixelRatio(pr)
    this.size.pixelRatio = pr
  }

  #onIntersection(entries: IntersectionObserverEntry[]) {
    this.#isAnimating = entries[0].isIntersecting
    this.#isAnimating ? this.#startAnimation() : this.#stopAnimation()
  }

  #onVisibilityChange() {
    if (this.#isAnimating) {
      document.hidden ? this.#stopAnimation() : this.#startAnimation()
    }
  }

  #startAnimation() {
    if (this.#isVisible) return
    const animateFrame = () => {
      this.#animationFrameId = requestAnimationFrame(animateFrame)
      this.#animationState.delta = this.#clock.getDelta()
      this.#animationState.elapsed += this.#animationState.delta
      this.onBeforeRender(this.#animationState)
      this.render()
      this.onAfterRender(this.#animationState)
    }
    this.#isVisible = true
    this.#clock.start()
    animateFrame()
  }

  #stopAnimation() {
    if (this.#isVisible) {
      cancelAnimationFrame(this.#animationFrameId)
      this.#isVisible = false
      this.#clock.stop()
    }
  }

  #render() {
    this.renderer?.render(this.scene, this.camera)
  }

  clear() {
    this.scene.traverse(obj => {
      const mesh = obj as { isMesh?: boolean; material?: { dispose?: () => void; [key: string]: unknown }; geometry?: { dispose?: () => void } }
      if (mesh.isMesh && typeof mesh.material === 'object' && mesh.material !== null) {
        Object.keys(mesh.material).forEach(key => {
          const matProp = mesh.material![key] as { dispose?: () => void }
          if (matProp && typeof matProp === 'object' && typeof matProp.dispose === 'function') {
            matProp.dispose()
          }
        })
        mesh.material.dispose?.()
        mesh.geometry?.dispose?.()
      }
    })
    this.scene.clear()
  }

  dispose() {
    this.#onResizeCleanup()
    this.#stopAnimation()
    this.clear()
    this.renderer?.dispose()
    this.isDisposed = true
  }

  #onResizeCleanup() {
    window.removeEventListener('resize', this.#onResize.bind(this))
    this.#resizeObserver?.disconnect()
    this.#intersectionObserver?.disconnect()
    document.removeEventListener('visibilitychange', this.#onVisibilityChange.bind(this))
  }
}

// ============================================================================
// Physics Engine (W class)
// ============================================================================

interface WConfig {
  count: number
  maxX: number
  maxY: number
  maxZ: number
  maxSize: number
  minSize: number
  size0: number
  gravity: number
  friction: number
  wallBounce: number
  maxVelocity: number
  controlSphere0?: boolean
  followCursor?: boolean
}

class W {
  config: WConfig
  positionData: Float32Array
  velocityData: Float32Array
  sizeData: Float32Array
  rotationData: Float32Array // Added for button rotation
  center: Vector3 = new Vector3()

  constructor(config: WConfig) {
    this.config = config
    this.positionData = new Float32Array(3 * config.count).fill(0)
    this.velocityData = new Float32Array(3 * config.count).fill(0)
    this.sizeData = new Float32Array(config.count).fill(1)
    this.rotationData = new Float32Array(3 * config.count).fill(0)
    this.center = new Vector3()
    this.#initializePositions()
    this.setSizes()
    this.#initializeRotations()
  }

  #initializePositions() {
    const { config, positionData } = this
    this.center.toArray(positionData, 0)
    for (let i = 1; i < config.count; i++) {
      const idx = 3 * i
      positionData[idx] = MathUtils.randFloatSpread(2 * config.maxX)
      positionData[idx + 1] = MathUtils.randFloatSpread(2 * config.maxY)
      positionData[idx + 2] = MathUtils.randFloatSpread(2 * config.maxZ)
    }
  }

  #initializeRotations() {
    const { config, rotationData } = this
    for (let i = 0; i < config.count; i++) {
      const idx = 3 * i
      // Random initial rotation - buttons face different directions
      rotationData[idx] = MathUtils.randFloat(0, Math.PI * 2) // X rotation
      rotationData[idx + 1] = MathUtils.randFloat(0, Math.PI * 2) // Y rotation
      rotationData[idx + 2] = MathUtils.randFloat(-Math.PI / 6, Math.PI / 6) // Z tilt (slight)
    }
  }

  setSizes() {
    const { config, sizeData } = this
    sizeData[0] = config.size0
    for (let i = 1; i < config.count; i++) {
      sizeData[i] = MathUtils.randFloat(config.minSize, config.maxSize)
    }
  }

  update(deltaInfo: { delta: number }) {
    const { config, center, positionData, sizeData, velocityData, rotationData } = this
    let startIdx = 0
    if (config.controlSphere0) {
      startIdx = 1
      const firstVec = new Vector3().fromArray(positionData, 0)
      firstVec.lerp(center, 0.1).toArray(positionData, 0)
      new Vector3(0, 0, 0).toArray(velocityData, 0)
    }
    for (let idx = startIdx; idx < config.count; idx++) {
      const base = 3 * idx
      const pos = new Vector3().fromArray(positionData, base)
      const vel = new Vector3().fromArray(velocityData, base)
      vel.y -= deltaInfo.delta * config.gravity * sizeData[idx]
      vel.multiplyScalar(config.friction)
      vel.clampLength(0, config.maxVelocity)
      pos.add(vel)
      pos.toArray(positionData, base)
      vel.toArray(velocityData, base)

      // Rotate buttons slowly based on velocity
      const speed = vel.length()
      rotationData[base] += speed * deltaInfo.delta * 2
      rotationData[base + 1] += speed * deltaInfo.delta * 1.5
    }
    for (let idx = startIdx; idx < config.count; idx++) {
      const base = 3 * idx
      const pos = new Vector3().fromArray(positionData, base)
      const vel = new Vector3().fromArray(velocityData, base)
      const radius = sizeData[idx]
      for (let jdx = idx + 1; jdx < config.count; jdx++) {
        const otherBase = 3 * jdx
        const otherPos = new Vector3().fromArray(positionData, otherBase)
        const otherVel = new Vector3().fromArray(velocityData, otherBase)
        const diff = new Vector3().copy(otherPos).sub(pos)
        const dist = diff.length()
        const sumRadius = radius + sizeData[jdx]
        if (dist < sumRadius) {
          const overlap = sumRadius - dist
          const correction = diff.normalize().multiplyScalar(0.5 * overlap)
          const velCorrection = correction.clone().multiplyScalar(Math.max(vel.length(), 1))
          pos.sub(correction)
          vel.sub(velCorrection)
          pos.toArray(positionData, base)
          vel.toArray(velocityData, base)
          otherPos.add(correction)
          otherVel.add(correction.clone().multiplyScalar(Math.max(otherVel.length(), 1)))
          otherPos.toArray(positionData, otherBase)
          otherVel.toArray(velocityData, otherBase)
        }
      }
      if (config.controlSphere0) {
        const diff = new Vector3().copy(new Vector3().fromArray(positionData, 0)).sub(pos)
        const d = diff.length()
        const sumRadius0 = radius + sizeData[0]
        if (d < sumRadius0) {
          const correction = diff.normalize().multiplyScalar(sumRadius0 - d)
          const velCorrection = correction.clone().multiplyScalar(Math.max(vel.length(), 2))
          pos.sub(correction)
          vel.sub(velCorrection)
        }
      }
      if (Math.abs(pos.x) + radius > config.maxX) {
        pos.x = Math.sign(pos.x) * (config.maxX - radius)
        vel.x = -vel.x * config.wallBounce
      }
      if (config.gravity === 0) {
        if (Math.abs(pos.y) + radius > config.maxY) {
          pos.y = Math.sign(pos.y) * (config.maxY - radius)
          vel.y = -vel.y * config.wallBounce
        }
      } else if (pos.y - radius < -config.maxY) {
        pos.y = -config.maxY + radius
        vel.y = -vel.y * config.wallBounce
      }
      const maxBoundary = Math.max(config.maxZ, config.maxSize)
      if (Math.abs(pos.z) + radius > maxBoundary) {
        pos.z = Math.sign(pos.z) * (config.maxZ - radius)
        vel.z = -vel.z * config.wallBounce
      }
      pos.toArray(positionData, base)
      vel.toArray(velocityData, base)
    }
  }
}

// ============================================================================
// Pointer Handling
// ============================================================================

let globalPointerActive = false
const pointerPosition = new Vector2()

interface PointerData {
  position: Vector2
  nPosition: Vector2
  hover: boolean
  touching: boolean
  onEnter: (data: PointerData) => void
  onMove: (data: PointerData) => void
  onClick: (data: PointerData) => void
  onLeave: (data: PointerData) => void
  dispose?: () => void
}

const pointerMap = new Map<HTMLElement, PointerData>()

function createPointerData(options: Partial<PointerData> & { domElement: HTMLElement }): PointerData {
  const defaultData: PointerData = {
    position: new Vector2(),
    nPosition: new Vector2(),
    hover: false,
    touching: false,
    onEnter: () => {},
    onMove: () => {},
    onClick: () => {},
    onLeave: () => {},
    ...options
  }
  if (!pointerMap.has(options.domElement)) {
    pointerMap.set(options.domElement, defaultData)
    if (!globalPointerActive) {
      document.body.addEventListener('pointermove', onPointerMove)
      document.body.addEventListener('pointerleave', onPointerLeave)
      document.body.addEventListener('click', onPointerClick)
      document.body.addEventListener('touchstart', onTouchStart, { passive: true })
      document.body.addEventListener('touchmove', onTouchMove, { passive: true })
      document.body.addEventListener('touchend', onTouchEnd, { passive: true })
      document.body.addEventListener('touchcancel', onTouchEnd, { passive: true })
      globalPointerActive = true
    }
  }
  defaultData.dispose = () => {
    pointerMap.delete(options.domElement)
    if (pointerMap.size === 0) {
      document.body.removeEventListener('pointermove', onPointerMove)
      document.body.removeEventListener('pointerleave', onPointerLeave)
      document.body.removeEventListener('click', onPointerClick)
      document.body.removeEventListener('touchstart', onTouchStart)
      document.body.removeEventListener('touchmove', onTouchMove)
      document.body.removeEventListener('touchend', onTouchEnd)
      document.body.removeEventListener('touchcancel', onTouchEnd)
      globalPointerActive = false
    }
  }
  return defaultData
}

function onPointerMove(e: PointerEvent) {
  pointerPosition.set(e.clientX, e.clientY)
  processPointerInteraction()
}

function processPointerInteraction() {
  for (const [elem, data] of pointerMap) {
    const rect = elem.getBoundingClientRect()
    if (isInside(rect)) {
      updatePointerData(data, rect)
      if (!data.hover) {
        data.hover = true
        data.onEnter(data)
      }
      data.onMove(data)
    } else if (data.hover && !data.touching) {
      data.hover = false
      data.onLeave(data)
    }
  }
}

function onTouchStart(e: TouchEvent) {
  if (e.touches.length > 0) {
    pointerPosition.set(e.touches[0].clientX, e.touches[0].clientY)
    for (const [elem, data] of pointerMap) {
      const rect = elem.getBoundingClientRect()
      if (isInside(rect)) {
        data.touching = true
        updatePointerData(data, rect)
        if (!data.hover) {
          data.hover = true
          data.onEnter(data)
        }
        data.onMove(data)
      }
    }
  }
}

function onTouchMove(e: TouchEvent) {
  if (e.touches.length > 0) {
    pointerPosition.set(e.touches[0].clientX, e.touches[0].clientY)
    for (const [elem, data] of pointerMap) {
      const rect = elem.getBoundingClientRect()
      updatePointerData(data, rect)
      if (isInside(rect)) {
        if (!data.hover) {
          data.hover = true
          data.touching = true
          data.onEnter(data)
        }
        data.onMove(data)
      } else if (data.hover && data.touching) {
        data.onMove(data)
      }
    }
  }
}

function onTouchEnd() {
  for (const [, data] of pointerMap) {
    if (data.touching) {
      data.touching = false
      if (data.hover) {
        data.hover = false
        data.onLeave(data)
      }
    }
  }
}

function onPointerClick(e: MouseEvent) {
  pointerPosition.set(e.clientX, e.clientY)
  for (const [elem, data] of pointerMap) {
    const rect = elem.getBoundingClientRect()
    updatePointerData(data, rect)
    if (isInside(rect)) data.onClick(data)
  }
}

function onPointerLeave() {
  for (const data of pointerMap.values()) {
    if (data.hover) {
      data.hover = false
      data.onLeave(data)
    }
  }
}

function updatePointerData(data: PointerData, rect: DOMRect) {
  data.position.set(pointerPosition.x - rect.left, pointerPosition.y - rect.top)
  data.nPosition.set((data.position.x / rect.width) * 2 - 1, (-data.position.y / rect.height) * 2 + 1)
}

function isInside(rect: DOMRect) {
  return (
    pointerPosition.x >= rect.left &&
    pointerPosition.x <= rect.left + rect.width &&
    pointerPosition.y >= rect.top &&
    pointerPosition.y <= rect.top + rect.height
  )
}

// ============================================================================
// Button Pit Configuration
// ============================================================================

interface ButtonPitConfig {
  count: number
  colors: number[]
  ambientColor: number
  ambientIntensity: number
  lightIntensity: number
  materialParams: {
    metalness: number
    roughness: number
  }
  minSize: number
  maxSize: number
  size0: number
  gravity: number
  friction: number
  wallBounce: number
  maxVelocity: number
  maxX: number
  maxY: number
  maxZ: number
  controlSphere0: boolean
  followCursor: boolean
  buttonImages?: string[] // URLs of button images to use as textures
}

const DefaultConfig: ButtonPitConfig = {
  count: 80,
  colors: [0x14b8a6, 0xec4899, 0x84cc16, 0xa855f7, 0xf97316],
  ambientColor: 0xffffff,
  ambientIntensity: 1.2,
  lightIntensity: 150,
  materialParams: {
    metalness: 0.1,
    roughness: 0.3
  },
  minSize: 0.4,
  maxSize: 1.2,
  size0: 1,
  gravity: 0.5,
  friction: 0.9975,
  wallBounce: 0.95,
  maxVelocity: 0.15,
  maxX: 5,
  maxY: 5,
  maxZ: 2,
  controlSphere0: false,
  followCursor: true,
  buttonImages: []
}

const U = new Object3D()

// ============================================================================
// Button Mesh Class (using individual meshes for texture variety)
// ============================================================================

class ButtonGroup extends Group {
  config: ButtonPitConfig
  physics: W
  buttons: Mesh[] = []
  ambientLight: AmbientLight | undefined
  light: PointLight | undefined
  textures: Texture[] = []
  textureLoader: TextureLoader

  constructor(renderer: WebGLRenderer, params: Partial<ButtonPitConfig> = {}) {
    super()
    this.config = { ...DefaultConfig, ...params }
    this.textureLoader = new TextureLoader()
    this.physics = new W(this.config)

    const roomEnv = new RoomEnvironment()
    const pmrem = new PMREMGenerator(renderer)
    const envTexture = pmrem.fromScene(roomEnv).texture

    this.#setupLights()
    this.#createButtons(envTexture)
  }

  #setupLights() {
    this.ambientLight = new AmbientLight(this.config.ambientColor, this.config.ambientIntensity)
    this.add(this.ambientLight)
    this.light = new PointLight(this.config.colors[0], this.config.lightIntensity)
    this.add(this.light)
  }

  #createButtons(envTexture: Texture) {
    const { config } = this
    const colors = config.colors.map(c => new Color(c))

    // Button geometry: flat cylinder (disc-like)
    // CylinderGeometry(radiusTop, radiusBottom, height, radialSegments)
    const buttonGeometry = new CylinderGeometry(1, 1, 0.15, 32)
    // Rotate so the flat face points toward camera (along Z)
    buttonGeometry.rotateX(Math.PI / 2)

    for (let i = 0; i < config.count; i++) {
      // Interpolate color based on index
      const colorRatio = i / config.count
      const colorIdx = Math.floor(colorRatio * (colors.length - 1))
      const nextColorIdx = Math.min(colorIdx + 1, colors.length - 1)
      const alpha = (colorRatio * (colors.length - 1)) - colorIdx

      const buttonColor = new Color().lerpColors(colors[colorIdx], colors[nextColorIdx], alpha)

      const material = new MeshStandardMaterial({
        color: buttonColor,
        envMap: envTexture,
        metalness: config.materialParams.metalness,
        roughness: config.materialParams.roughness,
        side: DoubleSide
      })

      const button = new Mesh(buttonGeometry, material)
      this.buttons.push(button)
      this.add(button)
    }
  }

  async loadTextures(imageUrls: string[]) {
    if (!imageUrls.length) return

    const loadPromises = imageUrls.map(url =>
      new Promise<Texture>((resolve, reject) => {
        this.textureLoader.load(
          url,
          texture => {
            texture.colorSpace = SRGBColorSpace
            resolve(texture)
          },
          undefined,
          reject
        )
      })
    )

    try {
      this.textures = await Promise.all(loadPromises)
      this.#applyTextures()
    } catch (err) {
      console.warn('Failed to load some button textures:', err)
    }
  }

  #applyTextures() {
    if (!this.textures.length) return

    for (let i = 0; i < this.buttons.length; i++) {
      const texture = this.textures[i % this.textures.length]
      const material = this.buttons[i].material as MeshStandardMaterial
      material.map = texture
      material.needsUpdate = true
    }
  }

  setColors(colors: number[]) {
    if (!Array.isArray(colors) || colors.length < 2) return

    const colorObjects = colors.map(c => new Color(c))

    for (let i = 0; i < this.buttons.length; i++) {
      const ratio = i / this.buttons.length
      const scaled = ratio * (colors.length - 1)
      const idx = Math.floor(scaled)
      const alpha = scaled - idx
      const nextIdx = Math.min(idx + 1, colors.length - 1)

      const color = new Color().lerpColors(colorObjects[idx], colorObjects[nextIdx], alpha)
      const material = this.buttons[i].material as MeshStandardMaterial
      material.color = color

      if (i === 0) {
        this.light!.color.copy(color)
      }
    }
  }

  update(deltaInfo: { delta: number }) {
    this.physics.update(deltaInfo)

    for (let i = 0; i < this.buttons.length; i++) {
      const button = this.buttons[i]
      const base = 3 * i

      // Position
      button.position.fromArray(this.physics.positionData, base)

      // Scale based on physics size
      const size = this.physics.sizeData[i]
      if (i === 0 && this.config.followCursor === false) {
        button.scale.setScalar(0)
      } else {
        button.scale.setScalar(size)
      }

      // Rotation (makes buttons tumble naturally)
      button.rotation.x = this.physics.rotationData[base]
      button.rotation.y = this.physics.rotationData[base + 1]
      button.rotation.z = this.physics.rotationData[base + 2]

      // Update light position to follow first button
      if (i === 0) {
        this.light!.position.copy(button.position)
      }
    }
  }

  dispose() {
    for (const button of this.buttons) {
      (button.material as MeshStandardMaterial).dispose()
      button.geometry.dispose()
    }
    for (const texture of this.textures) {
      texture.dispose()
    }
    this.buttons = []
    this.textures = []
  }
}

// ============================================================================
// Create Button Pit Function
// ============================================================================

interface CreateButtonPitReturn {
  three: X
  buttons: ButtonGroup
  setCount: (count: number) => void
  loadTextures: (urls: string[]) => Promise<void>
  togglePause: () => void
  dispose: () => void
}

function createButtonPit(canvas: HTMLCanvasElement, config: Partial<ButtonPitConfig> = {}): CreateButtonPitReturn {
  const threeInstance = new X({
    canvas,
    size: 'parent',
    rendererOptions: { antialias: true, alpha: true }
  })
  let buttons: ButtonGroup
  threeInstance.renderer.toneMapping = ACESFilmicToneMapping
  threeInstance.camera.position.set(0, 0, 20)
  threeInstance.camera.lookAt(0, 0, 0)
  threeInstance.cameraMaxAspect = 1.5
  threeInstance.resize()
  initialize(config)
  const raycaster = new Raycaster()
  const plane = new Plane(new Vector3(0, 0, 1), 0)
  const intersectionPoint = new Vector3()
  let isPaused = false

  canvas.style.touchAction = 'pan-y'
  canvas.style.userSelect = 'none'
  ;(canvas.style as unknown as { webkitUserSelect: string }).webkitUserSelect = 'none'

  const pointerData = createPointerData({
    domElement: canvas,
    onMove() {
      raycaster.setFromCamera(pointerData.nPosition, threeInstance.camera)
      threeInstance.camera.getWorldDirection(plane.normal)
      raycaster.ray.intersectPlane(plane, intersectionPoint)
      buttons.physics.center.copy(intersectionPoint)
      buttons.config.controlSphere0 = true
    },
    onLeave() {
      buttons.config.controlSphere0 = false
    }
  })

  function initialize(cfg: Partial<ButtonPitConfig>) {
    if (buttons) {
      buttons.dispose()
      threeInstance.scene.remove(buttons)
    }
    buttons = new ButtonGroup(threeInstance.renderer, cfg)
    threeInstance.scene.add(buttons)

    // Load textures if provided
    if (cfg.buttonImages?.length) {
      buttons.loadTextures(cfg.buttonImages)
    }
  }

  threeInstance.onBeforeRender = deltaInfo => {
    if (!isPaused) buttons.update(deltaInfo)
  }

  threeInstance.onAfterResize = size => {
    buttons.config.maxX = size.wWidth / 2
    buttons.config.maxY = size.wHeight / 2
  }

  return {
    three: threeInstance,
    get buttons() {
      return buttons
    },
    setCount(count: number) {
      initialize({ ...buttons.config, count })
    },
    async loadTextures(urls: string[]) {
      await buttons.loadTextures(urls)
    },
    togglePause() {
      isPaused = !isPaused
    },
    dispose() {
      pointerData.dispose?.()
      buttons.dispose()
      threeInstance.dispose()
    }
  }
}

// ============================================================================
// React Component
// ============================================================================

interface ButtonPitProps {
  className?: string
  followCursor?: boolean
  count?: number
  colors?: number[]
  gravity?: number
  friction?: number
  wallBounce?: number
  maxVelocity?: number
  minSize?: number
  maxSize?: number
  buttonImages?: string[]
}

const ButtonPit: React.FC<ButtonPitProps> = ({
  className = '',
  followCursor = true,
  count = 80,
  colors = [0x14b8a6, 0xec4899, 0x84cc16, 0xa855f7, 0xf97316],
  gravity = 0.01,
  friction = 0.9975,
  wallBounce = 0.95,
  maxVelocity = 0.15,
  minSize = 0.4,
  maxSize = 1.2,
  buttonImages = []
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const buttonPitRef = useRef<CreateButtonPitReturn | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    buttonPitRef.current = createButtonPit(canvas, {
      followCursor,
      count,
      colors,
      gravity,
      friction,
      wallBounce,
      maxVelocity,
      minSize,
      maxSize,
      buttonImages
    })

    return () => {
      if (buttonPitRef.current) {
        buttonPitRef.current.dispose()
      }
    }
  }, [followCursor, count, colors, gravity, friction, wallBounce, maxVelocity, minSize, maxSize, buttonImages])

  return <canvas className={`${className} w-full h-full`} ref={canvasRef} />
}

export default ButtonPit
