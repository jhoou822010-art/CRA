import { Header, Footer } from "@/components/Shell";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/catalog";
import Link from "next/link";

export default async function Home(){
  const products=await getProducts();
  const featured=products.filter(p=>p.is_featured);
  const offers=products.filter(p=>p.is_offer);
  const newest=products.filter(p=>p.is_new);
  const categories=Array.from(new Map(products.filter(p=>p.categories).map(p=>[p.categories!.slug,p.categories!])).values());
  return <><Header/><main>
    <section className="hero"><div className="container"><span className="eyebrow">Curadoria sem complicação</span><h1>Boas escolhas, sem perder tempo.</h1><p>Uma seleção inteligente de produtos para deixar sua rotina mais leve — e sua decisão mais segura.</p><Link href="#categorias" className="button light">Explorar categorias</Link></div></section>
    <section className="section" id="categorias"><div className="container"><div className="section-head"><div><span className="eyebrow">Encontre por interesse</span><h2>Categorias</h2></div><span>{categories.length} temas</span></div><div className="category-grid">{categories.map(category=><Link className="category-card" key={category.slug} href={`/categoria/${category.slug}`}><span className="category-icon">✦</span><strong>{category.name}</strong><small>Ver escolhas →</small></Link>)}</div></div></section>
    <section className="section" id="destaques"><div className="container"><div className="section-head"><div><span className="eyebrow">A nossa seleção</span><h2>Destaques da semana</h2></div><span>{products.length} escolhas</span></div><div className="grid">{(featured.length?featured:products).map(p=><ProductCard key={p.id} product={p}/>)}</div></div></section>
    <section className="section offers-section" id="ofertas"><div className="container"><div className="section-head"><div><span className="eyebrow">Preços que merecem atenção</span><h2>Ofertas para aproveitar</h2></div><span className="offer-label">OFERTAS</span></div><div className="grid">{(offers.length?offers:products).map(p=><ProductCard key={p.id} product={p}/>)}</div></div></section>
    {newest.length>0&&<section className="section"><div className="container"><div className="section-head"><div><span className="eyebrow">Chegando agora</span><h2>Novidades</h2></div></div><div className="grid">{newest.map(p=><ProductCard key={p.id} product={p}/>)}</div></div></section>}
  </main><Footer/></>
}
