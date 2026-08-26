export default function Footer({ copy, language }) {
  return (
    <footer className="site-footer">
      <div className="page-shell site-footer__grid">
        <a className="footer-brand" href="#top" aria-label="Paws home">
          <img src="/assets/mascot-avatar.png" alt="" />
          <span>Paws</span>
        </a>
        <nav aria-label={copy.footer.docs}>
          <a href="/docs" lang="en">{copy.footer.englishDocs}</a>
          <a href="/docs/zh-CN" lang="zh-CN">{copy.footer.chineseDocs}</a>
          <a href="https://github.com/wangjs-jacky/happy">{copy.footer.github}</a>
          <a href="https://github.com/wangjs-jacky/happy/blob/main/PRIVACY.md">{copy.footer.privacy}</a>
        </nav>
        <small>© {new Date().getFullYear()} Paws · {language === 'zh' ? '开源远程智能体控制器' : 'Open-source remote agent control'}</small>
      </div>
    </footer>
  );
}
