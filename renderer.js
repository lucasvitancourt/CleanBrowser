const { ipcRenderer } = require('electron');
        
// Verificar se é uma janela desvinculada
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const detachedUrl = urlParams.get('url');
    const isDetached = urlParams.get('isDetached');

    if (isDetached && detachedUrl) {
        // Se for uma janela desvinculada, criar uma aba com a URL fornecida
        setTimeout(() => {
            const tabSystem = window.tabSystem;
            if (tabSystem) {
                tabSystem.createTab(detachedUrl);
            }
        }, 100);
    }
});

// Ouvir mensagem para carregar URL em janela desvinculada
ipcRenderer.on('load-detached-url', (event, url) => {
    const tabSystem = window.tabSystem;
    if (tabSystem) {
        tabSystem.createTab(url);
    }
});

// Controles da janela
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar controles da janela
    const { ipcRenderer } = require('electron');
    
    const closeBtn = document.getElementById('closeBtn');
    const minimizeBtn = document.getElementById('minimizeBtn');
    const maximizeBtn = document.getElementById('maximizeBtn');

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            console.log('Fechando janela...');
            ipcRenderer.send('window-control', 'close');
        });
    }

    if (minimizeBtn) {
        minimizeBtn.addEventListener('click', () => {
            console.log('Minimizando janela...');
            ipcRenderer.send('window-control', 'minimize');
        });
    }

    if (maximizeBtn) {
        maximizeBtn.addEventListener('click', () => {
            console.log('Maximizando/restaurando janela...');
            ipcRenderer.send('window-control', 'maximize');
        });
    }

    // Inicializar sistemas em ordem correta
    window.tabSystem = new TabSystem();
    
    // Aguardar o webview estar pronto antes de inicializar outros sistemas
    const checkWebviewReady = setInterval(() => {
        const webview = window.tabSystem.getActiveWebview();
        if (webview && webview.getURL) {
            clearInterval(checkWebviewReady);
            window.bookmarkSystem = new BookmarkSystem();
            window.historySystem = new HistorySystem();
        }
    }, 100);
});

// Adicione este código ao seu script existente
const settingsBtn = document.getElementById('settings');
const settingsModal = document.getElementById('settingsModal');
const settingsOverlay = document.getElementById('settingsOverlay');
const closeSettings = document.getElementById('closeSettings');
const saveSettings = document.getElementById('saveSettings');

// Configurações padrão
let browserSettings = {
    theme: 'light',
    homePage: 'https://google.com',
    searchEngine: 'google'
};

// Carregar configurações salvas
const loadSettings = () => {
    const savedSettings = localStorage.getItem('browserSettings');
    if (savedSettings) {
        browserSettings = JSON.parse(savedSettings);
        applySettings();
    }
};

// Aplicar configurações
const applySettings = () => {
    document.documentElement.setAttribute('data-theme', browserSettings.theme);
    document.getElementById('homePageInput').value = browserSettings.homePage;
    document.getElementById('searchEngineSelect').value = browserSettings.searchEngine;
    
    // Atualizar seleção de tema
    document.querySelectorAll('.theme-option').forEach(option => {
        option.classList.toggle('active', option.dataset.theme === browserSettings.theme);
    });
};

// Eventos
settingsBtn.addEventListener('click', () => {
    settingsModal.classList.add('active');
    settingsOverlay.classList.add('active');
});

closeSettings.addEventListener('click', () => {
    settingsModal.classList.remove('active');
    settingsOverlay.classList.remove('active');
});

document.querySelectorAll('.theme-option').forEach(option => {
    option.addEventListener('click', () => {
        document.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        browserSettings.theme = option.dataset.theme;
        document.documentElement.setAttribute('data-theme', browserSettings.theme);
    });
});

saveSettings.addEventListener('click', () => {
    const oldEngine = browserSettings.searchEngine;
    
    browserSettings.homePage = document.getElementById('homePageInput').value;
    browserSettings.searchEngine = document.getElementById('searchEngineSelect').value;
    
    localStorage.setItem('browserSettings', JSON.stringify(browserSettings));
    
    // Se o motor de busca mudou, atualizar a página inicial
    if (oldEngine !== browserSettings.searchEngine) {
        const webview = window.tabSystem.getActiveWebview();
        if (webview) {
            const currentUrl = webview.getURL();
            // Se estiver em uma página de busca do motor antigo, recarregar com o novo
            if (currentUrl.includes(oldEngine)) {
                const searchTerm = extractSearchTerm(currentUrl, oldEngine);
                if (searchTerm) {
                    window.tabSystem.doSearch(webview, searchTerm);
                }
            }
        }
    }
    
    settingsModal.classList.remove('active');
    settingsOverlay.classList.remove('active');
    
    // Mostrar notificação
    showNotification('Configurações salvas com sucesso');
});

// Adicione esta função auxiliar
function extractSearchTerm(url, engine) {
    try {
        const urlObj = new URL(url);
        switch (engine) {
            case 'duckduckgo':
                return urlObj.searchParams.get('q');
            case 'bing':
                return urlObj.searchParams.get('q');
            case 'google':
                return urlObj.searchParams.get('q');
            default:
                return null;
        }
    } catch {
        return null;
    }
}

// Adicione esta função para notificações
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <span class="material-symbols-rounded">info</span>
        <span>${message}</span>
    `;

    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Carregar configurações ao iniciar
loadSettings();

// Sistema de abas
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
        this.setupUrlBar();
    }

    init() {
        if (this.newTabBtn) {
            this.newTabBtn.addEventListener('click', () => this.createTab());
        }
        // Criar primeira aba com um delay maior
        setTimeout(() => this.createTab(), 500);
    }

    setupUrlBar() {
        this.urlBar.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') {
                const webview = this.getActiveWebview();
                if (webview) {
                    const input = this.urlBar.value.trim();
                    
                    // Se parece com uma URL
                    if (this.isValidUrl(input) || this.isDomain(input)) {
                        let url = input;
                        if (!url.startsWith('http://') && !url.startsWith('https://')) {
                            url = 'https://' + url;
                        }
                        webview.loadURL(url).catch(() => {
                            // Se falhar ao carregar como URL, faz uma pesquisa
                            this.doSearch(webview, input);
                        });
                    } else {
                        // Se não parece URL, faz uma pesquisa
                        this.doSearch(webview, input);
                    }
                }
            }
        });
    }

    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch {
            return false;
        }
    }

    isDomain(string) {
        return /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(string);
    }

    doSearch(webview, searchTerm) {
        const encodedSearch = encodeURIComponent(searchTerm);
        const settings = JSON.parse(localStorage.getItem('browserSettings')) || {};
        const searchEngine = settings.searchEngine || 'google';
        
        let searchUrl;
        switch (searchEngine) {
            case 'duckduckgo':
                searchUrl = `https://duckduckgo.com/?q=${encodedSearch}`;
                break;
            case 'bing':
                searchUrl = `https://www.bing.com/search?q=${encodedSearch}`;
                break;
            case 'google':
            default:
                searchUrl = `https://www.google.com/search?q=${encodedSearch}`;
                break;
        }
        
        webview.loadURL(searchUrl);
    }

    createTab(url = 'https://www.google.com') {
        const tabId = `tab-${this.tabCounter++}`;
        const contentId = `content-${tabId}`;

        // Criar elemento da aba
        const tab = document.createElement('div');
        tab.className = 'tab';
        tab.id = tabId;
        tab.innerHTML = `
            <span class="tab-favicon">
                <span class="material-symbols-rounded">public</span>
            </span>
            <span class="tab-title">Nova aba</span>
            <button class="tab-close">
                <span class="material-symbols-rounded">close</span>
            </button>
        `;

        // Criar conteúdo da aba
        const content = document.createElement('div');
        content.className = 'tab-content';
        content.id = contentId;
        content.innerHTML = `<webview src="${url}" allowpopups></webview>`;

        // Adicionar ao DOM primeiro
        this.tabsContainer.appendChild(tab);
        this.tabsContent.appendChild(content);

        // Configurar eventos após adicionar ao DOM
        const webview = content.querySelector('webview');
        
        webview.addEventListener('dom-ready', () => {
            this.setupWebview(webview, tab);
            if (this.activeTabId === tabId) {
                this.urlBar.value = webview.getURL();
            }
        });

        // Eventos da aba
        tab.addEventListener('click', (e) => {
            if (!e.target.closest('.tab-close')) {
                this.activateTab(tabId);
            }
        });

        tab.querySelector('.tab-close').addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeTab(tabId);
        });

        // Ativar a nova aba
        this.activateTab(tabId);

        // Adicionar suporte ao arrasto
        this.setupTabDrag(tab);

        return { tabId, webview };
    }

    setupWebview(webview, tab) {
        // Configurar controles de navegação
        const backBtn = document.getElementById('back');
        const forwardBtn = document.getElementById('forward');
        const reloadBtn = document.getElementById('reload');
        
        // Atualizar estado dos botões
        const updateNavigationButtons = () => {
            backBtn.disabled = !webview.canGoBack();
            forwardBtn.disabled = !webview.canGoForward();
            backBtn.style.opacity = webview.canGoBack() ? '1' : '0.5';
            forwardBtn.style.opacity = webview.canGoForward() ? '1' : '0.5';
        };

        // Configurar eventos de navegação
        backBtn.onclick = () => {
            if (webview.canGoBack()) {
                webview.goBack();
            }
        };

        forwardBtn.onclick = () => {
            if (webview.canGoForward()) {
                webview.goForward();
            }
        };

        reloadBtn.onclick = () => {
            if (reloadBtn.querySelector('.material-symbols-rounded').textContent === 'close') {
                webview.stop();
            } else {
                webview.reload();
            }
        };

        // Eventos do webview
        webview.addEventListener('did-start-loading', () => {
            if (tab) {
                tab.classList.add('loading');
                reloadBtn.querySelector('.material-symbols-rounded').textContent = 'close';
            }
        });

        webview.addEventListener('did-stop-loading', () => {
            if (tab) {
                tab.classList.remove('loading');
                reloadBtn.querySelector('.material-symbols-rounded').textContent = 'refresh';
                if (this.activeTabId === tab.id) {
                    this.urlBar.value = webview.getURL();
                }
            }
            updateNavigationButtons();
        });

        webview.addEventListener('did-navigate', updateNavigationButtons);
        webview.addEventListener('did-navigate-in-page', updateNavigationButtons);

        // Outros eventos existentes
        webview.addEventListener('page-title-updated', (e) => {
            if (tab) {
                const titleElement = tab.querySelector('.tab-title');
                if (titleElement) {
                    titleElement.textContent = e.title;
                }
            }
        });

        webview.addEventListener('page-favicon-updated', (e) => {
            if (tab) {
                const favicon = tab.querySelector('.tab-favicon');
                if (favicon && e.favicons && e.favicons[0]) {
                    favicon.innerHTML = `<img src="${e.favicons[0]}" alt="favicon">`;
                }
            }
        });

        // Inicializar estado dos botões
        webview.addEventListener('dom-ready', () => {
            updateNavigationButtons();
        });

        // Adicionar otimizações
        optimizeWebview(webview);

        // Limitar número máximo de abas para melhor performance
        if (this.tabs.length > 20) {
            this.closeOldestInactiveTab();
        }

        // Usar requestIdleCallback para atualizações não críticas
        const updateTab = () => {
            if (window.requestIdleCallback) {
                window.requestIdleCallback(() => {
                    this.updateTabInfo(webview, tab);
                });
            } else {
                setTimeout(() => {
                    this.updateTabInfo(webview, tab);
                }, 0);
            }
        };

        webview.addEventListener('page-title-updated', updateTab);
        webview.addEventListener('page-favicon-updated', updateTab);
    }

    activateTab(tabId) {
        // Verificar se os elementos existem antes de manipulá-los
        const oldTab = this.activeTabId ? document.getElementById(this.activeTabId) : null;
        const oldContent = this.activeTabId ? document.getElementById(`content-${this.activeTabId}`) : null;
        const newTab = document.getElementById(tabId);
        const newContent = document.getElementById(`content-${tabId}`);

        // Desativar aba atual
        if (oldTab && oldContent) {
            oldTab.classList.remove('active');
            oldContent.classList.remove('active');
        }

        // Ativar nova aba
        if (newTab && newContent) {
            this.activeTabId = tabId;
            newTab.classList.add('active');
            newContent.classList.add('active');

            // Atualizar URL bar
            const webview = newContent.querySelector('webview');
            if (webview && webview.getURL) {
                try {
                    this.urlBar.value = webview.getURL();
                } catch (error) {
                    console.log('Webview ainda não está pronto');
                }
            }
        }
    }

    closeTab(tabId) {
        const tab = document.getElementById(tabId);
        const content = document.getElementById(`content-${tabId}`);
        const isActiveTab = tabId === this.activeTabId;

        if (tab && content) {
            // Remover elementos
            tab.remove();
            content.remove();

            // Se fechou a aba ativa, ativar outra
            if (isActiveTab) {
                const remainingTabs = this.tabsContainer.querySelectorAll('.tab');
                if (remainingTabs.length > 0) {
                    this.activateTab(remainingTabs[remainingTabs.length - 1].id);
                } else {
                    this.createTab(); // Criar nova aba se não houver mais nenhuma
                }
            }
        }
    }

    getActiveWebview() {
        if (!this.activeTabId) return null;
        const content = document.getElementById(`content-${this.activeTabId}`);
        return content ? content.querySelector('webview') : null;
    }

    setupTabDrag(tab) {
        let isDragging = false;
        let dragStartX = 0;
        let dragStartY = 0;
        let dragThreshold = 10; // Limiar para iniciar o arrasto
        let hasExitedWindow = false;

        tab.setAttribute('draggable', 'true');

        tab.addEventListener('mousedown', (e) => {
            dragStartX = e.clientX;
            dragStartY = e.clientY;
        });

        tab.addEventListener('dragstart', (e) => {
            isDragging = true;
            e.dataTransfer.setDragImage(tab, 0, 0);
            tab.classList.add('dragging');
        });

        tab.addEventListener('drag', (e) => {
            if (!isDragging) return;

            const distanceX = Math.abs(e.clientX - dragStartX);
            const distanceY = Math.abs(e.clientY - dragStartY);

            // Se ultrapassou o limiar de arrasto e saiu da janela
            if (distanceX > dragThreshold || distanceY > dragThreshold) {
                if (e.clientY < 0 || e.clientY > window.innerHeight ||
                    e.clientX < 0 || e.clientX > window.innerWidth) {
                    
                    if (!hasExitedWindow) {
                        hasExitedWindow = true;
                        const tabId = tab.id;
                        const webview = this.getWebviewByTabId(tabId);
                        
                        if (webview) {
                            const bounds = {
                                x: e.screenX - dragStartX,
                                y: e.screenY - dragStartY
                            };

                            ipcRenderer.send('detach-tab', {
                                url: webview.getURL(),
                                bounds: bounds,
                                title: webview.getTitle()
                            });

                            ipcRenderer.once('tab-detached', () => {
                                this.closeTab(tabId);
                            });
                        }
                    }
                }
            }
        });

        tab.addEventListener('dragend', () => {
            isDragging = false;
            hasExitedWindow = false;
            tab.classList.remove('dragging');
        });
    }

    getWebviewByTabId(tabId) {
        const content = document.getElementById(`content-${tabId}`);
        return content ? content.querySelector('webview') : null;
    }

    // Adicione este método para limpar abas antigas
    closeOldestInactiveTab() {
        const inactiveTabs = this.tabs.filter(tab => 
            tab.id !== this.activeTabId && 
            !tab.isPinned
        );

        if (inactiveTabs.length > 0) {
            this.closeTab(inactiveTabs[0].id);
        }
    }
}

// Sistema de Favoritos
class BookmarkSystem {
    constructor() {
        this.bookmarks = [];
        this.bookmarkBtn = document.getElementById('bookmark');
        this.bookmarksModal = document.getElementById('bookmarksModal');
        this.bookmarksOverlay = document.getElementById('bookmarksOverlay');
        this.closeBookmarksBtn = document.getElementById('closeBookmarks');
        this.bookmarksList = document.getElementById('bookmarksList');
        this.addBookmarkBtn = document.getElementById('addBookmark');
        this.bookmarkTitleInput = document.getElementById('bookmarkTitle');
        this.bookmarkUrlInput = document.getElementById('bookmarkUrl');
        
        this.init();
    }

    init() {
        this.loadBookmarks();
        this.setupEventListeners();
    }

    loadBookmarks() {
        try {
            const saved = localStorage.getItem('bookmarks');
            this.bookmarks = saved ? JSON.parse(saved) : [];
            this.renderBookmarks();
        } catch (error) {
            console.error('Erro ao carregar favoritos:', error);
            this.bookmarks = [];
        }
    }

    saveBookmarks() {
        try {
            localStorage.setItem('bookmarks', JSON.stringify(this.bookmarks));
        } catch (error) {
            console.error('Erro ao salvar favoritos:', error);
        }
    }

    renderBookmarks() {
        if (!this.bookmarksList) return;
        
        this.bookmarksList.innerHTML = '';
        this.bookmarks.forEach((bookmark, index) => {
            const bookmarkElement = document.createElement('div');
            bookmarkElement.className = 'bookmark-item';
            bookmarkElement.innerHTML = `
                <div class="bookmark-info">
                    <span class="bookmark-favicon">
                        <span class="material-symbols-rounded">public</span>
                    </span>
                    <span class="bookmark-title">${this.escapeHtml(bookmark.title)}</span>
                    <span class="bookmark-url">${this.escapeHtml(bookmark.url)}</span>
                </div>
                <div class="bookmark-actions">
                    <button class="control-button delete-bookmark" data-index="${index}">
                        <span class="material-symbols-rounded">delete</span>
                    </button>
                </div>
            `;

            // Adicionar evento de clique para abrir o favorito
            bookmarkElement.addEventListener('click', (e) => {
                if (!e.target.closest('.bookmark-actions')) {
                    this.openBookmark(bookmark.url);
                }
            });

            // Adicionar evento para deletar
            const deleteBtn = bookmarkElement.querySelector('.delete-bookmark');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.removeBookmark(index);
                });
            }

            this.bookmarksList.appendChild(bookmarkElement);
        });

        this.updateBookmarkButton();
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    openBookmark(url) {
        const webview = window.tabSystem.getActiveWebview();
        if (webview) {
            webview.loadURL(url);
            this.closeModal();
        }
    }

    addBookmark(title, url) {
        if (!title || !url) return false;
        
        try {
            // Validar URL
            new URL(url);
            
            // Verificar se já existe
            const exists = this.bookmarks.some(b => b.url === url);
            if (!exists) {
                this.bookmarks.push({ title, url });
                this.saveBookmarks();
                this.renderBookmarks();
                this.showNotification('Favorito adicionado');
                return true;
            }
        } catch (error) {
            console.error('URL inválida:', error);
            return false;
        }
        return false;
    }

    removeBookmark(index) {
        if (index >= 0 && index < this.bookmarks.length) {
            this.bookmarks.splice(index, 1);
            this.saveBookmarks();
            this.renderBookmarks();
            this.showNotification('Favorito removido');
        }
    }

    setupEventListeners() {
        // Botão de favorito
        if (this.bookmarkBtn) {
            this.bookmarkBtn.addEventListener('click', () => {
                const webview = window.tabSystem.getActiveWebview();
                if (webview) {
                    // Esperar o webview estar pronto
                    if (webview.isLoading()) {
                        return;
                    }

                    try {
                        const url = webview.getURL();
                        const title = webview.getTitle() || 'Sem título';
                        const isBookmarked = this.bookmarks.some(b => b.url === url);
                        
                        if (isBookmarked) {
                            const index = this.bookmarks.findIndex(b => b.url === url);
                            this.removeBookmark(index);
                        } else {
                            this.addBookmark(title, url);
                        }
                        
                        // Atualizar ícone imediatamente
                        this.updateBookmarkButton();
                    } catch (error) {
                        console.error('Erro ao adicionar favorito:', error);
                    }
                }
            });

            // Botão direito para abrir modal
            this.bookmarkBtn.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.showModal();
            });
        }

        // Modal de favoritos
        if (this.closeBookmarksBtn) {
            this.closeBookmarksBtn.addEventListener('click', () => this.closeModal());
        }

        if (this.bookmarksOverlay) {
            this.bookmarksOverlay.addEventListener('click', (e) => {
                if (e.target === this.bookmarksOverlay) this.closeModal();
            });
        }

        // Adicionar novo favorito manualmente
        if (this.addBookmarkBtn) {
            this.addBookmarkBtn.addEventListener('click', () => {
                const title = this.bookmarkTitleInput.value.trim();
                const url = this.bookmarkUrlInput.value.trim();
                
                if (title && url) {
                    if (this.addBookmark(title, url)) {
                        this.bookmarkTitleInput.value = '';
                        this.bookmarkUrlInput.value = '';
                    }
                }
            });
        }

        // Atualizar ícone quando o webview estiver pronto
        document.addEventListener('webview-dom-ready', () => {
            setTimeout(() => this.updateBookmarkButton(), 100);
        });

        // Observer para mudanças nas abas
        if (window.tabSystem) {
            const observer = new MutationObserver(() => {
                setTimeout(() => this.updateBookmarkButton(), 100);
            });

            const tabsContainer = document.getElementById('tabs');
            if (tabsContainer) {
                observer.observe(tabsContainer, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: ['class']
                });
            }
        }
    }

    updateBookmarkButton() {
        if (!this.bookmarkBtn) return;

        const webview = window.tabSystem?.getActiveWebview();
        if (!webview) return;

        try {
            if (webview.getURL) {
                const url = webview.getURL();
                if (url) {
                    const isBookmarked = this.bookmarks.some(b => b.url === url);
                    const icon = this.bookmarkBtn.querySelector('.material-symbols-rounded');
                    if (icon) {
                        icon.textContent = isBookmarked ? 'star' : 'star_outline';
                        icon.classList.toggle('favorited', isBookmarked);
                    }
                }
            }
        } catch (error) {
            console.log('Webview ainda não está pronto para atualizar favoritos');
        }
    }

    closeModal() {
        if (this.bookmarksModal) this.bookmarksModal.classList.remove('active');
        if (this.bookmarksOverlay) this.bookmarksOverlay.classList.remove('active');
    }

    showModal() {
        if (this.bookmarksModal) this.bookmarksModal.classList.add('active');
        if (this.bookmarksOverlay) this.bookmarksOverlay.classList.add('active');
    }

    showNotification(message) {
        // Remover notificação anterior se existir
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Criar nova notificação
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <span class="material-symbols-rounded">star</span>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);
        
        // Mostrar notificação com animação
        setTimeout(() => notification.classList.add('show'), 100);

        // Remover notificação após 3 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Sistema de Histórico
class HistorySystem {
    constructor() {
        this.history = [];
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupSystem());
        } else {
            this.setupSystem();
        }
    }

    setupSystem() {
        this.historyBtn = document.getElementById('history');
        this.historyModal = document.getElementById('historyModal');
        this.historyOverlay = document.getElementById('historyOverlay');
        this.closeHistoryBtn = document.getElementById('closeHistory');
        this.clearHistoryBtn = document.getElementById('clearHistory');
        this.historyList = document.getElementById('historyList');
        this.historySearch = document.getElementById('historySearch');

        this.loadHistory();
        this.setupEventListeners();
        this.setupWebviewListeners();
    }

    loadHistory() {
        try {
            const saved = localStorage.getItem('browserHistory');
            this.history = saved ? JSON.parse(saved) : [];
            this.renderHistory();
        } catch (error) {
            console.error('Erro ao carregar histórico:', error);
            this.history = [];
        }
    }

    renderHistory(searchTerm = '') {
        if (!this.historyList) return;

        this.historyList.innerHTML = '';
        let currentDate = '';

        const filteredHistory = searchTerm
            ? this.history.filter(entry => 
                entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                entry.url.toLowerCase().includes(searchTerm.toLowerCase())
            )
            : this.history;

        filteredHistory.forEach(entry => {
            const date = this.formatDate(entry.timestamp);

            if (date !== currentDate) {
                currentDate = date;
                const dateHeader = document.createElement('div');
                dateHeader.className = 'history-date-header';
                dateHeader.textContent = date;
                this.historyList.appendChild(dateHeader);
            }

            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            // Simplifica a exibição da URL
            const displayUrl = this.getDisplayUrl(entry.url);

            historyItem.innerHTML = `
                <div class="history-info">
                    <span class="history-favicon">
                        <span class="material-symbols-rounded">public</span>
                    </span>
                    <div class="history-text">
                        <span class="history-title">${this.escapeHtml(entry.title)}</span>
                        <span class="history-url">${this.escapeHtml(displayUrl)}</span>
                    </div>
                </div>
                <div class="history-time">
                    ${new Date(entry.timestamp).toLocaleTimeString()}
                </div>
            `;

            historyItem.addEventListener('click', () => {
                const webview = window.tabSystem.getActiveWebview();
                if (webview) {
                    webview.loadURL(entry.url);
                    this.closeModal();
                }
            });

            this.historyList.appendChild(historyItem);
        });
    }

    setupEventListeners() {
        if (this.historyBtn) {
            this.historyBtn.addEventListener('click', () => this.showModal());
        }

        if (this.closeHistoryBtn) {
            this.closeHistoryBtn.addEventListener('click', () => this.closeModal());
        }

        if (this.historyOverlay) {
            this.historyOverlay.addEventListener('click', (e) => {
                if (e.target === this.historyOverlay) this.closeModal();
            });
        }

        if (this.clearHistoryBtn) {
            this.clearHistoryBtn.addEventListener('click', () => {
                if (confirm('Tem certeza que deseja limpar todo o histórico?')) {
                    this.clearHistory();
                }
            });
        }

        if (this.historySearch) {
            this.historySearch.addEventListener('input', (e) => {
                this.renderHistory(e.target.value.trim());
            });
        }
    }

    setupWebviewListeners() {
        // Observar o TabSystem para detectar mudanças de aba
        if (window.tabSystem) {
            // Observar o container de conteúdo das abas
            const tabsContent = document.getElementById('tabsContent');
            if (!tabsContent) return;

            // Configurar observer para novos webviews
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.querySelector && node.querySelector('webview')) {
                            this.attachWebviewListeners(node.querySelector('webview'));
                        }
                    });
                });
            });

            observer.observe(tabsContent, {
                childList: true,
                subtree: true
            });

            // Anexar listeners aos webviews existentes
            const existingWebviews = tabsContent.querySelectorAll('webview');
            existingWebviews.forEach(webview => this.attachWebviewListeners(webview));
        }
    }

    attachWebviewListeners(webview) {
        if (!webview) return;

        // Navegação normal
        webview.addEventListener('did-navigate', (e) => {
            if (e.url && !e.url.startsWith('about:')) {
                const title = webview.getTitle() || 'Nova página';
                // Simplifica a URL removendo parâmetros desnecessários
                const simpleUrl = this.simplifyUrl(e.url);
                this.addToHistory(simpleUrl, title);
            }
        });

        // Navegação na mesma página (inclui pesquisas do Google)
        webview.addEventListener('did-navigate-in-page', (e) => {
            if (e.url && !e.url.startsWith('about:')) {
                try {
                    const url = new URL(e.url);
                    // Verificar se é uma pesquisa do Google
                    if (url.hostname.includes('google.com') && url.pathname.includes('/search')) {
                        const searchParams = new URLSearchParams(url.search);
                        const searchQuery = searchParams.get('q');
                        if (searchQuery) {
                            // Para pesquisas, mostra o termo pesquisado como título
                            this.addToHistory(e.url, `Pesquisa: ${searchQuery}`);
                        }
                    } else {
                        const title = webview.getTitle() || 'Nova página';
                        const simpleUrl = this.simplifyUrl(e.url);
                        this.addToHistory(simpleUrl, title);
                    }
                } catch (error) {
                    console.error('Erro ao processar URL:', error);
                }
            }
        });

        // Atualização de título
        webview.addEventListener('page-title-updated', (e) => {
            const url = webview.getURL();
            if (url && !url.startsWith('about:')) {
                const simpleUrl = this.simplifyUrl(url);
                this.addToHistory(simpleUrl, e.title);
            }
        });
    }

    addToHistory(url, title) {
        const entry = {
            url,
            title: title || url,
            timestamp: new Date().toISOString()
        };

        // Evitar duplicatas consecutivas
        const lastEntry = this.history[0];
        if (lastEntry && lastEntry.url === entry.url) {
            return;
        }

        console.log('Salvando no histórico:', entry);
        this.history.unshift(entry);

        // Limitar o histórico a 1000 entradas
        if (this.history.length > 1000) {
            this.history = this.history.slice(0, 1000);
        }

        this.saveHistory();
        this.renderHistory();
    }

    clearHistory() {
        try {
            // Limpa o array de histórico
            this.history = [];
            
            // Salva o estado vazio no localStorage
            this.saveHistory();
            
            // Atualiza a interface
            this.renderHistory();
            
            // Mostra notificação de sucesso
            this.showNotification('Histórico limpo com sucesso');
            
            // Fecha o modal após limpar
            this.closeModal();
        } catch (error) {
            console.error('Erro ao limpar histórico:', error);
            this.showNotification('Erro ao limpar histórico');
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        if (diff < 24 * 60 * 60 * 1000) {
            return 'Hoje';
        } else if (diff < 48 * 60 * 60 * 1000) {
            return 'Ontem';
        } else {
            return date.toLocaleDateString();
        }
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    saveHistory() {
        try {
            localStorage.setItem('browserHistory', JSON.stringify(this.history));
        } catch (error) {
            console.error('Erro ao salvar histórico:', error);
        }
    }

    showModal() {
        if (this.historyModal && this.historyOverlay) {
            this.historyModal.classList.add('active');
            this.historyOverlay.classList.add('active');
            this.renderHistory();
        }
    }

    closeModal() {
        if (this.historyModal && this.historyOverlay) {
            this.historyModal.classList.remove('active');
            this.historyOverlay.classList.remove('active');
        }
    }

    // Adicione este novo método à classe HistorySystem
    simplifyUrl(url) {
        try {
            const urlObj = new URL(url);
            // Remove parâmetros de rastreamento comuns
            const cleanUrl = urlObj.origin + urlObj.pathname;
            // Remove barras duplicadas e trailing slash
            return cleanUrl.replace(/([^:]\/)\/+/g, "$1").replace(/\/$/, "");
        } catch {
            return url;
        }
    }

    // Adicione este método para simplificar a exibição da URL
    getDisplayUrl(url) {
        try {
            const urlObj = new URL(url);
            // Remove 'www.' e mostra apenas o domínio
            return urlObj.hostname.replace(/^www\./, '');
        } catch {
            return url;
        }
    }

    // Adicione este método para mostrar notificações
    showNotification(message) {
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <span class="material-symbols-rounded">info</span>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Adicione esta nova classe
class SidebarSystem {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.sidebarApps = document.getElementById('sidebarApps');
        this.addAppBtn = document.getElementById('addSidebarApp');
        this.addAppModal = document.getElementById('addAppModal');
        this.addAppOverlay = document.getElementById('addAppOverlay');
        this.sidebarEnabled = document.getElementById('sidebarEnabled');
        
        this.apps = [];
        this.init();
    }

    init() {
        this.loadApps();
        this.setupEventListeners();
        this.applySidebarState();
    }

    loadApps() {
        try {
            const saved = localStorage.getItem('sidebarApps');
            this.apps = saved ? JSON.parse(saved) : [];
            this.renderApps();
        } catch (error) {
            console.error('Erro ao carregar apps:', error);
            this.apps = [];
        }
    }

    saveApps() {
        localStorage.setItem('sidebarApps', JSON.stringify(this.apps));
    }

    renderApps() {
        this.sidebarApps.innerHTML = '';
        this.apps.forEach((app, index) => {
            const appElement = document.createElement('div');
            appElement.className = 'sidebar-app';
            
            // Função para obter o favicon do site
            const getFavicon = (url) => {
                try {
                    const domain = new URL(url).hostname;
                    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
                } catch {
                    return null;
                }
            };

            const favicon = getFavicon(app.url);
            const iconContent = favicon ? 
                `<img src="${favicon}" alt="${app.name}">` :
                `<span class="material-symbols-rounded">public</span>`;
            
            // Removido o título, mantendo apenas o ícone
            appElement.innerHTML = iconContent;

            // Adicionar evento de clique para abrir em nova aba
            appElement.addEventListener('click', () => {
                window.tabSystem.createTab(app.url);
            });

            // Botão direito para remover
            appElement.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                if (confirm(`Remover ${app.name} da sidebar?`)) {
                    this.removeApp(index);
                }
            });

            this.sidebarApps.appendChild(appElement);
        });
    }

    setupEventListeners() {
        // Botão de adicionar app
        this.addAppBtn.addEventListener('click', () => {
            this.addAppModal.classList.add('active');
            this.addAppOverlay.classList.add('active');
        });

        // Toggle da sidebar
        this.sidebarEnabled.addEventListener('change', (e) => {
            this.sidebar.classList.toggle('active', e.target.checked);
            localStorage.setItem('sidebarEnabled', e.target.checked);
        });

        // Salvar novo app
        document.getElementById('saveApp').addEventListener('click', () => {
            const name = document.getElementById('appName').value;
            const url = document.getElementById('appUrl').value;

            if (name && url) {
                this.addApp(name, url);
                this.closeAddAppModal();
            }
        });

        // Fechar modal
        document.getElementById('closeAddApp').addEventListener('click', () => {
            this.closeAddAppModal();
        });
    }

    addApp(name, url) {
        this.apps.push({ name, url });
        this.saveApps();
        this.renderApps();
    }

    removeApp(index) {
        this.apps.splice(index, 1);
        this.saveApps();
        this.renderApps();
    }

    closeAddAppModal() {
        this.addAppModal.classList.remove('active');
        this.addAppOverlay.classList.remove('active');
        document.getElementById('appName').value = '';
        document.getElementById('appUrl').value = '';
    }

    applySidebarState() {
        const enabled = localStorage.getItem('sidebarEnabled') === 'true';
        this.sidebarEnabled.checked = enabled;
        this.sidebar.classList.toggle('active', enabled);
    }
}

// Inicializar a sidebar junto com os outros sistemas
document.addEventListener('DOMContentLoaded', () => {
    // ... (outros sistemas) ...
    window.sidebarSystem = new SidebarSystem();
});

// Adicione esta nova classe
class DownloadSystem {
    constructor() {
        this.downloads = new Map();
        this.downloadHistory = [];
        this.downloadsBtn = document.getElementById('downloads');
        this.downloadsModal = document.getElementById('downloadsModal');
        this.downloadsOverlay = document.getElementById('downloadsOverlay');
        this.closeDownloadsBtn = document.getElementById('closeDownloads');
        this.downloadsList = document.getElementById('downloadsList');
        this.openDownloadsFolderBtn = document.getElementById('openDownloadsFolder');
        
        this.init();
    }

    init() {
        this.loadDownloadHistory();
        this.setupEventListeners();
    }

    loadDownloadHistory() {
        try {
            const saved = localStorage.getItem('downloadHistory');
            this.downloadHistory = saved ? JSON.parse(saved) : [];
            this.renderDownloads();
        } catch (error) {
            console.error('Erro ao carregar histórico de downloads:', error);
            this.downloadHistory = [];
        }
    }

    saveDownloadHistory() {
        localStorage.setItem('downloadHistory', JSON.stringify(this.downloadHistory));
    }

    setupEventListeners() {
        // Botão de downloads
        if (this.downloadsBtn) {
            this.downloadsBtn.addEventListener('click', () => this.showModal());
        }

        // Fechar modal
        if (this.closeDownloadsBtn) {
            this.closeDownloadsBtn.addEventListener('click', () => this.closeModal());
        }

        // Abrir pasta de downloads
        if (this.openDownloadsFolderBtn) {
            this.openDownloadsFolderBtn.addEventListener('click', async () => {
                const { shell } = require('electron');
                const downloadsPath = await ipcRenderer.invoke('get-downloads-folder');
                shell.openPath(downloadsPath);
            });
        }

        // Eventos de download
        ipcRenderer.on('download-started', (event, data) => {
            this.addDownload(data);
        });

        ipcRenderer.on('download-updated', (event, data) => {
            this.updateDownload(data);
        });

        ipcRenderer.on('download-completed', (event, data) => {
            this.completeDownload(data);
        });
    }

    addDownload(data) {
        const download = {
            id: data.id,
            filename: data.filename,
            url: data.url,
            totalBytes: data.totalBytes,
            receivedBytes: 0,
            state: 'progressing',
            startTime: new Date().toISOString()
        };

        this.downloads.set(data.id, download);
        this.renderDownloads();
        this.showNotification(`Iniciando download: ${data.filename}`);
    }

    updateDownload(data) {
        const download = this.downloads.get(data.id);
        if (download) {
            download.receivedBytes = data.receivedBytes;
            download.state = data.state;
            download.speed = data.speed;
            download.paused = data.paused;
            this.renderDownloads();
        }
    }

    completeDownload(data) {
        const download = this.downloads.get(data.id);
        if (download) {
            download.state = data.state;
            download.savePath = data.savePath;
            download.endTime = new Date().toISOString();
            
            // Adicionar ao histórico
            this.downloadHistory.unshift(download);
            if (this.downloadHistory.length > 100) {
                this.downloadHistory = this.downloadHistory.slice(0, 100);
            }
            
            this.downloads.delete(data.id);
            this.saveDownloadHistory();
            this.renderDownloads();
            
            const status = data.state === 'completed' ? 'concluído' : 'falhou';
            this.showNotification(`Download ${status}: ${download.filename}`);
        }
    }

    renderDownloads() {
        if (!this.downloadsList) return;

        this.downloadsList.innerHTML = '';

        if (this.downloads.size === 0 && this.downloadHistory.length === 0) {
            this.downloadsList.innerHTML = `
                <div class="downloads-empty">
                    <span class="material-symbols-rounded">download</span>
                    <p>Nenhum download ainda</p>
                </div>
            `;
            return;
        }

        // Downloads ativos
        this.downloads.forEach(download => {
            const progress = download.totalBytes 
                ? Math.round((download.receivedBytes / download.totalBytes) * 100)
                : 0;

            const speed = download.speed 
                ? `${(download.speed / (1024 * 1024)).toFixed(1)} MB/s`
                : '';

            const downloadItem = document.createElement('div');
            downloadItem.className = 'download-item active';
            downloadItem.innerHTML = `
                <div class="download-info">
                    <div class="download-icon">
                        <span class="material-symbols-rounded">downloading</span>
                    </div>
                    <div class="download-details">
                        <span class="download-filename">${download.filename}</span>
                        <div class="download-progress">
                            <div class="progress-bar">
                                <div class="progress" style="width: ${progress}%"></div>
                            </div>
                            <span class="progress-text">${progress}%</span>
                            <span class="download-speed">${speed}</span>
                        </div>
                    </div>
                </div>
                <div class="download-actions">
                    <button class="control-button cancel-download" title="Cancelar download">
                        <span class="material-symbols-rounded">close</span>
                    </button>
                </div>
            `;

            downloadItem.querySelector('.cancel-download').addEventListener('click', () => {
                ipcRenderer.send('cancel-download', download.id);
            });

            this.downloadsList.appendChild(downloadItem);
        });

        // Histórico de downloads
        this.downloadHistory.forEach(download => {
            const downloadItem = document.createElement('div');
            downloadItem.className = `download-item ${download.state}`;
            downloadItem.innerHTML = `
                <div class="download-info">
                    <div class="download-icon">
                        <span class="material-symbols-rounded">
                            ${download.state === 'completed' ? 'download_done' : 'error'}
                        </span>
                    </div>
                    <div class="download-details">
                        <span class="download-filename">${download.filename}</span>
                        <span class="download-path">${download.savePath || ''}</span>
                    </div>
                </div>
                <div class="download-actions">
                    ${download.state === 'completed' ? `
                        <button class="control-button open-folder" title="Abrir pasta">
                            <span class="material-symbols-rounded">folder_open</span>
                        </button>
                    ` : ''}
                </div>
            `;

            if (download.state === 'completed') {
                downloadItem.querySelector('.open-folder').addEventListener('click', () => {
                    const { shell } = require('electron');
                    shell.showItemInFolder(download.savePath);
                });
            }

            this.downloadsList.appendChild(downloadItem);
        });
    }

    showModal() {
        if (this.downloadsModal && this.downloadsOverlay) {
            this.downloadsModal.classList.add('active');
            this.downloadsOverlay.classList.add('active');
            this.renderDownloads();
        }
    }

    closeModal() {
        if (this.downloadsModal && this.downloadsOverlay) {
            this.downloadsModal.classList.remove('active');
            this.downloadsOverlay.classList.remove('active');
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <span class="material-symbols-rounded">download</span>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Inicializar o sistema de downloads
document.addEventListener('DOMContentLoaded', () => {
    window.downloadSystem = new DownloadSystem();
});

// Adicione esta nova classe para os recursos de produtividade
class ProductivityFeatures {
    constructor() {
        this.adBlockBtn = document.getElementById('adBlock');
        this.screenshotBtn = document.getElementById('screenshot');
        this.pipBtn = document.getElementById('pipMode');
        this.incognitoBtn = document.getElementById('incognito');
        
        this.isAdBlockEnabled = localStorage.getItem('adBlockEnabled') === 'true';
        
        this.init();
    }

    init() {
        this.setupAdBlock();
        this.setupScreenshot();
        this.setupPiP();
        this.setupIncognito();
    }

    setupAdBlock() {
        this.adBlockBtn.classList.toggle('active', this.isAdBlockEnabled);
        
        this.adBlockBtn.addEventListener('click', () => {
            this.isAdBlockEnabled = !this.isAdBlockEnabled;
            this.adBlockBtn.classList.toggle('active', this.isAdBlockEnabled);
            localStorage.setItem('adBlockEnabled', this.isAdBlockEnabled);
            
            const webview = window.tabSystem.getActiveWebview();
            if (webview) {
                webview.reload();
            }
        });

        // Injetar bloqueador de anúncios em cada webview
        document.addEventListener('webview-created', (e) => {
            const webview = e.detail;
            if (this.isAdBlockEnabled) {
                webview.executeJavaScript(`
                    // Código simples de bloqueio de anúncios
                    function blockAds() {
                        const adSelectors = [
                            'ins.adsbygoogle',
                            '[id^="google_ads_"]',
                            '.advertisement',
                            '.ad-container',
                            '[class*="ad-"]',
                            '[id*="ad-"]'
                        ];
                        
                        const elements = document.querySelectorAll(adSelectors.join(','));
                        elements.forEach(el => el.style.display = 'none');
                    }
                    
                    blockAds();
                    new MutationObserver(blockAds).observe(document.body, {
                        childList: true,
                        subtree: true
                    });
                `);
            }
        });
    }

    setupScreenshot() {
        this.screenshotBtn.addEventListener('click', async () => {
            const webview = window.tabSystem.getActiveWebview();
            if (webview) {
                try {
                    const image = await webview.capturePage();
                    const dataUrl = image.toDataURL();
                    
                    // Criar preview
                    const preview = document.createElement('div');
                    preview.className = 'screenshot-preview';
                    preview.innerHTML = `
                        <img src="${dataUrl}" alt="Screenshot">
                        <div class="screenshot-actions">
                            <button class="control-button" id="saveScreenshot">
                                <span class="material-symbols-rounded">save</span>
                            </button>
                            <button class="control-button" id="copyScreenshot">
                                <span class="material-symbols-rounded">content_copy</span>
                            </button>
                            <button class="control-button" id="closeScreenshot">
                                <span class="material-symbols-rounded">close</span>
                            </button>
                        </div>
                    `;
                    
                    document.body.appendChild(preview);
                    
                    // Eventos dos botões
                    preview.querySelector('#saveScreenshot').addEventListener('click', async () => {
                        try {
                            const { filePath } = await ipcRenderer.invoke('show-save-dialog', {
                                defaultPath: 'screenshot.png',
                                filters: [{ name: 'Images', extensions: ['png'] }]
                            });
                            
                            if (filePath) {
                                await ipcRenderer.invoke('save-screenshot', {
                                    filePath,
                                    dataUrl: image.toDataURL()
                                });
                            }
                        } catch (error) {
                            console.error('Erro ao salvar screenshot:', error);
                        }
                    });
                    
                    preview.querySelector('#copyScreenshot').addEventListener('click', async () => {
                        await ipcRenderer.invoke('copy-to-clipboard', image.toDataURL());
                    });
                    
                    preview.querySelector('#closeScreenshot').addEventListener('click', () => {
                        preview.remove();
                    });
                    
                    // Auto-remover após 5 segundos
                    setTimeout(() => preview.remove(), 5000);
                } catch (error) {
                    console.error('Erro ao capturar screenshot:', error);
                }
            }
        });
    }

    setupPiP() {
        this.pipBtn.addEventListener('click', () => {
            const webview = window.tabSystem.getActiveWebview();
            if (webview) {
                webview.executeJavaScript(`
                    // Encontrar o primeiro vídeo na página
                    const video = document.querySelector('video');
                    if (video) {
                        video.requestPictureInPicture();
                    }
                `);
            }
        });
    }

    setupIncognito() {
        if (this.incognitoBtn) {
            this.incognitoBtn.addEventListener('click', () => {
                ipcRenderer.send('create-incognito-window');
            });
        }

        // Verificar se é uma janela anônima
        const urlParams = new URLSearchParams(window.location.search);
        const isIncognito = urlParams.get('incognito') === 'true';

        if (isIncognito) {
            // Aplicar estilo de modo anônimo
            document.documentElement.classList.add('incognito-mode');
            
            // Adicionar indicador de modo anônimo após os controles da janela
            const titlebar = document.querySelector('.titlebar');
            const windowControls = titlebar.querySelector('.window-controls');
            const incognitoIndicator = document.createElement('div');
            incognitoIndicator.className = 'incognito-indicator';
            incognitoIndicator.innerHTML = `<span>Modo Anônimo</span>`;
            windowControls.insertAdjacentElement('afterend', incognitoIndicator);

            // Desabilitar salvamento de histórico
            window.historySystem = {
                addToHistory: () => {}, // Função vazia para não salvar histórico
                loadHistory: () => {},
                saveHistory: () => {},
                renderHistory: () => {}
            };

            // Desabilitar salvamento de favoritos
            window.bookmarkSystem = {
                addBookmark: () => {},
                loadBookmarks: () => {},
                saveBookmarks: () => {},
                renderBookmarks: () => {},
                updateBookmarkButton: () => {}
            };

            // Desabilitar salvamento de downloads
            window.downloadSystem = {
                ...window.downloadSystem,
                saveDownloadHistory: () => {},
                loadDownloadHistory: () => {}
            };

            // Limpar dados ao fechar
            window.addEventListener('beforeunload', () => {
                const webview = window.tabSystem?.getActiveWebview();
                if (webview) {
                    webview.clearHistory();
                    webview.clearCache();
                }
            });

            // Configurar webviews para modo privado
            document.addEventListener('webview-created', (e) => {
                const webview = e.detail;
                webview.partition = 'incognito'; // Usar sessão privada
                webview.setZoomLevel(0); // Resetar zoom
                webview.addEventListener('dom-ready', () => {
                    webview.executeJavaScript(`
                        // Limpar storage
                        localStorage.clear();
                        sessionStorage.clear();
                        
                        // Bloquear rastreadores
                        navigator.serviceWorker.getRegistrations().then(registrations => {
                            registrations.forEach(registration => registration.unregister());
                        });
                        
                        // Desabilitar cache
                        if (window.caches) {
                            caches.keys().then(names => {
                                names.forEach(name => caches.delete(name));
                            });
                        }
                    `);
                });
            });
        }
    }
}

// Inicializar os recursos de produtividade
document.addEventListener('DOMContentLoaded', () => {
    window.productivityFeatures = new ProductivityFeatures();
});

// Adicione este código junto com os outros event listeners
document.addEventListener('DOMContentLoaded', () => {
    const toolsBtn = document.getElementById('toolsBtn');
    const toolsMenu = document.getElementById('toolsMenu');

    // Abrir/fechar menu ao clicar
    toolsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toolsMenu.classList.toggle('active');
    });

    // Fechar menu ao clicar fora
    document.addEventListener('click', (e) => {
        if (!toolsMenu.contains(e.target) && !toolsBtn.contains(e.target)) {
            toolsMenu.classList.remove('active');
        }
    });
});

// Adicione estas funções de otimização
function optimizeWebview(webview) {
    webview.addEventListener('dom-ready', () => {
        // Otimizações de renderização
        webview.executeJavaScript(`
            // Otimizar scrolling
            document.documentElement.style.scrollBehavior = 'smooth';
            
            // Otimizar animações
            document.body.style.backfaceVisibility = 'hidden';
            document.body.style.transform = 'translateZ(0)';
            document.body.style.perspective = '1000px';
            
            // Desabilitar animações quando não visível
            document.addEventListener('visibilitychange', () => {
                document.body.style.animationPlayState = 
                    document.hidden ? 'paused' : 'running';
            });

            // Lazy loading de imagens
            document.querySelectorAll('img').forEach(img => {
                if (!img.loading) img.loading = 'lazy';
            });

            // Otimizar fonte
            document.documentElement.style.fontDisplay = 'swap';
        `);

        // Configurar zoom para evitar problemas de renderização
        webview.setZoomLevel(0);
        webview.setVisualZoomLevelLimits(1, 3);
    });

    // Limitar recursos em segundo plano
    webview.addEventListener('visibility-change', (e) => {
        if (e.isVisible) {
            webview.executeJavaScript(`
                document.body.style.animationPlayState = 'running';
                document.body.style.opacity = '1';
            `);
        } else {
            webview.executeJavaScript(`
                document.body.style.animationPlayState = 'paused';
                document.body.style.opacity = '0.1';
            `);
        }
    });
}

// Adicione este código no início do arquivo
ipcRenderer.on('create-tab', (event, { url, title }) => {
    if (window.tabSystem) {
        window.tabSystem.createTab(url);
    }
});