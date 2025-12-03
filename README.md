# Jogo Infantil - TCC

Um jogo educativo interativo desenvolvido como protótipo acadêmico para Trabalho de Conclusão de Curso em Engenharia de Software.

## 📋 Sobre o Projeto

**Autor:** Nicolas Cardoso Vilha do Lago  
**Curso:** Engenharia de Software  
**Instituição:** Universidade do Contestado (UNC) - Mafra  
**Orientador:** Élio Ribeiro Faria Junior  
**Ano:** 2025  
**Versão:** v0.9 (Protótipo)  

## 🎯 Objetivo

Desenvolvimento de um jogo educativo para crianças focado no aprendizado de sílabas e formação de palavras, com atividades interativas que estimulam o desenvolvimento da alfabetização.

## 🛠️ Tecnologias Utilizadas

### Framework Principal
- **Phaser.js 3.90.0** - Game engine JavaScript para desenvolvimento de jogos 2D

### Frontend
- **HTML5** - Estrutura da aplicação
- **CSS3** - Estilização e layout responsivo
- **JavaScript ES6+** - Lógica do jogo e interatividade
- **ES Modules** - Sistema de módulos moderno

### Fontes
- **Google Fonts - Quicksand** - Fonte amigável para crianças
  - Pesos: 400, 600, 700
  - Otimizada para legibilidade infantil

### Recursos Multimídia
- **Arquivos de Áudio MP3** - Narração e efeitos sonoros
  - Instruções de atividades
  - Pronúncia de palavras e sílabas
  - Feedbacks auditivos
- **Imagens PNG** - Assets visuais do jogo
- **Ícones personalizados** - Interface e elementos interativos

### Arquitetura
- **Sistema de Cenas (Scenes)** - Organização modular do jogo
  - StartScene - Tela inicial
  - FaseScene - Seleção de fases
  - ConfigScene - Configurações
  - Fase1-4Atividades - Atividades educativas por fase
- **Sistema de Save** - Gerenciamento de progresso
- **Sistema de Áudio** - Controle de som e música

## 📂 Estrutura do Projeto

```
Jogoinfantil/
├── assets/                     # Recursos multimídia
│   ├── sons/                   # Arquivos de áudio
│   │   ├── audios/            # Pronúncia de palavras
│   │   ├── help/              # Instruções de ajuda
│   │   ├── siglas/            # Sons de sílabas
│   │   └── title/             # Títulos de atividades
│   ├── ui/                    # Elementos da interface
│   └── *.png                  # Imagens do jogo
├── src/                       # Código fonte
│   ├── scenes/                # Cenas do jogo
│   │   ├── start.js          # Tela inicial
│   │   ├── fasescene.js      # Seleção de fases
│   │   ├── configscene.js    # Configurações
│   │   └── fase*_atividades.js # Atividades por fase
│   ├── services/              # Serviços
│   │   └── savemanager.js    # Gerenciamento de save
│   ├── ui/                    # Componentes de UI
│   └── main.js               # Arquivo principal
├── index.html                 # Página principal
├── phaser.js                 # Framework Phaser.js
└── project.config            # Configurações do projeto
```

## 🎮 Funcionalidades

### Sistema de Fases
- **4 Fases diferentes** com letras específicas (B, C, D, F)
- **9 atividades por fase** com diferentes tipos de exercícios
- **Progressão gradual** de dificuldade

### Tipos de Atividades
1. **Ache a figura certa** - Associação palavra-imagem
2. **Que sílaba começa** - Identificação de sílaba inicial
3. **Figuras com letra específica** - Classificação por letra
4. **Ache o intruso** - Identificação de elementos diferentes
5. **Separação de sílabas** - Organização silábica
6. **Que palavra é essa** - Reconhecimento de palavras
7. **Monte a palavra** - Construção de palavras
8. **Jogo da memória** - Memória com sílabas e figuras
9. **Sílaba certa para cada figura** - Arrastar e soltar

### Sistema de Interface
- **Design responsivo** adaptável a diferentes telas
- **Interface amigável** para crianças
- **Feedbacks visuais e sonoros** para interações
- **Sistema de ajuda** com instruções em áudio
- **Controle de volume** personalizável

### Sistema de Configurações
- **Controle de volume da música**
- **Sistema de save automático**
- **Progresso persistente**

## 🚀 Como Executar

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/NicolasCardoso2/Jogoinfantil.git
   ```

2. **Navegue até o diretório:**
   ```bash
   cd Jogoinfantil
   ```

3. **Sirva os arquivos localmente:**
   ```bash
   # Usando Python 3
   python -m http.server 8000
   
   # Usando Node.js (http-server)
   npx http-server -p 8000
   
   # Usando PHP
   php -S localhost:8000
   ```

4. **Acesse no navegador:**
   ```
   http://localhost:8000
   ```

## 📱 Compatibilidade

- **Navegadores modernos** com suporte a ES6+
- **WebGL** ou Canvas para renderização
- **Web Audio API** para áudio
- **Dispositivos touch** e desktop
- **Resolução recomendada:** 1280x720 ou superior

## 🎨 Características Técnicas

### Performance
- **Otimização de assets** com compressão de imagens
- **Lazy loading** de recursos
- **Sistema de cache** para melhor performance
- **Renderização eficiente** com Phaser.js

### Acessibilidade
- **Fonte legível** especialmente escolhida para crianças
- **Contrastes adequados** para boa visibilidade
- **Botões grandes** para facilitar interação
- **Feedbacks claros** em todas as interações

### Sistema de Áudio
- **Narração completa** das atividades
- **Efeitos sonoros** responsivos
- **Controle de volume** independente
- **Suporte a múltiplos formatos** de áudio

## 📄 Licença

Este projeto é um protótipo acadêmico desenvolvido para fins educacionais como parte do TCC em Engenharia de Software.

## 👥 Contribuições

Este é um projeto acadêmico individual desenvolvido como Trabalho de Conclusão de Curso.

## 📞 Contato

**Nicolas Cardoso Vilha do Lago**  
Universidade do Contestado (UNC) - Mafra  
Engenharia de Software - 2025

---

*Protótipo acadêmico (TCC) - v0.9*