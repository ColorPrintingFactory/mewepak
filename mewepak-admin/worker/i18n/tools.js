import content from './tool-pages.json' with { type: 'json' };

export const toolLanguages = ['de', 'es', 'fr', 'ar'];

export const toolMetadata = Object.fromEntries(Object.entries(content).map(([path, page]) => [
  path, Object.fromEntries(toolLanguages.map((lang, index) => [
    lang, [page.title[index], page.description[index]],
  ])),
]));

export function toolTranslations(path, lang) {
  const page = content[path];
  if (!page) return null;
  const index = toolLanguages.indexOf(lang);
  const select = (entries) => Object.fromEntries(Object.entries(entries).map(([key, values]) => [key, values[index]]));
  return { phrases: select(page.phrases), client: select(page.client) };
}
