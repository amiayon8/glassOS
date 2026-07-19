# GlassOS

A browser based virtual Operating System based on clean glassmorphism UI, simple focussed apps, no bloatware and easy to use.

## Features

- **Window Management:** Windows can be dragged, resized, minimized, maximized, and focused.
- **State Persistence:** Persistent windows position, customization
- **Taskbar:** Built with `@dnd-kit/sortable` for dynamic drag-and-drop rearranging of dock icons.
- **Hardware APIs:** Hooks into browser APIs to display real-time battery status, charging indicators, network speed estimates, and memory usage.

## Built-in Apps

- **Browser:** Multi-tab functional web browser.
- **Weather:** A functional weather app
- **Notepad:** Standard text editor with persistent local storage.
- **Tasks:** A basic checklist tracker.
- **Settings:** Controls desktop wallpapers and system preferences.
- **VS Code:** A mock code editor interface with active file state tracking.

## Stack

- Next.js (App Router, configured for static HTML export)
- React 19
- Tailwind CSS v4
- @dnd-kit (Core & Sortable)
- React Icons / Iconify

## Updates in v2

- Added full screen Prompt
- Added game library
- Added calculator app
- Added calendar app
- Added hackatime widget
