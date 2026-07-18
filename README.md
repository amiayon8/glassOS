# GlassOS

A browser-based desktop environment built with Next.js and React 19. It uses a glassmorphic design system and replicates core OS mechanics like window management, drag-and-drop taskbars, and state persistence entirely on the client side.

## Features

* **Window Management:** Windows can be dragged, resized, minimized, maximized, and focused with real-time z-index sorting.
* **State Persistence:** Window coordinates, dimensions, dock layouts, and internal app states survive page reloads via localStorage.
* **Taskbar:** Built with `@dnd-kit/sortable` for dynamic drag-and-drop rearranging of dock icons.
* **Hardware APIs:** Hooks into browser APIs to display real-time battery status, charging indicators, network speed estimates, and memory usage.
* **Styling:** Extensive use of backdrop-blur, custom slim scrollbars, and Tailwind v4 CSS tokens for the acrylic UI. Responsive across desktop and mobile.

## Built-in Apps

* **Browser:** Multi-tab simulated web browser with address routing and history.
* **Weather:** Uses browser geolocation and reverse-geocoding for hourly and 10-day forecasts. Links to a desktop widget.
* **Notepad:** Standard text editor with persistent local storage.
* **Tasks:** A basic checklist tracker with progress metrics.
* **Settings:** Controls desktop wallpapers and system preferences.
* **VS Code:** A mock code editor interface with active file state tracking.
* **Tic-Tac-Toe:** Local game against a simple algorithm.

## Stack

* Next.js (App Router, configured for static HTML export)
* React 19
* Tailwind CSS v4
* @dnd-kit (Core & Sortable)
* React Icons / Iconify
