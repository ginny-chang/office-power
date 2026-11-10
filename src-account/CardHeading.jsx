import React from 'react';
export default function CardHeading({title,copy,children}){return <header className="settings-card-head"><div><h2>{title}</h2>{copy&&<p>{copy}</p>}</div>{children}</header>}
