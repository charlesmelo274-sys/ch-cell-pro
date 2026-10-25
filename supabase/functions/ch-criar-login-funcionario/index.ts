import { createClient } from "npm:@supabase/supabase-js@2";

const url = Deno.env.get("SUPABASE_URL") || "";
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
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
  if (!url || !serviceKey) return reply(503, { error: "Configuração do Supabase incompleta" }, origin);
  if (!isAllowedOrigin(origin)) return reply(403, { error: "Origem não autorizada: " + origin }, origin);

  const bearer = req.headers.get("authorization") || "";
  if (!bearer.startsWith("Bearer ")) return reply(401, { error: "Login necessário" }, origin);

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Validar sessão do administrador que está chamando a função
  const token = bearer.slice(7);
  const { data: identity, error: identityError } = await admin.auth.getUser(token);
  if (identityError || !identity.user) return reply(401, { error: "Sessão inválida ou expirada" }, origin);

  // Verificar se quem está chamando é proprietário da loja
  const { data: loja, error: lojaError } = await admin
    .from("ch_lojas")
    .select("id")
    .eq("proprietario_id", identity.user.id)
    .maybeSingle();

  if (lojaError || !loja) {
    return reply(403, { error: "Somente o administrador da loja pode criar logins de funcionários" }, origin);
  }

  let body: { acesso_id?: string; email?: string; senha_inicial?: string };
  try {
    body = await req.json();
  } catch {
    return reply(400, { error: "Dados da requisição inválidos" }, origin);
  }

  const { acesso_id, email, senha_inicial } = body;
  if (!acesso_id || !email || !senha_inicial) {
    return reply(400, { error: "Parâmetros incompletos (acesso_id, email, senha_inicial são obrigatórios)" }, origin);
  }

  const trimmedEmail = email.trim().toLowerCase();
  if (senha_inicial.length < 12) {
    return reply(400, { error: "A senha inicial deve ter no mínimo 12 caracteres" }, origin);
  }

  // Verificar se o acesso existe e pertence à loja do proprietário
  const { data: acesso, error: acessoError } = await admin
    .from("ch_equipe_acessos")
    .select("id, loja_id, funcionario_id, auth_user_id, ativo")
    .eq("id", acesso_id)
    .eq("loja_id", loja.id)
    .maybeSingle();

  if (acessoError || !acesso) {
    return reply(404, { error: "Registro de acesso não encontrado para esta loja" }, origin);
  }

  if (acesso.auth_user_id) {
    return reply(400, { error: "Este funcionário já possui uma conta de login vinculada" }, origin);
  }

  // Criar o usuário no Supabase Auth com e-mail já confirmado
  const { data: novoUsuario, error: createError } = await admin.auth.admin.createUser({
    email: trimmedEmail,
    password: senha_inicial,
    email_confirm: true,
    user_metadata: {
      funcionario_id: acesso.funcionario_id,
      loja_id: loja.id,
    },
  });

  if (createError || !novoUsuario.user) {
    return reply(400, { error: "Erro ao criar login no Supabase: " + (createError?.message || "falha desconhecida") }, origin);
  }

  // Vincular o auth_user_id ao registro de acesso, mantendo troca obrigatória de senha e conta desativada
  const { error: updateError } = await admin
    .from("ch_equipe_acessos")
    .update({
      auth_user_id: novoUsuario.user.id,
      troca_senha_obrigatoria: true,
      ativo: false,
      atualizado_em: new Date().toISOString(),
    })
    .eq("id", acesso.id);

  if (updateError) {
    console.error("Falha ao vincular auth_user_id ao acesso:", updateError);
    return reply(500, { error: "Login criado, mas houve erro ao vincular ao funcionário: " + updateError.message }, origin);
  }

  return reply(200, {
    sucesso: true,
    mensagem: "Login criado com sucesso! O acesso permanece desativado até a troca de senha no primeiro login.",
  }, origin);
});
