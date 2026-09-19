'use client';

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <section className="admin-section"><div className="admin-card"><span className="eyebrow">Área administrativa</span><h2>Não foi possível carregar o painel.</h2><p>Verifique a conexão com o banco de dados e tente novamente.</p><button className="button" onClick={() => reset()}>Tentar novamente</button></div></section>;
}
