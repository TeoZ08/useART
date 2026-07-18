import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const publicCopyFiles = [
  'components/layout/LegalPage.tsx',
  'app/entrega/page.tsx',
  'app/trocas/page.tsx',
  'app/privacidade/page.tsx',
  'app/termos/page.tsx',
  'components/product/ProductPurchasePanel.tsx',
].map((file) => readFileSync(join(root, file), 'utf8').toLocaleLowerCase('pt-BR'));

describe('launch public copy', () => {
  it('does not expose provisional operating language in public routes', () => {
    const copy = publicCopyFiles.join('\n');
    const forbidden = [
      'compras estão temporariamente indisponíveis',
      'texto inicial para operação',
      'revisão jurídica e comercial obrigatória',
      'não substitui política formal',
      'navegação da fase 1',
      'placeholder do moletom art',
      'placeholder do kit seleção',
    ];

    for (const phrase of forbidden) {
      expect(copy).not.toContain(phrase);
    }
  });

  it('keeps the catalog fallback customer-facing and free of implementation details', () => {
    const service = readFileSync(join(root, 'services/catalog/catalog-service.ts'), 'utf8');

    expect(service).toContain(
      'Não foi possível carregar a coleção agora. Tente novamente em instantes.',
    );
    expect(service).not.toContain('Compras estão temporariamente indisponíveis.');
  });
});
