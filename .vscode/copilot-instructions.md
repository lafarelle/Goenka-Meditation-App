# GitHub Copilot Instructions

## Context Files to Read

Before suggesting code, always reference:

1. `.vscode/project-context.md` - Full project overview
2. `.vscode/ai-instructions.md` - Coding rules and patterns
3. `package.json` - Available dependencies
4. `app.json` - Expo configuration
5. `babel.config.js` - Path alias configuration

## Quick Reference Card

### Tech Stack

#### Core Framework

Expo SDK: 54.0.12 (Latest stable)
React Native: 0.81.4
React: 19.1.0 (Bleeding edge - latest release)
TypeScript: 5.9.3
Node Package Manager: pnpm 9.15.2

#### Navigation

Expo Router: 6.0.10 (File-based routing)
React Navigation: 7.1.6 (Underlying navigation system)

##### Features:

Type-safe routing (typedRoutes: true)
TSConfig path support (tsconfigPaths: true)
Stack-based navigation

#### Styling & UI

NativeWind: 4.1.21 (Tailwind CSS for React Native)
TailwindCSS: 3.4.0

##### Design System:

Utility-first CSS approach
Stone color palette (neutral meditation-friendly colors)
Responsive layout with flexbox

##### UI Components:

@gorhom/bottom-sheet: 5.2.6 (Modal interactions)
@react-native-community/slider: 5.0.1 (Time/duration control)
@expo/vector-icons: 15.0.2 (Icon library)

#### State Management

Zustand: 4.5.7 (Lightweight, simple state management)
AsyncStorage: 2.2.0 (Persistent local storage)
Pattern: Global stores with minimal boilerplate

#### Audio & Media

expo-audio: 1.0.13 (Audio playback for meditation gongs)
