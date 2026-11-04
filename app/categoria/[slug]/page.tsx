import { getProducts } from "@/lib/catalog";
import { Header, Footer } from "@/components/Shell";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const products = (await getProducts()).filter(product => product.categories?.slug === slug);
  if (!products.length) notFound();
  const name = products[0].categories?.name ?? slug;
  return <><Header /><main className="container section"><Link href="/" className="back-link">← Voltar para a vitrine</Link><span className="eyebrow">Categoria</span><h1>{name}</h1><p>Escolhas selecionadas em {name.toLowerCase()}.</p><div className="grid" style={{ marginTop: 24 }}>{products.map(product => <ProductCard key={product.id} product={product} />)}</div></main><Footer /></>;
}
