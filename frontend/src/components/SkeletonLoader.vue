<template>
  <div class="skeleton-loader">
    <!-- Card Skeleton -->
    <div v-if="type === 'card'" class="skeleton-card">
      <div class="skeleton-header">
        <div class="skeleton-icon"></div>
        <div class="skeleton-text-group">
          <div class="skeleton-title"></div>
          <div class="skeleton-subtitle"></div>
        </div>
      </div>
      <div class="skeleton-content">
        <div class="skeleton-metric"></div>
        <div class="skeleton-progress"></div>
      </div>
    </div>

    <!-- List Skeleton -->
    <div v-else-if="type === 'list'" class="skeleton-list">
      <div v-for="i in count" :key="i" class="skeleton-list-item">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-text-group">
          <div class="skeleton-title"></div>
          <div class="skeleton-subtitle"></div>
        </div>
        <div class="skeleton-action"></div>
      </div>
    </div>

    <!-- Grid Skeleton -->
    <div v-else-if="type === 'grid'" class="skeleton-grid">
      <div v-for="i in count" :key="i" class="skeleton-grid-item">
        <div class="skeleton-icon"></div>
        <div class="skeleton-title"></div>
        <div class="skeleton-subtitle"></div>
        <div class="skeleton-badge"></div>
      </div>
    </div>

    <!-- Table Skeleton -->
    <div v-else-if="type === 'table'" class="skeleton-table">
      <div class="skeleton-table-header">
        <div v-for="i in 4" :key="i" class="skeleton-table-cell"></div>
      </div>
      <div v-for="i in count" :key="i" class="skeleton-table-row">
        <div v-for="j in 4" :key="j" class="skeleton-table-cell"></div>
      </div>
    </div>

    <!-- Chart Skeleton -->
    <div v-else-if="type === 'chart'" class="skeleton-chart">
      <div class="skeleton-chart-header">
        <div class="skeleton-title"></div>
        <div class="skeleton-subtitle"></div>
      </div>
      <div class="skeleton-chart-content">
        <div class="skeleton-chart-bars">
          <div v-for="i in 6" :key="i" class="skeleton-bar" :style="{ height: Math.random() * 80 + 20 + '%' }"></div>
        </div>
      </div>
    </div>

    <!-- Default Text Skeleton -->
    <div v-else class="skeleton-text">
      <div v-for="i in count" :key="i" class="skeleton-line" :style="{ width: Math.random() * 40 + 60 + '%' }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  type?: 'card' | 'list' | 'grid' | 'table' | 'chart' | 'text'
  count?: number
  animated?: boolean
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  count: 3,
  animated: true
})
</script>

<style lang="scss" scoped>
.skeleton-loader {
  width: 100%;
}

/* Base skeleton styles */
@keyframes skeleton-loading {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.skeleton-base {
  background: linear-gradient(90deg, var(--bg-tertiary) 25%, var(--bg-secondary) 50%, var(--bg-tertiary) 75%);
  background-size: 200px 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
}

/* Card Skeleton */
.skeleton-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px var(--shadow-light);
}

.skeleton-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.skeleton-icon {
  @extend .skeleton-base;
  width: 48px;
  height: 48px;
  border-radius: 12px;
}

.skeleton-text-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-title {
  @extend .skeleton-base;
  height: 20px;
  width: 60%;
}

.skeleton-subtitle {
  @extend .skeleton-base;
  height: 14px;
  width: 40%;
}

.skeleton-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skeleton-metric {
  @extend .skeleton-base;
  height: 32px;
  width: 80%;
}

.skeleton-progress {
  @extend .skeleton-base;
  height: 8px;
  width: 100%;
  border-radius: 4px;
}

/* List Skeleton */
.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skeleton-list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.skeleton-avatar {
  @extend .skeleton-base;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
}

.skeleton-action {
  @extend .skeleton-base;
  width: 60px;
  height: 32px;
  border-radius: 6px;
}

/* Grid Skeleton */
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.skeleton-grid-item {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.skeleton-badge {
  @extend .skeleton-base;
  width: 60px;
  height: 20px;
  border-radius: 10px;
}

/* Table Skeleton */
.skeleton-table {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.skeleton-table-header {
  display: flex;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.skeleton-table-row {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  
  &:last-child {
    border-bottom: none;
  }
}

.skeleton-table-cell {
  @extend .skeleton-base;
  flex: 1;
  height: 20px;
  margin: 12px;
}

/* Chart Skeleton */
.skeleton-chart {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
}

.skeleton-chart-header {
  margin-bottom: 24px;
}

.skeleton-chart-content {
  height: 200px;
  display: flex;
  align-items: flex-end;
}

.skeleton-chart-bars {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  width: 100%;
  height: 100%;
}

.skeleton-bar {
  @extend .skeleton-base;
  flex: 1;
  min-height: 20px;
  border-radius: 4px 4px 0 0;
}

/* Text Skeleton */
.skeleton-text {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-line {
  @extend .skeleton-base;
  height: 16px;
}

/* Responsive */
@media (max-width: 768px) {
  .skeleton-grid {
    grid-template-columns: 1fr;
  }
  
  .skeleton-card {
    padding: 16px;
  }
  
  .skeleton-list-item {
    padding: 12px;
  }
}
</style>
