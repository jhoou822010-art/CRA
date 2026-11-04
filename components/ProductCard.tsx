import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types";
export default function ProductCard({ product }: { product: Product }) { return <Link href={`/produto/${product.slug}`} className="card"><Image src={product.image_url} alt={product.title} width={700} height={700} /><div className="card-body">{product.badge&&<span className="badge">{product.badge}</span>}<h3>{product.title}</h3><span className="price">R$ {product.price.toFixed(2).replace('.',',')}</span>{product.compare_at_price&&<span className="old">R$ {product.compare_at_price.toFixed(2).replace('.',',')}</span>}</div></Link>; }
