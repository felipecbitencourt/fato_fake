# 8. Guia de Estilo Disruptivo (Blade Runner / Cyber-Investigativo)

Este documento define os padrões visuais para o "Tema Disruptivo" utilizado no Módulo 01 e na Página Inicial (Home). O objetivo é criar uma estética imersiva, moderna e impactante que remeta à investigação digital, dados e a "guerra da informação".

---

## 🎨 Cores

O esquema de cores é de **Alto Contraste**, utilizando um fundo "quase preto" e acentos neon vibrantes para guiar a atenção.

| Variável CSS | Cor Hex | Uso |
| :--- | :--- | :--- |
| `--bold-bg` | `#0a0a0a` | **Fundo Principal**. Um preto profundo, mas não absoluto, para suavidade em telas OLED/LCD. |
| `--bold-accent` | `#FF1744` | **Acento Primário (Alerta)**. Vermelho Neon. Usado para CTAs, palavras-chave de "perigo" ou "fake", e bordas ativas. |
| `--bold-secondary` | `#00E5FF` | **Acento Secundário (Dados/Verdade)**. Ciano Neon. Usado para elementos de tecnologia, dados e validação. |
| `--bold-text` | `#ffffff` | **Texto Principal**. Branco puro para leitura sobre fundo escuro. |
| `--bold-muted` | `rgba(255, 255, 255, 0.6)` | **Texto Secundário**. Cinza claro para descrições e parágrafos de apoio. |
| `--bold-card` | `rgba(255, 255, 255, 0.03)` | **Superfícies**. Fundo translúcido (Glassmorphism) para cards e containers. |

---

## 🅰️ Tipografia

A tipografia é "Bold & Loud". Utilizamos a família **Inter**, abusando dos pesos *Extra Bold* e *Black* para criar impacto visual imediato.

### Títulos (Display)
*   **Fonte**: Inter
*   **Peso**: 900 (Black)
*   **Transform**: Uppercase
*   **Letter-spacing**: Negativo (`-2px` a `-5px`) para compactação.
*   **Tamanho**: Responsivo via `clamp()`. Ex: `font-size: clamp(3rem, 10vw, 6rem);`

### Corpo de Texto
*   **Fonte**: Inter, System UI
*   **Peso**: 400 (Regular) ou 500 (Medium)
*   **Line-height**: 1.7 (Confortável para leitura em fundo escuro)

---

## 🧱 Componentes de Interface

### 1. Cards "Glass"
Cards flutuantes com efeito de vidro fosco.
```css
.card {
    background: var(--bold-card);
    border: 1px solid var(--bold-border);
    backdrop-filter: blur(10px); /* Opcional, cuidado com performance */
    border-radius: 16px;
}
.card:hover {
    border-color: var(--bold-secondary); /* Glow effect on hover */
}
```

### 2. Botões Neon
Botões sólidos que "brilham".
```css
.btn-neon {
    background: var(--bold-accent);
    color: white;
    border-radius: 50px;
    text-transform: uppercase;
    font-weight: 800;
    box-shadow: 0 10px 30px rgba(255, 23, 68, 0.4); /* Glow fixo */
}
```

### 3. Tags / Pills
Usadas para categorizar conteúdo (ex: Fato/Fake).
```css
.tag {
    background: transparent;
    border: 1px solid currentColor;
    border-radius: 4px;
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 1px;
}
```

---

## 🌌 Sistema de Background (Shapes)

O fundo não é estático. Utilizamos elementos geométricos para criar profundidade e movimento sem distrair.

### 1. Camada Global (Z-Index 0)
Círculos e gradientes grandes e desfocados que percorrem toda a altura da página.
*   **Classe**: `.global-shapes` (Wrapper com `position: absolute; width: 100%; height: 100%; overflow: hidden;`)
*   **Elementos**: `.g-circle-1`, `.g-circle-2`...
*   **Animação**: Rotação lenta (`40s+`) ou Pulso suave.

### 2. Camada Decorativa (Hero)
Elementos geométricos menores e mais nítidos focados na primeira dobra (Hero Section).
*   **Classe**: `.decorative-shapes`
*   **Elementos**: Triângulos, Diamantes, Anéis, Pontilhados.
*   **Estilo**: Linhas finas (`1px` ou `2px`), opacidade baixa (`0.1`), animação de flutuação (`float`).

---

## ⚡ Animações Padrão

*   **Float**: Movimento vertical suave (`translateY`) para objetos "flutuando".
*   **Pulse**: Variação de opacidade para elementos de "energia".
*   **Rotate-Slow**: Rotação contínua e muito lenta para anéis de fundo.
*   **Entry**: Elementos devem entrar com `opacity: 0` -> `1` e `transform: translateY(20px)` -> `0`.

---

## 📱 Responsividade

*   **Mobile First**: O design deve funcionar em coluna única.
*   **Tipografia Fluida**: Use `clamp()` para evitar que títulos gigantes quebrem o layout em celulares.
*   **Backgrounds**: Reduza a quantidade ou opacidade de elementos animados em telas menores se necessário.
