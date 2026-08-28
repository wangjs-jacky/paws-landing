import { docsHref, DOCS_ROUTES } from '../app/siteConstants';

export default function Footer({ copy, language }) {
  return (
    <footer className="site-footer">
      <div className="page-shell site-footer__grid">
        <a className="footer-brand" href="#top" aria-label={copy.labels.home}>
          <img
            src="/assets/mascots/hoodie.png"
            alt=""
            width="512"
            height="512"
            loading="lazy"
            decoding="async"
          />
          <span>Paws</span>
        </a>
        <nav aria-label={copy.footer.docs}>
          <a href={DOCS_ROUTES.en} lang="en">{copy.footer.englishDocs}</a>
          <a href={DOCS_ROUTES.zh} lang="zh-CN">{copy.footer.chineseDocs}</a>
          <a href={docsHref(language, '#self-hosting')}>{copy.openSource.actions.selfHosting}</a>
          <a href="https://github.com/wangjs-jacky/happy">{copy.footer.github}</a>
          <a href="https://github.com/wangjs-jacky/happy/blob/main/PRIVACY.md">{copy.footer.privacy}</a>
        </nav>
        <small>© {new Date().getFullYear()} Paws · {language === 'zh' ? '开源远程智能体控制器' : 'Open-source remote agent control'}</small>
      </div>
    </footer>
  );
}
