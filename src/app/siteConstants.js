export const INSTALL_COMMAND = 'npm i -g @wangjs-jacky/paws && paws';

export const DOCS_ROUTES = Object.freeze({
  en: '/docs',
  zh: '/docs/zh-CN'
});

export function docsHref(language, fragment = '') {
  return `${DOCS_ROUTES[language === 'zh' ? 'zh' : 'en']}${fragment}`;
}
