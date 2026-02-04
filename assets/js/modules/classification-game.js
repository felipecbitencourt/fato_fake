/**
 * Detective Classification Game Engine
 * Jogo de Detetive de Desinformação - Módulo 1
 * 
 * Tema: Mesa de trabalho de um detetive especialista em desinformação
 * Ferramentas: Gráfico de Setores, Carimbos, Medidor de Gravidade, Pastas de Arquivo
 */

export class ClassificationGame {
    constructor(container) {
        this.container = container;
        this.cases = [];
        this.config = {};
        this.medals = {};
        this.currentCaseIndex = 0;
        this.currentStep = 0;
        this.score = 0;
        this.answers = {};
        this.results = [];
        this.selectedStamp = null;

        // Tool definitions
        this.tools = {
            type: {
                name: 'Gráfico de Análise',
                icon: '📊',
                options: [
                    { id: 'true', label: 'Verdadeira', emoji: '✅', color: '#4CAF50', angle: 0 },
                    { id: 'misinformation', label: 'Informação Falsa', emoji: '🤔', color: '#2196F3', angle: 90 },
                    { id: 'disinformation', label: 'Desinformação', emoji: '😈', color: '#E53935', angle: 180 },
                    { id: 'malinformation', label: 'Maliciosa', emoji: '💣', color: '#FF9800', angle: 270 }
                ]
            },
            category: {
                name: 'Carimbos de Categoria',
                icon: '🔖',
                stamps: [
                    { id: 1, label: 'Sátira', emoji: '🃏', color: '#9C27B0' },
                    { id: 2, label: 'Conexão Falsa', emoji: '🔗', color: '#FF9800' },
                    { id: 3, label: 'Tendencioso', emoji: '📢', color: '#FF5722' },
                    { id: 4, label: 'Contexto Falso', emoji: '📌', color: '#F44336' },
                    { id: 5, label: 'Impostor', emoji: '🎭', color: '#E91E63' },
                    { id: 6, label: 'Manipulado', emoji: '🛠️', color: '#D32F2F' },
                    { id: 7, label: 'Fabricado', emoji: '🚨', color: '#B71C1C' }
                ]
            },
            severity: {
                name: 'Medidor de Gravidade',
                icon: '📏',
                levels: [
                    { level: 1, color: '#C8E6C9', label: 'Mínima' },
                    { level: 2, color: '#A5D6A7', label: 'Muito Baixa' },
                    { level: 3, color: '#FFF9C4', label: 'Baixa' },
                    { level: 4, color: '#FFE082', label: 'Média' },
                    { level: 5, color: '#FFCC80', label: 'Alta' },
                    { level: 6, color: '#FFAB91', label: 'Muito Alta' },
                    { level: 7, color: '#EF9A9A', label: 'Máxima' }
                ]
            },
            motivation: {
                name: 'Arquivo de Casos',
                icon: '📁',
                folders: [
                    { id: 'economic', label: 'Econômica', emoji: '💰', color: '#4CAF50' },
                    { id: 'political', label: 'Política', emoji: '🏛️', color: '#2196F3' },
                    { id: 'propaganda', label: 'Propaganda', emoji: '📣', color: '#9C27B0' },
                    { id: 'bad_journalism', label: 'Jornalismo Ruim', emoji: '📰', color: '#FF9800' },
                    { id: 'provocation', label: 'Provocação', emoji: '🤡', color: '#E91E63' }
                ]
            }
        };

        this.steps = ['type', 'category', 'severity', 'motivation'];
        this.stepNames = ['Gráfico de Análise', 'Carimbo de Categoria', 'Medidor de Gravidade', 'Arquivar Caso'];
    }

    async init() {
        try {
            // Use absolute path from root
            const response = await fetch('/assets/data/game-cases.json');
            const data = await response.json();
            this.cases = data.cases;
            this.config = data.config;
            this.medals = data.medals;
            this.render();
        } catch (error) {
            console.error('Failed to load game cases:', error);
            this.container.innerHTML = '<p class="error">Erro ao carregar o jogo.</p>';
        }
    }

    render() {
        this.container.innerHTML = `
            <div class="detective-game">
                <!-- Detective Desk Header -->
                <div class="desk-header">
                    <div class="badge">
                        <span class="badge-icon">🕵️</span>
                        <span class="badge-text">Detetive de Desinformação</span>
                    </div>
                    <div class="case-info">
                        <span>📋 Caso <span id="case-num">1</span>/${this.cases.length}</span>
                        <span class="score-badge">🎯 <span id="score">0</span> pts</span>
                    </div>
                </div>
                
                <!-- The Detective's Desk -->
                <div class="desk-workspace">
                    <!-- Evidence Paper (The Information) -->
                    <div class="evidence-paper" id="evidence-paper">
                        <div class="paper-clip">📎</div>
                        <div class="stamp-zone" id="stamp-zone"></div>
                        <div class="evidence-content" id="evidence-content">
                            <!-- Case content here -->
                        </div>
                        <div class="paper-footer">
                            <span class="source-tag" id="source-tag"></span>
                        </div>
                    </div>
                    
                    <!-- Tool Belt -->
                    <div class="tool-belt" id="tool-belt">
                        <!-- Current tool will be shown here -->
                    </div>
                </div>
                
                <!-- Progress Steps -->
                <div class="progress-steps" id="progress-steps">
                    ${this.stepNames.map((name, i) => `
                        <div class="step-dot ${i === 0 ? 'active' : ''}" data-step="${i}">
                            <span class="step-num">${i + 1}</span>
                            <span class="step-label">${name}</span>
                        </div>
                    `).join('<div class="step-line"></div>')}
                </div>
                
                <!-- Feedback Overlay -->
                <div class="feedback-overlay" id="feedback-overlay" style="display: none;">
                </div>
                
                <!-- Results Screen -->
                <div class="results-screen" id="results-screen" style="display: none;">
                </div>
            </div>
        `;

        this.injectStyles();
        this.loadCase(0);
    }

    loadCase(index) {
        this.currentCaseIndex = index;
        this.currentStep = 0;
        this.answers = {};
        this.selectedStamp = null;

        const caseData = this.cases[index];

        // Update case number
        document.getElementById('case-num').textContent = index + 1;

        // Reset paper background
        const paper = document.getElementById('evidence-paper');
        paper.style.background = '#fffef5';
        paper.classList.remove('stamped');

        // Clear stamp zone
        document.getElementById('stamp-zone').innerHTML = '';

        // Load evidence content
        document.getElementById('evidence-content').innerHTML = `
            <h3 class="evidence-title">${caseData.title}</h3>
            <p class="evidence-text">"${caseData.content}"</p>
            ${caseData.imageNote ? `<span class="evidence-note">📷 ${caseData.imageNote}</span>` : ''}
            <div class="shares-badge">📤 ${caseData.shares}</div>
        `;

        document.getElementById('source-tag').textContent = `Fonte: ${caseData.source}`;

        // Update progress dots
        this.updateProgressDots();

        // Load first tool
        this.loadTool(0);
    }

    loadTool(stepIndex) {
        this.currentStep = stepIndex;
        const stepKey = this.steps[stepIndex];
        const toolBelt = document.getElementById('tool-belt');

        this.updateProgressDots();

        let toolHTML = '';

        switch (stepKey) {
            case 'type':
                toolHTML = this.renderPieChart();
                break;
            case 'category':
                toolHTML = this.renderStamps();
                break;
            case 'severity':
                toolHTML = this.renderGravityMeter();
                break;
            case 'motivation':
                toolHTML = this.renderFolders();
                break;
        }

        toolBelt.innerHTML = `
            <div class="tool-container fade-in">
                <div class="tool-header">
                    <span class="tool-icon">${this.tools[stepKey].icon || this.tools[stepKey].name}</span>
                    <h4>${this.tools[stepKey].name}</h4>
                </div>
                <div class="tool-content">
                    ${toolHTML}
                </div>
                <button class="confirm-btn" id="confirm-btn" disabled>
                    ✓ Confirmar ${this.stepNames[stepIndex]}
                </button>
            </div>
        `;

        this.bindToolEvents(stepKey);
    }

    renderPieChart() {
        const options = this.tools.type.options;
        return `
            <div class="pie-chart-container">
                <svg class="pie-chart" viewBox="0 0 200 200">
                    ${options.map((opt, i) => {
            const startAngle = (i * 90 - 45) * Math.PI / 180;
            const endAngle = ((i + 1) * 90 - 45) * Math.PI / 180;
            const x1 = 100 + 80 * Math.cos(startAngle);
            const y1 = 100 + 80 * Math.sin(startAngle);
            const x2 = 100 + 80 * Math.cos(endAngle);
            const y2 = 100 + 80 * Math.sin(endAngle);
            return `
                            <path class="pie-sector" data-value="${opt.id}" 
                                d="M100,100 L${x1},${y1} A80,80 0 0,1 ${x2},${y2} Z"
                                fill="${opt.color}" />
                        `;
        }).join('')}
                    <circle cx="100" cy="100" r="30" fill="#1a1a2e"/>
                    <text x="100" y="105" text-anchor="middle" fill="white" font-size="14" font-weight="bold">?</text>
                </svg>
                <div class="pie-labels">
                    ${options.map(opt => `
                        <div class="pie-label" data-value="${opt.id}" style="--label-color: ${opt.color}">
                            <span class="label-emoji">${opt.emoji}</span>
                            <span class="label-text">${opt.label}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderStamps() {
        const stamps = this.tools.category.stamps;
        return `
            <div class="stamps-container">
                <p class="stamps-instruction">Selecione um carimbo e clique no documento para aplicar:</p>
                <div class="stamps-grid">
                    ${stamps.map(s => `
                        <button class="stamp-btn" data-id="${s.id}" data-emoji="${s.emoji}" style="--stamp-color: ${s.color}">
                            <span class="stamp-emoji">${s.emoji}</span>
                            <span class="stamp-label">${s.label}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderGravityMeter() {
        const levels = this.tools.severity.levels;
        return `
            <div class="gravity-meter-container">
                <div class="meter-display">
                    <div class="meter-needle" id="meter-needle"></div>
                    <div class="meter-scale">
                        ${levels.map(l => `
                            <div class="meter-level" data-level="${l.level}" style="background: ${l.color}">
                                <span class="level-num">${l.level}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="meter-labels">
                    <span>🟢 Baixa</span>
                    <span class="current-level" id="current-level">Selecione</span>
                    <span>🔴 Alta</span>
                </div>
            </div>
        `;
    }

    renderFolders() {
        const folders = this.tools.motivation.folders;
        return `
            <div class="folders-container">
                <p class="folders-instruction">Arquive o caso na pasta correta:</p>
                <div class="folders-grid">
                    ${folders.map(f => `
                        <div class="folder" data-id="${f.id}" style="--folder-color: ${f.color}">
                            <div class="folder-tab">${f.emoji}</div>
                            <div class="folder-body">
                                <span class="folder-label">${f.label}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    bindToolEvents(stepKey) {
        const confirmBtn = document.getElementById('confirm-btn');

        switch (stepKey) {
            case 'type':
                // Pie chart sectors
                document.querySelectorAll('.pie-sector, .pie-label').forEach(el => {
                    el.addEventListener('click', () => {
                        const value = el.dataset.value;
                        this.selectAnswer('type', value);

                        // Visual feedback
                        document.querySelectorAll('.pie-sector').forEach(s => s.classList.remove('selected'));
                        document.querySelectorAll('.pie-label').forEach(l => l.classList.remove('selected'));
                        document.querySelector(`.pie-sector[data-value="${value}"]`)?.classList.add('selected');
                        document.querySelector(`.pie-label[data-value="${value}"]`)?.classList.add('selected');

                        // Update center
                        const opt = this.tools.type.options.find(o => o.id === value);
                        const centerText = document.querySelector('.pie-chart text');
                        if (centerText && opt) {
                            centerText.textContent = opt.emoji;
                        }

                        // Enable confirm button
                        confirmBtn.disabled = false;
                    });
                });

                // Confirm button advances to next step
                confirmBtn.addEventListener('click', () => {
                    this.loadTool(1);
                });
                break;

            case 'category':
                let paper = document.getElementById('evidence-paper');
                const stampZone = document.getElementById('stamp-zone');

                // Clone the paper element to remove all old event listeners
                const paperClone = paper.cloneNode(true);
                paper.parentNode.replaceChild(paperClone, paper);
                paper = paperClone;

                document.querySelectorAll('.stamp-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        // Select stamp
                        document.querySelectorAll('.stamp-btn').forEach(b => b.classList.remove('selected'));
                        btn.classList.add('selected');
                        this.selectedStamp = {
                            id: parseInt(btn.dataset.id),
                            emoji: btn.dataset.emoji
                        };

                        // Change cursor
                        paper.style.cursor = `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><text y='30' font-size='30'>${btn.dataset.emoji}</text></svg>") 20 20, pointer`;
                        paper.classList.add('stamp-mode');
                    });
                });

                // Click on paper to stamp
                paper.addEventListener('click', (e) => {
                    if (this.selectedStamp && paper.classList.contains('stamp-mode')) {
                        // Add stamp to paper
                        const sz = document.getElementById('stamp-zone');
                        sz.innerHTML = `<span class="applied-stamp">${this.selectedStamp.emoji}</span>`;
                        paper.classList.add('stamped');
                        paper.classList.remove('stamp-mode');
                        paper.style.cursor = 'default';

                        this.selectAnswer('category', this.selectedStamp.id);

                        // Enable confirm button
                        confirmBtn.disabled = false;
                    }
                });

                // Confirm button advances to next step
                confirmBtn.addEventListener('click', () => {
                    this.loadTool(2);
                });
                break;

            case 'severity':
                const meterLevels = document.querySelectorAll('.meter-level');
                const paperEl = document.getElementById('evidence-paper');

                meterLevels.forEach(level => {
                    level.addEventListener('click', () => {
                        const levelNum = parseInt(level.dataset.level);
                        const levelData = this.tools.severity.levels.find(l => l.level === levelNum);

                        // Visual feedback
                        meterLevels.forEach(l => l.classList.remove('selected'));
                        level.classList.add('selected');

                        // Update label
                        document.getElementById('current-level').textContent = `${levelNum} - ${levelData.label}`;

                        // Change paper background color
                        paperEl.style.background = `linear-gradient(135deg, ${levelData.color}, #fffef5)`;

                        this.selectAnswer('severity', levelNum);

                        // Enable confirm button
                        confirmBtn.disabled = false;
                    });
                });

                // Confirm button advances to next step
                confirmBtn.addEventListener('click', () => {
                    this.loadTool(3);
                });
                break;

            case 'motivation':
                document.querySelectorAll('.folder').forEach(folder => {
                    folder.addEventListener('click', () => {
                        // Visual feedback - select folder
                        document.querySelectorAll('.folder').forEach(f => f.classList.remove('selected'));
                        folder.classList.add('selected');

                        const value = folder.dataset.id;
                        this.selectAnswer('motivation', value);

                        // Enable confirm button
                        confirmBtn.disabled = false;
                    });
                });

                // Confirm button triggers filing animation and evaluation
                confirmBtn.addEventListener('click', () => {
                    const selectedFolder = document.querySelector('.folder.selected');
                    const paper = document.getElementById('evidence-paper');

                    if (selectedFolder) {
                        selectedFolder.classList.add('receiving');
                        paper.classList.add('filing');

                        setTimeout(() => {
                            selectedFolder.classList.remove('receiving');
                            this.evaluateCase();
                        }, 800);
                    }
                });
                break;
        }
    }

    selectAnswer(stepKey, value) {
        this.answers[stepKey] = value;
    }

    updateProgressDots() {
        document.querySelectorAll('.step-dot').forEach((dot, i) => {
            dot.classList.remove('active', 'completed');
            if (i < this.currentStep) {
                dot.classList.add('completed');
            } else if (i === this.currentStep) {
                dot.classList.add('active');
            }
        });
    }

    evaluateCase() {
        const caseData = this.cases[this.currentCaseIndex];
        const correct = caseData.correct;
        let caseScore = 0;
        let results = {};

        // Check each dimension
        this.steps.forEach(step => {
            const isCorrect = this.answers[step] === correct[step];
            results[step] = {
                answer: this.answers[step],
                correct: correct[step],
                isCorrect: isCorrect,
                explanation: caseData.explanation[step]
            };
            if (isCorrect) {
                caseScore += this.config.pointsPerDimension;
            }
        });

        this.score += caseScore;
        this.results.push({ caseIndex: this.currentCaseIndex, score: caseScore, details: results });

        document.getElementById('score').textContent = this.score;

        this.showFeedback(results, caseScore);
    }

    showFeedback(results, caseScore) {
        const overlay = document.getElementById('feedback-overlay');
        const perfectScore = caseScore === this.config.maxPoints;

        let correctCount = Object.values(results).filter(r => r.isCorrect).length;

        overlay.style.display = 'flex';
        overlay.innerHTML = `
            <div class="feedback-card ${perfectScore ? 'perfect' : ''} fade-in">
                <div class="feedback-header">
                    ${perfectScore
                ? '<span class="feedback-icon">🎉</span><h3>Análise Perfeita!</h3>'
                : `<span class="feedback-icon">📋</span><h3>Relatório: ${correctCount}/4 corretos</h3>`}
                    <div class="score-earned">+${caseScore} pontos</div>
                </div>
                
                <div class="feedback-details">
                    ${this.steps.map(step => {
                    const r = results[step];
                    const tool = this.tools[step];
                    return `
                            <div class="feedback-item ${r.isCorrect ? 'correct' : 'incorrect'}">
                                <div class="item-header">
                                    <span>${tool.icon || tool.name} ${tool.name}</span>
                                    <span>${r.isCorrect ? '✅' : '❌'}</span>
                                </div>
                                <p class="item-explanation">${r.explanation}</p>
                            </div>
                        `;
                }).join('')}
                </div>
                
                <button class="next-btn" id="next-btn">
                    ${this.currentCaseIndex < this.cases.length - 1 ? '📋 Próximo Caso' : '🏆 Ver Resultado Final'}
                </button>
            </div>
        `;

        document.getElementById('next-btn').addEventListener('click', () => {
            overlay.style.display = 'none';
            if (this.currentCaseIndex < this.cases.length - 1) {
                this.loadCase(this.currentCaseIndex + 1);
            } else {
                this.showFinalResults();
            }
        });
    }

    showFinalResults() {
        const workspace = document.querySelector('.desk-workspace');
        const results = document.getElementById('results-screen');

        workspace.style.display = 'none';
        document.getElementById('tool-belt').style.display = 'none';
        document.getElementById('progress-steps').style.display = 'none';
        results.style.display = 'block';

        const maxPossible = this.cases.length * this.config.maxPoints;
        const percentage = Math.round((this.score / maxPossible) * 100);

        let medal = null;
        if (percentage >= this.medals.gold.min) medal = this.medals.gold;
        else if (percentage >= this.medals.silver.min) medal = this.medals.silver;
        else if (percentage >= this.medals.bronze.min) medal = this.medals.bronze;

        results.innerHTML = `
            <div class="final-results fade-in">
                <div class="results-badge">
                    ${medal ? `<span class="medal">${medal.emoji}</span>` : '<span class="medal">🎖️</span>'}
                </div>
                
                <h2>Relatório Final do Detetive</h2>
                
                <div class="final-score">
                    <span class="big-score">${this.score}</span>
                    <span class="max-score">/ ${maxPossible} pontos</span>
                </div>
                
                <div class="accuracy">${percentage}% de precisão</div>
                
                ${medal ? `<div class="medal-earned">Medalha de ${medal.label} conquistada!</div>` : ''}
                
                <div class="results-actions">
                    <button class="btn-secondary" id="replay-btn">🔄 Investigar Novamente</button>
                    <button class="btn-primary" id="continue-btn">➡️ Continuar Curso</button>
                </div>
            </div>
        `;

        document.getElementById('replay-btn').addEventListener('click', () => {
            this.resetGame();
        });

        document.getElementById('continue-btn').addEventListener('click', () => {
            if (window.app) window.app.nextPage();
        });
    }

    resetGame() {
        this.currentCaseIndex = 0;
        this.currentStep = 0;
        this.score = 0;
        this.answers = {};
        this.results = [];

        document.querySelector('.desk-workspace').style.display = 'flex';
        document.getElementById('tool-belt').style.display = 'block';
        document.getElementById('progress-steps').style.display = 'flex';
        document.getElementById('results-screen').style.display = 'none';
        document.getElementById('score').textContent = '0';

        this.loadCase(0);
    }

    injectStyles() {
        if (document.getElementById('detective-game-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'detective-game-styles';
        styles.textContent = `
            /* === DETECTIVE GAME THEME === */
            
            .detective-game {
                max-width: 900px;
                margin: 0 auto;
                font-family: var(--font-family);
            }
            
            /* Desk Header */
            .desk-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 20px;
                background: linear-gradient(135deg, #1a1a2e, #2d2d44);
                border-radius: 16px;
                margin-bottom: 20px;
                color: white;
            }
            
            .badge {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .badge-icon {
                font-size: 1.8rem;
            }
            
            .badge-text {
                font-weight: 700;
                font-size: 1rem;
            }
            
            .case-info {
                display: flex;
                gap: 20px;
                align-items: center;
            }
            
            .score-badge {
                background: linear-gradient(135deg, #E53935, #FF6F61);
                padding: 8px 16px;
                border-radius: 20px;
                font-weight: 700;
            }
            
            /* Desk Workspace */
            .desk-workspace {
                display: flex;
                gap: 25px;
                margin-bottom: 20px;
            }
            
            /* Evidence Paper */
            .evidence-paper {
                flex: 1;
                background: #fffef5;
                border-radius: 4px;
                padding: 30px;
                position: relative;
                box-shadow: 
                    0 2px 10px rgba(0,0,0,0.1),
                    0 0 0 1px rgba(0,0,0,0.05);
                min-height: 300px;
                transition: background 0.5s ease;
                transform: rotate(-1deg);
            }
            
            .evidence-paper::before {
                content: '';
                position: absolute;
                top: 0;
                left: 40px;
                right: 40px;
                height: 100%;
                background: repeating-linear-gradient(
                    transparent,
                    transparent 27px,
                    #e0e0e0 28px
                );
                pointer-events: none;
            }
            
            .paper-clip {
                position: absolute;
                top: -10px;
                right: 30px;
                font-size: 2rem;
                transform: rotate(45deg);
            }
            
            .stamp-zone {
                position: absolute;
                top: 20px;
                right: 20px;
                width: 80px;
                height: 80px;
            }
            
            .applied-stamp {
                font-size: 4rem;
                animation: stampIn 0.3s ease;
            }
            
            @keyframes stampIn {
                0% { transform: scale(2) rotate(-10deg); opacity: 0; }
                50% { transform: scale(1.2) rotate(5deg); }
                100% { transform: scale(1) rotate(0deg); opacity: 1; }
            }
            
            .evidence-content {
                position: relative;
                z-index: 1;
            }
            
            .evidence-title {
                font-size: 1.1rem;
                color: #1a1a2e;
                margin-bottom: 15px;
                font-weight: 700;
            }
            
            .evidence-text {
                font-size: 1.2rem;
                font-style: italic;
                color: #333;
                line-height: 1.8;
                margin-bottom: 15px;
            }
            
            .evidence-note {
                display: inline-block;
                background: #f5f5f5;
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 0.85rem;
                color: #666;
            }
            
            .shares-badge {
                display: inline-block;
                margin-top: 15px;
                background: rgba(229,57,53,0.1);
                color: #E53935;
                padding: 5px 12px;
                border-radius: 15px;
                font-size: 0.8rem;
                font-weight: 600;
            }
            
            .paper-footer {
                position: absolute;
                bottom: 15px;
                left: 30px;
            }
            
            .source-tag {
                font-size: 0.8rem;
                color: #888;
            }
            
            .evidence-paper.stamp-mode {
                box-shadow: 0 0 0 3px #E53935, 0 5px 20px rgba(229,57,53,0.3);
            }
            
            .evidence-paper.filing {
                animation: flyAway 0.8s ease forwards;
            }
            
            @keyframes flyAway {
                0% { transform: rotate(-1deg) scale(1); opacity: 1; }
                100% { transform: rotate(10deg) scale(0.5) translateY(100px); opacity: 0; }
            }
            
            /* Tool Belt */
            .tool-belt {
                width: 350px;
            }
            
            .tool-container {
                background: linear-gradient(145deg, #f8f9fa, #ffffff);
                border-radius: 16px;
                padding: 20px;
                border: 1px solid rgba(0,0,0,0.05);
                box-shadow: 0 5px 20px rgba(0,0,0,0.05);
            }
            
            .tool-header {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 2px solid #f0f0f0;
            }
            
            .tool-icon {
                font-size: 1.5rem;
            }
            
            .tool-header h4 {
                font-size: 1rem;
                color: #1a1a2e;
                margin: 0;
            }
            
            /* Confirm Button */
            .confirm-btn {
                display: block;
                width: 100%;
                padding: 14px;
                margin-top: 20px;
                background: linear-gradient(135deg, #4CAF50, #45a049);
                color: white;
                border: none;
                border-radius: 12px;
                font-size: 1rem;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
            }
            
            .confirm-btn:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
            }
            
            .confirm-btn:disabled {
                background: #ccc;
                cursor: not-allowed;
                box-shadow: none;
            }
            
            /* Selected Folder */
            .folder.selected {
                transform: scale(1.05);
                box-shadow: 0 0 0 3px var(--folder-color), 0 5px 15px rgba(0,0,0,0.2);
            }
            
            /* Pie Chart */
            .pie-chart-container {
                text-align: center;
            }
            
            .pie-chart {
                width: 180px;
                height: 180px;
                margin: 0 auto 15px;
            }
            
            .pie-sector {
                cursor: pointer;
                transition: all 0.3s;
                stroke: #fff;
                stroke-width: 2;
            }
            
            .pie-sector:hover {
                transform: scale(1.05);
                transform-origin: center;
                filter: brightness(1.1);
            }
            
            .pie-sector.selected {
                stroke: #1a1a2e;
                stroke-width: 4;
            }
            
            .pie-labels {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
            }
            
            .pie-label {
                padding: 8px;
                border-radius: 8px;
                background: #f5f5f5;
                cursor: pointer;
                transition: all 0.3s;
                font-size: 0.8rem;
                text-align: center;
            }
            
            .pie-label:hover, .pie-label.selected {
                background: var(--label-color);
                color: white;
            }
            
            .label-emoji {
                display: block;
                font-size: 1.2rem;
                margin-bottom: 3px;
            }
            
            /* Stamps */
            .stamps-instruction {
                font-size: 0.85rem;
                color: #666;
                margin-bottom: 15px;
            }
            
            .stamps-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 10px;
            }
            
            .stamp-btn {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 12px 8px;
                background: white;
                border: 2px solid #e0e0e0;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .stamp-btn:hover {
                border-color: var(--stamp-color);
                transform: translateY(-2px);
            }
            
            .stamp-btn.selected {
                border-color: var(--stamp-color);
                background: linear-gradient(135deg, var(--stamp-color), var(--stamp-color));
                color: white;
            }
            
            .stamp-emoji {
                font-size: 1.5rem;
                margin-bottom: 5px;
            }
            
            .stamp-label {
                font-size: 0.7rem;
                font-weight: 600;
            }
            
            /* Gravity Meter */
            .gravity-meter-container {
                text-align: center;
            }
            
            .meter-display {
                margin-bottom: 15px;
            }
            
            .meter-scale {
                display: flex;
                border-radius: 8px;
                overflow: hidden;
            }
            
            .meter-level {
                flex: 1;
                padding: 15px 0;
                cursor: pointer;
                transition: all 0.3s;
                border: 2px solid transparent;
            }
            
            .meter-level:hover {
                transform: scaleY(1.1);
            }
            
            .meter-level.selected {
                border-color: #1a1a2e;
                transform: scaleY(1.15);
                z-index: 1;
            }
            
            .level-num {
                font-weight: 900;
                color: rgba(0,0,0,0.5);
                font-size: 1.2rem;
            }
            
            .meter-labels {
                display: flex;
                justify-content: space-between;
                font-size: 0.8rem;
                color: #666;
            }
            
            .current-level {
                font-weight: 700;
                color: #E53935;
            }
            
            /* Folders */
            .folders-instruction {
                font-size: 0.85rem;
                color: #666;
                margin-bottom: 15px;
            }
            
            .folders-grid {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                justify-content: center;
            }
            
            .folder {
                width: 70px;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .folder:hover {
                transform: translateY(-5px) scale(1.05);
            }
            
            .folder.receiving {
                animation: pulse 0.3s ease;
            }
            
            @keyframes pulse {
                50% { transform: scale(1.2); }
            }
            
            .folder-tab {
                background: var(--folder-color);
                padding: 5px;
                border-radius: 5px 5px 0 0;
                text-align: center;
                font-size: 1.2rem;
            }
            
            .folder-body {
                background: linear-gradient(180deg, var(--folder-color), color-mix(in srgb, var(--folder-color), black 20%));
                padding: 10px 5px;
                border-radius: 5px;
                text-align: center;
                min-height: 50px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .folder-label {
                color: white;
                font-size: 0.65rem;
                font-weight: 600;
            }
            
            /* Progress Steps */
            .progress-steps {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 5px;
                padding: 15px;
                background: #f8f9fa;
                border-radius: 12px;
            }
            
            .step-dot {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 5px;
                opacity: 0.4;
                transition: all 0.3s;
            }
            
            .step-dot.active {
                opacity: 1;
            }
            
            .step-dot.completed {
                opacity: 0.7;
            }
            
            .step-dot.completed .step-num {
                background: #4CAF50;
            }
            
            .step-num {
                width: 30px;
                height: 30px;
                line-height: 30px;
                background: #E53935;
                color: white;
                border-radius: 50%;
                font-weight: 700;
                font-size: 0.9rem;
                text-align: center;
            }
            
            .step-label {
                font-size: 0.7rem;
                color: #666;
                white-space: nowrap;
            }
            
            .step-line {
                width: 30px;
                height: 2px;
                background: #ddd;
            }
            
            /* Feedback Overlay */
            .feedback-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                padding: 20px;
            }
            
            .feedback-card {
                background: white;
                border-radius: 20px;
                padding: 30px;
                max-width: 500px;
                width: 100%;
                max-height: 80vh;
                overflow-y: auto;
            }
            
            .feedback-card.perfect {
                border: 3px solid #4CAF50;
            }
            
            .feedback-header {
                text-align: center;
                margin-bottom: 25px;
            }
            
            .feedback-icon {
                font-size: 3rem;
                display: block;
                margin-bottom: 10px;
            }
            
            .score-earned {
                display: inline-block;
                background: linear-gradient(135deg, #E53935, #FF6F61);
                color: white;
                padding: 8px 20px;
                border-radius: 20px;
                font-weight: 700;
                margin-top: 10px;
            }
            
            .feedback-item {
                padding: 15px;
                border-radius: 10px;
                margin-bottom: 10px;
                border-left: 4px solid;
            }
            
            .feedback-item.correct {
                background: #e8f5e9;
                border-color: #4CAF50;
            }
            
            .feedback-item.incorrect {
                background: #ffebee;
                border-color: #E53935;
            }
            
            .item-header {
                display: flex;
                justify-content: space-between;
                font-weight: 600;
                margin-bottom: 8px;
            }
            
            .item-explanation {
                font-size: 0.9rem;
                color: #555;
                line-height: 1.6;
                margin: 0;
            }
            
            .next-btn {
                display: block;
                width: 100%;
                padding: 15px;
                background: linear-gradient(135deg, #E53935, #FF6F61);
                color: white;
                border: none;
                border-radius: 30px;
                font-size: 1.1rem;
                font-weight: 700;
                cursor: pointer;
                margin-top: 20px;
                transition: transform 0.3s;
            }
            
            .next-btn:hover {
                transform: scale(1.02);
            }
            
            /* Final Results */
            .final-results {
                text-align: center;
                padding: 40px;
                background: linear-gradient(145deg, #f8f9fa, #ffffff);
                border-radius: 24px;
            }
            
            .results-badge {
                margin-bottom: 20px;
            }
            
            .medal {
                font-size: 5rem;
                animation: bounce 1s ease infinite;
            }
            
            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-15px); }
            }
            
            .final-score {
                margin: 20px 0;
            }
            
            .big-score {
                font-size: 4rem;
                font-weight: 900;
                background: linear-gradient(135deg, #E53935, #FF6F61);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            
            .max-score {
                font-size: 1.5rem;
                color: #999;
            }
            
            .accuracy {
                font-size: 1.2rem;
                color: #666;
                margin-bottom: 15px;
            }
            
            .medal-earned {
                background: linear-gradient(135deg, #FFD700, #FFA000);
                color: white;
                padding: 10px 25px;
                border-radius: 20px;
                display: inline-block;
                font-weight: 700;
                margin-bottom: 25px;
            }
            
            .results-actions {
                display: flex;
                gap: 15px;
                justify-content: center;
            }
            
            .btn-primary, .btn-secondary {
                padding: 12px 25px;
                border-radius: 25px;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.3s;
            }
            
            .btn-primary {
                background: linear-gradient(135deg, #E53935, #FF6F61);
                color: white;
                border: none;
            }
            
            .btn-secondary {
                background: white;
                color: #E53935;
                border: 2px solid #E53935;
            }
            
            .btn-primary:hover, .btn-secondary:hover {
                transform: scale(1.05);
            }
            
            /* Animations */
            .fade-in {
                animation: fadeIn 0.5s ease;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            /* Responsive */
            @media (max-width: 700px) {
                .desk-workspace {
                    flex-direction: column;
                }
                
                .tool-belt {
                    width: 100%;
                }
                
                .evidence-paper {
                    transform: rotate(0deg);
                }
                
                .progress-steps {
                    overflow-x: auto;
                }
                
                .step-label {
                    display: none;
                }
                
                .stamps-grid {
                    grid-template-columns: repeat(3, 1fr);
                }
                
                .results-actions {
                    flex-direction: column;
                }
            }
        `;

        document.head.appendChild(styles);
    }
}
