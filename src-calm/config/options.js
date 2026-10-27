import registry from './editor-options.json';

export function applyOptions(element, componentId) {
  const controls = registry.components[componentId]?.controls ?? {};
  Object.values(controls).forEach((control) => {
    if (control.target.kind === 'cssVar') element.style.setProperty(control.target.name, String(control.value));
    if (control.target.kind === 'property') element[control.target.name] = control.value;
  });
}

export { registry };
