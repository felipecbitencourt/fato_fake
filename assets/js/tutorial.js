/**
 * Tutorial interativo com efeito spotlight
 * Guia o usuário pelos elementos principais da interface
 * Adaptado para o projeto Fato ou Fake
 */
const Tutorial = {
    currentStep: 0,
    isActive: false,

    // Passos do tutorial adaptados para a interface do Fato ou Fake
    steps: [
        {
            selector: '#tabs-nav',
            text: '📚 <strong>Abas de Módulos</strong><br>Navegue entre os diferentes módulos do curso clicando nas abas. Cada módulo contém várias páginas.',
            position: 'bottom'
        },
        {
            selector: '#btn-settings',
            text: '⚙️ <strong>Configurações</strong><br>Ajuste o tema (modo escuro), tamanho da fonte, fonte para dislexia e opções de leitura em voz alta.',
            position: 'bottom'
        },
        {
            selector: '#btn-tts-quick',
            text: '🔊 <strong>Leitura Guiada</strong><br>Ative para que o conteúdo seja lido em voz alta. Ideal para acessibilidade.',
            position: 'bottom'
        },
        {
            selector: '#content-display',
            text: '📄 <strong>Área de Conteúdo</strong><br>Aqui você verá todo o material do curso: textos, imagens, atividades e jogos interativos.',
            position: 'top'
        },
        {
            selector: '.content-footer',
            text: '⬅️ ➡️ <strong>Navegação</strong><br>Use os botões "Anterior" e "Próximo" para navegar entre as páginas. Você também pode usar as setas do teclado!',
            position: 'top'
        },
        {
            selector: '#progress-indicator',
            text: '📊 <strong>Progresso</strong><br>Acompanhe seu avanço no curso. Complete todas as páginas para desbloquear os módulos seguintes.',
            position: 'top'
        }
    ],

    init: function () {
        this.bindStartButton();
        this.createOverlay();
    },

    createOverlay: function () {
        // Criar overlay se não existir
        if (!document.getElementById('tutorial-overlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'tutorial-overlay';
            overlay.className = 'tutorial-overlay';
            document.body.appendChild(overlay);
        }

        // Criar tooltip se não existir
        if (!document.getElementById('tutorial-tooltip')) {
            const tooltip = document.createElement('div');
            tooltip.id = 'tutorial-tooltip';
            tooltip.className = 'tutorial-tooltip';
            tooltip.innerHTML = `
                <div class="tutorial-tooltip-content">
                    <p id="tutorial-text"></p>
                </div>
                <div class="tutorial-tooltip-actions">
                    <span id="tutorial-step-indicator"></span>
                    <div class="tutorial-buttons">
                        <button id="tutorial-skip" class="tutorial-btn-skip">Pular</button>
                        <button id="tutorial-next" class="tutorial-btn-next">Próximo →</button>
                    </div>
                </div>
            `;
            document.body.appendChild(tooltip);

            // Bind dos botões
            document.getElementById('tutorial-next').addEventListener('click', () => this.next());
            document.getElementById('tutorial-skip').addEventListener('click', () => this.end());
        }
    },

    bindStartButton: function () {
        document.addEventListener('click', (e) => {
            if (e.target.id === 'btn-start-tutorial' || e.target.closest('#btn-start-tutorial')) {
                e.preventDefault();
                this.start();
            }
        });

        // Fechar com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isActive) {
                this.end();
            }
        });
    },

    start: function () {
        if (typeof AudioManager !== 'undefined') AudioManager.playClick();
        this.currentStep = 0;
        this.isActive = true;
        document.body.classList.add('tutorial-active');
        document.getElementById('tutorial-overlay').classList.add('active');
        document.getElementById('tutorial-tooltip').classList.add('active');
        this.showStep(0);
    },

    next: function () {
        if (typeof AudioManager !== 'undefined') AudioManager.playClick();
        this.clearHighlight();

        this.currentStep++;
        if (this.currentStep >= this.steps.length) {
            this.end();
        } else {
            this.showStep(this.currentStep);
        }
    },

    showStep: function (stepIndex) {
        const step = this.steps[stepIndex];

        setTimeout(() => {
            const element = document.querySelector(step.selector);

            if (!element) {
                console.warn('Tutorial: Element not found:', step.selector);
                this.next();
                return;
            }

            // Highlight no elemento
            element.classList.add('tutorial-highlight');

            // Scroll suave para o elemento se necessário
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Posicionar tooltip
            setTimeout(() => {
                this.positionTooltip(element, step.position);
            }, 300);

            // Atualizar texto
            document.getElementById('tutorial-text').innerHTML = step.text;
            document.getElementById('tutorial-step-indicator').textContent =
                `${stepIndex + 1} de ${this.steps.length}`;

            // Botão de próximo ou finalizar
            const nextBtn = document.getElementById('tutorial-next');
            nextBtn.textContent = stepIndex === this.steps.length - 1 ? 'Finalizar ✓' : 'Próximo →';
        }, 0);
    },

    positionTooltip: function (element, position) {
        const tooltip = document.getElementById('tutorial-tooltip');
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();

        let top, left;
        const margin = 20;

        switch (position) {
            case 'right':
                top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                left = rect.right + margin;
                break;
            case 'left':
                top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                left = rect.left - tooltipRect.width - margin;
                break;
            case 'top':
                top = rect.top - tooltipRect.height - margin;
                left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'bottom':
            default:
                top = rect.bottom + margin;
                left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                break;
        }

        // Garantir que não saia da tela
        top = Math.max(margin, Math.min(top, window.innerHeight - tooltipRect.height - margin));
        left = Math.max(margin, Math.min(left, window.innerWidth - tooltipRect.width - margin));

        tooltip.style.top = top + 'px';
        tooltip.style.left = left + 'px';
    },

    clearHighlight: function () {
        document.querySelectorAll('.tutorial-highlight').forEach(el => {
            el.classList.remove('tutorial-highlight');
        });
    },

    end: function () {
        if (typeof AudioManager !== 'undefined') AudioManager.playClick();
        this.isActive = false;
        this.clearHighlight();
        document.body.classList.remove('tutorial-active');
        document.getElementById('tutorial-overlay').classList.remove('active');
        document.getElementById('tutorial-tooltip').classList.remove('active');
        this.currentStep = 0;

        // Marcar tutorial como concluído
        localStorage.setItem('fato-fake-tutorial-completed', 'true');
    }
};

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    Tutorial.init();
});
