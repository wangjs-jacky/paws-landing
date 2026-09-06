export const INSTALL_COMMAND = 'npm i -g @wangjs-jacky/paws && paws';

export const ANDROID_APK = Object.freeze({
  version: '1.7.1',
  runtime: '24',
  revision: '3906949b',
  href: 'https://github.com/wangjs-jacky/happy/releases/download/android-v1.7.1-runtimes23-24-3906949b/paws-production-v1.7.1-runtime24-3906949b-arm64.apk'
});

export const DOCS_ROUTES = Object.freeze({
  en: '/docs',
  zh: '/docs/zh-CN'
});

export function docsHref(language, fragment = '') {
  return `${DOCS_ROUTES[language === 'zh' ? 'zh' : 'en']}${fragment}`;
}
