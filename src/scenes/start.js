import SaveManager from '../services/savemanager.js';

export default class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: 'startscene' });
  }

  preload() {
    this.load.image('fundo', 'assets/floresta.png');
    this.load.image('titulo_menu', 'assets/titulo.png');

    // Pássaro
    this.load.image('passaro_caindo', 'assets/p_caindo.png');
    this.load.image('passaro_base', 'assets/p_sembraco.png');
    this.load.image('passaro_braco', 'assets/braço_do_P.png');
    
    // Música de fundo
    this.load.audio('musica_inicio', 'assets/sons/inicio.mp3');
  }

  create() {
    // Fade in suave ao entrar na cena
    this.cameras.main.fadeIn(300, 245, 247, 251);
    
    // Reset da flag de transição
    this._transitioning = false;
    
    // Música de fundo - garantir que só há uma instância
    if (this.musicaInicio) {
      this.musicaInicio.stop();
      this.musicaInicio.destroy();
      this.musicaInicio = null;
    }
    
    const saveSettings = SaveManager.load().settings || {};
    const volumeSalvo = (saveSettings.musicVolume !== undefined ? saveSettings.musicVolume : parseFloat(localStorage.getItem('musicVolume') || '0.3'));
    this.musicaInicio = this.sound.add('musica_inicio', {
      volume: volumeSalvo,
      loop: true
    });
    this.musicaInicio.play();
    console.log('Música do StartScene iniciada');
    
    // Patch para acentos
    if (!this._fmPatched) {
      const _text = this.add.text.bind(this.add);
      this.add.text = (x, y, t, style) =>
        _text(x, y, (window.fixMojibake ? window.fixMojibake(String(t)) : String(t)), style);
      this._fmPatched = true;
    }

    const W = this.scale.width;
    const H = this.scale.height;

    // Fundo
    const bg = this.add.image(W / 2, H / 2, 'fundo');
    bg.setDisplaySize(W, H);

    // TÍTULO grande
    const titulo = this.add.image(W / 2, H * 0.16, 'titulo_menu').setOrigin(0.5);
    const escalaTitulo = Math.min(
      (W * 0.95) / titulo.width,
      (H * 0.70) / titulo.height
    );
    titulo.setScale(escalaTitulo);

    // Remover qualquer antigo "Diversão e Aprendizado"
    this.children.each((obj) => {
      if (!obj.text) return;
      const txt = String(obj.text);
      if (
        txt.includes('Diversão e Aprendizado') ||
        txt.includes('DiversÃ£o e Aprendizado')
      ) {
        obj.destroy();
      }
    });

    // PÁSSARO
    this.criarAnimacaoPassaro();

    // BOTÕES
    const btnJogar = this.criarBotaoMenu(W / 2, H * 0.76, 'JOGAR', '#35b34a').setDepth(5);
    btnJogar.on('pointerdown', () => {
      console.log('Clicou em JOGAR - indo para FaseScene');
      
      // Parar música do StartScene antes de navegar
      if (this.musicaInicio && this.musicaInicio.isPlaying) {
        console.log('Parando música do StartScene...');
        this.musicaInicio.stop();
        this.musicaInicio.destroy();
        this.musicaInicio = null;
      }
      
      console.log('window.mudarCenaComFade disponível:', !!window.mudarCenaComFade);
      
      if (window.mudarCenaComFade && typeof window.mudarCenaComFade === 'function') {
        window.mudarCenaComFade(this, 'fasescene');
      } else {
        console.log('Usando fallback this.scene.start');
        this.scene.start('fasescene');
      }
    });

    const btnConfig = this.criarBotaoMenu(W / 2, H * 0.87, 'CONFIGURAÇÕES', '#2f8eea').setDepth(5);
    btnConfig.on('pointerdown', () => {
      // Proteção contra cliques múltiplos
      if (this._openingConfig) {
        console.log('Configurações já estão sendo abertas, ignorando');
        return;
      }
      this._openingConfig = true;
      
      console.log('Abrindo configurações do StartScene');
      
      // Pausar música enquanto estiver nas configurações
      if (this.musicaInicio && this.musicaInicio.isPlaying) {
        this.musicaInicio.pause();
      }
      
      // Criar ConfigScene como modal overlay
      this.createConfigModal();
      
      // Reset da flag após um delay
      this.time.delayedCall(500, () => {
        this._openingConfig = false;
      });
    });
  }

  // Botão estilo "pílula"
criarBotaoMenu(x, y, texto, corHex) {
  const L = 320, A = 70, R = 22;
  const container = this.add.container(x, y);

  // Cores base/hover
  const corBase = Phaser.Display.Color.HexStringToColor(corHex).color;
  const corHover = Phaser.Display.Color.HexStringToColor(corHex).brighten(30).color;

  // Sombra fixa
  const sombra = this.add.graphics();
  sombra.fillStyle(0x000000, 0.25);
  sombra.fillRoundedRect(-L / 2 + 4, -A / 2 + 6, L, A, R);

  // Fundo
  const bg = this.add.graphics();
  const desenharBg = (c) => {
    bg.clear();
    bg.fillStyle(c, 1);
    bg.fillRoundedRect(-L / 2, -A / 2, L, A, R);
  };
  desenharBg(corBase);

  // Texto
  const label = this.add.text(
    0,
    0,
    (window.fixMojibake ? window.fixMojibake(String(texto)) : String(texto)),
    {
      fontSize: '28px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
      shadow: { offsetX: 0, offsetY: 2, color: 'rgba(0,0,0,0.5)', blur: 0, fill: true }
    }
  ).setOrigin(0.5);

  container.add([sombra, bg, label]);

  // Hitbox simples: retângulo exato do botão
  container.setSize(L, A);
  container.setInteractive({ useHandCursor: true });

  // Hover: só muda a cor, sem mexer em tamanho/posição
  container.on('pointerover', () => {
    desenharBg(corHover);
  });

  container.on('pointerout', () => {
    desenharBg(corBase);
  });

  // Clique: só um flash rápido de alpha (não mexe na hitbox)
  container.on('pointerdown', () => {
    this.tweens.add({
      targets: container,
      alpha: 0.8,
      duration: 80,
      yoyo: true,
      ease: 'Power2'
    });
  });

  return container;
}



  // Entrada do pássaro: usa P_caindo, cai e depois troca para o papagaio acenando
  criarAnimacaoPassaro() {
    const W = this.scale.width, H = this.scale.height;

    const destinoX = W - 200;
    const destinoY = H - 95;

    const startX = destinoX - 10;
    const meioY  = H * 0.23;

    const p = this.add.image(startX, -180, 'passaro_caindo')
      .setScale(1.1)
      .setAngle(-35)
      .setAlpha(0)
      .setDepth(2);

    this.time.delayedCall(400, () => {
      this.tweens.add({
        targets: p,
        alpha: 1,
        y: meioY,
        angle: -15,
        duration: 700,
        ease: 'Quad.easeIn',
        onComplete: () => {
          this.tweens.add({
            targets: p,
            x: destinoX,
            y: destinoY,
            angle: 0,
            duration: 600,
            ease: 'Bounce.easeOut',
            onComplete: () => {
              p.destroy();
              this.montarPassaroAcenando(destinoX, destinoY);
            }
          });
        }
      });
    });
  }

montarPassaroAcenando(x, y) {
  const cont = this.add.container(x, y).setDepth(3);

  const corpo = this.add.image(0, 0, 'passaro_base').setScale(1.1);

  // MESMA POSIÇÃO (-150, -20), foco em mexer mais a mão
  const braco = this.add.image(-150, -20, 'passaro_braco')
    .setScale(0.5)
    // pivô mais perto do ombro, pra mão balançar sem sair do lugar
    .setOrigin(0.25, 0.8);

  // braço atrás, corpo na frente
  cont.add([braco, corpo]);

  // flutuação leve do papagaio
  this.tweens.add({
    targets: cont,
    y: y - 6,
    duration: 900,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  });

  // aceno suave – só a mão se mexe, sem levantar o braço todo
  this.tweens.add({
    targets: braco,
    angle: { from: -6, to: 6 },
    duration: 450,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  });
}

  // Criar modal de configuração diretamente na cena atual
  createConfigModal() {
    if (this._configModal) {
      console.log('Modal de configuração já existe');
      return;
    }

    console.log('Criando modal de configuração...');
    this._configModal = true;

    // Definir cores
    const COLOR = {
      PRIMARY: 0x4CAF50,
      SECONDARY: 0x2196F3,
      ACCENT: 0xFFC107,
      DANGER: 0xF44336,
      BG_WHITE: 0xffffff,
      TEXT_DARK: '#333333',
      TEXT_LIGHT: '#ffffff'
    };

    // Fundo escuro overlay
    const overlay = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.6)
      .setOrigin(0, 0)
      .setInteractive()
      .setDepth(1000);

    // Painel principal
    const painel = this.add.graphics().setDepth(1001);
    painel.fillStyle(COLOR.BG_WHITE, 0.98);
    painel.fillRoundedRect(
      this.scale.width / 2 - 280,
      this.scale.height / 2 - 200,
      560, 400, 25
    );
    
    // Borda do painel
    painel.lineStyle(3, COLOR.PRIMARY, 0.8);
    painel.strokeRoundedRect(
      this.scale.width / 2 - 280,
      this.scale.height / 2 - 200,
      560, 400, 25
    );

    // Header colorido
    const headerBg = this.add.graphics().setDepth(1002);
    headerBg.fillStyle(COLOR.PRIMARY);
    headerBg.fillRoundedRect(
      this.scale.width / 2 - 280,
      this.scale.height / 2 - 200,
      560, 80, { tl: 25, tr: 25, bl: 0, br: 0 }
    );

    // Ícone do título
    const iconBg = this.add.circle(this.scale.width / 2 - 180, this.scale.height / 2 - 160, 25, COLOR.BG_WHITE).setDepth(1003);
    
    // Criar ícone de engrenagem
    const gearIcon = this.add.graphics().setDepth(1004);
    gearIcon.lineStyle(3, 0x333333, 1);
    gearIcon.fillStyle(0x666666, 1);
    
    const centerX = this.scale.width / 2 - 180;
    const centerY = this.scale.height / 2 - 160;
    const outerRadius = 15;
    const innerRadius = 6;
    const teethCount = 8;
    
    // Desenhar engrenagem
    gearIcon.beginPath();
    for (let i = 0; i < teethCount * 2; i++) {
      const angle = (i * Math.PI) / teethCount;
      const radius = i % 2 === 0 ? outerRadius : innerRadius + 3;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      if (i === 0) {
        gearIcon.moveTo(x, y);
      } else {
        gearIcon.lineTo(x, y);
      }
    }
    gearIcon.closePath();
    gearIcon.fillPath();
    gearIcon.strokePath();
    
    // Círculo central
    gearIcon.fillStyle(COLOR.BG_WHITE, 1);
    gearIcon.fillCircle(centerX, centerY, innerRadius);
    gearIcon.strokeCircle(centerX, centerY, innerRadius);

    // Título
    const titulo = this.add.text(this.scale.width / 2 - 130, this.scale.height / 2 - 160, 'Configurações', {
      fontSize: '36px',
      fontFamily: 'Bobby Jones Soft, Arial, sans-serif',
      color: COLOR.TEXT_LIGHT,
      fontStyle: 'bold'
    }).setOrigin(0, 0.5).setDepth(1003);

    // Seção do Volume
    const volumeY = this.scale.height / 2 - 70;
    
    const volumeIconBg = this.add.circle(this.scale.width / 2 - 200, volumeY, 22, COLOR.SECONDARY).setDepth(1003);
    const volText = this.add.text(this.scale.width / 2 - 200, volumeY, 'VOL', {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'Arial Black'
    }).setOrigin(0.5).setDepth(1004);

    const volumeLabel = this.add.text(this.scale.width / 2 - 160, volumeY, 'Volume da Música:', {
      fontSize: '24px',
      fontFamily: 'Bobby Jones Soft, Arial, sans-serif',
      color: COLOR.TEXT_DARK,
      fontStyle: 'bold'
    }).setOrigin(0, 0.5).setDepth(1003);

    // Sistema de slider arrastável
    const saveSettings = SaveManager.load().settings || {};
    let volumeMusica = (saveSettings.musicVolume !== undefined ? saveSettings.musicVolume : parseFloat(localStorage.getItem('musicVolume') || '0.3'));
    const sliderMinX = this.scale.width / 2 - 150;
    const sliderMaxX = this.scale.width / 2 + 150;
    const sliderWidth = 300;
    let handleX = sliderMinX + (volumeMusica * sliderWidth);

    const sliderBg = this.add.graphics().setDepth(1003);
    sliderBg.fillStyle(0xe0e0e0);
    sliderBg.fillRoundedRect(sliderMinX, volumeY + 40, sliderWidth, 12, 6);
    
    const sliderActive = this.add.graphics().setDepth(1003);
    sliderActive.fillStyle(COLOR.SECONDARY);
    sliderActive.fillRoundedRect(sliderMinX, volumeY + 40, volumeMusica * sliderWidth, 12, 6);

    const volumeValueBg = this.add.graphics().setDepth(1003);
    volumeValueBg.fillStyle(COLOR.ACCENT);
    volumeValueBg.fillRoundedRect(this.scale.width / 2 + 170, volumeY + 30, 80, 32, 16);

    const volumeTexto = this.add.text(
      this.scale.width / 2 + 210, volumeY + 46,
      Math.round(volumeMusica * 100) + '%', { 
        fontSize: '20px', 
        fontFamily: 'Bobby Jones Soft, Arial, sans-serif',
        color: COLOR.TEXT_LIGHT,
        fontStyle: 'bold'
      }
    ).setOrigin(0.5).setDepth(1004);
    
    // Handle do slider arrastável
    const sliderHandle = this.add.container(handleX, volumeY + 46).setDepth(1005);
    const handleBg = this.add.circle(0, 0, 18, COLOR.BG_WHITE);
    const handleBorder = this.add.circle(0, 0, 18).setStrokeStyle(4, COLOR.SECONDARY);
    sliderHandle.add([handleBg, handleBorder]);
    sliderHandle.setSize(36, 36);
    sliderHandle.setInteractive({ draggable: true, useHandCursor: true });

    // Função para atualizar slider
    const updateSlider = (newX) => {
      const clampedX = Math.max(sliderMinX, Math.min(sliderMaxX, newX));
      handleX = clampedX;
      sliderHandle.x = handleX;
      
      volumeMusica = (clampedX - sliderMinX) / sliderWidth;
      const percentage = Math.round(volumeMusica * 100);
      volumeTexto.setText(percentage + '%');
      
      sliderActive.clear();
      sliderActive.fillStyle(COLOR.SECONDARY);
      sliderActive.fillRoundedRect(sliderMinX, volumeY + 40, (clampedX - sliderMinX), 12, 6);
      
      localStorage.setItem('musicVolume', volumeMusica.toString());
      try {
        const save = SaveManager.load();
        save.settings.musicVolume = volumeMusica;
        SaveManager.save(save);
      } catch (e) {}
      
      // Atualizar volume da música atual
      if (this.musicaInicio) {
        this.musicaInicio.setVolume(volumeMusica);
      }
    };

    // Eventos do slider para arrastar
    let isDragging = false;
    
    sliderHandle.on('pointerdown', () => {
      isDragging = true;
      console.log('Iniciando arraste do slider');
    });

    // Listener global para movimento do mouse/touch
    this.input.on('pointermove', (pointer) => {
      if (isDragging) {
        updateSlider(pointer.x);
      }
    });

    // Listener global para soltar o mouse/touch
    this.input.on('pointerup', () => {
      if (isDragging) {
        console.log('Parando arraste do slider');
        isDragging = false;
      }
    });

    // Clique na trilha para mover o handle diretamente
    const sliderArea = this.add.zone(
      this.scale.width / 2, volumeY + 46, 320, 40
    ).setInteractive({ useHandCursor: true }).setDepth(1003);

    sliderArea.on('pointerdown', (pointer) => {
      console.log('Clicou na trilha do slider');
      updateSlider(pointer.x);
    });

    // Botão Fechar
    const buttonsY = this.scale.height / 2 + 120;
    
    const fecharBg = this.add.graphics().setDepth(1003);
    fecharBg.fillStyle(COLOR.DANGER);
    fecharBg.fillRoundedRect(this.scale.width / 2 - 70, buttonsY - 25, 140, 50, 15);
    fecharBg.setInteractive(
      new Phaser.Geom.Rectangle(this.scale.width / 2 - 70, buttonsY - 25, 140, 50),
      Phaser.Geom.Rectangle.Contains,
      { useHandCursor: true }
    );

    const fecharTexto = this.add.text(this.scale.width / 2, buttonsY, 'FECHAR', {
      fontSize: '20px',
      fontFamily: 'Arial Black',
      color: COLOR.TEXT_LIGHT,
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(1004);

    // Armazenar referências para limpeza
    const modalElements = [overlay, painel, headerBg, iconBg, gearIcon, titulo, volumeIconBg, volText, volumeLabel, sliderBg, sliderActive, volumeValueBg, volumeTexto, sliderHandle, sliderArea, fecharBg, fecharTexto];

    // Limpar listeners específicos do modal quando fechar
    const cleanupModalListeners = () => {
      this.input.off('pointermove');
      this.input.off('pointerup');
    };

    // Evento do botão fechar
    fecharBg.on('pointerdown', () => {
      console.log('Fechando modal de configuração...');
      
      // Limpar listeners específicos
      cleanupModalListeners();
      
      // Salvar configurações
      localStorage.setItem('musicVolume', volumeMusica.toString());
      try {
        const save = SaveManager.load();
        save.settings.musicVolume = volumeMusica;
        SaveManager.save(save);
      } catch (e) {}
      
      // Retomar música
      if (this.musicaInicio && this.musicaInicio.isPaused) {
        this.musicaInicio.setVolume(volumeMusica);
        this.musicaInicio.resume();
      }
      
      // Remover todos os elementos do modal
      modalElements.forEach(element => {
        if (element && element.destroy) {
          element.destroy();
        }
      });
      
      // Reset da flag
      this._configModal = false;
      this._openingConfig = false;
    });

    // Animação de entrada
    modalElements.forEach(element => {
      if (element && element.setAlpha) {
        element.setAlpha(0);
        this.tweens.add({
          targets: element,
          alpha: 1,
          duration: 300,
          ease: 'Back.Out'
        });
      }
    });

    // Inicializar slider com valor salvo
    updateSlider(handleX);
  }

  // Método chamado quando a cena é destruída ou pausada
  shutdown() {
    console.log('StartScene: shutdown iniciado');
    
    // Reset das flags
    this._configModal = false;
    this._openingConfig = false;
    this._transitioning = false;
    
    // Parar e destruir música completamente
    if (this.musicaInicio) {
      console.log('StartScene: parando música no shutdown');
      this.musicaInicio.stop();
      this.musicaInicio.destroy();
      this.musicaInicio = null;
    }
    
    console.log('StartScene: shutdown completo');
  }
}
