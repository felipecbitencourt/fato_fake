# 2. Especificação Técnica

## Stack Tecnológico
-   **Core**: HTML5, CSS3, JavaScript (Vanilla ES6+).
-   **Dados**: `content.json` para estrutura e `locales/*.json` para textos.

## Regras de Negócio
1.  **Navegação Sequencial**:
    -   O usuário só pode clicar na Aba 2 após finalizar a Aba 1.
    -   Aba bloqueada deve ter indicador visual (ex: cadeado).
    -   Persistência: O progresso deve ser salvo no `cmi.suspend_data` para que o desbloqueio se mantenha ao retornar.
2.  **Tracking (SCORM)**:
    -   `cmi.core.lesson_status`: "completed" apenas ao finalizar todos os módulos obrigatórios.
    -   Não há nota mínima (Score não bloqueia aprovação), mas os acertos do Game podem ser registrados em `cmi.core.score.raw` para feedback.
    -   Tempo: `cmi.core.session_time` registrado normalmente.

## Estrutura de Arquivos Atualizada
```
/
├── content.json          # Array de Módulos (cada um com 'title', 'locked', 'pages')
├── assets/
│   ├── css/
│   │   ├── theme.css     # Variáveis CSS (Cor Vermelha Principal)
│   │   └── game.css      # Estilos específicos do Caça Fakes
│   ├── js/
│   │   ├── modules/
│   │   │   ├── navigation.js  # Lógica de bloqueio/desbloqueio
│   │   │   └── game-engine.js # Lógica do Caça Fakes
```
