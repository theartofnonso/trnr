# trnr Logo

## Overview
Ultra-minimalist logo consisting of 3 concentric circles representing voice waves, pulse, and AI interaction. Clean white and black variations with no background or borders.

## Current Logo: Pulse Waves

**Design:** 3 concentric circles with varying opacity and stroke widths.

**Symbolism:**
- 3 layers = Voice interaction, energy pulse, AI presence
- Concentric circles = Sound waves / Voice communication
- Radiating pattern = Continuous feedback and growth
- Minimal design = Focus on core functionality

**Variations:**
- White on dark backgrounds (primary)
- Black on light backgrounds

## Usage

### In Components

```tsx
import Logo from '@/components/Logo'

// White logo (primary - use on dark backgrounds)
<Logo className="text-white" size={64} />

// Black logo (use on light backgrounds)
<Logo className="text-black" size={64} />

// With brand name
<div className="flex items-center gap-3">
  <Logo className="text-white" size={32} />
  <span className="text-white font-mono text-xl font-bold">trnr</span>
</div>
```


### Standalone SVG Files

**Main Logo (currentColor - adapts to context):**
- `components/Logo.svg` - Uses currentColor

**Fixed Color Variations:**
- `components/logo-white.svg` - White version
- `components/logo-black.svg` - Black version

Use these for design tools, favicons, or any non-React context.

## Design Guidelines

### Colors
- **Primary**: White (for dark backgrounds)
- **Secondary**: Black (for light backgrounds)
- **No backgrounds**: Logo stands alone, no containers or borders

### Sizes
- **Large**: 64px - Hero sections, splash screens
- **Medium**: 32-48px - Navigation, headers
- **Small**: 24px - Inline use, buttons
- **Icon**: 16px - Favicons, small UI elements

### Backgrounds
- White logo on dark backgrounds (primary use case)
- Black logo on light backgrounds
- No container, background, or border needed
- Logo has built-in depth through concentric circles

### Spacing
- Maintain minimum 8px padding around logo
- Use consistent aspect ratio (1:1 square)
- Don't stretch or skew

## Where Logo is Used

The logo appears in:
- `components/AuthForm.tsx` - Login screen header
- Any other components where you've imported it

## File Structure

```
components/
  ├── Logo.tsx           # Logo component
  ├── Logo.svg           # Static SVG (currentColor)
  ├── logo-white.svg     # White variation
  └── logo-black.svg     # Black variation
```

## Design Philosophy

The logo embodies trnr's minimalist aesthetic:
- Pure geometric shapes (circles only)
- Layered opacity for depth
- Varying stroke widths (2px, 3px, 4px)
- Scalable at any size
- Works in single color
- Modern and technical feel
- Universal symbol for voice/sound/communication

## Export for Other Uses

The logos are React components that render SVG. To export for other uses:

1. **As PNG**: Screenshot the `/logos` page
2. **As SVG**: Copy from `components/Logo.svg`
3. **For Figma/Sketch**: Import the SVG file
4. **For Favicon**: Use the SVG or convert to ICO

## Credits

All logos designed specifically for trnr, representing the intersection of personal training and AI voice technology.

