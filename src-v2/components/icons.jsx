import React from 'react';

// One 24×24 stroked grid shared by the scene pins and the App tiles.
const paths = {
  spark: <path d="M12 3.2c.65 4.15 2.4 5.9 6.5 6.55-4.1.65-5.85 2.4-6.5 6.55-.65-4.15-2.4-5.9-6.5-6.55 4.1-.65 5.85-2.4 6.5-6.55Z M17.4 15.4c.3 1.85 1.1 2.65 2.9 2.95-1.8.3-2.6 1.1-2.9 2.95-.3-1.85-1.1-2.65-2.9-2.95 1.8-.3 2.6-1.1 2.9-2.95Z" />,
  book: <><path d="M6.4 4.6h8.8a1.8 1.8 0 0 1 1.8 1.8v13H8.2a1.8 1.8 0 0 1-1.8-1.8Z" /><path d="M6.4 16.2h10.6" /><path d="M9.8 8.6h4.2" /></>,
  chat: <><rect x="4" y="5" width="16" height="11" rx="3.6" /><path d="M8.8 16v3.7L13.4 16" /></>,
  upgrade: <><circle cx="12" cy="12" r="7.7" /><path d="M12 15.9V8.3M8.9 11.4 12 8.3l3.1 3.1" /></>,
  people: <><circle cx="9.6" cy="9" r="3.3" /><path d="M3.8 19.3a5.8 5.8 0 0 1 11.6 0" /><path d="M15.9 6.2a3.3 3.3 0 0 1 0 5.6M17.3 14.4a5.8 5.8 0 0 1 2.9 4.9" /></>,
  money: <><circle cx="12" cy="12" r="7.8" /><path d="M14.5 9.5a2.5 2.5 0 0 0-2.4-1.5c-1.4 0-2.5.8-2.5 2s1 1.8 2.5 2.1 2.5.9 2.5 2.1-1.1 2-2.5 2a2.6 2.6 0 0 1-2.5-1.6" /><path d="M12 6.4v11.2" /></>,
  trend: <><path d="M4.4 15.6 9.5 10.4l3.2 3.2 6.9-6.9" /><path d="M14.7 6.7h5v5" /></>,
  shield: <><path d="M12 3.7 19 6.3v5.2c0 4.3-2.8 7.3-7 8.8-4.2-1.5-7-4.5-7-8.8V6.3Z" /><path d="m9 12.1 2.1 2.1 4-4.1" /></>,
  calendar: <><rect x="4.2" y="5.4" width="15.6" height="14.4" rx="3.2" /><path d="M4.2 10h15.6M8.6 3.5v3.7M15.4 3.5v3.7" /></>,
  doc: <><path d="M13.4 3.9H7.7a2.6 2.6 0 0 0-2.6 2.6v11a2.6 2.6 0 0 0 2.6 2.6h8.6a2.6 2.6 0 0 0 2.6-2.6V9.2Z" /><path d="M13.2 3.9v5.4h5.6" /><path d="m9.2 14.4 2 2 3.8-4" /></>,
  folder: <path d="M4.2 7.6A2.5 2.5 0 0 1 6.7 5.1h2.9l2.2 2.7h5.5a2.5 2.5 0 0 1 2.5 2.5v6.6a2.5 2.5 0 0 1-2.5 2.5H6.7a2.5 2.5 0 0 1-2.5-2.5Z" />,
};

export default function Icon({ name }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
