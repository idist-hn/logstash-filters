<template>
  <div class="login-background">
    <!-- Animated gradient background -->
    <div class="gradient-bg">
      <div class="gradient-layer gradient-layer-1"></div>
      <div class="gradient-layer gradient-layer-2"></div>
      <div class="gradient-layer gradient-layer-3"></div>
    </div>

    <!-- Geometric patterns -->
    <div class="geometric-patterns">
      <div class="pattern pattern-grid"></div>
      <div class="pattern pattern-dots"></div>
      <div class="pattern pattern-lines"></div>
    </div>

    <!-- Floating particles -->
    <div class="particles-container">
      <div 
        v-for="i in 20" 
        :key="i" 
        class="particle"
        :style="getParticleStyle(i)"
      ></div>
    </div>

    <!-- Glowing orbs -->
    <div class="orbs-container">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
      <div class="orb orb-4"></div>
    </div>

    <!-- Content overlay -->
    <div class="content-overlay">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const getParticleStyle = (index: number) => {
  const size = Math.random() * 4 + 2
  const left = Math.random() * 100
  const top = Math.random() * 100
  const duration = Math.random() * 20 + 10
  const delay = Math.random() * 5

  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    top: `${top}%`,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`,
  }
}
</script>

<style scoped>
.login-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  background: #0a0e1a;
}

/* Animated gradient background */
.gradient-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.gradient-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.8;
  mix-blend-mode: screen;
}

.gradient-layer-1 {
  background: radial-gradient(circle at 20% 80%, #1e3a8a 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, #7c3aed 0%, transparent 50%);
  animation: gradient-shift-1 15s ease-in-out infinite;
}

.gradient-layer-2 {
  background: radial-gradient(circle at 40% 40%, #059669 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, #dc2626 0%, transparent 50%);
  animation: gradient-shift-2 20s ease-in-out infinite reverse;
}

.gradient-layer-3 {
  background: radial-gradient(circle at 60% 20%, #ea580c 0%, transparent 50%),
              radial-gradient(circle at 20% 60%, #0891b2 0%, transparent 50%);
  animation: gradient-shift-3 25s ease-in-out infinite;
}

@keyframes gradient-shift-1 {
  0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
  33% { transform: translate(-20px, -20px) rotate(120deg) scale(1.1); }
  66% { transform: translate(20px, -10px) rotate(240deg) scale(0.9); }
}

@keyframes gradient-shift-2 {
  0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
  50% { transform: translate(30px, 20px) rotate(180deg) scale(1.2); }
}

@keyframes gradient-shift-3 {
  0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
  25% { transform: translate(-15px, 25px) rotate(90deg) scale(1.1); }
  75% { transform: translate(25px, -15px) rotate(270deg) scale(0.95); }
}

/* Geometric patterns */
.geometric-patterns {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.1;
}

.pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.pattern-grid {
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 60px 60px;
  animation: pattern-move 30s linear infinite;
}

.pattern-dots {
  background-image: radial-gradient(circle, rgba(255, 255, 255, 0.2) 1px, transparent 1px);
  background-size: 40px 40px;
  animation: pattern-move 40s linear infinite reverse;
}

.pattern-lines {
  background-image: 
    linear-gradient(45deg, transparent 40%, rgba(255, 255, 255, 0.05) 50%, transparent 60%);
  background-size: 80px 80px;
  animation: pattern-move 50s linear infinite;
}

@keyframes pattern-move {
  0% { transform: translate(0, 0); }
  100% { transform: translate(60px, 60px); }
}

/* Floating particles */
.particles-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: particle-float 10s ease-in-out infinite;
}

@keyframes particle-float {
  0%, 100% { 
    transform: translateY(0px) translateX(0px) scale(1);
    opacity: 0.6;
  }
  25% { 
    transform: translateY(-20px) translateX(10px) scale(1.2);
    opacity: 1;
  }
  50% { 
    transform: translateY(-10px) translateX(-15px) scale(0.8);
    opacity: 0.4;
  }
  75% { 
    transform: translateY(-30px) translateX(5px) scale(1.1);
    opacity: 0.8;
  }
}

/* Glowing orbs */
.orbs-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.3;
}

.orb-1 {
  width: 200px;
  height: 200px;
  background: #3b82f6;
  top: 10%;
  left: 10%;
  animation: orb-float-1 20s ease-in-out infinite;
}

.orb-2 {
  width: 150px;
  height: 150px;
  background: #8b5cf6;
  top: 60%;
  right: 15%;
  animation: orb-float-2 25s ease-in-out infinite;
}

.orb-3 {
  width: 180px;
  height: 180px;
  background: #10b981;
  bottom: 20%;
  left: 20%;
  animation: orb-float-3 30s ease-in-out infinite;
}

.orb-4 {
  width: 120px;
  height: 120px;
  background: #f59e0b;
  top: 30%;
  right: 40%;
  animation: orb-float-4 18s ease-in-out infinite;
}

@keyframes orb-float-1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -20px) scale(1.1); }
  66% { transform: translate(-20px, 30px) scale(0.9); }
}

@keyframes orb-float-2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-40px, -30px) scale(1.2); }
}

@keyframes orb-float-3 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(20px, -40px) scale(0.8); }
  75% { transform: translate(-30px, 20px) scale(1.1); }
}

@keyframes orb-float-4 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  40% { transform: translate(25px, 35px) scale(1.3); }
  80% { transform: translate(-35px, -25px) scale(0.7); }
}

/* Content overlay */
.content-overlay {
  position: relative;
  z-index: 10;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(1px);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .orb {
    filter: blur(20px);
  }

  .orb-1, .orb-2, .orb-3, .orb-4 {
    width: 100px;
    height: 100px;
  }

  .pattern-grid {
    background-size: 40px 40px;
  }

  .pattern-dots {
    background-size: 30px 30px;
  }

  .pattern-lines {
    background-size: 60px 60px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .gradient-layer,
  .pattern,
  .particle,
  .orb {
    animation: none;
  }
}
</style>
