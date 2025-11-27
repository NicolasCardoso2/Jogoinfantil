import SaveManager from '../services/savemanager.js';
import SaveDebugPanel from '../ui/savedebugpanel.js';

// ====== CONSTANTES DE LAYOUT ======
const SIZES = {
  slot: 180,   // Tamanho dos slots de insígnias
  badge: 180,  // Tamanho das insígnias
  node: 120    // Diâmetro dos nós do mapa de fases (círculos das fases)
};
const DEBUG_SLOTS = false;

export default class FaseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'fasescene' });

    // Cores principais do layout
    this.corFundo = 0xf5f7fb;
    this.corAppBar = 0x2e7d32;
    this.corCard = 0xffffff;
  }

  preload() {
    // Ícones das fases
    if (!this.textures.exists('FASE1')) {
      this.load.image('FASE1', 'assets/FASE1.png');
    }
    if (!this.textures.exists('FASE2')) {
      this.load.image('FASE2', 'assets/FASE2.png');
    }
    if (!this.textures.exists('FASE3')) {
      this.load.image('FASE3', 'assets/FASE3.png');
    }
    if (!this.textures.exists('FASE4')) {
      this.load.image('FASE4', 'assets/FASE4.png');
    }

    // Insígnias Bosque do B
    if (!this.textures.exists('insignia_b_1')) {
      this.load.image('insignia_b_1', 'assets/insignias/insignia_b_1.png');
    }
    if (!this.textures.exists('insignia_b_2')) {
      this.load.image('insignia_b_2', 'assets/insignias/insignia_b_2.png');
    }
    if (!this.textures.exists('insignia_b_3')) {
      this.load.image('insignia_b_3', 'assets/insignias/insignia_b_3.png');
    }

    // Insígnias Castelo do C
    if (!this.textures.exists('insignia_c_1')) {
      this.load.image('insignia_c_1', 'assets/insignias/insignia_c_1.png');
    }
    if (!this.textures.exists('insignia_c_2')) {
      this.load.image('insignia_c_2', 'assets/insignias/insignia_c_2.png');
    }
    if (!this.textures.exists('insignia_c_3')) {
      this.load.image('insignia_c_3', 'assets/insignias/insignia_c_3.png');
    }

    // Insígnias Mundo Dino do D  (nomes com D maiúsculo, como estão nas imagens)
    if (!this.textures.exists('insignia_D_1')) {
      this.load.image('insignia_D_1', 'assets/insignias/insignia_D_1.png');
    }
    if (!this.textures.exists('insignia_D_2')) {
      this.load.image('insignia_D_2', 'assets/insignias/insignia_D_2.png');
    }
    if (!this.textures.exists('insignia_D_3')) {
      this.load.image('insignia_D_3', 'assets/insignias/insignia_D_3.png');
    }

    // Insígnias Fazenda do F  (nomes com F maiúsculo, como estão nas imagens)
    if (!this.textures.exists('insignia_F_1')) {
      this.load.image('insignia_F_1', 'assets/insignias/insignia_F_1.png');
    }
    if (!this.textures.exists('insignia_F_2')) {
      this.load.image('insignia_F_2', 'assets/insignias/insignia_F_2.png');
    }
    if (!this.textures.exists('insignia_F_3')) {
      this.load.image('insignia_F_3', 'assets/insignias/insignia_F_3.png');
    }

    // Botões de UI criados com gráficos (não precisam de imagens)
    
    // Música de fundo
    this.load.audio('musica_fases', 'assets/sons/escolha_de_fases.mp3');
  }

  create() {
    // Fade in suave ao entrar na cena
    this.cameras.main.fadeIn(300, 245, 247, 251);

    // ====== DEBUG DE CENAS ======
    console.log('FaseScene iniciada');
    console.log('Cenas registradas:', this.scene.manager.keys);
    console.log('window.mudarCenaComFade disponível:', !!window.mudarCenaComFade);

    // ====== NAVEGAÇÃO ENTRE CENAS ======
    // Reset das flags sempre que a cena é criada
    this._mudandoDeFase = false;
    this._transitioning = false;
    
    // Música de fundo - garantir que só há uma instância
    if (this.musicaFases) {
      this.musicaFases.stop();
      this.musicaFases.destroy();
      this.musicaFases = null;
    }
    
    const saveSettings = SaveManager.load().settings || {};
    const volumeSalvo = (saveSettings.musicVolume !== undefined ? saveSettings.musicVolume : parseFloat(localStorage.getItem('musicVolume') || '0.25'));
    this.musicaFases = this.sound.add('musica_fases', {
      volume: volumeSalvo,
      loop: true
    });
    this.musicaFases.play();
    console.log('Música do FaseScene iniciada');
    
    // Timer de segurança para reset da flag (caso algo dê errado)
    this.time.delayedCall(3000, () => {
      this._mudandoDeFase = false;
    });
    
    // Função local para mudança de cena com fade
    this.mudarCenaComFadeLocal = (nomeDaProximaCena) => {
      console.log('=== FUNÇÃO LOCAL mudarCenaComFadeLocal ===');
      console.log('De:', this.scene.key, 'Para:', nomeDaProximaCena);
      
      if (this._transitioning) {
        console.log('Transição já em andamento, ignorando');
        return;
      }
      
      this._transitioning = true;
      console.log('Iniciando fade out...');
      
      // Fade out da cena atual
      this.cameras.main.fadeOut(300, 245, 247, 251);
      
      // Quando o fade out completar, muda para a próxima cena
      this.cameras.main.once('camerafadeoutcomplete', () => {
        console.log('Fade out completo, iniciando:', nomeDaProximaCena);
        this._transitioning = false;
        this.scene.start(nomeDaProximaCena);
      });
    };

    this.goToFase = (index, state) => {
      if (state === 'locked') {
        this.showLockedMessage(index);
        return;
      }
      
      if (this._mudandoDeFase) {
        console.log('Já está mudando de fase, ignorando');
        return;
      }
      
      this._mudandoDeFase = true;
      console.log(`Navegando para fase ${index}`);

      // Parar música do FaseScene antes de entrar na fase
      if (this.musicaFases && this.musicaFases.isPlaying) {
        console.log('Parando música do FaseScene ao entrar na fase...');
        this.musicaFases.stop();
        this.musicaFases.destroy();
        this.musicaFases = null;
      }

      try {
        let targetScene = null;
        switch (index) {
          case 1: targetScene = 'fase1_atividades'; break;
          case 2: targetScene = 'fase2_atividades'; break;
          case 3: targetScene = 'fase3_atividades'; break;
          case 4: targetScene = 'fase4_atividades'; break;
          default: 
            this._mudandoDeFase = false;
            return;
        }

        console.log(`Navegando para ${targetScene}`);
        
        // Navegação com fade original
        if (window.mudarCenaComFade && typeof window.mudarCenaComFade === 'function') {
          window.mudarCenaComFade(this, targetScene);
        } else {
          console.log('Fallback: usando scene.start');
          this.scene.start(targetScene);
        }
        
        this.events.emit('abrirAtividade', index);
      } catch (error) {
        console.error('Erro ao navegar:', error);
        // Reset da flag em caso de erro
        this._mudandoDeFase = false;
      }
    };

    // ========= FUNÇÃO PARA DESCOBRIR QUAL INSÍGNIA USAR =========
    this.getBadgeKey = (faseIndex, stars) => {
      const sNum = Number(stars) || 0;

      // Se não tem estrelas, não mostra insígnia ainda
      if (sNum <= 0) return null;

      // Garante que vai de 1 a 3
      const s = Math.min(3, sNum);

      // Prefixo muda conforme a fase
      let prefix = null;
      switch (faseIndex) {
        case 1: prefix = 'b'; break;   // Bosque do B -> insignia_b_1,2,3
        case 2: prefix = 'c'; break;   // Castelo do C -> insignia_c_1,2,3
        case 3: prefix = 'D'; break;   // Mundo Dino do D -> insignia_D_1,2,3
        case 4: prefix = 'F'; break;   // Fazenda do F -> insignia_F_1,2,3
        default: return null;
      }

      return `insignia_${prefix}_${s}`;
    };

    // ========= FUNÇÃO UTILITÁRIA PARA INSÍGNIAS =========
    this.placeBadgeInSlot = (slotIndex, textureKey) => {
      if (!this.slots || !Array.isArray(this.slots) || !this.slots[slotIndex]) return;
      const slot = this.slots[slotIndex];
      if (!this.textures.exists(textureKey)) return;

      // Remove insígnia antiga, se houver
      if (slot.badge) {
        try { slot.badge.destroy(); } catch {}
        slot.badge = null;
      }

      // Cria nova insígnia centralizada e grande
      const badge = this.add.image(slot.x, slot.y, textureKey).setDepth(22);
      try {
        const src = this.textures.get(textureKey).getSourceImage();
        const maxSize = SIZES.slot * 1.10;
        const scale = Math.min(maxSize / src.width, maxSize / src.height);
        badge.setScale(scale);
      } catch {}

      slot.badge = badge;
    };

    // ========= ESTRELAS / SAVE MANAGER =========
    const saveState = SaveManager.load();
    const progress = saveState.progress || {};
    const faseStars = {
      1: (progress.B && progress.B.bestStars) || 0,
      2: (progress.C && progress.C.bestStars) || 0,
      3: (progress.D && progress.D.bestStars) || 0,
      4: (progress.F && progress.F.bestStars) || 0
    };

    const badgeKeys = {
      1: progress.B?.badgeUnlocked ? this.getBadgeKey(1, faseStars[1]) : null,
      2: progress.C?.badgeUnlocked ? this.getBadgeKey(2, faseStars[2]) : null,
      3: progress.D?.badgeUnlocked ? this.getBadgeKey(3, faseStars[3]) : null,
      4: progress.F?.badgeUnlocked ? this.getBadgeKey(4, faseStars[4]) : null
    };

// ====== FUNÇÃO PARA MOSTRAR MENSAGEM DE FASE BLOQUEADA ======
    this.showLockedMessage = (faseIndex) => {
      const message = this.add.text(
        this.scale.width / 2,
        this.scale.height / 2,
        `Termine a fase ${faseIndex - 1} primeiro`,
        {
          fontFamily: 'Comic Sans MS',
          fontSize: '24px',
          color: '#ffffff',
          backgroundColor: '#f44336',
          padding: { x: 20, y: 10 },
          borderRadius: 10
        }
      ).setOrigin(0.5).setDepth(1000).setAlpha(0);
      
      this.tweens.add({
        targets: message,
        alpha: 1,
        y: message.y - 20,
        duration: 300,
        ease: 'Back.Out',
        onComplete: () => {
          this.time.delayedCall(2000, () => {
            this.tweens.add({
              targets: message,
              alpha: 0,
              y: message.y - 10,
              duration: 200,
              onComplete: () => message.destroy()
            });
          });
        }
      });
    };
    
    // ====== ANIMAÇÕES DAS INSÍGNIAS DE TODAS AS FASES ======
    this._awardRunning = { 1: false, 2: false, 3: false, 4: false };
    
    // Função genérica para animar qualquer insígnia
    this.awardFase = (faseIndex, starsParam) => {
      if (this._awardRunning[faseIndex]) return;
      this._awardRunning[faseIndex] = true;

      const stored = faseStars[faseIndex];
      const stars = Math.max(stored, starsParam || stored);
      if (stars <= 0) {
        this._awardRunning[faseIndex] = false;
        return;
      }

      const key = this.getBadgeKey(faseIndex, stars);
      localStorage.setItem(`fase${faseIndex}Stars`, String(stars));

      const slotIndex = faseIndex - 1; // fase 1 -> slot 0, fase 2 -> slot 1, etc.
      const targetSlot = this.slots[slotIndex];
      if (!targetSlot || !this.textures.exists(key)) {
        this._awardRunning[faseIndex] = false;
        return;
      }

      // Remove insígnia fixa do slot antes de animar
      if (targetSlot.badge) {
        try { targetSlot.badge.destroy(); } catch {}
        targetSlot.badge = null;
      }

      // Cria sprite da insígnia no centro da tela
      const startX = this.scale.width / 2;
      const startY = this.scale.height / 2;
      const fly = this.add.image(startX, startY, key).setDepth(100);

      let finalScale = 1;
      let bigScale = 1;
      try {
        const src = this.textures.get(key).getSourceImage();
        const maxSize = SIZES.slot * 1.10;
        finalScale = Math.min(maxSize / src.width, maxSize / src.height);
        bigScale = finalScale * 2.2;
      } catch {}

      fly.setAlpha(0);
      fly.setScale(0.2 * finalScale);

      // 1) aparece grande
      this.tweens.add({
        targets: fly,
        alpha: 1,
        scale: bigScale,
        duration: 500,
        ease: 'Back.Out',
        onComplete: () => {
          // 2) pequena pausa
          this.time.delayedCall(800, () => {
            // 3) voa até o slot
            this.tweens.add({
              targets: fly,
              x: targetSlot.x,
              y: targetSlot.y,
              scale: finalScale,
              duration: 800,
              ease: 'Cubic.Out',
              onComplete: () => {
                // 4) pulinho final
                this.tweens.add({
                  targets: fly,
                  scale: { from: finalScale, to: finalScale * 1.08 },
                  yoyo: true,
                  duration: 180,
                  ease: 'Back.Out',
                  onComplete: () => {
                    this.placeBadgeInSlot(slotIndex, key);
                    try { fly.destroy(); } catch {}
                    this._awardRunning[faseIndex] = false;
                    localStorage.setItem(`fase${faseIndex}ShouldAnimate`, '0');
                  }
                });
              }
            });
          });
        }
      });
    };

    // Função específica para fase 1 (compatibilidade)
    this.awardFase1 = (starsParam) => {
      this.awardFase(1, starsParam);
    };

    // Verifica quais insígnias devem ser animadas
    const shouldAnimate = {
      1: localStorage.getItem('fase1ShouldAnimate') === '1',
      2: localStorage.getItem('fase2ShouldAnimate') === '1',
      3: localStorage.getItem('fase3ShouldAnimate') === '1',
      4: localStorage.getItem('fase4ShouldAnimate') === '1'
    };

    // Listener quando uma fase for concluída (outros arquivos podem emitir esse evento)
    this.events.on('faseConcluida', (numeroFase, estrelas) => {
      this.marcarFaseConcluida(numeroFase, estrelas);
    });

    // Patch para acentos (compatibilidade)
    if (!this._fmPatched) {
      const _text = this.add.text.bind(this.add);
      this.add.text = (x, y, t, style) =>
        _text(x, y, (window.fixMojibake ? window.fixMojibake(String(t)) : String(t)), style);
      this._fmPatched = true;
    }

    // ====== LAYOUT PRINCIPAL ======
    const W = this.scale.width;
    const H = this.scale.height;
    const APPBAR = 120;
    const M = 28;

    this.cameras.main.setBackgroundColor(this.corFundo);

    // Barra superior
    this.add
      .rectangle(0, 0, W, APPBAR, this.corAppBar)
      .setOrigin(0, 0);

    this.add
      .text(W / 2, APPBAR / 2, 'APRENDENDO SÍLABAS', {
        fontFamily: 'Comic Sans MS',
        fontSize: '40px',
        color: '#ffffff',
        fontStyle: 'bold'
      })
      .setOrigin(0.5);

    // >>> BOTÕES VOLTAR E CONFIG NA APPBAR <<<
    this.makeRoundIconButton(
      M + 50, // Ajustado para acomodar botáo maior
      APPBAR / 2,
      () => {
        console.log('Clicou no botão home - tentando voltar para StartScene');
        
        // Parar música do FaseScene antes de navegar
        if (this.musicaFases && this.musicaFases.isPlaying) {
          console.log('Parando música do FaseScene...');
          this.musicaFases.stop();
          this.musicaFases.destroy();
          this.musicaFases = null;
        }
        
        console.log('window.mudarCenaComFade existe:', !!window.mudarCenaComFade);
        console.log('Cenas disponíveis:', this.scene.manager.keys);
        
        // Resetar flag de navegação
        this._mudandoDeFase = false;
        
        try {
          console.log('Tentando usar window.mudarCenaComFade...');
          
          // Usar função local para garantir que funciona
          this.mudarCenaComFadeLocal('startscene');
          
        } catch (error) {
          console.error('Erro ao navegar para home:', error);
          console.log('Usando fallback direto...');
          this.scene.start('startscene');
        }
      },
      'back'
    );
    this.makeRoundIconButton(
      W - M - 50, // Ajustado para acomodar botão maior
      APPBAR / 2,
      () => {
        // Proteção contra cliques múltiplos
        if (this._openingConfig) {
          console.log('Configurações já estão sendo abertas, ignorando');
          return;
        }
        this._openingConfig = true;
        
        console.log('Abrindo configurações do FaseScene');
        
        // Pausar música enquanto estiver nas configurações
        if (this.musicaFases && this.musicaFases.isPlaying) {
          this.musicaFases.pause();
        }
        
        // Criar ConfigScene como modal overlay
        this.createConfigModal();
        
        // Reset da flag após um delay
        this.time.delayedCall(500, () => {
          this._openingConfig = false;
        });
      },
      'gear'
    );

    // Card do mapa de fases (esquerda)
    const cardX = M;
    const cardY = APPBAR + M;
    const cardW = W * 0.60;
    const cardH = H - cardY - M;

    const card = this.add.graphics();
    card.fillStyle(0x000000, 0.06).fillRoundedRect(cardX + 6, cardY + 6, cardW, cardH, 24);
    card.fillStyle(this.corCard, 1).fillRoundedRect(cardX, cardY, cardW, cardH, 24);

    // Título "ESCOLHA UMA FASE"
    this.add
      .text(cardX + 32, cardY + 24, 'ESCOLHA UMA FASE', {
        fontFamily: 'Comic Sans MS',
        fontSize: '30px',
        fontStyle: 'bold',
        color: '#2e7d32'
      })
      .setOrigin(0, 0);

    // Card das insígnias (direita)
    const badgeCardX = cardX + cardW + M;
    const badgeCardW = W - badgeCardX - M;
    const badgeCardH = cardH;

    const badgeCard = this.add.graphics();
    badgeCard
      .fillStyle(0x000000, 0.06)
      .fillRoundedRect(badgeCardX + 6, cardY + 6, badgeCardW, badgeCardH, 24);
    badgeCard
      .fillStyle(this.corCard, 1)
      .fillRoundedRect(badgeCardX, cardY, badgeCardW, badgeCardH, 24);

    this.add
      .text(badgeCardX + badgeCardW / 2, cardY + 20, 'INSÍGNIAS', {
        fontFamily: 'Comic Sans MS',
        fontSize: '36px',
        fontStyle: 'bold',
        color: '#2e7d32',
        align: 'center'
      })
      .setOrigin(0.5, 0);

    // ====== GRID DE SLOTS DE INSÍGNIAS (2x2) ======
    this.slots = [];

    const gridW = 2 * SIZES.slot + 24;
    const gridX = badgeCardX + (badgeCardW - gridW) / 2;
    const gridY = cardY + 100;

    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 2; c++) {
        const x = gridX + c * (SIZES.slot + 24);
        const y = gridY + r * (SIZES.slot + 24);
        const cx = x + SIZES.slot / 2;
        const cy = y + SIZES.slot / 2;

        if (DEBUG_SLOTS) {
          const gSlot = this.add.graphics({ depth: 20 });
          gSlot.lineStyle(2, 0xff0000, 1);
          gSlot.strokeCircle(cx, cy, 26);
        }

        this.slots.push({ x: cx, y: cy, badge: null });
      }
    }

    this.add
      .text(
        badgeCardX + badgeCardW / 2,
        cardY + badgeCardH - 32,
        'Ganhe insígnias!',
        {
          fontFamily: 'Comic Sans MS',
          fontSize: '20px',
          color: '#777777',
          align: 'center',
          wordWrap: { width: badgeCardW - 40 }
        }
      )
      .setOrigin(0.5)
      .setDepth(21);

    // ====== APLICA INSÍGNIAS NOS SLOTS (FIXO OU ANIMADO) ======
    // Primeiro coloca todas as insígnias que já existem (sem animação)
    for (let fase = 1; fase <= 4; fase++) {
      const slotIndex = fase - 1;
      if (badgeKeys[fase] && !shouldAnimate[fase]) {
        // Coloca direto no slot as insígnias que já existiam
        this.placeBadgeInSlot(slotIndex, badgeKeys[fase]);
      }
    }
    
    // Depois anima apenas as novas insígnias (uma por vez)
    let animationDelay = 400;
    for (let fase = 1; fase <= 4; fase++) {
      if (badgeKeys[fase] && shouldAnimate[fase]) {
        // Anima apenas a nova insígnia com delay escalonado
        this.time.delayedCall(animationDelay, () => this.awardFase(fase, faseStars[fase]), [], this);
        animationDelay += 200; // Próxima animação 200ms depois (caso haja mais de uma nova)
      }
    }

    // ====== MAPA DE FASES (ESQUERDA) ======
    const p1 = { x: cardX + cardW * 0.23, y: cardY + cardH * 0.32 };
    const p2 = { x: cardX + cardW * 0.77, y: cardY + cardH * 0.32 };
    const p3 = { x: cardX + cardW * 0.27, y: cardY + cardH * 0.72 };
    const p4 = { x: cardX + cardW * 0.78, y: cardY + cardH * 0.72 };

    // Trilhas entre os nós
    const trilha = this.add.graphics().setDepth(4);
    trilha.lineStyle(8, 0xd0d9e8, 1);

    const curva12 = new Phaser.Curves.QuadraticBezier(
      new Phaser.Math.Vector2(p1.x, p1.y),
      new Phaser.Math.Vector2((p1.x + p2.x) / 2, p1.y - cardH * 0.16),
      new Phaser.Math.Vector2(p2.x, p2.y)
    );
    const curva32 = new Phaser.Curves.QuadraticBezier(
      new Phaser.Math.Vector2(p3.x, p3.y),
      new Phaser.Math.Vector2((p3.x + p2.x) / 2, p3.y - cardH * 0.18),
      new Phaser.Math.Vector2(p2.x, p2.y)
    );

    curva12.draw(trilha, 24);
    curva32.draw(trilha, 24);
    trilha.lineBetween(p3.x, p3.y, p4.x, p4.y);

    // Texto removido para simplificar a interface

    // ====== ESTADOS DAS FASES (DESBLOQUEIO EM CADEIA) ======
    const state1 = (progress.B?.unlocked !== false) ? 'unlocked' : 'locked';
    const state2 = progress.C?.unlocked ? 'unlocked' : 'locked';
    const state3 = progress.D?.unlocked ? 'unlocked' : 'locked';
    const state4 = progress.F?.unlocked ? 'unlocked' : 'locked';
    
    console.log('Estados das fases:', { state1, state2, state3, state4 });
    console.log('Estrelas das fases:', faseStars);

    // ====== FUNÇÃO PARA CRIAR NÓS DO MAPA ======
    this.makeNode = (pos, index, state, iconKey) => {
      // Sombra
      this.add.circle(pos.x + 4, pos.y + 6, SIZES.node / 2, 0x000000, 0.16).setDepth(5);

      // Círculo principal
      const ring = this.add.circle(pos.x, pos.y, SIZES.node / 2, 0xffffff).setDepth(6);
      ring.setStrokeStyle(6, state === 'locked' ? 0x90a4ae : 0x2e7d32);
      
      // Adicionar indicador visual para fases desbloqueadas
      if (state === 'unlocked') {
        const glow = this.add.circle(pos.x, pos.y, SIZES.node / 2 + 8, 0x4caf50, 0.2).setDepth(5);
        // Animação sutil de pulso para fases disponíveis
        this.tweens.add({
          targets: glow,
          alpha: { from: 0.2, to: 0.4 },
          scale: { from: 1, to: 1.05 },
          duration: 1500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }

      // Ícone da fase (bem maior que o círculo)
      let icon = null;
      if (iconKey && this.textures.exists(iconKey)) {
        icon = this.add.image(pos.x, pos.y, iconKey).setDepth(15);
        let baseScale = 1;
        try {
          const src = this.textures.get(iconKey).getSourceImage();
          const maxSize = SIZES.node * 1.50; // 50% maior que o círculo
          baseScale = Math.min(maxSize / src.width, maxSize / src.height);
        } catch {}
        icon.setScale(baseScale);
        icon.setAlpha(state === 'locked' ? 0.35 : 1);
        icon._baseScale = baseScale; // Guarda a escala base para animações
      }

      // Interatividade - área maior para facilitar o clique
      const zoneSize = SIZES.node + 20; // 20px a mais de área clicável
      const zone = this.add
        .zone(pos.x, pos.y, zoneSize, zoneSize)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: state === 'unlocked' });

      zone.on('pointerdown', () => {
        console.log(`Clicou na fase ${index}, estado: ${state}`);
        this.goToFase(index, state);
      });
      
      // Adicionar feedback visual de clique
      zone.on('pointerdown', () => {
        if (state === 'unlocked') {
          // Animação do círculo no clique
          this.tweens.add({
            targets: ring,
            scale: 0.95,
            duration: 100,
            yoyo: true,
            ease: 'Power2'
          });
          
          // Animação da imagem no clique
          if (icon && icon._baseScale) {
            this.tweens.add({
              targets: icon,
              scale: icon._baseScale * 0.90, // Diminui um pouco no clique
              duration: 100,
              yoyo: true,
              ease: 'Power2'
            });
          }
        }
      });

      if (state === 'unlocked') {
        zone.on('pointerover', () => {
          ring.setFillStyle(0xe8f5e9, 1);
          
          // Animação do círculo
          this.tweens.add({
            targets: ring,
            scale: 1.06,
            duration: 200,
            ease: 'Back.Out'
          });
          
          // Animação da imagem (expansão maior)
          if (icon && icon._baseScale) {
            this.tweens.add({
              targets: icon,
              scale: icon._baseScale * 1.15, // 15% maior no hover
              duration: 200,
              ease: 'Back.Out'
            });
          }
        });

        zone.on('pointerout', () => {
          ring.setFillStyle(0xffffff, 1);
          
          // Volta animação do círculo
          this.tweens.add({
            targets: ring,
            scale: 1,
            duration: 200,
            ease: 'Back.Out'
          });
          
          // Volta animação da imagem
          if (icon && icon._baseScale) {
            this.tweens.add({
              targets: icon,
              scale: icon._baseScale, // Volta ao tamanho base
              duration: 200,
              ease: 'Back.Out'
            });
          }
        });
      }
    };

    // Criação dos 4 nós com os ícones novos
    this.makeNode(p1, 1, state1, 'FASE1');
    this.makeNode(p2, 2, state2, 'FASE2');
    this.makeNode(p3, 3, state3, 'FASE3');
    this.makeNode(p4, 4, state4, 'FASE4');

    // Painel de debug do save (tecla P)
    this.saveDebugPanel = new SaveDebugPanel(this, {
      currentPhaseLetter: 'B',
      onChange: () => { try { this.scene.restart(); } catch (e) {} }
    });
  }

  // Quando alguma fase termina, outros arquivos podem emitir: this.scene.get('fasescene').events.emit('faseConcluida', numeroFase, estrelas);
  marcarFaseConcluida(numeroFase, estrelas) {
    const n = Number(numeroFase) || 0;
    const s = Math.max(0, Number(estrelas) || 0);
    const letter = PHASE_LETTERS[n];

    if (n < 1 || n > 4 || s <= 0 || !letter) return;

    SaveManager.updatePhase(letter, { starsEarnedThisRun: s });

    // Marca para animar quando voltar ao FaseScene e executa anima??o
    localStorage.setItem(`fase${n}ShouldAnimate`, '1');
    
    if (typeof this.awardFase === 'function') {
      this.awardFase(n, s);
    } else {
      // Fallback para colocar direto se n?o conseguir animar
      const key = this.getBadgeKey(n, s);
      const slotIndex = n - 1;
      if (key) {
        this.placeBadgeInSlot(slotIndex, key);
      }
    }
  }
makeRoundIconButton(x, y, onClick, kind = 'back') {
    const buttonRadius = 38;
    const g = this.add.graphics({ depth: 12 });

    // Sombra
    g.fillStyle(0x000000, 0.18);
    g.fillCircle(x + 3, y + 4, buttonRadius);

    // Círculo principal
    g.fillStyle(0xffffff, 1);
    g.fillCircle(x, y, buttonRadius);

    // Borda
    g.lineStyle(4, this.corAppBar, 1);
    g.strokeCircle(x, y, buttonRadius);

    // Criar ícone com gráficos
    const icon = this.add.graphics({ depth: 13 });
    icon.lineStyle(3, this.corAppBar, 1);
    icon.fillStyle(this.corAppBar, 1);

    if (kind === 'back') {
      // Ícone de casa (home) - design melhorado e mais bonito
      const size = 26;
      
      // Definir dimensões proporcionais
      const houseWidth = size;
      const houseHeight = size * 0.65;
      const roofHeight = size * 0.4;
      
      // Coordenadas base
      const baseY = y + size * 0.1; // Centralizar melhor
      const roofY = baseY - houseHeight/2;
      
      // Base da casa (corpo principal)
      icon.fillRect(x - houseWidth/2, baseY - houseHeight/2, houseWidth, houseHeight);
      
      // Telhado triangular mais bonito
      icon.beginPath();
      icon.moveTo(x - houseWidth/2 - 2, roofY);
      icon.lineTo(x, roofY - roofHeight);
      icon.lineTo(x + houseWidth/2 + 2, roofY);
      icon.closePath();
      icon.fillPath();
      
      // Porta principal
      icon.fillStyle(0xffffff, 1);
      const doorWidth = houseWidth * 0.28;
      const doorHeight = houseHeight * 0.65;
      const doorX = x - doorWidth/2;
      const doorY = baseY + houseHeight/2 - doorHeight;
      icon.fillRoundedRect(doorX, doorY, doorWidth, doorHeight, 2);
      
      // Maçaneta da porta
      icon.fillStyle(this.corAppBar, 1);
      icon.fillCircle(doorX + doorWidth * 0.75, doorY + doorHeight/2, 1.5);
      
      // Janelas simétricas
      icon.fillStyle(0xffffff, 1);
      const windowSize = houseWidth * 0.16;
      const windowY = baseY - houseHeight * 0.15;
      
      // Janela esquerda
      icon.fillRoundedRect(x - houseWidth/2 + houseWidth * 0.15, windowY, windowSize, windowSize, 1);
      
      // Janela direita
      icon.fillRoundedRect(x + houseWidth/2 - houseWidth * 0.15 - windowSize, windowY, windowSize, windowSize, 1);
      
      // Divisórias das janelas (cruz pequena)
      icon.lineStyle(1, this.corAppBar, 1);
      // Janela esquerda
      const leftWinX = x - houseWidth/2 + houseWidth * 0.15 + windowSize/2;
      icon.lineBetween(leftWinX, windowY, leftWinX, windowY + windowSize);
      icon.lineBetween(x - houseWidth/2 + houseWidth * 0.15, windowY + windowSize/2, 
                      x - houseWidth/2 + houseWidth * 0.15 + windowSize, windowY + windowSize/2);
      
      // Janela direita  
      const rightWinX = x + houseWidth/2 - houseWidth * 0.15 - windowSize/2;
      icon.lineBetween(rightWinX, windowY, rightWinX, windowY + windowSize);
      icon.lineBetween(x + houseWidth/2 - houseWidth * 0.15 - windowSize, windowY + windowSize/2,
                      x + houseWidth/2 - houseWidth * 0.15, windowY + windowSize/2);
    } else if (kind === 'gear') {
      // Ícone de engrenagem
      const outerRadius = 15;
      const innerRadius = 6;
      const teethCount = 8;
      
      icon.beginPath();
      for (let i = 0; i < teethCount * 2; i++) {
        const angle = (i * Math.PI) / teethCount;
        const radius = i % 2 === 0 ? outerRadius : innerRadius + 3;
        const px = x + Math.cos(angle) * radius;
        const py = y + Math.sin(angle) * radius;
        
        if (i === 0) {
          icon.moveTo(px, py);
        } else {
          icon.lineTo(px, py);
        }
      }
      icon.closePath();
      icon.fillPath();
      icon.strokePath();
      
      // Círculo central
      icon.fillStyle(0xffffff, 1);
      icon.fillCircle(x, y, innerRadius);
      icon.strokeCircle(x, y, innerRadius);
    }

    const zone = this.add
      .zone(x, y, buttonRadius * 2, buttonRadius * 2)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    zone.on('pointerdown', onClick);

    return { g, zone, icon };
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

    // Sistema de slider
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
    
    // Handle do slider
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
      if (this.musicaFases) {
        this.musicaFases.setVolume(volumeMusica);
      }
    };

    // Eventos do slider
    let isDragging = false;
    
    sliderHandle.on('pointerdown', () => {
      isDragging = true;
    });

    this.input.on('pointermove', (pointer) => {
      if (isDragging) {
        updateSlider(pointer.x);
      }
    });

    this.input.on('pointerup', () => {
      isDragging = false;
    });

    const sliderArea = this.add.zone(
      this.scale.width / 2, volumeY + 46, 320, 40
    ).setInteractive({ useHandCursor: true }).setDepth(1003);

    sliderArea.on('pointerdown', (pointer) => {
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

    // Evento do botão fechar
    fecharBg.on('pointerdown', () => {
      console.log('Fechando modal de configuração...');
      
      // Salvar configurações
      localStorage.setItem('musicVolume', volumeMusica.toString());
      try {
        const save = SaveManager.load();
        save.settings.musicVolume = volumeMusica;
        SaveManager.save(save);
      } catch (e) {}
      
      // Retomar música
      if (this.musicaFases && this.musicaFases.isPaused) {
        this.musicaFases.setVolume(volumeMusica);
        this.musicaFases.resume();
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

    // Inicializar slider
    updateSlider(handleX);
  }

  // Método chamado quando a cena é destruída ou trocada
  shutdown() {
    // Parar e destruir música completamente
    if (this.musicaFases) {
      console.log('FaseScene: parando música no shutdown');
      this.musicaFases.stop();
      this.musicaFases.destroy();
      this.musicaFases = null;
    }
  }
}
