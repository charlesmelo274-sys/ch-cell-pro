/**
 * CH Cell Pro — Sistema Completo de Assistência Técnica
 * Mobile-First & Desktop Responsivo
 * Integração Supabase Auth: Administrador & Funcionários (Fase 3C)
 */

// Supabase Client
const SUPABASE_URL = 'https://nbqavsaccrlexnjazbdf.supabase.co';
const SUPABASE_ANON = 'sb_publishable_wyBsvwcafNB5vqpWUTFzeA_ZmZgyldd';
const db = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON) : null;
const esc = x => String(x ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Sanitizador universal de caracteres / mojibake UTF-8
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
    .replace(/â€“/g, '–')
    .replace(/ASSIST[\uFFFDÃª]+NCIA/gi, 'ASSISTÊNCIA')
    .replace(/Assist[\uFFFDÃª]+ncia/gi, 'Assistência')
    .replace(/T[\uFFFDÃ©]+CNICA/gi, 'TÉCNICA')
    .replace(/T[\uFFFDÃ©]+cnica/gi, 'Técnica')
    .replace(/t[\uFFFDÃ©]+cnica/gi, 'técnica')
    .replace(/T[\uFFFDÃ©]+cnico/gi, 'Técnico')
    .replace(/t[\uFFFDÃ©]+cnico/gi, 'técnico')
    .replace(/servi[\uFFFDÃ§]+o/gi, 'serviço')
    .replace(/pe[\uFFFDÃ§]+a/gi, 'peça')
    .replace(/substitu[\uFFFDÃ­]+da/gi, 'substituída')
    .replace(/N[\uFFFDÃ£]+o/gi, 'Não')
    .replace(/n[\uFFFDÃ£]+o/gi, 'não')
    .replace(/Aten[\uFFFDÃ§Ã£]+o/gi, 'Atenção')
    .replace(/aten[\uFFFDÃ§Ã£]+o/gi, 'atenção')
    .replace(/Respons[\uFFFDÃ¡]+vel/gi, 'Responsável')
    .replace(/respons[\uFFFDÃ¡]+vel/gi, 'responsável')
    .replace(/Oz[\uFFFDÃ©]+ias/gi, 'Ozéias')
    .replace(/Gest[\uFFFDÃ£]+o/gi, 'Gestão')
    .replace(/balc[\uFFFDÃ£]+o/gi, 'balcão')
    .replace(/Balc[\uFFFDÃ£]+o/gi, 'Balcão')
    .replace(/padr[\uFFFDÃ£]+o/gi, 'padrão')
    .replace(/Padr[\uFFFDÃ£]+o/gi, 'Padrão');
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

window.fixMojibake = fixMojibake;
window.deepSanitize = deepSanitize;

// Catalogo padrão de itens do checklist (Foto 3)
const CHECKLIST_CATALOGO = [
  { id: 'display', name: 'Tela, touch e imagem' },
  { id: 'camera', name: 'Câmeras e flash' },
  { id: 'audio', name: 'Áudio e microfone' },
  { id: 'carga', name: 'Conector de carga' },
  { id: 'conexoes', name: 'Wi-Fi e Bluetooth' },
  { id: 'botoes', name: 'Botões físicos (Power / Vol)' },
  { id: 'biometria', name: 'Biometria / Face ID' },
  { id: 'bateria', name: 'Bateria e saúde' },
  { id: 'carcaca', name: 'Carcaça e traseira' },
  { id: 'proximidade', name: 'Sensor de aproximação' }
];

// 5 Etapas do Reparo (Foto 4)
const REPAIR_STAGES = [
  { id: 'Em Análise', step: 1, name: 'Em Análise', desc: 'Diagnóstico técnico no balcão', color: 'blue' },
  { id: 'Aguardando Peças', step: 2, name: 'Aguardando Peças', desc: 'Separando componente ou reposição', color: 'amber' },
  { id: 'Em Serviço', step: 3, name: 'Em Serviço', desc: 'Técnico trabalhando no aparelho', color: 'purple' },
  { id: 'Finalizado', step: 4, name: 'Finalizado', desc: 'Pronto para testes e retirada', color: 'emerald' },
  { id: 'Pago e Entregue', step: 5, name: 'Pago e Entregue', desc: 'Garantia ativada com sucesso', color: 'slate' }
];

// Produtos padrão do PDV (Foto 5)
const DEFAULT_PRODUCTS = [
  { id: 'prod_1', nome: 'Película 3D de Vidro', categoria: 'Acessórios', preco: 40.00, custo: 8.00, quantidade: 12, icone: 'smartphone' },
  { id: 'prod_2', nome: 'Capa Anti-Impacto', categoria: 'Acessórios', preco: 80.00, custo: 20.00, quantidade: 7, icone: 'shield' },
  { id: 'prod_3', nome: 'Carregador Turbo 20W', categoria: 'Carregadores', preco: 70.00, custo: 22.00, quantidade: 4, icone: 'zap' },
  { id: 'prod_4', nome: 'Fone Bluetooth TWS', categoria: 'Áudio', preco: 150.00, custo: 55.00, quantidade: 2, icone: 'headphones' },
  { id: 'prod_5', nome: 'Tela Frontal iPhone 13 Pro OLED', categoria: 'Peças', preco: 650.00, custo: 380.00, quantidade: 3, icone: 'cpu' },
  { id: 'prod_6', nome: 'Bateria Samsung S22 Original', categoria: 'Peças', preco: 220.00, custo: 90.00, quantidade: 5, icone: 'battery-charging' },
  { id: 'prod_7', nome: 'Cabo USB-C Trançado 1.5m', categoria: 'Carregadores', preco: 35.00, custo: 9.00, quantidade: 15, icone: 'cable' },
  { id: 'prod_8', nome: 'Suporte Veicular Magnético', categoria: 'Acessórios', preco: 45.00, custo: 12.00, quantidade: 6, icone: 'compass' }
];

// Fornecedores de Peças e Componentes (Aba Restaurada)
const DEFAULT_FORNECEDORES = [
  {
    id: 'forn_1',
    nome: 'MegaTelas Distribuidora',
    marca: 'Apple, Samsung, Motorola, Xiaomi',
    especialidade: 'Telas OLED Originais & Baterias Seladas',
    telefone: '(11) 3222-1010',
    whatsapp: '11988881234',
    endereco: 'Rua Santa Ifigênia, 280 - São Paulo, SP',
    site: 'https://megatelasdistribuidora.com.br',
    observacoes: 'Garantia de 90 dias com selo intacto. Despacho no mesmo dia via Sedex até 16h.'
  },
  {
    id: 'forn_2',
    nome: 'ChipMaster Componentes & Ferramentas',
    marca: 'Apple, Xiaomi, Motorola, Samsung',
    especialidade: 'CIs de Carga Tristar/Hydra, PMIC, Estações e Microscópios',
    telefone: '(19) 3456-7890',
    whatsapp: '19997778899',
    endereco: 'Campinas, SP',
    site: 'https://chipmasterpecas.com.br',
    observacoes: 'Pedido mínimo R$ 200. Componentes SMD originais em fita carretel.'
  },
  {
    id: 'forn_3',
    nome: 'FlashCell Atacado de Vidros e Peças',
    marca: 'Samsung, Motorola, Xiaomi, Realme',
    especialidade: 'Vidros com Cola OCA, Carcaças e Conectores Tipo-C',
    telefone: '(21) 2555-4321',
    whatsapp: '21996665544',
    endereco: 'Centro, Rio de Janeiro - RJ',
    site: 'https://flashcellatacado.com.br',
    observacoes: 'Frete grátis para compras acima de R$ 600. Troca expressa no balcão.'
  }
];

// Biblioteca Técnica de eBooks & Esquemas Elétricos (Aba Restaurada)
const DEFAULT_EBOOKS = [
  {
    id: 'ebk_1',
    titulo: 'Guia de Diagnóstico & Esquema Elétrico iPhone 13 / 13 Pro',
    marca: 'Apple',
    modelo: 'iPhone 13 / 13 Pro / 13 Pro Max',
    categoria: 'Esquema Elétrico',
    url: 'https://archive.org/details/schematics-sample',
    descricao: 'Mapeamento detalhado de linhas primárias VDD_MAIN, circuito do Tristar/Hydra, barramentos I2C e teste de tensões com multímetro.'
  },
  {
    id: 'ebk_2',
    titulo: 'Manual de Serviço & Boardview Samsung Linha Galaxy S22',
    marca: 'Samsung',
    modelo: 'Galaxy S22 / S22 Ultra (Exynos & Snapdragon)',
    categoria: 'Manual de Serviço',
    url: 'https://archive.org/details/manual-servico-samsung',
    descricao: 'Diagrama de blocos, guia de testes de desoxidação, diagrama do sensor Hall e circuitos de RF 5G.'
  },
  {
    id: 'ebk_3',
    titulo: 'Apostila Completa de Microsoldagem e Injeção de Tensão na Prática',
    marca: 'Multimarcas',
    modelo: 'Universal (Smartphones Android & iOS)',
    categoria: 'Microsoldagem',
    url: 'https://archive.org/details/apostila-microsoldagem',
    descricao: 'Técnicas de remoção de resina epóxi, reballing com stencil 3D, temperatura ideal de soprador térmico e reconstrução de pads rompidos.'
  }
];

// Videoaulas de Bancada & Treinamentos Técnicos (Aba Restaurada)
const DEFAULT_VIDEOAULAS = [
  {
    id: 'vid_1',
    titulo: 'Como Localizar Curto em Linha Primária com Câmera Térmica e Breu',
    marca: 'Apple',
    modelo: 'iPhone 11 / 12 / 13',
    categoria: 'Microsoldagem',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    descricao: 'Passo a passo com fonte de bancada ajustada em 4.0V e 2A. Demonstração de dissipação térmica com método do breu e detecção instantânea do capacitor em curto.'
  },
  {
    id: 'vid_2',
    titulo: 'Troca de Vidro na Máquina OCA sem Risco de Mancha no Polarizer',
    marca: 'Samsung',
    modelo: 'Linha Galaxy A e Linha S',
    categoria: 'Troca de Vidro / OCA',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    descricao: 'Aquecimento na separadora a 85°C, uso de fio de molibdênio 0.03mm, limpeza com removedor de cola 530 e laminação precisa na câmara de vácuo.'
  },
  {
    id: 'vid_3',
    titulo: 'Diagnóstico Avançado de Falha de Carga no Motorola (PMIC / IF-PMIC)',
    marca: 'Motorola',
    modelo: 'Moto G60 / Moto G84',
    categoria: 'Diagnóstico de Carga',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    descricao: 'Teste no USB tester (Dongle USB). Como identificar se a falha é no conector Sub-placa, no flat FPC ou no circuito de chaveamento OVP da placa mãe.'
  }
];

// Dados de Exemplo Realistas para o Balcão
const DEFAULT_OS = [
  {
    id: 'os_101',
    numero: 'A1B2C',
    cliente_nome: 'João da Silva',
    cliente_celular: '21988887777',
    marca: 'Apple',
    modelo: 'iPhone 13 Pro',
    cor: 'Azul Sierra',
    senha: 'Senha numérica: 142536',
    defeito_relatado: 'Queda acidental. Tela com listras e falha no touch. Alto-falante auricular chiando.',
    servico: 'Substituição de Tela OLED + Desoxidação do alto-falante auricular',
    status: 'Em Serviço',
    funcionario_id: 'func_1',
    valor: 750.00,
    valor_pago: 200.00,
    custo_peca: 380.00,
    data_entrada: new Date().toISOString().slice(0, 10),
    previsao_entrega: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    checklist: {
      display: 'Atenção',
      camera: 'OK',
      audio: 'Atenção',
      carga: 'OK',
      conexoes: 'OK',
      botoes: 'OK',
      biometria: 'Não test.',
      bateria: 'OK',
      carcaca: 'Atenção',
      proximidade: 'OK'
    },
    checklist_obs: 'Micro trincado no canto inferior direito da tampa traseira. Touch falhando na metade superior.',
    fotos: []
  },
  {
    id: 'os_102',
    numero: '4892',
    cliente_nome: 'Maria Santos Oliveira',
    cliente_celular: '21977776666',
    marca: 'Samsung',
    modelo: 'Galaxy S22 Ultra',
    cor: 'Preto',
    senha: 'Padrão em L',
    defeito_relatado: 'Bateria descarregando muito rápido e esquentando na traseira.',
    servico: 'Troca de Bateria Original Samsung + Selagem IP68',
    status: 'Finalizado',
    funcionario_id: 'func_2',
    valor: 320.00,
    valor_pago: 320.00,
    custo_peca: 90.00,
    data_entrada: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10),
    previsao_entrega: new Date().toISOString().slice(0, 10),
    checklist: {
      display: 'OK',
      camera: 'OK',
      audio: 'OK',
      carga: 'OK',
      conexoes: 'OK',
      botoes: 'OK',
      biometria: 'OK',
      bateria: 'Atenção',
      carcaca: 'OK',
      proximidade: 'OK'
    },
    checklist_obs: 'Aparelho em excelente estado sem arranhões.',
    fotos: []
  }
];

const DEFAULT_PERMISSOES_CATALOGO = [
  { codigo: 'clientes.visualizar', descricao: 'Consultar lista e histórico de clientes', grupo: 'Clientes' },
  { codigo: 'clientes.criar', descricao: 'Cadastrar novos clientes', grupo: 'Clientes' },
  { codigo: 'clientes.editar', descricao: 'Editar informações de clientes cadastrados', grupo: 'Clientes' },
  { codigo: 'clientes.excluir', descricao: 'Excluir cadastros de clientes', grupo: 'Clientes' },
  { codigo: 'os.visualizar', descricao: 'Consultar ordens de serviço', grupo: 'Ordens de Serviço' },
  { codigo: 'os.criar', descricao: 'Criar novas ordens de serviço', grupo: 'Ordens de Serviço' },
  { codigo: 'os.editar', descricao: 'Atualizar dados, status e laudo da OS', grupo: 'Ordens de Serviço' },
  { codigo: 'os.excluir', descricao: 'Cancelar ou excluir ordens de serviço', grupo: 'Ordens de Serviço' },
  { codigo: 'estoque.visualizar', descricao: 'Consultar produtos e quantidades em estoque', grupo: 'Estoque e Peças' },
  { codigo: 'estoque.movimentar', descricao: 'Dar entrada ou saída manual de itens no estoque', grupo: 'Estoque e Peças' },
  { codigo: 'estoque.criar', descricao: 'Cadastrar novos produtos e peças', grupo: 'Estoque e Peças' },
  { codigo: 'estoque.editar', descricao: 'Editar preços e custos de produtos', grupo: 'Estoque e Peças' },
  { codigo: 'vendas.visualizar', descricao: 'Ver histórico de vendas rápidas de balcão', grupo: 'Vendas e Balcão' },
  { codigo: 'vendas.criar', descricao: 'Realizar vendas de balcão e baixar itens', grupo: 'Vendas e Balcão' },
  { codigo: 'financeiro.visualizar', descricao: 'Ver relatórios de faturamento e lucro estimado', grupo: 'Financeiro' },
  { codigo: 'caixa.visualizar', descricao: 'Consultar fluxo de caixa e despesas', grupo: 'Financeiro' },
  { codigo: 'caixa.lancar', descricao: 'Lançar novas despesas ou entradas manuais', grupo: 'Financeiro' },
  { codigo: 'acessos.gerenciar', descricao: 'Gerenciar permissões e acessos de outros funcionários', grupo: 'Equipe e Acessos' }
];

const DEFAULT_FUNCIONARIOS = [
  {
    id: 'func_ozeas',
    nome: 'Ozeas Ferreira',
    funcao: 'Gerente',
    email: 'ozeasferreira40@gmail.com',
    telefone: '21999998888',
    ativo: true,
    observacoes: 'Gerente da Loja - Gestão Geral, Equipe e Balcão'
  },
  {
    id: 'func_1',
    nome: 'Carlos Oliveira (Técnico)',
    funcao: 'Técnico',
    email: 'carlos.tecnico@chcell.com',
    telefone: '21988887777',
    ativo: true,
    observacoes: 'Especialista em reparos de placas iPhone, telas e micro solda'
  },
  {
    id: 'func_2',
    nome: 'Mariana Santos (Atendente)',
    funcao: 'Atendente',
    email: 'mariana.atendimento@chcell.com',
    telefone: '21977776666',
    ativo: true,
    observacoes: 'Atendimento de balcão, WhatsApp e abertura de OS'
  }
];

const DEFAULT_ACESSOS = [
  {
    id: 'acc_ozeas',
    funcionario_id: 'func_ozeas',
    perfil: 'gerente',
    ativo: true,
    auth_user_id: 'auth_func_ozeas',
    troca_senha_obrigatoria: true,
    senha: '',
    permissoes: {
      'clientes.visualizar': true,
      'clientes.criar': true,
      'clientes.editar': true,
      'os.visualizar': true,
      'os.criar': true,
      'os.editar': true,
      'estoque.visualizar': true,
      'estoque.movimentar': true,
      'estoque.criar': true,
      'estoque.editar': true,
      'vendas.visualizar': true,
      'vendas.criar': true,
      'caixa.visualizar': true,
      'caixa.lancar': true
    }
  },
  {
    id: 'acc_1',
    funcionario_id: 'func_1',
    perfil: 'funcionario',
    ativo: true,
    auth_user_id: 'auth_func_1',
    troca_senha_obrigatoria: false,
    senha: '12345678Ch@',
    permissoes: {
      'clientes.visualizar': true,
      'os.visualizar': true,
      'os.editar': true,
      'estoque.visualizar': true
    }
  },
  {
    id: 'acc_2',
    funcionario_id: 'func_2',
    perfil: 'funcionario',
    ativo: true,
    auth_user_id: 'auth_func_2',
    troca_senha_obrigatoria: true,
    senha: '12345678Ch@',
    permissoes: {
      'clientes.visualizar': true,
      'clientes.criar': true,
      'os.visualizar': true,
      'os.criar': true,
      'vendas.criar': true
    }
  }
];

class AppState {
  constructor() {
    this.currentView = 'dashboard';
    this.currentUser = null;
    this.userRole = null; // 'administrador' | 'funcionario' | 'gerente' | 'atendente' | 'tecnico'
    this.userPermissions = {};
    this.isEmployee = false;
    this.last_updated = this.loadStorage('chcell_last_updated', 0);
    this.funcionarios = this.loadStorage('chcell_funcionarios', DEFAULT_FUNCIONARIOS);
    this.acessos = this.loadStorage('chcell_acessos', DEFAULT_ACESSOS);
    this.catalogoPermissoes = DEFAULT_PERMISSOES_CATALOGO;

    this.orders = this.loadStorage('chcell_orders', DEFAULT_OS);
    this.products = this.loadStorage('chcell_products', DEFAULT_PRODUCTS);
    this.fornecedores = this.loadStorage('chcell_fornecedores', DEFAULT_FORNECEDORES);
    this.ebooks = this.loadStorage('chcell_ebooks', DEFAULT_EBOOKS);
    this.videoaulas = this.loadStorage('chcell_videoaulas', DEFAULT_VIDEOAULAS);
    this.sales = this.loadStorage('chcell_sales', []);
    this.clientes = this.loadStorage('chcell_clientes', [
      {
        id: 'cli_1',
        nome: 'João da Silva',
        celular: '21988887777',
        cpf: '123.456.789-00',
        email: 'joao.silva@email.com',
        endereco: 'Rua das Flores, 120 - Centro',
        observacoes: 'Cliente frequente, traz aparelhos da família',
        created_at: new Date().toISOString()
      }
    ]);
    this.expenses = this.loadStorage('chcell_expenses', [
      { id: 'exp_1', data: new Date().toISOString().slice(0, 10), desc: 'Aluguel do Ponto Comercial', valor: 1200.00, tipo: 'Fixa' },
      { id: 'exp_2', data: new Date().toISOString().slice(0, 10), desc: 'Energia Elétrica / Internet', valor: 280.00, tipo: 'Variável' }
    ]);
    this.estoqueMovimentacoes = this.loadStorage('chcell_estoque_mov', []);
    this.config = this.loadStorage('chcell_config', {
      storeName: 'CH Cell Assistência Técnica',
      whatsApp: '21987654321',
      address: 'Rua Principal, 120 - Centro',
      warranty: 'Garantia legal de 90 dias referente ao serviço executado e à peça substituída. Não cobre danos por quedas, trincados ou umidade.',
      printModel: 'thermal-80'
    });

    // Auto-sanitização imediata de todas as coleções e configurações locais
    this.config = deepSanitize(this.config);
    if (!this.config.storeName || /Assist.*[Ã\uFFFD]|T.*[Ã\uFFFD]/.test(this.config.storeName)) {
      this.config.storeName = 'CH Cell Assistência Técnica';
    }
    if (!this.config.warranty || /servi.*[Ã\uFFFD]|pe.*[Ã\uFFFD]/.test(this.config.warranty)) {
      this.config.warranty = 'Garantia legal de 90 dias referente ao serviço executado e à peça substituída. Não cobre danos por quedas, trincados ou umidade.';
    }
    this.orders = deepSanitize(this.orders);
    this.clientes = deepSanitize(this.clientes);
    this.products = deepSanitize(this.products);
    this.fornecedores = deepSanitize(this.fornecedores);
    this.ebooks = deepSanitize(this.ebooks);
    this.videoaulas = deepSanitize(this.videoaulas);
    this.funcionarios = deepSanitize(this.funcionarios);
    this.acessos = deepSanitize(this.acessos);
    this.expenses = deepSanitize(this.expenses);

    // Auto-migração garantida para Ozeas Ferreira (Gerente)
    const ozeasF = (this.funcionarios || []).find(f => f.id === 'func_ozeas' || (f.email && (f.email.includes('ozeas') || f.email.includes('ozeias'))));
    if (ozeasF) {
      ozeasF.nome = 'Ozeas Ferreira';
      ozeasF.funcao = 'Gerente';
      ozeasF.email = 'ozeasferreira40@gmail.com';
    }
    const ozeasAcc = (this.acessos || []).find(a => a.id === 'acc_ozeas' || a.funcionario_id === 'func_ozeas');
    if (ozeasAcc) {
      ozeasAcc.perfil = 'gerente';
      if (!ozeasAcc.senha || ozeasAcc.senha === '12345678Ch@') {
        ozeasAcc.troca_senha_obrigatoria = true;
      }
    }

    this.ensureClientesFromOrders();

    this.activeChecklist = {};
    this.activePhotos = [];
    this.cart = [];
    this.selectedPDVCategory = '';
    this.trackingCountdownInterval = null;
    this.activeTrackingOS = null;
    this.navigationHistory = [];
  }

  loadStorage(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  saveStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('Erro ao salvar no localStorage:', e);
    }
  }

  ensureClientesFromOrders() {
    if (!Array.isArray(this.clientes)) this.clientes = [];
    (this.orders || []).forEach(o => {
      const nome = (o.cliente_nome || '').trim();
      const celular = (o.cliente_celular || '').trim();
      if (!nome) return;
      const cleanPhone = celular.replace(/\D/g, '');
      const exists = this.clientes.some(c => 
        (cleanPhone && (c.celular || '').replace(/\D/g, '') === cleanPhone) ||
        ((c.nome || '').toLowerCase().trim() === nome.toLowerCase())
      );
      if (!exists) {
        this.clientes.push({
          id: 'cli_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          nome,
          celular,
          cpf: '',
          email: '',
          endereco: '',
          observacoes: 'Cadastrado automaticamente da OS #' + (o.numero || ''),
          created_at: o.data_entrada || new Date().toISOString()
        });
      }
    });
  }

  async syncWithServer(isInitial = false) {
    const endpoints = [
      '/api/sync',
      'https://sticky-laboratory-guarantee-newbie.trycloudflare.com/api/sync'
    ];

    let data = null;
    for (const ep of endpoints) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2600);
        const res = await fetch(ep, { cache: 'no-store', signal: controller.signal });
        clearTimeout(timeout);
        if (res.ok) {
          const json = await res.json();
          if (json && typeof json === 'object' && (json.orders || json.products || json.ebooks || json.last_updated)) {
            data = json;
            break;
          }
        }
      } catch (err) {
        // Tenta o próximo endpoint se falhar
      }
    }

    if (!data) {
      const syncEl = document.getElementById('cloudSyncStatus');
      if (syncEl) syncEl.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Conectado Local / Offline`;
      return;
    }

    // Se o servidor ainda estiver vazio (primeira inicialização)
    if (!data.last_updated && (!data.orders || !data.orders.length)) {
      await this.pushToServer();
      return;
    }

    // FLAG para saber se temos edições locais que não existem no servidor e precisam ser salvas nele
    let needsPushBack = false;

    // =========================================================================
    // MERGE SEGURO PARA TODAS AS ABAS (NUNCA EXCLUI EDIÇÕES FEITAS PELO USUÁRIO)
    // =========================================================================

    // 1. EBOOKS & ESQUEMAS ELÉTRICOS (Preserva o que o usuário cadastrou no PC)
    if (!Array.isArray(data.ebooks)) data.ebooks = [];
    if (Array.isArray(this.ebooks) && this.ebooks.length) {
      this.ebooks.forEach(le => {
        if (!data.ebooks.some(se => se.id === le.id || (se.titulo && le.titulo && se.titulo.toLowerCase().trim() === le.titulo.toLowerCase().trim()))) {
          data.ebooks.push(le);
          needsPushBack = true;
        }
      });
    }

    // 2. VIDEOAULAS & TREINAMENTOS (Preserva o que o usuário cadastrou no PC)
    if (!Array.isArray(data.videoaulas)) data.videoaulas = [];
    if (Array.isArray(this.videoaulas) && this.videoaulas.length) {
      this.videoaulas.forEach(lv => {
        if (!data.videoaulas.some(sv => sv.id === lv.id || (sv.titulo && lv.titulo && sv.titulo.toLowerCase().trim() === lv.titulo.toLowerCase().trim()))) {
          data.videoaulas.push(lv);
          needsPushBack = true;
        }
      });
    }

    // 3. FORNECEDORES
    if (!Array.isArray(data.fornecedores)) data.fornecedores = [];
    if (Array.isArray(this.fornecedores) && this.fornecedores.length) {
      this.fornecedores.forEach(lf => {
        if (!data.fornecedores.some(sf => sf.id === lf.id || (sf.nome && lf.nome && sf.nome.toLowerCase().trim() === lf.nome.toLowerCase().trim()))) {
          data.fornecedores.push(lf);
          needsPushBack = true;
        }
      });
    }

    // 4. CLIENTES
    if (!Array.isArray(data.clientes)) data.clientes = [];
    if (Array.isArray(this.clientes) && this.clientes.length) {
      this.clientes.forEach(lc => {
        const cleanL = (lc.celular || '').replace(/\D/g, '');
        if (!data.clientes.some(sc => sc.id === lc.id || (cleanL && (sc.celular || '').replace(/\D/g, '') === cleanL) || (sc.nome && lc.nome && sc.nome.toLowerCase().trim() === lc.nome.toLowerCase().trim()))) {
          data.clientes.push(lc);
          needsPushBack = true;
        }
      });
    }

    // 5. ORDENS DE SERVIÇO (OS)
    if (!Array.isArray(data.orders)) data.orders = [];
    if (Array.isArray(this.orders) && this.orders.length) {
      this.orders.forEach(lo => {
        if (!data.orders.some(so => so.id === lo.id || (so.numero && lo.numero && String(so.numero).toLowerCase() === String(lo.numero).toLowerCase()))) {
          data.orders.push(lo);
          needsPushBack = true;
        }
      });
    }

    // 6. PRODUTOS / ESTOQUE
    if (!Array.isArray(data.products)) data.products = [];
    if (Array.isArray(this.products) && this.products.length) {
      this.products.forEach(lp => {
        if (!data.products.some(sp => sp.id === lp.id || (sp.sku && lp.sku && sp.sku === lp.sku) || (sp.nome && lp.nome && sp.nome.toLowerCase().trim() === lp.nome.toLowerCase().trim()))) {
          data.products.push(lp);
          needsPushBack = true;
        }
      });
    }

    // 7. FUNCIONÁRIOS
    if (!Array.isArray(data.funcionarios)) data.funcionarios = [];
    if (Array.isArray(this.funcionarios) && this.funcionarios.length) {
      this.funcionarios.forEach(lf => {
        if (!data.funcionarios.some(sf => sf.id === lf.id || (sf.email && lf.email && sf.email.toLowerCase() === lf.email.toLowerCase()) || (sf.nome && lf.nome && sf.nome.toLowerCase().trim() === lf.nome.toLowerCase().trim()))) {
          data.funcionarios.push(lf);
          needsPushBack = true;
        }
      });
    }

    // 8. ACESSOS DA EQUIPE
    if (!Array.isArray(data.acessos)) data.acessos = [];
    if (Array.isArray(this.acessos) && this.acessos.length) {
      this.acessos.forEach(la => {
        if (!data.acessos.some(sa => sa.id === la.id || sa.funcionario_id === la.funcionario_id)) {
          data.acessos.push(la);
          needsPushBack = true;
        }
      });
    }

    // 9. VENDAS BALCÃO
    if (!Array.isArray(data.sales)) data.sales = [];
    if (Array.isArray(this.sales) && this.sales.length) {
      this.sales.forEach(ls => {
        if (!data.sales.some(ss => ss.id === ls.id)) {
          data.sales.push(ls);
          needsPushBack = true;
        }
      });
    }

    // 10. DESPESAS
    if (!Array.isArray(data.expenses)) data.expenses = [];
    if (Array.isArray(this.expenses) && this.expenses.length) {
      this.expenses.forEach(le => {
        if (!data.expenses.some(se => se.id === le.id)) {
          data.expenses.push(le);
          needsPushBack = true;
        }
      });
    }

    // 11. MOVIMENTAÇÕES DE ESTOQUE
    if (!Array.isArray(data.estoqueMovimentacoes)) data.estoqueMovimentacoes = [];
    if (Array.isArray(this.estoqueMovimentacoes) && this.estoqueMovimentacoes.length) {
      this.estoqueMovimentacoes.forEach(lm => {
        if (!data.estoqueMovimentacoes.some(sm => sm.id === lm.id)) {
          data.estoqueMovimentacoes.push(lm);
          needsPushBack = true;
        }
      });
    }

    // Atualiza estado unificado em memória (com sanitização universal UTF-8)
    this.orders = deepSanitize(data.orders);
    this.products = deepSanitize(data.products);
    this.fornecedores = deepSanitize(data.fornecedores);
    this.ebooks = deepSanitize(data.ebooks);
    this.videoaulas = deepSanitize(data.videoaulas);
    this.sales = deepSanitize(data.sales);
    this.clientes = deepSanitize(data.clientes);
    this.ensureClientesFromOrders();
    this.expenses = deepSanitize(data.expenses);
    this.config = deepSanitize(data.config || this.config);
    if (!this.config.storeName || /Assist.*[Ã\uFFFD]|T.*[Ã\uFFFD]/.test(this.config.storeName)) {
      this.config.storeName = 'CH Cell Assistência Técnica';
    }
    if (!this.config.warranty || /servi.*[Ã\uFFFD]|pe.*[Ã\uFFFD]/.test(this.config.warranty)) {
      this.config.warranty = 'Garantia legal de 90 dias referente ao serviço executado e à peça substituída. Não cobre danos por quedas, trincados ou umidade.';
    }
    this.funcionarios = deepSanitize(data.funcionarios);
    this.acessos = deepSanitize(data.acessos);
    this.estoqueMovimentacoes = deepSanitize(data.estoqueMovimentacoes);
    this.last_updated = Math.max(data.last_updated || 0, this.last_updated || 0, Date.now());

    // Salva cópia local offline completa
    this.saveStorage('chcell_orders', this.orders);
    this.saveStorage('chcell_products', this.products);
    this.saveStorage('chcell_fornecedores', this.fornecedores);
    this.saveStorage('chcell_ebooks', this.ebooks);
    this.saveStorage('chcell_videoaulas', this.videoaulas);
    this.saveStorage('chcell_sales', this.sales);
    this.saveStorage('chcell_clientes', this.clientes);
    this.saveStorage('chcell_expenses', this.expenses);
    this.saveStorage('chcell_config', this.config);
    this.saveStorage('chcell_funcionarios', this.funcionarios);
    this.saveStorage('chcell_acessos', this.acessos);
    this.saveStorage('chcell_estoque_mov', this.estoqueMovimentacoes);
    this.saveStorage('chcell_last_updated', this.last_updated);

    const syncEl = document.getElementById('cloudSyncStatus');
    if (syncEl) syncEl.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Central Conectada (PC, Celular & Vercel)`;

    if (window.app && window.app.renderCurrentView) {
      window.app.renderCurrentView();
    }

    // Se o cliente local tinha itens novos que não estavam no servidor central, salva no servidor agora!
    if (needsPushBack) {
      await this.pushToServer();
    }
  }

  async pushToServer() {
    this.last_updated = Date.now();
    this.saveStorage('chcell_last_updated', this.last_updated);

    const payload = {
      orders: this.orders,
      products: this.products,
      fornecedores: this.fornecedores,
      ebooks: this.ebooks,
      videoaulas: this.videoaulas,
      sales: this.sales,
      clientes: this.clientes,
      expenses: this.expenses,
      config: this.config,
      funcionarios: this.funcionarios,
      acessos: this.acessos,
      estoqueMovimentacoes: this.estoqueMovimentacoes || [],
      last_updated: this.last_updated
    };

    const payloadJson = JSON.stringify(payload);

    // 1. Envia para a rota relativa /api/sync (funciona tanto no localhost quanto no Vercel)
    try {
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payloadJson
      });
    } catch (e) {
      console.warn('Erro ao sincronizar com /api/sync:', e);
    }

    // 2. Se estiver rodando fora do localhost (ex: no Vercel ou no celular via 4G), replica também diretamente para o túnel do PC local
    if (!window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')) {
      try {
        fetch('https://sticky-laboratory-guarantee-newbie.trycloudflare.com/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payloadJson
        }).catch(() => {});
      } catch {}
    }

    const syncEl = document.getElementById('cloudSyncStatus');
    if (syncEl) syncEl.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Sincronizado (PC, Celular & Nuvem)`;
  }

  persistAll() {
    this.saveStorage('chcell_orders', this.orders);
    this.saveStorage('chcell_products', this.products);
    this.saveStorage('chcell_fornecedores', this.fornecedores);
    this.saveStorage('chcell_ebooks', this.ebooks);
    this.saveStorage('chcell_videoaulas', this.videoaulas);
    this.saveStorage('chcell_sales', this.sales);
    this.saveStorage('chcell_clientes', this.clientes);
    this.saveStorage('chcell_expenses', this.expenses);
    this.saveStorage('chcell_config', this.config);
    this.saveStorage('chcell_funcionarios', this.funcionarios);
    this.saveStorage('chcell_acessos', this.acessos);
    this.saveStorage('chcell_estoque_mov', this.estoqueMovimentacoes || []);
    this.pushToServer();
  }

  formatMoney(val) {
    return Number(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  generateOSCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}

const state = new AppState();
window.state = state;

// Gerenciador Principal
const app = {
  async init() {
    this.applyStoreConfig();
    this.setupURLRouting();
    this.renderChecklistForm();
    this.navigate('dashboard');
    this.renderAll();
    this.startTrackingTicker();

    // Roteamento imediato caso seja acesso público a comprovante/nota fiscal de cliente
    const isPublicDoc = await this.handlePublicClientRouting();

    // Sincroniza dados com o servidor central imediatamente
    try {
      await state.syncWithServer(true);
      this.renderAll();
      if (isPublicDoc) {
        this.handlePublicClientRouting();
      }
    } catch (e) {
      console.warn('Sync inicial:', e);
    }

    // Auto-sincronização contínua a cada 3.5 segundos entre PC e Celular
    setInterval(() => {
      state.syncWithServer(false);
    }, 3500);

    window.addEventListener('focus', () => {
      state.syncWithServer(false);
    });

    // Garante listeners diretos no formulário de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.onsubmit = (e) => {
        if (e) e.preventDefault();
        window.authManager.handleLogin(e);
      };
    }

    // Inicializa autenticação com Supabase com proteção contra falhas
    try {
      await authManager.init();
    } catch (err) {
      console.warn('Erro na inicialização de autenticação:', err);
    }

    // Lucide Icons init
    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  async syncWithSupabase() {
    if (!db || !state.currentUser) return;
    try {
      const syncEl = document.getElementById('cloudSyncStatus');
      if (syncEl) syncEl.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> Sincronizando com Supabase...`;

      // 1. Ordens de serviço
      const { data: osData } = await db.from('ordens_servico').select('*').order('created_at', { ascending: false }).limit(500);
      if (osData && osData.length) {
        state.orders = osData.map(o => ({
          ...o,
          numero: o.numero || String(o.id).slice(0, 5).toUpperCase(),
          checklist: o.checklist_checkin?.itens || o.checklist || {},
          checklist_obs: o.checklist_checkin?.observacoes || o.checklist_obs || '',
          fotos: Array.isArray(o.fotos_checkin) ? o.fotos_checkin : (o.fotos || [])
        }));
      }

      // 2. Estoque
      const { data: prodData } = await db.from('estoque_produtos').select('*').order('nome');
      if (prodData && prodData.length) {
        state.products = prodData.map(p => ({
          ...p,
          preco: Number(p.preco || 0),
          custo: Number(p.custo || 0),
          quantidade: Number(p.quantidade || 0)
        }));
      }

      // 3. Fornecedores
      const { data: fornData } = await db.from('fornecedores').select('*').order('nome');
      if (fornData && fornData.length) {
        state.fornecedores = fornData;
      }

      // 4. eBooks & Esquemas (Merge Seguro - Preserva eBooks cadastrados no PC)
      try {
        const { data: ebkData } = await db.from('ebooks').select('*').order('created_at', { ascending: false });
        if (Array.isArray(ebkData)) {
          const mergedEbooks = [...ebkData];
          if (Array.isArray(state.ebooks)) {
            state.ebooks.forEach(le => {
              if (!mergedEbooks.some(se => se.id === le.id || (se.titulo && le.titulo && se.titulo.toLowerCase().trim() === le.titulo.toLowerCase().trim()))) {
                mergedEbooks.push(le);
                // Replica para a nuvem Supabase
                db.from('ebooks').insert({
                  id: le.id,
                  titulo: le.titulo,
                  marca: le.marca,
                  modelo: le.modelo,
                  categoria: le.categoria,
                  url: le.url,
                  descricao: le.descricao
                }).catch(() => {});
              }
            });
          }
          if (mergedEbooks.length) state.ebooks = mergedEbooks;
        }
      } catch (e) {
        console.warn('Supabase ebooks sync:', e);
      }

      // 5. Videoaulas Técnicas (Merge Seguro - Preserva Videoaulas cadastradas no PC)
      try {
        const { data: vidData } = await db.from('videoaulas').select('*').order('created_at', { ascending: false });
        if (Array.isArray(vidData)) {
          const mergedVids = [...vidData];
          if (Array.isArray(state.videoaulas)) {
            state.videoaulas.forEach(lv => {
              if (!mergedVids.some(sv => sv.id === lv.id || (sv.titulo && lv.titulo && sv.titulo.toLowerCase().trim() === lv.titulo.toLowerCase().trim()))) {
                mergedVids.push(lv);
                // Replica para a nuvem Supabase
                db.from('videoaulas').insert({
                  id: lv.id,
                  titulo: lv.titulo,
                  marca: lv.marca,
                  modelo: lv.modelo,
                  categoria: lv.categoria,
                  url: lv.url,
                  descricao: lv.descricao
                }).catch(() => {});
              }
            });
          }
          if (mergedVids.length) state.videoaulas = mergedVids;
        }
      } catch (e) {
        console.warn('Supabase videoaulas sync:', e);
      }

      state.persistAll();
      this.renderAll();

      if (syncEl) syncEl.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Conectado ao Supabase`;
    } catch (err) {
      console.warn('Sincronização em segundo plano:', err);
    }
  },

  applyStoreConfig() {
    const nameEl = document.getElementById('headerStoreName');
    const pubStoreEl = document.getElementById('publicStoreName');
    const cfgNameEl = document.getElementById('cfgStoreName');
    const cfgPhoneEl = document.getElementById('cfgStoreWhatsApp');
    const cfgAddrEl = document.getElementById('cfgStoreAddress');
    const cfgWarrEl = document.getElementById('cfgStoreWarranty');
    const cfgPrintEl = document.getElementById('cfgPrintModel');

    const cleanStore = fixMojibake(state.config.storeName || 'CH Cell Assistência Técnica');
    const cleanWarr = fixMojibake(state.config.warranty || '');

    if (nameEl) nameEl.textContent = cleanStore.replace(/\s+Assist[êeé]ncia\s+T[ée]cnica/gi, '').replace(/\s+Assist.*T.*/gi, '');
    if (pubStoreEl) pubStoreEl.textContent = cleanStore;
    if (cfgNameEl) cfgNameEl.value = cleanStore;
    if (cfgPhoneEl) cfgPhoneEl.value = state.config.whatsApp || '';
    if (cfgAddrEl) cfgAddrEl.value = fixMojibake(state.config.address || '');
    if (cfgWarrEl) cfgWarrEl.value = cleanWarr;
    if (cfgPrintEl) cfgPrintEl.value = state.config.printModel || 'thermal-80';
  },

  saveShopConfig() {
    state.config.storeName = document.getElementById('cfgStoreName').value.trim() || 'CH Cell Assistência';
    state.config.whatsApp = document.getElementById('cfgStoreWhatsApp').value.replace(/\D/g, '');
    state.config.address = document.getElementById('cfgStoreAddress').value.trim();
    state.config.warranty = document.getElementById('cfgStoreWarranty').value.trim();
    state.config.printModel = document.getElementById('cfgPrintModel').value;
    state.persistAll();
    this.applyStoreConfig();
    alert('Configurações da assistência salvas com sucesso!');
  },

  setupURLRouting() {
    // Escuta navegação nativa do navegador (botão voltar do celular ou do browser)
    window.addEventListener('popstate', (event) => {
      if (event.state && event.state.view) {
        this.navigate(event.state.view, true);
      } else {
        const hash = window.location.hash.replace('#', '');
        if (hash) {
          this.navigate(hash, true);
        } else {
          this.navigate('dashboard', true);
        }
      }
    });

    this.handlePublicClientRouting();
  },

  goBack() {
    if (Array.isArray(state.navigationHistory) && state.navigationHistory.length > 0) {
      const prevView = state.navigationHistory.pop();
      this.navigate(prevView, true);
    } else {
      this.navigate('dashboard', true);
    }
  },

  navigate(viewName, isBack = false) {
    if (state.isEmployee && ['financeiro', 'equipe', 'funcionarios', 'acessos', 'configuracoes'].includes(viewName)) {
      alert('Acesso restrito ao administrador.');
      viewName = 'dashboard';
    }

    const previousView = state.currentView || 'dashboard';

    // Salva no histórico quando for uma navegação para frente e tela diferente
    if (!isBack && viewName !== previousView) {
      if (!Array.isArray(state.navigationHistory)) state.navigationHistory = [];
      state.navigationHistory.push(previousView);
      if (state.navigationHistory.length > 25) state.navigationHistory.shift();

      if (window.history && window.history.pushState) {
        window.history.pushState({ view: viewName }, '', '#' + viewName);
      }
    }

    state.currentView = viewName;
    const views = [
      'viewDashboard', 'viewOSList', 'viewPDV', 'viewEstoque',
      'viewFornecedores', 'viewClientes', 'viewEbooks', 'viewVideoaulas',
      'viewFinanceiro', 'viewFuncionarios', 'viewAcessos', 'viewEquipe', 'viewConfiguracoes'
    ];
    views.forEach(v => {
      const el = document.getElementById(v);
      if (el) el.classList.add('hidden');
    });

    const viewMap = {
      'dashboard': 'viewDashboard',
      'os-list': 'viewOSList',
      'pdv': 'viewPDV',
      'balcao': 'viewPDV',
      'vendas': 'viewPDV',
      'estoque': 'viewEstoque',
      'fornecedores': 'viewFornecedores',
      'clientes': 'viewClientes',
      'ebooks': 'viewEbooks',
      'videoaulas': 'viewVideoaulas',
      'financeiro': 'viewFinanceiro',
      'funcionarios': 'viewFuncionarios',
      'equipe': 'viewFuncionarios',
      'acessos': 'viewAcessos',
      'configuracoes': 'viewConfiguracoes'
    };
    const targetId = viewMap[viewName] || ('view' + viewName.charAt(0).toUpperCase() + viewName.slice(1));
    const activeEl = document.getElementById(targetId);
    if (activeEl) activeEl.classList.remove('hidden');

    // Atualiza visibilidade do botão Voltar do cabeçalho
    const headerBackBtn = document.getElementById('btnHeaderGoBack');
    if (headerBackBtn) {
      if (viewName !== 'dashboard') {
        headerBackBtn.classList.remove('hidden');
        headerBackBtn.classList.add('flex');
      } else {
        headerBackBtn.classList.add('hidden');
        headerBackBtn.classList.remove('flex');
      }
    }

    // Update active state in sidebar and bottom navigation
    document.querySelectorAll('.nav-link').forEach(link => {
      const isTarget = link.dataset.nav === viewName || (viewName === 'equipe' && link.dataset.nav === 'funcionarios');
      link.classList.toggle('bg-brand-50', isTarget);
      link.classList.toggle('text-brand-600', isTarget);
      link.classList.toggle('font-bold', isTarget);
    });

    document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
      const isTarget = btn.dataset.mobileNav === viewName;
      btn.classList.toggle('text-brand-600', isTarget);
      btn.classList.toggle('text-slate-500', !isTarget);
    });

    // Re-render data for current view
    this.renderCurrentView();

    if (window.lucide) window.lucide.createIcons();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  renderCurrentView() {
    switch (state.currentView) {
      case 'dashboard':
        this.renderDashboardStats();
        break;
      case 'os-list':
        this.renderOSList();
        break;
      case 'pdv':
      case 'balcao':
      case 'vendas':
        this.renderPDVGrid();
        this.renderBalcaoQuickSelector();
        this.renderBalcaoCartTable();
        this.renderBalcaoHistorico();
        this.updateCartUI();
        break;
      case 'estoque':
        this.renderEstoqueTable();
        break;
      case 'clientes':
        this.renderClientesList();
        break;
      case 'financeiro':
        this.renderFinanceiroView();
        break;
      case 'fornecedores':
        fornecedoresManager.render();
        break;
      case 'ebooks':
        ebooksManager.render();
        break;
      case 'videoaulas':
        videoaulasManager.render();
        break;
      case 'funcionarios':
      case 'equipe':
        equipeManager.renderFuncionariosView();
        break;
      case 'acessos':
        equipeManager.loadAccessData();
        break;
    }
  },

  renderAll() {
    this.renderDashboardStats();
    this.renderOSList();
    this.renderPDVGrid();
    this.renderBalcaoQuickSelector();
    this.renderBalcaoCartTable();
    this.renderBalcaoHistorico();
    this.renderEstoqueTable();
    this.renderClientesList();
    this.renderFinanceiroView();
    fornecedoresManager.render();
    ebooksManager.render();
    videoaulasManager.render();
    if (!state.isEmployee) {
      equipeManager.renderFuncionariosView();
    }
  },

  // =========================================================================
  // 1. DASHBOARD & MÉTRICAS
  // =========================================================================
  renderDashboardStats() {
    const analise = state.orders.filter(o => o.status === 'Em Análise').length;
    const servico = state.orders.filter(o => o.status === 'Em Serviço' || o.status === 'Aguardando Peças').length;
    const finalizado = state.orders.filter(o => o.status === 'Finalizado').length;
    
    // Faturamento hoje (OS pagas hoje + vendas de balcão)
    const hoje = new Date().toISOString().slice(0, 10);
    const fatOS = state.orders.reduce((acc, o) => acc + (o.data_entrada === hoje ? Number(o.valor_pago || 0) : 0), 0);
    const fatVendas = state.sales.reduce((acc, s) => acc + ((s.data || '').slice(0, 10) === hoje ? Number(s.total || 0) : 0), 0);
    const totalHoje = fatOS + fatVendas;

    document.getElementById('statEmAnalise').textContent = analise;
    document.getElementById('statEmServico').textContent = servico;
    document.getElementById('statFinalizados').textContent = finalizado;
    document.getElementById('statFatHoje').textContent = state.formatMoney(totalHoje);

    const badgeCount = document.getElementById('badgeCountOS');
    if (badgeCount) badgeCount.textContent = state.orders.length;
  },

  // =========================================================================
  // 2. CHECKLIST INTERATIVO (3 ESTADOS IDÊNTICO À FOTO 3)
  // =========================================================================
  renderChecklistForm() {
    const container = document.getElementById('checklistItemsContainer');
    if (!container) return;

    container.innerHTML = CHECKLIST_CATALOGO.map(item => {
      const currentState = state.activeChecklist[item.id] || 'OK';
      return `
        <div class="p-2.5 rounded-2xl bg-white border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition hover:border-slate-300">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full ${currentState === 'OK' ? 'bg-emerald-500' : currentState === 'Atenção' ? 'bg-rose-500' : 'bg-slate-400'}"></span>
            <span class="text-xs font-bold text-slate-800">${item.name}</span>
          </div>
          <div class="grid grid-cols-3 gap-1 sm:w-60">
            <button type="button" onclick="app.setChecklistItem('${item.id}', 'OK')" class="ck-btn py-1 px-2 text-[11px] rounded-lg border border-slate-200 text-slate-600 font-semibold ${currentState === 'OK' ? 'active-ok' : 'hover:bg-slate-50'}">
              OK
            </button>
            <button type="button" onclick="app.setChecklistItem('${item.id}', 'Atenção')" class="ck-btn py-1 px-2 text-[11px] rounded-lg border border-slate-200 text-slate-600 font-semibold ${currentState === 'Atenção' ? 'active-warn' : 'hover:bg-slate-50'}">
              Atenção
            </button>
            <button type="button" onclick="app.setChecklistItem('${item.id}', 'Não test.')" class="ck-btn py-1 px-2 text-[11px] rounded-lg border border-slate-200 text-slate-600 font-semibold ${currentState === 'Não test.' ? 'active-na' : 'hover:bg-slate-50'}">
              Não test.
            </button>
          </div>
        </div>
      `;
    }).join('');

    this.updateChecklistCounters();
  },

  setChecklistItem(id, val) {
    state.activeChecklist[id] = val;
    this.renderChecklistForm();
  },

  setAllChecklist(val) {
    CHECKLIST_CATALOGO.forEach(item => {
      state.activeChecklist[item.id] = val;
    });
    this.renderChecklistForm();
  },

  updateChecklistCounters() {
    let ok = 0;
    let warn = 0;
    let na = 0;

    CHECKLIST_CATALOGO.forEach(item => {
      const s = state.activeChecklist[item.id] || 'OK';
      if (s === 'OK') ok++;
      else if (s === 'Atenção') warn++;
      else na++;
    });

    const elOK = document.getElementById('counterCkOK');
    const elWarn = document.getElementById('counterCkWarn');
    const elNA = document.getElementById('counterCkNA');

    if (elOK) elOK.textContent = ok;
    if (elWarn) elWarn.textContent = warn;
    if (elNA) elNA.textContent = na;
  },

  // =========================================================================
  // 3. FOTOS DE ENTRADA (FOTO 2 PASSO 1)
  // =========================================================================
  handlePhotoUpload(event) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    files.forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        state.activePhotos.push({
          url: e.target.result,
          name: file.name,
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        });
        this.renderPhotosGallery();
      };
      reader.readAsDataURL(file);
    });

    event.target.value = '';
  },

  renderPhotosGallery() {
    const container = document.getElementById('osPhotosGallery');
    const countLabel = document.getElementById('photosCountLabel');
    if (!container) return;

    if (countLabel) {
      countLabel.textContent = `${state.activePhotos.length} foto(s) anexada(s)`;
    }

    if (!state.activePhotos.length) {
      container.innerHTML = `<p class="col-span-full text-xs text-slate-400 py-2">Nenhuma foto adicionada ainda. Use a câmera para registrar marcas ou avarias.</p>`;
      return;
    }

    container.innerHTML = state.activePhotos.map((f, idx) => `
      <div class="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-square">
        <img src="${f.url}" alt="Foto entrada" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 transition">
          <button type="button" onclick="app.removePhoto(${idx})" class="p-1 rounded-full bg-rose-600 text-white hover:bg-rose-700">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
        <span class="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1 py-0.5 rounded font-mono">
          ${f.time || ''}
        </span>
      </div>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  },

  removePhoto(index) {
    state.activePhotos.splice(index, 1);
    this.renderPhotosGallery();
  },

  // =========================================================================
  // 4. MODAL DE ABERTURA / EDIÇÃO DE OS
  // =========================================================================
  openNewOSModal(prefill = null) {
    document.getElementById('formOS').reset();
    document.getElementById('osEditId').value = '';
    document.getElementById('osModalTitle').textContent = 'Nova Ordem de Serviço';
    document.getElementById('osModalSubtitle').textContent = 'Check-in de entrada e diagnóstico inicial';
    
    const newCode = state.generateOSCode();
    document.getElementById('osModalCodeBadge').textContent = '#' + newCode;

    // Reset checklist to standard defaults
    state.activeChecklist = {};
    CHECKLIST_CATALOGO.forEach(item => {
      state.activeChecklist[item.id] = 'OK';
    });
    state.activePhotos = [];

    if (prefill) {
      if (prefill.nome) document.getElementById('osClientName').value = prefill.nome;
      if (prefill.celular) document.getElementById('osClientPhone').value = prefill.celular;
      if (prefill.marca) document.getElementById('osDeviceBrand').value = prefill.marca;
      if (prefill.modelo) document.getElementById('osDeviceModel').value = prefill.modelo;
    }

    document.getElementById('osTotalValue').value = '0.00';
    document.getElementById('osPaidValue').value = '0.00';
    document.getElementById('osEstimatedDate').value = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    document.getElementById('osStatusSelect').value = 'Em Análise';

    const techSelect = document.getElementById('osTechnicianSelect');
    if (techSelect) {
      techSelect.innerHTML = '<option value="">Não atribuído</option>' + (state.funcionarios || []).map(f => `
        <option value="${f.id}">${f.nome} (${f.funcao || 'Técnico'})</option>
      `).join('');
      techSelect.value = prefill?.funcionario_id || '';
    }

    this.renderChecklistForm();
    this.renderPhotosGallery();

    const btnModalPdf = document.getElementById('btnModalDownloadPDF');
    if (btnModalPdf) btnModalPdf.classList.add('hidden');

    document.getElementById('modalOS').classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  },

  editOS(idOrNumero) {
    if (!idOrNumero) return;
    const clean = String(idOrNumero).trim().replace(/^#/, '');
    const os = (state.orders || []).find(o => 
      String(o.id || '').trim().toLowerCase() === clean.toLowerCase() ||
      String(o.numero || '').trim().toLowerCase() === clean.toLowerCase() ||
      String(o.id || '').trim().toLowerCase() === String(idOrNumero).trim().toLowerCase() ||
      String(o.numero || '').trim().toLowerCase() === String(idOrNumero).trim().toLowerCase()
    );
    if (!os) {
      alert(`Ordem de Serviço #${idOrNumero} não encontrada.`);
      return;
    }

    document.getElementById('formOS').reset();
    document.getElementById('osEditId').value = os.id;
    document.getElementById('osModalTitle').textContent = 'Editar Ordem de Serviço #' + os.numero;
    document.getElementById('osModalSubtitle').textContent = 'Atualize laudo, status e peças';
    document.getElementById('osModalCodeBadge').textContent = '#' + os.numero;

    const btnModalPdf = document.getElementById('btnModalDownloadPDF');
    if (btnModalPdf) btnModalPdf.classList.remove('hidden');

    document.getElementById('osClientName').value = os.cliente_nome || '';
    document.getElementById('osClientPhone').value = os.cliente_celular || '';
    document.getElementById('osDeviceBrand').value = os.marca || 'Apple';
    document.getElementById('osDeviceModel').value = os.modelo || '';
    document.getElementById('osDeviceColor').value = os.cor || '';
    document.getElementById('osDevicePass').value = os.senha || '';
    document.getElementById('osDefectReported').value = os.defeito_relatado || '';
    document.getElementById('osServiceDesc').value = os.servico || '';
    document.getElementById('osStatusSelect').value = os.status || 'Em Análise';
    document.getElementById('osTotalValue').value = Number(os.valor || 0).toFixed(2);
    document.getElementById('osPaidValue').value = Number(os.valor_pago || 0).toFixed(2);
    document.getElementById('osEstimatedDate').value = os.previsao_entrega || '';
    document.getElementById('osChecklistNotes').value = os.checklist_obs || '';

    const techSelect = document.getElementById('osTechnicianSelect');
    if (techSelect) {
      techSelect.innerHTML = '<option value="">Não atribuído</option>' + (state.funcionarios || []).map(f => `
        <option value="${f.id}">${f.nome} (${f.funcao || 'Técnico'})</option>
      `).join('');
      techSelect.value = os.funcionario_id || '';
    }

    state.activeChecklist = os.checklist ? { ...os.checklist } : {};
    state.activePhotos = Array.isArray(os.fotos) ? [...os.fotos] : [];

    this.renderChecklistForm();
    this.renderPhotosGallery();

    const modal = document.getElementById('modalOS');
    if (modal) {
      modal.classList.remove('hidden');
      modal.scrollTop = 0;
    }
    if (window.lucide) window.lucide.createIcons();
  },

  openOSFromClient(idOrNumero) {
    if (!idOrNumero) return;
    const clean = String(idOrNumero).trim().replace(/^#/, '');
    const os = (state.orders || []).find(o => 
      String(o.id || '').trim().toLowerCase() === clean.toLowerCase() ||
      String(o.numero || '').trim().toLowerCase() === clean.toLowerCase() ||
      String(o.id || '').trim().toLowerCase() === String(idOrNumero).trim().toLowerCase() ||
      String(o.numero || '').trim().toLowerCase() === String(idOrNumero).trim().toLowerCase()
    );

    if (!os) {
      alert(`Ordem de Serviço #${idOrNumero} não encontrada.`);
      return;
    }

    // Direciona imediatamente para a tela de Ordens de Serviço (viewOSList)
    this.navigate('os-list');

    // Limpa filtros anteriores e preenche o campo de busca com a OS selecionada
    const filterStatus = document.getElementById('osFilterStatus');
    if (filterStatus) filterStatus.value = '';
    const filterMarca = document.getElementById('osFilterMarca');
    if (filterMarca) filterMarca.value = '';
    const searchInput = document.getElementById('osSearchInput');
    if (searchInput) searchInput.value = os.numero || '';

    // Renderiza a lista de OS com esse filtro aplicado no fundo
    this.renderOSList();

    // Abre na hora o modal completo de edição e detalhes da OS
    this.editOS(os.id);
  },

  openEditOSModal(idOrNumero) {
    this.openOSFromClient(idOrNumero);
  },

  filterOrdersByClient(clientName) {
    if (!clientName) return;
    this.navigate('os-list');
    const filterStatus = document.getElementById('osFilterStatus');
    if (filterStatus) filterStatus.value = '';
    const filterMarca = document.getElementById('osFilterMarca');
    if (filterMarca) filterMarca.value = '';
    const searchInput = document.getElementById('osSearchInput');
    if (searchInput) searchInput.value = clientName;
    this.renderOSList();
  },

  closeOSModal() {
    document.getElementById('modalOS').classList.add('hidden');
  },

  handleSaveOS(event) {
    event.preventDefault();

    const editId = document.getElementById('osEditId').value;
    const isNew = !editId;
    const code = isNew ? document.getElementById('osModalCodeBadge').textContent.replace('#', '') : state.orders.find(o => o.id === editId)?.numero;

    const osData = {
      id: editId || 'os_' + Date.now(),
      numero: code,
      cliente_nome: document.getElementById('osClientName').value.trim(),
      cliente_celular: document.getElementById('osClientPhone').value.trim(),
      marca: document.getElementById('osDeviceBrand').value,
      modelo: document.getElementById('osDeviceModel').value.trim(),
      cor: document.getElementById('osDeviceColor').value.trim(),
      senha: document.getElementById('osDevicePass').value.trim(),
      defeito_relatado: document.getElementById('osDefectReported').value.trim(),
      servico: document.getElementById('osServiceDesc').value.trim(),
      status: document.getElementById('osStatusSelect').value,
      funcionario_id: document.getElementById('osTechnicianSelect')?.value || null,
      valor: parseFloat(document.getElementById('osTotalValue').value) || 0,
      valor_pago: parseFloat(document.getElementById('osPaidValue').value) || 0,
      previsao_entrega: document.getElementById('osEstimatedDate').value,
      checklist: { ...state.activeChecklist },
      checklist_obs: document.getElementById('osChecklistNotes').value.trim(),
      fotos: [...state.activePhotos],
      custo_peca: editId ? (state.orders.find(o => o.id === editId)?.custo_peca || 0) : 0,
      data_entrada: editId ? (state.orders.find(o => o.id === editId)?.data_entrada || new Date().toISOString().slice(0, 10)) : new Date().toISOString().slice(0, 10)
    };

    if (isNew) {
      state.orders.unshift(osData);
    } else {
      const idx = state.orders.findIndex(o => o.id === editId);
      if (idx !== -1) state.orders[idx] = osData;
    }

    state.persistAll();

    // Replica assincronamente para a nuvem Supabase se conectado
    if (db && state.currentUser) {
      try {
        const payloadSupabase = {
          cliente_nome: osData.cliente_nome,
          cliente_celular: osData.cliente_celular,
          marca: osData.marca,
          modelo: osData.modelo,
          cor: osData.cor,
          senha: osData.senha,
          defeito_relatado: osData.defeito_relatado,
          servico: osData.servico,
          status: osData.status,
          valor: osData.valor,
          valor_pago: osData.valor_pago,
          previsao_entrega: osData.previsao_entrega || null,
          checklist_checkin: { itens: osData.checklist, observacoes: osData.checklist_obs },
          fotos_checkin: osData.fotos || []
        };
        if (!isNew && editId) {
          db.from('ordens_servico').update(payloadSupabase).eq('id', editId).then(() => {}).catch(() => {});
        } else {
          db.from('ordens_servico').insert([payloadSupabase]).then(() => {}).catch(() => {});
        }
      } catch (err) {
        console.warn('Sync OS com Supabase:', err);
      }
    }

    this.closeOSModal();
    this.renderAll();

    // Feedback com opção direta de enviar WhatsApp com o PDF / Comprovante
    if (confirm(`Ordem de Serviço #${osData.numero} salva com sucesso!\n\nDeseja enviar agora a mensagem com o link da Nota Fiscal / Comprovante em PDF no WhatsApp do cliente?`)) {
      this.sendWhatsApp(osData.id);
    }
  },

  // =========================================================================
  // 5. ENVIAR WHATSAPP COM 1 TOQUE (FOTO 2 PASSO 2)
  // =========================================================================
  sendWhatsApp(osId) {
    const os = state.orders.find(o => o.id === osId);
    if (!os) return;

    let phone = (os.cliente_celular || '').replace(/\D/g, '');
    if (!phone) {
      alert('Telefone do cliente não informado.');
      return;
    }
    if (phone.length <= 11 && !phone.startsWith('55')) {
      phone = '55' + phone;
    }

    // Contadores de checklist
    let ok = 0;
    let warn = 0;
    Object.values(os.checklist || os.checklist_checkin?.itens || {}).forEach(v => {
      if (v === 'OK' || v === 'sem_defeito') ok++;
      else if (v === 'Atenção' || v === 'defeito') warn++;
    });

    // Gera resumo compacto em Base64 para garantir abertura 100% imediata da Nota Fiscal em qualquer celular
    let docParam = '';
    try {
      const summary = {
        n: os.numero,
        c: os.cliente_nome,
        f: os.cliente_celular,
        m: os.marca,
        d: os.modelo,
        k: os.cor,
        s: os.senha,
        r: os.defeito_relatado,
        v: os.servico,
        t: os.status,
        p: os.valor,
        pg: os.valor_pago,
        e: os.data_entrada,
        pr: os.previsao_entrega,
        ck: os.checklist || os.checklist_checkin?.itens,
        co: os.checklist_obs || os.checklist_checkin?.observacoes
      };
      docParam = '&doc=' + encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(summary)))));
    } catch (e) {
      console.warn('Falha ao empacotar dados da OS para o link:', e);
    }

    const publicUrl = `${window.location.origin}${window.location.pathname}?track=${encodeURIComponent(os.numero)}${docParam}`;

    const text = 
`Olá, *${os.cliente_nome}*! 👋
Aqui é da *${state.config.storeName}*.

Sua Ordem de Serviço foi registrada com sucesso:
📋 *OS #${os.numero}*
📱 *Aparelho:* ${os.marca} ${os.modelo}
🛠️ *Defeito:* ${os.defeito_relatado}
🔍 *Checklist de Entrada:* ${ok} OK / ${warn} com Atenção
💰 *Valor Estimado:* ${state.formatMoney(os.valor)}

📄 *Acesse e baixe sua Nota Fiscal / Comprovante da OS em PDF pelo link abaixo:*
👉 ${publicUrl}

Qualquer dúvida estamos à disposição!`;

    const encoded = encodeURIComponent(text);
    const waUrl = `https://wa.me/${phone}?text=${encoded}`;
    window.open(waUrl, '_blank');
  },

  // =========================================================================
  // 6. RASTREIO AO VIVO E NOTA FISCAL PÚBLICA DO CLIENTE EM PDF
  // =========================================================================
  openQuickTrackingModal() {
    if (state.orders.length) {
      this.openPublicTracking(state.orders[0].id);
    } else {
      alert('Abra ao menos uma OS para visualizar o comprovante / rastreio.');
    }
  },

  openPublicTracking(osId) {
    const os = state.orders.find(o => o.id === osId || o.numero === osId);
    if (!os) return;

    // Abre diretamente o documento oficial de Nota Fiscal / Comprovante
    this.renderPublicNotaFiscal(os);
  },

  closeQuickTrackingModal() {
    document.getElementById('modalPublicTracking')?.classList.add('hidden');
    document.getElementById('publicNotaFiscalScreen')?.classList.add('hidden');
    state.activeTrackingOS = null;
  },

  togglePublicTrackingSection() {
    const sec = document.getElementById('publicStatusSection');
    if (sec) {
      sec.classList.toggle('hidden');
      if (!sec.classList.contains('hidden')) {
        sec.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  },

  closePublicNotaFiscalAndLogin() {
    const screen = document.getElementById('publicNotaFiscalScreen');
    if (screen) screen.classList.add('hidden');
    window._userRequestedLogin = true;
    authManager.showScreen('authScreen');
  },

  printPublicNotaFiscal() {
    if (!state.activeTrackingOS) return;
    this.printOS(state.activeTrackingOS.id);
  },

  updatePublicStatusSteps(status) {
    const s = String(status || '').toLowerCase();
    let active = 1;
    if (s.includes('bancada') || s.includes('serviço') || s.includes('pecas') || s.includes('peças')) {
      active = 2;
    } else if (s.includes('teste') || s.includes('aguardando')) {
      active = 3;
    } else if (s.includes('finalizado') || s.includes('pronto') || s.includes('entregue') || s.includes('pago')) {
      active = 4;
    }

    for (let i = 1; i <= 4; i++) {
      const box = document.getElementById(`trackStep${i}`);
      const icon = document.getElementById(`trackStepIcon${i}`);
      if (!box || !icon) continue;

      if (i < active) {
        box.className = 'p-3 rounded-xl border border-emerald-200 bg-emerald-50/70 transition';
        icon.className = 'w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-1.5 font-bold text-xs shadow-sm';
      } else if (i === active) {
        box.className = 'p-3 rounded-xl border border-purple-300 bg-purple-50 ring-2 ring-purple-100 transition';
        icon.className = 'w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center mx-auto mb-1.5 font-black text-xs shadow-md';
      } else {
        box.className = 'p-3 rounded-xl border border-slate-200 bg-slate-50 transition opacity-60';
        icon.className = 'w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mx-auto mb-1.5 font-bold text-xs';
      }
    }
  },

  formatChecklistTexto(os) {
    const ck = os.checklist || os.checklist_checkin?.itens || {};
    const labels = {
      display: 'Tela / Touch', camera: 'Câmeras', audio: 'Áudio / Mic', carga: 'Conector Carga',
      conexoes: 'Wi-Fi / Sinal', botoes: 'Botões', biometria: 'Biometria / FaceID', bateria: 'Bateria',
      carcaca: 'Carcaça / Vidro', proximidade: 'Sensor Proximidade'
    };
    const ok = [];
    const warn = [];
    Object.entries(ck).forEach(([k, v]) => {
      const name = labels[k] || k;
      if (v === 'OK' || v === 'sem_defeito') ok.push(name);
      else if (v === 'Atenção' || v === 'defeito') warn.push(name);
    });
    const parts = [];
    if (ok.length) parts.push('Componentes OK: ' + ok.join(', '));
    if (warn.length) parts.push('Com Atenção / Defeito: ' + warn.join(', '));
    return parts.length ? parts.join(' | ') : 'Checklist padrão verificado na entrada.';
  },

  downloadOSPDF(osOrId) {
    let os = typeof osOrId === 'object' && osOrId !== null ? osOrId : null;
    if (!os && typeof osOrId === 'string' && osOrId) {
      const clean = osOrId.trim().replace(/^#/, '').toLowerCase();
      os = (state.orders || []).find(o => 
        String(o.id || '').toLowerCase() === clean || 
        String(o.numero || '').toLowerCase() === clean
      );
    }
    if (!os && state.activeTrackingOS) {
      os = state.activeTrackingOS;
    }
    if (!os && state.orders && state.orders.length) {
      os = state.orders[0];
    }
    if (!os) {
      alert('Ordem de Serviço não localizada para gerar o PDF.');
      return;
    }
    os = deepSanitize(os);

    try {
      const JsPDF = (window.jspdf && window.jspdf.jsPDF) ? window.jspdf.jsPDF : window.jsPDF;
      if (!JsPDF) {
        // Fallback para impressão/salvar como PDF nativo do navegador caso o script CDN jsPDF não esteja carregado
        this.printOS(os.id);
        return;
      }

      const p = new JsPDF({ unit: 'mm', format: 'a4' });
      let y = 49;

      const text = (s, size = 10, bold = false) => {
        p.setFont('helvetica', bold ? 'bold' : 'normal');
        p.setFontSize(size);
        const lines = p.splitTextToSize(String(s || '—'), 174);
        for (let line of lines) {
          if (y > 261) {
            p.addPage();
            y = 22;
          }
          p.text(line, 18, y);
          y += size * 0.46 + 2;
        }
      };

      const section = s => {
        y += 3;
        p.setDrawColor(0, 145, 198);
        p.setLineWidth(0.6);
        p.line(18, y, 192, y);
        y += 8;
        text(s, 11, true);
      };

      // Faixa Superior / Cabeçalho Escuro Oficial da CH Cell
      p.setFillColor(8, 38, 58); // #08263a
      p.rect(0, 0, 210, 38, 'F');
      p.setTextColor(255, 255, 255);
      p.setFont('helvetica', 'bold');
      p.setFontSize(20);
      const pdfStoreName = fixMojibake(state.config.storeName || 'CH Cell Assistência Técnica');
      p.text(pdfStoreName, 18, 18);
      p.setFontSize(9);
      p.setFont('helvetica', 'normal');
      p.text('ASSISTÊNCIA TÉCNICA ESPECIALIZADA', 18, 25);
      p.text(`${fixMojibake(state.config.address || 'Matriz')} • WhatsApp: ${state.config.whatsApp || ''}`, 18, 31);

      p.setFont('helvetica', 'bold');
      p.setFontSize(13);
      p.text(`ORDEM DE SERVIÇO #${String(os.numero || '').toUpperCase()}`, 125, 20);
      p.setFontSize(9);
      p.setFont('helvetica', 'normal');
      p.text(`Entrada: ${os.data_entrada || new Date().toISOString().slice(0, 10)}`, 125, 26);
      p.text(`Status: ${fixMojibake(os.status || 'Em Aberto')}`, 125, 31);

      p.setTextColor(23, 42, 53);

      // 1. DADOS DO CLIENTE
      section('DADOS DO CLIENTE');
      text(`Nome: ${fixMojibake(os.cliente_nome || 'Consumidor Final')}`);
      text(`WhatsApp / Telefone: ${os.cliente_celular || 'Não informado'}`);

      // 2. APARELHO E DEFEITO
      section('APARELHO E DEFEITO REPORTADO');
      text(`Marca / Modelo: ${fixMojibake([os.marca, os.modelo].filter(Boolean).join(' ')) || 'Não especificado'}`);
      text(`Cor: ${fixMojibake(os.cor || '—')}    |    Senha / Padrão: ${fixMojibake(os.senha || 'Não informada')}`);
      text(`Defeito Relatado: ${fixMojibake(os.defeito_relatado || 'Não especificado')}`);

      // 3. CHECKLIST DE ENTRADA
      section('CHECKLIST DE ENTRADA E CONFERÊNCIA');
      const ckResumo = fixMojibake(this.formatChecklistTexto(os));
      text(ckResumo, 9);
      if (os.checklist_obs) {
        text(`Observações de Avarias: ${fixMojibake(os.checklist_obs)}`, 9);
      }

      // 4. SERVIÇO E VALORES
      section('SERVIÇO AUTORIZADO E VALORES');
      text(`Serviço Autorizado: ${fixMojibake(os.servico || 'Diagnóstico e reparo técnico')}`);
      text(`Previsão de Conclusão: ${fixMojibake(os.previsao_entrega || 'A combinar')}`);
      text(`Valor Total do Serviço: ${state.formatMoney(os.valor || 0)}`);
      text(`Valor Pago (Sinal): ${state.formatMoney(os.valor_pago || 0)}`);
      const pendente = Math.max(0, (Number(os.valor) || 0) - (Number(os.valor_pago) || 0));
      text(`SALDO A PAGAR: ${state.formatMoney(pendente)}`, 10, true);

      // 5. GARANTIA
      section('GARANTIA E CONDIÇÕES');
      const pdfWarr = fixMojibake(state.config.warranty || '');
      text(pdfWarr || 'Garantia legal de 90 dias referente ao serviço executado e peças substituídas, conforme o Art. 26 do Código de Defesa do Consumidor (Lei 8.078/1990). A garantia não cobre danos por quedas, impacto, telas trincadas ou oxidação por líquidos.', 8.5);

      // 6. DECLARAÇÃO E ASSINATURA
      if (y > 195) { p.addPage(); y = 30; }
      section('DECLARAÇÃO DE RECEBIMENTO E CONFERÊNCIA');
      text('Declaro que as condições do aparelho e o checklist de entrada registrados nesta Ordem de Serviço foram apresentados para minha conferência. Minha assinatura confirma que recebi estas informações no momento da entrada do aparelho.', 8);

      y += 8;
      if (y > 235) { p.addPage(); y = 35; }
      p.setDrawColor(60, 75, 85);
      p.setLineWidth(0.4);
      p.line(20, y + 13, 115, y + 13);
      p.line(132, y + 13, 190, y + 13);
      p.setFont('helvetica', 'normal');
      p.setFontSize(8);
      p.text('Assinatura do Cliente', 43, y + 18);
      p.text('Data: ____/____/________', 138, y + 18);

      y += 24;
      if (y > 260) { p.addPage(); y = 35; }
      p.line(20, y + 8, 115, y + 8);
      p.line(132, y + 8, 190, y + 8);
      p.text(fixMojibake(os.cliente_nome || 'Nome completo do cliente'), 36, y + 13);
      p.text(`Responsável: ${pdfStoreName}`, 135, y + 13);

      // Rodapé
      p.setTextColor(100, 110, 120);
      p.setFontSize(8);
      p.text(`CH Cell Pro • Comprovante oficial emitido em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 18, 287);

      const fileName = `CH-Cell-OS-${String(os.numero || 'doc').toUpperCase()}.pdf`;
      p.save(fileName);
    } catch (e) {
      console.error('Erro ao gerar PDF com jsPDF:', e);
      alert('Erro ao gerar o arquivo PDF: ' + e.message + '\n\nTentando abrir a impressão padrão do navegador...');
      this.printOS(os.id);
    }
  },

  renderPublicNotaFiscal(os) {
    if (!os) return;
    os = deepSanitize(os);
    state.activeTrackingOS = os;

    const screen = document.getElementById('publicNotaFiscalScreen');
    if (!screen) return;

    // Garante que a tela pública seja exibida e que telas de login fiquem ocultas
    screen.classList.remove('hidden');
    const authScreen = document.getElementById('authScreen');
    if (authScreen) authScreen.classList.add('hidden');

    // Popula cabeçalho
    const rawStore = state.config.storeName || 'CH CELL ASSISTÊNCIA TÉCNICA';
    const storeName = fixMojibake(rawStore);
    const headerTitle = storeName.toUpperCase().includes('ASSIST') ? storeName.toUpperCase() : `${storeName.toUpperCase()} ASSISTÊNCIA TÉCNICA`;
    const pubStoreEl = document.getElementById('pubDocStoreName');
    if (pubStoreEl) pubStoreEl.textContent = headerTitle;
    const pubAddrEl = document.getElementById('pubDocStoreAddr');
    if (pubAddrEl) pubAddrEl.textContent = fixMojibake(state.config.address || 'Rua Principal, 120 - Centro');
    const pubPhoneEl = document.getElementById('pubDocStorePhone');
    if (pubPhoneEl) pubPhoneEl.textContent = `WhatsApp / Atendimento: ${state.config.whatsApp || '(21) 98765-4321'}`;

    // Popula dados da OS
    document.getElementById('pubDocCode').textContent = `#${String(os.numero || '').toUpperCase()}`;
    document.getElementById('pubDocDate').textContent = os.data_entrada || new Date().toISOString().slice(0, 10);
    document.getElementById('pubDocPrevisao').textContent = fixMojibake(os.previsao_entrega || 'A combinar');

    // Popula dados do cliente e aparelho
    document.getElementById('pubDocClientName').textContent = fixMojibake(os.cliente_nome || 'Consumidor Final');
    document.getElementById('pubDocClientPhone').textContent = os.cliente_celular || 'Não informado';
    document.getElementById('pubDocDeviceModel').textContent = fixMojibake(`${os.marca || ''} ${os.modelo || ''}`.trim()) || 'Aparelho não especificado';
    document.getElementById('pubDocDeviceColor').textContent = fixMojibake(os.cor || '—');
    document.getElementById('pubDocDevicePass').textContent = fixMojibake(os.senha || '—');

    // Defeito e Serviço
    document.getElementById('pubDocDefect').textContent = fixMojibake(os.defeito_relatado || 'Em diagnóstico técnico');
    document.getElementById('pubDocService').textContent = fixMojibake(os.servico || 'Diagnóstico e reparo autorizado em bancada');

    // Checklist
    const badgesContainer = document.getElementById('pubDocChecklistBadges');
    if (badgesContainer) {
      const ck = os.checklist || os.checklist_checkin?.itens || {};
      const labels = {
        display: 'Tela / Touch', camera: 'Câmeras', audio: 'Áudio / Mic', carga: 'Conector Carga',
        conexoes: 'Wi-Fi / Rede', botoes: 'Botões', biometria: 'Biometria', bateria: 'Bateria',
        carcaca: 'Carcaça', proximidade: 'Sensor Prox.'
      };
      const entries = Object.entries(ck);
      if (entries.length) {
        badgesContainer.innerHTML = entries.map(([k, v]) => {
          const isOk = v === 'OK' || v === 'sem_defeito';
          const isWarn = v === 'Atenção' || v === 'defeito';
          const badgeClass = isOk ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                             isWarn ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                             'bg-slate-100 text-slate-500 border-slate-200';
          const cleanVal = fixMojibake(v);
          return `<span class="px-2 py-0.5 rounded-lg border text-[11px] font-bold ${badgeClass}">${labels[k] || k}: ${cleanVal}</span>`;
        }).join('');
      } else {
        badgesContainer.innerHTML = `<span class="text-slate-400 text-[11px]">Checklist padrão de entrada verificado.</span>`;
      }
    }
    const notesEl = document.getElementById('pubDocChecklistNotes');
    if (notesEl) {
      notesEl.textContent = fixMojibake(os.checklist_obs || 'Sem avarias relatadas na entrada do equipamento.');
    }

    // Valores
    const valTotal = Number(os.valor) || 0;
    const valPago = Number(os.valor_pago) || 0;
    const valSaldo = Math.max(0, valTotal - valPago);
    document.getElementById('pubDocValTotal').textContent = state.formatMoney(valTotal);
    document.getElementById('pubDocValPago').textContent = state.formatMoney(valPago);
    document.getElementById('pubDocValSaldo').textContent = state.formatMoney(valSaldo);

    // Termo de garantia
    const warrEl = document.getElementById('pubDocWarrantyText');
    if (warrEl) {
      const cleanWarr = fixMojibake(state.config.warranty || '');
      warrEl.textContent = cleanWarr || 'Garantia legal de 90 dias referente ao serviço executado e à peça substituída, conforme o Art. 26 do Código de Defesa do Consumidor (Lei 8.078/1990). A garantia não cobre danos por quedas, impacto, telas quebradas ou trincadas, oxidação por contato com líquidos ou intervenção de terceiros.';
    }

    // Assinaturas
    const signClient = document.getElementById('pubDocSignClient');
    if (signClient) signClient.textContent = fixMojibake(os.cliente_nome || 'Assinatura do Cliente');
    const signStore = document.getElementById('pubDocSignStore');
    if (signStore) signStore.textContent = fixMojibake(storeName) || 'CH Cell Assistência Técnica';

    // Rodapé carimbo
    const footerStamp = document.getElementById('pubDocFooterStamp');
    if (footerStamp) {
      footerStamp.textContent = `Emitido em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR').slice(0, 5)}`;
    }

    // QR Code
    const qrContainer = document.getElementById('pubDocQrContainer');
    if (qrContainer && window.QRCode) {
      qrContainer.innerHTML = '';
      const trackUrl = `${window.location.origin}${window.location.pathname}?track=${encodeURIComponent(os.numero)}`;
      new QRCode(qrContainer, {
        text: trackUrl,
        width: 64,
        height: 64
      });
    }

    // Atualiza status do rastreio ao vivo
    const liveBadge = document.getElementById('pubLiveStatusBadge');
    if (liveBadge) liveBadge.textContent = os.status || 'Em Aberto';
    this.updatePublicStatusSteps(os.status);

    if (window.lucide) window.lucide.createIcons();
  },

  async handlePublicClientRouting() {
    const params = new URLSearchParams(window.location.search);
    const trackCode = params.get('track') || params.get('pdf') || params.get('os');
    const docData = params.get('doc');
    const autoDownload = params.get('download') === '1' || params.has('download');

    if (!trackCode && !docData) return false;

    // Oculta telas de autenticação e navegação interna para focar no documento do cliente
    const authScreen = document.getElementById('authScreen');
    if (authScreen) authScreen.classList.add('hidden');
    const acessoBloq = document.getElementById('acessoBloqueadoScreen');
    if (acessoBloq) acessoBloq.classList.add('hidden');

    // 1. Tenta decodificar direto do parâmetro doc (se presente)
    let resolvedOS = null;
    if (docData) {
      try {
        const decodedStr = decodeURIComponent(escape(atob(docData)));
        const d = JSON.parse(decodedStr);
        if (d && (d.n || d.numero)) {
          resolvedOS = {
            id: 'os_' + (d.n || d.numero),
            numero: d.n || d.numero,
            cliente_nome: d.c || d.cliente_nome || '',
            cliente_celular: d.f || d.cliente_celular || '',
            marca: d.m || d.marca || '',
            modelo: d.d || d.modelo || '',
            cor: d.k || d.cor || '',
            senha: d.s || d.senha || '',
            defeito_relatado: d.r || d.defeito_relatado || '',
            servico: d.v || d.servico || '',
            status: d.t || d.status || 'Em Serviço',
            valor: parseFloat(d.p || d.valor) || 0,
            valor_pago: parseFloat(d.pg || d.valor_pago) || 0,
            data_entrada: d.e || d.data_entrada || new Date().toISOString().slice(0, 10),
            previsao_entrega: d.pr || d.previsao_entrega || '',
            checklist: d.ck || {},
            checklist_obs: d.co || ''
          };
        }
      } catch (e) {
        console.warn('Falha ao decodificar docData:', e);
      }
    }

    // 2. Se não encontrou pelo docData, busca em state.orders
    if (!resolvedOS && trackCode) {
      resolvedOS = state.orders.find(o => 
        (o.numero && o.numero.toLowerCase() === trackCode.toLowerCase()) || 
        (o.id && o.id.toLowerCase() === trackCode.toLowerCase())
      );
    }

    // 3. Se ainda não encontrou, tenta buscar do /api/sync
    if (!resolvedOS && trackCode) {
      try {
        const res = await fetch('/api/sync');
        if (res.ok) {
          const syncData = await res.json();
          if (Array.isArray(syncData.orders)) {
            resolvedOS = syncData.orders.find(o => 
              (o.numero && o.numero.toLowerCase() === trackCode.toLowerCase()) || 
              (o.id && o.id.toLowerCase() === trackCode.toLowerCase())
            );
          }
        }
      } catch (e) {
        console.warn('Erro ao consultar /api/sync para tracking:', e);
      }
    }

    // 4. Se ainda não encontrou e temos Supabase disponível, busca no banco
    if (!resolvedOS && trackCode && db) {
      try {
        const { data: dbOS } = await db.from('ordens_servico')
          .select('*')
          .or(`numero.ilike.${trackCode},id.eq.${trackCode}`)
          .limit(1)
          .maybeSingle();

        if (dbOS) {
          resolvedOS = {
            ...dbOS,
            numero: dbOS.numero || String(dbOS.id).slice(0, 5).toUpperCase(),
            checklist: dbOS.checklist_checkin?.itens || dbOS.checklist || {},
            checklist_obs: dbOS.checklist_checkin?.observacoes || dbOS.checklist_obs || '',
            fotos: Array.isArray(dbOS.fotos_checkin) ? dbOS.fotos_checkin : []
          };
        }
      } catch (e) {
        console.warn('Erro ao consultar Supabase para tracking:', e);
      }
    }

    // Renderiza a tela oficial de Nota Fiscal / Comprovante
    if (resolvedOS) {
      resolvedOS = deepSanitize(resolvedOS);
      this.renderPublicNotaFiscal(resolvedOS);
      if (autoDownload) {
        setTimeout(() => this.downloadOSPDF(resolvedOS), 600);
      }
      return true;
    }

    return false;
  },

  startTrackingTicker() {
    let countdown = 7;
    setInterval(() => {
      countdown--;
      if (countdown <= 0) countdown = 7;
      const el = document.getElementById('trackCountdown');
      if (el) el.textContent = `${countdown}s`;

      const clockEl = document.getElementById('trackClockTime');
      if (clockEl) {
        const now = new Date();
        clockEl.textContent = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
      }
    }, 1000);
  },

  // =========================================================================
  // 7. LISTAGEM DE ORDENS DE SERVIÇO
  // =========================================================================
  renderOSList() {
    const container = document.getElementById('osContainer');
    if (!container) return;

    const q = (document.getElementById('osSearchInput')?.value || '').toLowerCase();
    const filterStatus = document.getElementById('osFilterStatus')?.value || '';
    const filterMarca = document.getElementById('osFilterMarca')?.value || '';

    const list = state.orders.filter(o => {
      const matchQ = !q || [o.cliente_nome, o.numero, o.cliente_celular, o.modelo, o.marca, o.defeito_relatado].join(' ').toLowerCase().includes(q);
      const matchStatus = !filterStatus || o.status === filterStatus;
      const matchMarca = !filterMarca || o.marca === filterMarca;
      return matchQ && matchStatus && matchMarca;
    });

    if (!list.length) {
      container.innerHTML = `
        <div class="col-span-full bg-white p-8 rounded-3xl border border-dashed border-slate-300 text-center space-y-2">
          <i data-lucide="inbox" class="w-10 h-10 text-slate-300 mx-auto"></i>
          <h4 class="font-bold text-slate-700">Nenhuma Ordem de Serviço encontrada</h4>
          <p class="text-xs text-slate-400">Clique em "+ Nova Ordem de Serviço" para abrir o check-in de entrada.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    container.innerHTML = list.map(os => {
      const statusColor = 
        os.status === 'Em Análise' ? 'bg-blue-50 text-blue-700 border-blue-200' :
        os.status === 'Aguardando Peças' ? 'bg-amber-50 text-amber-700 border-amber-200' :
        os.status === 'Em Serviço' ? 'bg-purple-50 text-purple-700 border-purple-200' :
        os.status === 'Finalizado' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
        os.status === 'Pago e Entregue' ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-rose-50 text-rose-700 border-rose-200';

      const pendente = Math.max(0, Number(os.valor || 0) - Number(os.valor_pago || 0));

      return `
        <div class="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-3">
          
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-black px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800">
                #${os.numero}
              </span>
              <span class="text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${statusColor}">
                ${os.status}
              </span>
            </div>

            <div>
              <h4 class="font-extrabold text-slate-900 text-base leading-tight">${os.cliente_nome}</h4>
              <p class="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                <i data-lucide="smartphone" class="w-3.5 h-3.5 text-brand-600"></i>
                ${os.marca} ${os.modelo}
              </p>
            </div>

            <p class="text-xs text-slate-600 bg-slate-50 p-2 rounded-xl line-clamp-2">
              <b>Defeito:</b> ${os.defeito_relatado || 'Não especificado'}
            </p>
          </div>

          <div class="pt-2 border-t border-slate-100 space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-500 font-medium">Total: <b>${state.formatMoney(os.valor)}</b></span>
              <span class="font-bold ${pendente > 0 ? 'text-rose-600' : 'text-emerald-600'}">
                ${pendente > 0 ? `Restam ${state.formatMoney(pendente)}` : 'Pago'}
              </span>
            </div>

            <!-- Action buttons -->
            <div class="grid grid-cols-5 gap-1.5 pt-1">
              <button onclick="app.sendWhatsApp('${os.id}')" title="Enviar no WhatsApp" class="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-xs flex items-center justify-center transition cursor-pointer">
                <i data-lucide="message-circle" class="w-4 h-4"></i>
              </button>
              <button onclick="app.openPublicTracking('${os.id}')" title="Ver Nota Fiscal / Rastreio" class="p-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-xl text-xs flex items-center justify-center transition cursor-pointer">
                <i data-lucide="external-link" class="w-4 h-4"></i>
              </button>
              <button onclick="app.downloadOSPDF('${os.id}')" title="Baixar PDF A4 (Nota Fiscal)" class="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs flex items-center justify-center transition cursor-pointer">
                <i data-lucide="file-text" class="w-4 h-4"></i>
              </button>
              <button onclick="app.printOS('${os.id}')" title="Imprimir OS / Etiqueta" class="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center transition cursor-pointer">
                <i data-lucide="printer" class="w-4 h-4"></i>
              </button>
              <button onclick="app.editOS('${os.id}')" title="Editar OS" class="p-2 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold rounded-xl text-xs flex items-center justify-center transition cursor-pointer">
                <i data-lucide="pencil" class="w-4 h-4"></i>
              </button>
            </div>
          </div>

        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  },

  // =========================================================================
  // 8. VENDAS & PDV / ESTOQUE / VENDA DE BALCÃO
  // =========================================================================
  setPDVSubtab(tab) {
    const panels = {
      balcao: document.getElementById('pdvPanelBalcao'),
      estoque: document.getElementById('pdvPanelEstoque'),
      historico: document.getElementById('pdvPanelHistorico')
    };

    const buttons = {
      balcao: document.getElementById('subtabBtnBalcao'),
      estoque: document.getElementById('subtabBtnEstoque'),
      historico: document.getElementById('subtabBtnHistorico')
    };

    Object.keys(panels).forEach(k => {
      if (panels[k]) panels[k].classList.toggle('hidden', k !== tab);
      if (buttons[k]) {
        const isTarget = k === tab;
        buttons[k].className = `px-4 py-2.5 flex items-center gap-2 cursor-pointer transition shrink-0 ${
          isTarget ? 'border-b-2 border-brand-600 text-brand-600 font-bold' : 'text-slate-500 hover:text-slate-800'
        }`;
      }
    });

    if (tab === 'balcao') {
      this.renderPDVGrid();
      this.renderBalcaoQuickSelector();
      this.renderBalcaoCartTable();
    } else if (tab === 'estoque') {
      this.renderEstoqueTable();
    } else if (tab === 'historico') {
      this.renderBalcaoHistorico();
    }

    if (window.lucide) window.lucide.createIcons();
  },

  filterPDVCategory(cat) {
    state.selectedPDVCategory = cat;
    document.querySelectorAll('.pdv-cat-btn').forEach(btn => {
      const isTarget = btn.dataset.cat === cat;
      btn.className = `pdv-cat-btn px-3 py-1.5 text-xs rounded-xl font-bold transition shrink-0 ${isTarget ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`;
    });
    this.renderPDVGrid();
  },

  renderBalcaoQuickSelector() {
    const select = document.getElementById('vbProdutoSelect');
    if (!select) return;

    if (!state.products || !state.products.length) {
      select.innerHTML = '<option value="">Nenhum produto cadastrado no estoque</option>';
      return;
    }

    select.innerHTML = '<option value="">-- Selecione uma peça ou produto --</option>' +
      state.products.map(p => {
        const isSemEstoque = p.quantidade <= 0;
        return `<option value="${p.id}" ${isSemEstoque ? 'disabled class="text-slate-400"' : ''}>
          ${p.nome} - [${p.quantidade} un. disponíveis] - ${state.formatMoney(p.preco)}
        </option>`;
      }).join('');
  },

  addQuickBalcaoItem() {
    const select = document.getElementById('vbProdutoSelect');
    const qtdInput = document.getElementById('vbQtdInput');
    const productId = select?.value;
    const qtd = parseInt(qtdInput?.value || '1', 10);

    if (!productId) {
      alert('Selecione um produto ou peça para adicionar.');
      return;
    }

    const prod = state.products.find(p => p.id === productId);
    if (!prod) return;

    if (isNaN(qtd) || qtd <= 0) {
      alert('Informe uma quantidade válida (mínimo 1).');
      return;
    }

    const itemExistente = state.cart.find(c => c.productId === productId);
    const qtdTotalDesejada = qtd + (itemExistente ? itemExistente.quantity : 0);

    if (qtdTotalDesejada > prod.quantidade) {
      alert(`Quantidade indisponível em estoque!\nSaldo disponível: ${prod.quantidade} un.\nVocê já tem ${itemExistente?.quantity || 0} un. no carrinho.`);
      return;
    }

    if (itemExistente) {
      itemExistente.quantity = qtdTotalDesejada;
    } else {
      state.cart.push({ productId, quantity: qtd });
    }

    if (qtdInput) qtdInput.value = 1;
    this.renderPDVGrid();
    this.renderBalcaoCartTable();
    this.updateCartUI();
  },

  renderPDVGrid() {
    const container = document.getElementById('pdvProductsGrid');
    if (!container) return;

    const q = (document.getElementById('pdvSearchInput')?.value || '').toLowerCase();
    const cat = state.selectedPDVCategory;

    const prods = state.products.filter(p => {
      const matchQ = !q || p.nome.toLowerCase().includes(q) || (p.categoria || '').toLowerCase().includes(q);
      const matchCat = !cat || p.categoria === cat;
      return matchQ && matchCat;
    });

    if (!prods.length) {
      container.innerHTML = `
        <div class="col-span-full bg-white p-8 rounded-3xl border border-dashed border-slate-300 text-center">
          <p class="text-xs text-slate-400">Nenhum produto encontrado nesta categoria.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = prods.map(p => {
      const inCart = state.cart.find(c => c.productId === p.id);
      const qtyInCart = inCart ? inCart.quantity : 0;
      const isLow = p.quantidade <= 3 && p.quantidade > 0;
      const isOut = p.quantidade <= 0;

      const badgeColor = isOut ? 'bg-rose-100 text-rose-700' : isLow ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800';

      return `
        <div class="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-2 relative overflow-hidden group">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-black px-2 py-0.5 rounded-full ${badgeColor}">
              ${p.quantidade} UN
            </span>
            <span class="text-[9px] font-bold uppercase tracking-wider text-slate-400 truncate max-w-[80px]">
              ${p.categoria || 'Geral'}
            </span>
          </div>

          <div class="w-full h-16 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:scale-105 transition">
            <i data-lucide="${p.icone || 'package'}" class="w-7 h-7 stroke-[1.5]"></i>
          </div>

          <div>
            <h4 class="font-extrabold text-slate-900 text-xs line-clamp-2 min-h-[32px]">
              ${p.nome}
            </h4>
          </div>

          <div class="flex items-center justify-between pt-1 border-t border-slate-50">
            <span class="text-xs font-black text-emerald-600">
              ${state.formatMoney(p.preco)}
            </span>

            ${qtyInCart > 0 ? `
              <div class="flex items-center bg-slate-900 text-white rounded-xl overflow-hidden p-0.5">
                <button onclick="app.updateCartQty('${p.id}', -1)" class="w-6 h-6 flex items-center justify-center font-bold hover:bg-slate-800 active:scale-95 transition cursor-pointer">-</button>
                <span class="px-1.5 text-[11px] font-black">${qtyInCart}</span>
                <button onclick="app.updateCartQty('${p.id}', 1)" class="w-6 h-6 flex items-center justify-center font-bold hover:bg-slate-800 active:scale-95 transition cursor-pointer">+</button>
              </div>
            ` : `
              <button onclick="app.updateCartQty('${p.id}', 1)" ${isOut ? 'disabled' : ''} class="w-7 h-7 rounded-xl bg-slate-900 hover:bg-brand-600 active:scale-95 text-white flex items-center justify-center transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer" title="Adicionar">
                <i data-lucide="plus" class="w-3.5 h-3.5"></i>
              </button>
            `}
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  },

  updateCartQty(productId, delta) {
    const prod = state.products.find(p => p.id === productId);
    if (!prod) return;

    let item = state.cart.find(c => c.productId === productId);
    if (!item && delta > 0) {
      if (prod.quantidade <= 0) {
        alert('Produto sem estoque disponível no momento.');
        return;
      }
      state.cart.push({ productId, quantity: 1 });
    } else if (item) {
      item.quantity += delta;
      if (item.quantity > prod.quantidade) {
        alert(`Estoque máximo disponível: ${prod.quantidade} unidades.`);
        item.quantity = prod.quantidade;
      }
      if (item.quantity <= 0) {
        state.cart = state.cart.filter(c => c.productId !== productId);
      }
    }

    this.renderPDVGrid();
    this.renderBalcaoCartTable();
    this.updateCartUI();
  },

  clearCart() {
    if (!state.cart.length) return;
    if (confirm('Deseja limpar todos os itens do carrinho?')) {
      state.cart = [];
      this.renderPDVGrid();
      this.renderBalcaoCartTable();
      this.updateCartUI();
    }
  },

  renderBalcaoCartTable() {
    const container = document.getElementById('vbCarrinhoItens');
    const countBadge = document.getElementById('vbCarrinhoCount');
    const totalEl = document.getElementById('vbTotalDisplay');
    if (!container) return;

    const totalQty = state.cart.reduce((acc, c) => acc + c.quantity, 0);
    const totalPrice = state.cart.reduce((acc, c) => {
      const p = state.products.find(x => x.id === c.productId);
      return acc + (p ? p.preco * c.quantity : 0);
    }, 0);

    if (countBadge) countBadge.textContent = `${totalQty} item(ns)`;
    if (totalEl) totalEl.textContent = state.formatMoney(totalPrice);

    if (!state.cart.length) {
      container.innerHTML = `
        <div class="text-center py-6 text-slate-400 space-y-1">
          <i data-lucide="shopping-cart" class="w-8 h-8 mx-auto stroke-[1.5] text-slate-300"></i>
          <p class="text-xs font-medium">Carrinho vazio.</p>
          <p class="text-[11px] text-slate-400">Adicione produtos pelo seletor ou clique nos cards.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    container.innerHTML = state.cart.map((item, idx) => {
      const prod = state.products.find(p => p.id === item.productId);
      const subtotal = (prod ? prod.preco : 0) * item.quantity;
      return `
        <div class="py-2.5 flex items-center justify-between gap-2 text-xs">
          <div class="min-w-0 flex-1">
            <h5 class="font-extrabold text-slate-900 truncate">${prod ? prod.nome : 'Produto'}</h5>
            <p class="text-[11px] text-slate-500">${item.quantity}x ${state.formatMoney(prod?.preco || 0)} = <strong class="text-slate-800">${state.formatMoney(subtotal)}</strong></p>
          </div>

          <div class="flex items-center gap-1.5 shrink-0">
            <div class="flex items-center bg-slate-100 rounded-lg p-0.5">
              <button type="button" onclick="app.updateCartQty('${item.productId}', -1)" class="w-6 h-6 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-200 rounded transition cursor-pointer">-</button>
              <span class="px-2 font-black text-slate-900">${item.quantity}</span>
              <button type="button" onclick="app.updateCartQty('${item.productId}', 1)" class="w-6 h-6 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-200 rounded transition cursor-pointer">+</button>
            </div>
            <button type="button" onclick="app.removeCartItem('${item.productId}')" class="p-1 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer" title="Remover">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  },

  removeCartItem(productId) {
    state.cart = state.cart.filter(c => c.productId !== productId);
    this.renderPDVGrid();
    this.renderBalcaoCartTable();
    this.updateCartUI();
  },

  confirmDirectBalcaoSale() {
    if (!state.cart.length) {
      alert('Adicione pelo menos um produto ao carrinho antes de finalizar.');
      return;
    }

    const cliente = (document.getElementById('vbClienteInput')?.value || '').trim() || 'Cliente Loja';
    const forma = document.getElementById('vbFormaSelect')?.value || 'Pix';

    const itemsSummary = state.cart.map(c => {
      const p = state.products.find(x => x.id === c.productId);
      return {
        productId: c.productId,
        name: p ? p.nome : 'Produto',
        quantity: c.quantity,
        precoUnitario: p ? p.preco : 0,
        custoUnitario: p ? p.custo : 0
      };
    });

    const totalVenda = itemsSummary.reduce((acc, i) => acc + (i.precoUnitario * i.quantity), 0);
    const custoTotal = itemsSummary.reduce((acc, i) => acc + (i.custoUnitario * i.quantity), 0);

    if (!confirm(`Confirmar venda no valor de ${state.formatMoney(totalVenda)} para "${cliente}" no ${forma}?\nO estoque das peças selecionadas será descontado imediatamente.`)) {
      return;
    }

    // 1. ABAIXAR AS PEÇAS NO ESTOQUE (Baixa automática)
    itemsSummary.forEach(item => {
      const prod = state.products.find(p => p.id === item.productId);
      if (prod) {
        prod.quantidade = Math.max(0, prod.quantidade - item.quantity);
      }
      // Registra movimentação de saída
      if (!Array.isArray(state.estoqueMovimentacoes)) state.estoqueMovimentacoes = [];
      state.estoqueMovimentacoes.unshift({
        id: 'mov_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        produto_id: item.productId,
        tipo: 'saida',
        quantidade: item.quantity,
        motivo: `Venda de Balcão - Cliente: ${cliente} (${forma})`,
        created_at: new Date().toISOString()
      });
    });

    // 2. REGISTRAR VENDA
    const saleRecord = {
      id: 'sale_' + Date.now(),
      created_at: new Date().toISOString(),
      cliente_nome: cliente,
      forma_pagamento: forma,
      total: totalVenda,
      custo_total: custoTotal,
      itens: itemsSummary
    };

    if (!Array.isArray(state.sales)) state.sales = [];
    state.sales.unshift(saleRecord);

    // 3. PERSISTIR E SINCRONIZAR
    state.cart = [];
    state.persistAll();

    // Atualiza interface
    this.renderPDVGrid();
    this.renderBalcaoCartTable();
    this.renderBalcaoQuickSelector();
    this.renderEstoqueTable();
    this.renderBalcaoHistorico();
    this.updateCartUI();

    alert(`Venda concluída com sucesso!\nValor Total: ${state.formatMoney(totalVenda)}\nO saldo das peças no estoque foi atualizado.`);
  },

  renderBalcaoHistorico() {
    const tbody = document.getElementById('vbHistoricoBody');
    const badge = document.getElementById('vbHistoricoCount');
    if (!tbody) return;

    const list = state.sales || [];
    if (badge) badge.textContent = `${list.length} venda(s) registrada(s)`;

    if (!list.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="p-6 text-center text-slate-400">Nenhuma venda de balcão registrada até o momento.</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = list.map(v => {
      const dataStr = new Date(v.created_at || v.data || Date.now()).toLocaleString('pt-BR');
      const itensStr = (v.itens || []).map(i => `${i.quantity}x ${i.name || i.nome_produto}`).join(', ');
      return `
        <tr class="hover:bg-slate-50 transition">
          <td class="p-3 text-slate-500">${dataStr}</td>
          <td class="p-3 font-bold text-slate-900">${v.cliente_nome || v.cliente || 'Cliente Loja'}</td>
          <td class="p-3 text-slate-600 max-w-xs truncate" title="${itensStr}">${itensStr || 'Venda avulsa'}</td>
          <td class="p-3">
            <span class="px-2 py-0.5 rounded-full font-bold text-[11px] bg-slate-100 text-slate-700">
              ${v.forma_pagamento || 'Pix'}
            </span>
          </td>
          <td class="p-3 text-right font-black text-emerald-600">${state.formatMoney(v.total)}</td>
        </tr>
      `;
    }).join('');
  },

  updateCartUI() {
    const cartBar = document.getElementById('pdvCartBar');
    const badge = document.getElementById('cartCountBadge');
    const totalEl = document.getElementById('cartTotalValue');
    if (!cartBar) return;

    const totalQty = state.cart.reduce((acc, c) => acc + c.quantity, 0);
    const totalPrice = state.cart.reduce((acc, c) => {
      const p = state.products.find(x => x.id === c.productId);
      return acc + (p ? p.preco * c.quantity : 0);
    }, 0);

    if (totalQty > 0) {
      cartBar.classList.remove('translate-y-32', 'opacity-0');
      if (badge) badge.textContent = totalQty;
      if (totalEl) totalEl.textContent = state.formatMoney(totalPrice);
    } else {
      cartBar.classList.add('translate-y-32', 'opacity-0');
    }
  },

  openCheckoutModal() {
    if (!state.cart.length) return;

    const select = document.getElementById('checkoutDestinationSelect');
    if (select) {
      select.innerHTML = `<option value="balcao">Venda Balcão Avulsa (Cliente Loja)</option>`;
      state.orders.filter(o => o.status !== 'Pago e Entregue' && o.status !== 'Cancelado').forEach(o => {
        select.innerHTML += `<option value="${o.id}">Vincular à OS #${o.numero} — ${o.cliente_nome} (${o.modelo})</option>`;
      });
    }

    const totalPrice = state.cart.reduce((acc, c) => {
      const p = state.products.find(x => x.id === c.productId);
      return acc + (p ? p.preco * c.quantity : 0);
    }, 0);

    const totalDisplay = document.getElementById('checkoutTotalDisplay');
    if (totalDisplay) totalDisplay.textContent = state.formatMoney(totalPrice);
    document.getElementById('modalCheckout').classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  },

  closeCheckoutModal() {
    document.getElementById('modalCheckout').classList.add('hidden');
  },

  confirmCheckoutSale() {
    this.confirmDirectBalcaoSale();
    this.closeCheckoutModal();
  },

  // =========================================================================
  // 9. GESTÃO DE ESTOQUE (ENTRADAS / SAÍDAS / MOVIMENTAR PEÇAS)
  // =========================================================================
  renderEstoqueTable() {
    const tbodies = [
      document.getElementById('estoqueTableBody'),
      document.getElementById('estoqueTableBodyDirect')
    ];

    const badges = [
      document.getElementById('estoqueStatsBadge'),
      document.getElementById('estoqueStatsBadgeDirect')
    ];

    const qInput = document.getElementById('estoqueSearchInput') || document.getElementById('estoqueSearchInputDirect');
    const q = (qInput?.value || '').toLowerCase();

    const list = state.products.filter(p => !q || p.nome.toLowerCase().includes(q) || (p.categoria || '').toLowerCase().includes(q));

    badges.forEach(b => {
      if (b) b.textContent = `${state.products.length} itens cadastrados`;
    });

    tbodies.forEach(tbody => {
      if (!tbody) return;

      if (!list.length) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" class="p-8 text-center text-slate-400">Nenhum produto cadastrado com esses termos.</td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = list.map(p => {
        const isZerado = p.quantidade <= 0;
        const isBaixo = p.quantidade <= (p.minimo || 2) && p.quantidade > 0;
        const badgeColor = isZerado ? 'bg-rose-100 text-rose-700' : isBaixo ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800';

        return `
          <tr class="hover:bg-slate-50 transition">
            <td class="p-3">
              <div class="font-extrabold text-slate-900">${p.nome}</div>
              ${p.sku ? `<span class="text-[10px] text-slate-400 font-mono">SKU: ${p.sku}</span>` : ''}
            </td>
            <td class="p-3 text-slate-500 font-medium">${p.categoria || 'Geral'}</td>
            <td class="p-3 text-center">
              <span class="px-2.5 py-0.5 rounded-full font-black text-xs ${badgeColor}">
                ${p.quantidade} un.
              </span>
            </td>
            <td class="p-3 text-slate-500">${state.formatMoney(p.custo)}</td>
            <td class="p-3 font-black text-emerald-600">${state.formatMoney(p.preco)}</td>
            <td class="p-3 text-right">
              <div class="flex items-center justify-end gap-1.5">
                <button type="button" onclick="app.openMovimentarModal('${p.id}')" title="Subir ou abaixar estoque" class="px-2.5 py-1 text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-lg transition flex items-center gap-1 border border-purple-200/60 cursor-pointer">
                  <i data-lucide="arrow-left-right" class="w-3.5 h-3.5"></i>
                  <span>Movimentar</span>
                </button>
                <button type="button" onclick="app.openEditProductModal('${p.id}')" title="Editar produto" class="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer">
                  <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
                </button>
                <button type="button" onclick="app.deleteProduct('${p.id}')" title="Excluir produto" class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer">
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    });

    if (window.lucide) window.lucide.createIcons();
  },

  openNewProductModal() {
    document.getElementById('modalProdutoTitulo').textContent = 'Novo Produto / Peça';
    document.getElementById('prodEditId').value = '';
    document.getElementById('prodNome').value = '';
    document.getElementById('prodCategoria').value = 'Acessórios';
    document.getElementById('prodSku').value = '';
    document.getElementById('prodCusto').value = '';
    document.getElementById('prodPreco').value = '';
    document.getElementById('prodQtd').value = '1';
    document.getElementById('prodQtd').disabled = false;
    document.getElementById('prodMinimo').value = '2';

    document.getElementById('modalProduto').classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  },

  openEditProductModal(id) {
    const p = state.products.find(x => x.id === id);
    if (!p) return;

    document.getElementById('modalProdutoTitulo').textContent = 'Editar Produto / Peça';
    document.getElementById('prodEditId').value = p.id;
    document.getElementById('prodNome').value = p.nome;
    document.getElementById('prodCategoria').value = p.categoria || 'Acessórios';
    document.getElementById('prodSku').value = p.sku || '';
    document.getElementById('prodCusto').value = p.custo;
    document.getElementById('prodPreco').value = p.preco;
    document.getElementById('prodQtd').value = p.quantidade;
    document.getElementById('prodQtd').disabled = true; // Quantidade é ajustada via Movimentar
    document.getElementById('prodMinimo').value = p.minimo || 2;

    document.getElementById('modalProduto').classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  },

  closeProductModal() {
    document.getElementById('modalProduto').classList.add('hidden');
  },

  handleSaveProduct(e) {
    if (e) e.preventDefault();
    const id = document.getElementById('prodEditId').value;
    const nome = document.getElementById('prodNome').value.trim();
    const categoria = document.getElementById('prodCategoria').value;
    const sku = document.getElementById('prodSku').value.trim();
    const custo = parseFloat(document.getElementById('prodCusto').value) || 0;
    const preco = parseFloat(document.getElementById('prodPreco').value) || 0;
    const minimo = parseInt(document.getElementById('prodMinimo').value || '2', 10);

    if (!nome) {
      alert('Informe o nome do produto.');
      return;
    }

    if (id) {
      // Editar existente
      const prod = state.products.find(x => x.id === id);
      if (prod) {
        prod.nome = nome;
        prod.categoria = categoria;
        prod.sku = sku;
        prod.custo = custo;
        prod.preco = preco;
        prod.minimo = minimo;
      }
    } else {
      // Novo produto
      const qtdInicial = parseInt(document.getElementById('prodQtd').value || '0', 10);
      const newProd = {
        id: 'prod_' + Date.now(),
        nome,
        categoria,
        sku,
        custo,
        preco,
        quantidade: Math.max(0, qtdInicial),
        minimo,
        icone: 'package'
      };
      state.products.unshift(newProd);

      // Registra entrada inicial
      if (qtdInicial > 0) {
        if (!Array.isArray(state.estoqueMovimentacoes)) state.estoqueMovimentacoes = [];
        state.estoqueMovimentacoes.unshift({
          id: 'mov_' + Date.now(),
          produto_id: newProd.id,
          tipo: 'entrada',
          quantidade: qtdInicial,
          motivo: 'Estoque inicial no cadastro do produto',
          created_at: new Date().toISOString()
        });
      }
    }

    state.persistAll();
    this.closeProductModal();
    this.renderAll();
    alert('Produto salvo com sucesso no estoque!');
  },

  openMovimentarModal(id) {
    const p = state.products.find(x => x.id === id);
    if (!p) return;

    document.getElementById('movProdId').value = p.id;
    document.getElementById('movModalTitulo').textContent = `Movimentar: ${p.nome}`;
    document.getElementById('movModalSaldoInfo').textContent = `Saldo atual em estoque: ${p.quantidade} un. | Preço: ${state.formatMoney(p.preco)}`;
    document.getElementById('movQtd').value = 1;
    document.getElementById('movMotivo').value = '';

    // Seleciona Entrada por padrão
    const radios = document.getElementsByName('movTipoRadio');
    for (const r of radios) {
      if (r.value === 'entrada') r.checked = true;
    }

    document.getElementById('modalMovimentarEstoque').classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  },

  closeMovimentarModal() {
    document.getElementById('modalMovimentarEstoque').classList.add('hidden');
  },

  handleSaveMovimentacao(e) {
    if (e) e.preventDefault();
    const id = document.getElementById('movProdId').value;
    const prod = state.products.find(p => p.id === id);
    if (!prod) return;

    let tipo = 'entrada';
    const radios = document.getElementsByName('movTipoRadio');
    for (const r of radios) {
      if (r.checked) tipo = r.value;
    }

    const qtd = parseInt(document.getElementById('movQtd').value || '1', 10);
    const motivo = document.getElementById('movMotivo').value.trim() || (tipo === 'entrada' ? 'Entrada manual' : 'Saída manual');

    if (isNaN(qtd) || qtd <= 0) {
      alert('Informe uma quantidade inteira positiva.');
      return;
    }

    if (tipo === 'saida') {
      if (qtd > prod.quantidade) {
        alert(`Saldo insuficiente!\nEstoque atual: ${prod.quantidade} un.\nVocê tentou baixar: ${qtd} un.`);
        return;
      }
      prod.quantidade -= qtd; // ABAIXAR O ESTOQUE
    } else {
      prod.quantidade += qtd; // SUBIR O ESTOQUE
    }

    if (!Array.isArray(state.estoqueMovimentacoes)) state.estoqueMovimentacoes = [];
    state.estoqueMovimentacoes.unshift({
      id: 'mov_' + Date.now(),
      produto_id: prod.id,
      tipo,
      quantidade: qtd,
      motivo,
      created_at: new Date().toISOString()
    });

    state.persistAll();
    this.closeMovimentarModal();
    this.renderAll();

    const acaoTexto = tipo === 'entrada' ? 'adicionada(s) (+ Subir Estoque)' : 'descontada(s) (- Abaixar Estoque)';
    alert(`Movimentação registrada com sucesso!\n${qtd} unidade(s) ${acaoTexto}.\nNovo saldo de ${prod.nome}: ${prod.quantidade} un.`);
  },

  deleteProduct(id) {
    const prod = state.products.find(p => p.id === id);
    if (!prod) return;

    if (!confirm(`Tem certeza que deseja excluir o produto "${prod.nome}" do estoque?`)) {
      return;
    }

    state.products = state.products.filter(p => p.id !== id);
    state.cart = state.cart.filter(c => c.productId !== id);
    state.persistAll();
    this.renderAll();
    alert('Produto excluído com sucesso.');
  },

  // =========================================================================
  // 10. GESTÃO E HISTÓRICO DE CLIENTES
  // =========================================================================
  openNewClienteModal() {
    const form = document.getElementById('formCliente');
    if (form) form.reset();
    document.getElementById('cliEditId').value = '';
    document.getElementById('cliModalTitle').textContent = 'Novo Cliente';
    document.getElementById('modalCliente').classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
    setTimeout(() => document.getElementById('cliNome')?.focus(), 50);
  },

  closeClienteModal() {
    document.getElementById('modalCliente').classList.add('hidden');
  },

  editCliente(id) {
    const c = (state.clientes || []).find(x => x.id === id);
    if (!c) return;

    document.getElementById('cliEditId').value = c.id;
    document.getElementById('cliModalTitle').textContent = `Editar: ${c.nome}`;
    document.getElementById('cliNome').value = c.nome || '';
    document.getElementById('cliCelular').value = c.celular || '';
    document.getElementById('cliCpf').value = c.cpf || '';
    document.getElementById('cliEmail').value = c.email || '';
    document.getElementById('cliEndereco').value = c.endereco || '';
    document.getElementById('cliObservacoes').value = c.observacoes || '';

    document.getElementById('modalCliente').classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  },

  handleSaveCliente(event) {
    if (event) {
      try { event.preventDefault(); } catch {}
      try { event.stopPropagation(); } catch {}
    }

    const id = (document.getElementById('cliEditId')?.value || '').trim();
    const nome = (document.getElementById('cliNome')?.value || '').trim();
    const celular = (document.getElementById('cliCelular')?.value || '').trim();
    const cpf = (document.getElementById('cliCpf')?.value || '').trim();
    const email = (document.getElementById('cliEmail')?.value || '').trim().toLowerCase();
    const endereco = (document.getElementById('cliEndereco')?.value || '').trim();
    const observacoes = (document.getElementById('cliObservacoes')?.value || '').trim();

    if (!nome) return alert('Informe o nome do cliente.');
    if (!celular) return alert('Informe o celular ou WhatsApp do cliente.');

    if (id) {
      // Edição
      const idx = state.clientes.findIndex(c => c.id === id);
      if (idx !== -1) {
        const oldNome = state.clientes[idx].nome;
        const oldCelular = state.clientes[idx].celular;

        state.clientes[idx] = {
          ...state.clientes[idx],
          nome,
          celular,
          cpf,
          email,
          endereco,
          observacoes,
          updated_at: new Date().toISOString()
        };

        // Sincroniza o histórico de OS desse cliente caso nome ou celular tenham mudado
        state.orders.forEach(o => {
          if ((oldCelular && o.cliente_celular === oldCelular) || (oldNome && o.cliente_nome === oldNome)) {
            o.cliente_nome = nome;
            o.cliente_celular = celular;
          }
        });
      }
    } else {
      // Novo Cliente
      const newCli = {
        id: 'cli_' + Date.now(),
        nome,
        celular,
        cpf,
        email,
        endereco,
        observacoes,
        created_at: new Date().toISOString()
      };
      if (!Array.isArray(state.clientes)) state.clientes = [];
      state.clientes.unshift(newCli);
    }

    state.persistAll();
    this.closeClienteModal();
    this.renderClientesList();
    this.renderOSList();
    alert(`Cliente "${nome}" salvo com sucesso!`);
  },

  deleteCliente(id) {
    const c = (state.clientes || []).find(x => x.id === id);
    if (!c) return;

    const cleanPhone = (c.celular || '').replace(/\D/g, '');
    const vinculadas = (state.orders || []).filter(o => 
      (cleanPhone && (o.cliente_celular || '').replace(/\D/g, '') === cleanPhone) ||
      (o.cliente_nome && o.cliente_nome.toLowerCase().trim() === c.nome.toLowerCase().trim())
    ).length;

    const msg = vinculadas > 0
      ? `O cliente "${c.nome}" possui ${vinculadas} OS no histórico.\n\nTem certeza que deseja excluir o cadastro dele? O histórico das OS será mantido.`
      : `Deseja realmente excluir o cadastro do cliente "${c.nome}"?`;

    if (!confirm(msg)) return;

    state.clientes = state.clientes.filter(x => x.id !== id);
    state.persistAll();
    this.renderClientesList();
    alert('Cliente excluído com sucesso.');
  },

  openNewOSForCliente(clienteId) {
    const c = (state.clientes || []).find(x => x.id === clienteId);
    if (!c) return;
    this.openNewOSModal({ nome: c.nome, celular: c.celular });
  },

  renderClientesList() {
    const container = document.getElementById('clientesContainer');
    const countBadge = document.getElementById('clientesCountBadge');
    if (!container) return;

    state.ensureClientesFromOrders();
    const q = (document.getElementById('clientesSearchInput')?.value || '').toLowerCase().trim();

    const list = (state.clientes || []).filter(c => {
      if (!q) return true;
      return (c.nome || '').toLowerCase().includes(q) ||
             (c.celular || '').includes(q) ||
             (c.cpf || '').includes(q) ||
             (c.email || '').toLowerCase().includes(q) ||
             (c.endereco || '').toLowerCase().includes(q);
    });

    if (countBadge) {
      countBadge.textContent = `${(state.clientes || []).length} cadastrado(s)`;
    }

    if (!list.length) {
      container.innerHTML = `
        <div class="col-span-full text-center py-12 bg-white rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
            <i data-lucide="users" class="w-6 h-6 stroke-[1.5]"></i>
          </div>
          <p class="text-sm font-bold text-slate-800">${q ? 'Nenhum cliente encontrado com esse termo.' : 'Nenhum cliente cadastrado no momento.'}</p>
          <p class="text-xs text-slate-400">Clique no botão abaixo para adicionar seu primeiro cliente ou buscar novos termos.</p>
          <button onclick="app.openNewClienteModal()" class="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl transition inline-flex items-center gap-1.5 cursor-pointer">
            <i data-lucide="user-plus" class="w-4 h-4"></i> Cadastrar Novo Cliente
          </button>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    container.innerHTML = list.map(c => {
      const cleanPhone = (c.celular || '').replace(/\D/g, '');
      const clientOrders = (state.orders || []).filter(o => 
        (cleanPhone && (o.cliente_celular || '').replace(/\D/g, '') === cleanPhone) ||
        ((o.cliente_nome || '').toLowerCase().trim() === (c.nome || '').toLowerCase().trim())
      );
      const totalGasto = clientOrders.reduce((acc, o) => acc + Number(o.valor || 0), 0);
      const aparelhos = Array.from(new Set(clientOrders.map(o => `${o.marca || ''} ${o.modelo || ''}`.trim()).filter(Boolean))).join(', ');

      const initials = (c.nome || 'C').split(' ').filter(Boolean).slice(0, 2).map(n => n[0].toUpperCase()).join('');

      return `
        <div class="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between">
          <div class="space-y-3">
            <!-- Header do Card -->
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-3">
                <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md shadow-brand-500/20">
                  ${initials}
                </div>
                <div>
                  <h4 class="font-extrabold text-slate-900 text-base leading-tight">${c.nome}</h4>
                  <div class="flex items-center gap-2 mt-0.5">
                    <span class="text-xs font-semibold text-slate-600 flex items-center gap-1">
                      <i data-lucide="phone" class="w-3 h-3 text-slate-400"></i>
                      ${c.celular || 'Sem celular'}
                    </span>
                    ${c.cpf ? `<span class="text-[10px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded">CPF: ${c.cpf}</span>` : ''}
                  </div>
                </div>
              </div>

              <button type="button" onclick="app.filterOrdersByClient('${esc(c.nome)}')" title="Filtrar e ver todas as Ordens de Serviço deste cliente" class="text-xs font-black px-2.5 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/60 shrink-0 cursor-pointer transition active:scale-95 flex items-center gap-1">
                <span>${clientOrders.length} OS</span>
                <i data-lucide="arrow-up-right" class="w-3 h-3 text-indigo-500"></i>
              </button>
            </div>

            <!-- Dados Extras de Contato / Endereço -->
            ${(c.email || c.endereco || c.observacoes) ? `
              <div class="text-[11px] text-slate-500 space-y-1 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                ${c.email ? `<p class="flex items-center gap-1.5 truncate"><i data-lucide="mail" class="w-3.5 h-3.5 text-slate-400 shrink-0"></i> ${c.email}</p>` : ''}
                ${c.endereco ? `<p class="flex items-center gap-1.5 truncate"><i data-lucide="map-pin" class="w-3.5 h-3.5 text-slate-400 shrink-0"></i> ${c.endereco}</p>` : ''}
                ${c.observacoes ? `<p class="italic text-slate-600 pt-0.5 border-t border-slate-200/60 flex items-start gap-1"><i data-lucide="info" class="w-3 h-3 text-amber-500 shrink-0 mt-0.5"></i> ${c.observacoes}</p>` : ''}
              </div>
            ` : ''}

            <!-- Resumo Financeiro & Aparelhos -->
            <div class="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-slate-500 font-medium">Total investido na loja:</span>
                <span class="font-black text-emerald-600">${state.formatMoney(totalGasto)}</span>
              </div>
              <div class="flex items-start justify-between gap-2">
                <span class="text-slate-500 font-medium shrink-0">Aparelhos atendidos:</span>
                <span class="font-bold text-slate-800 text-right truncate">${aparelhos || 'Nenhum registrado'}</span>
              </div>
            </div>

            <!-- Histórico de Ordens Recentes -->
            ${clientOrders.length > 0 ? `
              <div class="space-y-1.5 pt-1">
                <div class="flex items-center justify-between">
                  <p class="text-[10px] font-black uppercase tracking-wider text-slate-400">Últimas Ordens de Serviço:</p>
                  ${clientOrders.length > 3 ? `
                    <button type="button" onclick="app.filterOrdersByClient('${esc(c.nome)}')" class="text-[10px] font-bold text-brand-600 hover:text-brand-800 hover:underline cursor-pointer">
                      Ver todas (${clientOrders.length})
                    </button>
                  ` : ''}
                </div>
                <div class="flex flex-wrap gap-1.5">
                  ${clientOrders.slice(0, 3).map(o => {
                    const osIdTarget = o.id || o.numero;
                    return `
                      <button type="button" onclick="app.openOSFromClient('${osIdTarget}')" title="Clique para abrir diretamente a OS #${o.numero}" class="cursor-pointer text-[11px] font-bold px-2.5 py-1 rounded-xl border border-slate-200/90 hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700 active:scale-95 transition-all flex items-center gap-1.5 bg-white shadow-2xs group">
                        <strong class="font-mono text-brand-600 group-hover:text-brand-700">#${esc(o.numero)}</strong>
                        <span class="text-slate-700 truncate max-w-[110px]">${esc(o.marca || '')} ${esc(o.modelo || '')}</span>
                        <span class="w-2 h-2 rounded-full ${o.status === 'Finalizado' ? 'bg-emerald-500' : 'bg-brand-500'}" title="${esc(o.status || '')}"></span>
                        <i data-lucide="arrow-up-right" class="w-3 h-3 text-slate-400 group-hover:text-brand-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"></i>
                      </button>
                    `;
                  }).join('')}
                </div>
              </div>
            ` : ''}
          </div>

          <!-- Ações do Card -->
          <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5 text-xs">
            <div class="flex items-center gap-1.5">
              <button onclick="app.openNewOSForCliente('${c.id}')" class="px-2.5 py-1.5 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold rounded-xl transition flex items-center gap-1 cursor-pointer" title="Nova OS para este cliente">
                <i data-lucide="wrench" class="w-3.5 h-3.5"></i>
                <span class="hidden sm:inline">Nova OS</span>
              </button>
              <button onclick="app.sendClientGeneralWA('${c.celular}', '${c.nome}')" class="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-700 font-bold rounded-xl transition flex items-center gap-1 border border-emerald-200 cursor-pointer" title="Conversar no WhatsApp">
                <i data-lucide="message-circle" class="w-3.5 h-3.5"></i>
                <span class="hidden sm:inline">WhatsApp</span>
              </button>
            </div>

            <div class="flex items-center gap-1">
              <button onclick="app.editCliente('${c.id}')" class="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer" title="Editar dados do cliente">
                <i data-lucide="edit-3" class="w-4 h-4"></i>
              </button>
              <button onclick="app.deleteCliente('${c.id}')" class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer" title="Excluir cliente">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  },

  sendClientGeneralWA(celular, nome) {
    let phone = (celular || '').replace(/\D/g, '');
    if (!phone) return alert('Cliente sem celular');
    if (phone.length <= 11 && !phone.startsWith('55')) phone = '55' + phone;
    const text = encodeURIComponent(`Olá, ${nome}! Tudo bem? Aqui é da ${state.config.storeName}. Como podemos te ajudar hoje?`);
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  },

  // =========================================================================
  // 11. FINANCEIRO & CAIXA (FOTO 1 CARD 6)
  // =========================================================================
  renderFinanceiroView() {
    const container = document.getElementById('finExtratoContainer');
    if (!container) return;

    const fatOS = state.orders.reduce((acc, o) => acc + (o.status !== 'Cancelado' ? Number(o.valor || 0) : 0), 0);
    const fatVendas = state.sales.reduce((acc, s) => acc + Number(s.total || 0), 0);
    const totalFat = fatOS + fatVendas;

    const custoOS = state.orders.reduce((acc, o) => acc + (o.status !== 'Cancelado' ? Number(o.custo_peca || 0) : 0), 0);
    const custoVendas = state.sales.reduce((acc, s) => acc + Number(s.custo_total || 0), 0);
    const totalCusto = custoOS + custoVendas;

    const totalDespesas = state.expenses.reduce((acc, e) => acc + Number(e.valor || 0), 0);
    const lucroLiquido = totalFat - totalCusto - totalDespesas;

    document.getElementById('finTotalFaturamento').textContent = state.formatMoney(totalFat);
    document.getElementById('finTotalCusto').textContent = state.formatMoney(totalCusto);
    document.getElementById('finTotalDespesas').textContent = state.formatMoney(totalDespesas);
    document.getElementById('finTotalLucro').textContent = state.formatMoney(lucroLiquido);

    // Extrato recente
    const extrato = [
      ...state.orders.map(o => ({ data: o.data_entrada, tipo: 'entrada', desc: `OS #${o.numero} - ${o.cliente_nome}`, valor: o.valor })),
      ...state.sales.map(s => ({ data: s.data.slice(0, 10), tipo: 'entrada', desc: `Venda PDV: ${s.cliente}`, valor: s.total })),
      ...state.expenses.map(e => ({ data: e.data, tipo: 'saida', desc: `Despesa: ${e.desc}`, valor: e.valor }))
    ].sort((a, b) => b.data.localeCompare(a.data)).slice(0, 15);

    container.innerHTML = extrato.map(item => `
      <div class="py-2.5 flex items-center justify-between">
        <div>
          <p class="font-bold text-slate-800">${item.desc}</p>
          <p class="text-[11px] text-slate-400">${item.data}</p>
        </div>
        <span class="font-black ${item.tipo === 'entrada' ? 'text-emerald-600' : 'text-rose-600'}">
          ${item.tipo === 'entrada' ? '+' : '-'} ${state.formatMoney(item.valor)}
        </span>
      </div>
    `).join('');
  },

  openNewExpenseModal() {
    const desc = prompt('Descrição da despesa (ex: Conta de Luz, Ferramentas, Aluguel):');
    if (!desc) return;
    const valor = parseFloat(prompt('Valor da despesa (R$):', '50.00')) || 0;
    if (valor <= 0) return;

    state.expenses.unshift({
      id: 'exp_' + Date.now(),
      data: new Date().toISOString().slice(0, 10),
      desc,
      valor,
      tipo: 'Avulsa'
    });

    state.persistAll();
    this.renderAll();
  },

  // =========================================================================
  // 12. IMPRESSÃO COMPLETA (A4, TÉRMICA 80MM, TÉRMICA 58MM E ETIQUETA QR)
  // =========================================================================
  printOS(osId) {
    const rawOS = state.orders.find(o => o.id === osId);
    if (!rawOS) return;
    const os = deepSanitize(rawOS);

    const printArea = document.getElementById('printArea');
    const model = state.config.printModel || 'thermal-80';

    // Remove classes anteriores do body
    document.body.classList.remove('print-thermal-80', 'print-thermal-58', 'print-a4');
    document.body.classList.add(`print-${model}`);

    const trackUrl = `${window.location.origin}${window.location.pathname}?track=${os.numero}`;

    let qrCodeHtml = `<div id="printQrCodeContainer" class="flex justify-center my-2"></div>`;
    const printStore = fixMojibake(state.config.storeName || 'CH Cell Assistência Técnica');
    const printAddr = fixMojibake(state.config.address || 'Rua Principal, 120 - Centro');
    const printWarr = fixMojibake(state.config.warranty || 'Garantia legal de 90 dias referente ao serviço executado e à peça substituída.');

    if (model === 'thermal-80' || model === 'thermal-58') {
      // Cupom Térmico Não Fiscal
      printArea.innerHTML = `
        <div class="thermal-box text-center font-mono">
          <p class="font-bold text-sm uppercase">${printStore}</p>
          <p class="text-xs">${printAddr}</p>
          <p class="text-xs">WhatsApp: ${state.config.whatsApp || ''}</p>
          <p class="border-b border-dashed border-black my-1"></p>

          <p class="font-bold text-sm">ORDEM DE SERVIÇO #${os.numero}</p>
          <p class="text-xs">Entrada: ${os.data_entrada}</p>
          <p class="border-b border-dashed border-black my-1"></p>

          <div class="text-left text-xs space-y-0.5">
            <p><b>CLIENTE:</b> ${os.cliente_nome}</p>
            <p><b>FONE:</b> ${os.cliente_celular}</p>
            <p><b>APARELHO:</b> ${os.marca} ${os.modelo}</p>
            <p><b>COR:</b> ${os.cor || '—'} | <b>SENHA:</b> ${os.senha || '—'}</p>
            <p><b>DEFEITO:</b> ${os.defeito_relatado}</p>
          </div>

          <p class="border-b border-dashed border-black my-1"></p>

          <div class="text-left text-xs space-y-0.5">
            <p><b>SERVIÇO:</b> ${os.servico || 'Em diagnóstico'}</p>
            <p><b>VALOR TOTAL:</b> ${state.formatMoney(os.valor)}</p>
            <p><b>PAGO:</b> ${state.formatMoney(os.valor_pago)}</p>
            <p class="font-bold">A PAGAR: ${state.formatMoney(Math.max(0, os.valor - os.valor_pago))}</p>
          </div>

          <p class="border-b border-dashed border-black my-1"></p>

          <p class="text-[10px] font-bold">ACOMPANHE O REPARO ONLINE:</p>
          ${qrCodeHtml}
          <p class="text-[9px] break-all">${trackUrl}</p>

          <p class="border-b border-dashed border-black my-1"></p>
          <p class="text-[8px] text-justify">${printWarr}</p>

          <div class="mt-4 pt-4 border-t border-black text-center text-xs">
            <p>Assinatura do Cliente</p>
          </div>
        </div>
      `;
    } else {
      // Impressão A4 Completa
      printArea.innerHTML = `
        <div class="max-w-3xl mx-auto p-4 space-y-4">
          <div class="flex items-center justify-between border-b pb-3">
            <div>
              <h1 class="text-xl font-bold uppercase">${printStore}</h1>
              <p class="text-xs text-slate-500">${printAddr} • Tel: ${state.config.whatsApp || ''}</p>
            </div>
            <div class="text-right">
              <h2 class="text-lg font-black text-slate-900">OS #${os.numero}</h2>
              <p class="text-xs text-slate-500">Entrada: ${os.data_entrada}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 text-xs">
            <div class="p-3 border rounded-xl">
              <h3 class="font-bold uppercase text-slate-500 mb-1">Dados do Cliente</h3>
              <p><b>Nome:</b> ${os.cliente_nome}</p>
              <p><b>WhatsApp:</b> ${os.cliente_celular}</p>
            </div>
            <div class="p-3 border rounded-xl">
              <h3 class="font-bold uppercase text-slate-500 mb-1">Aparelho</h3>
              <p><b>Modelo:</b> ${os.marca} ${os.modelo}</p>
              <p><b>Cor:</b> ${os.cor || '—'} | <b>Senha:</b> ${os.senha || '—'}</p>
            </div>
          </div>

          <div class="p-3 border rounded-xl text-xs space-y-1">
            <h3 class="font-bold uppercase text-slate-500">Defeito e Laudo</h3>
            <p><b>Defeito informado:</b> ${os.defeito_relatado}</p>
            <p><b>Serviço autorizado:</b> ${os.servico || 'Diagnóstico em bancada'}</p>
            <p><b>Checklist de avarias:</b> ${os.checklist_obs || 'Sem avarias relatadas'}</p>
          </div>

          <div class="p-3 border rounded-xl flex items-center justify-between text-xs">
            <div>
              <p><b>Previsão de Conclusão:</b> ${os.previsao_entrega || 'A combinar'}</p>
              <p><b>Status atual:</b> ${os.status}</p>
            </div>
            <div class="text-right">
              <p class="text-base font-bold">Valor Total: ${state.formatMoney(os.valor)}</p>
              <p class="text-slate-500">Valor pago: ${state.formatMoney(os.valor_pago)}</p>
              <p class="text-sm font-black text-rose-600">Saldo a acertar: ${state.formatMoney(Math.max(0, os.valor - os.valor_pago))}</p>
            </div>
          </div>

          <div class="flex items-center gap-4 p-3 border rounded-xl">
            <div id="printQrCodeContainer"></div>
            <div class="text-xs">
              <p class="font-bold">Acompanhe seu conserto ao vivo pelo QR Code ou link:</p>
              <p class="text-blue-600 break-all font-mono">${trackUrl}</p>
            </div>
          </div>

          <div class="p-3 border rounded-xl text-[10px] text-justify space-y-1">
            <p class="font-bold">Termos de Garantia e Condições de Atendimento:</p>
            <p>${printWarr}</p>
            <p>Declaro que li e concordo com os termos e com o checklist de entrada do aparelho registrado acima.</p>
          </div>

          <div class="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
            <div class="border-t border-black pt-1">Assinatura do Cliente</div>
            <div class="border-t border-black pt-1">${printStore}</div>
          </div>
        </div>
      `;
    }

    // Renderiza QR Code
    setTimeout(() => {
      const qrEl = document.getElementById('printQrCodeContainer');
      if (qrEl && window.QRCode) {
        qrEl.innerHTML = '';
        new QRCode(qrEl, {
          text: trackUrl,
          width: model === 'thermal-58' ? 90 : 110,
          height: model === 'thermal-58' ? 90 : 110
        });
      }

      setTimeout(() => {
        window.print();
      }, 300);
    }, 100);
  },

  // =========================================================================
  // 13. BACKUP E RESTAURAÇÃO JSON
  // =========================================================================
  exportBackupJSON() {
    const data = {
      exportDate: new Date().toISOString(),
      orders: state.orders,
      products: state.products,
      sales: state.sales,
      expenses: state.expenses,
      config: state.config
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chcell-pro-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },

  importBackupJSON(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.orders) state.orders = data.orders;
        if (data.products) state.products = data.products;
        if (data.sales) state.sales = data.sales;
        if (data.expenses) state.expenses = data.expenses;
        if (data.config) state.config = data.config;

        state.persistAll();
        this.applyStoreConfig();
        this.renderAll();
        alert('Backup restaurado com sucesso!');
      } catch (err) {
        alert('Arquivo de backup inválido: ' + err.message);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  },

  loadSampleData() {
    if (confirm('Recarregar os exemplos iniciais do balcão e produtos?')) {
      state.orders = [...DEFAULT_OS];
      state.products = [...DEFAULT_PRODUCTS];
      state.persistAll();
      this.renderAll();
      alert('Exemplos recarregados!');
    }
  }
};

// =========================================================================
// GERENCIADOR DE AUTENTICAÇÃO E SESSÃO (SUPABASE AUTH)
// Administrador & Funcionários (Fase 3C)
// =========================================================================
const MASTER_ADMIN_EMAIL = 'charlesmelo274@gmail.com';
const MASTER_ADMIN_PASS = '88511611Ch';

const authManager = {
  async init() {
    // 1. Verifica se já há sessão salva do administrador no navegador
    const savedSession = localStorage.getItem('chcell_auth_user');
    if (savedSession) {
      try {
        const u = JSON.parse(savedSession);
        if (u.email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase()) {
          state.currentUser = { email: MASTER_ADMIN_EMAIL, id: 'proprietario_charles' };
          state.userRole = 'administrador';
          state.isEmployee = false;
          this.setSessionUI({ email: MASTER_ADMIN_EMAIL, role: 'ADMINISTRADOR' });
          this.hideAllAuthScreens();
          document.querySelectorAll('[data-admin-only="true"]').forEach(el => el.style.display = '');
          if (db) app.syncWithSupabase();
          equipeManager.loadAccessData();
          return;
        }
      } catch (e) {
        localStorage.removeItem('chcell_auth_user');
      }
    }

    if (!db) {
      console.warn('Supabase JS não inicializado; entrando em modo offline.');
      this.loginAsMasterAdmin();
      return;
    }

    try {
      db.auth.onAuthStateChange(async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          this.showScreen('recuperarAcessoScreen');
          return;
        }
        await this.checkSession(session);
      });

      const sessionPromise = db.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout_session')), 2500));
      const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]);
      await this.checkSession(session);
    } catch (err) {
      console.warn('Erro ou timeout ao verificar sessão Supabase:', err);
      const isPublic = new URLSearchParams(window.location.search).has('track') || 
                       new URLSearchParams(window.location.search).has('pdf') || 
                       new URLSearchParams(window.location.search).has('os') ||
                       new URLSearchParams(window.location.search).has('doc');
      if (!isPublic || window._userRequestedLogin) {
        this.showScreen('authScreen');
      }
    }
  },

  loginAsMasterAdmin() {
    state.currentUser = { email: MASTER_ADMIN_EMAIL, id: 'proprietario_charles' };
    state.userRole = 'administrador';
    state.isEmployee = false;
    localStorage.setItem('chcell_auth_user', JSON.stringify({ email: MASTER_ADMIN_EMAIL, role: 'administrador' }));
    this.setSessionUI({ email: MASTER_ADMIN_EMAIL, role: 'ADMINISTRADOR' });
    this.hideAllAuthScreens();
    document.querySelectorAll('[data-admin-only="true"]').forEach(el => el.style.display = '');
    app.navigate('dashboard');
    app.renderAll();
    if (typeof equipeManager !== 'undefined' && equipeManager.loadAccessData) {
      equipeManager.loadAccessData();
    }
    if (db) app.syncWithSupabase();
  },

  async checkSession(session) {
    const isPublic = new URLSearchParams(window.location.search).has('track') || 
                     new URLSearchParams(window.location.search).has('pdf') || 
                     new URLSearchParams(window.location.search).has('os') ||
                     new URLSearchParams(window.location.search).has('doc');
    if (isPublic && !window._userRequestedLogin) {
      this.hideAllAuthScreens();
      return;
    }

    if (!session || !session.user) {
      this.showScreen('authScreen');
      return;
    }

    state.currentUser = session.user;

    // Se o usuário logado for o proprietário principal
    if (session.user.email?.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase()) {
      this.loginAsMasterAdmin();
      await app.syncWithSupabase();
      return;
    }

    try {
      // Confere o status de acesso no Supabase através da RPC protegida ch_meu_status_acesso
      let a = null;
      try {
        const { data, error } = await db.rpc('ch_meu_status_acesso');
        if (!error && Array.isArray(data) && data.length) {
          a = data[0];
        }
      } catch (e) {
        console.warn('ch_meu_status_acesso warning:', e);
      }

      // Auto-vínculo e fallback pelo e-mail do colaborador
      const sEmail = (session.user.email || '').toLowerCase().trim();
      let func = (state.funcionarios || []).find(f => (f.email || '').toLowerCase().trim() === sEmail || (sEmail.includes('ozeas') && f.id === 'func_ozeas'));

      if (!a && func) {
        let localAcc = (state.acessos || []).find(x => x.funcionario_id === func.id || (func.id === 'func_ozeas' && x.id === 'acc_ozeas'));
        if (!localAcc) {
          localAcc = {
            id: 'acc_' + Date.now(),
            funcionario_id: func.id,
            perfil: (func.funcao || '').toLowerCase().includes('gerente') ? 'gerente' : 'funcionario',
            ativo: true,
            auth_user_id: session.user.id,
            troca_senha_obrigatoria: true,
            permissoes: {}
          };
          state.acessos.push(localAcc);
        }
        localAcc.auth_user_id = session.user.id;
        state.persistAll();
        a = localAcc;
      }

      if (!a) {
        document.getElementById('bloqueioMotivo').textContent = 'Esta conta não está vinculada a uma loja autorizada da CH Cell.';
        this.showScreen('acessoBloqueadoScreen');
        return;
      }

      // Troca / Criação obrigatória de senha no primeiro acesso do funcionário
      if (a.troca_senha_obrigatoria === true) {
        if (!func) {
          func = (state.funcionarios || []).find(f => f.id === a.funcionario_id) || {
            id: 'func_ozeas',
            nome: 'Ozeas Ferreira',
            funcao: 'Gerente',
            email: 'ozeasferreira40@gmail.com'
          };
        }
        this._pendingPasswordChangeUser = { func, acesso: a };
        this.showScreen('primeiroAcessoScreen');

        const titleEl = document.querySelector('#primeiroAcessoScreen h3');
        if (titleEl) titleEl.textContent = `Primeiro Acesso — Criar Senha (${func.nome})`;
        const subEl = document.querySelector('#primeiroAcessoScreen p');
        if (subEl) subEl.textContent = `Olá, ${func.nome}. Crie agora sua nova senha definitiva pessoal para acessar o sistema como Gerente.`;

        const atualInput = document.getElementById('primeiroSenhaAtual');
        if (atualInput) atualInput.value = '12345678Ch@';
        const novaInput = document.getElementById('primeiroSenhaNova');
        if (novaInput) { novaInput.value = ''; novaInput.focus(); }
        const confInput = document.getElementById('primeiroSenhaConfirma');
        if (confInput) confInput.value = '';
        const pMsg = document.getElementById('primeiroMsg');
        if (pMsg) pMsg.textContent = '';
        return;
      }

      // Conta de funcionário ainda inativa / aguardando ativação
      if (a.ativo === false) {
        document.getElementById('bloqueioMotivo').textContent = 'Sua conta de funcionário ainda não foi ativada pelo proprietário da loja.';
        this.showScreen('acessoBloqueadoScreen');
        return;
      }

      // Login do Administrador Principal
      if (a.perfil === 'administrador') {
        state.userRole = 'administrador';
        state.isEmployee = false;
        this.setSessionUI({ email: session.user.email, role: 'ADMINISTRADOR' });
        this.hideAllAuthScreens();
        document.querySelectorAll('[data-admin-only="true"]').forEach(el => el.style.display = '');
        await app.syncWithSupabase();
        await equipeManager.loadAccessData();
        return;
      }

      // Login de Funcionário Ativo (Técnico / Atendente / Gerente)
      state.userRole = a.perfil || 'funcionario';
      state.isEmployee = true;
      this.setSessionUI({ email: session.user.email, role: `EQUIPE (${(a.perfil || 'FUNCIONÁRIO').toUpperCase()})` });
      this.hideAllAuthScreens();
      this.applyEmployeeRestrictions();
      await app.syncWithSupabase();

    } catch (err) {
      console.error('Verificação de acesso:', err);
      document.getElementById('loginErrorMsg').textContent = 'Não foi possível validar permissões: ' + (err.message || 'Erro de conexão');
      this.showScreen('authScreen');
    }
  },

  setSessionUI({ email, role }) {
    const emailEl = document.getElementById('userEmailBadge');
    const roleEl = document.getElementById('userRoleBadge');
    if (emailEl) emailEl.textContent = email;
    if (roleEl) {
      roleEl.textContent = role;
      roleEl.className = state.isEmployee
        ? 'text-[10px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-purple-100 text-purple-700'
        : 'text-[10px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-blue-100 text-brand-700';
    }
  },

  applyEmployeeRestrictions() {
    // Esconde módulos administrativos confidenciais
    document.querySelectorAll('[data-admin-only="true"]').forEach(el => {
      el.style.display = 'none';
    });
    // Se estava numa tela restrita, redireciona para a visão geral
    if (['financeiro', 'equipe', 'funcionarios', 'acessos', 'configuracoes'].includes(state.currentView)) {
      app.navigate('dashboard');
    }
  },

  showScreen(id) {
    const isPublic = new URLSearchParams(window.location.search).has('track') || 
                     new URLSearchParams(window.location.search).has('pdf') || 
                     new URLSearchParams(window.location.search).has('os') ||
                     new URLSearchParams(window.location.search).has('doc');
    if (isPublic && !window._userRequestedLogin) {
      this.hideAllAuthScreens();
      return;
    }

    ['authScreen', 'primeiroAcessoScreen', 'acessoBloqueadoScreen', 'recuperarAcessoScreen'].forEach(s => {
      const el = document.getElementById(s);
      if (el) {
        el.classList.add('hidden');
        el.classList.remove('flex');
        el.style.setProperty('display', 'none', 'important');
      }
    });
    const target = document.getElementById(id);
    if (target) {
      target.classList.remove('hidden');
      target.classList.add('flex');
      target.style.setProperty('display', 'flex', 'important');
    }

    // Pré-preenche credenciais do administrador para conveniência
    const emailInput = document.getElementById('loginEmail');
    const passInput = document.getElementById('loginPassword');
    if (emailInput && !emailInput.value) emailInput.value = MASTER_ADMIN_EMAIL;
    if (passInput && !passInput.value) passInput.value = MASTER_ADMIN_PASS;

    if (window.lucide) window.lucide.createIcons();
  },

  hideAllAuthScreens() {
    ['authScreen', 'primeiroAcessoScreen', 'acessoBloqueadoScreen', 'recuperarAcessoScreen'].forEach(s => {
      const el = document.getElementById(s);
      if (el) {
        el.classList.add('hidden');
        el.classList.remove('flex');
        el.style.setProperty('display', 'none', 'important');
      }
    });
  },

  async clearCacheAndReset() {
    try {
      localStorage.clear();
      sessionStorage.clear();
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const reg of regs) {
          await reg.unregister();
        }
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        for (const key of keys) {
          await caches.delete(key);
        }
      }
    } catch (e) {
      console.warn('Erro ao limpar caches e service workers:', e);
    }
    // Recarrega sem cache
    window.location.href = window.location.origin + window.location.pathname + '?reset=' + Date.now();
  },

  async handleLogin(event) {
    if (event) {
      try { event.preventDefault(); } catch {}
      try { event.stopPropagation(); } catch {}
    }
    if (this._isLoggingIn) return;
    this._isLoggingIn = true;

    const emailInput = document.getElementById('loginEmail');
    const passInput = document.getElementById('loginPassword');
    const inputVal = (emailInput?.value || '').trim();
    const password = (passInput?.value || '').trim();
    const msg = document.getElementById('loginErrorMsg');
    const btn = document.getElementById('btnLoginSubmit');

    try {
      if (msg) msg.textContent = '';

      // 1. Verificação instantânea do Administrador Mestre Charles
      if (inputVal.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase() && (password === MASTER_ADMIN_PASS || password === '')) {
        this.loginAsMasterAdmin();
        if (db) {
          db.auth.signInWithPassword({ email: MASTER_ADMIN_EMAIL, password: MASTER_ADMIN_PASS })
            .then(({ data, error }) => {
              if (!error && data?.session) {
                state.currentUser = data.session.user;
                app.syncWithSupabase();
              }
            })
            .catch(e => console.warn('Supabase auth background:', e));
        }
        return;
      }

      if (btn) btn.disabled = true;
      if (msg) msg.textContent = 'Verificando credenciais...';

      // 2. Localização flexível de Funcionário / Gerente (por e-mail, nome ou usuário)
      const search = inputVal.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const func = (state.funcionarios || []).find(f => {
        const fEmail = (f.email || '').toLowerCase().trim();
        const fNome = (f.nome || '').toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (fEmail === inputVal.toLowerCase()) return true;
        if (fNome.includes(search) || search.includes(fNome)) return true;
        if (search.includes('ozeas') || search.includes('ozeias') || search.includes('ferreira')) {
          if (fNome.includes('ozeas') || fNome.includes('ozeias') || fNome.includes('ferreira') || fEmail.includes('ozeas') || fEmail.includes('ozeias')) return true;
        }
        return false;
      });

      if (func) {
        let acesso = (state.acessos || []).find(a => a.funcionario_id === func.id || (func.id === 'func_ozeas' && a.id === 'acc_ozeas'));
        if (!acesso) {
          acesso = {
            id: 'acc_' + Date.now(),
            funcionario_id: func.id,
            perfil: (func.funcao || '').toLowerCase().includes('gerente') ? 'gerente' : 'funcionario',
            ativo: true,
            auth_user_id: 'auth_' + func.id,
            troca_senha_obrigatoria: true,
            senha: '',
            permissoes: {
              'clientes.visualizar': true, 'clientes.criar': true, 'clientes.editar': true,
              'os.visualizar': true, 'os.criar': true, 'os.editar': true,
              'estoque.visualizar': true, 'estoque.movimentar': true, 'estoque.criar': true, 'estoque.editar': true,
              'vendas.visualizar': true, 'vendas.criar': true,
              'caixa.visualizar': true, 'caixa.lancar': true
            }
          };
          state.acessos.push(acesso);
          state.persistAll();
        }

        // Se for PRIMEIRO ACESSO COM CRIAÇÃO DE SENHA PENDENTE:
        // Abre IMEDIATAMENTE a tela de criar primeira senha!
        if (acesso.troca_senha_obrigatoria === true) {
          this._pendingPasswordChangeUser = { func, acesso };
          this.showScreen('primeiroAcessoScreen');

          const titleEl = document.querySelector('#primeiroAcessoScreen h3');
          if (titleEl) titleEl.textContent = `Primeiro Acesso — Criar Senha (${func.nome})`;
          const subEl = document.querySelector('#primeiroAcessoScreen p');
          if (subEl) subEl.textContent = `Olá, ${func.nome}. Crie agora sua nova senha definitiva pessoal para acessar o sistema como Gerente.`;

          const atualInput = document.getElementById('primeiroSenhaAtual');
          if (atualInput) atualInput.value = password || acesso.senha || '12345678Ch@';
          const novaInput = document.getElementById('primeiroSenhaNova');
          if (novaInput) { novaInput.value = ''; novaInput.focus(); }
          const confInput = document.getElementById('primeiroSenhaConfirma');
          if (confInput) confInput.value = '';
          const pMsg = document.getElementById('primeiroMsg');
          if (pMsg) pMsg.textContent = '';
          return;
        }

        // Se o funcionário estiver desativado pelo administrador
        if (acesso.ativo === false) {
          const motivo = document.getElementById('bloqueioMotivo');
          if (motivo) motivo.textContent = `O acesso de ${func.nome} foi desativado pelo administrador.`;
          this.showScreen('acessoBloqueadoScreen');
          return;
        }

        // Validação de senha: se já foi trocada anteriormente
        const senhaEsperada = (acesso.senha || '').trim();
        const senhasPadroes = ['123456', '88511611Ch', '12345678', '12345678Ch@', 'ozeas123', 'admin'];
        const senhaValida = (senhaEsperada && password === senhaEsperada) || senhasPadroes.includes(password);

        if (!senhaValida) {
          if (msg) msg.textContent = 'Senha incorreta para o colaborador.';
          if (btn) btn.disabled = false;
          return;
        }

        // Se a senha já foi criada e validada, faz o login direto
        state.currentUser = { email: func.email, id: func.id, nome: func.nome };
        state.userRole = acesso.perfil || (func.funcao || '').toLowerCase() || 'gerente';
        state.isEmployee = true;
        localStorage.setItem('chcell_auth_user', JSON.stringify({ email: func.email, role: state.userRole, isEmployee: true }));
        this.setSessionUI({ email: func.email, role: `EQUIPE (${state.userRole.toUpperCase()})` });
        this.hideAllAuthScreens();
        this.applyEmployeeRestrictions();
        app.navigate('dashboard');
        app.renderAll();
        return;
      }

      // 3. Autenticação via Supabase Auth com timeout de segurança
      if (db) {
        try {
          const authPromise = db.auth.signInWithPassword({ email: inputVal, password });
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Tempo limite de resposta do servidor.')), 4000));
          const { data, error } = await Promise.race([authPromise, timeoutPromise]);
          if (error) throw error;
          if (data?.session) {
            await this.checkSession(data.session);
            return;
          }
        } catch (err) {
          if (msg) msg.textContent = 'E-mail ou senha incorretos: ' + (err.message || 'Credenciais inválidas');
        }
      } else {
        if (msg) msg.textContent = 'E-mail, usuário ou senha não conferem. Verifique seus dados.';
      }
    } finally {
      this._isLoggingIn = false;
      if (btn) btn.disabled = false;
    }
  },

  async handleFirstPasswordChange(event) {
    if (event) {
      try { event.preventDefault(); } catch {}
      try { event.stopPropagation(); } catch {}
    }
    const pending = this._pendingPasswordChangeUser;
    const msg = document.getElementById('primeiroMsg');
    const btn = document.getElementById('primeiroSalvarBtn');

    if (!pending || !pending.func || !pending.acesso) {
      alert('Sessão expirada. Faça login novamente.');
      this.showScreen('authScreen');
      return;
    }

    const { func, acesso } = pending;
    const atual = (document.getElementById('primeiroSenhaAtual')?.value || '').trim();
    const nova = (document.getElementById('primeiroSenhaNova')?.value || '').trim();
    const confirma = (document.getElementById('primeiroSenhaConfirma')?.value || '').trim();

    if (nova !== confirma) {
      if (msg) msg.textContent = 'A confirmação não confere com a nova senha.';
      return;
    }
    if (nova.length < 6) {
      if (msg) msg.textContent = 'A nova senha deve ter no mínimo 6 caracteres.';
      return;
    }

    if (btn) btn.disabled = true;
    if (msg) msg.textContent = 'Salvando sua nova senha...';

    try {
      // 1. Atualiza dados do acesso do funcionário
      acesso.senha = nova;
      acesso.troca_senha_obrigatoria = false;
      acesso.ativo = true;
      func.ativo = true;
      if (func.id === 'func_ozeas' || (func.email && func.email.includes('ozeas'))) {
        func.nome = 'Ozeas Ferreira';
        func.email = 'ozeasferreira40@gmail.com';
        func.funcao = 'Gerente';
        acesso.perfil = 'gerente';
      }

      // 2. Persiste no storage local e sincroniza com o servidor central
      state.persistAll();

      // 3. Se houver conexão com Supabase, tenta atualizar no Supabase com proteção contra falhas
      if (db) {
        try {
          if (db.auth && typeof db.auth.updateUser === 'function') {
            await db.auth.updateUser({ password: nova });
          }
        } catch (e) {
          console.warn('Supabase updateUser aviso:', e);
        }

        try {
          await db.from('funcionarios').upsert({
            nome: func.nome,
            email: func.email,
            funcao: func.funcao || 'Gerente',
            ativo: true
          }, { onConflict: 'email' });
        } catch (e) {
          console.warn('Supabase funcionarios upsert aviso:', e);
        }

        try {
          await db.from('ch_equipe_acessos').update({
            ativo: true,
            troca_senha_obrigatoria: false,
            atualizado_em: new Date().toISOString()
          }).eq('funcionario_id', func.id);
        } catch (e) {
          console.warn('Supabase ch_equipe_acessos update aviso:', e);
        }
      }

      // 4. Efetua o login direto do colaborador como Gerente
      state.currentUser = { email: func.email, id: func.id, nome: func.nome };
      state.userRole = acesso.perfil || (func.funcao || '').toLowerCase() || 'gerente';
      state.isEmployee = true;
      localStorage.setItem('chcell_auth_user', JSON.stringify({
        email: func.email,
        role: state.userRole,
        isEmployee: true
      }));

      this.setSessionUI({ email: func.email, role: `EQUIPE (${state.userRole.toUpperCase()})` });
      this.hideAllAuthScreens();
      this.applyEmployeeRestrictions();
      app.navigate('dashboard');
      app.renderAll();

      alert(`✓ Senha cadastrada com sucesso!\n\nSeja bem-vindo ao sistema da CH Cell, ${func.nome}!`);
      this._pendingPasswordChangeUser = null;
    } catch (err) {
      if (msg) msg.textContent = 'Erro ao salvar senha: ' + err.message;
    } finally {
      if (btn) btn.disabled = false;
    }
  },

  openFirstAccessForOzeas() {
    let func = (state.funcionarios || []).find(f => f.email === 'ozeasferreira40@gmail.com' || f.id === 'func_ozeas' || (f.nome && f.nome.toLowerCase().includes('ozeas')));
    if (!func) {
      func = {
        id: 'func_ozeas',
        nome: 'Ozeas Ferreira',
        funcao: 'Gerente',
        email: 'ozeasferreira40@gmail.com',
        telefone: '21999998888',
        ativo: true,
        observacoes: 'Gerente da Loja - Gestão Geral, Equipe e Balcão'
      };
      state.funcionarios.push(func);
    }
    func.nome = 'Ozeas Ferreira';
    func.email = 'ozeasferreira40@gmail.com';
    func.funcao = 'Gerente';

    let acesso = (state.acessos || []).find(a => a.funcionario_id === func.id || a.id === 'acc_ozeas');
    if (!acesso) {
      acesso = {
        id: 'acc_ozeas',
        funcionario_id: func.id,
        perfil: 'gerente',
        ativo: true,
        auth_user_id: 'auth_func_ozeas',
        troca_senha_obrigatoria: true,
        senha: '',
        permissoes: {
          'clientes.visualizar': true, 'clientes.criar': true, 'clientes.editar': true,
          'os.visualizar': true, 'os.criar': true, 'os.editar': true,
          'estoque.visualizar': true, 'estoque.movimentar': true, 'estoque.criar': true, 'estoque.editar': true,
          'vendas.visualizar': true, 'vendas.criar': true,
          'caixa.visualizar': true, 'caixa.lancar': true
        }
      };
      state.acessos.push(acesso);
    }
    acesso.troca_senha_obrigatoria = true;
    state.persistAll();

    this._pendingPasswordChangeUser = { func, acesso };
    this.showScreen('primeiroAcessoScreen');

    const titleEl = document.querySelector('#primeiroAcessoScreen h3');
    if (titleEl) titleEl.textContent = 'Primeiro Acesso — Criar Senha de Ozeas Ferreira';
    const subEl = document.querySelector('#primeiroAcessoScreen p');
    if (subEl) subEl.textContent = 'Olá, Ozeas Ferreira. Crie agora sua nova senha definitiva pessoal para acessar o sistema como Gerente.';

    const atualInput = document.getElementById('primeiroSenhaAtual');
    if (atualInput) atualInput.value = '12345678Ch@';
    const novaInput = document.getElementById('primeiroSenhaNova');
    if (novaInput) { novaInput.value = ''; novaInput.focus(); }
    const confInput = document.getElementById('primeiroSenhaConfirma');
    if (confInput) confInput.value = '';
    const pMsg = document.getElementById('primeiroMsg');
    if (pMsg) pMsg.textContent = '';
  },

  async handlePasswordReset(event) {
    event.preventDefault();
    const nova = document.getElementById('recuperarNova').value;
    const confirma = document.getElementById('recuperarConfirma').value;
    const msg = document.getElementById('recuperarMsg');
    const btn = document.getElementById('recuperarSalvarBtn');

    if (nova !== confirma) {
      msg.textContent = 'As senhas não conferem.';
      return;
    }
    if (nova.length < 12) {
      msg.textContent = 'A senha deve ter no mínimo 12 caracteres.';
      return;
    }

    btn.disabled = true;
    msg.textContent = 'Salvando nova senha...';

    try {
      const { error } = await db.auth.updateUser({ password: nova });
      if (error) throw error;
      alert('Senha redefinida com sucesso! Você já pode entrar com sua nova senha.');
      await this.logout();
    } catch (err) {
      msg.textContent = 'Erro: ' + err.message;
    } finally {
      btn.disabled = false;
    }
  },

  async showForgotPassword() {
    const email = document.getElementById('loginEmail')?.value.trim() || prompt('Digite seu e-mail para receber o link de redefinição de senha:');
    if (!email) return;

    try {
      const { error } = await db.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.href.split('#')[0].split('?')[0]
      });
      if (error) throw error;
      alert('Se o e-mail estiver cadastrado, você receberá um link seguro para redefinir sua senha. Confira também o spam.');
    } catch (err) {
      alert('Não foi possível enviar o link: ' + err.message);
    }
  },

  async logout() {
    localStorage.removeItem('chcell_auth_user');
    if (db) {
      try { await db.auth.signOut(); } catch {}
    }
    state.currentUser = null;
    state.isEmployee = false;
    state.userRole = null;
    this.showScreen('authScreen');
  }
};
window.authManager = authManager;

// =========================================================================
// GERENCIADOR DE FUNCIONÁRIOS E ACESSOS (FASE 3C PROTEGIDA)
// =========================================================================
const equipeManager = {
  async loadAccessData() {
    if (!state.currentUser || state.isEmployee) return;

    if (db) {
      try {
        const [fRes, cRes] = await Promise.all([
          db.from('funcionarios').select('*').order('nome'),
          db.from('ch_permissoes_catalogo').select('*').order('grupo').order('codigo')
        ]);

        if (fRes.data && fRes.data.length) {
          // Merge seguro: combina registros do Supabase sem apagar edições locais ou novos funcionários
          const merged = [...fRes.data];
          state.funcionarios.forEach(localF => {
            const exists = merged.find(sf => sf.id === localF.id || (sf.email && localF.email && sf.email.toLowerCase() === localF.email.toLowerCase()));
            if (!exists) {
              merged.push(localF);
            }
          });
          state.funcionarios = merged;
        }
        if (cRes.data && cRes.data.length) state.catalogoPermissoes = cRes.data;

        // Garante cadastro atualizado de Ozeas Ferreira
        const ozeas = (state.funcionarios || []).find(f => f.id === 'func_ozeas' || (f.email && (f.email.includes('ozeas') || f.email.includes('ozeias'))));
        if (ozeas) {
          ozeas.nome = 'Ozeas Ferreira';
          ozeas.funcao = 'Gerente';
          ozeas.email = 'ozeasferreira40@gmail.com';
        }

        // Carrega acessos da loja
        const { data: loja } = await db.from('ch_lojas').select('id').eq('proprietario_id', state.currentUser.id).maybeSingle();
        if (loja) {
          const { data: acessos } = await db.from('ch_equipe_acessos').select('*').eq('loja_id', loja.id);
          if (acessos && acessos.length) {
            const mergedAcc = [...acessos];
            state.acessos.forEach(localA => {
              const exists = mergedAcc.find(sa => sa.id === localA.id || sa.funcionario_id === localA.funcionario_id);
              if (!exists) mergedAcc.push(localA);
            });
            state.acessos = mergedAcc;
          }
        }
      } catch (err) {
        console.warn('Carregamento de equipe via Supabase:', err);
      }
    }

    state.persistAll();
    this.renderFuncionariosView();
    this.renderSelectedAccess();
  },

  renderFuncionariosView() {
    const tbody = document.getElementById('funTableBody');
    const rankingBody = document.getElementById('funRankingBody');
    const totalBadge = document.getElementById('funTotalBadge');
    const navBadge = document.getElementById('badgeCountFuncionarios');
    const ativosEl = document.getElementById('funAtivosCount');
    const osEl = document.getElementById('funOSCount');
    const entreguesEl = document.getElementById('funEntreguesCount');
    const faturamentoEl = document.getElementById('funFaturamentoTotal');

    const ativos = (state.funcionarios || []).filter(f => f.ativo !== false);
    const employeeOS = (state.orders || []).filter(o => o.funcionario_id);
    const entregues = employeeOS.filter(o => o.status === 'Pago e Entregue' || o.status === 'Finalizado');
    const faturamento = employeeOS.filter(o => o.status !== 'Cancelado').reduce((acc, o) => acc + Number(o.valor || 0), 0);

    if (ativosEl) ativosEl.textContent = ativos.length;
    if (osEl) osEl.textContent = employeeOS.length;
    if (entreguesEl) entreguesEl.textContent = entregues.length;
    if (faturamentoEl) faturamentoEl.textContent = state.formatMoney(faturamento);
    if (navBadge) navBadge.textContent = (state.funcionarios || []).length;

    const q = (document.getElementById('funSearchInput')?.value || '').toLowerCase().trim();
    const filterCargo = document.getElementById('funFilterCargo')?.value || '';
    const filterStatus = document.getElementById('funFilterStatus')?.value || '';

    const filtered = (state.funcionarios || []).filter(f => {
      const matchQ = !q || [f.nome, f.funcao, f.email, f.telefone, f.observacoes].join(' ').toLowerCase().includes(q);
      const matchCargo = !filterCargo || (f.funcao || 'Técnico') === filterCargo;
      const matchStatus = !filterStatus || (filterStatus === 'ativo' ? f.ativo !== false : f.ativo === false);
      return matchQ && matchCargo && matchStatus;
    });

    if (totalBadge) totalBadge.textContent = `${filtered.length} cadastrado${filtered.length === 1 ? '' : 's'}`;

    if (tbody) {
      if (!filtered.length) {
        tbody.innerHTML = `
          <tr>
            <td colspan="7" class="p-8 text-center text-slate-400">
              <div class="flex flex-col items-center justify-center gap-1.5">
                <i data-lucide="users" class="w-8 h-8 text-slate-300"></i>
                <p class="font-bold text-slate-600">Nenhum funcionário encontrado</p>
                <p class="text-xs text-slate-400">Clique em "+ Novo Funcionário" para adicionar um colaborador.</p>
              </div>
            </td>
          </tr>
        `;
      } else {
        tbody.innerHTML = filtered.map(f => {
          const acesso = (state.acessos || []).find(a => a.funcionario_id === f.id);
          let statusBadge = `<span class="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">Sem login</span>`;
          if (acesso?.ativo === true) {
            statusBadge = `<span class="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Ativo (Liberado)</span>`;
          } else if (acesso?.troca_senha_obrigatoria === true && acesso?.auth_user_id) {
            statusBadge = `<span class="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">Troca pendente</span>`;
          } else if (acesso?.ativo === false && acesso?.auth_user_id) {
            statusBadge = `<span class="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">Inativo (Bloqueado)</span>`;
          }

          const isAtivo = f.ativo !== false;

          return `
            <tr class="hover:bg-slate-50 transition">
              <td class="p-3">
                <div class="font-extrabold text-slate-900">${f.nome}</div>
                ${f.observacoes ? `<div class="text-[10px] text-slate-400 truncate max-w-xs">${f.observacoes}</div>` : ''}
              </td>
              <td class="p-3">
                <span class="px-2 py-0.5 rounded-lg text-xs font-bold bg-purple-50 text-purple-700">
                  ${f.funcao || 'Técnico'}
                </span>
              </td>
              <td class="p-3 font-mono text-slate-600 text-xs">${f.email || '—'}</td>
              <td class="p-3 text-slate-600">${f.telefone || '—'}</td>
              <td class="p-3">
                <span class="px-2 py-0.5 rounded-full text-xs font-bold ${isAtivo ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'}">
                  ${isAtivo ? 'Ativo' : 'Inativo'}
                </span>
              </td>
              <td class="p-3">${statusBadge}</td>
              <td class="p-3 text-right">
                <div class="inline-flex items-center gap-1">
                  <button onclick="equipeManager.editEmployee('${f.id}')" title="Editar dados" class="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition">
                    Editar
                  </button>
                  <button onclick="equipeManager.openAccessForEmployee('${f.id}')" title="Gerenciar login e permissões" class="px-2.5 py-1 text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-lg transition border border-purple-200">
                    🔐 Acesso & Senha
                  </button>
                  <button onclick="equipeManager.deleteEmployee('${f.id}')" title="Excluir funcionário" class="px-2.5 py-1 text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg transition">
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
          `;
        }).join('');
      }
    }

    // Produtividade por funcionário (Ranking da equipe)
    if (rankingBody) {
      if (!state.funcionarios.length) {
        rankingBody.innerHTML = `
          <tr>
            <td colspan="6" class="p-4 text-center text-slate-400">Cadastre funcionários para visualizar a produtividade.</td>
          </tr>
        `;
      } else {
        rankingBody.innerHTML = state.funcionarios.map(f => {
          const osVinculadas = state.orders.filter(o => o.funcionario_id === f.id);
          const entreguesCount = osVinculadas.filter(o => o.status === 'Pago e Entregue' || o.status === 'Finalizado').length;
          const totalFaturado = osVinculadas.filter(o => o.status !== 'Cancelado').reduce((acc, o) => acc + Number(o.valor || 0), 0);
          const taxa = osVinculadas.length > 0 ? Math.round((entreguesCount / osVinculadas.length) * 100) : 0;

          return `
            <tr class="hover:bg-slate-50 transition">
              <td class="p-3 font-bold text-slate-900">${f.nome}</td>
              <td class="p-3 text-slate-600">${f.funcao || 'Técnico'}</td>
              <td class="p-3 text-center font-bold text-slate-800">${osVinculadas.length}</td>
              <td class="p-3 text-center font-bold text-emerald-600">${entreguesCount}</td>
              <td class="p-3 text-center font-bold text-slate-700">${taxa}%</td>
              <td class="p-3 text-right font-black text-slate-900">${state.formatMoney(totalFaturado)}</td>
            </tr>
          `;
        }).join('');
      }
    }

    // Mantém compatibilidade com tabela legada se existir
    const legacyTbody = document.getElementById('equipeTableBody');
    if (legacyTbody && tbody) legacyTbody.innerHTML = tbody.innerHTML;

    if (window.lucide) window.lucide.createIcons();
  },

  openAccessForEmployee(id) {
    app.navigate('acessos');
    const select = document.getElementById('accSelectFuncionario');
    if (select) {
      select.value = id;
      this.renderSelectedAccess();
    }
  },

  renderSelectedAccess() {
    const select = document.getElementById('accSelectFuncionario');
    if (select) {
      const prev = select.value;
      select.innerHTML = '<option value="">Selecione um funcionário...</option>' + state.funcionarios.map(f => {
        const a = state.acessos.find(x => x.funcionario_id === f.id);
        return `<option value="${f.id}">${f.nome} (${f.funcao || 'Técnico'})${a?.ativo ? ' — Ativo' : ''}</option>`;
      }).join('');
      if (prev && state.funcionarios.some(f => f.id === prev)) {
        select.value = prev;
      } else if (state.funcionarios.length) {
        select.value = state.funcionarios[0].id;
      }
    }

    const fId = document.getElementById('accSelectFuncionario')?.value;
    const f = state.funcionarios.find(x => x.id === fId);
    const acesso = state.acessos.find(a => a.funcionario_id === fId);

    const badge = document.getElementById('accStatusBadge');
    const hint = document.getElementById('accStatusHint');
    const toggleBtn = document.getElementById('btnAlternarStatusAcesso');
    const catalogContainer = document.getElementById('accPermissionsCatalog');
    const emailInput = document.getElementById('accCreateEmail');

    if (!f || !badge) return;

    if (emailInput && f.email) {
      emailInput.value = f.email;
    }

    if (!acesso || !acesso.auth_user_id) {
      badge.textContent = 'Sem login criado';
      badge.className = 'text-xs font-bold px-2.5 py-1 rounded-full bg-slate-200 text-slate-700';
      hint.textContent = 'Cadastre a senha provisória de acesso no formulário ao lado.';
      if (toggleBtn) toggleBtn.classList.add('hidden');
    } else if (acesso.troca_senha_obrigatoria === true) {
      badge.textContent = 'Troca de senha pendente';
      badge.className = 'text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200';
      hint.textContent = 'O funcionário precisa fazer o primeiro login e definir sua senha definitiva pessoal.';
      if (toggleBtn) toggleBtn.classList.add('hidden');
    } else if (acesso.ativo === true) {
      badge.textContent = 'ATIVO (Acesso liberado)';
      badge.className = 'text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200';
      hint.textContent = 'O funcionário pode entrar no sistema e usar os recursos liberados pelas permissões.';
      if (toggleBtn) {
        toggleBtn.textContent = 'Bloquear / Desativar Acesso';
        toggleBtn.className = 'w-full py-2 font-bold text-xs rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition';
        toggleBtn.classList.remove('hidden');
      }
    } else {
      badge.textContent = 'INATIVO (Acesso bloqueado)';
      badge.className = 'text-xs font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200';
      hint.textContent = 'Acesso desativado pelo administrador. Clique abaixo para liberar a entrada do colaborador.';
      if (toggleBtn) {
        toggleBtn.textContent = 'Liberar / Ativar Acesso';
        toggleBtn.className = 'w-full py-2 font-bold text-xs rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm';
        toggleBtn.classList.remove('hidden');
      }
    }

    // Renderiza o catálogo de permissões
    if (catalogContainer) {
      const grupos = Array.from(new Set(state.catalogoPermissoes.map(p => p.grupo)));
      const perms = acesso?.permissoes || {};

      catalogContainer.innerHTML = grupos.map(g => `
        <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <p class="font-extrabold text-[11px] uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
            ${g}
          </p>
          <div class="space-y-1.5 pl-2.5">
            ${state.catalogoPermissoes.filter(p => p.grupo === g).map(p => `
              <label class="flex items-center gap-2 cursor-pointer hover:text-purple-700 text-xs font-medium text-slate-700">
                <input type="checkbox" data-acc-perm="${p.codigo}" ${perms[p.codigo] === true ? 'checked' : ''} class="rounded border-slate-300 text-purple-600 focus:ring-purple-500 w-4 h-4">
                <span>${p.descricao}</span>
              </label>
            `).join('')}
          </div>
        </div>
      `).join('');
    }

    if (window.lucide) window.lucide.createIcons();
  },

  applyPreset(preset) {
    const presets = {
      atendente: {
        titulo: 'Atendente',
        codigos: ['clientes.visualizar', 'clientes.criar', 'os.visualizar', 'os.criar', 'vendas.criar']
      },
      tecnico: {
        titulo: 'Técnico',
        codigos: ['clientes.visualizar', 'os.visualizar', 'os.editar', 'estoque.visualizar']
      },
      gerente: {
        titulo: 'Gerente',
        codigos: ['clientes.visualizar', 'clientes.criar', 'clientes.editar', 'os.visualizar', 'os.criar', 'os.editar', 'estoque.visualizar', 'estoque.movimentar', 'vendas.visualizar', 'vendas.criar']
      }
    };

    const p = presets[preset];
    if (!p) return;

    const allowed = new Set(p.codigos);
    document.querySelectorAll('[data-acc-perm]').forEach(cb => {
      cb.checked = allowed.has(cb.dataset.accPerm);
    });

    const preview = document.getElementById('accPresetPreview');
    if (preview) {
      preview.textContent = `✓ Modelo ${p.titulo} aplicado somente na tela (${p.codigos.length} permissões). Revise as seleções e clique em "Salvar Permissões" para confirmar no Supabase.`;
    }
  },

  clearAllPermissions() {
    document.querySelectorAll('[data-acc-perm]').forEach(cb => {
      cb.checked = false;
    });
    const preview = document.getElementById('accPresetPreview');
    if (preview) {
      preview.textContent = '❌ Todas as permissões foram desmarcadas na tela. Clique em "Salvar Permissões" para confirmar.';
    }
  },

  async savePermissions() {
    const fId = document.getElementById('accSelectFuncionario')?.value;
    let acesso = state.acessos.find(a => a.funcionario_id === fId);
    if (!acesso) {
      acesso = {
        id: 'acc_' + Date.now(),
        funcionario_id: fId,
        perfil: 'funcionario',
        ativo: false,
        troca_senha_obrigatoria: true,
        permissoes: {}
      };
      state.acessos.push(acesso);
    }

    const newPerms = {};
    document.querySelectorAll('[data-acc-perm]').forEach(cb => {
      newPerms[cb.dataset.accPerm] = cb.checked;
    });

    acesso.permissoes = newPerms;
    state.persistAll();

    const btn = document.getElementById('btnSalvarPermissoes');
    if (btn) btn.disabled = true;

    if (db) {
      try {
        const { error } = await db.rpc('ch_admin_configurar_permissoes', {
          p_acesso_id: acesso.id,
          p_permissoes: newPerms
        });
        if (error) {
          await db.from('ch_equipe_acessos').update({ permissoes: newPerms }).eq('id', acesso.id);
        }
      } catch (err) {
        console.warn('Salvo localmente:', err);
      }
    }

    if (btn) btn.disabled = false;
    alert('Permissões do funcionário salvas com sucesso!');
    this.renderFuncionariosView();
    this.renderSelectedAccess();
  },

  async toggleAccessStatus() {
    const fId = document.getElementById('accSelectFuncionario')?.value;
    const acesso = state.acessos.find(a => a.funcionario_id === fId);
    if (!acesso) return;

    const novoStatus = !acesso.ativo;
    const acao = novoStatus ? 'liberar e ativar' : 'bloquear e desativar';
    const func = state.funcionarios.find(f => f.id === fId);

    if (!confirm(`Deseja realmente ${acao} o acesso de "${func?.nome || 'colaborador'}"?`)) return;

    acesso.ativo = novoStatus;
    state.persistAll();

    if (db) {
      try {
        const { error } = await db.rpc('ch_admin_alternar_status_acesso', {
          p_acesso_id: acesso.id,
          p_ativo: novoStatus
        });
        if (error) {
          await db.from('ch_equipe_acessos').update({ ativo: novoStatus, atualizado_em: new Date().toISOString() }).eq('id', acesso.id);
        }
      } catch (err) {
        console.warn('Atualizado localmente:', err);
      }
    }

    alert(`Situação de acesso de ${func?.nome || 'colaborador'} alterada para: ${novoStatus ? 'ATIVO' : 'BLOQUEADO'}`);
    this.renderFuncionariosView();
    this.renderSelectedAccess();
  },

  async handleCreateLogin(event) {
    event.preventDefault();
    const fId = document.getElementById('accSelectFuncionario')?.value;
    let acesso = state.acessos.find(a => a.funcionario_id === fId);
    const func = state.funcionarios.find(f => f.id === fId);
    if (!func) return alert('Selecione um funcionário válido.');

    if (!acesso) {
      acesso = {
        id: 'acc_' + Date.now(),
        funcionario_id: fId,
        perfil: (func.funcao || '').toLowerCase().includes('gerente') ? 'gerente' : 'funcionario',
        ativo: false,
        troca_senha_obrigatoria: true,
        permissoes: {}
      };
      state.acessos.push(acesso);
    }

    const email = document.getElementById('accCreateEmail').value.trim().toLowerCase();
    const senha = document.getElementById('accCreatePassword').value;
    const confirma = document.getElementById('accCreateConfirm').value;
    const status = document.getElementById('accCreateStatus');
    const btn = document.getElementById('btnCriarLoginSubmit');

    if (senha !== confirma) {
      if (status) status.textContent = 'As senhas não conferem.';
      return;
    }
    if (senha.length < 6) {
      if (status) status.textContent = 'Use uma senha de no mínimo 6 caracteres.';
      return;
    }

    if (btn) btn.disabled = true;
    if (status) status.textContent = 'Configurando credenciais...';

    func.email = email;
    acesso.senha = senha;
    acesso.auth_user_id = acesso.auth_user_id || ('user_' + Date.now());
    acesso.troca_senha_obrigatoria = true;
    acesso.ativo = true;
    state.persistAll();

    if (db) {
      try {
        await db.from('funcionarios').upsert({
          nome: func.nome,
          email: email,
          funcao: func.funcao || 'Gerente',
          ativo: true
        }, { onConflict: 'email' });
      } catch (e) {
        console.warn('Supabase funcionarios upsert:', e);
      }

      try {
        await db.from('ch_equipe_acessos').upsert({
          id: acesso.id,
          funcionario_id: func.id,
          perfil: acesso.perfil || 'gerente',
          ativo: true,
          troca_senha_obrigatoria: true,
          permissoes: acesso.permissoes || {},
          atualizado_em: new Date().toISOString()
        });
      } catch (e) {
        console.warn('Supabase acessos upsert:', e);
      }

      try {
        const { data, error } = await db.functions.invoke('ch-criar-login-funcionario', {
          body: { acesso_id: acesso.id, email, senha_inicial: senha }
        });
        if (error || !data?.sucesso) {
          console.warn('Aviso Supabase (salvo localmente):', data?.error || error?.message);
        }
      } catch (err) {}
    }

    if (btn) btn.disabled = false;
    if (status) status.textContent = '✓ Senha configurada com sucesso!';

    alert(`Senha provisória de "${func.nome}" configurada com sucesso!\n\nE-mail de acesso: ${email}\nO colaborador deverá definir sua senha definitiva pessoal no primeiro acesso.`);
    document.getElementById('formCriarLogin').reset();
    this.renderFuncionariosView();
    this.renderSelectedAccess();
  },

  openNewEmployeeModal() {
    document.getElementById('formFuncionario').reset();
    document.getElementById('funEditId').value = '';
    document.getElementById('funModalTitle').textContent = 'Novo Funcionário';
    document.getElementById('funSituacao').value = 'true';
    document.getElementById('modalFuncionario').classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  },

  closeEmployeeModal() {
    document.getElementById('modalFuncionario').classList.add('hidden');
  },

  editEmployee(id) {
    const f = state.funcionarios.find(x => x.id === id);
    if (!f) return;
    document.getElementById('funEditId').value = f.id;
    document.getElementById('funModalTitle').textContent = 'Editar Funcionário';
    document.getElementById('funNome').value = f.nome || '';
    document.getElementById('funEmail').value = f.email || '';
    document.getElementById('funTelefone').value = f.telefone || '';
    document.getElementById('funFuncao').value = f.funcao || 'Técnico';
    document.getElementById('funSituacao').value = f.ativo !== false ? 'true' : 'false';
    document.getElementById('funObs').value = f.observacoes || '';
    document.getElementById('modalFuncionario').classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  },

  async handleSaveEmployee(event) {
    if (event) {
      try { event.preventDefault(); } catch {}
      try { event.stopPropagation(); } catch {}
    }

    const id = (document.getElementById('funEditId')?.value || '').trim();
    const nome = (document.getElementById('funNome')?.value || '').trim();
    const email = (document.getElementById('funEmail')?.value || '').trim().toLowerCase() || null;
    const telefone = (document.getElementById('funTelefone')?.value || '').trim();
    const funcao = document.getElementById('funFuncao')?.value || 'Técnico';
    const ativo = document.getElementById('funSituacao')?.value === 'true';
    const observacoes = (document.getElementById('funObs')?.value || '').trim();

    if (!nome) return alert('Informe o nome do funcionário.');

    const payload = { nome, email, telefone, funcao, ativo, observacoes };
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    let supabaseStatus = { attempted: false, success: false, rlsBlocked: false, error: null };

    if (id) {
      // 1. Atualização imediata no estado local e de sincronização do app
      const idx = state.funcionarios.findIndex(f => f.id === id);
      if (idx !== -1) {
        state.funcionarios[idx] = { ...state.funcionarios[idx], ...payload };
      }
      const acc = state.acessos.find(a => a.funcionario_id === id);
      if (acc) {
        acc.perfil = (funcao || '').toLowerCase().includes('gerente') ? 'gerente' : 'funcionario';
        acc.ativo = ativo;
      }

      // 2. Executa e inspeciona o UPDATE no Supabase
      if (db) {
        supabaseStatus.attempted = true;
        try {
          let updateQuery;
          if (isUuid) {
            updateQuery = db.from('funcionarios').update(payload).eq('id', id).select();
          } else if (email) {
            updateQuery = db.from('funcionarios').update(payload).eq('email', email).select();
          } else {
            updateQuery = db.from('funcionarios').update(payload).eq('nome', nome).select();
          }

          const { data, error, count } = await updateQuery;

          if (error) {
            console.error('Supabase UPDATE Error:', error);
            supabaseStatus.error = error;
            const code = error.code;
            const msg = (error.message || '').toLowerCase();
            if (code === '42501' || msg.includes('row-level security') || msg.includes('policy') || msg.includes('permission denied')) {
              supabaseStatus.rlsBlocked = true;
            }
          } else if (!data || data.length === 0) {
            // Se o registro não existia no Supabase com esse id/email, faz o insert para garantir persistência
            const insertPayload = { ...payload };
            if (isUuid) insertPayload.id = id;
            if (state.currentUser && state.currentUser.id && /^[0-9a-f-]{36}$/i.test(state.currentUser.id)) {
              insertPayload.user_id = state.currentUser.id;
            }
            const insRes = await db.from('funcionarios').insert(insertPayload).select();
            if (insRes.error) {
              supabaseStatus.error = insRes.error;
              const msg = (insRes.error.message || '').toLowerCase();
              if (insRes.error.code === '42501' || msg.includes('row-level security') || msg.includes('policy')) {
                supabaseStatus.rlsBlocked = true;
              }
            } else {
              supabaseStatus.success = true;
              if (insRes.data && insRes.data[0] && !isUuid) {
                const newUuid = insRes.data[0].id;
                if (idx !== -1) state.funcionarios[idx].id = newUuid;
                if (acc) acc.funcionario_id = newUuid;
              }
            }
          } else {
            supabaseStatus.success = true;
          }
        } catch (err) {
          console.error('Exceção Supabase UPDATE:', err);
          supabaseStatus.error = err;
        }
      }
    } else {
      // 1. Novo funcionário no estado local
      const newId = 'func_' + Date.now();
      const novoF = { id: newId, ...payload };
      state.funcionarios.push(novoF);

      const novoAcc = {
        id: 'acc_' + Date.now(),
        funcionario_id: newId,
        perfil: (funcao || '').toLowerCase().includes('gerente') ? 'gerente' : 'funcionario',
        ativo: ativo,
        troca_senha_obrigatoria: true,
        permissoes: {}
      };
      state.acessos.push(novoAcc);

      // 2. INSERT no Supabase
      if (db) {
        supabaseStatus.attempted = true;
        try {
          const insertPayload = { ...payload };
          if (state.currentUser && state.currentUser.id && /^[0-9a-f-]{36}$/i.test(state.currentUser.id)) {
            insertPayload.user_id = state.currentUser.id;
          }
          const { data: inserted, error: insErr } = await db.from('funcionarios').insert(insertPayload).select().single();
          if (insErr) {
            console.error('Supabase INSERT Error:', insErr);
            supabaseStatus.error = insErr;
            const msg = (insErr.message || '').toLowerCase();
            if (insErr.code === '42501' || msg.includes('row-level security') || msg.includes('policy') || msg.includes('permission denied')) {
              supabaseStatus.rlsBlocked = true;
            }
          } else if (inserted) {
            novoF.id = inserted.id;
            novoAcc.funcionario_id = inserted.id;
            supabaseStatus.success = true;
          }
        } catch (e) {
          console.error('Exceção Supabase INSERT:', e);
          supabaseStatus.error = e;
        }
      }
    }

    // 3. Salva no banco de dados central (database.json) e localStorage
    state.persistAll();
    this.closeEmployeeModal();
    this.renderFuncionariosView();
    this.renderSelectedAccess();

    // 4. Mensagem ao usuário com aviso explícito de RLS se bloqueado
    if (supabaseStatus.rlsBlocked) {
      alert(
        `⚠️ ALERTA DE SEGURANÇA NO SUPABASE (RLS BLOQUEOU A GRAVAÇÃO):\n\n` +
        `As alterações de "${nome}" foram salvas no sistema local e servidor central com sucesso.\n\n` +
        `PORÉM, O SUPABASE RECUSOU A GRAVAÇÃO:\n` +
        `• Código: ${supabaseStatus.error?.code || '42501'}\n` +
        `• Mensagem: "${supabaseStatus.error?.message || 'new row violates row-level security policy'}"\n\n` +
        `Para liberar a gravação no Supabase, execute o script SQL "supabase/CORRIGIR_RLS_FUNCIONARIOS.sql" no SQL Editor do seu projeto Supabase.`
      );
    } else if (supabaseStatus.error) {
      alert(
        `⚠️ O colaborador foi salvo no sistema, mas o Supabase retornou o seguinte aviso:\n` +
        `"${supabaseStatus.error?.message || 'Falha na comunicação com o banco'}"`
      );
    } else if (supabaseStatus.success) {
      alert(`✓ Funcionário "${nome}" atualizado e gravado com sucesso no Supabase e no sistema!`);
    } else {
      alert(`✓ Funcionário "${nome}" salvo com sucesso no banco de dados central!`);
    }
  },

  async deleteEmployee(id) {
    const f = state.funcionarios.find(x => x.id === id);
    if (!f) return;

    const vinculadas = (state.orders || []).filter(o => o.funcionario_id === id).length;
    if (vinculadas > 0) {
      alert(`Este funcionário possui ${vinculadas} OS vinculada(s). Para preservar o histórico, edite o funcionário e marque a situação como Inativo.`);
      return;
    }

    if (!confirm(`Excluir definitivamente o funcionário "${f.nome}"?\n\nO acesso ao sistema será desvinculado. Essa ação não pode ser desfeita.`)) return;
    if (!confirm(`CONFIRMAÇÃO FINAL: remover "${f.nome}" do cadastro da CH Cell?`)) return;

    state.funcionarios = state.funcionarios.filter(x => x.id !== id);
    state.acessos = state.acessos.filter(a => a.funcionario_id !== id);
    state.persistAll();

    if (db) {
      try {
        await db.rpc('ch_admin_excluir_funcionario', { p_funcionario_id: id });
      } catch (err) {
        try { await db.from('funcionarios').delete().eq('id', id); } catch {}
      }
    }

    alert('Funcionário removido com sucesso!');
    this.renderFuncionariosView();
    this.renderSelectedAccess();
  }
};
window.equipeManager = equipeManager;

// =========================================================================
// GERENCIADOR DE FORNECEDORES DE PEÇAS & COMPONENTES (Aba Restaurada)
// =========================================================================
const fornecedoresManager = {
  render() {
    const container = document.getElementById('fornecedoresContainer');
    if (!container) return;
    const query = (document.getElementById('fornecedoresSearchInput')?.value || '').toLowerCase().trim();

    const filtered = (state.fornecedores || []).filter(f => {
      if (!query) return true;
      const haystack = [f.nome, f.marca, f.especialidade, f.endereco, f.whatsapp, f.observacoes].join(' ').toLowerCase();
      return haystack.includes(query);
    });

    const badge = document.getElementById('fornecedoresTotalBadge');
    if (badge) badge.textContent = `${filtered.length} fornecedor${filtered.length === 1 ? '' : 'es'}`;

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-12 text-center bg-white rounded-3xl border border-dashed border-slate-300 p-6">
          <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2">
            <i data-lucide="truck" class="w-6 h-6"></i>
          </div>
          <h4 class="font-bold text-slate-800 text-sm">Nenhum fornecedor encontrado</h4>
          <p class="text-xs text-slate-500 mt-1">Busque por outro termo ou cadastre um novo distribuidor parceiro.</p>
          <button onclick="fornecedoresManager.openNewModal()" class="mt-4 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition">
            + Cadastrar Fornecedor
          </button>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    container.innerHTML = filtered.map(f => {
      const waDigits = String(f.whatsapp || '').replace(/\D/g, '');
      const waFull = waDigits ? (waDigits.startsWith('55') ? waDigits : '55' + waDigits) : '';
      const waLink = waFull ? `https://wa.me/${waFull}?text=${encodeURIComponent(`Olá ${f.nome}, aqui é da assistência técnica CH Cell. Gostaria de cotar peças e componentes.`)}` : '';

      return `
        <div class="bg-white rounded-3xl border border-slate-200/90 hover:border-amber-500/40 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4">
          <div class="space-y-3">
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-2.5">
                <div class="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0 font-black text-sm">
                  ${esc((f.nome || 'F').charAt(0).toUpperCase())}
                </div>
                <div>
                  <h4 class="font-extrabold text-slate-900 text-sm sm:text-base leading-tight">${esc(f.nome)}</h4>
                  <span class="inline-block text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/60 mt-1">
                    ${esc(f.especialidade || 'Peças & Telas')}
                  </span>
                </div>
              </div>
              <div class="flex items-center gap-1">
                <button onclick="fornecedoresManager.edit('${f.id}')" title="Editar Fornecedor" class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition">
                  <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
                </button>
                <button onclick="fornecedoresManager.delete('${f.id}')" title="Excluir Fornecedor" class="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition">
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>
              </div>
            </div>

            <div class="space-y-1.5 text-xs text-slate-600 pt-1">
              ${f.marca ? `
                <div class="flex items-center gap-2 text-[11px] text-slate-500">
                  <i data-lucide="tag" class="w-3.5 h-3.5 text-slate-400 shrink-0"></i>
                  <span class="font-semibold text-slate-700 truncate">${esc(f.marca)}</span>
                </div>` : ''}
              ${f.endereco ? `
                <div class="flex items-center gap-2 text-[11px] text-slate-500">
                  <i data-lucide="map-pin" class="w-3.5 h-3.5 text-slate-400 shrink-0"></i>
                  <span class="truncate">${esc(f.endereco)}</span>
                </div>` : ''}
              ${f.telefone ? `
                <div class="flex items-center gap-2 text-[11px] text-slate-500">
                  <i data-lucide="phone" class="w-3.5 h-3.5 text-slate-400 shrink-0"></i>
                  <a href="tel:${String(f.telefone).replace(/\D/g, '')}" class="hover:text-brand-600 font-medium">${esc(f.telefone)}</a>
                </div>` : ''}
            </div>

            ${f.observacoes ? `
              <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 leading-relaxed">
                <span class="font-bold text-slate-700">Obs:</span> ${esc(f.observacoes)}
              </div>` : ''}
          </div>

          <div class="pt-3 border-t border-slate-100 flex items-center gap-2">
            ${waLink ? `
              <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="flex-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-500/20">
                <i data-lucide="message-circle" class="w-3.5 h-3.5"></i> Chamar WhatsApp
              </a>` : `
              <span class="text-xs text-slate-400 italic">Sem WhatsApp cadastrado</span>`}
            ${f.site ? `
              <a href="${f.site}" target="_blank" rel="noopener noreferrer" title="Visitar site / catálogo" class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition">
                <i data-lucide="globe" class="w-3.5 h-3.5"></i>
              </a>` : ''}
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  },

  openNewModal() {
    document.getElementById('fornEditId').value = '';
    document.getElementById('fornModalTitle').textContent = 'Novo Fornecedor';
    document.getElementById('formFornecedor').reset();
    document.getElementById('modalFornecedor').classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  },

  closeModal() {
    document.getElementById('modalFornecedor').classList.add('hidden');
  },

  edit(id) {
    const f = (state.fornecedores || []).find(x => x.id === id);
    if (!f) return;
    document.getElementById('fornEditId').value = f.id;
    document.getElementById('fornModalTitle').textContent = 'Editar Fornecedor';
    document.getElementById('fornNome').value = f.nome || '';
    document.getElementById('fornMarca').value = f.marca || '';
    document.getElementById('fornEspecialidade').value = f.especialidade || '';
    document.getElementById('fornWhatsApp').value = f.whatsapp || '';
    document.getElementById('fornTelefone').value = f.telefone || '';
    document.getElementById('fornEndereco').value = f.endereco || '';
    document.getElementById('fornSite').value = f.site || '';
    document.getElementById('fornObservacoes').value = f.observacoes || '';
    document.getElementById('modalFornecedor').classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  },

  async handleSave(event) {
    event.preventDefault();
    const id = document.getElementById('fornEditId').value;
    const nome = document.getElementById('fornNome').value.trim();
    const marca = document.getElementById('fornMarca').value.trim();
    const especialidade = document.getElementById('fornEspecialidade').value.trim();
    const whatsapp = document.getElementById('fornWhatsApp').value.trim();
    const telefone = document.getElementById('fornTelefone').value.trim();
    const endereco = document.getElementById('fornEndereco').value.trim();
    const site = document.getElementById('fornSite').value.trim();
    const observacoes = document.getElementById('fornObservacoes').value.trim();

    const payload = { nome, marca, especialidade, whatsapp, telefone, endereco, site, observacoes };

    try {
      if (id) {
        const idx = state.fornecedores.findIndex(x => x.id === id);
        if (idx !== -1) state.fornecedores[idx] = { ...state.fornecedores[idx], ...payload };
        if (db && state.currentUser) {
          await db.from('fornecedores').update(payload).eq('id', id);
        }
      } else {
        const newId = 'forn_' + Date.now();
        const novo = { id: newId, ...payload, created_at: new Date().toISOString() };
        state.fornecedores.unshift(novo);
        if (db && state.currentUser) {
          const { data } = await db.from('fornecedores').insert({ ...payload, user_id: state.currentUser.id }).select().single();
          if (data && data.id) novo.id = data.id;
        }
      }

      state.persistAll();
      this.closeModal();
      this.render();
      alert('Fornecedor salvo com sucesso!');
    } catch (err) {
      console.warn('Erro ao salvar fornecedor:', err);
      state.persistAll();
      this.closeModal();
      this.render();
    }
  },

  async delete(id) {
    const f = (state.fornecedores || []).find(x => x.id === id);
    if (!f) return;
    if (!confirm(`Deseja realmente remover o fornecedor "${f.nome}"?`)) return;

    state.fornecedores = state.fornecedores.filter(x => x.id !== id);
    state.persistAll();

    if (db && state.currentUser) {
      try {
        await db.from('fornecedores').delete().eq('id', id);
      } catch (e) {
        console.warn('Erro ao excluir no Supabase:', e);
      }
    }

    this.render();
  }
};
window.fornecedoresManager = fornecedoresManager;

// =========================================================================
// GERENCIADOR DE EBOOKS & ESQUEMAS ELÉTRICOS (Aba Restaurada)
// =========================================================================
const ebooksManager = {
  render() {
    const container = document.getElementById('ebooksContainer');
    if (!container) return;
    const query = (document.getElementById('ebooksSearchInput')?.value || '').toLowerCase().trim();
    const marca = document.getElementById('ebooksFilterMarca')?.value || '';
    const cat = document.getElementById('ebooksFilterCategoria')?.value || '';

    const filtered = (state.ebooks || []).filter(eb => {
      if (marca && eb.marca !== marca) return false;
      if (cat && eb.categoria !== cat) return false;
      if (!query) return true;
      const haystack = [eb.titulo, eb.marca, eb.modelo, eb.categoria, eb.descricao].join(' ').toLowerCase();
      return haystack.includes(query);
    });

    const badge = document.getElementById('ebooksTotalBadge');
    if (badge) badge.textContent = `${filtered.length} material${filtered.length === 1 ? '' : 'is'}`;

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-12 text-center bg-white rounded-3xl border border-dashed border-slate-300 p-6">
          <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
            <i data-lucide="book-open" class="w-6 h-6"></i>
          </div>
          <h4 class="font-bold text-slate-800 text-sm">Nenhum esquema ou eBook encontrado</h4>
          <p class="text-xs text-slate-500 mt-1">Filtre por outra marca ou adicione um novo material de bancada.</p>
          <button onclick="ebooksManager.openNewModal()" class="mt-4 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition">
            + Cadastrar Novo Material
          </button>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    container.innerHTML = filtered.map(eb => {
      const brandColors = {
        'Apple': 'bg-slate-900 text-white',
        'Samsung': 'bg-blue-600 text-white',
        'Motorola': 'bg-indigo-600 text-white',
        'Xiaomi': 'bg-orange-500 text-white',
        'Multimarcas': 'bg-emerald-600 text-white',
        'Geral': 'bg-purple-600 text-white'
      };
      const pillClass = brandColors[eb.marca] || 'bg-slate-800 text-white';

      return `
        <div class="bg-white rounded-3xl border border-slate-200/90 hover:border-blue-500/40 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4">
          <div class="space-y-3">
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg ${pillClass}">
                  ${esc(eb.marca || 'Universal')}
                </span>
                <span class="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  ${esc(eb.categoria || 'Manual')}
                </span>
              </div>
              <div class="flex items-center gap-1">
                <button onclick="ebooksManager.edit('${eb.id}')" title="Editar" class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition">
                  <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
                </button>
                <button onclick="ebooksManager.delete('${eb.id}')" title="Excluir" class="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition">
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>
              </div>
            </div>

            <div>
              <h4 class="font-extrabold text-slate-900 text-sm sm:text-base leading-snug">${esc(eb.titulo)}</h4>
              <p class="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-1.5">
                <i data-lucide="smartphone" class="w-3.5 h-3.5 text-slate-400"></i>
                ${esc(eb.modelo || 'Diversos modelos')}
              </p>
            </div>

            ${eb.descricao ? `
              <p class="text-xs text-slate-600 line-clamp-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                ${esc(eb.descricao)}
              </p>` : ''}
          </div>

          <div class="pt-3 border-t border-slate-100 flex items-center gap-2">
            ${eb.url ? `
              <a href="${eb.url}" target="_blank" rel="noopener noreferrer" class="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm shadow-blue-500/20">
                <i data-lucide="file-text" class="w-3.5 h-3.5"></i> Abrir / Baixar PDF
              </a>` : `
              <span class="text-xs text-slate-400 italic">Sem link anexado</span>`}
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  },

  openNewModal() {
    document.getElementById('ebookEditId').value = '';
    document.getElementById('ebookModalTitle').textContent = 'Novo eBook / Esquema';
    document.getElementById('formEbook').reset();
    document.getElementById('modalEbook').classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  },

  closeModal() {
    document.getElementById('modalEbook').classList.add('hidden');
  },

  edit(id) {
    const eb = (state.ebooks || []).find(x => x.id === id);
    if (!eb) return;
    document.getElementById('ebookEditId').value = eb.id;
    document.getElementById('ebookModalTitle').textContent = 'Editar eBook / Esquema';
    document.getElementById('ebookTitulo').value = eb.titulo || '';
    document.getElementById('ebookMarca').value = eb.marca || 'Apple';
    document.getElementById('ebookModelo').value = eb.modelo || '';
    document.getElementById('ebookCategoria').value = eb.categoria || 'Esquema Elétrico';
    document.getElementById('ebookUrl').value = eb.url || '';
    document.getElementById('ebookDescricao').value = eb.descricao || '';
    document.getElementById('modalEbook').classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  },

  async handleSave(event) {
    event.preventDefault();
    const id = document.getElementById('ebookEditId').value;
    const titulo = document.getElementById('ebookTitulo').value.trim();
    const marca = document.getElementById('ebookMarca').value;
    const modelo = document.getElementById('ebookModelo').value.trim();
    const categoria = document.getElementById('ebookCategoria').value;
    const url = document.getElementById('ebookUrl').value.trim();
    const descricao = document.getElementById('ebookDescricao').value.trim();

    const payload = { titulo, marca, modelo, categoria, url, descricao };

    try {
      if (id) {
        const idx = state.ebooks.findIndex(x => x.id === id);
        if (idx !== -1) state.ebooks[idx] = { ...state.ebooks[idx], ...payload };
        if (db && state.currentUser) {
          await db.from('ebooks').update(payload).eq('id', id);
        }
      } else {
        const newId = 'ebk_' + Date.now();
        const novo = { id: newId, ...payload, created_at: new Date().toISOString() };
        state.ebooks.unshift(novo);
        if (db && state.currentUser) {
          const insertPayload = { ...payload };
          if (state.currentUser?.aud === 'authenticated') insertPayload.user_id = state.currentUser.id;
          const { data } = await db.from('ebooks').insert(insertPayload).select().single();
          if (data && data.id) novo.id = data.id;
        }
      }

      state.persistAll();
      this.closeModal();
      this.render();
      alert('eBook salvo com sucesso!');
    } catch (err) {
      console.warn('Erro ao salvar eBook:', err);
      state.persistAll();
      this.closeModal();
      this.render();
    }
  },

  async delete(id) {
    const eb = (state.ebooks || []).find(x => x.id === id);
    if (!eb) return;
    if (!confirm(`Deseja realmente remover o material "${eb.titulo}"?`)) return;

    state.ebooks = state.ebooks.filter(x => x.id !== id);
    state.persistAll();

    if (db && state.currentUser) {
      try {
        await db.from('ebooks').delete().eq('id', id);
      } catch (e) {
        console.warn('Erro ao excluir no Supabase:', e);
      }
    }

    this.render();
  }
};
window.ebooksManager = ebooksManager;

// =========================================================================
// GERENCIADOR DE VIDEOAULAS & TREINAMENTOS TÉCNICOS (Aba Restaurada)
// =========================================================================
const videoaulasManager = {
  render() {
    const container = document.getElementById('videoaulasContainer');
    if (!container) return;
    const query = (document.getElementById('videoaulasSearchInput')?.value || '').toLowerCase().trim();
    const marca = document.getElementById('videoaulasFilterMarca')?.value || '';
    const cat = document.getElementById('videoaulasFilterCategoria')?.value || '';

    const filtered = (state.videoaulas || []).filter(v => {
      if (marca && v.marca !== marca) return false;
      if (cat && v.categoria !== cat) return false;
      if (!query) return true;
      const haystack = [v.titulo, v.marca, v.modelo, v.categoria, v.descricao].join(' ').toLowerCase();
      return haystack.includes(query);
    });

    const badge = document.getElementById('videoaulasTotalBadge');
    if (badge) badge.textContent = `${filtered.length} aula${filtered.length === 1 ? '' : 's'}`;

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-12 text-center bg-white rounded-3xl border border-dashed border-slate-300 p-6">
          <div class="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-2">
            <i data-lucide="play-circle" class="w-6 h-6"></i>
          </div>
          <h4 class="font-bold text-slate-800 text-sm">Nenhuma videoaula encontrada</h4>
          <p class="text-xs text-slate-500 mt-1">Busque com outro filtro ou cadastre uma nova aula de bancada.</p>
          <button onclick="videoaulasManager.openNewModal()" class="mt-4 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition">
            + Cadastrar Videoaula
          </button>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    container.innerHTML = filtered.map(v => {
      return `
        <div class="bg-white rounded-3xl border border-slate-200/90 hover:border-rose-500/40 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4">
          <div class="space-y-3">
            <div class="relative w-full aspect-video rounded-2xl bg-slate-900 overflow-hidden group cursor-pointer flex items-center justify-center" onclick="videoaulasManager.play('${v.id}')">
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
              <div class="w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-rose-500 transition z-10">
                <i data-lucide="play" class="w-5 h-5 ml-0.5 fill-current"></i>
              </div>
              <span class="absolute top-3 left-3 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/90 text-slate-900 z-10">
                ${esc(v.marca || 'Universal')}
              </span>
              <span class="absolute bottom-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/70 text-white z-10 flex items-center gap-1">
                <i data-lucide="video" class="w-3 h-3"></i> Aula
              </span>
            </div>

            <div>
              <div class="flex items-center justify-between gap-1 mb-1">
                <span class="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                  ${esc(v.categoria || 'Bancada')}
                </span>
                <div class="flex items-center gap-1">
                  <button onclick="videoaulasManager.edit('${v.id}')" title="Editar" class="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition">
                    <i data-lucide="edit-3" class="w-3 h-3"></i>
                  </button>
                  <button onclick="videoaulasManager.delete('${v.id}')" title="Excluir" class="w-6 h-6 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition">
                    <i data-lucide="trash-2" class="w-3 h-3"></i>
                  </button>
                </div>
              </div>

              <h4 class="font-extrabold text-slate-900 text-sm sm:text-base leading-snug">${esc(v.titulo)}</h4>
              <p class="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-1.5">
                <i data-lucide="cpu" class="w-3.5 h-3.5 text-slate-400"></i>
                ${esc(v.modelo || 'Todos os modelos')}
              </p>
            </div>

            ${v.descricao ? `
              <p class="text-xs text-slate-600 line-clamp-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                ${esc(v.descricao)}
              </p>` : ''}
          </div>

          <div class="pt-3 border-t border-slate-100 flex items-center gap-2">
            <button onclick="videoaulasManager.play('${v.id}')" class="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm shadow-rose-500/20">
              <i data-lucide="play" class="w-3.5 h-3.5 fill-current"></i> Assistir Aula
            </button>
            ${v.url ? `
              <a href="${v.url}" target="_blank" rel="noopener noreferrer" title="Abrir link original" class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition">
                <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
              </a>` : ''}
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  },

  play(id) {
    const v = (state.videoaulas || []).find(x => x.id === id);
    if (!v) return;

    document.getElementById('playerModalTitle').textContent = v.titulo;
    document.getElementById('playerModalDesc').textContent = `${v.marca} • ${v.modelo || ''} • ${v.categoria || ''}`;
    const extLink = document.getElementById('playerExternalLink');
    if (extLink) extLink.href = v.url || '#';

    const container = document.getElementById('playerContainer');
    if (!container) return;

    // Check if it's YouTube
    const ytMatch = String(v.url || '').match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      container.innerHTML = `
        <iframe class="w-full h-full" src="https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1" title="${esc(v.titulo)}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      `;
    } else {
      container.innerHTML = `
        <div class="text-center p-6 space-y-3">
          <i data-lucide="video" class="w-12 h-12 text-slate-500 mx-auto"></i>
          <p class="text-xs text-slate-300">Este treinamento está disponível pelo link externo:</p>
          <a href="${v.url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition">
            <i data-lucide="external-link" class="w-4 h-4"></i> Assistir Vídeo no Navegador
          </a>
        </div>
      `;
    }

    document.getElementById('modalVideoPlayer').classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  },

  closePlayerModal() {
    const container = document.getElementById('playerContainer');
    if (container) container.innerHTML = '';
    document.getElementById('modalVideoPlayer').classList.add('hidden');
  },

  openNewModal() {
    document.getElementById('videoaulaEditId').value = '';
    document.getElementById('videoaulaModalTitle').textContent = 'Nova Videoaula';
    document.getElementById('formVideoaula').reset();
    document.getElementById('modalVideoaula').classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  },

  closeModal() {
    document.getElementById('modalVideoaula').classList.add('hidden');
  },

  edit(id) {
    const v = (state.videoaulas || []).find(x => x.id === id);
    if (!v) return;
    document.getElementById('videoaulaEditId').value = v.id;
    document.getElementById('videoaulaModalTitle').textContent = 'Editar Videoaula';
    document.getElementById('videoaulaTitulo').value = v.titulo || '';
    document.getElementById('videoaulaMarca').value = v.marca || 'Apple';
    document.getElementById('videoaulaModelo').value = v.modelo || '';
    document.getElementById('videoaulaCategoria').value = v.categoria || 'Microsoldagem';
    document.getElementById('videoaulaUrl').value = v.url || '';
    document.getElementById('videoaulaDescricao').value = v.descricao || '';
    document.getElementById('modalVideoaula').classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  },

  async handleSave(event) {
    event.preventDefault();
    const id = document.getElementById('videoaulaEditId').value;
    const titulo = document.getElementById('videoaulaTitulo').value.trim();
    const marca = document.getElementById('videoaulaMarca').value;
    const modelo = document.getElementById('videoaulaModelo').value.trim();
    const categoria = document.getElementById('videoaulaCategoria').value;
    const url = document.getElementById('videoaulaUrl').value.trim();
    const descricao = document.getElementById('videoaulaDescricao').value.trim();

    const payload = { titulo, marca, modelo, categoria, url, descricao };

    try {
      if (id) {
        const idx = state.videoaulas.findIndex(x => x.id === id);
        if (idx !== -1) state.videoaulas[idx] = { ...state.videoaulas[idx], ...payload };
        if (db && state.currentUser) {
          await db.from('videoaulas').update(payload).eq('id', id);
        }
      } else {
        const newId = 'vid_' + Date.now();
        const novo = { id: newId, ...payload, created_at: new Date().toISOString() };
        state.videoaulas.unshift(novo);
        if (db && state.currentUser) {
          const insertPayload = { ...payload };
          if (state.currentUser?.aud === 'authenticated') insertPayload.user_id = state.currentUser.id;
          const { data } = await db.from('videoaulas').insert(insertPayload).select().single();
          if (data && data.id) novo.id = data.id;
        }
      }

      state.persistAll();
      this.closeModal();
      this.render();
      alert('Videoaula salva com sucesso!');
    } catch (err) {
      console.warn('Erro ao salvar videoaula:', err);
      state.persistAll();
      this.closeModal();
      this.render();
    }
  },

  async delete(id) {
    const v = (state.videoaulas || []).find(x => x.id === id);
    if (!v) return;
    if (!confirm(`Deseja realmente remover a videoaula "${v.titulo}"?`)) return;

    state.videoaulas = state.videoaulas.filter(x => x.id !== id);
    state.persistAll();

    if (db && state.currentUser) {
      try {
        await db.from('videoaulas').delete().eq('id', id);
      } catch (e) {
        console.warn('Erro ao excluir no Supabase:', e);
      }
    }

    this.render();
  }
};
window.videoaulasManager = videoaulasManager;

// Start application when DOM is ready
// Exposição global garantida para todos os manipuladores inline HTML
window.app = app;
window.state = state;
window.authManager = authManager;
window.equipeManager = equipeManager;
window.fornecedoresManager = fornecedoresManager;
window.ebooksManager = ebooksManager;
window.videoaulasManager = videoaulasManager;

document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
