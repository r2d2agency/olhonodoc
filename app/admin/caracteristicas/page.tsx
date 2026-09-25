'use client';

import { useEffect, useState } from 'react';

type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  useCase: string;
  features: string[];
};

export default function FeaturesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/admin/products')
      .then((response) => response.json())
      .then((body) => {
        const items = Array.isArray(body.data) ? body.data : [];
        setProducts(
          items.map((item: Product) => ({
            ...item,
            features: Array.isArray(item.features) ? item.features : [],
          })),
        );
      })
      .catch(() => setMessage('Não foi possível carregar os produtos.'));
  }, []);

  async function save(product: Product) {
    const response = await fetch(`/api/admin/products/${product.slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: product.description,
        useCase: product.useCase,
        features: product.features,
      }),
    });

    setMessage(response.ok ? 'Características salvas.' : 'Não foi possível salvar.');
  }

  function updateProduct(id: string, changes: Partial<Product>) {
    setProducts((current) =>
      current.map((item) => (item.id === id ? { ...item, ...changes } : item)),
    );
  }

  return (
    <main className="admin-cms">
      <header className="admin-cms-header">
        <div>
          <span className="admin-cms-kicker">PRODUTOS / CARACTERÍSTICAS</span>
          <h1>Características</h1>
          <p>Edite o conteúdo apresentado em cada consulta.</p>
        </div>
      </header>

      {message && <div className="admin-cms-message success">{message}</div>}

      <div className="admin-product-editor-grid">
        {products.map((product) => (
          <section className="admin-panel-card" key={product.id}>
            <h2>{product.name}</h2>
            <label>
              Descrição
              <textarea
                value={product.description || ''}
                onChange={(event) => updateProduct(product.id, { description: event.target.value })}
              />
            </label>
            <label>
              Uso recomendado
              <textarea
                value={product.useCase || ''}
                onChange={(event) => updateProduct(product.id, { useCase: event.target.value })}
              />
            </label>
            <label>
              Características (uma por linha)
              <textarea
                value={product.features.join('\n')}
                onChange={(event) =>
                  updateProduct(product.id, {
                    features: event.target.value
                      .split('\n')
                      .map((value) => value.trim())
                      .filter(Boolean),
                  })
                }
              />
            </label>
            <button className="admin-primary-button" onClick={() => save(product)}>
              Salvar características
            </button>
          </section>
        ))}
      </div>
    </main>
  );
}
