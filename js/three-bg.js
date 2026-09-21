// ================================================================
// SLAUGHTER — CORE + COSMIC STARFIELD
// ================================================================

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const canvas = document.getElementById('three-canvas');

if (!canvas) {
  console.error('❌ CANVAS #three-canvas НЕ НАЙДЕН В DOM');
} else {

  // ===== SCENE =====
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05050a, 0.02);

  const camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.1,
    500
  );
  camera.position.set(0, 0, 14);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  // ===== POST-PROCESSING — BLOOM =====
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const bloom = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.9,
    0.6,
    0.15
  );
  composer.addPass(bloom);

  // ===== LIGHTS =====
  scene.add(new THREE.AmbientLight(0xffffff, 0.15));

  const redLight = new THREE.PointLight(0xff2b2b, 6, 40);
  redLight.position.set(5, 3, 5);
  scene.add(redLight);

  const redLight2 = new THREE.PointLight(0xff2b2b, 4, 40);
  redLight2.position.set(-6, -4, 3);
  scene.add(redLight2);

  const keyLight = new THREE.DirectionalLight(0xffffff, 0.6);
  keyLight.position.set(2, 4, 6);
  scene.add(keyLight);

  // ================================================================
  // 🌌 1. STARFIELD
  // ================================================================
  const starLayers = [];

  function createStarLayer(count, minR, maxR, size, baseOpacity, colorMix) {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const r = minR + Math.random() * (maxR - minR);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = r * Math.cos(phi);

      const roll = Math.random();
      if (roll < colorMix.red) {
        colors[i3] = 1.0; colors[i3 + 1] = 0.25; colors[i3 + 2] = 0.25;
      } else if (roll < colorMix.red + colorMix.blue) {
        colors[i3] = 0.55; colors[i3 + 1] = 0.72; colors[i3 + 2] = 1.0;
      } else if (roll < colorMix.red + colorMix.blue + colorMix.purple) {
        colors[i3] = 0.85; colors[i3 + 1] = 0.5; colors[i3 + 2] = 1.0;
      } else {
        const v = 0.85 + Math.random() * 0.15;
        colors[i3] = v; colors[i3 + 1] = v * 0.95; colors[i3 + 2] = v * 0.9;
      }

      sizes[i] = size * (0.5 + Math.random());
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uOpacity: { value: baseOpacity }
      },
      vertexShader: `
        attribute float aSize;
        attribute vec3 aColor;
        varying vec3 vColor;
        varying float vTwinkle;
        uniform float uTime;
        uniform float uPixelRatio;
        void main() {
          vColor = aColor;
          float tw = sin(uTime * 2.0 + position.x * 0.5 + position.y * 0.3) * 0.5 + 0.5;
          vTwinkle = 0.6 + tw * 0.4;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * 300.0 * uPixelRatio * vTwinkle / -mvPosition.z;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vTwinkle;
        uniform float uOpacity;
        void main() {
          vec2 c = gl_PointCoord - vec2(0.5);
          float d = length(c);
          if (d > 0.5) discard;
          float alpha = smoothstep(0.5, 0.0, d);
          alpha = pow(alpha, 1.4);
          float core = smoothstep(0.15, 0.0, d);
          alpha += core * 0.7;
          gl_FragColor = vec4(vColor * (1.0 + core * 0.9), alpha * uOpacity * vTwinkle);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);
    starLayers.push({ points, mat });
  }

  createStarLayer(2500, 60, 150, 0.4, 0.75, { red: 0.25, blue: 0.15, purple: 0.05 });
  createStarLayer(1200, 40, 90, 0.6, 0.9, { red: 0.2, blue: 0.18, purple: 0.08 });
  createStarLayer(400, 25, 55, 1.0, 1.0, { red: 0.22, blue: 0.15, purple: 0.08 });

  // ================================================================
  // ☁️ 2. NEBULA CLOUDS
  // ================================================================
  const nebulaGroup = new THREE.Group();
  scene.add(nebulaGroup);

  function createNebulaTexture(color1, color2) {
    const size = 256;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d');

    const gradient = ctx.createRadialGradient(
      size / 2, size / 2, 0,
      size / 2, size / 2, size / 2
    );
    gradient.addColorStop(0, color1);
    gradient.addColorStop(0.35, color2);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const imgData = ctx.getImageData(0, 0, size, size);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = (Math.random() - 0.5) * 50;
      d[i] = Math.max(0, Math.min(255, d[i] + n));
      d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n));
      d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n));
    }
    ctx.putImageData(imgData, 0, 0);

    return new THREE.CanvasTexture(c);
  }

  const nebulaeConfigs = [
    { pos: [-50, 25, -70], size: 100, c1: 'rgba(255,43,43,0.55)', c2: 'rgba(140,15,50,0.25)', rot: 0.3 },
    { pos: [55, -20, -80], size: 120, c1: 'rgba(180,30,80,0.45)', c2: 'rgba(60,10,40,0.2)', rot: -0.5 },
    { pos: [-35, -35, -60], size: 80, c1: 'rgba(255,43,43,0.4)', c2: 'rgba(100,10,30,0.15)', rot: 1.2 },
    { pos: [40, 30, -90], size: 110, c1: 'rgba(140,50,180,0.35)', c2: 'rgba(50,10,90,0.15)', rot: 0.8 }
  ];

  nebulaeConfigs.forEach(cfg => {
    const tex = createNebulaTexture(cfg.c1, cfg.c2);
    const mat = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.75
    });
    const sprite = new THREE.Sprite(mat);
    sprite.position.set(...cfg.pos);
    sprite.scale.set(cfg.size, cfg.size, 1);
    sprite.material.rotation = cfg.rot;
    sprite.userData = {
      basePos: [...cfg.pos],
      floatSpeed: 0.08 + Math.random() * 0.15,
      phase: Math.random() * Math.PI * 2
    };
    nebulaGroup.add(sprite);
  });

  // ================================================================
  // 🩸 3. CORE
  // ================================================================
  const coreGroup = new THREE.Group();

  const wireMesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(3.2, 1),
    new THREE.MeshBasicMaterial({
      color: 0xff2b2b,
      wireframe: true,
      transparent: true,
      opacity: 0.7
    })
  );
  coreGroup.add(wireMesh);

  const crystal = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.9, 0),
    new THREE.MeshStandardMaterial({
      color: 0xff2b2b,
      emissive: 0xff2b2b,
      emissiveIntensity: 1.8,
      metalness: 0.9,
      roughness: 0.15,
      flatShading: true
    })
  );
  coreGroup.add(crystal);

  const edgesMesh = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(3.2, 1)),
    new THREE.LineBasicMaterial({
      color: 0xff2b2b,
      transparent: true,
      opacity: 0.5
    })
  );
  coreGroup.add(edgesMesh);

  // 🔥 Инициализация раздувания
  const cameFromWarp = window.__slaughterWarp === true;
  coreGroup.userData.startScale = cameFromWarp ? 0.001 : 1;
  coreGroup.userData.targetScale = 1;
  coreGroup.userData.growStart = null;

  if (cameFromWarp) {
    coreGroup.scale.setScalar(0.001);
  }

  scene.add(coreGroup);

  // ================================================================
  // ⭕ 4. RINGS
  // ================================================================
  const rings = [];
  const ringConfigs = [
    { radius: 4.5, tube: 0.02,  color: 0xff2b2b, rotation: [Math.PI / 2, 0, 0],              opacity: 0.5 },
    { radius: 5.5, tube: 0.015, color: 0xff2b2b, rotation: [Math.PI / 3, Math.PI / 4, 0],   opacity: 0.35 },
    { radius: 6.5, tube: 0.01,  color: 0xffffff, rotation: [Math.PI / 4, -Math.PI / 3, 0],  opacity: 0.2 }
  ];

  ringConfigs.forEach(cfg => {
    const geo = new THREE.TorusGeometry(cfg.radius, cfg.tube, 8, 120);
    const mat = new THREE.MeshBasicMaterial({
      color: cfg.color,
      transparent: true,
      opacity: cfg.opacity
    });
    const ring = new THREE.Mesh(geo, mat);
    ring.rotation.set(...cfg.rotation);
    scene.add(ring);
    rings.push(ring);
  });

  // ================================================================
  // ✨ 5. PARTICLES
  // ================================================================
  const particleCount = 1800;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    const r = 8 + Math.random() * 40;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
    positions[i3 + 2] = r * Math.cos(phi);

    const isRed = Math.random() > 0.55;
    if (isRed) {
      colors[i3] = 1.0; colors[i3 + 1] = 0.17; colors[i3 + 2] = 0.17;
    } else {
      const v = 0.5 + Math.random() * 0.5;
      colors[i3] = v; colors[i3 + 1] = v; colors[i3 + 2] = v;
    }
    sizes[i] = Math.random() * 0.15 + 0.03;
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
  particleGeo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

  const particleMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
    },
    vertexShader: `
      attribute float aSize;
      attribute vec3 aColor;
      varying vec3 vColor;
      uniform float uTime;
      uniform float uPixelRatio;
      void main() {
        vColor = aColor;
        vec3 pos = position;
        pos.x += sin(uTime * 0.3 + position.z * 0.1) * 0.4;
        pos.y += cos(uTime * 0.25 + position.x * 0.1) * 0.4;
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = aSize * 400.0 * uPixelRatio / -mvPosition.z;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        vec2 c = gl_PointCoord - vec2(0.5);
        float d = length(c);
        if (d > 0.5) discard;
        float alpha = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(vColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // ================================================================
  // 💎 6. SHARDS
  // ================================================================
  const shards = [];
  const shardGeo = new THREE.TetrahedronGeometry(0.15);
  const shardMat = new THREE.MeshStandardMaterial({
    color: 0xff2b2b,
    emissive: 0xff2b2b,
    emissiveIntensity: 0.9,
    metalness: 0.8,
    roughness: 0.2,
    flatShading: true
  });

  for (let i = 0; i < 40; i++) {
    const shard = new THREE.Mesh(shardGeo, shardMat);
    const r = 6 + Math.random() * 8;
    const theta = Math.random() * Math.PI * 2;
    shard.position.set(
      Math.cos(theta) * r,
      (Math.random() - 0.5) * 8,
      Math.sin(theta) * r
    );
    shard.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    shard.userData = {
      speed: 0.2 + Math.random() * 0.5,
      radius: r,
      angle: theta,
      ySpeed: (Math.random() - 0.5) * 0.3,
      rotSpeed: (Math.random() - 0.5) * 0.8
    };
    scene.add(shard);
    shards.push(shard);
  }

  // ================================================================
  // 🖱️ MOUSE / SCROLL
  // ================================================================
  const mouse = { x: 0, y: 0 };
  const target = { x: 0, y: 0 };
  let scrollY = 0;

  window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    starLayers.forEach(layer => {
      layer.mat.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
    });
    particleMat.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
  });

  // ================================================================
  // 🎬 ANIMATION LOOP
  // ================================================================
  const clock = new THREE.Clock();

  function animate() {
    const t = clock.getElapsedTime();

    target.x += (mouse.x - target.x) * 0.05;
    target.y += (mouse.y - target.y) * 0.05;

    camera.position.x = target.x * 1.5;
    camera.position.y = target.y * 1.5 + Math.sin(t * 0.4) * 0.3;
    camera.position.z = 14 - scrollY * 0.003;
    camera.lookAt(0, 0, 0);

    // ===== 🔥 РАЗДУВАНИЕ ЯДРА ПОСЛЕ WARP =====
    if (coreGroup.userData.startScale < 1) {
      if (coreGroup.userData.growStart === null) {
        coreGroup.userData.growStart = t;
      }
      const growDuration = 1.5;
      const growElapsed = t - coreGroup.userData.growStart;
      const p = Math.min(growElapsed / growDuration, 1);
      // easeOutBack — упругая пружинка
      const c1 = 1.70158;
      const c3 = c1 + 1;
      const eased = 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
      const scale = coreGroup.userData.startScale + (1 - coreGroup.userData.startScale) * eased;
      coreGroup.scale.setScalar(scale);

      if (p >= 1) {
        coreGroup.userData.startScale = 1;
        coreGroup.scale.setScalar(1);
      }
    }

    coreGroup.rotation.y = t * 0.25 + target.x * 0.3;
    coreGroup.rotation.x = Math.sin(t * 0.3) * 0.1 + target.y * 0.2;
    coreGroup.rotation.z = Math.cos(t * 0.2) * 0.05;

    const pulse = 1 + Math.sin(t * 1.5) * 0.08;
    crystal.scale.setScalar(pulse);
    crystal.rotation.y = -t * 0.4;
    crystal.rotation.x = t * 0.3;

    wireMesh.rotation.y = -t * 0.15;
    wireMesh.rotation.x = t * 0.1;

    rings.forEach((ring, i) => {
      ring.rotation.z += 0.002 * (i + 1);
      ring.rotation.y += 0.001 * (i + 1);
    });

    particleMat.uniforms.uTime.value = t;
    particles.rotation.y = t * 0.03;

    shards.forEach(s => {
      const d = s.userData;
      d.angle += d.speed * 0.01;
      s.position.x = Math.cos(d.angle) * d.radius;
      s.position.z = Math.sin(d.angle) * d.radius;
      s.position.y += d.ySpeed * 0.02;
      if (s.position.y > 6) s.position.y = -6;
      if (s.position.y < -6) s.position.y = 6;
      s.rotation.x += d.rotSpeed * 0.02;
      s.rotation.y += d.rotSpeed * 0.015;
    });

    starLayers.forEach(layer => {
      layer.mat.uniforms.uTime.value = t;
      layer.points.rotation.y += 0.00008;
    });

    nebulaGroup.children.forEach(sprite => {
      const d = sprite.userData;
      sprite.position.x = d.basePos[0] + Math.sin(t * d.floatSpeed + d.phase) * 4;
      sprite.position.y = d.basePos[1] + Math.cos(t * d.floatSpeed * 0.7 + d.phase) * 3;
      sprite.material.opacity = 0.65 + Math.sin(t * 0.4 + d.phase) * 0.15;
    });

    redLight.position.x = Math.sin(t * 0.5) * 6;
    redLight.position.z = Math.cos(t * 0.5) * 6;
    redLight2.position.x = Math.cos(t * 0.7) * 7;
    redLight2.position.y = Math.sin(t * 0.6) * 4;

    composer.render();
    requestAnimationFrame(animate);
  }

  animate();
}