/**
 * Vercel Serverless Function — /api/sync
 * Sincronização em tempo real entre PC, Celular e Nuvem
 */

import fs from 'fs';
import path from 'path';

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
    .replace(/Ã /g, 'Á')
    .replace(/Ã /g, 'à')
    .replace(/Ã /g, 'à ')
    .replace(/Ã€/g, 'À')
    .replace(/Ã©/g, 'é')
    .replace(/Ã‰/g, 'É')
    .replace(/Ãª/g, 'ê')
    .replace(/ÃŠ/g, 'Ê')
    .replace(/Ã­/g, 'í')
    .replace(/Ã /g, 'Í')
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

// Cache em memória compartilhado durante a vida do container serverless
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
  // POST: Recebe dados salvos pelo usuário (em qualquer aba) e salva no cache
  // ---------------------------------------------------------------------------
  if (req.method === 'POST') {
    let payload = req.body;
    if (typeof payload === 'string') {
      try { payload = JSON.parse(payload); } catch {}
    }

    if (payload && typeof payload === 'object') {
      const cleanPayload = deepSanitize(payload);
      memorySyncCache = {
        ...cleanPayload,
        last_updated: cleanPayload.last_updated || Date.now()
      };

      // Tenta gravar no database.json se ambiente com sistema de arquivos gravável
      try {
        const dbPath = path.join(process.cwd(), 'database.json');
        if (fs.existsSync(dbPath)) {
          fs.writeFileSync(dbPath, JSON.stringify(memorySyncCache, null, 2), 'utf8');
        }
      } catch (err) {}
    }

    return res.status(200).json({ success: true, timestamp: memorySyncCache?.last_updated || Date.now() });
  }

  // ---------------------------------------------------------------------------
  // GET: Retorna o estado sincronizado mais recente
  // ---------------------------------------------------------------------------
  // 1. Se já tiver dados em memória da sessão, retorna imediatamente
  if (memorySyncCache) {
    return res.status(200).json(deepSanitize(memorySyncCache));
  }

  // 2. Se não houver em memória, carrega o database.json padrão empacotado no deploy
  try {
    const dbPath = path.join(process.cwd(), 'database.json');
    if (fs.existsSync(dbPath)) {
      const fileData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      memorySyncCache = deepSanitize(fileData);
      return res.status(200).json(memorySyncCache);
    }
  } catch (err) {
    console.warn('Erro ao ler database.json:', err);
  }

  // 3. Fallback neutro
  return res.status(200).json({
    orders: [],
    products: [],
    fornecedores: [],
    ebooks: [],
    videoaulas: [],
    sales: [],
    clientes: [],
    expenses: [],
    config: {
      storeName: 'CH Cell Assistência Técnica',
      whatsApp: '21987654321',
      address: 'Rua Principal, 120 - Centro',
      warranty: 'Garantia legal de 90 dias.',
      printModel: 'thermal-80'
    },
    funcionarios: [],
    acessos: [],
    estoqueMovimentacoes: [],
    last_updated: Date.now()
  });
}
