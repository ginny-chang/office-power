import React from 'react';
export default function AgentIcon({index=0}) {
 const paths=[
  <React.Fragment><circle cx="12" cy="7" r="3"/><path d="M5 21v-3a7 7 0 0 1 14 0v3M9 18h6"/></React.Fragment>,
  <React.Fragment><rect x="5" y="3" width="14" height="18" rx="3"/><path d="M8 7h8M8 11h2m4 0h2M8 15h2m4 0h2M8 18h2m4 0h2"/></React.Fragment>,
  <React.Fragment><path d="M4 20V5m0 15h17M8 15l4-5 4 2 5-8M17 4h4v4"/></React.Fragment>,
  <React.Fragment><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6zM8 12l3 3 5-6"/></React.Fragment>
 ];
 return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[index%4]}</svg>;
}
