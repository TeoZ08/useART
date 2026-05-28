import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const ADMIN_PASSWORD = 'useart2026';

const productImages = {
  hybridBrown: '/assets/products/hybrid-art-marrom.jpg',
  hybridBrownAlt: '/assets/products/hybrid-art-marrom-alt.jpg',
  hybridBrownBack: '/assets/products/camiseta-marrom-costas.jpg',
  hybridWhite: '/assets/products/hybrid-art-branca.jpg',
  hybridWhiteCenter: '/assets/products/hybrid-central-branca.jpg',
  whiteBack: '/assets/products/camiseta-branca-costas.jpg',
  hybridBlack: '/assets/products/hybrid-art-preta.jpg',
  hybridBlackAlt: '/assets/products/hybrid-art-preta-alt.jpg',
  blackBack: '/assets/products/camiseta-preta-costas.jpg',
  signatureBlack: '/assets/products/solid-assinatura-masculina-preta.jpg',
  signatureWhite: '/assets/products/solid-assinatura-feminina-branca.jpg',
  signatureBrown: '/assets/products/solid-assinatura-marrom.jpg',
};

const defaultProducts = [
  {
    id: 'camiseta-hybrid',
    name: 'Camiseta Hybrid',
    line: 'Essencial',
    price: 45,
    installment: '10x de R$5,43',
    category: 'Masculino',
    colors: [
      { name: 'Branco', value: '#f4f4f1' },
      { name: 'Preto', value: '#050505' },
      { name: 'Marrom', value: '#5b371a' },
    ],
    sizes: ['PP', 'P', 'M', 'G', 'GG'],
    image: productImages.hybridBrownAlt,
    gallery: [productImages.hybridBrownAlt, productImages.hybridBrownBack, productImages.hybridBlackAlt, productImages.hybridWhite],
    description: 'Camiseta essencial com visual limpo, tecido confortável e proposta minimalista para uso diário.',
  },
  {
    id: 'camiseta-hybrid-art',
    name: 'Camiseta Hybrid Art',
    line: 'Logo lateral',
    price: 45,
    installment: '10x de R$5,43',
    category: 'Masculino',
    colors: [
      { name: 'Branco', value: '#f4f4f1' },
      { name: 'Preto', value: '#050505' },
      { name: 'Marrom', value: '#5b371a' },
    ],
    sizes: ['PP', 'P', 'M', 'G', 'GG'],
    image: productImages.hybridBrown,
    gallery: [productImages.hybridBrown, productImages.hybridBlack, productImages.hybridWhite, productImages.hybridBrownBack],
    description: 'Modelo com aplicação lateral da logo use.a.r.t. Uma peça direta, urbana e fácil de combinar.',
  },
  {
    id: 'camiseta-hybrid-art-central',
    name: 'Camiseta Hybrid Art Central',
    line: 'Logo central',
    price: 45,
    installment: '10x de R$5,43',
    category: 'Unissex',
    colors: [
      { name: 'Branco', value: '#f4f4f1' },
      { name: 'Preto', value: '#050505' },
      { name: 'Marrom', value: '#5b371a' },
    ],
    sizes: ['PP', 'P', 'M', 'G', 'GG'],
    image: productImages.hybridWhiteCenter,
    gallery: [productImages.hybridWhiteCenter, productImages.whiteBack, productImages.hybridBlackAlt, productImages.hybridBrown],
    description: 'Camiseta com logo central. Boa para apresentar a identidade da marca com presença e equilíbrio.',
  },
  {
    id: 'camiseta-hybrid-assinatura',
    name: 'Camiseta Hybrid Assinatura',
    line: 'Assinatura lateral',
    price: 50,
    installment: '12x de R$5,09',
    category: 'Masculino',
    colors: [
      { name: 'Branco', value: '#f4f4f1' },
      { name: 'Preto', value: '#050505' },
      { name: 'Marrom', value: '#5b371a' },
    ],
    sizes: ['PP', 'P', 'M', 'G', 'GG'],
    image: productImages.signatureBlack,
    gallery: [productImages.signatureBlack, productImages.signatureBrown, productImages.signatureWhite],
    description: 'Versão com assinatura lateral Art. Visual discreto e premium dentro da linha.',
  },
  {
    id: 'camiseta-solid-masculina',
    name: 'Camiseta Solid Masculina',
    line: 'Básica lisa',
    price: 50,
    installment: '12x de R$5,09',
    category: 'Masculino',
    colors: [
      { name: 'Branco', value: '#f4f4f1' },
      { name: 'Preto', value: '#050505' },
      { name: 'Marrom', value: '#5b371a' },
    ],
    sizes: ['PP', 'P', 'M', 'G', 'GG'],
    image: productImages.hybridBlackAlt,
    gallery: [productImages.hybridBlackAlt, productImages.blackBack, productImages.hybridBrownAlt, productImages.hybridWhite],
    description: 'Camiseta lisa para quem prefere uma base neutra, confortável e versátil.',
  },
  {
    id: 'camiseta-solid-feminina',
    name: 'Camiseta Solid Feminina',
    line: 'Básica feminina',
    price: 50,
    installment: '12x de R$5,09',
    category: 'Feminino',
    colors: [
      { name: 'Branco', value: '#f4f4f1' },
      { name: 'Preto', value: '#050505' },
    ],
    sizes: ['PP', 'P', 'M', 'G', 'GG'],
    image: productImages.signatureWhite,
    gallery: [productImages.signatureWhite, productImages.hybridWhite, productImages.whiteBack],
    description: 'Modelagem feminina com visual clean e proposta confortável para a rotina.',
  },
  {
    id: 'camiseta-solid-assinatura-masculina',
    name: 'Camiseta Solid Assinatura Masculina',
    line: 'Assinatura lateral',
    price: 50,
    installment: '12x de R$5,09',
    category: 'Masculino',
    colors: [
      { name: 'Branco', value: '#f4f4f1' },
      { name: 'Preto', value: '#050505' },
      { name: 'Marrom', value: '#5b371a' },
    ],
    sizes: ['PP', 'P', 'M', 'G', 'GG'],
    image: productImages.signatureBlack,
    gallery: [productImages.signatureBlack, productImages.signatureBrown, productImages.signatureWhite],
    description: 'Camiseta masculina com assinatura Art aplicada de forma sutil e elegante.',
  },
  {
    id: 'camiseta-solid-assinatura-feminina',
    name: 'Camiseta Solid Assinatura Feminina',
    line: 'Assinatura lateral',
    price: 50,
    installment: '12x de R$5,09',
    category: 'Feminino',
    colors: [
      { name: 'Branco', value: '#f4f4f1' },
      { name: 'Preto', value: '#050505' },
    ],
    sizes: ['PP', 'P', 'M', 'G', 'GG'],
    image: productImages.signatureWhite,
    gallery: [productImages.signatureWhite, productImages.signatureBlack, productImages.signatureBrown],
    description: 'Versão feminina da linha assinatura, pensada para manter conforto e identidade visual.',
  },
  {
    id: 'selecao-art-kit-3',
    name: 'Seleção Art Kit 3 Camisetas',
    line: 'Kit especial',
    price: 114.9,
    installment: '2x de R$57,45 sem juros',
    category: 'Kit',
    colors: [
      { name: 'Mix de cores', value: '#111111' },
      { name: 'Branco', value: '#f4f4f1' },
      { name: 'Marrom', value: '#5b371a' },
    ],
    sizes: ['PP', 'P', 'M', 'G', 'GG'],
    image: productImages.hybridBlack,
    gallery: [productImages.hybridBlack, productImages.hybridBrown, productImages.hybridWhiteCenter],
    description: 'Kit para experimentar a marca com mais possibilidades de uso no dia a dia.',
  },
];

const shippingOptions = [
  { id: 'retirada-art', name: 'Retirada ART', detail: 'Retirada combinada com a loja', price: 0, eta: 'sexta-feira 29/05' },
  { id: 'sedex-promocional', name: 'Correios - SEDEX Promocional', detail: 'Envio a domicílio', price: 11.91, eta: 'sexta-feira 29/05' },
  { id: 'jadlog-package', name: 'JADLOG PACKAGE Promocional', detail: 'Envio a domicílio', price: 18.46, eta: 'terça-feira 02/06' },
  { id: 'nuvem-pac', name: 'Nuvem Envio Correios PAC', detail: 'Envio a domicílio', price: 24.75, eta: 'quinta-feira 18/06' },
  { id: 'jadlog-rapido', name: 'Nuvem Envio - Jadlog Rápido', detail: 'Envio a domicílio', price: 21.54, eta: 'quinta-feira 18/06' },
  { id: 'pac-promocional', name: 'Correios - PAC Promocional', detail: 'Envio a domicílio', price: 18.71, eta: 'quinta-feira 04/06' },
  { id: 'sedex-nuvem', name: 'Nuvem Envio Correios SEDEX', detail: 'Envio a domicílio', price: 17.66, eta: 'sexta-feira 12/06' },
  { id: 'jadlog-economico', name: 'Nuvem Envio - Jadlog Econômico', detail: 'Envio a domicílio', price: 15.47, eta: 'sexta-feira 19/06' },
];

const paymentMethods = [
  { id: 'credito', name: 'Cartão de crédito', detail: 'Visa, Mastercard, Elo, Hipercard, American Express e outros' },
  { id: 'pix', name: 'Pix', detail: 'Pagamento rápido com confirmação quase imediata' },
  { id: 'boleto', name: 'Boleto bancário', detail: 'Compensação em até 3 dias úteis' },
  { id: 'mercado-pago', name: 'Mercado Pago', detail: 'Carteira digital e meios parceiros' },
  { id: 'linha-credito', name: 'Linha de Crédito Mercado Pago', detail: 'Sujeito à aprovação do provedor' },
];

const storageKey = 'use-art-products-real-v4';

function money(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function safeId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

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
  if (name === 'bag') return <svg {...props}><path d="M6.5 8h11l-.8 12H7.3L6.5 8Z" stroke="currentColor" strokeWidth="1.8"/><path d="M9 9V7.3C9 5.5 10.3 4 12 4s3 1.5 3 3.3V9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
  if (name === 'user') return <svg {...props}><circle cx="12" cy="8" r="3.1" stroke="currentColor" strokeWidth="1.8"/><path d="M6.8 19c.9-2.1 2.8-3.4 5.2-3.4s4.3 1.3 5.2 3.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
  if (name === 'search') return <svg {...props}><circle cx="10.8" cy="10.8" r="5.8" stroke="currentColor" strokeWidth="1.8"/><path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
  if (name === 'arrow') return <svg {...props}><path d="M4 12h16M14 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  if (name === 'x') return <svg {...props}><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
  if (name === 'trash') return <svg {...props}><path d="M5 7h14M10 11v6M14 11v6M8 7l1-3h6l1 3M7 7l1 13h8l1-13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  if (name === 'minus') return <svg {...props}><path d="M6 12h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
  if (name === 'plus') return <svg {...props}><path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
  return null;
}

function Logo({ className = '' }) {
  return <img className={`logo ${className}`} src="/assets/use-art-logo.jpg" alt="use.a.r.t" />;
}

function Header({ cartCount, onCartClick, onAdminClick }) {
  return (
    <header className="site-header">
      <div className="top-promo" aria-label="Cupom de primeira compra">
        <span>10% de desconto com o cupom: PRIMEIRACOMPRA</span>
        <span>10% de desconto com o cupom: PRIMEIRACOMPRA</span>
        <span>10% de desconto com o cupom: PRIMEIRACOMPRA</span>
        <span>10% de desconto com o cupom: PRIMEIRACOMPRA</span>
      </div>
      <div className="header-inner">
        <div className="header-left">
          <a href="#inicio" className="header-logo" aria-label="Voltar ao início"><Logo /></a>
          <nav>
            <a href="#inicio">Início</a>
            <a href="#produtos">Produtos</a>
          </nav>
        </div>
        <div className="header-actions">
          <div className="header-search"><input placeholder="O que você está buscando?" /><Icon name="search" /></div>
          <a href="#produtos" className="cart-pill">Comprar</a>
          <button className="icon-button cart-button" type="button" aria-label="Sacola" onClick={onCartClick}>
            <Icon name="bag" />
            {cartCount > 0 && <span>{cartCount}</span>}
          </button>
          <button className="icon-button" type="button" aria-label="Admin" onClick={onAdminClick}><Icon name="user" /></button>
        </div>
      </div>
    </header>
  );
}

function Hero({ products }) {
  const main = products.find((item) => item.id === 'camiseta-hybrid-art-central') || products[0];
  return (
    <section id="inicio" className="hero-section">
      <div className="hero-media"><img src={main.image} alt={main.name} /></div>
      <div className="hero-overlay">
        <p>Nova coleção</p>
        <h1>Conforto em movimento</h1>
        <a href="#produtos" className="hero-button">Quero conhecer</a>
      </div>
    </section>
  );
}

function ProductCard({ product, onOpen }) {
  return (
    <article className="product-card" onClick={() => onOpen(product)}>
      <div className="product-image">
        <img src={product.image} alt={product.name} />
        <span>Até 5% off comprando em quantidade</span>
      </div>
      <div className="product-info">
        <p>{product.line}</p>
        <div className="product-title-row">
          <h3>{product.name}</h3>
          <strong>{money(product.price)}</strong>
        </div>
        <small>{product.installment}</small>
        <div className="color-dots">
          {product.colors.map((color) => <i key={color.name} style={{ background: color.value }} title={color.name} />)}
        </div>
      </div>
    </article>
  );
}

function ProductsSection({ products, onOpen }) {
  const [filter, setFilter] = useState('Todos');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('az');
  const filters = ['Todos', 'Masculino', 'Feminino', 'Unissex', 'Kit'];

  const visible = useMemo(() => {
    return products
      .filter((product) => filter === 'Todos' || product.category === filter)
      .filter((product) => product.name.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => {
        if (sort === 'price-asc') return a.price - b.price;
        if (sort === 'price-desc') return b.price - a.price;
        return a.name.localeCompare(b.name);
      });
  }, [products, filter, query, sort]);

  return (
    <section id="produtos" className="products-section">
      <div className="catalog-top">
        <div>
          <p>Início / Produtos</p>
          <h2>Produtos</h2>
          <div className="category-tabs">
            {filters.map((item) => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item}</button>)}
          </div>
        </div>
        <div className="catalog-controls">
          <label className="search"><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar" /></label>
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="az">A-Z</option>
            <option value="price-asc">Menor preço</option>
            <option value="price-desc">Maior preço</option>
          </select>
        </div>
      </div>
      <div className="product-grid">
        {visible.map((product) => <ProductCard key={product.id} product={product} onOpen={onOpen} />)}
      </div>
    </section>
  );
}

function ProductModal({ product, onClose, onAddToCart }) {
  const [image, setImage] = useState(product?.gallery?.[0] || product?.image);
  const [color, setColor] = useState(product?.colors?.[0]);
  const [size, setSize] = useState(product?.sizes?.[1] || product?.sizes?.[0]);

  if (!product) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="detail-modal" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Fechar"><Icon name="x" /></button>
        <div className="detail-image">
          <img src={image} alt={product.name} />
          <div className="thumb-row">
            {product.gallery.map((item) => <button key={item} className={image === item ? 'active' : ''} onClick={() => setImage(item)}><img src={item} alt="Miniatura do produto" /></button>)}
          </div>
        </div>
        <div className="detail-content">
          <p className="product-line-label">{product.line}</p>
          <h2>{product.name}</h2>
          <strong>{money(product.price)}</strong>
          <p className="detail-description">{product.description}</p>
          <p className="option-label">Cores</p>
          <div className="color-options">
            {product.colors.map((item) => <button key={item.name} title={item.name} className={color?.name === item.name ? 'active' : ''} style={{ background: item.value }} onClick={() => setColor(item)} />)}
          </div>
          <p className="option-label">Tamanho</p>
          <div className="size-grid detail-sizes">
            {product.sizes.map((item) => <button key={item} className={size === item ? 'active' : ''} onClick={() => setSize(item)}>{item}</button>)}
          </div>
          <div className="selected-summary"><i style={{ background: color?.value }} /> {color?.name} / {size}</div>
          <button className="primary-link full" onClick={() => { onAddToCart(product, color, size); onClose(); }}>
            Adicionar ao carrinho <Icon name="arrow" />
          </button>
        </div>
      </div>
    </div>
  );
}

function CartDrawer({ cart, onClose, onRemove, onUpdateQuantity, onCheckout }) {
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="cart-drawer" onClick={(event) => event.stopPropagation()}>
        <div className="drawer-head">
          <div>
            <p>use.a.r.t</p>
            <h2>Sacola</h2>
          </div>
          <button onClick={onClose} aria-label="Fechar"><Icon name="x" /></button>
        </div>
        {cart.length === 0 ? (
          <div className="empty-cart"><p>Sua sacola está vazia.</p><a href="#produtos" onClick={onClose}>Ver produtos</a></div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item) => (
                <div className="cart-item" key={item.key}>
                  <img src={item.product.image} alt={item.product.name} />
                  <div>
                    <strong>{item.product.name}</strong>
                    <span>{item.color.name} / {item.size}</span>
                    <p>{money(item.product.price)}</p>
                    <div className="quantity-box">
                      <button onClick={() => onUpdateQuantity(item.key, item.quantity - 1)}><Icon name="minus" /></button>
                      <span>{item.quantity}</span>
                      <button onClick={() => onUpdateQuantity(item.key, item.quantity + 1)}><Icon name="plus" /></button>
                    </div>
                  </div>
                  <button className="remove-item" onClick={() => onRemove(item.key)} aria-label="Remover"><Icon name="trash" /></button>
                </div>
              ))}
            </div>
            <div className="cart-total">
              <span>Subtotal</span>
              <strong>{money(subtotal)}</strong>
            </div>
            <button className="primary-link full" onClick={onCheckout}>Finalizar compra</button>
          </>
        )}
      </aside>
    </div>
  );
}

function CheckoutModal({ cart, onClose, onBackToCart, onFinish }) {
  const [step, setStep] = useState('contact');
  const [customer, setCustomer] = useState({ email: '', phone: '', firstName: '', lastName: '', cep: '', address: '', city: '', state: 'MS' });
  const [shipping, setShipping] = useState(shippingOptions[0]);
  const [payment, setPayment] = useState(paymentMethods[0]);
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const total = subtotal + shipping.price;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="checkout-modal" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Fechar"><Icon name="x" /></button>
        <div className="checkout-main">
          <button className="back-link" onClick={onBackToCart}>← Voltar para sacola</button>
          <h2>Checkout</h2>
          <div className="checkout-steps">
            <span className={step === 'contact' ? 'active' : ''}>Carrinho</span>
            <span className={step === 'shipping' ? 'active' : ''}>Entrega</span>
            <span className={step === 'payment' ? 'active' : ''}>Pagamento</span>
          </div>

          {step === 'contact' && (
            <div className="checkout-panel">
              <h3>Dados de contato</h3>
              <input placeholder="E-mail" value={customer.email} onChange={(event) => setCustomer({ ...customer, email: event.target.value })} />
              <input placeholder="Telefone" value={customer.phone} onChange={(event) => setCustomer({ ...customer, phone: event.target.value })} />
              <h3>Endereço de entrega</h3>
              <div className="form-grid two"><input placeholder="Nome" value={customer.firstName} onChange={(event) => setCustomer({ ...customer, firstName: event.target.value })} /><input placeholder="Sobrenome" value={customer.lastName} onChange={(event) => setCustomer({ ...customer, lastName: event.target.value })} /></div>
              <div className="form-grid two"><input placeholder="CEP" value={customer.cep} onChange={(event) => setCustomer({ ...customer, cep: event.target.value })} /><input placeholder="UF" value={customer.state} onChange={(event) => setCustomer({ ...customer, state: event.target.value })} /></div>
              <input placeholder="Endereço" value={customer.address} onChange={(event) => setCustomer({ ...customer, address: event.target.value })} />
              <input placeholder="Cidade" value={customer.city} onChange={(event) => setCustomer({ ...customer, city: event.target.value })} />
              <button className="primary-link full" onClick={() => setStep('shipping')}>Ir para entrega <Icon name="arrow" /></button>
            </div>
          )}

          {step === 'shipping' && (
            <div className="checkout-panel">
              <h3>Entrega</h3>
              <div className="option-list">
                {shippingOptions.map((option) => (
                  <button key={option.id} className={shipping.id === option.id ? 'selected' : ''} onClick={() => setShipping(option)}>
                    <span><strong>{option.name}</strong><small>{option.detail} · Chega {option.eta}</small></span>
                    <b>{option.price === 0 ? 'Grátis' : money(option.price)}</b>
                  </button>
                ))}
              </div>
              <button className="primary-link full" onClick={() => setStep('payment')}>Ir para pagamento <Icon name="arrow" /></button>
            </div>
          )}

          {step === 'payment' && (
            <div className="checkout-panel">
              <h3>Forma de pagamento</h3>
              <div className="option-list payment-list">
                {paymentMethods.map((method) => (
                  <button key={method.id} className={payment.id === method.id ? 'selected' : ''} onClick={() => setPayment(method)}>
                    <span><strong>{method.name}</strong><small>{method.detail}</small></span>
                    <i>›</i>
                  </button>
                ))}
              </div>
              <div className="payment-note">
                Demo visual: em produção, este botão chamaria o gateway de pagamento por backend seguro e registraria o pedido no banco.
              </div>
              <button className="primary-link full" onClick={() => onFinish({ customer, shipping, payment, total })}>Fazer pedido</button>
            </div>
          )}
        </div>

        <aside className="order-summary">
          <h3>Seu pedido</h3>
          {cart.map((item) => (
            <div className="summary-item" key={item.key}>
              <img src={item.product.image} alt={item.product.name} />
              <div><strong>{item.product.name}</strong><span>{item.color.name} / {item.size} × {item.quantity}</span></div>
              <b>{money(item.product.price * item.quantity)}</b>
            </div>
          ))}
          <div className="coupon-field">Adicionar cupom de desconto</div>
          <div className="summary-row"><span>Subtotal</span><b>{money(subtotal)}</b></div>
          <div className="summary-row"><span>Frete</span><b>{shipping.price === 0 ? 'Grátis' : money(shipping.price)}</b></div>
          <div className="summary-total"><span>Total</span><b>{money(total)}</b></div>
        </aside>
      </div>
    </div>
  );
}

function SuccessModal({ order, onClose }) {
  if (!order) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="success-modal" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Fechar"><Icon name="x" /></button>
        <Logo />
        <p>Pedido simulado criado</p>
        <h2>Obrigado por comprar na use.a.r.t</h2>
        <span>Entrega: {order.shipping.name}</span>
        <span>Pagamento: {order.payment.name}</span>
        <strong>Total: {money(order.total)}</strong>
        <button className="primary-link" onClick={onClose}>Voltar para loja</button>
      </div>
    </div>
  );
}

function AdminModal({ products, setProducts, onClose }) {
  const [logged, setLogged] = useState(false);
  const [password, setPassword] = useState('');
  const [form, setForm] = useState({ name: '', line: '', price: '', installment: '', category: 'Masculino', image: productImages.hybridBrown });
  const [preview, setPreview] = useState(null);

  function addProduct() {
    if (!form.name || !form.price) return;
    const newProduct = {
      id: safeId(),
      name: form.name,
      line: form.line || 'Nova peça',
      price: Number(String(form.price).replace(',', '.')) || 0,
      installment: form.installment || 'Consulte parcelas',
      category: form.category,
      colors: [{ name: 'Branco', value: '#f4f4f1' }, { name: 'Preto', value: '#050505' }],
      sizes: ['PP', 'P', 'M', 'G', 'GG'],
      image: preview || form.image,
      gallery: [preview || form.image],
      description: 'Produto cadastrado no painel administrativo da demo.',
    };
    const next = [...products, newProduct];
    setProducts(next);
    saveProducts(next);
    setForm({ name: '', line: '', price: '', installment: '', category: 'Masculino', image: productImages.hybridBrown });
    setPreview(null);
  }

  function removeProduct(id) {
    const next = products.filter((product) => product.id !== id);
    setProducts(next);
    saveProducts(next);
  }

  function restore() {
    setProducts(defaultProducts);
    saveProducts(defaultProducts);
  }

  function handleUpload(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="admin-modal" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><Icon name="x" /></button>
        {!logged ? (
          <div className="admin-login">
            <h2>Admin demo</h2>
            <p>Área demonstrativa para cadastrar produtos localmente. Senha da demo: useart2026.</p>
            <input type="password" value={password} placeholder="Senha" onChange={(event) => setPassword(event.target.value)} />
            <button className="primary-link" onClick={() => setLogged(password === ADMIN_PASSWORD)}>Entrar</button>
          </div>
        ) : (
          <div className="admin-grid">
            <div className="admin-form">
              <h2>Novo produto</h2>
              <input placeholder="Nome" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              <input placeholder="Linha" value={form.line} onChange={(event) => setForm({ ...form, line: event.target.value })} />
              <input placeholder="Preço" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} />
              <input placeholder="Parcelamento" value={form.installment} onChange={(event) => setForm({ ...form, installment: event.target.value })} />
              <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}><option>Masculino</option><option>Feminino</option><option>Unissex</option><option>Kit</option></select>
              <label className="file-field">Enviar imagem<input type="file" accept="image/*" onChange={(event) => handleUpload(event.target.files?.[0])} /></label>
              {preview && <div className="admin-preview"><img src={preview} alt="Prévia" /></div>}
              <button className="primary-link full" onClick={addProduct}>Adicionar produto</button>
              <button className="secondary-link full" onClick={restore}>Restaurar produtos reais</button>
            </div>
            <div className="admin-list">
              <h2>Produtos</h2>
              {products.map((product) => (
                <div className="admin-item" key={product.id}>
                  <img src={product.image} alt={product.name} />
                  <div><span>{product.name}</span><strong>{money(product.price)}</strong></div>
                  <button onClick={() => removeProduct(product.id)}>Remover</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Footer() {
  const methods = ['Visa', 'Master', 'Amex', 'Diners', 'Aura', 'Elo', 'Hipercard', 'Pix', 'Discover', 'Boleto', 'Mercado Pago'];
  return (
    <footer>
      <div className="footer-top">
        <div><Logo /><strong>use.a.r.t</strong><p>Art | Conforto em movimento</p></div>
        <div className="footer-menu"><a href="#inicio">Início</a><a href="#produtos">Produtos</a><a href="mailto:use.art.contato@gmail.com">Contato</a></div>
        <div><strong>Entre em contato</strong><p>use.art.contato@gmail.com</p><p>Campo Grande - MS</p></div>
      </div>
      <div className="payment-badges">{methods.map((method) => <span key={method}>{method}</span>)}</div>
      <p className="copyright">Copyright ART - 54410257000140 - 2026. Todos os direitos reservados.</p>
    </footer>
  );
}

function App() {
  const [products, setProducts] = useState(loadProducts);
  const [selected, setSelected] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  function addToCart(product, color, size) {
    const key = `${product.id}-${color.name}-${size}`;
    setCart((current) => {
      const found = current.find((item) => item.key === key);
      if (found) return current.map((item) => item.key === key ? { ...item, quantity: item.quantity + 1 } : item);
      return [...current, { key, product, color, size, quantity: 1 }];
    });
    setCartOpen(true);
  }

  function updateQuantity(key, quantity) {
    if (quantity <= 0) return setCart((current) => current.filter((item) => item.key !== key));
    setCart((current) => current.map((item) => item.key === key ? { ...item, quantity } : item));
  }

  function finishOrder(order) {
    setCheckoutOpen(false);
    setCart([]);
    setSuccessOrder(order);
  }

  return (
    <div className="page-shell">
      <Header cartCount={cartCount} onCartClick={() => setCartOpen(true)} onAdminClick={() => setAdminOpen(true)} />
      <Hero products={products} />
      <ProductsSection products={products} onOpen={setSelected} />
      <Footer />
      {selected && <ProductModal product={selected} onClose={() => setSelected(null)} onAddToCart={addToCart} />}
      {cartOpen && <CartDrawer cart={cart} onClose={() => setCartOpen(false)} onRemove={(key) => setCart((current) => current.filter((item) => item.key !== key))} onUpdateQuantity={updateQuantity} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} />}
      {checkoutOpen && <CheckoutModal cart={cart} onClose={() => setCheckoutOpen(false)} onBackToCart={() => { setCheckoutOpen(false); setCartOpen(true); }} onFinish={finishOrder} />}
      {adminOpen && <AdminModal products={products} setProducts={setProducts} onClose={() => setAdminOpen(false)} />}
      {successOrder && <SuccessModal order={successOrder} onClose={() => setSuccessOrder(null)} />}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
