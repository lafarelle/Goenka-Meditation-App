# GitHub Copilot Workspace Instructions

This file provides workspace-level instructions for GitHub Copilot.

## Context Documents

Read these files for complete project understanding:

1. `.vscode/project-context.md` - Complete project overview
2. `.vscode/ai-instructions.md` - Detailed coding rules
3. `.vscode/copilot-instructions.md` - Quick reference

## Project Type

Expo + React Native meditation timer application with TypeScript, NativeWind, and Zustand.

## Critical Rules

1. **ALWAYS** use path aliases: `@/` for src, `@assets/` for assets
2. **ALWAYS** use NativeWind className for styling
3. **ALWAYS** use TypeScript with full type coverage
4. **ALWAYS** use Expo Router for navigation
5. **ALWAYS** use functional components
6. **NEVER** use relative imports (../../)
7. **NEVER** use StyleSheet.create
8. **NEVER** use any type
9. **NEVER** use class components

## File Locations

- Pages: `src/app/*.tsx`
- Components: `src/components/`
- Stores: `src/stores/`
- Hooks: `src/hooks/`
- Utils: `src/utils/`
- Types: `src/types/`

## Tech Stack Quick Reference
