import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { USDLoader } from 'three/examples/jsm/loaders/USDLoader.js'

export default function SwitchModel({
  mouse,
}: {
  mouse: React.MutableRefObject<{ x: number; y: number }>
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setSize(canvas.clientWidth, canvas.clientHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, canvas.clientWidth / canvas.clientHeight, 0.01, 1000)
    camera.position.set(0, 0, 5.5)

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambient)
    const key = new THREE.DirectionalLight(0xffffff, 1.4)
    key.position.set(4, 6, 4)
    key.castShadow = true
    scene.add(key)
    const fill = new THREE.DirectionalLight(0x4CC3E3, 0.5)
    fill.position.set(-4, 2, -2)
    scene.add(fill)
    const rim = new THREE.DirectionalLight(0xffffff, 0.3)
    rim.position.set(0, -3, -4)
    scene.add(rim)

    // Shadow plane
    const shadowGeo = new THREE.PlaneGeometry(8, 8)
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.3 })
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat)
    shadowPlane.rotation.x = -Math.PI / 2
    shadowPlane.position.y = -1.6
    shadowPlane.receiveShadow = true
    scene.add(shadowPlane)

    const group = new THREE.Group()
    scene.add(group)

    // Load model
    const loader = new USDLoader()
    loader.load('/assets/switch-3d.usdz', (model: THREE.Group) => {
      // 1. Calcular tamaño antes de escalar
      const box0 = new THREE.Box3().setFromObject(model)
      const size = box0.getSize(new THREE.Vector3())
      const maxDim = Math.max(size.x, size.y, size.z)
      const scale = maxDim > 0 ? 2.8 / maxDim : 1
      model.scale.setScalar(scale)

      // 2. Recalcular bounding box en world space con la escala ya aplicada
      model.updateMatrixWorld(true)
      const box1 = new THREE.Box3().setFromObject(model)
      const center = box1.getCenter(new THREE.Vector3())

      // 3. Mover el modelo para que su centro quede en el origen del grupo
      model.position.sub(center)
      model.position.y -= 0.2

      // 4. Rotar para que la pantalla mire de frente a la cámara, vertical
      model.rotation.set(-Math.PI / 2, 0, -Math.PI / 2)

      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) (child as THREE.Mesh).castShadow = true
      })
      group.add(model)
    })

    // Animation loop
    let raf = 0
    const clock = new THREE.Clock()
    const animate = () => {
      raf = requestAnimationFrame(animate)
      const delta = clock.getDelta()
      const targetY = mouse.current.x * Math.PI * 0.45
      const targetX = -mouse.current.y * Math.PI * 0.2
      group.rotation.y += (targetY - group.rotation.y) * 0.06
      group.rotation.x += (targetX - group.rotation.x) * 0.06
      group.rotation.y += delta * 0.25 * (1 - Math.abs(mouse.current.x) * 0.8)
      renderer.render(scene, camera)
    }
    animate()

    // Resize
    const onResize = () => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(onResize)
    ro.observe(canvas)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      renderer.dispose()
    }
  }, [mouse])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}
