# Documentação Técnica: Módulos JavaScript

Este documento descreve detalhadamente a arquitetura dos módulos JavaScript utilizados no projeto "Fato ou Fake".

## Visão Geral

A arquitetura do projeto é baseada em módulos independentes coordenados por uma classe principal (`App`). O sistema utiliza injeção de dependência simplificada (via `window` ou ES6 imports) para gerenciar recursos compartilhados como áudio, acessibilidade e comunicação SCORM.

### Estrutura de Diretórios
- `assets/js/*.js`: Módulos _Core_ (App, Acessibilidade, Áudio, i18n).
- `assets/js/modules/*.js`: Módulos Funcionais e Wrappers (GameEngine, SCORM).

---

## 1. App (`assets/js/app.js`)

**Responsabilidade Principal**: Coordenar a inicialização do curso, gerenciar a navegação entre módulos e integrar o SCORM com a interface do usuário.

### Ciclo de Vida (`init`)
1. Inicializa conexão SCORM.
2. Carrega estrutura do curso via `content.json`.
3. Restaura progresso salvo (suspend_data/lesson_location).
4. Renderiza abas e conteúdo inicial.
5. Vincula eventos de UI.

### Métodos Principais

| Método | Descrição |
| :--- | :--- |
| `init()` | Ponto de entrada da aplicação. |
| `loadContent()` | Faz fetch do `content.json` para montar a estrutura de navegação. |
| `loadModule(index)` | Alterna a visualização para o módulo especificado (aba). |
| `renderModuleContent(module)` | Renderiza HTML estático ou inicializa a `GameEngine` se `type === 'game'`. |
| `completeModule(index)` | Desbloqueia o próximo módulo e salva o estado no SCORM. |
| `nextPage() / prevPage()` | Gerencia navegação intra-módulo (páginas). |

---

## 2. AccessibilityManager (`assets/js/accessibility.js`)

**Responsabilidade Principal**: Prover recursos de tecnologia assistiva integrados, incluindo Leitura de Texto (TTS), Contraste, Tamanho de Fonte e suporte a Dislexia.

### Funcionalidades
- **Text-to-Speech (TTS)**: Utiliza a Web Speech API. Possui lógica avançada para "quebrar" o DOM em segmentos legíveis, permitindo navegação fluida por teclado e leitura sequencial.
- **Segmentação Inteligente**: O método `getContentSegments` analisa o DOM e cria uma fila de leitura, identificando pausas naturais, elementos interativos (cards, accordions) e ignorando elementos ocultos.
- **Preferências**: Salva preferências do usuário (velocidade, voz, auto-início) no `localStorage`.

### Métodos Principais

| Método | Descrição |
| :--- | :--- |
| `init()` | Inicializa listeners e restaura preferências. |
| `speakElement(el)` | Lê o conteúdo textual de um elemento específico. Interrompe leitura anterior. |
| `getStructuredText(el)` | Extrai texto de forma semântica (lê "h1", ignora scripts, trata listas com ordinais). |
| `initTTS()` | Configura controles de áudio (play/pause, velocidade). |

---

## 3. AudioManager (`assets/js/audio-manager.js`)

**Responsabilidade Principal**: Gerar feedback sonoro (UI sounds) programaticamente, eliminando a necessidade de carregar arquivos `.mp3`/`.wav` externos para sons de interface.

### Tecnologia
Utiliza a **Web Audio API** para criar osciladores (sine, sawtooth) e gain nodes para sintetizar sons simples.

### Métodos Principais

| Método | Descrição |
| :--- | :--- |
| `playTone(freq, type, duration)` | Cria um tom sintético básico. |
| `playClick()` | Som curto de "tick" para interações de botão. |
| `playSuccess()` | Arpejo maior (C-E-G) para feedback positivo. |
| `playError()` | Som dissonante ("buzz") para feedback negativo. |

---

## 4. I18n (`assets/js/i18n.js`)

**Responsabilidade Principal**: Gerenciar internacionalização (tradução) do conteúdo.

### Arquitetura "Modular"
Diferente de sistemas que carregam um único JSON gigante, este módulo carrega arquivos de tradução sob demanda baseados no contexto da página ou componente, otimizando o carregamento inicial.

### Métodos Principais

| Método | Descrição |
| :--- | :--- |
| `init()` | Carrega traduções base (UI, menus). |
| `loadPageTranslation(lang, path)` | Carrega JSON específico de uma página/módulo. |
| `translatePage()` | Varre o DOM buscando atributos `data-i18n` e substitui o conteúdo. |
| `setLanguage(lang)` | Troca o idioma e recarrega a aplicação para aplicar mudanças. |

---

## 5. SCORM Wrapper (`assets/js/modules/scorm-wrapper.js`)

**Responsabilidade Principal**: Abstrair a comunicação com o LMS (Learning Management System) seguindo o padrão SCORM 1.2.

### Detecção de API
Implementa um algoritmo robusto de busca (`findAPI`) que procura a interface SCORM (`API`) em:
1. Janela atual (`window`).
2. Janela pai (`window.parent`) recursivamente até `top`.
3. `window.opener` (para casos de pop-up, comum em alguns LMS).
4. Frames internos do `opener`.

### Métodos Principais

| Método | Descrição |
| :--- | :--- |
| `init()` | Inicia a busca pela API e chama `LMSInitialize`. |
| `getValue(element)` | Wrapper seguro para `LMSGetValue`. Retorna mock data se offline. |
| `setValue(element, value)` | Wrapper para `LMSSetValue`. Salva em `localStorage` se offline. |
| `finish()` | Executa `LMSCommit` e `LMSFinish`. |

---

## 6. GameEngine (`assets/js/modules/game-engine.js`)

**Responsabilidade Principal**: Gerenciar a lógica do jogo interativo "Fato ou Fake".

### Fluxo
1. Carrega dados de perguntas (`game-content.json`).
2. Apresenta cards sequenciais.
3. Processa resposta do usuário e fornece feedback imediato.
4. Calcula pontuação final.

### Métodos Principais

| Método | Descrição |
| :--- | :--- |
| `init()` | Carrega os dados e exibe a tela de introdução. |
| `startGame()` | Zera pontuação e inicia o loop de cards. |
| `renderCard()` | Exibe o card atual (texto ou imagem). |
| `checkAnswer(isFake)` | Compara escolha do usuário com o dado correto e exibe feedback. |
