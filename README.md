# 🌐 Clean Browser

Um navegador desktop **incrivelmente poderoso** e minimalista construído com Electron.js, focado em design limpo, UX excepcional e produtividade máxima.

## ✨ Destaques

- 🎨 **Design Minimalista** - Interface limpa inspirada no macOS com tema claro/escuro
- ⚡ **Super Rápido** - Performance otimizada e carregamento instantâneo
- ⌨️ **Atalhos Poderosos** - Mais de 20 atalhos para máxima produtividade
- 🎯 **Command Palette** - Acesse qualquer função rapidamente (Ctrl+Shift+P)
- 🔍 **Sugestões Inteligentes** - Busca em favoritos e histórico em tempo real
- 🖱️ **Gestos do Mouse** - Navegue com gestos intuitivos
- 🌓 **Tema Claro/Escuro** - Alterne entre temas com um clique
- 📑 **Abas Inteligentes** - Drag & drop, reabrir abas fechadas, navegação rápida
- ⭐ **Sistema de Favoritos** - Organize seus sites favoritos com visual em grid
- 🕐 **Histórico Completo** - Busca rápida e agrupamento por data
- 🎭 **Animações Suaves** - Micro-interações e transições fluidas
- 💡 **Tooltips Informativos** - Dicas visuais em todos os botões

## 🚀 Instalação

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm start

# Construir para produção
npm run build
```

## ⌨️ Atalhos de Teclado

### 🎯 Navegação
| Atalho | Ação |
|--------|------|
| `Ctrl + T` | Nova aba |
| `Ctrl + W` | Fechar aba atual |
| `Ctrl + Shift + T` | Reabrir última aba fechada |
| `Ctrl + Tab` | Próxima aba |
| `Ctrl + Shift + Tab` | Aba anterior |
| `Ctrl + 1-9` | Ir para aba específica (1-9) |
| `Alt + ←` | Voltar |
| `Alt + →` | Avançar |
| `Ctrl + R` | Recarregar página |
| `Ctrl + Shift + R` | Recarregar (limpar cache) |

### 🔍 Busca e URL
| Atalho | Ação |
|--------|------|
| `Ctrl + L` | Focar barra de URL |
| `Ctrl + F` | Buscar na página |
| `Ctrl + Shift + P` | Abrir paleta de comandos |

### ⭐ Recursos
| Atalho | Ação |
|--------|------|
| `Ctrl + B` | Abrir favoritos |
| `Ctrl + H` | Abrir histórico |
| `Ctrl + J` | Abrir downloads |
| `Ctrl + ,` | Abrir configurações |

### 🔧 Ferramentas
| Atalho | Ação |
|--------|------|
| `F11` | Tela cheia |
| `F12` | Ferramentas do desenvolvedor |
| `Ctrl + P` | Imprimir |
| `Ctrl + +` | Aumentar zoom |
| `Ctrl + -` | Diminuir zoom |
| `Ctrl + 0` | Resetar zoom |

## 🖱️ Gestos do Mouse

- **Swipe Esquerda** (botão direito + arrastar) - Voltar
- **Swipe Direita** (botão direito + arrastar) - Avançar
- **Swipe Cima** (botão direito + arrastar) - Nova aba
- **Swipe Baixo** (botão direito + arrastar) - Fechar aba

## 🎨 Funcionalidades Avançadas

### Command Palette (Ctrl+Shift+P)
Acesse rapidamente qualquer comando do navegador:
- Busca em tempo real
- Exibição de atalhos
- Execução instantânea
- Interface limpa e intuitiva

### Sugestões Inteligentes
A barra de URL oferece sugestões baseadas em:
- ⭐ Favoritos salvos
- 🕐 Histórico de navegação
- 🔍 Sugestões de busca
- Navegação com setas ↑↓
- Seleção com Enter

### Sistema de Abas
- **Drag & Drop** - Reordene abas arrastando
- **Indicadores visuais** - Veja qual aba está carregando
- **Favicon dinâmico** - Ícones dos sites nas abas
- **Fechamento inteligente** - Ctrl+W ou botão X
- **Reabrir abas** - Ctrl+Shift+T reabre últimas 10 abas fechadas

### Favoritos
- Visualização em grid organizado
- Agrupamento por data (Hoje, Ontem, Esta Semana, etc.)
- Busca rápida
- Adicionar/remover com um clique
- Indicador visual na barra de URL

### Histórico
- Busca em tempo real
- Agrupamento por data
- Visualização limpa e organizada
- Limpar histórico com um clique
- Acesso rápido às páginas visitadas

## 🎭 Animações e Efeitos

- **Slide In** - Modais e sugestões aparecem suavemente
- **Fade In** - Transições de conteúdo
- **Loading Bar** - Barra de progresso no topo durante carregamento
- **Hover Effects** - Efeitos visuais em botões e elementos interativos
- **Shimmer** - Indicador de aba ativa com efeito brilhante
- **Tooltips** - Dicas que aparecem ao passar o mouse

## 📦 Tecnologias

- **Electron** ^29.1.4 - Framework desktop multiplataforma
- **Tailwind CSS** - Framework CSS utilitário
- **Lucide Icons** - Biblioteca de ícones moderna
- **Electron Store** ^8.1.0 - Armazenamento local persistente

## 🎨 Paleta de Cores

### Tema Escuro (Padrão)
- **Background**: `#1e1e1e` - Preto suave
- **Surface**: `#2d2d30` - Cinza escuro
- **Elevated**: `#3e3e42` - Cinza médio
- **Text**: `#e4e4e7` - Branco suave
- **Secondary**: `#a1a1aa` - Cinza claro
- **Accent**: `#71717a` - Cinza neutro

### Tema Claro
- **Background**: `#ffffff` - Branco puro
- **Surface**: `#f5f5f5` - Cinza muito claro
- **Elevated**: `#e8e8e8` - Cinza claro
- **Text**: `#1a1a1a` - Preto suave
- **Secondary**: `#666666` - Cinza médio

## 🔧 Performance

- **Lazy Loading** - Abas inativas otimizadas
- **Cache Inteligente** - Gerenciamento automático
- **Aceleração GPU** - Renderização otimizada
- **Memory Management** - Uso eficiente de memória
- **Smooth Scrolling** - Rolagem suave habilitada

## 📝 Estrutura do Projeto

```
CleanBrowser/
├── main.js              # Processo principal do Electron
├── renderer.js          # Lógica da interface e sistemas
│   ├── CommandPalette   # Sistema de comandos rápidos
│   ├── BookmarkSystem   # Gerenciamento de favoritos
│   ├── HistorySystem    # Gerenciamento de histórico
│   ├── TabSystem        # Sistema de abas
│   ├── SuggestionSystem # Sugestões inteligentes
│   └── MouseGestures    # Gestos do mouse
├── preload.js          # Script de pré-carregamento
├── index.html          # Interface principal
├── package.json        # Dependências e scripts
├── README.md          # Documentação principal
└── SHORTCUTS.md       # Guia completo de atalhos
```

## 💡 Dicas de Uso

1. **Use Ctrl+Shift+P** para acessar rapidamente qualquer função
2. **Ctrl+L** para focar na barra de URL e começar a digitar
3. **Use as setas** ↑↓ para navegar nas sugestões
4. **Ctrl+Tab** para alternar rapidamente entre abas
5. **Gestos do mouse** para navegação rápida
6. **Ctrl+Shift+T** para recuperar abas fechadas acidentalmente
7. **F11** para modo tela cheia sem distrações
8. **Ctrl+1-9** para pular diretamente para uma aba específica

## 🎯 Roadmap Futuro

- [ ] Modo leitura sem distrações
- [ ] Tradutor integrado
- [ ] Captura de tela integrada
- [ ] Gerenciador de senhas
- [ ] Sistema de extensões
- [ ] Sincronização em nuvem
- [ ] Perfis de usuário
- [ ] Bloqueador de anúncios
- [ ] VPN integrada
- [ ] Modo privado/incógnito

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir novas funcionalidades
- Melhorar a documentação
- Enviar pull requests

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.

---

**Desenvolvido com ❤️ e muito café ☕**

*Um navegador que respeita sua produtividade e seu tempo.*
