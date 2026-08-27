import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { getStoryContent } from '../src/app/storyContent';
import ProductProof from '../src/components/ProductProof';
import ValueComparison from '../src/components/ValueComparison';

const componentCss = readFileSync(resolve(process.cwd(), 'src/styles/components.css'), 'utf8');

function cssBlock(source, startPattern) {
  const match = startPattern.exec(source);
  if (!match) return '';
  const openBrace = source.indexOf('{', match.index);
  let depth = 1;

  for (let index = openBrace + 1; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    if (source[index] === '}') depth -= 1;
    if (depth === 0) return source.slice(openBrace + 1, index);
  }

  return '';
}

describe('product proof', () => {
  it.each(['en', 'zh'])('renders six populated %s proof cases from the approved copy', language => {
    const copy = getStoryContent(language);
    render(<ProductProof copy={{ ...copy, proofTitle: language === 'en' ? 'Product' : '产品能力' }} />);

    const cases = screen.getAllByTestId('proof-case');
    expect(cases).toHaveLength(6);

    for (const [index, card] of cases.entries()) {
      expect(card).toHaveAttribute('data-proof-id', copy.proof[index].id);
      expect(within(card).getByRole('heading')).toHaveTextContent(copy.proof[index].title);
      expect(within(card).getByText(copy.proof[index].body)).toBeInTheDocument();
      expect(within(card).getByTestId('proof-status')).toHaveTextContent(copy.proof[index].status);
      expect(within(card).getByTestId('proof-evidence')).toHaveTextContent(copy.proof[index].evidence);
    }
  });

  it('uses case-specific semantic evidence instead of a repeated generic card', () => {
    render(<ProductProof copy={{ ...getStoryContent('en'), proofTitle: 'Product' }} />);

    const caseById = id => document.querySelector(`[data-proof-id="${id}"]`);

    expect(within(caseById('remote-start')).getByTestId('remote-start-selector'))
      .toContainElement(within(caseById('remote-start')).getByText('Mac mini'));
    expect(within(caseById('remote-start')).getAllByRole('listitem')).toHaveLength(3);

    expect(within(caseById('live-process')).getByTestId('live-tool-list')).toBeInTheDocument();
    expect(within(caseById('live-process')).getAllByRole('listitem')).toHaveLength(3);

    const approval = within(caseById('approval')).getByTestId('approval-request');
    expect(approval).toHaveTextContent('Approval required');
    expect(within(approval).getByText('npm run build')).toBeInTheDocument();

    expect(within(caseById('session-overview')).getByTestId('session-statuses'))
      .toContainElement(within(caseById('session-overview')).getByText('Complete'));
    expect(within(caseById('session-overview')).getAllByRole('listitem')).toHaveLength(5);

    expect(within(caseById('encrypted-sync')).getByTestId('sync-topology')).toBeInTheDocument();
    expect(within(caseById('encrypted-sync')).getAllByRole('listitem')).toHaveLength(3);

    const actions = within(caseById('open-source')).getByTestId('open-source-actions');
    expect(within(actions).getByRole('link', { name: 'GitHub' })).toHaveAttribute(
      'href',
      'https://github.com/wangjs-jacky/happy'
    );
    expect(within(actions).getByRole('link', { name: 'Self-hosting guide' })).toHaveAttribute(
      'href',
      '/docs#self-hosting'
    );
  });
});

describe('value comparison', () => {
  it.each(['en', 'zh'])('renders an exactly five-row semantic %s table and qualified note', language => {
    const copy = getStoryContent(language);
    const { container } = render(<ValueComparison copy={copy} />);

    const table = screen.getByRole('table');
    expect(within(table).getAllByRole('columnheader')).toHaveLength(3);
    expect(screen.getAllByTestId('comparison-row')).toHaveLength(5);
    expect(within(table).getAllByRole('rowheader')).toHaveLength(5);

    for (const [index, row] of screen.getAllByTestId('comparison-row').entries()) {
      const cells = within(row).getAllByRole('cell');
      expect(within(row).getByRole('rowheader')).toHaveTextContent(copy.comparison[index].topic);
      expect(cells[0]).toHaveAttribute('data-label', copy.comparisonLabels.local);
      expect(cells[0]).toHaveTextContent(copy.comparison[index].local);
      expect(cells[1]).toHaveAttribute('data-label', 'Paws');
      expect(cells[1]).toHaveTextContent(copy.comparison[index].paws);
    }

    const note = table.nextElementSibling;
    expect(note).toHaveTextContent(copy.architecture.note);
    expect(container).not.toHaveTextContent(/无需\s*VPN/);
  });

  it('reflows into labeled mobile rows without hiding the semantic table header', () => {
    const mobile = cssBlock(componentCss, /@media\s*\(max-width:\s*800px\)\s*\{/);

    expect(mobile).toMatch(/\.product-proof__grid\s*\{[^}]*grid-template-columns:\s*1fr/s);
    expect(mobile).toMatch(/\.value-comparison__table tbody tr\s*\{[^}]*display:\s*grid/s);
    expect(mobile).toMatch(/\.value-comparison__table tbody td::before\s*\{[^}]*content:\s*attr\(data-label\)/s);
    expect(mobile).toMatch(/\.value-comparison__table thead\s*\{[^}]*clip-path:\s*inset\(50%\)/s);
    expect(mobile).not.toMatch(/\.value-comparison__table thead\s*\{[^}]*display:\s*none/s);
  });
});
