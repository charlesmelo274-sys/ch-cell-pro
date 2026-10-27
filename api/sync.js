/**
 * Vercel Serverless Function — /api/sync
 * Sincronização em tempo real entre o link online (Vercel), Celular e PC Local (Túnel Cloudflare)
 */

import fs from 'fs';
import path from 'path';

const TUNNEL_URL = 'https://sticky-laboratory-guarantee-newbie.trycloudflare.com/api/sync';

// Cache em memória para instâncias ativas da função serverless
let memorySyncCache = null;

export default async function handler(req, res) {
  // CORS total para permitir requisições de qualquer origem (Vercel, PC, Mobile)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ---------------------------------------------------------------------------
  // POST: Recebe dados salvos pelo usuário (em qualquer aba) e replica para o PC
  // ---------------------------------------------------------------------------
  if (req.method === 'POST') {
    let payload = req.body;
    if (typeof payload === 'string') {
      try { payload = JSON.parse(payload); } catch {}
    }

    if (payload && typeof payload === 'object') {
      memorySyncCache = { ...payload, last_updated: Date.now() };

      // Reenvia assincronamente para o servidor central no PC local via túnel Cloudflare
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        await fetch(TUNNEL_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(memorySyncCache),
          signal: controller.signal
        }).catch(() => {});
        clearTimeout(timeout);
      } catch {}
    }

    return res.status(200).json({ success: true, timestamp: Date.now() });
  }

  // ---------------------------------------------------------------------------
  // GET: Retorna o estado sincronizado
  // ---------------------------------------------------------------------------
  // 1. Tenta buscar direto do servidor central no PC local (database.json atualizado)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    const localRes = await fetch(TUNNEL_URL, {
      signal: controller.signal,
      headers: { 'Cache-Control': 'no-cache' }
    });
    clearTimeout(timeout);
    if (localRes.ok) {
      const data = await localRes.json();
      if (data && typeof data === 'object') {
        memorySyncCache = data;
        return res.status(200).json(data);
      }
    }
  } catch {}

  // 2. Se o túnel estiver momentaneamente indisponível, retorna o cache em memória
  if (memorySyncCache) {
    return res.status(200).json(memorySyncCache);
  }

  // 3. Fallback: Lê database.json empacotado no deploy para manter todos os dados disponíveis
  try {
    const dbPath = path.join(process.cwd(), 'database.json');
    if (fs.existsSync(dbPath)) {
      const fileData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      memorySyncCache = fileData;
      return res.status(200).json(fileData);
    }
  } catch (err) {
    console.warn('Erro ao ler database.json de fallback:', err);
  }

  // 4. Fallback neutro informando disponibilidade
  return res.status(200).json({
    status: 'online',
    message: 'CH Cell Pro Sync Serverless Active',
    last_updated: Date.now()
  });
}
