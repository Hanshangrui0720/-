/* eslint-disable react/no-unknown-property */
import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, extend, useFrame } from '@react-three/fiber'
import { Environment, Lightformer, useGLTF, useTexture } from '@react-three/drei'
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import * as THREE from 'three'
import './Lanyard.css'

extend({ MeshLineGeometry, MeshLineMaterial })

const asset = path => `${import.meta.env.BASE_URL}${path}`
const cardGLB = asset('assets/lanyard/card.glb')
const frontUV = { x: 0, y: 0, w: 0.5, h: 0.755 }
const backUV = { x: 0.5, y: 0, w: 0.5, h: 0.757 }

export default function Lanyard({ position = [0, 0, 23], gravity = [0, -40, 0] }) {
  const [mobile, setMobile] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return (
    <div className="hero-lanyard-3d" aria-label="可拖动的韩尚睿 AI designer 挂牌">
      <Canvas camera={{ position, fov: 17 }} dpr={[1, mobile ? 1.2 : 2]} gl={{ alpha: true }} onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), 0)}>
        <ambientLight intensity={Math.PI} />
        <Physics gravity={gravity} timeStep={mobile ? 1 / 30 : 1 / 60}><Band mobile={mobile} /></Physics>
        <Environment blur={0.78}>
          <Lightformer intensity={4.2} color="#f3392c" position={[-3, 2, 4]} rotation={[0, 0, Math.PI / 3]} scale={[10, 0.1, 1]} />
          <Lightformer intensity={6.4} color="#fff4e6" position={[4, 0, 7]} rotation={[0, 0, Math.PI / 3]} scale={[10, 0.16, 1]} />
        </Environment>
      </Canvas>
    </div>
  )
}

function Band({ mobile }) {
  const band = useRef()
  const fixed = useRef()
  const j1 = useRef()
  const j2 = useRef()
  const j3 = useRef()
  const card = useRef()
  const pointerWorld = useRef(new THREE.Vector3())
  const dragOffset = useRef(new THREE.Vector3())
  const cardAnchor = useRef(new THREE.Vector3())
  const cardQuaternion = useRef(new THREE.Quaternion())
  const direction = new THREE.Vector3()
  const angular = new THREE.Vector3()
  const rotation = new THREE.Vector3()
  const { nodes, materials } = useGLTF(cardGLB)
  const bandTexture = useTexture(asset('assets/lanyard/band.svg'))
  const frontTexture = useTexture(asset('assets/lanyard/badge-front.svg?v=8'))
  const backTexture = useTexture(asset('assets/lanyard/badge-back.svg'))
  const map = useMemo(() => {
    const base = materials.base.map
    const source = base.image
    const canvas = document.createElement('canvas')
    canvas.width = source.width
    canvas.height = source.height
    const ctx = canvas.getContext('2d')
    if (!ctx) return base
    ctx.drawImage(source, 0, 0)
    const draw = (image, rect) => {
      const x = rect.x * canvas.width
      const y = rect.y * canvas.height
      const w = rect.w * canvas.width
      const h = rect.h * canvas.height
      const scale = Math.max(w / image.width, h / image.height)
      const dw = image.width * scale
      const dh = image.height * scale
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip()
      ctx.drawImage(image, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh)
      ctx.restore()
    }
    if (frontTexture.image) draw(frontTexture.image, frontUV)
    if (backTexture.image) draw(backTexture.image, backUV)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.flipY = base.flipY
    texture.anisotropy = 16
    return texture
  }, [materials.base.map, frontTexture, backTexture])
  const [curve] = useState(() => new THREE.CatmullRomCurve3(Array.from({ length: 5 }, () => new THREE.Vector3())))
  const [dragged, setDragged] = useState(false)
  const [hovered, setHovered] = useState(false)
  const props = { type: 'dynamic', canSleep: true, colliders: false, angularDamping: 4, linearDamping: 4 }

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1])
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1])
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1])
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.5, 0]])

  useEffect(() => {
    if (!hovered) return undefined
    document.body.style.cursor = dragged ? 'grabbing' : 'grab'
    return () => { document.body.style.cursor = 'auto' }
  }, [hovered, dragged])

  useFrame((state, delta) => {
    if (dragged) {
      pointerWorld.current.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera)
      direction.copy(pointerWorld.current).sub(state.camera.position).normalize()
      pointerWorld.current.add(direction.multiplyScalar(state.camera.position.length()))
      ;[card, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp())
      card.current?.setNextKinematicTranslation({
        x: pointerWorld.current.x - dragOffset.current.x,
        y: pointerWorld.current.y - dragOffset.current.y,
        z: pointerWorld.current.z - dragOffset.current.z,
      })
    }
    if (!fixed.current || !j1.current || !j2.current || !j3.current || !card.current || !band.current) return
    ;[j1, j2].forEach(ref => {
      if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation())
      const distance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())))
      ref.current.lerped.lerp(ref.current.translation(), delta * (50 * distance))
    })
    cardQuaternion.current.copy(card.current.rotation())
    cardAnchor.current.set(0, 1.5, 0).applyQuaternion(cardQuaternion.current).add(card.current.translation())
    curve.points[0].copy(cardAnchor.current)
    curve.points[1].copy(j3.current.translation())
    curve.points[2].copy(j2.current.lerped)
    curve.points[3].copy(j1.current.lerped)
    curve.points[4].copy(fixed.current.translation())
    band.current.geometry.setPoints(curve.getPoints(mobile ? 20 : 40))
    angular.copy(card.current.angvel())
    rotation.copy(card.current.rotation())
    card.current.setAngvel({ x: angular.x, y: angular.y - rotation.y * 0.25, z: angular.z })
  })

  curve.curveType = 'chordal'
  bandTexture.wrapS = bandTexture.wrapT = THREE.RepeatWrapping
  return (
    <>
      <group position={[5.18, 5.25, 0]}>
        <RigidBody ref={fixed} {...props} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...props}><BallCollider args={[0.1]} /></RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...props}><BallCollider args={[0.1]} /></RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...props}><BallCollider args={[0.1]} /></RigidBody>
        <RigidBody position={[2, 0, 0]} ref={card} {...props} type={dragged ? 'kinematicPosition' : 'dynamic'}>
          <CuboidCollider args={[0.72, 1.18, 0.04]} />
          <group scale={[2.08, 2.35, 2.35]} position={[0, -1.2, -0.05]} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)} onPointerUp={event => { event.target.releasePointerCapture(event.pointerId); setDragged(false) }} onPointerDown={event => { event.target.setPointerCapture(event.pointerId); dragOffset.current.copy(event.point).sub(card.current.translation()); setDragged(true) }}>
            <mesh geometry={nodes.card.geometry}><meshPhysicalMaterial map={map} map-anisotropy={16} transparent opacity={1} transmission={0} thickness={0.22} ior={1.3} clearcoat={0.96} clearcoatRoughness={0.08} roughness={0.14} metalness={0.92} envMapIntensity={2.75} iridescence={0} /></mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.22} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}><meshLineGeometry /><meshLineMaterial color="#111216" depthTest={false} resolution={mobile ? [500, 900] : [1600, 900]} useMap map={bandTexture} repeat={[-4, 1]} lineWidth={0.92} /></mesh>
    </>
  )
}
