# Use Case 1 — HR 3D office

`HRHelper.js` is the reusable, procedural Three.js character. `HRWorkspace.js` builds its office, materials, monitor canvas texture, lights and notification particles. The character and desk are independent 3D objects.

`../RealHROffice.jsx` hosts the renderer, observes size/visibility and uses `OvertimeContext` as its only story clock. It appears only for scenario 0. The existing other scenarios are preserved. `../real-hr-office.css` positions the scene and the three equal-height portrait cards beneath the workspace.

Timeline: 0/3/7/11/14/18/22/25 seconds; completion at 29 seconds. Eight states follow the approved static storyboard. Nod states keep hands above the keyboard; only the head nods while typing is paused. Reduced motion shows the final summary. Screen mesh dimensions and office camera stay fixed.

Portrait assets are in `public/hr-workspace`; URLs honor Vite BASE_URL. The scene uses procedural wood grain and real geometry, without the previous composited robot/office PNGs.

Local preview: http://localhost:5174/#usecases

Validation: Vite production build, desktop/mobile browser rendering, complete timeline and auto-advance, manual scenario switches, reduced-motion summary, portrait loading. Existing 0911 and v2 pages retain their current implementation.
