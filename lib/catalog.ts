import { serverSupabase } from "@/lib/supabase-server";
import { demoProducts } from "@/lib/demo";
import type { Product } from "@/types";
const configured=()=>Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
export async function getProducts():Promise<Product[]>{if(!configured())return demoProducts;try{const {data,error}=await (await serverSupabase()).from("produtos").select("*,categorias(name,slug),stores(name,logo_url)").eq("is_active",true).order("created_at",{ascending:false});if(error||!data?.length)return demoProducts;return data as Product[]}catch{return demoProducts}}
export async function getProduct(slug:string){return (await getProducts()).find(p=>p.slug===slug)??null}
