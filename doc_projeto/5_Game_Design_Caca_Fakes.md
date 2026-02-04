# 5. Game Design - Caça Fakes

## Conceito
Adaptação do jogo "Caça-Fakes" do site original.
Objetivo: Transformar o usuário em um investigador digital.

## Estrutura das Fases

### Fase 1: Reportagens e Manchetes
-   **Conteúdo**: Casos reais e fictícios baseados no acervo do Arquivo.pt e contextos atuais.
-   **Mecânica**: Card com manchete + imagem. Botões "É Fato" / "É Fake".
-   **Feedback**:
    -   Exibe a fonte original (quando Fato).
    -   Exibe os "sinais de alerta" (quando Fake) e o desmentido.

### Fase 2: Detectando IAs (Futuro/Deepfakes)
-   **Conteúdo**: Imagens geradas por IA (Midjourney/DALL-E) vs Fotos Reais. Vídeos Deepfake.
-   **Mecânica**: "Spot the error" (Encontre o erro).
-   **Dicas**: O usuário pode ativar uma lupa para inspecionar detalhes (mãos, texto ilegível, brilho nos olhos).

## Interface
-   Estilo "Card Game" (tinder-like ou flashcard).
-   Barra de pontuação/acertos visível.
-   Feedback sonoro (Audiocons) para acerto/erro.

## Integração Técnica
-   JSON Driven: Todo o conteúdo do jogo virá de `assets/data/game-content.json`.
-   Acessibilidade: Descrição de imagem detalhada para leitores de tela ("Imagem mostra Papa Francisco com casaco puffer... Detalhe na mão direita mostra 6 dedos...").
