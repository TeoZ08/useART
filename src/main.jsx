import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const STORE_URL = 'https://useartoficial.lojavirtualnuvem.com.br/';
const INSTAGRAM_URL = 'https://www.instagram.com/use.a.r.t/';
const ADMIN_PASSWORD = 'useart2026';

const defaultProducts = [
  {
    id: 'hybrid-art',
    name: 'Camiseta Hybrid Art',
    line: 'Logo lateral',
    price: 'R$45,00',
    installment: '10x de R$5,43',
    colorName: 'Marrom / Preto / Branco',
    shirt: '#5b371a',
    logo: 'side',
    category: 'Masculino',
    isFeatured: true,
  },
  {
    id: 'hybrid-central',
    name: 'Camiseta Hybrid Art Central',
    line: 'Logo central',
    price: 'R$45,00',
    installment: '10x de R$5,43',
    colorName: 'Branco / Preto / Marrom',
    shirt: '#f5f4f0',
    logo: 'center',
    category: 'Unissex',
    isFeatured: true,
  },
  {
    id: 'solid-masculina',
    name: 'Camiseta Solid Masculina',
    line: 'Básica lisa',
    price: 'R$50,00',
    installment: '12x de R$5,09',
    colorName: 'Preto / Branco / Marrom',
    shirt: '#111111',
    logo: 'none',
    category: 'Masculino',
    isFeatured: false,
  },
  {
    id: 'solid-feminina',
    name: 'Camiseta Solid Feminina',
    line: 'Básica feminina',
    price: 'R$50,00',
    installment: '12x de R$5,09',
    colorName: 'Preto / Branco',
    shirt: '#050505',
    logo: 'none',
    category: 'Feminino',
    isFeatured: false,
  },
  {
    id: 'assinatura-masculina',
    name: 'Camiseta Solid Assinatura Masculina',
    line: 'Assinatura lateral',
    price: 'R$50,00',
    installment: '12x de R$5,09',
    colorName: 'Preto / Branco / Marrom',
    shirt: '#171717',
    logo: 'signature',
    category: 'Masculino',
    isFeatured: true,
  },
  {
    id: 'assinatura-feminina',
    name: 'Camiseta Solid Assinatura Feminina',
    line: 'Assinatura lateral',
    price: 'R$50,00',
    installment: '12x de R$5,09',
    colorName: 'Branco / Preto',
    shirt: '#f5f4f0',
    logo: 'signature-dark',
    category: 'Feminino',
    isFeatured: false,
  },
];

const storageKey = 'use-art-products-v1';

function loadProducts() {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return defaultProducts;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : defaultProducts;
  } catch {
    return defaultProducts;
  }
}

function saveProducts(products) {
  localStorage.setItem(storageKey, JSON.stringify(products));
}

function Icon({ name }) {
  const props = { viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true };
  if (name === 'menu') return <svg {...props}><path d="M4 7h16M4 12h11M4 17h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
  if (name === 'bag') return <svg {...props}><path d="M6.5 8h11l-.8 12H7.3L6.5 8Z" stroke="currentColor" strokeWidth="1.8"/><path d="M9 9V7.3C9 5.5 10.3 4 12 4s3 1.5 3 3.3V9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
  if (name === 'user') return <svg {...props}><circle cx="12" cy="8" r="3.1" stroke="currentColor" strokeWidth="1.8"/><path d="M6.8 19c.9-2.1 2.8-3.4 5.2-3.4s4.3 1.3 5.2 3.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
  if (name === 'heart') return <svg {...props}><path d="M12 20s-7.5-4.3-7.5-10.1c0-2.5 1.9-4.4 4.3-4.4 1.4 0 2.6.7 3.2 1.8.6-1.1 1.8-1.8 3.2-1.8 2.4 0 4.3 1.9 4.3 4.4C19.5 15.7 12 20 12 20Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>;
  if (name === 'search') return <svg {...props}><circle cx="10.8" cy="10.8" r="5.8" stroke="currentColor" strokeWidth="1.8"/><path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
  if (name === 'arrow') return <svg {...props}><path d="M4 12h16M14 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  if (name === 'x') return <svg {...props}><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
  return null;
}

function Logo({ className = '' }) {
  return <img className={`logo ${className}`} src="/assets/use-art-logo.jpg" alt="use.a.r.t" />;
}

function LogoSvg({ cut = '#f4f2ed' }) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path d="M10 92L64 22L52 92H10Z" fill="currentColor" />
      <path d="M66 22L110 92H72L60 54L66 22Z" fill="currentColor" />
      <path d="M54 54L89 46L81 32L62 37L54 54Z" fill={cut} />
    </svg>
  );
}

function ExternalLink({ href, children, className = '' }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>;
}

function Header({ onAdminClick }) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="header-left">
          <button className="icon-button ghost" type="button" aria-label="Abrir menu"><Icon name="menu" /></button>
          <nav>
            <a href="#inicio">Início</a>
            <a href="#produtos">Produtos</a>
            <a href="#conceito">Conceito</a>
          </nav>
        </div>
        <a href="#inicio" className="header-logo" aria-label="Voltar ao início"><Logo /></a>
        <div className="header-actions">
          <button className="icon-button" type="button" aria-label="Favoritos"><Icon name="heart" /></button>
          <ExternalLink href={STORE_URL} className="cart-pill">Comprar</ExternalLink>
          <button className="icon-button" type="button" aria-label="Sacola"><Icon name="bag" /></button>
          <button className="icon-button" type="button" aria-label="Admin" onClick={onAdminClick}><Icon name="user" /></button>
        </div>
      </div>
    </header>
  );
}

function ShirtMockup({ product, hero = false, compact = false }) {
  const light = ['#f5f4f0', '#f4f4f1', '#f6f6f3', '#ffffff'].includes(product.shirt);
  const logoColor = light || product.logo === 'signature-dark' ? '#111111' : '#ffffff';
  const cut = product.shirt;
  return (
    <div className={`shirt-stage ${hero ? 'hero-shirt' : ''} ${compact ? 'compact-shirt' : ''}`}>
      <svg className="shirt-svg" viewBox="0 0 420 500" role="img" aria-label={product.name}>
        <ellipse cx="210" cy="452" rx="112" ry="16" fill={light ? 'rgba(0,0,0,.16)' : 'rgba(0,0,0,.35)'} />
        <path d="M128 94C146 76 174 66 210 66C246 66 274 76 292 94L369 134L330 213L292 196V415C256 431 164 431 128 415V196L90 213L51 134L128 94Z" fill={product.shirt} />
        <path d="M176 77C185 93 196 101 210 101C224 101 235 93 244 77" fill="none" stroke={light ? '#c9c8c2' : '#292929'} strokeWidth="7" strokeLinecap="round" />
        <path d="M128 94C146 76 174 66 210 66C246 66 274 76 292 94" fill="none" stroke="rgba(255,255,255,.14)" strokeWidth="3" />
        <path d="M160 102C149 147 145 247 159 396" stroke={light ? 'rgba(0,0,0,.055)' : 'rgba(255,255,255,.06)'} strokeWidth="9" strokeLinecap="round" />
        <path d="M245 102C259 162 264 283 250 400" stroke={light ? 'rgba(0,0,0,.055)' : 'rgba(255,255,255,.06)'} strokeWidth="8" strokeLinecap="round" />
        {product.logo === 'center' && <g transform="translate(184 154)" color={logoColor}><foreignObject width="54" height="54"><div className="shirt-logo-svg"><LogoSvg cut={cut}/></div></foreignObject></g>}
        {product.logo === 'side' && <g transform="translate(252 142)" color={logoColor}><foreignObject width="50" height="50"><div className="shirt-logo-svg"><LogoSvg cut={cut}/></div></foreignObject></g>}
        {(product.logo === 'signature' || product.logo === 'signature-dark') && <g transform="translate(250 135)"><path d="M0 30C15 8 29 7 21 26C17 38 13 45 25 33C39 17 49 14 43 32C39 45 52 30 61 25" fill="none" stroke={logoColor} strokeWidth="4" strokeLinecap="round"/><path d="M7 37C23 39 42 40 64 38" fill="none" stroke={logoColor} strokeWidth="2" strokeLinecap="round" opacity=".65"/></g>}
      </svg>
    </div>
  );
}

function Hero({ products }) {
  const main = products.find((item) => item.id === 'hybrid-central') || products[0];
  return (
    <section id="inicio" className="hero-section">
      <div className="hero-copy">
        <p className="eyebrow">use.a.r.t oficial</p>
        <h1>Vista seu movimento</h1>
        <p className="hero-text">Camisetas minimalistas para quem busca conforto, presença e identidade na rotina.</p>
        <div className="hero-actions">
          <ExternalLink href={STORE_URL} className="primary-link">Comprar agora <Icon name="arrow" /></ExternalLink>
          <a href="#produtos" className="secondary-link">Ver produtos</a>
        </div>
      </div>
      <div className="hero-visual">
        <div className="orb" />
        <ShirtMockup product={main} hero />
      </div>
      <div className="hero-panel">
        <p className="eyebrow">Drop inicial</p>
        <h2>Hybrid Art Central</h2>
        <p>Logo central, base clara e visual limpo. Uma peça que apresenta a marca com atitude sem perder simplicidade.</p>
        <div className="hero-line"><span>Compra segura</span><strong>+</strong></div>
        <div className="hero-line"><span>10% off na primeira compra</span><strong>+</strong></div>
        <div className="hero-line"><span>Atendimento direto</span><strong>+</strong></div>
      </div>
    </section>
  );
}

function ProductCard({ product, onOpen }) {
  return (
    <article className="product-card">
      <button type="button" className="product-image" onClick={() => onOpen(product)}>
        <ShirtMockup product={product} compact />
        <span>Até 5% off</span>
      </button>
      <div className="product-info">
        <p>{product.line}</p>
        <div className="product-title-row"><h3>{product.name}</h3><strong>{product.price}</strong></div>
        <small>{product.installment}</small>
        <div className="color-dots">
          <i style={{ background: '#f4f4f1' }} /><i style={{ background: '#050505' }} /><i style={{ background: '#5b371a' }} />
        </div>
      </div>
    </article>
  );
}

function ProductsSection({ products, onOpen }) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => products.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()) || item.category.toLowerCase().includes(query.toLowerCase())), [products, query]);
  return (
    <section id="produtos" className="products-section">
      <aside className="filters">
        <h2>Filtros</h2>
        <h3>Tamanho</h3>
        <div className="size-grid">{['PP','P','M','G','GG','XG'].map((size) => <button key={size}>{size}</button>)}</div>
        {['Disponibilidade', 'Categoria', 'Cores', 'Preço'].map((item) => <div className="filter-line" key={item}><span>{item}</span><b>›</b></div>)}
      </aside>
      <div className="catalog">
        <div className="catalog-top">
          <div><p>Início / Produtos</p><h2>Produtos</h2><div className="search"><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar" /></div></div>
          <div className="chips">{['Novo','Camisetas','Hybrid','Solid','Assinatura','Mais vendidos'].map((chip) => <button key={chip}>{chip}</button>)}</div>
        </div>
        <div className="product-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} onOpen={onOpen} />)}</div>
      </div>
    </section>
  );
}

function DetailModal({ product, onClose }) {
  if (!product) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="detail-modal" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Fechar"><Icon name="x" /></button>
        <div className="detail-image"><ShirtMockup product={product} hero /></div>
        <div className="detail-content">
          <p className="eyebrow">{product.category}</p>
          <h2>{product.name}</h2>
          <strong>{product.price}</strong>
          <p>{product.installment}</p>
          <p className="detail-description">Camiseta da linha {product.line.toLowerCase()}, pensada para uma rotina confortável com estética limpa e presença visual.</p>
          <div className="option-label">Cores</div>
          <div className="color-dots large"><i style={{ background: '#f4f4f1' }} /><i style={{ background: '#050505' }} /><i style={{ background: '#5b371a' }} /></div>
          <div className="option-label">Tamanho</div>
          <div className="size-grid detail-sizes">{['PP','P','M','G','GG'].map((size) => <button key={size}>{size}</button>)}</div>
          <ExternalLink href={STORE_URL} className="primary-link full">Comprar na loja oficial</ExternalLink>
        </div>
      </section>
    </div>
  );
}

function ConceptSection({ products }) {
  return (
    <section id="conceito" className="concept-section">
      <div className="concept-copy"><p className="eyebrow">Conceito</p><h2>Conforto em movimento</h2><p>Uma página de entrada precisa criar desejo antes de mostrar catálogo. A vitrine apresenta a marca, os produtos reforçam a proposta e a compra segue em fluxo seguro.</p></div>
      <div className="concept-grid">{products.slice(0,3).map((product) => <div className="concept-card" key={product.id}><ShirtMockup product={product} compact /></div>)}</div>
    </section>
  );
}

function AdminPanel({ products, setProducts, onClose }) {
  const [logged, setLogged] = useState(false);
  const [password, setPassword] = useState('');
  const [form, setForm] = useState({ name: '', line: '', price: '', installment: '', category: 'Masculino', shirt: '#111111', logo: 'none', colorName: 'Preto / Branco' });

  function login(event) {
    event.preventDefault();
    if (password === ADMIN_PASSWORD) setLogged(true);
    else alert('Senha do protótipo: useart2026');
  }

  function addProduct(event) {
    event.preventDefault();
    const product = { ...form, id: `${Date.now()}`, colors: ['#f4f4f1', '#050505', '#5b371a'], isFeatured: false };
    const next = [product, ...products];
    setProducts(next);
    saveProducts(next);
    setForm({ name: '', line: '', price: '', installment: '', category: 'Masculino', shirt: '#111111', logo: 'none', colorName: 'Preto / Branco' });
  }

  function resetProducts() {
    setProducts(defaultProducts);
    saveProducts(defaultProducts);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="admin-modal" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Fechar"><Icon name="x" /></button>
        {!logged ? (
          <form onSubmit={login} className="admin-login"><p className="eyebrow">Área administrativa</p><h2>Entrar no painel</h2><p>Protótipo local para demonstrar como ele poderia adicionar produtos. Senha: <strong>useart2026</strong></p><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Senha"/><button className="primary-link full" type="submit">Entrar</button></form>
        ) : (
          <div className="admin-grid"><form onSubmit={addProduct} className="admin-form"><p className="eyebrow">Novo produto</p><h2>Cadastrar peça</h2><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome do produto" required/><input value={form.line} onChange={(e) => setForm({ ...form, line: e.target.value })} placeholder="Linha/modelo" required/><input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Preço" required/><input value={form.installment} onChange={(e) => setForm({ ...form, installment: e.target.value })} placeholder="Parcelamento"/><select value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })}><option value="none">Sem logo</option><option value="center">Logo central</option><option value="side">Logo lateral</option><option value="signature">Assinatura clara</option><option value="signature-dark">Assinatura escura</option></select><input type="color" value={form.shirt} onChange={(e) => setForm({ ...form, shirt: e.target.value })}/><button className="primary-link full" type="submit">Adicionar produto</button><button className="secondary-link full" type="button" onClick={resetProducts}>Restaurar padrão</button></form><div className="admin-list"><h2>Produtos ativos</h2>{products.map((product) => <div className="admin-item" key={product.id}><span>{product.name}</span><strong>{product.price}</strong></div>)}</div></div>
        )}
      </section>
    </div>
  );
}

function App() {
  const [products, setProducts] = useState(loadProducts);
  const [detail, setDetail] = useState(null);
  const [adminOpen, setAdminOpen] = useState(false);

  return (
    <div className="page-shell">
      <Header onAdminClick={() => setAdminOpen(true)} />
      <main>
        <Hero products={products} />
        <section className="proof-strip"><div><strong>01</strong><h3>Conforto diário</h3><p>Peças fáceis de usar, combinar e repetir.</p></div><div><strong>02</strong><h3>Identidade limpa</h3><p>Logo, assinatura e modelagens simples.</p></div><div><strong>03</strong><h3>Compra direta</h3><p>Vitrine autoral com compra pela loja oficial.</p></div></section>
        <ProductsSection products={products} onOpen={setDetail} />
        <ConceptSection products={products} />
      </main>
      <footer><div><Logo /><p>Art | Conforto em movimento</p></div><div><ExternalLink href={STORE_URL}>Comprar na loja</ExternalLink><ExternalLink href={INSTAGRAM_URL}>Instagram</ExternalLink></div></footer>
      <DetailModal product={detail} onClose={() => setDetail(null)} />
      {adminOpen && <AdminPanel products={products} setProducts={setProducts} onClose={() => setAdminOpen(false)} />}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
