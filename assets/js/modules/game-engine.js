/**
 * Game Engine for "Caça Fakes"
 * Handles the logic for Fato vs Fake card game
 */

export class GameEngine {
    constructor(container) {
        this.container = container;
        this.score = 0;
        this.currentCardIndex = 0;
        this.cards = [];
    }

    async init() {
        // Load Game Data
        try {
            const response = await fetch('assets/data/game-content.json'); // TODO: Create this file
            this.cards = await response.json();
            this.renderIntro();
        } catch (error) {
            console.warn("Game content not found, using mock data");
            this.cards = this.getMockData();
            this.renderIntro();
        }
    }

    getMockData() {
        return [
            {
                id: 1,
                type: 'text',
                content: 'Manchete: "Beber água com limão cura todas as doenças!"',
                isFake: true,
                feedback: "Fake! Não existe cura milagrosa. Consulte sempre um médico."
            },
            {
                id: 2,
                type: 'image',
                content: 'assets/media/pope-puffer.jpg',
                isFake: true,
                feedback: "Fake! Esta imagem foi gerada por IA (Midjourney)."
            }
        ];
    }

    renderIntro() {
        this.container.innerHTML = `
            <div class="game-intro fade-in">
                <h2>Detective de Fakes 🕵️</h2>
                <p>Você consegue identificar o que é verdade e o que é mentira?</p>
                <button id="btn-start-game" class="btn-primary">Começar Missão</button>
            </div>
        `;
        document.getElementById('btn-start-game').onclick = () => this.startGame();
    }

    startGame() {
        this.currentCardIndex = 0;
        this.score = 0;
        this.renderCard();
    }

    renderCard() {
        if (this.currentCardIndex >= this.cards.length) {
            this.endGame();
            return;
        }

        const card = this.cards[this.currentCardIndex];

        this.container.innerHTML = `
            <div class="game-card fade-in">
                <div class="card-content">
                    ${card.type === 'image' ? `<img src="${card.content}" alt="Imagem para análise">` : `<h3>${card.content}</h3>`}
                </div>
                <div class="game-controls">
                    <button class="btn-fake" id="btn-choose-fake">❌ É Fake</button>
                    <button class="btn-fact" id="btn-choose-fact">✅ É Fato</button>
                </div>
                <div id="feedback-area" class="hidden"></div>
            </div>
            <div class="game-status">
                Item ${this.currentCardIndex + 1}/${this.cards.length}
            </div>
        `;

        document.getElementById('btn-choose-fake').onclick = () => this.checkAnswer(true);
        document.getElementById('btn-choose-fact').onclick = () => this.checkAnswer(false);
    }

    checkAnswer(userSaysFake) {
        const card = this.cards[this.currentCardIndex];
        const isCorrect = userSaysFake === card.isFake;

        const feedbackArea = document.getElementById('feedback-area');
        feedbackArea.classList.remove('hidden');

        if (isCorrect) {
            this.score++;
            feedbackArea.innerHTML = `<div class="feedback success">🎉 Acertou! ${card.feedback}</div>`;
            // Play success sound
        } else {
            feedbackArea.innerHTML = `<div class="feedback error">⚠️ Ops! ${card.feedback}</div>`;
            // Play error sound
        }

        setTimeout(() => {
            this.currentCardIndex++;
            this.renderCard();
        }, 2500);
    }

    endGame() {
        this.container.innerHTML = `
            <div class="game-result fade-in">
                <h2>Missão Cumprida!</h2>
                <p>Você acertou ${this.score} de ${this.cards.length}.</p>
                <div class="result-badge">
                    ${this.score === this.cards.length ? '🥇 Mestre da Verdade' : '🥈 Investigador Júnior'}
                </div>
            </div>
        `;
    }
}
