# Projeto SIGEA

## 1. Análise de concorrentes

### 1.1 Google Classroom

**O que é / destaque:** plataforma gratuita (para muitas instituições) integrada ao Workspace for Education; oferece gestão de turmas, atribuições, integração profunda com Google Drive/Docs e funcionalidades de economia de tempo.

**Pontos fortes**

* Integração nativa com Google Drive, Docs, Forms - acelera criação e entrega de atividades.
* Interface simples e direta - fácil adoção por professores/estudantes;
* Atualizações constantes com pequenas funcionalidades de alto impacto (ex.: gerenciamento de grupos, AI/NotebookLM integrações recentes).

**Pontos fracos**

* Funcionalidades avançadas de LMS (relatórios detalhados, personalização profunda) são limitadas - foco é usabilidade básica;
* Dependência do ecossistema Google para muitos recursos; pode ser um problema para instituições que não usam Google.

**Funcionalidades interessantes a considerar para SIGEA**

* Integração simples com armazenamento em nuvem (API/links para arquivos);
* Ferramenta mínima para agrupamento de alunos (grupos prontos para atribuições).

---

### 1.2 Moodle

**O que é / destaque:** LMS open-source altamente customizável usado por muitas instituições; suporta quizzes variados, fóruns, plugins e hospedagem própria ou cloud.

**Pontos fortes**

* Altíssimo nível de customização e plugins (quizzes, badges, fóruns, relatórios);
* Modelo open-source permite hospedagem local e controle de dados (boa opção para privacy/compliance).

**Pontos fracos**

* Curva de aprendizado e interface mais carregada; configurações e manutenção são mais complexas;
* Para obter certas funcionalidades é necessário instalar e manter plugins - aumenta custo de suporte.

**Funcionalidades interessantes a considerar para SIGEA**

* Arquitetura de plugins leve: manter núcleo simples e permitir extensões opcionais.
* Ferramenta de quizzes com tipos básicos (múltipla escolha, dissertativa) configuráveis.

---

### 1.3 Canvas (Instructure)

**O que é / destaque:** LMS comercial com forte presença em ensino superior; bom suporte a conteúdo multimídia, SpeedGrader para correção e ferramentas de vídeo.

**Pontos fortes**

* Ferramentas de avaliação (SpeedGrader, rubricas) e suporte multimídia.
* UX relativamente ergonomicamente desenhada para uso intensivo em cursos.

**Pontos fracos**

* Relatórios/analytics podem ser limitados ou custosos; soluções avançadas custam mais.
* Plataforma mais pesada: foco em instituições com infraestrutura e necessidade de recursos avançados.

**Funcionalidades interessantes a considerar para SIGEA**

* SpeedGrader simplificado: fluxo de correção rápido, com rubricas mínimas (1–3 critérios).
* Suporte embutido a upload/visualização de vídeos e áudios no player nativo.

---

## 2. Personas

### Persona 1 - Administrador

**Nome:** Carla Marx
**Idade:** 45
**Ocupação:** Coordenadora pedagógica (colégio de 700 alunos)
**Objetivos:** manter turmas organizadas, publicar circulares e relatórios de participação; gerir perfis docentes; acompanhar entregas gerais.
**Frustrações:** sistemas complexos e lentos; painéis com excesso de dados pouco acionáveis; necessidade de treinar equipe sempre que há mudança.
**Necessidades no app:** painel simples com visão por turma, função de publicação em massa, gestão de contas, controle de permissões.

### Persona 2 - Professor

**Nome:** Adão Smith
**Idade:** 34
**Ocupação:** Professor de Matemática do Ensino Médio
**Objetivos:** criar atividades rápidas, corrigir e devolver feedback; acompanhar alunos com baixo desempenho.
**Frustrações:** ferramentas de correção lentas; upload/visualização de entregas problemáticos; rubricas complexas.
**Necessidades no app:** criar tarefa em 3 passos, anotar correções rápidas (estrela / comentário), filtrar alunos por pendências, notificação automática de atraso.

### Persona 3 - Aluna dedicada

**Nome:** Emília Durkheim
**Idade:** 16
**Ocupação:** Estudante (Ensino Médio)
**Objetivos:** acompanhar prazos, revisar materiais e receber feedback para melhorar notas.
**Frustrações:** perder prazos por falta de visão clara do calendário; ter que abrir várias plataformas para acessar materiais.
**Necessidades no app:** feed claro de próximas entregas, histórico de feedback, acesso offline básico (documentos baixáveis).

### Persona 4 - Aluno que precisa de acompanhamento

**Nome:** Marcos Weber
**Idade:** 17
**Ocupação:** Estudante com histórico de faltas/performance irregular
**Objetivos:** entender o que precisa ser entregue; receber lembretes e instruções passo a passo.
**Frustrações:** interfaces confusas; mensagens perdidas; falta de orientação clara sobre próximas ações.
**Necessidades no app:** checklist por tarefa (o que é obrigatório) acesso direto ao professor (chat simplificado), visualização de notas e comentários compacta.

---

## 3. Identidade Visual

### 3.1 Paleta de cores

* **Primária:** Azul `#2B6CB0` - transmite confiança, profissionalismo e calma (uso em header, primary CTA).
* **Secundária:** Amarelo mostarda `#F6C05A` - para acentos positivos e destaques (badges, destaques de conteúdo).
* **Neutros:** Off-white `#FAFBFC` (background), Cinza-escuro `#2D3748` (textos principais), Cinza-claro `#E2E8F0` (bordas / cards).
* **Suporte/Status:**
  * Sucesso: `#2F855A` (verde)
  * Aviso: `#DD6B20` (laranja)
  * Erro: `#E53E3E` (vermelho)
  * Info / Notificação: `#3182CE` (azul claro)

### 3.2 Tipografia

* **Interface (UI / texto curto / labels):** Inter;
* **Cabeçalhos / Impressos:** Roboto Slab para contraste.

---

## 4. Justificativa de design

**Simplicidade e foco no essencial:** SIGEA busca reduzir atrito - professores querem criar tarefas em poucos cliques e corrigir sem abrir múltiplas telas. A arquitetura tem um visual limpo para que o conteúdo seja o foco.

**Paleta:** o azul primário (`#2B6CB0`) passa confiança e é amplamente associado a instituições educativas; o amarelo secundário traz calor e acentos visuais sem competir com o azul. Cores de status seguem convenções (verde-sucesso, vermelho-erro). A paleta também foi escolhida pensando em contraste e legibilidade em dispositivos móveis.

**Tipografia:** *Inter* é moderna, com boa legibilidade em tamanhos pequenos e grande família de pesos, o que favorece uma implementação rápida. Evitamos fontes serifadas para o corpo, garantindo leitura confortável em telas.

**Por que essas escolhas funcionam em educação?** Sistemas educacionais precisam ser confiáveis, previsíveis e eficientes - uma interface com cores institucionais e tipografia neutra ajuda a transmitir autoridade e reduzir distrações. Ao mesmo tempo, pequenos toques (badges amarelos, microinterações) aumentam engajamento sem aumentar complexidade técnica.

## 5. Referências

https://edu.google.com/workspace-for-education/products/classroom/editions/
https://research.com/software/reviews/google-classroom-review
https://www.theverge.com/2024/8/20/24224594/google-classroom-student-group-assignments
https://research.com/software/reviews/moodle-review
https://www.scalahosting.com/blog/moodle-vs-other-popular-lms-platforms/
https://www.instructure.com/lms-learning-management-system
https://www.gartner.com/reviews/market/continuing-education-and-workforce-development-solutions/vendor/instructure/product/canvas-lms