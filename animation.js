window.addEventListener("DOMContentLoaded", () => {
  if (typeof THREE === "undefined") return;

  const prefersReducedMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;

  const canvas =
    document.getElementById("background-animation") ||
    document.getElementById("bg-canvas");
  if (!canvas || canvas.dataset.threeBgBound) return;
  canvas.dataset.threeBgBound = "true";

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    200
  );
  camera.position.set(0, 0, 40);

  const particleCount = 3000;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 160;
    positions[i3 + 1] = (Math.random() - 0.5) * 100;
    positions[i3 + 2] = (Math.random() - 0.5) * 80;
    const t = Math.random();
    if (t < 0.15) {
      colors[i3] = 1;
      colors[i3 + 1] = 0.28;
      colors[i3 + 2] = 0.06;
    } else if (t < 0.25) {
      colors[i3] = 1;
      colors[i3 + 1] = 0.5;
      colors[i3 + 2] = 0.2;
    } else {
      const g = 0.2 + Math.random() * 0.5;
      colors[i3] = g;
      colors[i3 + 1] = g;
      colors[i3 + 2] = g;
    }
    sizes[i] = Math.random() * 2.5 + 0.3;
  }

  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  pGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  pGeo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

  const pMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader:
      "attribute float size;attribute vec3 color;varying vec3 vColor;uniform float uTime;void main(){vColor=color;vec3 pos=position;pos.y+=sin(uTime*.4+position.x*.05)*1.5;pos.x+=cos(uTime*.3+position.z*.04)*1.0;vec4 mv=modelViewMatrix*vec4(pos,1.0);gl_PointSize=size*(300.0/-mv.z);gl_Position=projectionMatrix*mv;}",
    fragmentShader:
      "varying vec3 vColor;void main(){float d=distance(gl_PointCoord,vec2(.5));if(d>.5)discard;float alpha=1.0-smoothstep(.3,.5,d);gl_FragColor=vec4(vColor,alpha*.85);}",
    transparent: true,
    depthWrite: false,
    vertexColors: true
  });

  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  const makeTorus = (r, tube, color, opacity, px, py, pz) => {
    const mesh = new THREE.Mesh(
      new THREE.TorusGeometry(r, tube, 8, 60),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity })
    );
    mesh.position.set(px, py, pz);
    scene.add(mesh);
    return mesh;
  };
  const ring1 = makeTorus(6, 0.08, 0xff6a00, 0.18, 28, 10, -15);
  const ring2 = makeTorus(4, 0.05, 0xffffff, 0.08, -25, -8, -10);

  const glowGeo = new THREE.SphereGeometry(3, 32, 32);
  const glowMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader:
      "varying vec3 vNormal;void main(){vNormal=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
    fragmentShader:
      "varying vec3 vNormal;uniform float uTime;void main(){float f=pow(1.0-abs(dot(vNormal,vec3(0,0,1))),2.5);float pulse=0.6+0.4*sin(uTime*1.5);gl_FragColor=vec4(0.93,0.32,0.1,f*pulse*0.4);}",
    transparent: true,
    depthWrite: false,
    side: THREE.FrontSide,
    blending: THREE.AdditiveBlending
  });
  const glowSphere = new THREE.Mesh(glowGeo, glowMat);
  glowSphere.position.set(30, -8, -20);
  scene.add(glowSphere);

  const gridHelper = new THREE.GridHelper(200, 30, 0xff6a00, 0x1a0a04);
  gridHelper.position.y = -22;
  gridHelper.material.transparent = true;
  gridHelper.material.opacity = 0.15;
  scene.add(gridHelper);

  let mouseX = 0;
  let mouseY = 0;
  window.addEventListener(
    "mousemove",
    (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    },
    { passive: true }
  );

  const clock = new THREE.Clock();
  let raf = 0;
  const animate = () => {
    raf = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    pMat.uniforms.uTime.value = t;
    glowMat.uniforms.uTime.value = t;
    particles.rotation.y = t * 0.015;
    particles.rotation.x = t * 0.005;
    ring1.rotation.x = t * 0.4;
    ring1.rotation.y = t * 0.25;
    ring2.rotation.x = -t * 0.3;
    ring2.rotation.z = t * 0.2;
    glowSphere.scale.setScalar(1 + 0.08 * Math.sin(t * 1.8));
    gridHelper.position.z = (t * 2) % 6.67 - 3.33;
    camera.position.x += (mouseX * 6 - camera.position.x) * 0.03;
    camera.position.y += (-mouseY * 4 - camera.position.y) * 0.03;
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
  };
  animate();

  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  };
  window.addEventListener("resize", onResize, { passive: true });

  window.addEventListener(
    "pagehide",
    () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    },
    { once: true }
  );
});
