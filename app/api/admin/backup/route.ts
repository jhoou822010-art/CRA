import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { serverSupabase } from "@/lib/supabase-server";
import { isSupabaseConfigured } from "@/lib/config";

export async function GET() {
  try {
    if (!isSupabaseConfigured()) return NextResponse.json({ error: "Configure o Supabase antes de criar um backup." }, { status: 503 });
    const session = await serverSupabase();
    const { data: { user } } = await session.auth.getUser();
    if (!user) return NextResponse.json({ error: "Faça login para criar um backup." }, { status: 401 });
    const { data: profile } = await session.from("perfis").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") return NextResponse.json({ error: "Apenas administradores podem criar backups." }, { status: 403 });
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY não está configurada no servidor." }, { status: 503 });
    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const tables = ["perfis", "categorias", "stores", "produtos", "pedidos", "itens_pedido"] as const;
    const backup: Record<string, unknown> = { exported_at: new Date().toISOString() };
    for (const table of tables) {
      const { data, error } = await admin.from(table).select("*");
      if (error) return NextResponse.json({ error: `Falha ao exportar ${table}: ${error.message}` }, { status: 500 });
      backup[table] = data ?? [];
    }
    const { data: files } = await admin.storage.from("product-media").list("", { limit: 1000 });
    backup.storage = { bucket: "product-media", files: files ?? [] };
    return new NextResponse(JSON.stringify(backup, null, 2), { status: 200, headers: { "Content-Type": "application/json; charset=utf-8", "Content-Disposition": `attachment; filename="compras-rapidas-backup-${new Date().toISOString().slice(0,10)}.json"`, "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Não foi possível criar o backup agora." }, { status: 500 });
  }
}
