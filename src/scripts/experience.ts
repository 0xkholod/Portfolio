const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

const revealElements = document.querySelectorAll<HTMLElement>(".reveal")
if (reducedMotion) {
  revealElements.forEach((element) => element.classList.add("is-visible"))
} else {
  const observer = new IntersectionObserver(
    (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible")),
    { threshold: 0.12 },
  )
  revealElements.forEach((element) => observer.observe(element))
}

const cursorGlow = document.querySelector<HTMLElement>(".cursor-glow")
if (cursorGlow && !reducedMotion) {
  let targetX = innerWidth / 2
  let targetY = innerHeight / 2
  let currentX = targetX
  let currentY = targetY
  let glowFrame = 0
  let glowRunning = false

  const paintGlow = () => {
    cursorGlow.style.transform = `translate3d(${currentX}px,${currentY}px,0) translate3d(-50%,-50%,0)`
  }

  const followPointer = () => {
    currentX += (targetX - currentX) * 0.12
    currentY += (targetY - currentY) * 0.12
    paintGlow()

    if (Math.hypot(targetX - currentX, targetY - currentY) > 0.08) {
      glowFrame = requestAnimationFrame(followPointer)
      return
    }

    currentX = targetX
    currentY = targetY
    paintGlow()
    glowRunning = false
  }

  const queueGlowFrame = () => {
    if (glowRunning) return
    glowRunning = true
    cancelAnimationFrame(glowFrame)
    glowFrame = requestAnimationFrame(followPointer)
  }

  paintGlow()
  window.addEventListener("pointermove", (event) => {
    targetX = event.clientX
    targetY = event.clientY
    queueGlowFrame()
  }, { passive: true })
}

const headerBrand = document.querySelector<HTMLElement>(".brand")
const headerSigil = headerBrand?.querySelector<HTMLElement>(".brand-sigil")
const headerNav = document.querySelector<HTMLElement>(".desktop-nav")
if (headerBrand && headerSigil) {
  const replaySigilHop = () => {
    if (reducedMotion) return
    headerSigil.classList.remove("is-switching")
    void headerSigil.offsetWidth
    headerSigil.classList.add("is-switching")
    window.setTimeout(() => headerSigil.classList.remove("is-switching"), 540)
  }
  headerBrand.addEventListener("pointerenter", replaySigilHop)
  headerBrand.addEventListener("pointerleave", replaySigilHop)

  if (headerNav) {
    const activateAlias = () => {
      headerBrand.classList.add("is-nav-active")
      replaySigilHop()
    }
    const deactivateAlias = () => {
      window.requestAnimationFrame(() => {
        if (headerNav.matches(":hover") || headerNav.contains(document.activeElement)) return
        headerBrand.classList.remove("is-nav-active")
        replaySigilHop()
      })
    }
    headerNav.addEventListener("pointerenter", activateAlias)
    headerNav.addEventListener("pointerleave", deactivateAlias)
    headerNav.addEventListener("focusin", activateAlias)
    headerNav.addEventListener("focusout", deactivateAlias)
  }
}

const initBrandLiquidBorder = () => {
  const brand = document.querySelector<HTMLElement>(".brand")
  const nav = document.querySelector<HTMLElement>(".desktop-nav")
  const canvas = brand?.querySelector<HTMLCanvasElement>(".brand-liquid-border")
  const context = canvas?.getContext("2d")
  if (!brand || !canvas || !context || reducedMotion) return
  let active = false
  let frame = 0

  const draw = (now: number) => {
    const rect = brand.getBoundingClientRect()
    const ratio = Math.min(devicePixelRatio, 2)
    const width = Math.max(1, Math.round(rect.width * ratio))
    const height = Math.max(1, Math.round(rect.height * ratio))
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
    }
    context.clearRect(0, 0, width, height)
    if (!active) return

    const margin = 3.5 * ratio
    const radius = 16 * ratio
    const phase = now / 620
    const wave = (position: number, axis: number) => (
      Math.sin(position / (72 * ratio) + phase + axis) * 1.55
      + Math.sin(position / (31 * ratio) - phase * .63 + axis * 1.7) * .55
    ) * ratio

    context.beginPath()
    context.moveTo(margin + radius, margin + wave(margin + radius, 0))
    for (let x = margin + radius; x <= width - margin - radius; x += 12 * ratio) context.lineTo(x, margin + wave(x, 0))
    context.quadraticCurveTo(width - margin, margin, width - margin + wave(radius, 1), margin + radius)
    for (let y = margin + radius; y <= height - margin - radius; y += 12 * ratio) context.lineTo(width - margin + wave(y, 1), y)
    context.quadraticCurveTo(width - margin, height - margin, width - margin - radius, height - margin + wave(width - radius, 2))
    for (let x = width - margin - radius; x >= margin + radius; x -= 12 * ratio) context.lineTo(x, height - margin + wave(x, 2))
    context.quadraticCurveTo(margin, height - margin, margin + wave(height - radius, 3), height - margin - radius)
    for (let y = height - margin - radius; y >= margin + radius; y -= 12 * ratio) context.lineTo(margin + wave(y, 3), y)
    context.quadraticCurveTo(margin, margin, margin + radius, margin + wave(margin + radius, 0))
    context.closePath()
    context.strokeStyle = "rgba(105,231,248,.78)"
    context.lineWidth = 1.15 * ratio
    context.lineJoin = "round"
    context.shadowBlur = 7 * ratio
    context.shadowColor = "rgba(76,208,237,.46)"
    context.stroke()
    context.shadowBlur = 0
    frame = requestAnimationFrame(draw)
  }

  const start = () => {
    if (active) return
    active = true
    brand.classList.add("is-water-active")
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(draw)
  }
  const stop = () => {
    window.requestAnimationFrame(() => {
      const brandActive = brand.matches(":hover") || document.activeElement === brand
      const navActive = Boolean(nav?.matches(":hover") || nav?.contains(document.activeElement))
      if (brandActive || navActive) return
      active = false
      brand.classList.remove("is-water-active")
      window.setTimeout(() => {
        if (!active) context.clearRect(0, 0, canvas.width, canvas.height)
      }, 300)
    })
  }

  brand.addEventListener("pointerenter", start)
  brand.addEventListener("pointerleave", stop)
  brand.addEventListener("focus", start)
  brand.addEventListener("blur", stop)
  nav?.addEventListener("pointerenter", start)
  nav?.addEventListener("pointerleave", stop)
  nav?.addEventListener("focusin", start)
  nav?.addEventListener("focusout", stop)
}

const initPortraitLiquidBorder = () => {
  const portrait = document.querySelector<HTMLElement>(".portrait-placeholder")
  const canvas = portrait?.querySelector<HTMLCanvasElement>(".portrait-liquid-border")
  const context = canvas?.getContext("2d")
  if (!portrait || !canvas || !context || reducedMotion) return
  let active = false
  let frame = 0

  const draw = (now: number) => {
    const rect = portrait.getBoundingClientRect()
    const ratio = Math.min(devicePixelRatio, 2)
    const width = Math.max(1, Math.round(rect.width * ratio))
    const height = Math.max(1, Math.round(rect.height * ratio))
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
    }
    context.clearRect(0, 0, width, height)
    if (!active) return

    const margin = 3.5 * ratio
    const radius = 24 * ratio
    const phase = now / 620
    const wave = (position: number, axis: number) => (
      Math.sin(position / (72 * ratio) + phase + axis) * 1.55
      + Math.sin(position / (31 * ratio) - phase * .63 + axis * 1.7) * .55
    ) * ratio

    context.beginPath()
    context.moveTo(margin + radius, margin + wave(margin + radius, 0))
    for (let x = margin + radius; x <= width - margin - radius; x += 12 * ratio) context.lineTo(x, margin + wave(x, 0))
    context.quadraticCurveTo(width - margin, margin, width - margin + wave(radius, 1), margin + radius)
    for (let y = margin + radius; y <= height - margin - radius; y += 12 * ratio) context.lineTo(width - margin + wave(y, 1), y)
    context.quadraticCurveTo(width - margin, height - margin, width - margin - radius, height - margin + wave(width - radius, 2))
    for (let x = width - margin - radius; x >= margin + radius; x -= 12 * ratio) context.lineTo(x, height - margin + wave(x, 2))
    context.quadraticCurveTo(margin, height - margin, margin + wave(height - radius, 3), height - margin - radius)
    for (let y = height - margin - radius; y >= margin + radius; y -= 12 * ratio) context.lineTo(margin + wave(y, 3), y)
    context.quadraticCurveTo(margin, margin, margin + radius, margin + wave(margin + radius, 0))
    context.closePath()
    context.strokeStyle = "rgba(105,231,248,.78)"
    context.lineWidth = 1.15 * ratio
    context.lineJoin = "round"
    context.shadowBlur = 7 * ratio
    context.shadowColor = "rgba(76,208,237,.46)"
    context.stroke()
    context.shadowBlur = 0
    frame = requestAnimationFrame(draw)
  }

  const start = () => {
    if (active) return
    active = true
    portrait.classList.add("is-water-active")
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(draw)
  }
  const stop = () => {
    active = false
    portrait.classList.remove("is-water-active")
    cancelAnimationFrame(frame)
    window.setTimeout(() => {
      if (!active) context.clearRect(0, 0, canvas.width, canvas.height)
    }, 300)
  }

  portrait.addEventListener("pointerenter", start)
  portrait.addEventListener("pointerleave", stop)
}

const initCursorTrail = () => {
  const canvas = document.querySelector<HTMLCanvasElement>("#cursor-trail")
  if (!canvas || reducedMotion || window.matchMedia("(hover: none)").matches) return
  const context = canvas.getContext("2d")
  if (!context) return
  type TrailParticle = { x:number; y:number; vx:number; vy:number; life:number; size:number; pink:boolean }
  let particles: TrailParticle[] = []
  let lastX = -100
  let lastY = -100
  let frame = 0

  const resize = () => {
    const ratio = Math.min(devicePixelRatio, 1.7)
    canvas.width = Math.round(innerWidth * ratio)
    canvas.height = Math.round(innerHeight * ratio)
    canvas.style.width = `${innerWidth}px`
    canvas.style.height = `${innerHeight}px`
  }
  resize()
  window.addEventListener("resize", resize, { passive: true })

  const draw = () => {
    const ratio = Math.min(devicePixelRatio, 1.7)
    context.clearRect(0, 0, canvas.width, canvas.height)
    particles.forEach((particle) => {
      particle.x += particle.vx
      particle.y += particle.vy
      particle.vx *= .965
      particle.vy = particle.vy * .965 + .008
      particle.life -= .04
      context.globalAlpha = Math.max(0, particle.life) * .62
      context.fillStyle = particle.pink ? "#ff75cd" : "#75eaff"
      context.shadowBlur = 7 * ratio
      context.shadowColor = context.fillStyle as string
      context.beginPath()
      context.arc(particle.x * ratio, particle.y * ratio, particle.size * ratio, 0, Math.PI * 2)
      context.fill()
    })
    particles = particles.filter((particle) => particle.life > 0)
    context.globalAlpha = 1
    context.shadowBlur = 0
    if (particles.length) frame = requestAnimationFrame(draw)
  }

  window.addEventListener("pointermove", (event) => {
    if (Math.hypot(event.clientX - lastX, event.clientY - lastY) < 6) return
    lastX = event.clientX
    lastY = event.clientY
    for (let index = 0; index < 3; index += 1) {
      particles.push({
        x: event.clientX + (Math.random() - .5) * 5,
        y: event.clientY + (Math.random() - .5) * 5,
        vx: (Math.random() - .5) * .34,
        vy: (Math.random() - .5) * .28,
        life: .68 + Math.random() * .22,
        size: .82 + Math.random() * .78,
        pink: Math.random() > .86,
      })
    }
    particles = particles.slice(-56)
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(draw)
  }, { passive: true })
}

document.querySelectorAll<HTMLElement>(".tilt-card, .badge-frame, .article-card").forEach((card) => {
  if (reducedMotion) return
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect()
    const rx = ((event.clientY - rect.top) / rect.height - 0.5) * -7
    const ry = ((event.clientX - rect.left) / rect.width - 0.5) * 8
    card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-3px)`
  })
  card.addEventListener("pointerleave", () => { card.style.transform = "" })
})

const initAliasReconstruction = () => {
  const target = document.querySelector<HTMLElement>("[data-scramble]")
  const canvas = document.querySelector<HTMLCanvasElement>("#alias-particles")
  const stage = target?.closest<HTMLElement>(".alias-stage")
  if (!target || !canvas || !stage || reducedMotion) return
  const finalText = target.dataset.scramble ?? target.textContent ?? ""
  const glyphs = "0123456789ABCDEF!@#$%&*+-=<>?/\\[]{}"
  type AliasParticle = {
    homeX:number; homeY:number; x:number; y:number; vx:number; vy:number;
    phase:number; highlight:boolean; color:string; mass:number;
  }
  let particles: AliasParticle[] = []
  const context = canvas.getContext("2d")
  if (!context) return
  let animationFrame = 0
  let introTimer = 0
  let active = false
  let transitionProgress = 0
  let pointer = { x: 0, y: 0 }

  const scrambledText = (revealed = 0) => finalText.split("").map((character, index) => (
    index < revealed ? character : glyphs[Math.floor(Math.random() * glyphs.length)]
  )).join("")

  const playInitialHexReveal = () => {
    const startedAt = performance.now()
    const duration = 1080
    const revealDelay = .22
    target.textContent = scrambledText(0)
    window.clearInterval(introTimer)
    introTimer = window.setInterval(() => {
      const progress = Math.min(1, (performance.now() - startedAt) / duration)
      const revealProgress = Math.max(0, (progress - revealDelay) / (1 - revealDelay))
      const revealed = Math.min(finalText.length, Math.floor(revealProgress * (finalText.length + 1)))
      target.textContent = progress >= 1 ? finalText : scrambledText(revealed)
      if (progress >= 1) window.clearInterval(introTimer)
    }, 34)
  }
  void document.fonts.ready.then(playInitialHexReveal).catch(playInitialHexReveal)

  const seedTextParticles = () => {
    const canvasRect = canvas.getBoundingClientRect()
    const targetRect = target.getBoundingClientRect()
    const scratch = document.createElement("canvas")
    scratch.width = Math.max(1, Math.round(canvasRect.width))
    scratch.height = Math.max(1, Math.round(canvasRect.height))
    const scratchContext = scratch.getContext("2d")
    if (!scratchContext) return
    const computed = getComputedStyle(target)
    scratchContext.font = computed.font
    ;(scratchContext as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = computed.letterSpacing
    scratchContext.textAlign = "center"
    scratchContext.textBaseline = "middle"
    const centerX = targetRect.left - canvasRect.left + targetRect.width / 2
    const centerY = targetRect.top - canvasRect.top + targetRect.height / 2
    const textLeft = targetRect.left - canvasRect.left
    const gradient = scratchContext.createLinearGradient(textLeft, centerY, textLeft + targetRect.width, centerY)
    gradient.addColorStop(0, "#ffffff")
    gradient.addColorStop(.08, "#ffffff")
    gradient.addColorStop(.43, "#ffb5e5")
    gradient.addColorStop(.88, "#7df4f3")
    gradient.addColorStop(1, "#7df4f3")
    scratchContext.fillStyle = gradient
    scratchContext.fillText(finalText, centerX, centerY)
    const pixels = scratchContext.getImageData(0, 0, scratch.width, scratch.height).data
    const points: Array<{x:number;y:number;color:string}> = []
    for (let y = 0; y < scratch.height; y += 2) {
      for (let x = 0; x < scratch.width; x += 2) {
        const pixelIndex = (y * scratch.width + x) * 4
        if (pixels[pixelIndex + 3] > 42) {
          points.push({ x, y, color: `rgb(${pixels[pixelIndex]},${pixels[pixelIndex + 1]},${pixels[pixelIndex + 2]})` })
        }
      }
    }
    const maxParticles = 7200
    const selectedPoints = points.length <= maxParticles
      ? points
      : Array.from({ length: maxParticles }, (_, index) => points[Math.floor(index * points.length / maxParticles)])
    particles = selectedPoints.map((point, index) => {
      const jitterX = (Math.random() - .5) * .72
      const jitterY = (Math.random() - .5) * .72
      return {
      homeX: point.x + jitterX,
      homeY: point.y + jitterY,
      x: point.x + jitterX,
      y: point.y + jitterY,
      vx: 0,
      vy: 0,
      phase: Math.random() * Math.PI * 2,
      highlight: index % 31 === 0,
      color: point.color,
      mass: .72 + Math.random() * .56,
    }})
    pointer = { x: centerX, y: centerY }
  }

  const drawParticles = () => {
    const rect = canvas.getBoundingClientRect()
    const ratio = Math.min(devicePixelRatio, 2)
    if (canvas.width !== Math.round(rect.width * ratio) || canvas.height !== Math.round(rect.height * ratio)) {
      canvas.width = Math.max(1, Math.round(rect.width * ratio))
      canvas.height = Math.max(1, Math.round(rect.height * ratio))
    }
    context.clearRect(0, 0, canvas.width, canvas.height)
    transitionProgress += ((active ? 1 : 0) - transitionProgress) * (active ? .055 : .075)
    stage.style.setProperty("--particle-progress", transitionProgress.toFixed(3))
    if (transitionProgress > .04) {
      const anchorOpacity = Math.min(.14, transitionProgress * .17)
      particles.forEach((particle) => {
        context.globalAlpha = anchorOpacity
        context.fillStyle = particle.color
        context.beginPath()
        context.arc(particle.homeX * ratio, particle.homeY * ratio, .43 * ratio, 0, Math.PI * 2)
        context.fill()
      })
    }
    let settled = 0
    particles.forEach((particle) => {
      if (active) {
        const dx = particle.x - pointer.x
        const dy = particle.y - pointer.y
        const distance = Math.max(5, Math.hypot(dx, dy))
        if (distance < 230) {
          const influence = Math.exp(-(distance * distance) / (2 * 72 * 72))
          const angle = Math.atan2(dy, dx) + Math.sin(particle.phase + performance.now() * .0017) * .24
          const force = Math.pow(influence, 1.25) * .48 * particle.mass
          const tangent = Math.sin(particle.phase * 1.7) * .075 * influence
          particle.vx += Math.cos(angle) * force - Math.sin(angle) * tangent
          particle.vy += Math.sin(angle) * force + Math.cos(angle) * tangent
        }
        particle.vx += Math.sin(performance.now() / 235 + particle.phase) * .0045
        particle.vy += Math.cos(performance.now() / 285 + particle.phase) * .004
        particle.vx += (particle.homeX - particle.x) * .032
        particle.vy += (particle.homeY - particle.y) * .032
      } else {
        particle.vx += (particle.homeX - particle.x) * .11
        particle.vy += (particle.homeY - particle.y) * .11
        if (Math.hypot(particle.homeX - particle.x, particle.homeY - particle.y) < .45) settled += 1
      }
      particle.x += particle.vx
      particle.y += particle.vy
      particle.vx *= active ? .86 : .7
      particle.vy *= active ? .86 : .7
      context.globalAlpha = particle.highlight ? .98 : .88
      context.fillStyle = particle.color
      context.shadowBlur = (particle.highlight ? 7 : 4) * ratio
      context.shadowColor = particle.color
      context.beginPath()
      context.arc(particle.x * ratio, particle.y * ratio, (particle.highlight ? .96 : .68) * ratio, 0, Math.PI * 2)
      context.fill()
    })
    context.globalAlpha = 1
    context.shadowBlur = 0
    if (!active && settled >= particles.length * .96 && transitionProgress < .025) {
      context.clearRect(0, 0, canvas.width, canvas.height)
      particles = []
      stage.classList.remove("is-particles")
      stage.style.setProperty("--particle-progress", "0")
      target.textContent = finalText
      return
    }
    animationFrame = requestAnimationFrame(drawParticles)
  }

  const activateParticles = (event: PointerEvent) => {
    if (active) return
    window.clearInterval(introTimer)
    target.textContent = finalText
    active = true
    stage.classList.add("is-particles")
    seedTextParticles()
    const rect = canvas.getBoundingClientRect()
    pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top }
    cancelAnimationFrame(animationFrame)
    animationFrame = requestAnimationFrame(drawParticles)
  }

  const reconstruct = () => {
    active = false
    if (particles.length) {
      cancelAnimationFrame(animationFrame)
      animationFrame = requestAnimationFrame(drawParticles)
    } else {
      stage.classList.remove("is-particles")
    }
  }

  stage.addEventListener("pointerenter", activateParticles)
  stage.addEventListener("pointermove", (event) => {
    const rect = canvas.getBoundingClientRect()
    pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }, { passive: true })
  stage.addEventListener("pointerleave", reconstruct)
}

type SnowParticle = { bx:number; by:number; bz:number; x:number; y:number; z:number; vx:number; vy:number; vz:number; phase:number }

const initSnowflake = () => {
  const canvas = document.querySelector<HTMLCanvasElement>("#snowflake-canvas")
  if (!canvas) return
  const context = canvas.getContext("2d")
  if (!context) return
  const particles: SnowParticle[] = []
  const addParticle = (x:number, y:number, z:number, phase:number) => particles.push({ bx:x, by:y, bz:z, x, y, z, vx:0, vy:0, vz:0, phase })

  for (let arm = 0; arm < 6; arm += 1) {
    const angle = arm * Math.PI / 3
    for (let step = 2; step <= 42; step += 1) {
      const radius = step / 42
      addParticle(Math.cos(angle) * radius, Math.sin(angle) * radius, Math.sin(step * .75 + arm) * .045, arm + step)
    }
    ;[.34, .55, .75].forEach((anchor, branchIndex) => {
      for (const side of [-1, 1]) {
        const branchAngle = angle + side * Math.PI * .72
        for (let step = 1; step <= 10; step += 1) {
          const branchLength = (step / 10) * (.16 + branchIndex * .025)
          const x = Math.cos(angle) * anchor + Math.cos(branchAngle) * branchLength
          const y = Math.sin(angle) * anchor + Math.sin(branchAngle) * branchLength
          addParticle(x, y, Math.sin(step + arm) * .06, arm * 20 + branchIndex * 10 + step)
        }
      }
    })
  }
  for (let ring = 0; ring < 54; ring += 1) {
    const angle = ring / 54 * Math.PI * 2
    addParticle(Math.cos(angle) * .115, Math.sin(angle) * .115, Math.sin(angle * 3) * .08, ring)
  }

  let pointer = { x: 0, y: 0, active: false }
  canvas.addEventListener("pointermove", (event) => {
    const rect = canvas.getBoundingClientRect()
    pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top, active: true }
  }, { passive: true })
  canvas.addEventListener("pointerleave", () => { pointer.active = false })

  const start = performance.now()
  const render = (now: number) => {
    const rect = canvas.getBoundingClientRect()
    const ratio = Math.min(devicePixelRatio, 2)
    const width = Math.max(1, Math.round(rect.width * ratio))
    const height = Math.max(1, Math.round(rect.height * ratio))
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height }
    context.clearRect(0, 0, width, height)
    const t = reducedMotion ? 0 : (now - start) / 1000
    const scale = Math.min(rect.width, rect.height) * .36
    const cosZ = Math.cos(t * .08), sinZ = Math.sin(t * .08)
    const tiltY = Math.sin(t * .42) * .28
    const cosY = Math.cos(tiltY), sinY = Math.sin(tiltY)
    const centerX = rect.width / 2, centerY = rect.height / 2

    particles.forEach((particle, index) => {
      const jitter = reducedMotion ? 0 : Math.sin(t * 1.7 + particle.phase) * .006
      const baseX = particle.bx * cosZ - particle.by * sinZ
      const baseY = particle.bx * sinZ + particle.by * cosZ
      const rotatedX = baseX * cosY + particle.bz * sinY
      const rotatedZ = -baseX * sinY + particle.bz * cosY
      const targetX = rotatedX + Math.cos(particle.phase) * jitter
      const targetY = baseY + Math.sin(particle.phase * .7) * jitter
      const targetZ = rotatedZ
      const perspective = 1 / (1.25 - targetZ * .18)
      const screenX = centerX + (particle.x + (targetX - particle.bx)) * scale * perspective
      const screenY = centerY + (particle.y + (targetY - particle.by)) * scale * perspective

      if (pointer.active && !reducedMotion) {
        const dx = screenX - pointer.x, dy = screenY - pointer.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        if (distance < 118) {
          const force = (1 - distance / 118) * .018
          const safe = Math.max(distance, 5)
          particle.vx += dx / safe * force
          particle.vy += dy / safe * force
          particle.vz += (Math.random() - .5) * force * .6
        }
      }
      particle.vx += (particle.bx - particle.x) * .055
      particle.vy += (particle.by - particle.y) * .055
      particle.vz += (particle.bz - particle.z) * .045
      particle.vx *= .86; particle.vy *= .86; particle.vz *= .88
      particle.x += particle.vx; particle.y += particle.vy; particle.z += particle.vz

      const depthAlpha = .52 + (targetZ + 1) * .2
      const size = (index % 17 === 0 ? 2.2 : 1.15 + perspective * .35) * ratio
      context.globalAlpha = Math.min(1, depthAlpha)
      context.fillStyle = index % 11 === 0 ? "#c9fbff" : index % 5 === 0 ? "#8c9dff" : "#67e8ff"
      context.shadowBlur = (index % 11 === 0 ? 14 : 8) * ratio
      context.shadowColor = "#33ccff"
      context.beginPath()
      context.arc(screenX * ratio, screenY * ratio, size, 0, Math.PI * 2)
      context.fill()
    })
    context.globalAlpha = 1
    context.shadowBlur = 0
    requestAnimationFrame(render)
  }
  requestAnimationFrame(render)
}

type ManualNode = { slug:string; title:string; links:string[]; x:number; y:number; homeX:number; homeY:number; vx:number; vy:number; size:number; category:string }

const hashNumber = (value: string) => {
  let hash = 2166136261
  for (let i = 0; i < value.length; i += 1) hash = Math.imul(hash ^ value.charCodeAt(i), 16777619)
  return Math.abs(hash >>> 0)
}

const initKnowledgeMap = async () => {
  const wrapper = document.querySelector<HTMLElement>(".knowledge-map")
  const canvas = document.querySelector<HTMLCanvasElement>("#knowledge-canvas")
  const liquidBorderCanvas = document.querySelector<HTMLCanvasElement>("#liquid-border-canvas")
  const status = document.querySelector<HTMLElement>("#graph-status")
  const tooltip = document.querySelector<HTMLElement>(".graph-tooltip")
  const expandButton = wrapper?.querySelector<HTMLButtonElement>(".graph-expand")
  const modalScrim = document.querySelector<HTMLElement>(".graph-modal-scrim")
  if (!wrapper || !canvas || !liquidBorderCanvas || !status || !tooltip || !expandButton || !modalScrim) return
  const context = canvas.getContext("2d")
  const liquidBorderContext = liquidBorderCanvas.getContext("2d")
  if (!context || !liquidBorderContext) return

  let raw: Record<string, {slug?:string; title?:string; links?:string[]; tags?:string[]}> = {}
  try {
    const source = location.hostname === "localhost" || location.hostname === "127.0.0.1" ? "/manual-index" : wrapper.dataset.source!
    const response = await fetch(source, { cache: "no-store" })
    if (!response.ok) throw new Error(String(response.status))
    raw = await response.json()
  } catch {
    const fallback = ["001-scripting/bash","001-scripting/python","002-pentesting/active-directory","002-pentesting/web-pentesting","002-pentesting/linux-pentesting","002-pentesting/windows-pentesting","002-pentesting/protocols-and-services","002-pentesting/osint","003-setup","root"]
    raw = Object.fromEntries(fallback.map((slug, index) => [slug, { slug, title: slug.split("/").pop()!.replaceAll("-", " ").toUpperCase(), links: [fallback[(index + 1) % fallback.length]] }]))
    status.innerHTML = "<i></i> GRAPH PREVIEW"
  }

  const entries = Object.entries(raw).filter(([, value]) => {
    if (!value.slug || !value.title) return false
    if (value.slug === "index" || value.slug.endsWith("/index") || value.slug.startsWith("tags/")) return false
    return !(value.tags ?? []).includes("index_category")
  })
  const categories = [...new Set(entries.map(([, value]) => value.slug!.split("/")[0]))]
  const degree = new Map<string, number>()
  entries.forEach(([, value]) => (value.links ?? []).forEach((link) => degree.set(link, (degree.get(link) ?? 0) + 1)))
  const nodes: ManualNode[] = entries.map(([, value]) => {
    const slug = value.slug!
    const category = slug.split("/")[0]
    const categoryIndex = categories.indexOf(category)
    const clusterAngle = categoryIndex / Math.max(1, categories.length) * Math.PI * 2
    const seed = hashNumber(slug)
    const localAngle = (seed % 1000) / 1000 * Math.PI * 2
    const localRadius = .035 + ((seed >>> 8) % 1000) / 1000 * .17
    const clusterRadius = categories.length > 1 ? .24 : 0
    const x = .5 + Math.cos(clusterAngle) * clusterRadius + Math.cos(localAngle) * localRadius
    const y = .5 + Math.sin(clusterAngle) * clusterRadius * .72 + Math.sin(localAngle) * localRadius
    return {
      slug,
      title: value.title!,
      links: value.links ?? [],
      category,
      x,
      y,
      homeX: x,
      homeY: y,
      vx: 0,
      vy: 0,
      size: 1.2 + Math.min(7, (value.links?.length ?? 0) + (degree.get(slug) ?? 0)) * .28,
    }
  })
  const lookup = new Map(nodes.map((node) => [node.slug, node]))
  const links = nodes.flatMap((node) => node.links.map((target) => [node, lookup.get(target)] as const).filter((pair): pair is readonly [ManualNode, ManualNode] => Boolean(pair[1])))
  const springs = links.map(([from, to]) => ({ from, to, length: Math.max(.025, Math.hypot(to.x - from.x, to.y - from.y)) }))
  const adjacency = new Map(nodes.map((node) => [node, [] as ManualNode[]]))
  springs.forEach(({ from, to }) => {
    adjacency.get(from)?.push(to)
    adjacency.get(to)?.push(from)
  })
  if (entries.length > 10) status.innerHTML = `<i></i> ${nodes.length} NOTES`

  let pointer = { x: 0, y: 0, active: false, inside: false }
  let hovered: ManualNode | null = null
  let screenPositions = new Map<ManualNode, {x:number;y:number}>()
  const view = { x: 0, y: 0, zoom: 1 }
  const drag: {
    active:boolean; moved:boolean; mode:"pan"|"node"|null; node:ManualNode|null;
    x:number; y:number; viewX:number; viewY:number; lastX:number; lastY:number; lastTime:number;
  } = { active:false, moved:false, mode:null, node:null, x:0, y:0, viewX:0, viewY:0, lastX:0, lastY:0, lastTime:0 }
  let dragInfluence = new Map<ManualNode, number>()

  const buildDragInfluence = (origin: ManualNode) => {
    const hops = new Map<ManualNode, number>([[origin, 0]])
    const queue = [origin]
    for (let cursor = 0; cursor < queue.length; cursor += 1) {
      const node = queue[cursor]
      const nextHop = (hops.get(node) ?? 0) + 1
      adjacency.get(node)?.forEach((neighbor) => {
        if (hops.has(neighbor)) return
        hops.set(neighbor, nextHop)
        queue.push(neighbor)
      })
    }
    dragInfluence = new Map(nodes.map((node) => {
      const hop = hops.get(node)
      return [node, hop == null ? .045 : Math.max(.085, Math.exp(-hop * .34))]
    }))
  }

  const setExpanded = (expanded: boolean) => {
    wrapper.classList.toggle("is-expanded", expanded)
    modalScrim.classList.toggle("is-visible", expanded)
    document.body.classList.toggle("graph-expanded", expanded)
    expandButton.setAttribute("aria-expanded", String(expanded))
    expandButton.setAttribute("aria-label", expanded ? "Close expanded graph view" : "Open expanded graph view")
    if (expanded) {
      wrapper.setAttribute("role", "dialog")
      wrapper.setAttribute("aria-modal", "true")
      wrapper.setAttribute("aria-label", "Expanded Field Manual graph")
    } else {
      wrapper.removeAttribute("role")
      wrapper.removeAttribute("aria-modal")
      wrapper.removeAttribute("aria-label")
    }
  }
  expandButton.addEventListener("click", () => setExpanded(!wrapper.classList.contains("is-expanded")))
  modalScrim.addEventListener("click", () => setExpanded(false))
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && wrapper.classList.contains("is-expanded")) setExpanded(false)
  })

  const nodeAt = (x: number, y: number) => {
    let match: ManualNode | null = null
    let nearest = 18
    for (const [node, position] of screenPositions) {
      const distance = Math.hypot(position.x - x, position.y - y)
      if (distance < nearest) { nearest = distance; match = node }
    }
    return match
  }
  canvas.addEventListener("pointerenter", (event) => {
    const rect = canvas.getBoundingClientRect()
    pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top, active: true, inside: true }
    wrapper.classList.add("is-water-active")
  })
  canvas.addEventListener("pointermove", (event) => {
    const rect = canvas.getBoundingClientRect()
    pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top, active: true, inside: true }
    if (drag.active) {
      if (drag.mode === "node" && drag.node) {
        const nextX = .5 + (pointer.x - rect.width / 2 - view.x) / (rect.width * view.zoom)
        const nextY = .5 + (pointer.y - rect.height / 2 - view.y) / (rect.height * view.zoom)
        const elapsed = Math.max(8, event.timeStamp - drag.lastTime)
        const graphDeltaX = (event.clientX - drag.lastX) / Math.max(1, rect.width * view.zoom)
        const graphDeltaY = (event.clientY - drag.lastY) / Math.max(1, rect.height * view.zoom)
        nodes.forEach((node) => {
          if (node === drag.node) return
          const influence = dragInfluence.get(node) ?? .045
          node.vx += graphDeltaX * influence * .7
          node.vy += graphDeltaY * influence * .7
        })
        drag.node.vx = (nextX - drag.node.x) * Math.min(1, 18 / elapsed)
        drag.node.vy = (nextY - drag.node.y) * Math.min(1, 18 / elapsed)
        drag.node.x = nextX
        drag.node.y = nextY
      } else {
        view.x = drag.viewX + event.clientX - drag.x
        view.y = drag.viewY + event.clientY - drag.y
      }
      drag.moved ||= Math.hypot(event.clientX - drag.x, event.clientY - drag.y) > 4
      if (drag.moved) wrapper.classList.add("has-moved")
      drag.lastX = event.clientX
      drag.lastY = event.clientY
      drag.lastTime = event.timeStamp
    }
  }, { passive: true })
  canvas.addEventListener("pointerdown", (event) => {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const selectedNode = nodeAt(x, y)
    drag.active = true
    drag.moved = false
    drag.mode = selectedNode ? "node" : "pan"
    drag.node = selectedNode
    drag.x = event.clientX
    drag.y = event.clientY
    drag.lastX = event.clientX
    drag.lastY = event.clientY
    drag.lastTime = event.timeStamp
    drag.viewX = view.x
    drag.viewY = view.y
    if (selectedNode) {
      selectedNode.vx = 0
      selectedNode.vy = 0
      buildDragInfluence(selectedNode)
    }
    canvas.setPointerCapture(event.pointerId)
    canvas.style.cursor = "grabbing"
  })
  canvas.addEventListener("pointerup", (event) => {
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId)
    const clickedNode = drag.node
    const moved = drag.moved
    drag.active = false
    drag.mode = null
    drag.node = null
    dragInfluence.clear()
    canvas.style.cursor = hovered ? "pointer" : "grab"
    if (!moved && clickedNode) window.open(`https://docs.0xkholod.com/${clickedNode.slug}`, "_blank", "noopener")
  })
  canvas.addEventListener("pointercancel", () => { drag.active = false; drag.mode = null; drag.node = null; dragInfluence.clear(); canvas.style.cursor = "grab" })
  canvas.addEventListener("pointerleave", () => {
    if (!drag.active) {
      pointer = { ...pointer, active: false, inside: false }
      hovered = null
      tooltip.hidden = true
      wrapper.classList.remove("is-water-active")
    }
    canvas.style.cursor = drag.active ? "grabbing" : "grab"
  })
  canvas.addEventListener("wheel", (event) => {
    event.preventDefault()
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const nextZoom = Math.min(3.4, Math.max(.7, view.zoom * Math.exp(-event.deltaY * .0012)))
    const worldX = (x - rect.width / 2 - view.x) / view.zoom
    const worldY = (y - rect.height / 2 - view.y) / view.zoom
    view.x = x - rect.width / 2 - worldX * nextZoom
    view.y = y - rect.height / 2 - worldY * nextZoom
    view.zoom = nextZoom
    wrapper.classList.add("has-moved")
  }, { passive: false })

  const simulateGraph = () => {
    if (reducedMotion) return
    const draggingNode = drag.active && drag.mode === "node" && drag.node
    const springStrength = draggingNode ? .022 : .0048
    springs.forEach(({ from, to, length }) => {
      const dx = to.x - from.x
      const dy = to.y - from.y
      const distance = Math.max(.002, Math.hypot(dx, dy))
      const force = (distance - length) * springStrength
      const fx = dx / distance * force
      const fy = dy / distance * force
      if (drag.node !== from) { from.vx += fx; from.vy += fy }
      if (drag.node !== to) { to.vx -= fx; to.vy -= fy }
    })

    const centerX = nodes.reduce((sum, node) => sum + node.x, 0) / Math.max(1, nodes.length)
    const centerY = nodes.reduce((sum, node) => sum + node.y, 0) / Math.max(1, nodes.length)
    nodes.forEach((node) => {
      if (drag.node === node) return
      const centerForce = draggingNode ? .000002 : .000012
      const homeForce = draggingNode ? 0 : .000004
      node.vx += (.5 - centerX) * centerForce + (node.homeX - node.x) * homeForce
      node.vy += (.5 - centerY) * centerForce + (node.homeY - node.y) * homeForce
      node.vx *= draggingNode ? .885 : .94
      node.vy *= draggingNode ? .885 : .94
      const speed = Math.hypot(node.vx, node.vy)
      const maxSpeed = draggingNode ? .014 : .0045
      if (speed > maxSpeed) { node.vx = node.vx / speed * maxSpeed; node.vy = node.vy / speed * maxSpeed }
      node.x += node.vx
      node.y += node.vy
    })
  }

  const resizeSurface = (surface: HTMLCanvasElement, rect: DOMRect, ratio: number) => {
    const width = Math.max(1, Math.round(rect.width * ratio))
    const height = Math.max(1, Math.round(rect.height * ratio))
    if (surface.width !== width || surface.height !== height) { surface.width = width; surface.height = height }
    return { width, height }
  }

  const drawLiquidBorder = (now: number, rect: DOMRect, ratio: number) => {
    const { width, height } = resizeSurface(liquidBorderCanvas, rect, ratio)
    liquidBorderContext.clearRect(0, 0, width, height)
    if (!pointer.inside && !drag.active) return
    const margin = 3.5 * ratio
    const radius = 20 * ratio
    const phase = now / 620
    const wave = (position: number, axis: number) => (Math.sin(position / (72 * ratio) + phase + axis) * 1.55 + Math.sin(position / (31 * ratio) - phase * .63 + axis * 1.7) * .55) * ratio
    liquidBorderContext.beginPath()
    liquidBorderContext.moveTo(margin + radius, margin + wave(margin + radius, 0))
    for (let x = margin + radius; x <= width - margin - radius; x += 12 * ratio) liquidBorderContext.lineTo(x, margin + wave(x, 0))
    liquidBorderContext.quadraticCurveTo(width - margin, margin, width - margin + wave(radius, 1), margin + radius)
    for (let y = margin + radius; y <= height - margin - radius; y += 12 * ratio) liquidBorderContext.lineTo(width - margin + wave(y, 1), y)
    liquidBorderContext.quadraticCurveTo(width - margin, height - margin, width - margin - radius, height - margin + wave(width - radius, 2))
    for (let x = width - margin - radius; x >= margin + radius; x -= 12 * ratio) liquidBorderContext.lineTo(x, height - margin + wave(x, 2))
    liquidBorderContext.quadraticCurveTo(margin, height - margin, margin + wave(height - radius, 3), height - margin - radius)
    for (let y = height - margin - radius; y >= margin + radius; y -= 12 * ratio) liquidBorderContext.lineTo(margin + wave(y, 3), y)
    liquidBorderContext.quadraticCurveTo(margin, margin, margin + radius, margin + wave(margin + radius, 0))
    liquidBorderContext.closePath()
    liquidBorderContext.strokeStyle = "rgba(105,231,248,.78)"
    liquidBorderContext.lineWidth = 1.15 * ratio
    liquidBorderContext.lineJoin = "round"
    liquidBorderContext.shadowBlur = 7 * ratio
    liquidBorderContext.shadowColor = "rgba(76,208,237,.46)"
    liquidBorderContext.stroke()
    liquidBorderContext.shadowBlur = 0
  }

  let lastFrame = 0
  let focusProgress = 0
  const render = (now: number) => {
    if (now - lastFrame < 30) { requestAnimationFrame(render); return }
    lastFrame = now
    const rect = canvas.getBoundingClientRect()
    const ratio = Math.min(devicePixelRatio, 2)
    const width = Math.max(1, Math.round(rect.width * ratio)), height = Math.max(1, Math.round(rect.height * ratio))
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height }
    context.clearRect(0, 0, width, height)
    drawLiquidBorder(now, rect, ratio)
    simulateGraph()
    const wobble = reducedMotion ? 0 : Math.sin(now / 5000) * .0012
    const visualScale = Math.min(2.55, Math.max(.78, Math.pow(view.zoom, .72)))
    const point = (node: ManualNode) => ({
      x: width / 2 + (node.x - .5 + Math.sin(hashNumber(node.slug) + now / 5000) * wobble) * width * view.zoom + view.x * ratio,
      y: height / 2 + (node.y - .5) * height * view.zoom + view.y * ratio,
    })

    const positions = nodes.map((node) => ({ node, point: point(node) }))
    const positionLookup = new Map(positions.map(({ node, point: p }) => [node, p]))
    screenPositions = new Map(positions.map(({ node, point: p }) => [node, { x: p.x / ratio, y: p.y / ratio }]))
    hovered = null
    let hoverDistance = 17
    positions.forEach(({ node, point: p }) => {
      if (pointer.active) {
        const distance = Math.hypot(p.x / ratio - pointer.x, p.y / ratio - pointer.y)
        if (distance < hoverDistance) { hoverDistance = distance; hovered = node }
      }
    })
    const hoveredNode = !drag.active ? hovered as ManualNode | null : null
    focusProgress += ((hoveredNode ? 1 : 0) - focusProgress) * .18
    const relatedNodes = hoveredNode
      ? new Set<ManualNode>([hoveredNode, ...new Set(adjacency.get(hoveredNode) ?? [])])
      : new Set<ManualNode>()

    context.lineCap = "round"
    links.forEach(([from, to]) => {
      const a = positionLookup.get(from)!, b = positionLookup.get(to)!
      const isRelated = Boolean(hoveredNode && (from === hoveredNode || to === hoveredNode))
      context.globalAlpha = hoveredNode && !isRelated ? 1 - focusProgress * .94 : 1
      context.strokeStyle = isRelated ? "rgba(121,239,242,.94)" : "rgba(186,157,255,.34)"
      context.lineWidth = (isRelated ? 1.28 : .72) * ratio * visualScale
      context.shadowBlur = isRelated ? 5 * ratio : 0
      context.shadowColor = "rgba(121,239,242,.7)"
      context.beginPath(); context.moveTo(a.x, a.y); context.lineTo(b.x, b.y); context.stroke()
    })
    context.globalAlpha = 1
    context.shadowBlur = 0

    positions.forEach(({ node, point: p }, index) => {
      const selected = hoveredNode === node
      const related = relatedNodes.has(node)
      const normalAlpha = .72 + Math.min(node.size, 3) * .07
      const focusedAlpha = selected ? 1 : related ? .98 : .1
      context.globalAlpha = normalAlpha + (focusedAlpha - normalAlpha) * focusProgress
      context.fillStyle = selected ? "#ffffff" : related ? "#c7fbff" : index % 13 === 0 ? "#ff7bd0" : "#b4f5fb"
      const shadow = selected ? 12 : related ? 7 : node.size > 2.5 ? 3.8 : 1.4
      context.shadowBlur = shadow * ratio * Math.min(1.45, visualScale)
      context.shadowColor = selected ? "#ff4fc1" : "#67e8ff"
      const focusScale = selected ? 1.55 : related ? 1.3 : hoveredNode ? .88 : 1
      context.beginPath(); context.arc(p.x, p.y, node.size * ratio * visualScale * focusScale, 0, Math.PI * 2); context.fill()
    })
    context.globalAlpha = 1; context.shadowBlur = 0

    if (hoveredNode && focusProgress > .2) {
      const occupied: Array<{left:number;top:number;right:number;bottom:number}> = []
      const labelNodes = [...new Set(adjacency.get(hoveredNode) ?? [])]
        .sort((a, b) => (b.links.length + (adjacency.get(b)?.length ?? 0)) - (a.links.length + (adjacency.get(a)?.length ?? 0)))
      const fontSize = Math.min(12.5, 10.5 + Math.max(0, visualScale - 1) * 1.4) * ratio
      context.font = `650 ${fontSize}px "JetBrains Mono Variable", monospace`
      context.textBaseline = "middle"
      context.globalAlpha = Math.min(1, Math.max(0, (focusProgress - .2) / .65))
      labelNodes.forEach((node) => {
        const p = positionLookup.get(node)
        if (!p || p.x < 0 || p.x > width || p.y < 0 || p.y > height) return
        const label = node.title
        const labelWidth = context.measureText(label).width
        const paddingX = 6 * ratio
        const labelHeight = 21 * ratio
        const boxWidth = labelWidth + paddingX * 2
        const seedAngle = (hashNumber(node.slug) % 360) / 180 * Math.PI
        let box = { left: p.x + 14 * ratio, top: p.y - labelHeight - 8 * ratio, right: 0, bottom: 0 }
        for (let attempt = 0; attempt < 24; attempt += 1) {
          const angle = seedAngle + attempt * Math.PI / 4
          const distance = (15 + Math.floor(attempt / 8) * 18) * ratio
          const anchorX = p.x + Math.cos(angle) * distance
          const anchorY = p.y + Math.sin(angle) * distance
          const left = Math.max(7 * ratio, Math.min(width - boxWidth - 7 * ratio, anchorX + (Math.cos(angle) < 0 ? -boxWidth : 0)))
          const top = Math.max(7 * ratio, Math.min(height - labelHeight - 7 * ratio, anchorY + (Math.sin(angle) < 0 ? -labelHeight : 0)))
          const candidate = { left, top, right: left + boxWidth, bottom: top + labelHeight }
          const overlaps = occupied.some((item) => !(candidate.right + 4 * ratio < item.left || candidate.left > item.right + 4 * ratio || candidate.bottom + 3 * ratio < item.top || candidate.top > item.bottom + 3 * ratio))
          box = candidate
          if (!overlaps) break
        }
        occupied.push(box)
        const boxCenterX = box.left + boxWidth / 2
        const boxCenterY = box.top + labelHeight / 2
        context.strokeStyle = "rgba(121,239,242,.3)"
        context.lineWidth = .65 * ratio
        context.beginPath(); context.moveTo(p.x, p.y); context.lineTo(boxCenterX, boxCenterY); context.stroke()
        context.fillStyle = "rgba(10,17,29,.92)"
        context.strokeStyle = "rgba(121,239,242,.4)"
        context.lineWidth = .75 * ratio
        context.beginPath(); context.roundRect(box.left, box.top, boxWidth, labelHeight, 6 * ratio); context.fill(); context.stroke()
        context.fillStyle = "#e5fcff"
        context.fillText(label, box.left + paddingX, boxCenterY)
      })
      context.globalAlpha = 1
    }

    if (hoveredNode) {
      if (!drag.active) canvas.style.cursor = "pointer"
      tooltip.hidden = false
      tooltip.textContent = hoveredNode.title
      tooltip.style.left = `${Math.min(rect.width - 180, pointer.x + 14)}px`
      tooltip.style.top = `${Math.max(12, pointer.y - 38)}px`
    } else {
      if (!drag.active) canvas.style.cursor = "grab"
      tooltip.hidden = true
    }
    requestAnimationFrame(render)
  }
  requestAnimationFrame(render)
}

const initTimelineMotion = () => {
  const timeline = document.querySelector<HTMLElement>(".timeline")
  if (!timeline || reducedMotion) return

  timeline.querySelectorAll<HTMLElement>(".timeline-entry").forEach((entry) => {
    const card = entry.querySelector<HTMLElement>(".timeline-card")
    const canvas = entry.querySelector<HTMLCanvasElement>(".timeline-liquid-border")
    const context = canvas?.getContext("2d")
    if (!card || !canvas || !context) return

    const tone = entry.dataset.tone === "cyan"
      ? { stroke: "rgba(105,231,248,.82)", glow: "rgba(76,208,237,.5)" }
      : { stroke: "rgba(255,112,207,.82)", glow: "rgba(255,79,193,.48)" }
    let active = false
    let frame = 0

    const draw = (now: number) => {
      const rect = card.getBoundingClientRect()
      const ratio = Math.min(devicePixelRatio, 2)
      const width = Math.max(1, Math.round(rect.width * ratio))
      const height = Math.max(1, Math.round(rect.height * ratio))
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }
      context.clearRect(0, 0, width, height)
      if (!active) return

      const margin = 3.5 * ratio
      const radius = 16 * ratio
      const phase = now / 620
      const wave = (position: number, axis: number) => (
        Math.sin(position / (72 * ratio) + phase + axis) * 1.55
        + Math.sin(position / (31 * ratio) - phase * .63 + axis * 1.7) * .55
      ) * ratio

      context.beginPath()
      context.moveTo(margin + radius, margin + wave(margin + radius, 0))
      for (let x = margin + radius; x <= width - margin - radius; x += 12 * ratio) context.lineTo(x, margin + wave(x, 0))
      context.quadraticCurveTo(width - margin, margin, width - margin + wave(radius, 1), margin + radius)
      for (let y = margin + radius; y <= height - margin - radius; y += 12 * ratio) context.lineTo(width - margin + wave(y, 1), y)
      context.quadraticCurveTo(width - margin, height - margin, width - margin - radius, height - margin + wave(width - radius, 2))
      for (let x = width - margin - radius; x >= margin + radius; x -= 12 * ratio) context.lineTo(x, height - margin + wave(x, 2))
      context.quadraticCurveTo(margin, height - margin, margin + wave(height - radius, 3), height - margin - radius)
      for (let y = height - margin - radius; y >= margin + radius; y -= 12 * ratio) context.lineTo(margin + wave(y, 3), y)
      context.quadraticCurveTo(margin, margin, margin + radius, margin + wave(margin + radius, 0))
      context.closePath()
      context.strokeStyle = tone.stroke
      context.lineWidth = 1.15 * ratio
      context.lineJoin = "round"
      context.shadowBlur = 7 * ratio
      context.shadowColor = tone.glow
      context.stroke()
      context.shadowBlur = 0
      frame = requestAnimationFrame(draw)
    }

    card.addEventListener("pointerenter", () => {
      active = true
      entry.classList.add("is-active")
      timeline.classList.add("has-active")
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(draw)
    })
    card.addEventListener("pointerleave", () => {
      active = false
      entry.classList.remove("is-active")
      if (!timeline.querySelector(".timeline-entry.is-active")) timeline.classList.remove("has-active")
      window.setTimeout(() => {
        if (!active) context.clearRect(0, 0, canvas.width, canvas.height)
      }, 300)
    })
  })
}

const initCertificateMotion = () => {
  const art = document.querySelector<HTMLElement>(".certificate-art")
  if (!art || reducedMotion) return
  const glare = art.querySelector<HTMLElement>(".certificate-glare")
  art.addEventListener("pointermove", (event) => {
    const rect = art.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width
    const y = (event.clientY - rect.top) / rect.height
    art.style.transform = `perspective(1100px) rotateX(${(y - .5) * -12}deg) rotateY(${(x - .5) * 15}deg) scale(1.025)`
    if (glare) glare.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,.5), rgba(121,239,242,.16) 18%, transparent 45%)`
  })
  art.addEventListener("pointerleave", () => { art.style.transform = ""; if (glare) glare.style.background = "" })
}

const mobileNavigation = document.querySelector<HTMLDetailsElement>(".mobile-nav")
mobileNavigation?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => mobileNavigation.removeAttribute("open")))

const initDialogs = () => {
  document.querySelectorAll<HTMLElement>("[data-dialog]").forEach((trigger) => {
    trigger.addEventListener("click", () => document.querySelector<HTMLDialogElement>(`#${trigger.dataset.dialog}`)?.showModal())
  })
  document.querySelectorAll<HTMLDialogElement>("dialog").forEach((dialog) => {
    dialog.querySelectorAll<HTMLElement>("[data-close-dialog]").forEach((button) => button.addEventListener("click", () => dialog.close()))
    dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close() })
  })
}

initCursorTrail()
initBrandLiquidBorder()
initPortraitLiquidBorder()
initAliasReconstruction()
initSnowflake()
initKnowledgeMap()
initTimelineMotion()
initCertificateMotion()
initDialogs()
