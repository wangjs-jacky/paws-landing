import InstallCommand from './InstallCommand';

export default function FinalCTA({ copy, language }) {
  const docsHref = language === 'zh' ? '/docs/zh-CN#quick-start' : '/docs#quick-start';

  return (
    <section id="final-cta" className="shell-section final-cta" aria-labelledby="final-cta-title">
      <div>
        <p className="eyebrow">PAWS CLI</p>
        <h2 id="final-cta-title">{copy.finalCta.title}</h2>
        <p>{copy.finalCta.body}</p>
        <a className="text-action" href={docsHref}>{copy.finalCta.action}<span aria-hidden="true"> →</span></a>
      </div>
      <InstallCommand command="npm i -g @wangjs-jacky/paws && paws" labels={copy.labels} compact />
    </section>
  );
}
