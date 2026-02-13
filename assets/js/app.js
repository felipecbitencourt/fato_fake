/**
 * Main Application Logic
 * Fato ou Fake SCORM Course
 */

import { SCORM } from './modules/scorm-wrapper.js';
import { GameEngine } from './modules/game-engine.js';
import { ClassificationGame } from './modules/classification-game.js';
// Import Accessibility later if needed, or let index.html handle it via global script

class App {
    constructor() {
        this.config = window.APP_CONFIG || { sequential: true };
        this.modules = [];
        this.currentModuleIndex = 0;
        this.currentPageIndex = 0;
        this.visitedPages = new Set(); // Track visited module-page combinations

        this.ui = {
            tabsContainer: document.getElementById('tabs-nav'),
            contentArea: document.getElementById('content-display'),
            btnPrev: document.getElementById('btn-prev'),
            btnNext: document.getElementById('btn-next'),
            progressIndicator: document.getElementById('progress-indicator')
        };

        // Cache initial content (Home) if present
        if (this.ui.contentArea.querySelector('.home-container')) {
            this.homeContentCache = this.ui.contentArea.innerHTML;
        }

        this.init();
    }

    async init() {
        console.log("App Initializing...");

        // 1. Initialize SCORM
        SCORM.init();

        // 2. Load Content Structure
        await this.loadContent();

        // 3. Restore Progress (SCORM suspend_data)
        this.restoreProgress();

        // 4. Render Tabs and Initial Content
        this.renderTabs();
        this.loadModule(this.currentModuleIndex);

        // 5. Bind Events
        this.bindEvents();
    }

    async loadContent() {
        try {
            const response = await fetch('content.json');
            this.modules = await response.json();
            console.log("Modules loaded:", this.modules);
        } catch (error) {
            console.error("Failed to load content.json", error);
            this.ui.contentArea.innerHTML = "<h1>Erro fatal</h1><p>Não foi possível carregar o curso.</p>";
        }
    }

    restoreProgress() {
        // Restore from SCORM suspend_data
        const suspendData = SCORM.getValue("cmi.suspend_data");
        if (suspendData) {
            try {
                const data = JSON.parse(suspendData);
                if (data.visited) {
                    this.visitedPages = new Set(data.visited);
                }
            } catch (e) {
                console.error("Error parsing suspend_data", e);
            }
        }

        // If debug mode, unlock all
        if (this.config.debug) {
            this.modules.forEach(m => m.locked = false);
        }
    }

    saveProgress() {
        try {
            const data = {
                visited: Array.from(this.visitedPages)
            };
            SCORM.setValue("cmi.suspend_data", JSON.stringify(data));
            if (typeof SCORM.save === 'function') {
                SCORM.save();
            } else {
                console.warn("SCORM.save is not available");
            }
        } catch (error) {
            console.error("Failed to save progress:", error);
        }
    }

    renderTabs() {
        this.ui.tabsContainer.innerHTML = '';

        // SVG Icons Mapping
        const icons = {
            "module_00": '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>', // Home
            "module_01": '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>', // Book
            "module_02": '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>', // History/Clock
            "module_03": '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>', // Chart
            "module_04": '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>', // Alert/Verify
            "module_05": '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>', // Robot
            "module_06": '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>', // Game/Screen
            "module_07": '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>' // Link
        };

        const chevronSvg = '<svg class="tab-chevron" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';

        this.modules.forEach((module, index) => {
            // Skip hidden modules (like the welcome page)
            if (module.hidden) return;

            const wrapper = document.createElement('div');
            wrapper.className = 'module-tab-wrapper';
            wrapper.dataset.moduleIndex = index;

            const btn = document.createElement('button');
            btn.className = 'tab-btn';
            if (index === this.currentModuleIndex) btn.classList.add('active');

            // Lock state
            const isLocked = module.locked && !this.config.debug;
            if (isLocked) {
                btn.disabled = true;
                btn.setAttribute('aria-disabled', 'true');
            }

            const iconSvg = icons[module.id] || '';
            const hasPages = module.pages && module.pages.length > 1;

            btn.innerHTML = `
                <span class="tab-icon">${iconSvg}</span>
                <span class="tab-title">${module.title}</span>
                ${hasPages && !isLocked ? chevronSvg : ''}
            `;

            wrapper.appendChild(btn);

            // Create pages dropdown if module has multiple pages
            if (hasPages && !isLocked) {
                const dropdown = document.createElement('div');
                dropdown.className = 'pages-dropdown';

                module.pages.forEach((page, pageIndex) => {
                    const pageBtn = document.createElement('button');
                    pageBtn.className = 'dropdown-page-btn';

                    if (index === this.currentModuleIndex && pageIndex === this.currentPageIndex) {
                        pageBtn.classList.add('active');
                    }

                    // Mark as visited if in the set
                    if (this.visitedPages.has(`${index}-${pageIndex}`)) {
                        pageBtn.classList.add('visited');
                    }

                    // Extract page name from file path
                    const pageName = this.getPageDisplayName(page);

                    pageBtn.innerHTML = `
                        <span class="dropdown-page-num">${String(pageIndex + 1).padStart(2, '0')}</span>
                        <span class="dropdown-page-name">${pageName}</span>
                    `;

                    pageBtn.onclick = (e) => {
                        e.stopPropagation();
                        this.goToPage(index, pageIndex);
                        this.closeAllDropdowns();
                    };

                    dropdown.appendChild(pageBtn);
                });

                wrapper.appendChild(dropdown);

                // Toggle dropdown on tab click
                btn.onclick = (e) => {
                    e.stopPropagation();
                    const isOpen = wrapper.classList.contains('open');
                    this.closeAllDropdowns();
                    if (!isOpen) {
                        wrapper.classList.add('open');
                    }
                };
            } else {
                // Direct load for single-page modules
                btn.onclick = () => {
                    if (!isLocked) {
                        this.goToPage(index, 0);
                    }
                };
            }

            this.ui.tabsContainer.appendChild(wrapper);
        });

        // Close dropdowns on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.module-tab-wrapper')) {
                this.closeAllDropdowns();
            }
        });
    }

    closeAllDropdowns() {
        document.querySelectorAll('.module-tab-wrapper.open').forEach(w => w.classList.remove('open'));
    }

    getPageDisplayName(pagePath) {
        // Extract filename without extension
        const filename = pagePath.split('/').pop().replace('.html', '');

        // Map common names to Portuguese
        const nameMap = {
            'index': 'Início',
            'intro': 'Introdução',
            'definitions': 'Definições',
            'categories': 'Categorias',
            'motivations': 'Motivações',
            'protection': 'Proteção',
            'summary': 'Resumo',
            'quiz': 'Quiz',
            'conclusion': 'Conclusão',
            'evolution': 'Evolução',
            'case_vaccines': 'Caso: Vacinas',
            'case_climate': 'Caso: Clima',
            'case_flatearth': 'Caso: Terra Plana'
        };

        // Try to find a match
        for (const [key, value] of Object.entries(nameMap)) {
            if (filename.toLowerCase().includes(key)) {
                return value;
            }
        }

        // Fallback: capitalize and clean up
        return filename.replace(/^\d+_/, '').replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    }

    goToPage(moduleIndex, pageIndex) {
        if (this.modules[moduleIndex].locked && !this.config.debug) return;

        this.currentModuleIndex = moduleIndex;
        this.currentPageIndex = pageIndex;

        // Mark as visited
        this.visitedPages.add(`${moduleIndex}-${pageIndex}`);
        this.saveProgress();

        const module = this.modules[moduleIndex];

        // Update Tabs UI
        this.renderTabs();
        this.updateTabsUI();

        // Render Content
        this.renderModuleContent(module);

        // Update Navigation Buttons
        this.updateNavButtons();
    }

    updateTabsUI() {
        const wrappers = this.ui.tabsContainer.querySelectorAll('.module-tab-wrapper');
        wrappers.forEach((wrapper) => {
            const mIndex = parseInt(wrapper.dataset.moduleIndex);
            const btn = wrapper.querySelector('.tab-btn');
            btn.classList.toggle('active', mIndex === this.currentModuleIndex);

            // Update active page in dropdown
            const pageButtons = wrapper.querySelectorAll('.dropdown-page-btn');
            pageButtons.forEach((pageBtn, pageIndex) => {
                pageBtn.classList.toggle('active',
                    mIndex === this.currentModuleIndex && pageIndex === this.currentPageIndex);
            });
        });
    }

    loadModule(index) {
        this.goToPage(index, 0);
    }

    executeScripts(container) {
        const scripts = container.getElementsByTagName("script");
        Array.from(scripts).forEach((oldScript) => {
            const newScript = document.createElement("script");

            // Copy attributes
            Array.from(oldScript.attributes).forEach((attr) => {
                newScript.setAttribute(attr.name, attr.value);
            });

            // Copy content
            newScript.appendChild(document.createTextNode(oldScript.innerHTML));

            // Execute
            oldScript.parentNode.replaceChild(newScript, oldScript);
        });
    }


    async renderModuleContent(module) {
        if (module.type === 'game') {
            this.ui.contentArea.innerHTML = '<div id="game-container"></div>';
            const game = new GameEngine(document.getElementById('game-container'));
            await game.init();
            this.ui.progressIndicator.textContent = "Modo Jogo";
            return;
        }

        // SPECIAL CASE: Module 00 (Home)
        // Check if we have cached content for Home to avoid fetching
        if (module.id === 'module_00' && this.homeContentCache) {
            this.ui.contentArea.innerHTML = this.homeContentCache;

            // Re-initialize Welcome Effects
            if (window.WelcomeEffects) {
                setTimeout(() => new window.WelcomeEffects(), 50);
            }

            // Execute scripts in cached content (essential for Start button)
            this.executeScripts(this.ui.contentArea);

            this.ui.progressIndicator.textContent = "";
            this.renderSideProgress(module);
            window.scrollTo(0, 0);
            return;
        }

        const pageFile = module.pages[this.currentPageIndex];
        const pageUrl = `paginas/${pageFile}`;

        try {
            const response = await fetch(pageUrl);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const html = await response.text();

            // Fade effect
            this.ui.contentArea.innerHTML = `<div class="fade-in">${html}</div>`;

            // Initialize Welcome Page Effects if needed
            if (module.id === 'module_00' && window.WelcomeEffects) {
                // Small delay to ensure DOM update
                setTimeout(() => new window.WelcomeEffects(), 50);
            }

            // Initialize Classification Game button if on quiz page
            if (pageFile.includes('06_quiz')) {
                setTimeout(() => {
                    const startBtn = document.getElementById('start-game-btn');
                    const gameSection = document.getElementById('game-section');
                    const gameContainer = document.getElementById('classification-game-container');

                    if (startBtn && gameSection && gameContainer) {
                        startBtn.addEventListener('click', () => {
                            // Hide briefing section and show game
                            startBtn.closest('.content-section').style.display = 'none';
                            gameSection.style.display = 'block';

                            // Initialize the game
                            const game = new ClassificationGame(gameContainer);
                            game.init();

                            // Scroll to game
                            gameSection.scrollIntoView({ behavior: 'smooth' });
                        });
                    }
                }, 100);
            }

            // Execute scripts found in the loaded content
            this.executeScripts(this.ui.contentArea);

        } catch (error) {
            console.error("Page load failed", error);
            this.ui.contentArea.innerHTML = `
                <div class="error-state">
                    <h3>Conteúdo não encontrado</h3>
                    <p>Não foi possível carregar: ${pageFile}</p>
                    <p><em>(Em desenvolvimento: Crie o arquivo na pasta 'paginas')</em></p>
                </div>`;
        }

        this.ui.progressIndicator.textContent = "";

        // Render Side Progress dots
        this.renderSideProgress(module);

        // Scroll to top
        window.scrollTo(0, 0);
    }

    renderSideProgress(module) {
        const sideNav = document.getElementById('header-progress');
        if (!sideNav) return;

        if (module.hidden || this.currentModuleIndex === 0) {
            sideNav.style.display = 'none';
            return;
        }

        sideNav.style.display = 'flex';
        sideNav.innerHTML = '';

        module.pages.forEach((page, index) => {
            const dot = document.createElement('div');
            dot.className = 'progress-dot';
            if (index === this.currentPageIndex) dot.classList.add('active');
            if (index < this.currentPageIndex) dot.classList.add('completed');

            dot.dataset.page = this.getPageDisplayName(page);
            dot.title = dot.dataset.page;

            dot.onclick = () => this.goToPage(this.currentModuleIndex, index);

            sideNav.appendChild(dot);
        });
    }

    bindEvents() {
        this.ui.btnPrev.onclick = () => this.prevPage();
        this.ui.btnNext.onclick = () => this.nextPage();

        // Logo click navigates to first page (home)
        const logoLink = document.getElementById('logo-home-link');
        if (logoLink) {
            logoLink.onclick = (e) => {
                e.preventDefault();
                this.goToPage(0, 0); // Go to first module, first page
            };
        }

        // Scroll direction detection for header hide/show
        this.setupScrollHeaderBehavior();
    }

    setupScrollHeaderBehavior() {
        const header = document.getElementById('main-header');
        if (!header) return;

        let lastScrollY = window.scrollY;
        let ticking = false;

        const updateHeader = () => {
            const currentScrollY = window.scrollY;

            // Only hide header after scrolling past a threshold (e.g., 100px)
            if (currentScrollY > 100) {
                if (currentScrollY > lastScrollY) {
                    // Scrolling DOWN - hide header
                    header.classList.add('header-hidden');
                } else {
                    // Scrolling UP - show header
                    header.classList.remove('header-hidden');
                }
            } else {
                // At top of page - always show header
                header.classList.remove('header-hidden');
            }

            lastScrollY = currentScrollY;
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateHeader);
                ticking = true;
            }
        }, { passive: true });
    }

    nextPage() {
        const currentModule = this.modules[this.currentModuleIndex];
        console.log(`Advancing from Module ${this.currentModuleIndex}, Page ${this.currentPageIndex}`);

        if (this.currentPageIndex < currentModule.pages.length - 1) {
            // Next page in same module
            this.currentPageIndex++;
            this.renderModuleContent(currentModule);
            this.updateNavButtons();
        } else {
            // End of module - Unlock next module
            console.log(`Module ${this.currentModuleIndex} complete. Unlocking next...`);
            this.completeModule(this.currentModuleIndex);

            if (this.currentModuleIndex < this.modules.length - 1) {
                console.log(`Loading next module: ${this.currentModuleIndex + 1}`);
                this.loadModule(this.currentModuleIndex + 1);
                // Note: loadModule calls goToPage which calls updateNavButtons
            } else {
                alert("Curso Finalizado!");
                SCORM.set("cmi.core.lesson_status", "completed");
                SCORM.save();
                this.updateNavButtons();
            }
        }
    }

    prevPage() {
        console.log(`Going back from Module ${this.currentModuleIndex}, Page ${this.currentPageIndex}`);
        if (this.currentPageIndex > 0) {
            this.currentPageIndex--;
            this.renderModuleContent(this.modules[this.currentModuleIndex]);
            this.updateNavButtons();
        } else if (this.currentModuleIndex > 0) {
            // Go to previous module last page
            const prevModuleIndex = this.currentModuleIndex - 1;
            this.currentPageIndex = this.modules[prevModuleIndex].pages.length - 1;
            this.loadModule(prevModuleIndex);
        }
    }

    updateNavButtons() {
        // Toggle footer visibility based on module
        const footer = document.querySelector('.content-footer');
        if (footer) {
            if (this.currentModuleIndex === 0) {
                footer.style.display = 'none';
            } else {
                footer.style.display = 'flex';
            }
        }

        const isFirst = this.currentModuleIndex === 0 && this.currentPageIndex === 0;
        const isLastModule = this.currentModuleIndex === this.modules.length - 1;
        const isLastPage = this.currentPageIndex === this.modules[this.currentModuleIndex].pages.length - 1;

        this.ui.btnPrev.disabled = isFirst;

        // Reset classes and content for btnNext
        this.ui.btnNext.disabled = false;
        this.ui.btnNext.classList.remove('finish-btn');

        if (isLastModule && isLastPage) {
            this.ui.btnNext.innerHTML = 'Finalizar ✓';
            this.ui.btnNext.classList.add('finish-btn');
            this.ui.btnNext.ariaLabel = "Finalizar Curso";
        } else {
            // Restore SVG Arrow if it was changed to text
            if (this.ui.btnNext.classList.contains('finish-btn') || this.ui.btnNext.textContent.includes('Finalizar')) {
                this.ui.btnNext.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';
            }
            this.ui.btnNext.ariaLabel = "Próxima Página";
        }
    }

    completeModule(index) {
        // Logic to unlock next module
        if (index < this.modules.length - 1) {
            this.modules[index + 1].locked = false;
            this.renderTabs(); // Re-render to remove lock icon
            SCORM.save(); // Save progress
        }
    }
}

// Start App
window.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

