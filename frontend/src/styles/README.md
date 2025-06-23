# Theme System Documentation

## Overview

This project uses a modern CSS custom properties (CSS variables) based theme system that supports light and dark modes with smooth transitions.

## Architecture

### 1. File Structure

```
src/styles/
├── index.scss          # Main entry point
├── variables.scss      # CSS custom properties & SCSS variables
├── mixins.scss         # Reusable SCSS mixins
├── base.scss          # Global styles & utility classes
├── main.scss          # Legacy entry point (imports index.scss)
├── components/        # Component-specific styles
│   ├── app-layout.scss
│   └── dashboard.scss
├── examples/          # Usage examples
│   └── mixins-demo.scss
├── README.md          # This file
└── MIXINS.md         # Detailed mixins documentation
```

### 2. CSS Variables (`variables.scss`)

All theme-related colors and values are defined as CSS custom properties in `:root` and `.dark` selectors:

```scss
:root {
  // Light theme colors
  --bg-primary: #ffffff;
  --text-primary: #262626;
  // ... other variables
}

.dark {
  // Dark theme colors
  --bg-primary: #141414;
  --text-primary: #ffffff;
  // ... other variables
}
```

### 2. Theme Composable (`useTheme.ts`)

The `useTheme` composable provides reactive theme management:

```typescript
import { useTheme } from '@/composables/useTheme'

const { isDarkMode, toggleTheme, setTheme } = useTheme()
```

### 3. SCSS Mixins (`mixins.scss`)

Reusable SCSS mixins for consistent styling patterns:

```scss
// Import mixins in your SCSS files
@import '@/styles/mixins.scss';

// Use mixins in your components
.my-component {
  @include flex-center;
  @include card-shadow;
  @include theme-transition;
}
```

**Available Mixin Categories:**
- **Layout**: `flex-center`, `flex-between`, `grid-responsive`
- **Responsive**: `mobile`, `tablet`, `desktop`, `large-desktop`
- **Typography**: `text-ellipsis`, `text-clamp`, `font-smoothing`
- **Visual Effects**: `card-shadow`, `elevated-shadow`, `border-radius`
- **Transitions**: `smooth-transition`, `theme-transition`, `hover-lift`
- **Components**: `button-base`, `card-base`, `input-base`
- **Utilities**: `visually-hidden`, `reset-list`, `custom-scrollbar`

See [MIXINS.md](./MIXINS.md) for complete documentation.

### 4. Auto-initialization

The theme system automatically:
- Detects user's system preference
- Loads saved preference from localStorage
- Applies smooth transitions
- Watches for system theme changes

## Usage

### Importing Styles

#### Option 1: Import Everything (Recommended for main.scss)
```scss
// In main.scss
@import '@/styles/index.scss';
```

#### Option 2: Import Specific Parts (For component files)
```scss
// Import only what you need
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';
```

#### Option 3: Import in Vue Components
```vue
<style lang="scss" scoped>
@import '@/styles/mixins.scss';

.my-component {
  @include flex-center;
  @include card-shadow;
}
</style>
```

### In Vue Components

```vue
<script setup>
import { useTheme } from '@/composables/useTheme'

const { isDarkMode, toggleTheme } = useTheme()
</script>

<template>
  <button @click="toggleTheme">
    {{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}
  </button>
</template>
```

### In SCSS Files

Always use CSS variables instead of hardcoded colors:

```scss
// ✅ Good
.my-component {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

// ❌ Bad
.my-component {
  background: #ffffff;
  color: #000000;
  border: 1px solid #e8e8e8;
}
```

### Using Mixins

Use provided mixins for common patterns:

```scss
// Import mixins first
@import '@/styles/mixins.scss';

.my-component {
  @include flex-center;
  @include card-shadow;
  @include smooth-transition;
  @include theme-transition; // For theme-aware transitions
}
```

## Available CSS Variables

### Colors

#### Background Colors
- `--bg-primary`: Main background color
- `--bg-secondary`: Secondary background (slightly darker/lighter)
- `--bg-tertiary`: Tertiary background (cards, panels)
- `--bg-quaternary`: Quaternary background (hover states)

#### Text Colors
- `--text-primary`: Primary text color
- `--text-secondary`: Secondary text color
- `--text-tertiary`: Tertiary text color (muted)
- `--text-disabled`: Disabled text color
- `--text-inverse`: Inverse text color (for dark backgrounds)

#### Border Colors
- `--border-color`: Primary border color
- `--border-light`: Light border color
- `--border-secondary`: Secondary border color

#### Brand Colors (theme-independent)
- `--primary-color`: Primary brand color (#1890ff)
- `--success-color`: Success color (#52c41a)
- `--warning-color`: Warning color (#faad14)
- `--error-color`: Error color (#ff4d4f)
- `--info-color`: Info color (#1890ff)

### Shadows
- `--shadow-light`: Light shadow
- `--shadow-medium`: Medium shadow
- `--shadow-heavy`: Heavy shadow
- `--shadow-card`: Card shadow
- `--shadow-elevated`: Elevated element shadow

### Component-specific
- `--header-bg`: Header background
- `--header-border`: Header border
- `--sidebar-bg`: Sidebar background
- `--sidebar-border`: Sidebar border
- `--sidebar-item-hover`: Sidebar item hover state
- `--sidebar-item-active`: Sidebar item active state

### Interactive States
- `--hover-bg`: Hover background color
- `--active-bg`: Active background color
- `--focus-outline`: Focus outline color

### Spacing & Layout
- `--spacing-xs`: 4px
- `--spacing-sm`: 8px
- `--spacing-md`: 16px
- `--spacing-lg`: 24px
- `--spacing-xl`: 32px
- `--spacing-xxl`: 48px

### Border Radius
- `--radius-sm`: 4px
- `--radius-md`: 8px
- `--radius-lg`: 12px
- `--radius-xl`: 16px

### Transitions
- `--transition-fast`: 0.15s ease
- `--transition-normal`: 0.3s ease
- `--transition-slow`: 0.5s ease

## SCSS Variables (Static Values)

For values that don't change with theme:

```scss
$header-height: 64px;
$sidebar-width: 256px;
$sidebar-collapsed-width: 80px;

// Z-index scale
$z-dropdown: 1000;
$z-modal: 1050;
$z-toast: 9999;

// Breakpoints
$breakpoint-sm: 768px;
$breakpoint-md: 992px;
$breakpoint-lg: 1200px;
```

## Best Practices

### 1. Always Use CSS Variables for Colors
```scss
// ✅ Good
.component {
  background: var(--bg-primary);
  color: var(--text-primary);
}

// ❌ Bad
.component {
  background: #ffffff;
  color: #000000;
}
```

### 2. Use Semantic Variable Names
```scss
// ✅ Good
.error-message {
  color: var(--error-color);
}

// ❌ Bad
.error-message {
  color: var(--red-500);
}
```

### 3. Apply Theme Transitions
```scss
.component {
  @include theme-transition;
  // or
  transition: background-color var(--transition-normal),
              color var(--transition-normal);
}
```

### 4. Use Mixins for Common Patterns
```scss
.card {
  @include card-shadow;
  @include smooth-transition;
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
}
```

### 5. Responsive Design
```scss
.component {
  @include mobile {
    padding: var(--spacing-sm);
  }
  
  @include desktop {
    padding: var(--spacing-lg);
  }
}
```

## Theme Utilities

### JavaScript Utilities

```typescript
import { themeUtils } from '@/composables/useTheme'

// Get CSS variable value
const primaryColor = themeUtils.getCSSVariable('--primary-color')

// Set CSS variable value
themeUtils.setCSSVariable('--custom-color', '#ff0000')

// Check current theme
const isDark = themeUtils.isDarkMode()
const currentTheme = themeUtils.getCurrentTheme() // 'light' | 'dark'

// Control transitions
themeUtils.enableTransitions()
themeUtils.disableTransitions()
```

## Migration Guide

### From Old System

If migrating from hardcoded colors or SCSS variables:

1. Replace hardcoded colors with CSS variables
2. Use the `useTheme` composable instead of manual theme management
3. Apply theme transitions to components
4. Test both light and dark modes

### Example Migration

```scss
// Before
.component {
  background: #ffffff;
  color: #000000;
  border: 1px solid #e8e8e8;
  transition: all 0.3s ease;
}

.dark .component {
  background: #1f1f1f;
  color: #ffffff;
  border: 1px solid #434343;
}

// After
.component {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  @include theme-transition;
}
```

## Troubleshooting

### Common Issues

1. **Colors not changing in dark mode**
   - Ensure you're using CSS variables, not hardcoded colors
   - Check that the variable is defined in both `:root` and `.dark` selectors

2. **Transitions not smooth**
   - Apply `@include theme-transition` to components
   - Ensure transitions are enabled with `themeUtils.enableTransitions()`

3. **Theme not persisting**
   - The theme is automatically saved to localStorage
   - Check browser console for any errors in the theme composable

4. **System preference not detected**
   - Ensure the browser supports `prefers-color-scheme`
   - Check that the theme composable is properly initialized
