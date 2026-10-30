/**
 * Vercel Serverless Function — /api/sync
 * Sincronização em tempo real entre o link online (Vercel), Celular e PC Local (Túnel Cloudflare)
 */

import fs from 'fs';
import path from 'path';

const TUNNEL_URL = 'https://sticky-laboratory-guarantee-newbie.trycloudflare.com/api/sync';

function fixMojibake(str) {
  if (typeof str !== 'string' || !str) return str || '';
  let s = str;
  if (/[\u00C2\u00C3\u00E2]/.test(s)) {
    try {
      const decoded = decodeURIComponent(escape(s));
      if (decoded && !decoded.includes('\uFFFD')) s = decoded;
    } catch (e) {}
  }
  return s
    .replace(/Ã§/g, 'ç')
    .replace(/Ã‡/g, 'Ç')
    .replace(/Ã£/g, 'ã')
    .replace(/Ãƒ/g, 'Ã')
    .replace(/Ã¡/g, 'á')
    .replace(/Ã/g, 'Á')
    .replace(/Ã /g, 'à')
    .replace(/Ã /g, 'à ')
    .replace(/Ã€/g, 'À')
    .replace(/Ã©/g, 'é')
    .replace(/Ã‰/g, 'É')
    .replace(/Ãª/g, 'ê')
    .replace(/ÃŠ/g, 'Ê')
    .replace(/Ã­/g, 'í')
    .replace(/Ã/g, 'Í')
    .replace(/Ã³/g, 'ó')
    .replace(/Ã“/g, 'Ó')
    .replace(/Ãµ/g, 'õ')
    .replace(/Ã•/g, 'Õ')
    .replace(/Ã´/g, 'ô')
    .replace(/Ã”/g, 'Ô')
    .replace(/Ãº/g, 'ú')
    .replace(/Ãš/g, 'Ú')
    .replace(/Ã¢/g, 'â')
    .replace(/Ã‚/g, 'Â')
    .replace(/â€”/g, '—')
    .replace(/â€“/g, '–');
}

function deepSanitize(obj) {
  if (!obj) return obj;
  if (typeof obj === 'string') return fixMojibake(obj);
  if (Array.isArray(obj)) return obj.map(deepSanitize);
  if (typeof obj === 'object') {
    const res = {};
    for (const k of Object.keys(obj)) {
      res[k] = deepSanitize(obj[k]);
    }
    return res;
  }
  return obj;
}

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
      const cleanPayload = deepSanitize(payload);
      memorySyncCache = { ...cleanPayload, last_updated: Date.now() };

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
  // 1. Se já tiver cache atualizado em memória (salvo recentemente por qualquer aba/celular), retorna imediatamente
  if (memorySyncCache) {
    return res.status(200).json(deepSanitize(memorySyncCache));
  }

  // 2. Lê database.json empacotado no deploy para manter todos os dados disponíveis
  try {
    const dbPath = path.join(process.cwd(), 'database.json');
    if (fs.existsSync(dbPath)) {
      const fileData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      memorySyncCache = deepSanitize(fileData);
      return res.status(200).json(memorySyncCache);
    }
  } catch (err) {
    console.warn('Erro ao ler database.json de fallback:', err);
  }

  // 3. Fallback opcional: tenta túnel com timeout ultra-rápido se configurado
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 600);
    const localRes = await fetch(TUNNEL_URL, {
      signal: controller.signal,
      headers: { 'Cache-Control': 'no-cache' }
    });
    clearTimeout(timeout);
    if (localRes.ok) {
      const data = await localRes.json();
      if (data && typeof data === 'object') {
        memorySyncCache = deepSanitize(data);
        return res.status(200).json(memorySyncCache);
      }
    }
  } catch {}

  // 4. Fallback neutro informando disponibilidade
  return res.status(200).json({
    status: 'online',
    message: 'CH Cell Pro Sync Serverless Active',
    last_updated: Date.now()
  });
}
