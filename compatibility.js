// Compatibility helpers for the original v11 Svelte bundle. No core globals are changed.
export const Application = globalThis.foundry?.appv1?.api?.Application ?? globalThis.Application;
export const Dialog = globalThis.foundry?.appv1?.api?.Dialog ?? globalThis.Dialog;
export const Actor = globalThis.foundry?.documents?.Actor ?? globalThis.Actor;
export const TextEditor = globalThis.foundry?.applications?.ux?.TextEditor?.implementation
  ?? globalThis.foundry?.applications?.ux?.TextEditor ?? globalThis.TextEditor;
export const renderTemplate = globalThis.foundry?.applications?.handlebars?.renderTemplate ?? globalThis.renderTemplate;
export const loadTemplates = globalThis.foundry?.applications?.handlebars?.loadTemplates ?? globalThis.loadTemplates;
// Legacy ApplicationV1 constants were removed from the v14 global namespace.
export const MIN_WINDOW_HEIGHT = globalThis.MIN_WINDOW_HEIGHT ?? 50;
export const MIN_WINDOW_WIDTH = globalThis.MIN_WINDOW_WIDTH ?? 200;

export function readStoredObject(storage, key) {
  try {
    const value = JSON.parse(storage.getItem(key));
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch { return {}; }
}

export function worldActorFromDrop(event, actors) {
  try {
    const data = JSON.parse(event.dataTransfer?.getData('text/plain') ?? '');
    if (data?.type !== 'Actor') return;
    // Only world actors: compendium and synthetic token UUIDs are different documents.
    const match = typeof data.uuid === 'string' && /^Actor\.([^.]+)$/.exec(data.uuid);
    return match ? actors.get(match[1]) : undefined;
  } catch { return undefined; }
}

export function normalizePerRow(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(1, Math.min(6, Math.trunc(number))) : 2;
}

export function addSummaryControl(controls, api, active) {
  const group = Array.isArray(controls)
    ? controls.find(c => c.name === 'token' || c.name === 'tokens')
    : controls?.tokens ?? controls?.token;
  if (!group?.tools) return;
  const tool = {
    name: 'openActorsSummaryApp', title: 'Forien.ActorsSummary.Control',
    icon: 'fas fa-users', toggle: true, active,
  };
  if (Array.isArray(group.tools)) {
    tool.onClick = value => api.toggleApp(value);
    const index = group.tools.findIndex(t => t.name === tool.name);
    if (index < 0) group.tools.push(tool);
    else group.tools[index] = tool;
  } else {
    tool.order = Object.keys(group.tools).filter(k => k !== tool.name).length;
    tool.onChange = (_event, value) => api.toggleApp(value);
    group.tools[tool.name] = tool;
  }
}
