import { createClient } from "npm:@supabase/supabase-js@2";

const url = Deno.env.get("SUPABASE_URL") || "";
const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const allowed = Deno.env.get("CH_CELL_ALLOWED_ORIGIN") || "";

function isAllowedOrigin(origin: string | null): boolean {
  if (!allowed || allowed === "*") return true;
  if (!origin) return false;
  const origins = allowed.split(",").map((o) => o.trim());
  return origins.includes(origin);
}

function reply(code: number, body: object, origin: string | null) {
  const allowOrigin = isAllowedOrigin(origin) ? (origin || "*") : "null";
  return new Response(JSON.stringify(body), {
    status: code,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": allowOrigin,
      "Access-Control-Allow-Headers": "authorization,apikey,content-type,x-client-info",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Vary": "Origin",
      "Cache-Control": "no-store",
    },
  });
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    const allowOrigin = isAllowedOrigin(origin) ? (origin || "*") : "null";
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": allowOrigin,
        "Access-Control-Allow-Headers": "authorization,apikey,content-type,x-client-info",
        "Access-Control-Allow-Methods": "POST,OPTIONS",
        "Vary": "Origin",
        "Cache-Control": "no-store",
      },
    });
  }

  if (req.method !== "POST") return reply(405, { error: "Método inválido" }, origin);
  if (!url || !key) return reply(503, { error: "Configuração incompleta" }, origin);
  if (!isAllowedOrigin(origin)) return reply(403, { error: "Origem não autorizada: " + origin }, origin);

  const bearer = req.headers.get("authorization") || "";
  if (!bearer.startsWith("Bearer ")) return reply(401, { error: "Login necessário" }, origin);

  const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: identity, error: identityError } = await admin.auth.getUser(bearer.slice(7));
  if (identityError || !identity.user || !identity.user.email) return reply(401, { error: "Sessão inválida" }, origin);

  const { data: access, error: accessError } = await admin
    .from("ch_equipe_acessos")
    .select("id,ativo,perfil,troca_senha_obrigatoria,auth_user_id")
    .eq("auth_user_id", identity.user.id)
    .maybeSingle();

  if (accessError) return reply(500, { error: "Não foi possível conferir acesso" }, origin);
  if (!access || access.perfil === "administrador" || access.troca_senha_obrigatoria !== true) {
    return reply(403, { error: "Não existe troca inicial pendente para esta conta" }, origin);
  }

  let body: { senha_atual?: unknown; senha_nova?: unknown };
  try {
    body = await req.json();
  } catch {
    return reply(400, { error: "Dados inválidos" }, origin);
  }

  const oldPass = typeof body.senha_atual === "string" ? body.senha_atual : "";
  const newPass = typeof body.senha_nova === "string" ? body.senha_nova : "";
  if (newPass.length < 12 || new TextEncoder().encode(newPass).length > 72 || newPass === oldPass) {
    return reply(400, { error: "Escolha uma senha nova, diferente da inicial, com pelo menos 12 caracteres e até 72 bytes" }, origin);
  }

  const client = createClient(url, Deno.env.get("SUPABASE_ANON_KEY") || "", { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: confirmed, error: passwordError } = await client.auth.signInWithPassword({ email: identity.user.email, password: oldPass });
  if (passwordError || confirmed.user?.id !== identity.user.id) {
    return reply(401, { error: "Senha inicial incorreta" }, origin);
  }

  const { error: updateError } = await admin.auth.admin.updateUserById(identity.user.id, { password: newPass });
  if (updateError) return reply(500, { error: "Não foi possível atualizar a senha" }, origin);

  const { data: updated, error: flagError } = await admin
    .from("ch_equipe_acessos")
    .update({ troca_senha_obrigatoria: false, atualizado_em: new Date().toISOString() })
    .eq("id", access.id)
    .eq("auth_user_id", identity.user.id)
    .eq("troca_senha_obrigatoria", true)
    .select("id")
    .maybeSingle();

  if (flagError || !updated) {
    const { data: retried } = await admin
      .from("ch_equipe_acessos")
      .update({ troca_senha_obrigatoria: false, atualizado_em: new Date().toISOString() })
      .eq("id", access.id)
      .eq("auth_user_id", identity.user.id)
      .eq("troca_senha_obrigatoria", true)
      .select("id")
      .maybeSingle();

    if (!retried) {
      const { data: current } = await admin
        .from("ch_equipe_acessos")
        .select("troca_senha_obrigatoria")
        .eq("id", access.id)
        .maybeSingle();

      if (current?.troca_senha_obrigatoria !== false) {
        return reply(500, { error: "A nova senha foi salva, mas a conclusão do primeiro acesso falhou. Tente novamente." }, origin);
      }
    }
  }

  return reply(200, {
    sucesso: true,
    ativo: access.ativo,
    mensagem: "Senha alterada com sucesso! A conta agora pode ser ativada pelo proprietário.",
  }, origin);
});
