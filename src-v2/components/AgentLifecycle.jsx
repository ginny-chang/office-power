import React from 'react';

export default function AgentLifecycle({ steps }) {
  return (
    <div className="lifecycle-grid">
      {steps.map((step, index) => (
        <div className={`lifecycle-step ${index === 3 ? 'is-highlighted' : ''}`} key={step.number}>
          <span className="step-index">{step.number}</span>
          <div className="step-line" />
          <h3>{step.label}</h3>
          <p>{step.detail}</p>
        </div>
      ))}
    </div>
  );
}
