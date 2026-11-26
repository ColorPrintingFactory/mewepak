const dictionary = JSON.parse(document.getElementById('mewepak-tool-language')?.textContent || '{}');

export function toolText(key, values = {}) {
  const text = Object.hasOwn(dictionary, key) ? dictionary[key] : key;
  return text.replace(/\{(\w+)\}/g, (match, name) => Object.hasOwn(values, name) ? values[name] : match);
}

export function toolLink(path) {
  return Object.keys(dictionary).length ? '/' + document.documentElement.lang + path : path;
}
