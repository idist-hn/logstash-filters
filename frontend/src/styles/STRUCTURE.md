# Styles Directory Structure Guide

This document outlines the reorganized structure of the styles directory after refactoring component styles.

## New Directory Structure

```
src/styles/
├── components/           # Component-specific styles
│   ├── app-layout.scss   # Main layout component styles
│   └── advanced-search.scss # Advanced search component styles
├── pages/               # Page-specific styles
│   ├── dashboard.scss   # Dashboard page styles
│   └── login.scss       # Login page styles
├── base.scss           # Base styles and global overrides
├── index.scss          # Main entry point that imports all styles
├── main.scss           # Application entry point
├── mixins.scss         # SCSS mixins and functions
├── utilities.scss      # Utility classes
├── variables.scss      # CSS custom properties and SCSS variables
├── README.md          # Theme system documentation
├── MIXINS.md          # Mixins documentation
└── STRUCTURE.md       # This file
```

## Refactoring Changes

### 1. Component Styles Extraction

**Before:** Styles were embedded in Vue components
```vue
<style lang="scss" scoped>
@import '@/styles/mixins.scss';

.advanced-search {
  // 300+ lines of CSS
}
</style>
```

**After:** Styles are in separate SCSS files
```vue
<style lang="scss" scoped>
@import '@/styles/components/advanced-search.scss';
</style>
```

### 2. New File Organization

#### Components Directory (`components/`)
- **`advanced-search.scss`** - All styles for AdvancedSearch component
- **`app-layout.scss`** - Main application layout styles

#### Pages Directory (`pages/`)
- **`dashboard.scss`** - Dashboard page specific styles
- **`login.scss`** - Login page specific styles

#### Utilities File (`utilities.scss`)
- Spacing utilities (margin, padding)
- Display utilities (flex, grid, block)
- Text utilities (alignment, colors, weights)
- Background and border utilities
- Position and sizing utilities
- Responsive variants

### 3. Import Structure

The `index.scss` file imports everything in the correct order:

```scss
// Core styles
@import './variables.scss';
@import './mixins.scss';
@import './base.scss';

// Component styles
@import './components/app-layout.scss';
@import './components/advanced-search.scss';

// Page styles
@import './pages/dashboard.scss';
@import './pages/login.scss';

// Utility classes
@import './utilities.scss';
```

## Benefits of New Structure

### 1. Better Organization
- Clear separation between components, pages, and utilities
- Easier to find and maintain specific styles
- Reduced file sizes in components

### 2. Reusability
- Styles can be shared across multiple components
- Utility classes reduce code duplication
- Consistent patterns across the application

### 3. Maintainability
- Changes to component styles don't require touching Vue files
- Better version control (style changes are isolated)
- Easier to debug and test styles

### 4. Performance
- Better CSS bundling and optimization
- Reduced duplication across components
- More efficient caching

## Migration Guidelines

### For Existing Components

1. **Extract styles** from Vue component to separate SCSS file
2. **Create file** in appropriate directory (`components/` or `pages/`)
3. **Import mixins** at the top of the new file
4. **Update component** to import the external SCSS file
5. **Test** that styles still work correctly

### For New Components

1. **Create SCSS file** in `components/` directory
2. **Import mixins**: `@import '../mixins.scss';`
3. **Use CSS custom properties** for theming
4. **Add import** to `index.scss`
5. **Import in component**: `@import '@/styles/components/component-name.scss';`

### For New Pages

1. **Create SCSS file** in `pages/` directory
2. **Use page-specific** class names (e.g., `.dashboard-page`)
3. **Import mixins** and use CSS custom properties
4. **Add import** to `index.scss`

## Best Practices

### 1. File Naming
- Use kebab-case for file names
- Match component names where possible
- Use descriptive names for pages

### 2. Class Naming
- Use BEM methodology for complex components
- Prefix page classes with page name
- Use semantic class names

### 3. CSS Organization
- Group related styles together
- Use consistent indentation and formatting
- Comment complex or non-obvious styles

### 4. Import Management
- Always import mixins in SCSS files
- Use relative imports in SCSS files
- Update `index.scss` when adding new files

## Utility Classes Usage

The new `utilities.scss` provides common patterns:

```html
<!-- Spacing -->
<div class="p-4 mb-3 mt-2">Content</div>

<!-- Flexbox -->
<div class="d-flex justify-between align-center">
  <span>Left</span>
  <span>Right</span>
</div>

<!-- Text -->
<h1 class="text-2xl font-weight-bold text-primary">Title</h1>

<!-- Responsive -->
<div class="d-flex mobile:flex-column">
  <div class="flex-1">Content</div>
</div>
```

## Future Considerations

### 1. Component Library
- Consider creating a component library with shared styles
- Document common patterns and components
- Create style guide for consistency

### 2. CSS-in-JS Migration
- Evaluate CSS-in-JS solutions for dynamic styling
- Consider styled-components or emotion for complex components
- Maintain current structure for static styles

### 3. Design System
- Develop comprehensive design system
- Create design tokens for consistent spacing, colors, typography
- Implement automated design system updates

This new structure provides a solid foundation for scalable and maintainable styles in the CloudWatch frontend application.
