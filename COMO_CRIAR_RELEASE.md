# 📦 Como Criar uma Release no GitHub

## Passo a Passo

### 1. Acesse o GitHub
Vá para: https://github.com/lucasvitancourt/CleanBrowser

### 2. Vá para Releases
- Clique na aba **"Releases"** no menu lateral direito
- Ou acesse diretamente: https://github.com/lucasvitancourt/CleanBrowser/releases

### 3. Criar Nova Release
- Clique no botão **"Draft a new release"** ou **"Create a new release"**

### 4. Preencher Informações

#### Tag version
```
v2.0.0
```
(A tag já foi criada e enviada)

#### Release title
```
🚀 CleanBrowser v2.0.0 - Ultra Edition
```

#### Description
Copie e cole o conteúdo do arquivo `RELEASE_NOTES_v2.0.0.md` ou use este texto:

```markdown
## 🎉 Lançamento Oficial - Ultra Edition

Esta é a versão **Ultra Edition** do CleanBrowser, trazendo funcionalidades incríveis focadas em produtividade, UX excepcional e performance otimizada!

## ✨ Novidades Principais

### 🎯 Command Palette
Acesse qualquer funcionalidade instantaneamente com `Ctrl+Shift+P`
- 18+ comandos disponíveis
- Busca em tempo real
- Exibição de atalhos

### 🔍 Sugestões Inteligentes
A barra de URL agora oferece sugestões baseadas em:
- ⭐ Favoritos salvos
- 🕐 Histórico de navegação
- 🔍 Sugestões de busca

### 🖱️ Gestos do Mouse
Navegue com gestos intuitivos (botão direito + arrastar):
- **Swipe Esquerda** - Voltar
- **Swipe Direita** - Avançar
- **Swipe Cima** - Nova aba
- **Swipe Baixo** - Fechar aba

### 📑 Sistema de Abas Melhorado
- Reabrir abas fechadas (`Ctrl+Shift+T`)
- Indicadores visuais de carregamento
- Barra de progresso no topo

### ⭐ Favoritos e 🕐 Histórico Redesenhados
- Visualização em grid organizado
- Busca em tempo real
- Agrupamento por data

## ⌨️ 20+ Atalhos de Teclado

- `Ctrl+Shift+P` - Command Palette
- `Ctrl+T` - Nova aba
- `Ctrl+Shift+T` - Reabrir aba fechada
- `Ctrl+L` - Focar barra de URL
- `Ctrl+B` - Favoritos
- `Ctrl+H` - Histórico
- E muito mais!

## 📥 Download e Instalação

### Windows
1. Baixe o arquivo `CleanBrowserSetup.exe` abaixo
2. Execute o instalador
3. Siga as instruções na tela
4. Pronto!

### Requisitos
- Windows 10 ou superior
- 4GB RAM (recomendado)
- 200MB de espaço em disco

## 📚 Documentação Completa

Veja a documentação completa no repositório:
- [README.md](https://github.com/lucasvitancourt/CleanBrowser/blob/main/README.md)
- [SHORTCUTS.md](https://github.com/lucasvitancourt/CleanBrowser/blob/main/SHORTCUTS.md)
- [FEATURES.md](https://github.com/lucasvitancourt/CleanBrowser/blob/main/FEATURES.md)

## 🐛 Correções

- ✅ Webview DOM ready errors corrigidos
- ✅ Window dragging funcionando perfeitamente
- ✅ Tema claro/escuro sem bugs
- ✅ Drag & drop de abas suave
- ✅ Performance otimizada

---

**Desenvolvido com ❤️ e muito café ☕**
```

### 5. Anexar o Instalador

#### Opção A: Arrastar e Soltar
1. Role até a seção **"Attach binaries"**
2. Arraste o arquivo `dist/CleanBrowserSetup.exe` para a área
3. Aguarde o upload completar

#### Opção B: Selecionar Arquivo
1. Clique em **"Attach binaries by dropping them here or selecting them"**
2. Navegue até `CleanBrowser/dist/`
3. Selecione `CleanBrowserSetup.exe`
4. Aguarde o upload

### 6. Configurações Adicionais

#### Marcar como "Latest Release"
- ✅ Marque a opção **"Set as the latest release"**

#### Pre-release (Opcional)
- ⬜ Deixe desmarcado (não é uma versão beta)

### 7. Publicar

- Clique no botão verde **"Publish release"**
- Aguarde a publicação

## ✅ Verificação

Após publicar, verifique:
1. A release aparece em: https://github.com/lucasvitancourt/CleanBrowser/releases
2. O arquivo `CleanBrowserSetup.exe` está disponível para download
3. A tag `v2.0.0` está visível
4. A descrição está formatada corretamente

## 📝 Comandos Git Usados

```bash
# Tag já foi criada e enviada
git tag -a v2.0.0 -m "Ultra Edition v2.0.0"
git push origin v2.0.0

# Commit já foi feito
git add .
git commit -m "🚀 Ultra Edition v2.0"
git push origin main
```

## 🎯 Resultado Final

Após seguir estes passos, você terá:
- ✅ Release v2.0.0 publicada
- ✅ Instalador disponível para download
- ✅ Descrição completa com todas as funcionalidades
- ✅ Tag v2.0.0 no repositório
- ✅ Link direto para download

## 🔗 Links Úteis

- Repositório: https://github.com/lucasvitancourt/CleanBrowser
- Releases: https://github.com/lucasvitancourt/CleanBrowser/releases
- Issues: https://github.com/lucasvitancourt/CleanBrowser/issues

---

**Pronto! Sua release estará disponível para o mundo! 🌍**
