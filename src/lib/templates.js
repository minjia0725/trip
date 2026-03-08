const STORAGE_KEY = 'trip-planner-templates';

export function getTemplates() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveTemplate({ name, data, notes }) {
  const list = getTemplates();
  const template = {
    id: `tpl-${Date.now()}`,
    name: name || '未命名範本',
    data: Array.isArray(data) ? data : [],
    notes: typeof notes === 'string' ? notes : '',
    savedAt: new Date().toISOString(),
  };
  list.unshift(template);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return template;
}

export function deleteTemplate(id) {
  const list = getTemplates().filter((t) => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}
