# Matteo Raineri Portfolio - Structure Guide

## Overview
This is a cinematic, award-level portfolio website designed for a frontend developer. The site features a dark premium aesthetic with electric blue accents and immersive scroll-based animations.

## Component Architecture

### Main Components

1. **Hero** (`/src/app/components/Hero.tsx`)
   - Full-screen cinematic introduction
   - Oversized typography with split layout
   - Floating UI elements with subtle animations
   - Grid overlay background
   - Gradient glow effects
   - Animated scroll indicator

2. **Philosophy** (`/src/app/components/Philosophy.tsx`)
   - Minimal storytelling section
   - Large statement typography
   - Scroll-triggered reveal animations
   - Asymmetrical layout

3. **Skills** (`/src/app/components/Skills.tsx`)
   - Frontend technologies showcase
   - Floating card grid layout
   - Hover interactions with glow effects
   - Staggered entrance animations
   - Icon-driven design

4. **Projects** (`/src/app/components/Projects.tsx`)
   - Premium project showcase
   - Alternating grid layout
   - Visual project cards with gradients
   - Technology tags
   - Hover state transitions

5. **Process** (`/src/app/components/Process.tsx`)
   - Development workflow visualization
   - Horizontal timeline layout
   - Step-by-step cards
   - Connected timeline indicators

6. **Contact** (`/src/app/components/Contact.tsx`)
   - Minimal closing section
   - Large call-to-action
   - Social media links
   - Footer information

7. **Navigation** (`/src/app/components/Navigation.tsx`)
   - Fixed top navigation
   - Smooth scroll links
   - Glass morphism effect on scroll
   - Status indicator

8. **CustomCursor** (`/src/app/components/CustomCursor.tsx`)
   - Custom animated cursor (desktop only)
   - Trailing cursor effect
   - Interactive state changes

## Design System

### Color Palette
- **Background**: Deep black (`#000000`) and dark navy (`#050510`)
- **Primary Text**: White
- **Accent**: Electric blue (`#3b82f6`, `#60a5fa`)
- **Secondary**: Blue-tinted grays

### Typography
- **Font**: Inter (Google Fonts)
- **Scale**: Responsive clamp values for fluid typography
- **Hierarchy**: 
  - Hero: `clamp(4rem, 12vw, 14rem)`
  - Section Titles: `clamp(3rem, 8vw, 8rem)`
  - Body: `text-xl` to `text-2xl`

### Spacing
- Consistent section padding: `py-32`
- Cinematic vertical spacing between elements
- Maximum content width: `max-w-7xl`

### Visual Effects
- Grid overlays with subtle blue tint
- Radial gradient glows for depth
- Border glows on hover
- Backdrop blur for glass morphism
- Smooth transitions (300-700ms)

## Animation Implementation

### Current Animations (Motion/Framer Motion)

1. **Entrance Animations**
   - Fade in with Y offset
   - Staggered delays for sequential reveals
   - Scale transformations

2. **Scroll Triggers**
   - `useInView` hook for visibility detection
   - One-time animations on scroll
   - Margin offset for early triggers

3. **Hover States**
   - Scale transformations
   - Color transitions
   - Border glow effects

4. **Continuous Animations**
   - Floating elements (Y-axis movement)
   - Rotation animations
   - Pulse effects

### Ready for GSAP Enhancement

The component structure is designed to easily integrate GSAP ScrollTrigger for advanced effects:

**Hero Section**
- Parallax scrolling on floating elements
- Text split animations
- 3D rotation effects
- Scroll-based opacity changes

**Sections**
- Pin sections during scroll
- Horizontal scroll sections
- Morphing transitions
- Timeline-based sequences

**Projects**
- Image reveal masks
- Magnetic hover effects
- Smooth color transitions

**Process**
- Animated timeline progress
- Sequential card reveals
- Connection line drawing

## File Structure

```
/src
  /app
    App.tsx                 # Main app component
    /components
      Hero.tsx             # Hero section
      Philosophy.tsx       # About/Philosophy
      Skills.tsx          # Skills grid
      Projects.tsx        # Project showcase
      Process.tsx         # Development process
      Contact.tsx         # Contact section
      Navigation.tsx      # Fixed navigation
      CustomCursor.tsx    # Custom cursor
  /styles
    fonts.css            # Font imports
    theme.css           # Theme variables
    index.css           # Global styles
```

## Responsive Design

- **Mobile First**: Base styles for mobile
- **Breakpoints**:
  - `md:` 768px - Tablet
  - `lg:` 1024px - Desktop
  - `xl:` 1280px - Large desktop
- **Fluid Typography**: `clamp()` for responsive text sizing
- **Grid Layouts**: Responsive grid columns
- **Custom Cursor**: Desktop only (lg: breakpoint)

## Performance Considerations

- **Motion**: Optimized animations library
- **Lazy Loading**: `useInView` for scroll-triggered animations
- **GPU Acceleration**: Transform and opacity animations
- **Reduced Motion**: Consider adding `prefers-reduced-motion` support

## Next.js Migration Path

This structure is ready for Next.js:

1. Convert components to Next.js App Router format
2. Add metadata and SEO optimization
3. Implement image optimization with `next/image`
4. Add dynamic imports for code splitting
5. Integrate GSAP for enhanced animations
6. Add page transitions with GSAP and Next.js router

## Customization Guide

### Colors
Update blue accent colors throughout components:
- `text-blue-400/500/600`
- `border-blue-500/30`
- `bg-blue-500/5`

### Content
Modify content in each component:
- Project data in `Projects.tsx`
- Skills in `Skills.tsx`
- Social links in `Contact.tsx`

### Animations
Adjust animation values:
- `delay`: Stagger timing
- `duration`: Animation speed
- `transition.type`: Spring, tween, etc.

### Layout
- Modify `max-w-*` for content width
- Adjust `py-*` for section spacing
- Change grid columns in responsive layouts

## Browser Support

- Modern browsers with ES6+ support
- CSS Grid and Flexbox
- CSS Custom Properties
- Motion API support
- WebP image support recommended

## Credits

Design inspired by award-winning interactive studios and modern premium portfolios.
