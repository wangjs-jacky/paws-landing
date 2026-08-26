import { DOCS_ROUTES } from '../app/siteConstants';

export default function Footer({ copy, language }) {
  return (
    <footer className="site-footer">
      <div className="page-shell site-footer__grid">
        <a className="footer-brand" href="#top" aria-label={copy.labels.home}>
          <img src="/assets/mascot-avatar.png" alt="" />
          <span>Paws</span>
        </a>
        <nav aria-label={copy.footer.docs}>
          <a href={DOCS_ROUTES.en} lang="en">{copy.footer.englishDocs}</a>
          <a href={DOCS_ROUTES.zh} lang="zh-CN">{copy.footer.chineseDocs}</a>
          <a href="https://github.com/wangjs-jacky/happy">{copy.footer.github}</a>
          <a href="https://github.com/wangjs-jacky/happy/blob/main/PRIVACY.md">{copy.footer.privacy}</a>
        </nav>
        <small>© {new Date().getFullYear()} Paws · {language === 'zh' ? '开源远程智能体控制器' : 'Open-source remote agent control'}</small>
      </div>
    </footer>
  );
}
