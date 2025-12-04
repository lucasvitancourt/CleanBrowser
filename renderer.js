// ===== CLASSES - DEFINIDAS PRIMEIRO =====

// Sistema de Comandos Rápidos (Command Palette)
class CommandPalette {
    constructor() {
        this.commands = [
            { id: 'new-tab', name: 'Nova Aba', icon: 'plus', shortcut: 'Ctrl+T', action: () => window.tabSystem?.createTab() },
            { id: 'close-tab', name: 'Fechar Aba', icon: 'x', shortcut: 'Ctrl+W', action: () => window.tabSystem?.closeTab(window.tabSystem.activeTabId) },
            { id: 'reopen-tab', name: 'Reabrir Aba Fechada', icon: 'rotate-ccw', shortcut: 'Ctrl+Shift+T', action: () => this.reopenLastTab() },
            { id: 'bookmarks', name: 'Favoritos', icon: 'star', shortcut: 'Ctrl+B', action: () => window.tabSystem?.createInternalTab('bookmarks') },
            { id: 'history', name: 'Histórico', icon: 'clock', shortcut: 'Ctrl+H', action: () => window.tabSystem?.createInternalTab('history') },
            { id: 'downloads', name: 'Downloads', icon: 'download', shortcut: 'Ctrl+J', action: () => window.tabSystem?.createInternalTab('downloads') },
            { id: 'settings', name: 'Configurações', icon: 'settings', shortcut: 'Ctrl+,', action: () => window.tabSystem?.createInternalTab('settings') },
            { id: 'focus-url', name: 'Focar Barra de URL', icon: 'search', shortcut: 'Ctrl+L', action: () => document.getElementById('urlBar')?.focus() },
            { id: 'reload', name: 'Recarregar Página', icon: 'rotate-cw', shortcut: 'Ctrl+R', action: () => window.tabSystem?.getActiveWebview()?.reload() },
            { id: 'hard-reload', name: 'Recarregar (Limpar Cache)', icon: 'refresh-ccw', shortcut: 'Ctrl+Shift+R', action: () => window.tabSystem?.getActiveWebview()?.reloadIgnoringCache() },
            { id: 'zoom-in', name: 'Aumentar Zoom', icon: 'zoom-in', shortcut: 'Ctrl++', action: () => this.adjustZoom(0.1) },
            { id: 'zoom-out', name: 'Diminuir Zoom', icon: 'zoom-out', shortcut: 'Ctrl+-', action: () => this.adjustZoom(-0.1) },
            { id: 'zoom-reset', name: 'Resetar Zoom', icon: 'maximize-2', shortcut: 'Ctrl+0', action: () => this.resetZoom() },
            { id: 'fullscreen', name: 'Tela Cheia', icon: 'maximize', shortcut: 'F11', action: () => this.toggleFullscreen() },
            { id: 'devtools', name: 'Ferramentas do Desenvolvedor', icon: 'code', shortcut: 'F12', action: () => this.toggleDevTools() },
            { id: 'find', name: 'Buscar na Página', icon: 'search', shortcut: 'Ctrl+F', action: () => this.showFindInPage() },
            { id: 'print', name: 'Imprimir', icon: 'printer', shortcut: 'Ctrl+P', action: () => window.tabSystem?.getActiveWebview()?.print() },
            { id: 'clear-history', name: 'Limpar Histórico', icon: 'trash-2', shortcut: '', action: () => window.historySystem?.clearHistory() },
            { id: 'clear-cache', name: 'Limpar Cache', icon: 'trash', shortcut: '', action: () => this.clearCache() },
        ];
        this.closedTabs = [];
        this.createPalette();
        this.setupShortcuts();
    }

    createPalette() {
        const palette = document.createElement('div');
        palette.id = 'commandPalette';
        palette.className = 'fixed inset-0 modal-backdrop hidden items-center justify-center z-[100]';
        palette.innerHTML = `
            <div class="bg-dark-surface rounded-2xl w-[600px] shadow-2xl border border-dark-border overflow-hidden" onclick="event.stopPropagation()">
                <div class="p-4 border-b border-dark-border">
                    <div class="flex items-center gap-3 bg-dark-elevated rounded-lg px-4 py-3">
                        <i data-lucide="search" class="w-5 h-5 text-dark-secondary"></i>
                        <input 
                            type="text" 
                            id="commandSearch" 
                            placeholder="Digite um comando ou atalho..." 
                            class="flex-1 bg-transparent outline-none text-sm text-dark-text placeholder-dark-secondary"
                        >
                    </div>
                </div>
                <div id="commandList" class="max-h-[400px] overflow-y-auto p-2"></div>
            </div>
        `;
        document.body.appendChild(palette);

        const searchInput = palette.querySelector('#commandSearch');
        searchInput.addEventListener('input', (e) => this.filterCommands(e.target.value));
        
        palette.addEventListener('click', (e) => {
            if (e.target === palette) this.hide();
        });

        this.renderCommands();
    }

    renderCommands(filter = '') {
        const list = document.getElementById('commandList');
        const filtered = this.commands.filter(cmd => 
            cmd.name.toLowerCase().includes(filter.toLowerCase()) ||
            cmd.shortcut.toLowerCase().includes(filter.toLowerCase())
        );

        list.innerHTML = filtered.map(cmd => `
            <div class="command-item flex items-center justify-between p-3 rounded-lg hover:bg-dark-elevated cursor-pointer transition-colors group" data-command="${cmd.id}">
                <div class="flex items-center gap-3">
                    <i data-lucide="${cmd.icon}" class="w-4 h-4 text-dark-secondary"></i>
                    <span class="text-sm text-dark-text">${cmd.name}</span>
                </div>
                ${cmd.shortcut ? `<kbd class="text-xs text-dark-secondary bg-dark-bg px-2 py-1 rounded border border-dark-border">${cmd.shortcut}</kbd>` : ''}
            </div>
        `).join('');

        list.querySelectorAll('.command-item').forEach(item => {
            item.addEventListener('click', () => {
                const cmd = this.commands.find(c => c.id === item.dataset.command);
                if (cmd) {
                    cmd.action();
                    this.hide();
                }
            });
        });

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    filterCommands(query) {
        this.renderCommands(query);
    }

    show() {
        const palette = document.getElementById('commandPalette');
        palette.classList.remove('hidden');
        palette.classList.add('flex');
        document.getElementById('commandSearch').focus();
        document.getElementById('commandSearch').value = '';
        this.renderCommands();
    }

    hide() {
        const palette = document.getElementById('commandPalette');
        palette.classList.add('hidden');
        palette.classList.remove('flex');
    }

    setupShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Command Palette
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
                e.preventDefault();
                this.show();
                return;
            }

            // Executar comandos
            this.commands.forEach(cmd => {
                if (this.matchShortcut(e, cmd.shortcut)) {
                    e.preventDefault();
                    cmd.action();
                }
            });

            // Navegação entre abas
            if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '9') {
                e.preventDefault();
                const index = parseInt(e.key) - 1;
                const tabs = Array.from(document.querySelectorAll('.tab'));
                if (tabs[index]) {
                    window.tabSystem?.activateTab(tabs[index].id);
                }
            }

            // Próxima/Anterior aba
            if (e.ctrlKey && e.key === 'Tab') {
                e.preventDefault();
                this.switchTab(e.shiftKey ? -1 : 1);
            }
        });
    }

    matchShortcut(event, shortcut) {
        if (!shortcut) return false;
        const parts = shortcut.split('+').map(p => p.trim());
        
        let needsCtrl = parts.includes('Ctrl');
        let needsShift = parts.includes('Shift');
        let needsAlt = parts.includes('Alt');
        let key = parts[parts.length - 1];

        return (
            (needsCtrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey) &&
            (needsShift ? event.shiftKey : !event.shiftKey) &&
            (needsAlt ? event.altKey : !event.altKey) &&
            event.key.toLowerCase() === key.toLowerCase()
        );
    }

    switchTab(direction) {
        const tabs = Array.from(document.querySelectorAll('.tab'));
        const currentIndex = tabs.findIndex(t => t.id === window.tabSystem?.activeTabId);
        let newIndex = currentIndex + direction;
        
        if (newIndex < 0) newIndex = tabs.length - 1;
        if (newIndex >= tabs.length) newIndex = 0;
        
        if (tabs[newIndex]) {
            window.tabSystem?.activateTab(tabs[newIndex].id);
        }
    }

    reopenLastTab() {
        if (this.closedTabs.length > 0) {
            const tab = this.closedTabs.pop();
            window.tabSystem?.createTab(tab.url);
            showNotification('Aba reaberta');
        }
    }

    saveClosedTab(url) {
        this.closedTabs.push({ url, timestamp: Date.now() });
        if (this.closedTabs.length > 10) {
            this.closedTabs.shift();
        }
    }

    adjustZoom(delta) {
        const webview = window.tabSystem?.getActiveWebview();
        if (webview) {
            const currentZoom = webview.getZoomFactor();
            webview.setZoomFactor(Math.max(0.25, Math.min(5, currentZoom + delta)));
        }
    }

    resetZoom() {
        const webview = window.tabSystem?.getActiveWebview();
        if (webview) {
            webview.setZoomFactor(1);
        }
    }

    toggleFullscreen() {
        if (window.electronAPI) {
            window.electronAPI.windowControl('fullscreen');
        }
    }

    toggleDevTools() {
        const webview = window.tabSystem?.getActiveWebview();
        if (webview) {
            if (webview.isDevToolsOpened()) {
                webview.closeDevTools();
            } else {
                webview.openDevTools();
            }
        }
    }

    showFindInPage() {
        const webview = window.tabSystem?.getActiveWebview();
        if (webview) {
            // Implementar busca na página
            showNotification('Busca na página em desenvolvimento');
        }
    }

    clearCache() {
        if (confirm('Deseja limpar todo o cache do navegador?')) {
            localStorage.clear();
            showNotification('Cache limpo! Reinicie o navegador.');
        }
    }
}

// Sistema de Favoritos
class BookmarkSystem {
    constructor() {
        this.bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
        this.setupEventListeners();
    }

    setupEventListeners() {
        const bookmarkBtn = document.getElementById('bookmark');
        if (bookmarkBtn) {
            bookmarkBtn.addEventListener('click', () => {
                this.toggleBookmark();
            });
        }
    }

    toggleBookmark() {
        const webview = window.tabSystem?.getActiveWebview();
        if (!webview) return;

        const url = webview.getURL();
        const title = webview.getTitle() || url;

        const index = this.bookmarks.findIndex(b => b.url === url);

        if (index >= 0) {
            this.bookmarks.splice(index, 1);
            showNotification('Favorito removido');
        } else {
            this.bookmarks.push({ url, title, date: Date.now() });
            showNotification('Adicionado aos favoritos');
        }

        localStorage.setItem('bookmarks', JSON.stringify(this.bookmarks));
        this.updateBookmarkButton();
    }

    updateBookmarkButton() {
        const webview = window.tabSystem?.getActiveWebview();
        const bookmarkBtn = document.getElementById('bookmark');
        if (!webview || !bookmarkBtn) return;

        const url = webview.getURL();
        const isBookmarked = this.bookmarks.some(b => b.url === url);
        const icon = bookmarkBtn.querySelector('i');

        if (icon) {
            if (isBookmarked) {
                icon.style.fill = '#fbbf24';
                icon.style.stroke = '#fbbf24';
            } else {
                icon.style.fill = 'none';
                icon.style.stroke = 'currentColor';
            }
        }
    }

    renderBookmarks() {
        const modal = document.getElementById('bookmarksOverlay');
        if (!modal) return;

        let content = '<div class="p-5 space-y-2 max-h-[70vh] overflow-y-auto">';

        if (this.bookmarks.length === 0) {
            content += '<p class="text-dark-secondary text-center py-8">Nenhum favorito salvo</p>';
        } else {
            this.bookmarks.forEach((bookmark, index) => {
                content += `
                    <div class="flex items-center justify-between p-3 rounded-lg hover:bg-dark-elevated cursor-pointer group transition-colors" onclick="window.bookmarkSystem.openBookmark('${bookmark.url}')">
                        <div class="flex items-center gap-3 flex-1 min-w-0">
                            <i data-lucide="star" class="w-4 h-4 text-yellow-500 flex-shrink-0"></i>
                            <div class="flex-1 min-w-0">
                                <div class="text-sm font-medium text-dark-text truncate">${bookmark.title}</div>
                                <div class="text-xs text-dark-secondary truncate">${bookmark.url}</div>
                            </div>
                        </div>
                        <button onclick="event.stopPropagation(); window.bookmarkSystem.removeBookmark(${index})" class="icon-btn w-8 h-8 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                            <i data-lucide="trash-2" class="w-4 h-4 text-dark-secondary"></i>
                        </button>
                    </div>
                `;
            });
        }

        content += '</div>';

        const existingContent = modal.querySelector('.bookmarks-content');
        if (existingContent) {
            existingContent.innerHTML = content;
        } else {
            const modalContent = document.createElement('div');
            modalContent.className = 'bookmarks-content';
            modalContent.innerHTML = content;
            modal.querySelector('.bg-dark-surface').appendChild(modalContent);
        }

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    renderBookmarksPage(container) {
        if (this.bookmarks.length === 0) {
            container.innerHTML = `
                <div class="text-center py-16">
                    <i data-lucide="star" class="w-16 h-16 mx-auto mb-4 text-dark-secondary"></i>
                    <p class="text-dark-secondary text-lg">Nenhum favorito salvo</p>
                    <p class="text-dark-secondary text-sm mt-2">Clique no ícone de estrela para adicionar páginas aos favoritos</p>
                </div>
            `;
        } else {
            const grouped = this.groupBookmarksByDate();
            let html = '<div class="space-y-6">';
            
            Object.keys(grouped).forEach(dateKey => {
                html += `
                    <div>
                        <h3 class="text-sm font-semibold text-dark-secondary mb-3 uppercase tracking-wide">${dateKey}</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                `;
                
                grouped[dateKey].forEach((bookmark, index) => {
                    html += `
                        <div class="bg-dark-surface border border-dark-border rounded-xl p-4 hover:border-dark-accent cursor-pointer transition-all group" onclick="window.bookmarkSystem.openBookmark('${bookmark.url}')">
                            <div class="flex items-start justify-between mb-2">
                                <i data-lucide="star" class="w-5 h-5 text-yellow-500 flex-shrink-0"></i>
                                <button onclick="event.stopPropagation(); window.bookmarkSystem.removeBookmark(${bookmark.originalIndex})" class="icon-btn w-7 h-7 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                                    <i data-lucide="trash-2" class="w-3.5 h-3.5 text-dark-secondary"></i>
                                </button>
                            </div>
                            <h4 class="text-sm font-medium text-dark-text mb-1 truncate">${bookmark.title}</h4>
                            <p class="text-xs text-dark-secondary truncate">${bookmark.url}</p>
                        </div>
                    `;
                });
                
                html += '</div></div>';
            });
            
            html += '</div>';
            container.innerHTML = html;
        }

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    groupBookmarksByDate() {
        const grouped = {};
        const now = Date.now();
        
        this.bookmarks.forEach((bookmark, index) => {
            const age = now - bookmark.date;
            const days = Math.floor(age / (1000 * 60 * 60 * 24));
            
            let key;
            if (days === 0) key = 'Hoje';
            else if (days === 1) key = 'Ontem';
            else if (days < 7) key = 'Esta Semana';
            else if (days < 30) key = 'Este Mês';
            else key = 'Mais Antigos';
            
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push({ ...bookmark, originalIndex: index });
        });
        
        return grouped;
    }

    openBookmark(url) {
        window.tabSystem?.navigateTo(url);
        closeModal('bookmarks');
    }

    removeBookmark(index) {
        this.bookmarks.splice(index, 1);
        localStorage.setItem('bookmarks', JSON.stringify(this.bookmarks));
        this.renderBookmarks();
        showNotification('Favorito removido');
    }
}

// Sistema de Histórico
class HistorySystem {
    constructor() {
        this.history = JSON.parse(localStorage.getItem('history') || '[]');
        this.setupEventListeners();
    }

    setupEventListeners() {
        const historyBtn = document.getElementById('history');
        if (historyBtn) {
            historyBtn.addEventListener('click', () => {
                this.renderHistory();
                openModal('history');
            });
        }
    }

    addToHistory(url, title) {
        // Evitar duplicatas consecutivas
        if (this.history.length > 0 && this.history[0].url === url) {
            return;
        }

        this.history.unshift({
            url,
            title: title || url,
            date: Date.now()
        });

        // Limitar a 1000 entradas
        if (this.history.length > 1000) {
            this.history = this.history.slice(0, 1000);
        }

        localStorage.setItem('history', JSON.stringify(this.history));
    }

    renderHistory() {
        const modal = document.getElementById('historyOverlay');
        if (!modal) return;

        let content = '<div class="p-5 space-y-2 max-h-[60vh] overflow-y-auto">';

        if (this.history.length === 0) {
            content += '<p class="text-dark-secondary text-center py-8">Nenhum histórico</p>';
        } else {
            this.history.slice(0, 100).forEach((item) => {
                const date = new Date(item.date);
                const timeStr = date.toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                content += `
                    <div class="flex items-center justify-between p-3 rounded-lg hover:bg-dark-elevated cursor-pointer transition-colors" onclick="window.historySystem.openHistory('${item.url}')">
                        <div class="flex items-center gap-3 flex-1 min-w-0">
                            <i data-lucide="clock" class="w-4 h-4 text-dark-secondary flex-shrink-0"></i>
                            <div class="flex-1 min-w-0">
                                <div class="text-sm font-medium text-dark-text truncate">${item.title}</div>
                                <div class="text-xs text-dark-secondary truncate">${item.url}</div>
                            </div>
                        </div>
                        <div class="text-xs text-dark-secondary">${timeStr}</div>
                    </div>
                `;
            });
        }

        content += '</div>';

        const existingContent = modal.querySelector('.history-content');
        if (existingContent) {
            existingContent.innerHTML = content;
        } else {
            const modalContent = document.createElement('div');
            modalContent.className = 'history-content';
            modalContent.innerHTML = content;
            modal.querySelector('.bg-dark-surface').appendChild(modalContent);
        }

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    renderHistoryPage(container) {
        if (this.history.length === 0) {
            container.innerHTML = `
                <div class="text-center py-16">
                    <i data-lucide="clock" class="w-16 h-16 mx-auto mb-4 text-dark-secondary"></i>
                    <p class="text-dark-secondary text-lg">Nenhum histórico</p>
                    <p class="text-dark-secondary text-sm mt-2">As páginas que você visitar aparecerão aqui</p>
                </div>
            `;
        } else {
            const grouped = this.groupHistoryByDate();
            let html = `
                <div class="mb-6 flex items-center justify-between">
                    <input type="text" id="historySearch" placeholder="Buscar no histórico..." 
                        class="flex-1 px-4 py-2 bg-dark-elevated border border-dark-border rounded-lg text-sm text-dark-text placeholder-dark-secondary focus:border-dark-accent transition-all">
                    <button onclick="window.historySystem.clearHistory()" class="ml-3 px-4 py-2 bg-dark-elevated border border-dark-border rounded-lg text-sm text-dark-text hover:bg-dark-accent hover:text-white transition-all flex items-center gap-2">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                        Limpar Histórico
                    </button>
                </div>
                <div id="historyResults" class="space-y-6">
            `;
            
            Object.keys(grouped).forEach(dateKey => {
                html += `
                    <div>
                        <h3 class="text-sm font-semibold text-dark-secondary mb-3 uppercase tracking-wide">${dateKey}</h3>
                        <div class="space-y-1">
                `;
                
                grouped[dateKey].forEach(item => {
                    const time = new Date(item.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                    html += `
                        <div class="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-surface cursor-pointer transition-colors border border-transparent hover:border-dark-border" onclick="window.historySystem.openHistory('${item.url}')">
                            <i data-lucide="globe" class="w-4 h-4 text-dark-secondary flex-shrink-0"></i>
                            <div class="flex-1 min-w-0">
                                <div class="text-sm font-medium text-dark-text truncate">${item.title}</div>
                                <div class="text-xs text-dark-secondary truncate">${item.url}</div>
                            </div>
                            <div class="text-xs text-dark-secondary">${time}</div>
                        </div>
                    `;
                });
                
                html += '</div></div>';
            });
            
            html += '</div>';
            container.innerHTML = html;

            // Busca em tempo real
            const searchInput = document.getElementById('historySearch');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    this.searchHistory(e.target.value);
                });
            }
        }

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    groupHistoryByDate() {
        const grouped = {};
        const now = Date.now();
        
        this.history.forEach(item => {
            const age = now - item.date;
            const days = Math.floor(age / (1000 * 60 * 60 * 24));
            
            let key;
            if (days === 0) key = 'Hoje';
            else if (days === 1) key = 'Ontem';
            else if (days < 7) key = 'Esta Semana';
            else if (days < 30) key = 'Este Mês';
            else key = 'Mais Antigos';
            
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(item);
        });
        
        return grouped;
    }

    searchHistory(query) {
        const results = document.getElementById('historyResults');
        if (!results) return;

        const filtered = this.history.filter(item => 
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.url.toLowerCase().includes(query.toLowerCase())
        );

        if (filtered.length === 0) {
            results.innerHTML = '<p class="text-dark-secondary text-center py-8">Nenhum resultado encontrado</p>';
            return;
        }

        let html = '<div class="space-y-1">';
        filtered.slice(0, 50).forEach(item => {
            const time = new Date(item.date).toLocaleString('pt-BR', { 
                day: '2-digit', 
                month: '2-digit', 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            html += `
                <div class="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-surface cursor-pointer transition-colors border border-transparent hover:border-dark-border" onclick="window.historySystem.openHistory('${item.url}')">
                    <i data-lucide="globe" class="w-4 h-4 text-dark-secondary flex-shrink-0"></i>
                    <div class="flex-1 min-w-0">
                        <div class="text-sm font-medium text-dark-text truncate">${item.title}</div>
                        <div class="text-xs text-dark-secondary truncate">${item.url}</div>
                    </div>
                    <div class="text-xs text-dark-secondary">${time}</div>
                </div>
            `;
        });
        html += '</div>';
        results.innerHTML = html;

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    openHistory(url) {
        window.tabSystem?.navigateTo(url);
        closeModal('history');
    }

    clearHistory() {
        if (confirm('Deseja limpar todo o histórico?')) {
            this.history = [];
            localStorage.setItem('history', JSON.stringify(this.history));
            this.renderHistory();
            showNotification('Histórico limpo');
        }
    }
}

// Sistema de Sugestões
class SuggestionSystem {
    constructor() {
        this.container = null;
        this.suggestions = [];
        this.selectedIndex = -1;
        this.createContainer();
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'suggestions';
        this.container.className = 'absolute top-full left-0 right-0 mt-2 bg-dark-surface border border-dark-border rounded-xl shadow-2xl overflow-hidden hidden z-50 animate-slide-in';
        document.querySelector('.flex-1.flex.items-center').appendChild(this.container);
    }

    show(query) {
        if (!query || query.length < 2) {
            this.hide();
            return;
        }

        this.suggestions = this.getSuggestions(query);
        
        if (this.suggestions.length === 0) {
            this.hide();
            return;
        }

        this.render();
        this.container.classList.remove('hidden');
    }

    getSuggestions(query) {
        const suggestions = [];
        const lowerQuery = query.toLowerCase();

        // Buscar em favoritos
        if (window.bookmarkSystem) {
            window.bookmarkSystem.bookmarks.forEach(bookmark => {
                if (bookmark.title.toLowerCase().includes(lowerQuery) || 
                    bookmark.url.toLowerCase().includes(lowerQuery)) {
                    suggestions.push({
                        type: 'bookmark',
                        icon: 'star',
                        title: bookmark.title,
                        url: bookmark.url,
                        color: 'text-yellow-500'
                    });
                }
            });
        }

        // Buscar em histórico
        if (window.historySystem) {
            window.historySystem.history.slice(0, 50).forEach(item => {
                if ((item.title.toLowerCase().includes(lowerQuery) || 
                     item.url.toLowerCase().includes(lowerQuery)) &&
                    !suggestions.find(s => s.url === item.url)) {
                    suggestions.push({
                        type: 'history',
                        icon: 'clock',
                        title: item.title,
                        url: item.url,
                        color: 'text-dark-secondary'
                    });
                }
            });
        }

        // Sugestões de busca
        if (!query.includes('.') && !query.startsWith('http')) {
            suggestions.unshift({
                type: 'search',
                icon: 'search',
                title: `Buscar "${query}"`,
                url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
                color: 'text-blue-500'
            });
        }

        return suggestions.slice(0, 8);
    }

    render() {
        this.container.innerHTML = this.suggestions.map((suggestion, index) => `
            <div class="suggestion-item flex items-center gap-3 p-3 hover:bg-dark-elevated cursor-pointer transition-colors ${index === this.selectedIndex ? 'bg-dark-elevated' : ''}" data-index="${index}">
                <i data-lucide="${suggestion.icon}" class="w-4 h-4 ${suggestion.color} flex-shrink-0"></i>
                <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-dark-text truncate">${suggestion.title}</div>
                    <div class="text-xs text-dark-secondary truncate">${suggestion.url}</div>
                </div>
                <i data-lucide="corner-down-left" class="w-3 h-3 text-dark-secondary flex-shrink-0"></i>
            </div>
        `).join('');

        this.container.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index);
                this.select(index);
            });
        });

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    select(index) {
        if (index >= 0 && index < this.suggestions.length) {
            const suggestion = this.suggestions[index];
            window.tabSystem?.navigateTo(suggestion.url);
            this.hide();
        }
    }

    navigate(direction) {
        if (this.suggestions.length === 0) return;

        this.selectedIndex += direction;
        
        if (this.selectedIndex < -1) {
            this.selectedIndex = this.suggestions.length - 1;
        } else if (this.selectedIndex >= this.suggestions.length) {
            this.selectedIndex = -1;
        }

        this.render();
    }

    hide() {
        this.container.classList.add('hidden');
        this.selectedIndex = -1;
    }
}

// Sistema de Abas
class TabSystem {
    constructor() {
        this.tabs = [];
        this.activeTabId = null;
        this.tabCounter = 0;
        this.tabsContainer = document.getElementById('tabs');
        this.tabsContent = document.getElementById('tabsContent');
        this.newTabBtn = document.getElementById('newTabBtn');
        this.urlBar = document.getElementById('urlBar');

        this.init();
    }

    init() {
        if (this.newTabBtn) {
            this.newTabBtn.addEventListener('click', () => this.createTab());
        }

        if (this.urlBar) {
            this.urlBar.addEventListener('input', (e) => {
                window.suggestionSystem?.show(e.target.value);
            });

            this.urlBar.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    window.suggestionSystem?.navigate(1);
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    window.suggestionSystem?.navigate(-1);
                } else if (e.key === 'Escape') {
                    window.suggestionSystem?.hide();
                    this.urlBar.blur();
                }
            });

            this.urlBar.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    if (window.suggestionSystem?.selectedIndex >= 0) {
                        window.suggestionSystem.select(window.suggestionSystem.selectedIndex);
                    } else {
                        this.navigateTo(this.urlBar.value);
                        window.suggestionSystem?.hide();
                    }
                }
            });

            this.urlBar.addEventListener('blur', () => {
                setTimeout(() => window.suggestionSystem?.hide(), 200);
            });
        }

        // Criar primeira aba
        setTimeout(() => this.createTab(), 100);
    }

    createTab(url = 'https://www.google.com') {
        const tabId = `tab-${this.tabCounter++}`;
        const contentId = `content-${tabId}`;

        // Criar aba
        const tab = document.createElement('div');
        tab.className = 'tab h-9 min-w-[160px] max-w-[240px] flex items-center gap-2 px-3 cursor-pointer bg-dark-bg';
        tab.id = tabId;
        tab.innerHTML = `
            <div class="w-4 h-4 flex-shrink-0">
                <i data-lucide="globe" class="w-4 h-4 text-dark-secondary"></i>
            </div>
            <span class="flex-1 text-xs truncate text-dark-text">Nova aba</span>
            <button class="tab-close w-5 h-5 flex-shrink-0 rounded-full hover:bg-dark-elevated transition-colors flex items-center justify-center">
                <i data-lucide="x" class="w-3 h-3 text-dark-secondary"></i>
            </button>
        `;

        // Criar conteúdo
        const content = document.createElement('div');
        content.className = 'absolute inset-0 hidden';
        content.id = contentId;
        content.innerHTML = `<webview src="${url}" allowpopups></webview>`;

        this.tabsContainer.appendChild(tab);
        this.tabsContent.appendChild(content);

        // Inicializar ícones
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Eventos
        tab.addEventListener('click', (e) => {
            if (!e.target.closest('.tab-close')) {
                this.activateTab(tabId);
            }
        });

        tab.querySelector('.tab-close').addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeTab(tabId);
        });

        // Drag & Drop
        this.setupTabDragDrop(tab);

        const webview = content.querySelector('webview');
        
        // Aguardar webview estar pronto antes de ativar
        webview.addEventListener('dom-ready', () => {
            this.setupWebview(webview, tab);
            
            // Atualizar URL bar se for a aba ativa
            if (this.activeTabId === tabId) {
                try {
                    this.urlBar.value = webview.getURL();
                } catch (e) {
                    console.log('URL ainda não disponível');
                }
            }
        });

        this.activateTab(tabId);
        return { tabId, webview };
    }

    createInternalTab(type) {
        const tabId = `tab-${this.tabCounter++}`;
        const contentId = `content-${tabId}`;

        // Títulos e ícones
        const pages = {
            bookmarks: { title: 'Favoritos', icon: 'star' },
            history: { title: 'Histórico', icon: 'clock' },
            downloads: { title: 'Downloads', icon: 'download' },
            settings: { title: 'Configurações', icon: 'settings' }
        };

        const page = pages[type];

        // Criar aba
        const tab = document.createElement('div');
        tab.className = 'tab h-9 min-w-[160px] max-w-[240px] flex items-center gap-2 px-3 cursor-pointer bg-dark-bg';
        tab.id = tabId;
        tab.dataset.internal = type;
        tab.innerHTML = `
            <div class="w-4 h-4 flex-shrink-0">
                <i data-lucide="${page.icon}" class="w-4 h-4 text-dark-secondary"></i>
            </div>
            <span class="flex-1 text-xs truncate text-dark-text">${page.title}</span>
            <button class="tab-close w-5 h-5 flex-shrink-0 rounded-full hover:bg-dark-elevated transition-colors flex items-center justify-center">
                <i data-lucide="x" class="w-3 h-3 text-dark-secondary"></i>
            </button>
        `;

        // Criar conteúdo interno
        const content = document.createElement('div');
        content.className = 'absolute inset-0 hidden bg-dark-bg overflow-y-auto';
        content.id = contentId;
        content.innerHTML = this.getInternalPageHTML(type);

        this.tabsContainer.appendChild(tab);
        this.tabsContent.appendChild(content);

        // Inicializar ícones
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Eventos
        tab.addEventListener('click', (e) => {
            if (!e.target.closest('.tab-close')) {
                this.activateTab(tabId);
            }
        });

        tab.querySelector('.tab-close').addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeTab(tabId);
        });

        // Drag & Drop
        this.setupTabDragDrop(tab);

        this.activateTab(tabId);
        
        // Renderizar conteúdo
        this.renderInternalPage(type, content);
        
        return tabId;
    }

    getInternalPageHTML(type) {
        const baseHTML = `
            <div class="max-w-4xl mx-auto p-8">
                <div class="mb-8">
                    <h1 class="text-3xl font-bold text-dark-text mb-2"></h1>
                    <p class="text-dark-secondary"></p>
                </div>
                <div class="internal-content"></div>
            </div>
        `;
        return baseHTML;
    }

    renderInternalPage(type, content) {
        const title = content.querySelector('h1');
        const subtitle = content.querySelector('p');
        const internalContent = content.querySelector('.internal-content');

        switch (type) {
            case 'bookmarks':
                title.textContent = 'Favoritos';
                subtitle.textContent = 'Seus sites favoritos salvos';
                window.bookmarkSystem?.renderBookmarksPage(internalContent);
                break;
            case 'history':
                title.textContent = 'Histórico';
                subtitle.textContent = 'Páginas visitadas recentemente';
                window.historySystem?.renderHistoryPage(internalContent);
                break;
            case 'downloads':
                title.textContent = 'Downloads';
                subtitle.textContent = 'Arquivos baixados';
                internalContent.innerHTML = '<p class="text-dark-secondary text-center py-8">Nenhum download</p>';
                break;
            case 'settings':
                title.textContent = 'Configurações';
                subtitle.textContent = 'Personalize seu navegador';
                this.renderSettingsPage(internalContent);
                break;
        }

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    renderSettingsPage(container) {
        const settings = JSON.parse(localStorage.getItem('browserSettings') || '{"homePage":"https://google.com","searchEngine":"google"}');
        const theme = localStorage.getItem('theme') || 'dark';

        container.innerHTML = `
            <div class="space-y-6">
                <div class="bg-dark-surface p-6 rounded-xl border border-dark-border">
                    <h3 class="text-lg font-semibold text-dark-text mb-4">Aparência</h3>
                    <div class="flex gap-3">
                        <button onclick="setTheme('dark'); window.tabSystem.refreshInternalTab()" class="flex-1 px-4 py-3 rounded-lg border-2 ${theme === 'dark' ? 'border-dark-accent' : 'border-dark-border'} hover:border-dark-accent transition-all">
                            <i data-lucide="moon" class="w-5 h-5 mx-auto mb-2"></i>
                            <span class="text-sm block">Escuro</span>
                        </button>
                        <button onclick="setTheme('light'); window.tabSystem.refreshInternalTab()" class="flex-1 px-4 py-3 rounded-lg border-2 ${theme === 'light' ? 'border-dark-accent' : 'border-dark-border'} hover:border-dark-accent transition-all">
                            <i data-lucide="sun" class="w-5 h-5 mx-auto mb-2"></i>
                            <span class="text-sm block">Claro</span>
                        </button>
                    </div>
                </div>

                <div class="bg-dark-surface p-6 rounded-xl border border-dark-border">
                    <h3 class="text-lg font-semibold text-dark-text mb-4">Navegação</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-dark-text mb-2">Página Inicial</label>
                            <input type="text" id="homePageInput" value="${settings.homePage}" 
                                class="w-full px-3 py-2 bg-dark-elevated border border-dark-border rounded-lg text-sm text-dark-text placeholder-dark-secondary focus:border-dark-accent transition-all">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-dark-text mb-2">Motor de Busca</label>
                            <select id="searchEngineSelect" 
                                class="w-full px-3 py-2 bg-dark-elevated border border-dark-border rounded-lg text-sm text-dark-text focus:border-dark-accent transition-all">
                                <option value="google" ${settings.searchEngine === 'google' ? 'selected' : ''}>Google</option>
                                <option value="duckduckgo" ${settings.searchEngine === 'duckduckgo' ? 'selected' : ''}>DuckDuckGo</option>
                                <option value="bing" ${settings.searchEngine === 'bing' ? 'selected' : ''}>Bing</option>
                            </select>
                        </div>
                    </div>
                </div>

                <button onclick="window.tabSystem.saveSettingsFromPage()" class="w-full py-3 bg-dark-accent text-white rounded-lg font-medium hover:bg-dark-accent-hover transition-all">
                    Salvar Configurações
                </button>
            </div>
        `;

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    saveSettingsFromPage() {
        const homePageInput = document.getElementById('homePageInput');
        const searchEngineSelect = document.getElementById('searchEngineSelect');
        
        const settings = {
            homePage: homePageInput?.value || 'https://google.com',
            searchEngine: searchEngineSelect?.value || 'google'
        };
        
        localStorage.setItem('browserSettings', JSON.stringify(settings));
        showNotification('Configurações salvas!');
    }

    refreshInternalTab() {
        const activeContent = document.getElementById(`content-${this.activeTabId}`);
        if (activeContent) {
            const tab = document.getElementById(this.activeTabId);
            if (tab && tab.dataset.internal) {
                this.renderInternalPage(tab.dataset.internal, activeContent);
            }
        }
    }

    setupTabDragDrop(tab) {
        let draggedTab = null;

        tab.setAttribute('draggable', 'true');

        tab.addEventListener('dragstart', (e) => {
            draggedTab = tab;
            tab.style.opacity = '0.5';
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', tab.innerHTML);
        });

        tab.addEventListener('dragend', (e) => {
            tab.style.opacity = '1';
            
            // Remover indicadores
            document.querySelectorAll('.tab').forEach(t => {
                t.classList.remove('drag-over-left', 'drag-over-right');
            });
        });

        tab.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';

            if (draggedTab && draggedTab !== tab) {
                const rect = tab.getBoundingClientRect();
                const midpoint = rect.left + rect.width / 2;
                
                // Remover classes anteriores
                tab.classList.remove('drag-over-left', 'drag-over-right');
                
                // Adicionar classe baseada na posição
                if (e.clientX < midpoint) {
                    tab.classList.add('drag-over-left');
                } else {
                    tab.classList.add('drag-over-right');
                }
            }
        });

        tab.addEventListener('dragleave', (e) => {
            tab.classList.remove('drag-over-left', 'drag-over-right');
        });

        tab.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (draggedTab && draggedTab !== tab) {
                const rect = tab.getBoundingClientRect();
                const midpoint = rect.left + rect.width / 2;
                
                // Inserir antes ou depois
                if (e.clientX < midpoint) {
                    this.tabsContainer.insertBefore(draggedTab, tab);
                } else {
                    this.tabsContainer.insertBefore(draggedTab, tab.nextSibling);
                }
            }

            tab.classList.remove('drag-over-left', 'drag-over-right');
        });
    }

    setupWebview(webview, tab) {
        const loadingBar = document.getElementById('loadingBar');

        webview.addEventListener('did-start-loading', () => {
            if (this.activeTabId === tab.id && loadingBar) {
                loadingBar.classList.add('active');
                loadingBar.style.width = '30%';
            }
            // Adicionar indicador de carregamento na aba
            const icon = tab.querySelector('.w-4.h-4.flex-shrink-0 i');
            if (icon) {
                icon.classList.add('animate-spin');
            }
        });

        webview.addEventListener('did-stop-loading', () => {
            if (this.activeTabId === tab.id && loadingBar) {
                loadingBar.style.width = '100%';
                setTimeout(() => {
                    loadingBar.classList.remove('active');
                    loadingBar.style.width = '0%';
                }, 300);
            }
            // Remover indicador de carregamento
            const icon = tab.querySelector('.w-4.h-4.flex-shrink-0 i');
            if (icon) {
                icon.classList.remove('animate-spin');
            }
        });

        webview.addEventListener('page-title-updated', (e) => {
            const titleEl = tab.querySelector('.truncate');
            if (titleEl) {
                titleEl.textContent = e.title;
                titleEl.classList.add('animate-fade-in');
            }

            // Adicionar ao histórico
            if (window.historySystem) {
                window.historySystem.addToHistory(webview.getURL(), e.title);
            }
        });

        webview.addEventListener('did-navigate', () => {
            if (this.activeTabId === tab.id) {
                this.urlBar.value = webview.getURL();

                // Atualizar botão de favorito
                if (window.bookmarkSystem) {
                    window.bookmarkSystem.updateBookmarkButton();
                }
            }

            // Atualizar botões de navegação
            this.updateNavigationButtons();
        });

        webview.addEventListener('did-navigate-in-page', () => {
            if (this.activeTabId === tab.id) {
                this.urlBar.value = webview.getURL();
            }
        });

        webview.addEventListener('page-favicon-updated', (e) => {
            if (e.favicons && e.favicons[0]) {
                const iconContainer = tab.querySelector('.w-4.h-4.flex-shrink-0');
                if (iconContainer) {
                    iconContainer.innerHTML = `<img src="${e.favicons[0]}" class="w-4 h-4 rounded animate-fade-in">`;
                }
            }
        });

        webview.addEventListener('new-window', (e) => {
            e.preventDefault();
            this.createTab(e.url);
        });

        webview.addEventListener('did-fail-load', (e) => {
            if (e.errorCode !== -3) { // -3 é cancelamento
                console.error('Erro ao carregar:', e);
                showNotification('Erro ao carregar página');
            }
        });
    }

    updateNavigationButtons() {
        const webview = this.getActiveWebview();
        const backBtn = document.getElementById('back');
        const forwardBtn = document.getElementById('forward');

        if (webview && backBtn && forwardBtn) {
            backBtn.disabled = !webview.canGoBack();
            forwardBtn.disabled = !webview.canGoForward();
        }
    }

    activateTab(tabId) {
        // Desativar todas
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('[id^="content-"]').forEach(c => c.classList.add('hidden'));

        // Ativar selecionada
        const tab = document.getElementById(tabId);
        const content = document.getElementById(`content-${tabId}`);

        if (tab && content) {
            tab.classList.add('active');
            content.classList.remove('hidden');
            this.activeTabId = tabId;

            const webview = content.querySelector('webview');
            if (webview) {
                try {
                    // Tentar obter URL apenas se o webview estiver pronto
                    if (webview.getURL) {
                        const url = webview.getURL();
                        if (url) {
                            this.urlBar.value = url;
                        }
                    }
                } catch (error) {
                    // Webview ainda não está pronto, ignorar
                    console.log('Webview ainda não está pronto');
                }
            }
        }
    }

    closeTab(tabId) {
        const tab = document.getElementById(tabId);
        const content = document.getElementById(`content-${tabId}`);

        // Salvar aba fechada para reabrir
        if (content) {
            const webview = content.querySelector('webview');
            if (webview && window.commandPalette) {
                try {
                    const url = webview.getURL();
                    if (url) {
                        window.commandPalette.saveClosedTab(url);
                    }
                } catch (e) {
                    console.log('Não foi possível salvar aba fechada');
                }
            }
        }

        if (tab) tab.remove();
        if (content) content.remove();

        const remainingTabs = this.tabsContainer.querySelectorAll('.tab');
        if (remainingTabs.length === 0) {
            // Fechar janela se não houver mais abas
            if (window.electronAPI) {
                window.electronAPI.windowControl('close');
            }
        } else if (this.activeTabId === tabId) {
            // Ativar aba adjacente
            const tabs = Array.from(this.tabsContainer.querySelectorAll('.tab'));
            const closedIndex = tabs.findIndex(t => t.id === tabId);
            const nextTab = tabs[closedIndex] || tabs[closedIndex - 1] || tabs[0];
            if (nextTab) {
                this.activateTab(nextTab.id);
            }
        }
    }

    navigateTo(input) {
        const webview = this.getActiveWebview();
        if (!webview) return;

        let url = input.trim();

        // Se tem protocolo, usar direto
        if (url.startsWith('http://') || url.startsWith('https://')) {
            webview.loadURL(url);
            return;
        }

        // Se tem ponto e não tem espaços, adicionar https
        if (url.includes('.') && !url.includes(' ')) {
            webview.loadURL('https://' + url);
            return;
        }

        // Caso contrário, pesquisar no Google
        webview.loadURL('https://www.google.com/search?q=' + encodeURIComponent(url));
    }

    getActiveWebview() {
        if (!this.activeTabId) return null;
        const content = document.getElementById(`content-${this.activeTabId}`);
        return content ? content.querySelector('webview') : null;
    }
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('Inicializando navegador...');

    // Controles da janela
    const closeBtn = document.getElementById('closeBtn');
    const minimizeBtn = document.getElementById('minimizeBtn');
    const maximizeBtn = document.getElementById('maximizeBtn');

    if (closeBtn && window.electronAPI) {
        closeBtn.addEventListener('click', () => {
            window.electronAPI.windowControl('close');
        });
    }

    if (minimizeBtn && window.electronAPI) {
        minimizeBtn.addEventListener('click', () => {
            window.electronAPI.windowControl('minimize');
        });
    }

    if (maximizeBtn && window.electronAPI) {
        maximizeBtn.addEventListener('click', () => {
            window.electronAPI.windowControl('maximize');
        });
    }

    // Inicializar ícones Lucide
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
        console.log('Ícones inicializados');
    }

    // Inicializar sistema de abas
    window.tabSystem = new TabSystem();
    console.log('TabSystem inicializado');

    // Botões de navegação
    const backBtn = document.getElementById('back');
    const forwardBtn = document.getElementById('forward');
    const reloadBtn = document.getElementById('reload');

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            const webview = window.tabSystem.getActiveWebview();
            if (webview && webview.canGoBack()) {
                webview.goBack();
            }
        });
    }

    if (forwardBtn) {
        forwardBtn.addEventListener('click', () => {
            const webview = window.tabSystem.getActiveWebview();
            if (webview && webview.canGoForward()) {
                webview.goForward();
            }
        });
    }

    if (reloadBtn) {
        reloadBtn.addEventListener('click', () => {
            const webview = window.tabSystem.getActiveWebview();
            if (webview) {
                webview.reload();
            }
        });
    }

    // Botão de favoritos
    const bookmarkBtn = document.getElementById('bookmark');
    if (bookmarkBtn) {
        bookmarkBtn.addEventListener('click', () => {
            window.tabSystem.createInternalTab('bookmarks');
        });
    }

    // Botão de histórico
    const historyBtn = document.getElementById('history');
    if (historyBtn) {
        historyBtn.addEventListener('click', () => {
            window.tabSystem.createInternalTab('history');
        });
    }

    // Botão de downloads
    const downloadsBtn = document.getElementById('downloads');
    if (downloadsBtn) {
        downloadsBtn.addEventListener('click', () => {
            window.tabSystem.createInternalTab('downloads');
        });
    }

    // Botão de configurações
    const settingsBtn = document.getElementById('settings');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            window.tabSystem.createInternalTab('settings');
        });
    }

    // Botão de command palette
    const commandPaletteBtn = document.getElementById('commandPaletteBtn');
    if (commandPaletteBtn) {
        commandPaletteBtn.addEventListener('click', () => {
            window.commandPalette?.show();
        });
    }

    // Navegação com Alt + Setas
    document.addEventListener('keydown', (e) => {
        if (e.altKey && e.key === 'ArrowLeft') {
            e.preventDefault();
            const webview = window.tabSystem?.getActiveWebview();
            if (webview && webview.canGoBack()) {
                webview.goBack();
            }
        }
        if (e.altKey && e.key === 'ArrowRight') {
            e.preventDefault();
            const webview = window.tabSystem?.getActiveWebview();
            if (webview && webview.canGoForward()) {
                webview.goForward();
            }
        }
    });

    // Inicializar sistemas adicionais
    window.commandPalette = new CommandPalette();
    window.bookmarkSystem = new BookmarkSystem();
    window.historySystem = new HistorySystem();
    window.suggestionSystem = new SuggestionSystem();
    window.mouseGestures = new MouseGestures();

    console.log('Navegador inicializado com sucesso!');
    showNotification('CleanBrowser iniciado!', 'success');
});

// ===== FUNÇÕES DE CONFIGURAÇÕES =====
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('browserSettings') || '{"homePage":"https://google.com","searchEngine":"google"}');

    const homePageInput = document.getElementById('homePageInput');
    const searchEngineSelect = document.getElementById('searchEngineSelect');

    if (homePageInput) homePageInput.value = settings.homePage;
    if (searchEngineSelect) searchEngineSelect.value = settings.searchEngine;
}

function saveSettings() {
    const homePageInput = document.getElementById('homePageInput');
    const searchEngineSelect = document.getElementById('searchEngineSelect');

    const settings = {
        homePage: homePageInput?.value || 'https://google.com',
        searchEngine: searchEngineSelect?.value || 'google'
    };

    localStorage.setItem('browserSettings', JSON.stringify(settings));
    closeModal('settings');
    showNotification('Configurações salvas!');
}

function showNotification(message, type = 'success') {
    const icons = {
        success: 'check-circle',
        error: 'x-circle',
        info: 'info',
        warning: 'alert-triangle'
    };

    const colors = {
        success: 'text-green-500',
        error: 'text-red-500',
        info: 'text-blue-500',
        warning: 'text-yellow-500'
    };

    const notification = document.createElement('div');
    notification.className = 'fixed bottom-5 right-5 bg-dark-elevated border border-dark-border text-dark-text px-5 py-3 rounded-xl shadow-2xl z-[200] transition-all flex items-center gap-3 animate-slide-in';
    notification.style.transform = 'translateY(20px)';
    notification.style.opacity = '0';
    
    notification.innerHTML = `
        <i data-lucide="${icons[type]}" class="w-5 h-5 ${colors[type]} flex-shrink-0"></i>
        <span class="text-sm font-medium">${message}</span>
        <button class="ml-2 icon-btn w-6 h-6 rounded-md flex items-center justify-center" onclick="this.parentElement.remove()">
            <i data-lucide="x" class="w-3 h-3 text-dark-secondary"></i>
        </button>
    `;
    
    document.body.appendChild(notification);

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Animar entrada
    requestAnimationFrame(() => {
        notification.style.transform = 'translateY(0)';
        notification.style.opacity = '1';
    });

    // Auto-remover
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(20px)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Sistema de gestos do mouse
class MouseGestures {
    constructor() {
        this.isDrawing = false;
        this.startX = 0;
        this.startY = 0;
        this.threshold = 100;
        this.setupListeners();
    }

    setupListeners() {
        document.addEventListener('mousedown', (e) => {
            // Botão do meio ou botão direito
            if (e.button === 1 || e.button === 2) {
                this.isDrawing = true;
                this.startX = e.clientX;
                this.startY = e.clientY;
            }
        });

        document.addEventListener('mouseup', (e) => {
            if (this.isDrawing) {
                this.isDrawing = false;
                const deltaX = e.clientX - this.startX;
                const deltaY = e.clientY - this.startY;

                // Gesto horizontal
                if (Math.abs(deltaX) > this.threshold && Math.abs(deltaY) < 50) {
                    if (deltaX > 0) {
                        // Swipe direita - Avançar
                        const webview = window.tabSystem?.getActiveWebview();
                        if (webview && webview.canGoForward()) {
                            webview.goForward();
                            showNotification('Avançar', 'info');
                        }
                    } else {
                        // Swipe esquerda - Voltar
                        const webview = window.tabSystem?.getActiveWebview();
                        if (webview && webview.canGoBack()) {
                            webview.goBack();
                            showNotification('Voltar', 'info');
                        }
                    }
                }

                // Gesto vertical
                if (Math.abs(deltaY) > this.threshold && Math.abs(deltaX) < 50) {
                    if (deltaY < 0) {
                        // Swipe cima - Nova aba
                        window.tabSystem?.createTab();
                        showNotification('Nova aba', 'success');
                    } else {
                        // Swipe baixo - Fechar aba
                        window.tabSystem?.closeTab(window.tabSystem.activeTabId);
                    }
                }
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isDrawing) {
                e.preventDefault();
            }
        });
    }
}
