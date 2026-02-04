/**
 * keyboard.js - Atalhos de Teclado
 * Gerencia navegação e ações via teclado
 */

const KeyboardManager = {
    enabled: true,

    /**
     * Inicializa os atalhos de teclado
     */
    init: function () {
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
        console.log('KeyboardManager initialized');
    },

    /**
     * Handler principal de teclas
     */
    handleKeydown: function (e) {
        // Não processar se estiver em input/textarea
        if (this.isTyping(e.target)) return;

        switch (e.key) {
            case 'ArrowLeft':
                this.navigatePrev();
                e.preventDefault();
                break;

            case 'ArrowRight':
                this.navigateNext();
                e.preventDefault();
                break;

            case 'Escape':
                this.closeModals();
                e.preventDefault();
                break;

            case 'm':
            case 'M':
                this.toggleMenu();
                e.preventDefault();
                break;

            case '?':
                this.showShortcutsHelp();
                e.preventDefault();
                break;
        }
    },

    /**
     * Verifica se o usuário está digitando em um campo
     */
    isTyping: function (target) {
        const tagName = target.tagName.toLowerCase();
        return tagName === 'input' || tagName === 'textarea' || target.isContentEditable;
    },

    /**
     * Navega para a página anterior
     */
    navigatePrev: function () {
        const btnPrev = document.getElementById('btn-prev');
        if (btnPrev && !btnPrev.disabled) {
            btnPrev.click();
        }
    },

    /**
     * Navega para a próxima página
     */
    navigateNext: function () {
        const btnNext = document.getElementById('btn-next');
        if (btnNext && !btnNext.disabled) {
            btnNext.click();
        }
    },

    /**
     * Fecha todos os modais abertos
     */
    closeModals: function () {
        // Fechar modal de configurações
        const settingsModal = document.getElementById('modal-settings');
        if (settingsModal && settingsModal.classList.contains('active')) {
            settingsModal.classList.remove('active');
            if (typeof AudioManager !== 'undefined') AudioManager.playClick();
            return;
        }

        // Fechar modais de conteúdo
        const contentModals = document.querySelectorAll('.modal-overlay.active');
        contentModals.forEach(modal => {
            modal.classList.remove('active');
            if (typeof AudioManager !== 'undefined') AudioManager.playClick();
        });
    },

    /**
     * Toggle do menu/sidebar (se existir)
     */
    toggleMenu: function () {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.toggle('collapsed');
            if (typeof AudioManager !== 'undefined') AudioManager.playClick();
        }
    },

    /**
     * Mostra ajuda de atalhos
     */
    showShortcutsHelp: function () {
        // Criar notificação temporária com os atalhos
        const helpText = '⌨️ Atalhos: ← Anterior | → Próximo | Esc Fechar | M Menu';

        // Verificar se já existe uma notificação
        let notification = document.getElementById('keyboard-help-notification');
        if (notification) {
            notification.remove();
        }

        // Criar elemento de notificação
        notification = document.createElement('div');
        notification.id = 'keyboard-help-notification';
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.85);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 10000;
            animation: fadeInOut 3s ease-in-out forwards;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;
        notification.textContent = helpText;
        document.body.appendChild(notification);

        // Adicionar estilos de animação se não existirem
        if (!document.getElementById('keyboard-help-styles')) {
            const style = document.createElement('style');
            style.id = 'keyboard-help-styles';
            style.textContent = `
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translateX(-50%) translateY(20px); }
                    10% { opacity: 1; transform: translateX(-50%) translateY(0); }
                    80% { opacity: 1; transform: translateX(-50%) translateY(0); }
                    100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
                }
            `;
            document.head.appendChild(style);
        }

        // Remover após animação
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
};

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    KeyboardManager.init();
});
