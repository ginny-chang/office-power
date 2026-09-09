# Office Power

React + Vite landing page with a Three.js / React Three Fiber office tour.

## Preview

Run `npm install`, then `npm run dev`. Open the local URL printed by Vite (not the HTML file in Finder). `npm run build` creates the production assets in `dist`.

## Office tour

`src/components/OfficeTour.jsx` owns four scroll chapters: platform capabilities, a leave-request conversation, department agents and deployment. `OfficeScene.jsx` builds the Mac, white rounded robots, four workstations and AI Core procedurally. The robot is a reconstruction from a single reference image, not the original asset.

Start plays the camera flight into a Mac displaying a live render texture of the office. After entry, scrolling moves the camera continuously through the same office. Chapter buttons provide direct navigation. The leave-request demo progresses to a preview and requires confirmation before showing its simulated approval outcome.

Characters, task packets and leave submission are illustrative, not connected to live agents. Reduced-motion preference skips the opening flight and continuous animations. Offscreen and hidden-tab rendering pauses. Booking links to the existing Office Power site. The requested 15-minute / zero-second / 100% figures are supplied marketing copy, not measured benchmarks; validate their scope before publication.

Model palette, positions and camera poses are in `OfficeScene.jsx`; copy is in `OfficeTour.jsx`; responsive styles are in `office-tour.css`.
