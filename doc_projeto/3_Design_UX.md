# 3. Design e UX

## Identidade Visual
-   **Cor Primária**: Vermelho (Mesmo tom do projeto `referencia`).
-   **Layout**: Header fixo com abas de navegação. Branding discreto no rodapé.

## Componentes de Interface
1.  **Header de Abas**:
    -   Lista horizontal de módulos.
    -   Estado **Bloqueado**: Ícone de cadeado, cor cinza, sem interação de clique.
    -   Estado **Ativo**: Cor primária (Vermelho), sublinhado.
    -   Estado **Concluído**: Checkmark verde ou ícone preenchido.
2.  **Game "Caça Fakes"**:
    -   **Interface de Tinder/Card**: Cartão centralizado com a notícia/mídia.
    -   **Botões de Ação**: "É Fato" (Verde/Check) vs "É Fake" (Vermelho/X).
    -   **Feedback Imediato**: Ao decidir, o cartão vira (flip) ou expande mostrando a explicação e a fonte de checagem.

## Acessibilidade
-   O jogo deve ser totalmente operável por teclado (Tab para focar nos botões de decisão).
-   As imagens e mídias do jogo (Fase 2 - Deepfakes) devem ter descrições de áudio detalhadas para que deficientes visuais possam "jogar" analisando o contexto descrito.
