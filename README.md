# Projeto Eduteca

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

**Funcionalidades interessantes a considerar para Eduteca**

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

**Funcionalidades interessantes a considerar para Eduteca**

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

**Funcionalidades interessantes a considerar para Eduteca**

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

**Simplicidade e foco no essencial:** Eduteca busca reduzir atrito - professores querem criar tarefas em poucos cliques e corrigir sem abrir múltiplas telas. A arquitetura tem um visual limpo para que o conteúdo seja o foco.

**Paleta:** o azul primário (`#2B6CB0`) passa confiança e é amplamente associado a instituições educativas; o amarelo secundário traz calor e acentos visuais sem competir com o azul. Cores de status seguem convenções (verde-sucesso, vermelho-erro). A paleta também foi escolhida pensando em contraste e legibilidade em dispositivos móveis.

**Tipografia:** *Inter* é moderna, com boa legibilidade em tamanhos pequenos e grande família de pesos, o que favorece uma implementação rápida. Evitamos fontes serifadas para o corpo, garantindo leitura confortável em telas.

**Por que essas escolhas funcionam em educação?** Sistemas educacionais precisam ser confiáveis, previsíveis e eficientes - uma interface com cores institucionais e tipografia neutra ajuda a transmitir autoridade e reduzir distrações. Ao mesmo tempo, pequenos toques (badges amarelos, microinterações) aumentam engajamento sem aumentar complexidade técnica.

## 5. Funcionalidades das Telas

### 5.1 Tela de Login (LoginScreen.js)

**Descrição:** Interface de autenticação principal do sistema onde todos os usuários (administradores, professores e alunos) fazem login.

**Funcionalidades:**
- **Validação de Campos:** Validação em tempo real de email e senha com mensagens de erro específicas
- **Autenticação:** Integração com Firebase Auth para login seguro
- **Tratamento de Erros:** Exibição de mensagens personalizadas para diferentes tipos de erro (usuário não encontrado, senha incorreta, problemas de conexão)
- **Redirecionamento Automático:** Após login bem-sucedido, redireciona o usuário para o dashboard apropriado baseado no seu papel (Admin/Professor/Aluno)
- **Persistência de Sessão:** Armazena dados do usuário e token de autenticação localmente
- **Interface Responsiva:** Design adaptável com elementos visuais da identidade visual (logos CSD e CIE)

---

### 5.2 Módulo Administrador

#### 5.2.1 Dashboard do Administrador (AdminDashboard.js)

**Descrição:** Painel principal com visão geral do sistema para administradores.

**Funcionalidades:**
- **Cards de Métricas:** Visualização de estatísticas em tempo real:
  - Total de turmas cadastradas no sistema
  - Total de professores registrados
  - Total de alunos matriculados
  - Número de alunos ativos no dia atual
- **Destaque da Turma:** Card especial mostrando a turma com maior número de alunos matriculados
- **Sidebar de Navegação:** Menu lateral com navegação para todas as seções administrativas
- **Perfil do Usuário:** Exibição das informações do administrador logado
- **Logout Seguro:** Modal de confirmação para saída do sistema
- **Layout Responsivo:** Adaptação automática do layout baseada na resolução da tela

#### 5.2.2 Gestão de Turmas (TurmasScreen.js)

**Descrição:** Interface completa para gerenciamento de turmas escolares.

**Funcionalidades:**
- **Listagem de Turmas:** Visualização em tabela com nome e número de alunos
- **Ordenação Flexível:** Opções de ordenação por nome da turma ou número de alunos
- **Criação de Turmas:** Modal para cadastro de novas turmas com:
  - Nome da turma (validação obrigatória)
  - Seleção de turno (Manhã/Tarde/Noite)
- **Edição de Turmas:** Modificação de informações existentes via modal
- **Exclusão de Turmas:** Remoção com confirmação de segurança
- **Interface de Tabela:** Cabeçalho fixo e linhas organizadas com ações inline
- **Estados de Carregamento:** Indicadores visuais durante operações assíncronas

#### 5.2.3 Gestão de Professores (ProfessoresScreen.js)

**Descrição:** Sistema completo de gerenciamento de professores.

**Funcionalidades:**
- **Listagem de Professores:** Tabela com nome e número de turmas designadas
- **Cadastro de Professores:** Modal para criação com:
  - Nome completo (validação de duplicatas)
  - Email (validação de formato e unicidade)
  - Senha inicial
- **Edição de Professores:** Modificação de dados via modal dedicado
- **Exclusão de Professores:** Remoção com confirmação dupla
- **Designação para Turmas:** Modal especial para:
  - Visualizar todas as turmas disponíveis
  - Adicionar/remover professor de múltiplas turmas
  - Interface com ícones + e - para controle intuitivo
- **Filtros e Ordenação:** Por nome ou número de turmas designadas
- **Controle de Permissões:** Verificação de unicidade de nomes e emails

#### 5.2.4 Gestão de Alunos (AlunosScreen.js)

**Descrição:** Interface abrangente para administração de alunos.

**Funcionalidades:**
- **Listagem de Alunos:** Tabela com nome e turma de matrícula
- **Cadastro de Alunos:** Modal completo com:
  - Nome do aluno (validação obrigatória)
  - Email (verificação de duplicatas)
  - Senha inicial
- **Edição de Alunos:** Modificação de dados pessoais
- **Exclusão de Alunos:** Remoção com confirmação de segurança
- **Matrícula em Turmas:** Sistema avançado para:
  - Designar aluno para turma específica
  - Remover aluno de todas as turmas
  - Dropdown com todas as turmas disponíveis
- **Ordenação:** Por nome do aluno ou turma de matrícula
- **Status de Matrícula:** Indicação clara se aluno possui ou não turma

---

### 5.3 Módulo Professor

#### 5.3.1 Dashboard do Professor (ProfessorDashboard.js)

**Descrição:** Painel principal com visão geral das atividades docentes.

**Funcionalidades:**
- **Métricas de Turma:** Cards informativos mostrando:
  - Total de turmas sob responsabilidade
  - Total de estudantes em todas as turmas
  - Próxima aula pendente
  - Status de chamada do dia (completa/incompleta)
- **Próximas Aulas:** Lista interativa das turmas pendentes:
  - Nome da turma e turno
  - Status visual (Pendente/Concluída)
  - Ordenação por prioridade de turno
- **Indicadores Visuais:** 
  - Ícones de status com cores diferenciadas
  - Badges de progresso para chamadas
- **Carregamento Dinâmico:** Busca automática de dados do Firebase
- **Navegação Integrada:** Links diretos para funcionalidades específicas

#### 5.3.2 Minhas Turmas (TurmasScreen.js)

**Descrição:** Visualização e acesso às turmas designadas ao professor.

**Funcionalidades:**
- **Grid de Turmas:** Cards visuais com:
  - Nome da turma
  - Número de alunos matriculados
  - Turno de funcionamento
- **Filtros Avançados:** Dropdown com opções:
  - Ordem alfabética
  - Filtro por turno (Manhã/Tarde/Noite)
- **Layout Responsivo:** Ajuste automático do número de colunas
- **Acesso Direto:** Botão para navegar às aulas da turma
- **Estado Vazio:** Mensagem apropriada quando sem turmas designadas
- **Carregamento Assíncrono:** Busca de dados com indicador visual

#### 5.3.3 Sistema de Chamada (PresencaScreen.js)

**Descrição:** Interface completa para registro de presença dos alunos.

**Funcionalidades:**
- **Seleção de Turma:** Dropdown com turmas do professor
- **Controle de Data:** 
  - Navegação entre datas (anterior/próxima)
  - Calendário visual para seleção
- **Lista de Alunos:** 
  - Exibição completa da turma selecionada
  - Toggle de presença/falta por aluno
  - Estados visuais claros (Presente/Falta)
- **Persistência de Dados:** 
  - Salvamento automático no Firebase
  - Recuperação de chamadas anteriores
  - Controle de alterações não salvas
- **Gerenciamento de Chamadas:**
  - Criação de nova chamada
  - Edição de chamadas existentes
  - Exclusão com confirmação
- **Navegação Segura:** Alertas para mudanças não salvas

#### 5.3.4 Sistema de Notas (NotasScreen.js)

**Descrição:** Interface avançada para gerenciamento de notas dos alunos.

**Funcionalidades:**
- **Seleção de Turma:** Dropdown com turmas do professor
- **Tabela de Notas Dinâmica:**
  - Colunas de avaliações configuráveis
  - Linhas para cada aluno da turma
  - Cálculo automático de médias
- **Edição de Notas:**
  - Modo de edição toggleável
  - Input numérico para cada nota
  - Validação de valores (0-10)
- **Gerenciamento de Colunas:**
  - Adição de novas avaliações
  - Remoção de colunas existentes
  - Personalização do número de avaliações
- **Persistência:** Salvamento automático das alterações
- **Formatação:** Exibição de notas no padrão brasileiro (vírgula decimal)

---

### 5.4 Módulo Aluno

#### 5.4.1 Dashboard do Aluno (AlunoDashboard.js)

**Descrição:** Painel principal para acesso às funcionalidades do estudante.

**Funcionalidades:**
- **Informações de Matrícula:** 
  - Card destacado mostrando a turma do aluno
  - Status de matrícula claramente visível
- **Menu de Navegação:** Cards interativos para:
  - **Histórico de Presenças:** Acesso ao registro de faltas/presenças
  - **Minhas Notas:** Visualização do desempenho acadêmico
  - **Calendário:** Consulta de aulas e eventos
- **Design Intuitivo:** 
  - Ícones temáticos com cores diferenciadas
  - Layout responsivo em grid
  - Visual amigável e acessível
- **Carregamento de Dados:** Busca automática da turma do aluno

#### 5.4.2 Presenças do Aluno (PresencaAlunoScreen.js)

**Descrição:** Visualização do histórico completo de presenças.

**Funcionalidades:**
- **Lista de Presenças:** Histórico cronológico mostrando:
  - Data da aula
  - Status (Presente/Falta)
  - Identificação clara com cores
- **Estatísticas de Frequência:**
  - Cálculo automático da porcentagem de presença
  - Indicadores visuais de desempenho
- **Filtros por Período:** Visualização organizada por mês/semestre
- **Design Responsivo:** Layout adaptável para diferentes telas
- **Estados de Carregamento:** Indicadores durante busca de dados

#### 5.4.3 Notas do Aluno (NotasAlunoScreen.js)

**Descrição:** Interface para consulta de notas e desempenho acadêmico.

**Funcionalidades:**
- **Visualização de Notas:**
  - Lista de todas as avaliações realizadas
  - Valor individual de cada nota
  - Média final calculada automaticamente
- **Indicadores de Desempenho:**
  - Status visual baseado na média (aprovado/recuperação/reprovado)
  - Cores diferenciadas para fácil interpretação
- **Histórico Acadêmico:** Organização cronológica das avaliações
- **Responsividade:** Interface adaptável para dispositivos móveis

#### 5.4.4 Calendário do Aluno (CalendarioAlunoScreen.js)

**Descrição:** Sistema de calendário para visualização de aulas e eventos.

**Funcionalidades:**
- **Calendário Interativo:**
  - Visualização mensal completa
  - Navegação entre meses
  - Seleção de dias específicos
- **Informações de Aula:**
  - Horários das aulas do dia selecionado
  - Identificação da turma
  - Período (manhã/tarde/noite)
- **Marcadores Visuais:** 
  - Dias com aula destacados
  - Diferentes cores para diferentes tipos de evento
- **Detalhes do Dia:** Painel lateral com informações completas
- **Localização em Português:** Configuração para formato brasileiro

---

### 5.5 Funcionalidades Transversais

#### Autenticação e Segurança
- **Login Unificado:** Mesma interface para todos os tipos de usuário
- **Controle de Sessão:** Persistência segura de dados de login
- **Logout Seguro:** Confirmação antes de encerrar sessão
- **Validação de Permissões:** Controle de acesso baseado no papel do usuário

#### Interface e Navegação
- **Design System Consistente:** Identidade visual unificada em todas as telas
- **Sidebar Responsiva:** Menu lateral adaptável com navegação clara
- **Estados de Loading:** Indicadores visuais durante operações assíncronas
- **Tratamento de Erros:** Mensagens informativas e recuperação de falhas
- **Modal System:** Interfaces padronizadas para ações críticas

#### Integração com Firebase
- **Armazenamento em Tempo Real:** Sincronização automática de dados
- **Consultas Otimizadas:** Busca eficiente de informações
- **Transações Seguras:** Operações atômicas para integridade dos dados
- **Backup Automático:** Persistência confiável na nuvem

## 6. Dificuldades e Aprendizados

### 6.1 Principais Dificuldades Enfrentadas

#### Configuração de Ambiente
- **Configuração do React Native:** Estabelecimento inicial do ambiente de desenvolvimento com todas as dependências necessárias
- **Integração com Firebase:** Primeira experiência com a plataforma, incluindo configuração de autenticação e banco de dados

#### Desafios Técnicos
- **Limitações de Tempo:** Cronograma restrito para implementação de todas as funcionalidades planejadas
- **Problemas de ScrollView:** Dificuldades com componentes de rolagem que não exibiam erros mas não funcionavam adequadamente
- **Navegação Complexa:** Resolução de problemas de navegação, especialmente entre telas de login e áreas autenticadas durante o logout
- **Personalização da Interface:** Desenvolvimento de UI customizada que aumentou significativamente o tempo de desenvolvimento

#### Debugging e Testes
- **Complexidade do Debug:** Dificuldades adicionais no processo de depuração devido à combinação de compilação nativa e JavaScript

---

### 6.2 Principais Aprendizados Adquiridos

#### Metodologias de Desenvolvimento
- **Git Flow:** Domínio das práticas de versionamento e colaboração em equipe

#### Tecnologias e Ferramentas
- **Firebase:** Descoberta da facilidade e poder da plataforma para desenvolvimento rápido:
  - Autenticação integrada
  - Banco de dados em tempo real
- **React Native:** Aprofundamento nas especificidades do desenvolvimento

#### Conhecimentos Técnicos Específicos
- **ScrollView:** Compreensão de que componentes ScrollView necessitam de dimensões definidas e não podem usar `flex: 1`
- **Arquitetura de Componentes:** Desenvolvimento de um design system consistente
- **Estados e Navegação:** Gerenciamento complexo de estados entre diferentes telas e usuários
- **Responsividade:** Implementação de layouts adaptativos para diferentes tamanhos de tela

#### Gestão de Projeto
- **Priorização de Features:** Aprendizado sobre como balancear funcionalidade e tempo disponível
- **Documentação:** Importância da documentação clara para manutenção e evolução do projeto
- **Teste e Validação:** Processos de teste em diferentes cenários de uso

---

## 7. Referências

https://edu.google.com/workspace-for-education/products/classroom/editions/
https://research.com/software/reviews/google-classroom-review
https://www.theverge.com/2024/8/20/24224594/google-classroom-student-group-assignments
https://research.com/software/reviews/moodle-review
https://www.scalahosting.com/blog/moodle-vs-other-popular-lms-platforms/
https://www.instructure.com/lms-learning-management-system
https://www.gartner.com/reviews/market/continuing-education-and-workforce-development-solutions/vendor/instructure/product/canvas-lms