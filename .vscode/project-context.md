# Goenka October - Project Context for AI Assistants

## Project Identity

- **Name**: Goenka October
- **Type**: Meditation Timer Application
- **Purpose**: Vipassana meditation practice with customizable sessions, audio cues (gongs), and timing preferences
- **Version**: 1.0.0
- **Package Manager**: pnpm 9.15.2

## Technology Stack

### Core

- Expo SDK 54.0.0 + React Native 0.81.4
- React 19.1.0
- TypeScript 5.9.2
- Expo Router 6.0.10 (file-based routing)

### State & Storage

- Zustand 4.5.1 (global state)
- AsyncStorage 2.2.0 (persistence)

### Styling

- NativeWind 4.1.21 (Tailwind for RN)
- TailwindCSS 3.4.0
- Stone color palette (meditation-friendly)

### Audio

- expo-audio 1.0.13

### Animation

- react-native-reanimated 4.1.1 (60fps)
- react-native-gesture-handler 2.28.0
- react-native-worklets 0.5.1

## Architecture Patterns

### File-Based Routing

- Utilizes Expo Router for organizing screens and navigation.

## Development Tools

- **Linting**: ESLint 9.25.1
- **Formatting**: Prettier 3.2.5 with TailwindCSS plugin
- **IDE Extensions**:
  - Model Context Protocol (MCP)
  - ESLint
  - Prettier
  - TypeScript Next
  - Expo Tools
  - React Native Tools

## Project Configuration

- **Expo Config**: Defined in `app.json` with typed routes and Metro bundler for web.
- **Ignored Files**: Specified in `.context7ignore` and `.vscode/settings.json` for optimized performance.
- **MCP Server**: Configured in `.cursor/mcp.json` for AI assistant integration.

## Notes

- The project is private and tailored for meditation practitioners.
- Ensure all dependencies are up-to-date for optimal performance.
