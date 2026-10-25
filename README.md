# 📱 CH Cell Pro — Sistema de Gestão para Assistência Técnica de Celulares

Sistema completo para gestão de assistências técnicas e lojas de smartphones, projetado para operar com alta performance, responsividade móvel e sincronização em tempo real entre computadores e dispositivos móveis.

---

## 🚀 Principais Módulos e Recursos

- **📊 Dashboard Operacional:** Métricas de ordens de serviço (Em Análise, Em Serviço, Finalizadas), faturamento diário consolidado (OS + PDV) e avisos de peças baixas no estoque.
- **🛠️ Gestão de Ordens de Serviço (OS):** Abertura ágil de chamados, checklist visual de 3 estados (OK, Atenção, Não test.), inserção de fotos de entrada e cálculo de orçamentos.
- **📱 Rastreamento Público ao Vivo:** Tela de acompanhamento pelo cliente com barra de progresso em 4 etapas, tempo decorrido, laudo técnico e botão direto para falar no WhatsApp.
- **🛒 PDV & Venda de Balcão:** Carrinho rápido, seleção visual de peças, formas de pagamento variadas e **baixa automática imediata de estoque**.
- **📦 Estoque com Controle de Entrada e Saída:** Saldo em tempo real, badges de estoque baixo/zerado, e modal para **subir (+ Entrada)** ou **abaixar (- Saída)** peças com histórico de motivos.
- **👥 Gestão de Equipe & Permissões:** Controle de acessos por colaborador (Administrador, Gerente, Atendente, Técnico) com **etapa obrigatória de troca de senha no primeiro acesso**.
- **📚 Biblioteca Técnica & Fornecedores:** Catálogo completo de fornecedores homologados de peças originais, apostilas/e-books de esquemas elétricos e videoaulas de bancada.
- **🖨️ Impressão Térmica de Comprovantes:** Geração de via do cliente para bobina de 80mm e 58mm.
- **🔄 Sincronização em Tempo Real (PC & Celular):** Sincronização automática a cada 3,5 segundos com banco de dados centralizado.

---

## ⚡ Como Rodar Localmente (PC e Celular na mesma rede)

1. Clone o repositório:
```bash
git clone https://github.com/charlesmelo274-sys/ch-cell-pro.git
cd ch-cell-pro
```

2. Inicie o servidor PowerShell integrado:
```powershell
powershell -ExecutionPolicy Bypass -File .\server.ps1
```

3. Acesse:
- **No PC:** `http://localhost:3000`
- **No Celular:** `http://<SEU_IP_LOCAL>:3000`

---

## ☁️ Deploy Instantâneo na Vercel

O projeto já inclui o arquivo `vercel.json` configurado para deploy com 1 clique:

1. Acesse [vercel.com/new](https://vercel.com/new).
2. Conecte sua conta do GitHub e selecione o repositório **`charlesmelo274-sys/ch-cell-pro`**.
3. Clique em **Deploy**.
4. Em menos de 1 minuto, seu sistema estará online com certificado SSL gratuito e domínio global!

---

## 🗄️ Integração com Supabase (Banco de Dados em Nuvem)

O projeto inclui o script SQL completo na pasta `supabase/schema.sql` e Edge Functions em `supabase/functions/`:

1. Crie um projeto no [Supabase](https://supabase.com).
2. Acesse o **SQL Editor** do projeto.
3. Copie e cole todo o conteúdo do arquivo `supabase/schema.sql` e clique em **Run**.
4. Configure as chaves `SUPABASE_URL` e `SUPABASE_ANON` em `app.js` para habilitar a sincronização em nuvem completa.

---

## 🔐 Credenciais Padrão do Sistema

- **Administrador Mestre (Charles):**
  - **E-mail:** `charlesmelo274@gmail.com`
  - **Senha:** `88511611Ch`

- **Gerente (Ozéias):**
  - **Login:** `ozeas@chcell.com` (ou usuário `ozeas`)
  - **Senha inicial:** `12345678Ch@` (exige cadastro de senha pessoal no primeiro acesso)
