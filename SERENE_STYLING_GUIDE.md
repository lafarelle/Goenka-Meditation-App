# Serene Styling Guide

## Overview

This document outlines the transformation from Neo-Brutalism to a Serene, Modern, and Warm aesthetic for the Goenka meditation app.

## Color Palette

### Background Colors

- **Soft Cream**: `#F5F5EC` - Main background color for the app
- **White**: `#FFFFFF` - Card backgrounds

### Accent Colors

- **Warm Gold**: `#E8B84B` - Primary accent for active states, buttons, and highlights
- **Light Gold**: `#F0CC73` - Lighter shade for hover/pressed states
- **Dark Gold**: `#D4A23D` - Darker shade for emphasis

### Text Colors

- **Deep Charcoal**: `#333333` - Primary text color
- **Medium Gray**: `#666666` - Secondary text color
- **Light Gray**: `#4A4A4A` - Tertiary text color

### Additional Colors

- **Light Gray Background**: `#F5F5EC` - For inactive/unselected states
- **Switch Track Inactive**: `#E5E5E5` - For toggles and switches

## Typography

### Font Family

- **Primary**: Inter or system sans-serif
- **Weights**: Light (300), Normal (400), Medium (500)

### Font Sizes & Styles

- **Page Titles**: 3xl (30px), font-light, tracking-wide
- **Section Headers**: 2xl (24px), font-light, tracking-wide
- **Card Titles**: xl (20px), font-light, tracking-wide
- **Body Text**: base (16px), font-normal
- **Labels**: sm (14px), font-medium, tracking-wide
- **Secondary Text**: sm (14px), font-normal

## Shape & Spacing

### Border Radius

- **Standard**: `rounded-xl` (12px)
- **Large**: `rounded-2xl` (16px)
- **Buttons**: `rounded-xl` (12px)
- **Cards**: `rounded-2xl` (16px)

### Elevation (Shadows)

```javascript
// Standard elevation
shadowColor: '#000',
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.08,
shadowRadius: 8,
elevation: 2,

// Medium elevation (for cards)
shadowColor: '#000',
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.08,
shadowRadius: 8,
elevation: 3,

// High elevation (for modals)
shadowColor: '#000',
shadowOffset: { width: 0, height: 4 },
shadowOpacity: 0.12,
shadowRadius: 12,
elevation: 4,
```

### Spacing

- **Between sections**: `gap-8` (32px)
- **Within cards**: `px-8 py-6` (32px horizontal, 24px vertical)
- **Between elements**: `gap-4` (16px)
- **Between sub-elements**: `gap-3` (12px)
- **Margins**: Significantly increased for breathing room

## Component Patterns

### Buttons

#### Primary Button (Active/Selected)

```javascript
style={({ pressed }) => [
  {
    opacity: pressed ? 0.7 : 1,
    backgroundColor: '#E8B84B', // Warm Gold
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
]}
className="rounded-xl px-6 py-4"
```

#### Secondary Button (Inactive/Unselected)

```javascript
style={({ pressed }) => [
  {
    opacity: pressed ? 0.7 : 1,
    backgroundColor: '#F5F5EC', // Soft Cream
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
]}
className="rounded-xl px-6 py-4"
```

### Cards

```javascript
<View
  className="rounded-2xl bg-white"
  style={{
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  }}>
  <View className="px-8 py-6">{/* Card content */}</View>
</View>
```

### Icon Containers

```javascript
<View
  className="h-12 w-12 items-center justify-center rounded-xl"
  style={{ backgroundColor: '#F5F5EC' }}>
  <Ionicons name="icon-name" size={24} color="#E8B84B" />
</View>
```

### Switch Components

```javascript
<Switch
  value={value}
  onValueChange={onChange}
  trackColor={{ false: '#E5E5E5', true: '#E8B84B' }}
  thumbColor="#FFFFFF"
  ios_backgroundColor="#E5E5E5"
/>
```

## Design Principles

### 1. Serene & Calm

- Use soft, diffused shadows instead of harsh borders
- Maintain generous whitespace between elements
- Avoid visual clutter

### 2. Warm & Inviting

- Cream background reduces eye strain
- Gold accent provides warmth without being overwhelming
- Rounded corners create a friendly, approachable feel

### 3. Modern & Clean

- Simple, minimalist design
- Consistent spacing and alignment
- Clear visual hierarchy

### 4. Accessible

- High contrast between text and backgrounds
- Clear interactive states (pressed/hover)
- Proper use of accessibility labels

## Before & After Comparison

### Neo-Brutalism (Before)

- Harsh black borders (4px)
- Hard shadow offsets (8px_8px_0px)
- Bright colors (amber-400, stone-800)
- Sharp corners
- Dense spacing
- Uppercase, bold text

### Serene (After)

- Soft diffused shadows
- Subtle elevation
- Warm, muted colors (cream, gold)
- Rounded corners (12-16px)
- Generous spacing
- Light, readable text

## Implementation Notes

1. **Tailwind Config**: Extended with custom color palette and utility classes
2. **Typography**: Uses font-light for headers, font-normal for body, font-medium for emphasis
3. **Spacing**: Increased padding/margins by ~50% compared to previous design
4. **Shadows**: Always use inline `style` prop for shadows (NativeWind limitation)
5. **Colors**: Use hex codes in style prop for precise color control

## Files Updated

- `tailwind.config.js` - Added custom color palette
- `src/app/settings.tsx` - Updated page layout
- `src/components/settingsscreen/PreferencesSelector.tsx` - Updated card styling
- `src/components/settingsscreen/TimingPreference.tsx` - Updated toggle styling
- `src/components/settingsscreen/GongSelector.tsx` - Updated button and selection styling
- `src/components/settingsscreen/PauseDurationSelector.tsx` - Updated button grid styling
- `src/components/settingsscreen/ResetDataButton.tsx` - Updated warning card styling
