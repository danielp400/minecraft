# BlockVerse 🎮

Um jogo estilo Minecraft 2D/3D desenvolvido com **Three.js**, **Vite**, e **JavaScript moderno**.

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js v16+ instalado
- npm ou yarn

### Instalação e Execução

```bash
# 1. Navegar até a pasta do projeto
cd BlockVerse

# 2. Instalar dependências
npm install

# 3. Iniciar o servidor de desenvolvimento
npm run dev
```

O projeto abrirá automaticamente em `http://localhost:5173/`

### Como Usar

1. **Iniciar o Jogo**: Pressione **ENTER** quando a tela de menu aparecer
2. **Interagir**: Use o mouse e teclado para interagir com o mundo 3D
3. **Redimensionar**: A janela se ajusta automaticamente ao redimensionar

## 📦 Estrutura do Projeto

```
BlockVerse/
├── index.html          # Arquivo HTML principal
├── style.css          # Estilos do projeto
├── package.json       # Dependências e scripts
├── vite.config.js     # Configuração do Vite
├── .gitignore         # Arquivos a ignorar
├── node_modules/      # Dependências instaladas
├── js/
│   └── main.js        # Código principal do jogo (ES6 Modules)
└── assets/            # Pasta para imagens e recursos
```

## 🛠️ Scripts Disponíveis

```bash
npm run dev      # Inicia o servidor de desenvolvimento com hot reload
npm run build    # Compila o projeto para produção
npm run preview  # Visualiza a build de produção localmente
```

## 🎯 Tecnologias Utilizadas

- **Three.js** v0.179.0 - Renderização 3D
- **Vite** v5.4.21 - Build tool e dev server moderno
- **JavaScript ES6+** - Linguagem de programação
- **HTML5** - Estrutura
- **CSS3** - Estilização

## 🔧 Configuração Técnica

### Vite Config
- **Port**: 5173
- **Hot Reload**: Ativado
- **Source Maps**: Ativado em build

### Three.js Config
- **Renderer**: WebGL com antialiasing
- **Câmera**: Perspective (75° FOV)
- **Iluminação**: Directional + Ambient
- **Sombras**: Ativadas

## 📝 Desenvolvimento

### Adicionar Novas Features

1. Importe o Three.js no topo do arquivo:
```javascript
import * as THREE from 'three';
```

2. Adicione seu código ao `js/main.js` ou crie novos módulos

3. O Vite fará hot reload automaticamente

### Build para Produção

```bash
npm run build
```

A pasta `dist/` será gerada com os arquivos otimizados prontos para deploy.

## ✅ Status do Projeto

- ✅ Three.js carregado corretamente como módulo ES6
- ✅ Vite configurado e rodando
- ✅ Hot reload ativado
- ✅ Sem erros no console
- ✅ Estrutura modular pronta para expansão

## 🐛 Troubleshooting

### Erro: "THREE is not defined"
- ✅ **Resolvido**: Migrado para ES6 Modules com importação local do Three.js

### Erro de CORS
- ✅ **Resolvido**: Removido carregamento via CDN, agora usa npm

### Porta 5173 já em uso
```bash
npm run dev -- --port 3000  # Usar porta 3000
```

## 📄 Licença

MIT

## 👨‍💻 Autor

Desenvolvido como um projeto base para games 3D com Three.js e Vite.

---

**Última atualização**: 2026-07-07  
**Status**: ✅ Funcionando corretamente
