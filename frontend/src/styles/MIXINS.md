# SCSS Mixins Documentation

## Overview

This document provides comprehensive documentation for all SCSS mixins available in the project. Mixins are reusable pieces of code that help maintain consistency and reduce repetition across stylesheets.

## How to Use Mixins

### Import in SCSS Files

```scss
// Import mixins at the top of your SCSS file
@import '@/styles/mixins.scss';

// Or if you're in a component file
@import '../mixins.scss';
```

### Using Mixins

```scss
.my-component {
  @include flex-center;
  @include card-shadow;
  @include theme-transition;
}
```

## Available Mixins

### Layout Mixins

#### Flexbox Utilities

```scss
// Center content both horizontally and vertically
@include flex-center;

// Space between items with center alignment
@include flex-between;

// Align items to start
@include flex-start;

// Align items to end
@include flex-end;

// Flex column layout
@include flex-column;

// Flex column with center alignment
@include flex-column-center;
```

**Example:**
```scss
.header {
  @include flex-between;
  padding: var(--spacing-md);
}

.modal {
  @include flex-center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
```

#### Grid Utilities

```scss
// Center content in grid
@include grid-center;

// Responsive grid with auto-fit columns
@include grid-responsive($min-width: 250px, $gap: var(--spacing-md));
```

**Example:**
```scss
.card-grid {
  @include grid-responsive(300px, var(--spacing-lg));
}

.loading-spinner {
  @include grid-center;
  height: 200px;
}
```

### Responsive Design Mixins

```scss
// Mobile devices (< 768px)
@include mobile {
  // Mobile styles
}

// Tablet devices (768px - 991px)
@include tablet {
  // Tablet styles
}

// Desktop devices (≥ 992px)
@include desktop {
  // Desktop styles
}

// Large desktop (≥ 1200px)
@include large-desktop {
  // Large desktop styles
}

// Extra large desktop (≥ 1600px)
@include xl-desktop {
  // XL desktop styles
}

// Custom breakpoint
@include breakpoint(1024px) {
  // Custom breakpoint styles
}

// Max width breakpoint
@include max-breakpoint(768px) {
  // Styles for screens smaller than 768px
}
```

**Example:**
```scss
.sidebar {
  width: 256px;
  
  @include mobile {
    width: 100%;
    position: fixed;
    transform: translateX(-100%);
  }
  
  @include tablet {
    width: 200px;
  }
}
```

### Text & Typography Mixins

```scss
// Truncate text with ellipsis
@include text-ellipsis;

// Clamp text to specific number of lines
@include text-clamp(3);

// Apply gradient to text
@include text-gradient(linear-gradient(45deg, #ff6b6b, #4ecdc4));

// Font smoothing
@include font-smoothing;
```

**Example:**
```scss
.card-title {
  @include text-ellipsis;
  font-size: 18px;
  font-weight: 600;
}

.description {
  @include text-clamp(2);
  color: var(--text-secondary);
}

.hero-title {
  @include text-gradient(linear-gradient(45deg, var(--primary-color), #722ed1));
  font-size: 48px;
  font-weight: 700;
}
```

### Visual Effects Mixins

#### Shadow Mixins

```scss
// Predefined shadows
@include card-shadow;
@include elevated-shadow;
@include no-shadow;

// Custom shadow
@include custom-shadow(0 4px 20px rgba(0, 0, 0, 0.1));
```

#### Border Radius Mixins

```scss
// Default border radius
@include border-radius;

// Custom border radius
@include border-radius(20px);

// Fully rounded
@include rounded;

// Rounded top only
@include rounded-top;

// Rounded bottom only
@include rounded-bottom;
```

**Example:**
```scss
.card {
  @include card-shadow;
  @include border-radius(var(--radius-lg));
  background: var(--bg-primary);
}

.avatar {
  @include rounded;
  width: 40px;
  height: 40px;
}
```

### Transition & Animation Mixins

```scss
// Predefined transitions
@include smooth-transition;
@include fast-transition;
@include slow-transition;
@include theme-transition;

// Custom transition
@include custom-transition(transform opacity, 0.3s, ease-out);

// Hover effects
@include hover-lift;
@include hover-scale(1.1);
```

**Example:**
```scss
.button {
  @include smooth-transition;
  @include hover-lift;
  padding: var(--spacing-sm) var(--spacing-md);
  
  &:hover {
    background: var(--primary-color);
    color: white;
  }
}

.theme-aware-component {
  @include theme-transition;
  background: var(--bg-primary);
  color: var(--text-primary);
}
```

### Positioning Mixins

```scss
// Center absolutely positioned element
@include absolute-center;

// Fill entire parent (absolute)
@include absolute-fill;

// Fill entire viewport (fixed)
@include fixed-fill;

// Sticky positioning
@include sticky-top(64px);
```

**Example:**
```scss
.modal-backdrop {
  @include fixed-fill;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.loading-overlay {
  @include absolute-fill;
  @include flex-center;
  background: rgba(255, 255, 255, 0.8);
}

.header {
  @include sticky-top(0);
  background: var(--bg-primary);
  z-index: 100;
}
```

### Component Mixins

#### Button Mixins

```scss
// Reset button styles
@include button-reset;

// Base button styles
@include button-base;
```

**Example:**
```scss
.custom-button {
  @include button-base;
  background: var(--primary-color);
  color: white;
  
  &:hover {
    background: #096dd9;
  }
}
```

#### Card Mixins

```scss
// Base card styles
@include card-base;

// Card with hover effect
@include card-hover;
```

**Example:**
```scss
.info-card {
  @include card-base;
  @include card-hover;
  padding: var(--spacing-lg);
}
```

#### Input Mixins

```scss
// Base input styles
@include input-base;
```

**Example:**
```scss
.custom-input {
  @include input-base;
  
  &.error {
    border-color: var(--error-color);
  }
}
```

### Utility Mixins

```scss
// Clearfix for floated elements
@include clearfix;

// Hide element visually but keep for screen readers
@include visually-hidden;

// Reset list styles
@include reset-list;

// Reset button styles
@include reset-button;

// Reset input styles
@include reset-input;
```

### Scrollbar Mixins

```scss
// Custom scrollbar
@include custom-scrollbar(8px, var(--bg-tertiary), var(--border-color));

// Hide scrollbar
@include hide-scrollbar;
```

**Example:**
```scss
.scrollable-content {
  @include custom-scrollbar(6px, transparent, var(--text-tertiary));
  max-height: 400px;
  overflow-y: auto;
}

.horizontal-scroll {
  @include hide-scrollbar;
  overflow-x: auto;
}
```

## Best Practices

### 1. Import Mixins at the Top

```scss
// ✅ Good
@import '@/styles/mixins.scss';

.component {
  @include flex-center;
}

// ❌ Bad - importing in the middle
.component {
  @import '@/styles/mixins.scss';
  @include flex-center;
}
```

### 2. Use Semantic Mixins

```scss
// ✅ Good
.card {
  @include card-base;
  @include card-hover;
}

// ❌ Bad - too specific
.card {
  @include custom-shadow(0 2px 8px rgba(0, 0, 0, 0.1));
  @include custom-transition(box-shadow, 0.3s, ease);
}
```

### 3. Combine Mixins Logically

```scss
// ✅ Good
.modal {
  @include fixed-fill;
  @include flex-center;
  @include theme-transition;
  background: rgba(0, 0, 0, 0.5);
}
```

### 4. Use Responsive Mixins for Mobile-First Design

```scss
// ✅ Good - Mobile first
.sidebar {
  // Mobile styles (default)
  width: 100%;
  position: fixed;
  
  @include desktop {
    // Desktop styles
    width: 256px;
    position: static;
  }
}
```

## Creating Custom Mixins

If you need to create new mixins, add them to `mixins.scss`:

```scss
// Custom mixin example
@mixin custom-button($bg-color, $text-color) {
  @include button-base;
  background: $bg-color;
  color: $text-color;
  
  &:hover {
    background: darken($bg-color, 10%);
  }
}

// Usage
.primary-button {
  @include custom-button(var(--primary-color), white);
}
```

## Troubleshooting

### Common Issues

1. **Mixin not found error**
   - Ensure you've imported `mixins.scss` at the top of your file
   - Check the import path is correct

2. **CSS variables not working in mixins**
   - CSS variables work fine in mixins, ensure they're defined in `variables.scss`

3. **Responsive mixins not working**
   - Check that breakpoint variables are imported
   - Ensure media queries are properly nested

### Performance Tips

1. **Import only what you need**
   ```scss
   // If you only need layout mixins, create a separate file
   @import '@/styles/mixins/layout.scss';
   ```

2. **Avoid deep nesting with mixins**
   ```scss
   // ✅ Good
   .component {
     @include flex-center;
     
     .child {
       @include text-ellipsis;
     }
   }
   
   // ❌ Bad - too deep
   .component {
     @include flex-center {
       .child {
         @include text-ellipsis {
           .grandchild {
             // Too deep
           }
         }
       }
     }
   }
   ```
