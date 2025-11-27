import SaveManager from '../services/savemanager.js';
import SaveDebugPanel from '../ui/savedebugpanel.js';

// =========================
// CONFIG BÁSICA
// =========================
const C_SYLLS = ['CA','CE','CI','CO','CU'];

// Corrige textos com mojibake comum (UTF-8 lido como ISO-8859-1)
function fixMojibake(str) {
  if (!str || typeof str !== 'string') return str;
  let s = str;
  const map = {
    'Ã¡':'á','Ã¢':'â','Ã£':'ã','Ãª':'ê','Ã©':'é','Ã¨':'è','Ã­':'í','Ã³':'ó','Ã´':'ô','Ãµ':'õ','Ãº':'ú','Ã§':'ç',
    'ÃÁ':'Á','Ã‚':'Â','Ãƒ':'Ã','ÃŠ':'Ê','Ã‰':'É','ÃÍ':'Í','Ã“':'Ó','Ã”':'Ô','Ã•':'Õ','Ãš':'Ú','Ã‡':'Ç',
    'concluÃ­da':'concluída','NÃ£o':'Não','comeÃ§a':'começa','comeÃ§am':'começam','sÃ­laba':'sílaba','SÃ­laba':'Sílaba'
  };
  for (const [bad, good] of Object.entries(map)) {
    s = s.split(bad).join(good);
  }
  return s.replace(/�/g, '');
}

// Função para pegar sílaba diferente
function pickDifferent(array, notThis) {
  const pool = array.filter(x => x !== notThis);
  return pool[Math.floor(Math.random() * pool.length)];
}

// Embaralhar array
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// =========================
// CONSTANTES DE ÁUDIO PARA REUTILIZAÇÃO
// =========================
const WORD_AUDIO_BASE = 'assets/sons/audios/';
const WORD_AUDIO_KEYS = [
  'word_all_dado',
  'word_all_gato',
  'word_all_pato',
  'word_all_vela',
  'word_c_cadeado',
  'word_c_cavalo',
  'word_c_cana',
  'word_c_caneca',
  'word_c_canoa',
  'word_c_canudo',
  'word_c_casa',
  'word_c_cebola',
  'word_c_cenoura',
  'word_c_cidade',
  'word_c_circo',
  'word_c_coelho',
  'word_c_cola',
  'word_c_copo',
  'word_c_corda',
  'word_c_cubo',
  'word_c_curativo',
  'word_d_dado',
  'word_d_dalmata',
  'word_d_dama',
  'word_d_danca',
  'word_d_dedo',
  'word_d_dente',
  'word_d_desenho',
  'word_d_diamante',
  'word_d_dinamite',
  'word_d_dinheiro',
  'word_d_dino',
  'word_d_doce',
  'word_d_doente',
  'word_d_dois',
  'word_d_domino',
  'word_d_dormir',
  'word_d_duende',
  'word_d_duna',
  'word_f_fada',
  'word_f_farol',
  'word_f_fazenda',
  'word_f_feijao',
  'word_f_festa',
  'word_f_fita',
  'word_f_foca',
  'word_f_fogo',
  'word_f_folha',
  'word_f_futebol'
];

const SYLLABLE_AUDIO_BASE = 'assets/sons/siglas/';
const SYLLABLE_AUDIO_KEYS = [
  'word_CA','word_CE','word_CI','word_CO','word_CU'
];

const HELP_AUDIO_BASE = 'assets/sons/help/';
const HELP_AUDIO_KEYS = [
  'help_a1_ache_figura_certa',
  'help_a2_que_silaba_comeca',
  'help_a4_nao_comeca_com',
  'help_a6_que_palavra_e_essa',
  'help_a7_monte_palavra',
  'help_a8_jogo_memoria',
  'help_a9_silaba_certa_figura',
  'help_b_a3_figuras_com_b',
  'help_b_a5_separe_ba_bo',
  'help_c_a3_figuras_com_c',
  'help_c_a5_separe_ca_co',
  'help_d_a3_figuras_com_d',
  'help_d_a5_separe_da_do',
  'help_f_a3_figuras_com_f',
  'help_f_a5_separe_fa_fo'
];

const TITLE_AUDIO_BASE = 'assets/sons/title/';
const TITLE_AUDIO_KEYS = [
  'title_a1_ache_figura_certa',
  'title_a2_qual_silaba_comeca_palavra',
  'title_a3_figuras_com_letra_C',
  'title_a4_encontre_figura_diferente',
  'title_a5_separe_figuras',
  'title_a6_que_palavra_e_essa',
  'title_a7_monte_a_palavra',
  'title_a8_jogo_da_memoria',
  'title_a9_silaba_certa_para_cada_figura'
];

const TITLE_AUDIO_GAP_MS = 2600; // 2.6 segundos entre título e instrução

// =========================
// FUNÇÃO UTILITÁRIA PARA CARREGAR TODOS OS ÁUDIOS DO JOGO
// =========================
export function loadAllGameAudio(loader) {
  WORD_AUDIO_KEYS.forEach((k) => {
    loader.audio(k, `${WORD_AUDIO_BASE}${k}.mp3`);
  });
  SYLLABLE_AUDIO_KEYS.forEach((k) => {
    loader.audio(k, `${SYLLABLE_AUDIO_BASE}${k}.mp3`);
  });
  HELP_AUDIO_KEYS.forEach((k) => {
    loader.audio(k, `${HELP_AUDIO_BASE}${k}.mp3`);
  });

  // NOVO: títulos das atividades
  TITLE_AUDIO_KEYS.forEach((k) => {
    loader.audio(k, `${TITLE_AUDIO_BASE}${k}.mp3`);
  });

  // Sons de feedback
  loader.audio('sfx_acerto', 'assets/sons/acerto.mp3');
  loader.audio('sfx_erro', 'assets/sons/erro.mp3');
  loader.audio('sfx_concluido', 'assets/sons/concluido.mp3');
  
  // Música de fundo da Fase 2
  loader.audio('bg_music_fase2', 'assets/sons/fase2.mp3');
}

export default class Fase2Atividades extends Phaser.Scene {
  constructor() {
    super({ key: 'fase2_atividades' });
    this.wordAudioLetter = 'c'; // Fase 2 = Castelo do C (palavras começam com C)

    // ✅ Props de controle para evitar bugs de reentrada
    this._afterTitleTimer = null;
    this._inputCooldownTimer = null;
    this._audioCooldownTimer = null;
    this._boundGlobalShutdown = false;


    // Sistema de estrelas da fase
    // - phaseErrors: quantos erros na tentativa atual
    // - phaseBestStars: melhor resultado salvo no localStorage (nunca diminui)
    this.phaseLetter = 'C';
    this.phaseErrors = 0;
    const _save = SaveManager.load();
    this.phaseBestStars = (_save.progress?.C?.bestStars) || 0;

    // Paleta de cores suaves e neutras (tema bosque)
    this.COLOR = {
      PRIMARY: 0x16A34A,   // verde principal (header/botões)
      SECONDARY: 0x84CC16, // verde-lima detalhes
      SYLLABLE: 0x0EA5E9,  // azul pros botões de sílaba
      SUCCESS: 0x22C55E,   // verde (não alterar)
      DANGER: 0xEF4444,    // vermelho (não alterar)
      TEXT_DARK: '#1F2937',
      TEXT_LIGHT: '#FFFFFF',
      BG_WHITE: 0xFFFFFF,
      BG_APP: '#F7F9FB',   // fundo da cena
      BORDER: 0xE5E7EB     // cinza claro
    };

    // 9 atividades da Fase 1 (A1 até A9)
    this.totalActivities = 9;
    this.currentActivity = 1;

    // container reutilizável para cada atividade
    this.activityContainer = null;

    this.SHOW_PROGRESS = true;   // liga a barra "Atividade X de Y"
    
    // Mostra/oculta o medidor de energia/erros
    this.SHOW_METER = false;     // desliga o medidor de "erros/energia"
    
    this.energyMax = 0;
    this.energy = 0;

  this._a1Lock = false; // trava cliques da Atividade 1 (Ache a figura certa)
    
    // Mostra/oculta o botão "Falar palavra"
    this.SHOW_SPEAK = false;

    this.BACKDROP_SIDE_EXTRA = 80; // px adicionados em cada lado
 
    this.SUCCESS_DELAY = 300; // reduzido para feedback mais ágil (≤300ms)
    this.LAYOUT = {
      titleY: 130,     // era 150
      subTitleY: 160,  // era 170
      contentY: 330,
      gridGapX: 50,
      gridGapY: 40,
      cardW: 220,
      cardH: 130,
      // antes: footerY: () => this.scale.height - 60
      footerY: () => this.scale.height + 60  // empurra o "limite" pra baixo e a placa fica ~toda a tela
    };

    // "Ameaçazinha" lúdica: medidor do mascote (0..5)
    this.energyMax = 5;
    this.energy = 5;
    this._meterNodes = [];
  }

  // =========================
  // PRELOAD - Carrega todas as imagens da Fase 2 (Castelo do C)
  // =========================
  preload() {
    // Carrega todos os áudios do jogo usando função utilitária
    loadAllGameAudio(this.load);
    
    // Debug: listar áudios carregados após completar
    this.load.on('complete', () => {
      console.log('[DEBUG] Áudios carregados:', this.cache.audio.entries.keys);
    });
    
    // ===== OUTROS ASSETS DA FASE =====
    // Ícone de ajuda do passarinho
    this.load.image('icon_ajuda', 'assets/ui/icon_ajuda.png');

    this.load.image('popup_parabens', 'assets/parabens.png');

    // Loga se algum asset falhar
    this.load.on('loaderror', (fileObj) => {
      console.warn(`Failed to load: ${fileObj.type} "${fileObj.key}" from ${fileObj.url}`);
    });

    // Insígnias de estrelas (1–3) — usadas no pop-up final da fase
    this.load.image('insignia_c_1', 'assets/insignias/insignia_c_1.png');
    this.load.image('insignia_c_2', 'assets/insignias/insignia_c_2.png');
    this.load.image('insignia_c_3', 'assets/insignias/insignia_c_3.png');

    // Novos assets para o pop-up final da fase
    this.load.image('popup_mascote_fase', 'assets/ui/apresentar.png');
    this.load.image('popup_btn_mapa',     'assets/ui/voltar_ao_mapa.png');
    this.load.image('popup_btn_repetir',  'assets/ui/repetira_fase.png');

    // Fundo do castelo
    this.load.image('bg_castelos', 'assets/bg_castelos.png');
    this.load.image('palmeira_wipe', 'assets/palmeira_transisao.png');

    // Mascote do pop-up e botão de avançar
    this.load.image('popup_mascote', 'assets/ui/popup_mascote.png');
    this.load.image('papagaio_joinha', 'assets/ui/popup_mascote_joinha.png');
    this.load.image('popup_next', 'assets/ui/popup_next.png');
    this.load.image('titulo_muito_bem', 'assets/muito_bem.png');

    // Imagens com C
    this.load.image('cadeado', 'assets/imag sem letra/CADEADO.png');
    this.load.image('cavalo',  'assets/imag sem letra/CAVALO.png');
    this.load.image('cana',    'assets/imag sem letra/CANA.png');
    this.load.image('caneca',  'assets/imag sem letra/CANECA.png');
    this.load.image('canoa',   'assets/imag sem letra/CANOA.png');
    this.load.image('canudo',  'assets/imag sem letra/CANUDO.png');
    this.load.image('casa',    'assets/imag sem letra/CASA.png');
    this.load.image('cebola',  'assets/imag sem letra/CEBOLA.png');
    this.load.image('cenoura', 'assets/imag sem letra/CENOURA.png');
    this.load.image('cesta',   'assets/imag sem letra/CESTA.png');
    this.load.image('cidade',  'assets/imag sem letra/CIDADE.png');
    this.load.image('circo',   'assets/imag sem letra/CIRCO.png');
    this.load.image('coelho',  'assets/imag sem letra/COELHO.png');
    this.load.image('cola',    'assets/imag sem letra/COLA.png');
    this.load.image('copo',    'assets/imag sem letra/COPO.png');
    this.load.image('corda',   'assets/imag sem letra/CORDA.png');
    this.load.image('cubo',    'assets/imag sem letra/CUBO.png');
    this.load.image('curativo','assets/imag sem letra/CURATIVO.png');

    // Imagens distratoras (não começam com C)
    this.load.image('dado', 'assets/imag sem letra/DADO.png');
    this.load.image('gato', 'assets/imag sem letra/GATO.png');
    this.load.image('pato', 'assets/imag sem letra/PATO.png');
    this.load.image('vela', 'assets/imag sem letra/VELA.png');

    // Gera texturas de sílabas da família C se não existirem
    this.load.on('complete', () => {
      C_SYLLS.forEach(syll => {
        const key = `silaba_${syll}`;
        if (!this.textures.exists(key)) {
          this.generateSyllableTexture(syll, key);
        }
      });
    });

    // (se você tiver mais assets depois, podem continuar aqui)
  }

  // ===== HELPERS PARA TOCAR ÁUDIOS =====
  // Fala o nome de uma figura (casa, caneca, dado, etc.)
  playWordAudio(imageKey) {
    if (!this.sound || !imageKey) return;
    if (this.startAudioCooldown && this.startAudioCooldown(250)) return;

    const k = String(imageKey).toLowerCase();

    // Se já for uma chave completa (ex: "word_c_casa"), toca direto
    if (k.startsWith('word_') && this.sound.get(k)) {
      let s = this.sound.get(k);
      if (!s) s = this.sound.add(k);
      s.stop();
      s.play();
      return;
    }

    // Palavras da família C e distratoras comuns
    const C_WORDS = new Set([
      'cadeado','cavalo','cana','caneca','canoa','canudo','casa',
      'cebola','cenoura','cidade','circo','coelho','cola','copo','corda',
      'cubo','curativo'
    ]);

    const COMMON = new Set(['dado','gato','pato','vela']);

    let audioKey = null;

    if (C_WORDS.has(k)) {
      audioKey = `word_c_${k}`;       // ex: "casa" -> "word_c_casa"
    } else if (COMMON.has(k)) {
      audioKey = `word_all_${k}`;     // ex: "dado" -> "word_all_dado"
    }

    // Se não achou mapeamento, tenta tocar a própria chave
    if (!audioKey) audioKey = k;

    if (this.cache.audio.exists(audioKey)) {
      let s = this.sound.get(audioKey);
      if (!s) s = this.sound.add(audioKey);
      s.stop();
      s.play();
    } else {
      console.warn('[AUDIO] não encontrei áudio para', imageKey, '=>', audioKey);
    }
  }

  // Fala uma sílaba (CA, CE, CO...) usando os áudios word_CA, word_CE, etc.
  playSyllableAudio(syllableKey) {
    if (!this.sound || !syllableKey) return;
    if (this.startAudioCooldown && this.startAudioCooldown(220)) return;

    let k = String(syllableKey).toUpperCase();

    // Se já vier como "word_CA", usa direto
    if (!k.startsWith('WORD_')) {
      k = `word_${k}`;                // "CA" -> "word_CA"
    }

    if (this.cache.audio.exists(k)) {
      let s = this.sound.get(k);
      if (!s) s = this.sound.add(k);
      s.stop();
      s.play();
    } else {
      console.warn('[AUDIO] não encontrei áudio de sílaba para', syllableKey, '=>', k);
    }
  }

  // Fala o áudio de ajuda da atividade (help_c_a1_..., help_c_a2_..., etc.)
  playHelpAudio(helpKey) {
    if (!this.sound || !helpKey) return;
    if (this.startAudioCooldown && this.startAudioCooldown(250)) return;

    const k = String(helpKey);

    // Mapeamento de áudios de ajuda para números de atividade
    const HELP_ACTIVITY_MAP = {
      'help_a1_ache_figura_certa': 1,
      'help_a2_que_silaba_comeca': 2,
      'help_c_a3_figuras_com_c': 3,
      'help_a4_nao_comeca_com': 4,
      'help_c_a5_separe_ca_co': 5,
      'help_a6_que_palavra_e_essa': 6,
      'help_a7_monte_palavra': 7,
      'help_a8_jogo_memoria': 8,
      'help_a9_silaba_certa_figura': 9,
      'help_b_a3_figuras_com_b': 3,
      'help_b_a5_separe_ba_bo': 5,
      'help_d_a3_figuras_com_d': 3,
      'help_d_a5_separe_da_do': 5,
      'help_f_a3_figuras_com_f': 3,
      'help_f_a5_separe_fa_fo': 5
    };

    const expectedActivity = HELP_ACTIVITY_MAP[k];

    // Verifica se é um áudio de help fora de contexto
    if (expectedActivity && expectedActivity !== this.currentActivity) {
      console.warn(`[AUDIO] Help fora de contexto: ${k} é da atividade ${expectedActivity}, mas estamos na atividade ${this.currentActivity}`);
      return;
    }

    // Validação especial para o Jogo da Memória (atividade 8)
    if (expectedActivity === 8 && !this._helpFromUserClick) {
      console.warn(`[AUDIO] Help do Jogo da Memória ignorado porque não veio de clique do usuário: ${k}`);
      return;
    }

    if (this.cache.audio.exists(k)) {
      let s = this.sound.get(k);
      if (!s) s = this.sound.add(k);
      s.stop();
      s.play();
    } else {
      console.warn('[AUDIO] não encontrei áudio de ajuda para', helpKey);
    }
  }

  playTitleAudio(activityNumber) {
    const map = {
      1: 'title_a1_ache_figura_certa',                 // Case 1 → setupAtividade8 (Ache a figura certa)
      2: 'title_a2_qual_silaba_comeca_palavra',        // Case 2 → setupAtividade1 (Que sílaba começa?)
      3: 'title_a3_figuras_com_letra_C',               // Case 3 → setupAtividade2 (Figuras com C)
      4: 'title_a4_encontre_figura_diferente',         // Case 4 → setupAtividade4 (Ache o intruso)
      5: 'title_a5_separe_figuras',                    // Case 5 → setupAtividade5 (Separe as figuras)
      6: 'title_a6_que_palavra_e_essa',                // Case 6 → setupAtividade3 (Que palavra é essa?)
      7: 'title_a7_monte_a_palavra',                   // Case 7 → setupAtividade7 (Monte a palavra)
      8: 'title_a8_jogo_da_memoria',                   // Case 8 → setupAtividade6 (Jogo da memória)
      9: 'title_a9_silaba_certa_para_cada_figura'      // Case 9 → setupAtividade9 (Sílaba para cada figura)
    };

    const key = map[activityNumber];
    if (!key) return;

    try {
      let s = this.sound.get(key);
      if (!s) {
        s = this.sound.add(key);
      }
      s.stop();
      s.play();
    } catch (e) {
      console.warn('Falha ao tocar título da atividade', activityNumber, e);
    }
  }

  /**
   * Agenda a execução de uma função depois do áudio de título.
   * Usa apenas um timer por vez para não acumular delays.
   */
  queueAfterTitle(callback, delayMs = TITLE_AUDIO_GAP_MS) {
    if (this._afterTitleTimer) {
      try { this._afterTitleTimer.remove(false); } catch (e) {}
      this._afterTitleTimer = null;
    }
    if (!callback) return;

    this._afterTitleTimer = this.time.delayedCall(delayMs, () => {
      // não roda fora da cena
      if (!this.sys || !this.sys.isActive()) {
        this._afterTitleTimer = null;
        return;
      }
      callback();
      this._afterTitleTimer = null;
    });
  }

  generateSyllableTexture(syllable, key) {
    try {
      // Compose offscreen using RenderTexture to combine shape + text
      const width = 100, height = 60;

      // Offscreen graphics (not added to display list)
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xFFFFFF, 1);
      g.fillRoundedRect(0, 0, width, height, 8);
      g.lineStyle(2, 0x000000, 1);
      g.strokeRoundedRect(0, 0, width, height, 8);

      // Offscreen text
      const t = this.make.text({
        x: width / 2,
        y: height / 2,
        text: syllable,
        style: {
          fontFamily: 'Quicksand, Arial, sans-serif',
          fontSize: '24px',
          color: '#000000',
          fontStyle: 'bold'
        },
        add: false
      });
      t.setOrigin(0.5);

      // Render to offscreen texture and save
      const rt = this.make.renderTexture({ width, height, add: false });
      rt.draw(g, 0, 0);
      rt.draw(t, 0, 0);
      rt.saveTexture(key);

      // Cleanup temporary objects
      g.destroy();
      t.destroy();
      rt.destroy();
    } catch (e) {
      console.warn(`Failed to generate texture for ${key}:`, e);
    }
  }

  // =========================
  // LIFECYCLE
  // =========================
  create() {
    // ✅ HARD RESET ao (re)entrar (Scene é reutilizada)
    this.input.enabled = true;

    // Reseta travas/flags comuns
    this.__clickCooldown = false;
    this.__audioCooldown = false;
    this._navigationInProgress = false;
    this._modalShown = false;

    // Começa sempre na atividade 1 quando reabrir do mapa
    this.currentActivity = 1;
    this._showingActivity = false;
    this._activityCompleted = false;

    // cancela timers controlados
    if (this._afterTitleTimer) {
      try { this._afterTitleTimer.remove(false); } catch (e) {}
      this._afterTitleTimer = null;
    }
    if (this._inputCooldownTimer) {
      try { this._inputCooldownTimer.remove(false); } catch (e) {}
      this._inputCooldownTimer = null;
    }
    if (this._audioCooldownTimer) {
      try { this._audioCooldownTimer.remove(false); } catch (e) {}
      this._audioCooldownTimer = null;
    }

    // Fade in suave ao entrar na cena
    this.cameras.main.fadeIn(300, 245, 247, 251);
    
    const W = this.scale.width;

    // Zera contador de erros da tentativa atual
    this.phaseErrors = 0;

    // Painel de debug do save (tecla P)
    if (this.saveDebugPanel?.container) { try { this.saveDebugPanel.container.destroy(true); } catch (e) {} }
    this.saveDebugPanel = new SaveDebugPanel(this, {
      currentPhaseLetter: this.phaseLetter,
      onChange: () => SaveManager.load()
    });

    // Definir profundidades padrão
    this.Z = { BG: 10, CARD: 100, IMG: 200, SLOT: 250, DRAG: 1000, UI: 2000 };

  // Fundo do castelo
  this.createCastleBackground();
    
    // Header com visual e medidor do mascote
    this.createHeader();
    
    // Medidor (desligado por padrão agora)
    if (this.SHOW_METER) {
      this.createMascotMeter();
    }

    // Indicador de progresso (opcional)
    if (this.SHOW_PROGRESS) {
      this.createProgressBar();
    }

    // Barra de navegação
    this.setupNavigation();

    // Container base
    this.activityContainer = this.add.container(0, 0);

    // Música de fundo da fase
    this.startBackgroundMusic();
    
    // ✅ Cleanup global no SHUTDOWN (uma vez só)
    if (!this._boundGlobalShutdown) {
      this._boundGlobalShutdown = true;

      this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
        // evita travar input ao sair no meio de transitionStep()
        try { this.input.enabled = true; } catch (e) {}

        // solta flags
        this.__clickCooldown = false;
        this.__audioCooldown = false;
        this._navigationInProgress = false;
        this._modalShown = false;
        this._showingActivity = false;
        this._activityCompleted = false;

        // remove apenas timers que controlamos
        try { this._afterTitleTimer?.remove(false); } catch (e) {}
        this._afterTitleTimer = null;

        try { this._inputCooldownTimer?.remove(false); } catch (e) {}
        this._inputCooldownTimer = null;

        try { this._audioCooldownTimer?.remove(false); } catch (e) {}
        this._audioCooldownTimer = null;

        // ok parar som
        try { this.sound?.stopAll(); } catch (e) {}

        // NÃO FAZER:
        // this.time.removeAllEvents();
        // this.tweens.killAll(); (deixe opcional, só se necessário)
      });
    }
    
    // Começa na A1
    this.showActivity(this.currentActivity);
  }

  // =========================
  // SISTEMA DE ESTRELAS DA FASE
  // - phaseErrors: quantos erros a criança cometeu na tentativa atual
  // - getPhaseStars(): converte erros em 1, 2 ou 3 estrelas
  // - savePhaseStars(): salva o melhor resultado no localStorage
  // =========================
  // Zera contador de erros da fase
  resetPhaseErrors() {
    this.phaseErrors = 0;
  }

  showPhaseCompletedModal() {
    const W  = this.scale.width;
    const H  = this.scale.height;
    const cx = W / 2;
    const cy = H / 2;
    const Z  = 2000;

    // ----- lista de objetos para limpar -----
    const toDestroy = [];
    const track = (obj) => { if (obj) toDestroy.push(obj); return obj; };
    const cleanup = () => { toDestroy.forEach(o => { try { o.destroy(); } catch (e) {} }); };

    // Overlay escuro
    const overlay = track(this.add.rectangle(cx, cy, W, H, 0x000000, 0.45).setDepth(Z).setInteractive());

    // Card em pé
    const cardW = Math.min(420, W * 0.70);
    const cardH = Math.min(520, H * 0.88);
    const topY  = cy - cardH / 2;

    const shadow = track(this.add.graphics().setDepth(Z + 1));
    shadow.fillStyle(0x000000, 0.20).fillRoundedRect(cx - cardW / 2, topY + 8, cardW, cardH, 28);

    const card = track(this.add.graphics().setDepth(Z + 2));
    card.fillStyle(0xffffff, 1).fillRoundedRect(cx - cardW / 2, topY, cardW, cardH, 28);
    card.lineStyle(3, this.COLOR.BORDER, 1).strokeRoundedRect(cx - cardW / 2, topY, cardW, cardH, 28);

    // Cálculo de estrelas
    const estrelasNow  = this.getPhaseStars?.() || 0;
    const estrelasBest = this.phaseBestStars || parseInt(localStorage.getItem('fase2Stars') || '0', 10) || 0;
    const estrelas     = Math.max(estrelasNow, estrelasBest);

    let badgeKey = null;
    if (estrelas >= 3 && this.textures.exists('insignia_c_3')) badgeKey = 'insignia_c_3';
    else if (estrelas === 2 && this.textures.exists('insignia_c_2')) badgeKey = 'insignia_c_2';
    else if (estrelas === 1 && this.textures.exists('insignia_c_1')) badgeKey = 'insignia_c_1';

    let textoLinha;
    if (estrelas === 1) textoLinha = 'Você ganhou 1 estrela!';
    else if (estrelas === 2) textoLinha = 'Você ganhou 2 estrelas!';
    else textoLinha = 'Você ganhou 3 estrelas!';



    // Título como imagem ou fallback texto (maior)
    let parabensImg = null;
    if (this.textures.exists('popup_parabens')) {
      const texTitle = this.textures.get('popup_parabens').getSourceImage();
      const maxW = cardW * 1.15;
      const maxH = 200;
      let s = Math.min(maxW / texTitle.width, maxH / texTitle.height);
      s *= 1.32;
      parabensImg = track(
        this.add.image(cx, topY + 34, 'popup_parabens')
          .setOrigin(0.5)
          .setDepth(Z + 3)
          .setScale(s)
      );
    } else {
      const title = this.add.text(
        cx,
        topY + 80,
        'Parabéns!',
        {
          fontFamily: 'Quicksand, Arial, sans-serif',
          fontSize: '28px',
          color: this.COLOR.TEXT_DARK,
          fontStyle: 'bold',
          align: 'center'
        }
      ).setOrigin(0.5).setDepth(Z + 3);
      try { title.setText(fixMojibake(title.text)); } catch (e) {}
      toDestroy.push(title);
    }

    // Frase das estrelas
    const desc = track(this.add.text(
      cx,
      topY + 120,
      textoLinha,
      {
        fontFamily: 'Quicksand, Arial, sans-serif',
        fontSize: '20px',
        color: this.COLOR.TEXT_DARK,
        align: 'center'
      }
    ).setOrigin(0.5).setDepth(Z + 4));
    try { desc.setText(fixMojibake(desc.text)); } catch (e) {}

    // Insígnia grande
    let badge = null;
    if (badgeKey && this.textures.exists(badgeKey)) {
      const badgeY = topY + cardH * 0.52;

      badge = track(
        this.add.image(cx, badgeY, badgeKey)
          .setDepth(Z + 5)
          .setOrigin(0.5) // garante que gira pelo centro
      );

      try {
        const src = this.textures.get(badgeKey).getSourceImage();
        const maxW = Math.floor(cardW * 0.88);
        const maxH = Math.floor(cardH * 0.48);
        let scale = Math.min(maxW / src.width, maxH / src.height);
        scale *= 1.12;
        badge.setScale(scale);
      } catch (e) {}

      // Animação de giro quando o pop-up aparece (1 volta)
      this.tweens.add({
        targets: badge,
        angle: 360,
        duration: 700,
        ease: 'Cubic.easeOut'
      });

      // Pulso de escala suave depois do giro
      this.tweens.add({
        targets: badge,
        scaleX: '+=0.09',
        scaleY: '+=0.09',
        yoyo: true,
        duration: 340,
        ease: 'Back.easeOut',
        delay: 120
      });
    }



    // Botões
    const btnY      = topY + cardH - 70;
    const btnOffset = 110;

    // Voltar ao mapa
    const btnVoltar = track(this.createModernButton(
      cx - btnOffset,
      btnY,
      '',
      140,
      64,
      0x04a34b,
      () => { cleanup(); this.stopBackgroundMusic(); this.scene.start('fasescene'); }
    ));
    btnVoltar.setDepth(Z + 6);
    if (this.textures.exists('popup_btn_mapa')) {
      const tex = this.textures.get('popup_btn_mapa').getSourceImage();
      const icon = this.add.image(0, 0, 'popup_btn_mapa').setOrigin(0.5);
      const maxW = 64, maxH = 64;
      const s = Math.min(maxW / tex.width, maxH / tex.height);
      icon.setScale(s);
      btnVoltar.add(icon);
    }

    // Repetir fase (posição central original)
    const btnReplay = track(this.createModernButton(
      cx + btnOffset,
      btnY,
      '',
      140,
      64,
      0x7cd304,
      () => {
        cleanup();
        this.currentActivity = 1;
        this.goToActivityPalm(this.currentActivity);
        if (this.updateNavigationButtons) {
          this.updateNavigationButtons();
        }
      }
    ));
    btnReplay.setDepth(Z + 6);
    if (this.textures.exists('popup_btn_repetir')) {
      const tex = this.textures.get('popup_btn_repetir').getSourceImage();
      const icon = this.add.image(0, 0, 'popup_btn_repetir').setOrigin(0.5);
      const maxW = 64, maxH = 64;
      const s = Math.min(maxW / tex.width, maxH / tex.height);
      icon.setScale(s);
      btnReplay.add(icon);
    }

    // Mascote à direita acima do botão de repetir (alinhado com btnReplay.x)
    if (this.textures.exists('popup_mascote_fase')) {
      const texMasc = this.textures.get('popup_mascote_fase').getSourceImage();
      const mascotX = btnReplay.x;
      const mascotY = btnY - 100;
      const masc = track(this.add.image(mascotX, mascotY, 'popup_mascote_fase').setDepth(Z + 7));
      try {
        const maxW = 130, maxH = 130;
        const s = Math.min(maxW / texMasc.width, maxH / texMasc.height);
        masc.setScale(s);
      } catch (e) {}
      this.tweens.add({
        targets: masc,
        y: mascotY + 10,
        duration: 1400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut'
      });
    }

    // Animação de entrada
    const group = [shadow, card, parabensImg, desc, badge, btnVoltar, btnReplay];
    this.tweens.add({
      targets: group.filter(Boolean),
      alpha: { from: 0, to: 1 },
      duration: 240,
      ease: 'Quad.Out'
    });

    this.playCompletedSound?.();
  }
  // Conta erro da fase para calcular estrelas
  registerPhaseError() {
    if (typeof this.phaseErrors !== 'number') this.phaseErrors = 0;
    this.phaseErrors += 1;
  }

  // Converte quantidade de erros em 1–3 estrelas
  getPhaseStars() {
    const errors = Math.max(0, this.phaseErrors || 0);
    if (errors <= 1) return 3;   // 0–1 erro
    if (errors <= 3) return 2;   // 2–3 erros
    return 1;                    // 4+ erros
  }

  // SAVE: melhor resultado no SaveManager (nunca diminui)
  savePhaseStars() {
    const current = this.getPhaseStars();
    const phase = SaveManager.updatePhase(this.phaseLetter, { starsEarnedThisRun: current });
    this.phaseBestStars = phase?.bestStars || current;
    return this.phaseBestStars;
  }

  createCastleBackground() {
    const W = this.scale.width, H = this.scale.height;
    if (this.textures && this.textures.exists('bg_castelos')) {
      const tex  = this.textures.get('bg_castelos').get();
      const base = (tex && typeof tex.getSourceImage === 'function') ? tex.getSourceImage() : tex || {};
      const iw   = Math.max(1, base.width  || tex?.width  || 1);
      const ih   = Math.max(1, base.height || tex?.height || 1);
      const s    = Math.max(W/iw, H/ih);
      this.add.image(W/2, H/2, 'bg_castelos').setScale(s).setDepth(-20);
      return;
    }
    // se não carregar, deixa um fundo roxo simples (tema castelo)
    const g = this.add.graphics();
    g.fillStyle(0xA78BFA).fillRect(0, 0, W, H);
    g.setDepth(-20);
  }

  createHeader() {
    const W = this.scale.width;
    const H_BAR = 88; // barra um pouco mais alta

    // Faixa verde do topo
    const g = this.add.graphics();
    g.fillStyle(this.COLOR.PRIMARY, 1);
    g.fillRect(0, 0, W, H_BAR);

    // Sombra embaixo da barra pra separar do resto da tela
    const bottomShadow = this.add.graphics();
    bottomShadow.fillStyle(0x000000, 0.18);
    bottomShadow.fillRect(0, H_BAR - 4, W, 4);

    const titleText = 'Castelo do C';

    const titleStyle = {
      fontFamily: 'Quicksand, Arial, sans-serif',
      fontSize: '34px',
      color: '#FFFFFF',
      fontStyle: 'bold',
      align: 'center'
    };

    // Texto "fantasma" só pra medir largura/altura
    const measure = this.add.text(0, 0, titleText, titleStyle)
      .setOrigin(0.5)
      .setVisible(false);

    const padX = 40;             // espaço lateral da plaquinha
    const padY = 10;             // espaço vertical
    const plateW = measure.width  + padX;
    const plateH = measure.height + padY;
    const plateY = H_BAR / 2 + 2; // levemente abaixo do centro

    // Sombra da plaquinha
    const plateShadow = this.add.graphics();
    plateShadow.fillStyle(0x000000, 0.18);
    plateShadow.fillRoundedRect(
      W / 2 - plateW / 2,
      plateY - plateH / 2 + 3,
      plateW,
      plateH,
      plateH / 2
    );

    // Contorno suave da plaquinha (transparente por dentro)
    const plateStroke = this.add.graphics();
    plateStroke.lineStyle(2, 0xFFFFFF, 0.22);
    plateStroke.strokeRoundedRect(
      W / 2 - plateW / 2,
      plateY - plateH / 2,
      plateW,
      plateH,
      plateH / 2
    );

    // Texto final
    const title = this.add.text(W / 2, plateY, titleText, titleStyle)
      .setOrigin(0.5);

    // Sombra do texto
    title.setShadow(0, 3, '#000000', 4, false, true);

    // Limpa o texto de medição
    measure.destroy();
  }

  createMascotMeter() {
    const W = this.scale.width;
    const baseX = W - 24 - (this.energyMax * 22);
    const y = 36;

    // placa sutil por trás
    const plate = this.add.graphics();
    const pw = this.energyMax * 22 + 20;
    plate.fillStyle(0x000000, 0.10)
         .fillRoundedRect(baseX - 10, y - 14, pw, 28, 14);
    plate.setDepth(99);

    this._meterNodes = [];
    for (let i = 0; i < this.energyMax; i++) {
      const c = this.add.circle(baseX + i * 22, y, 8, this.COLOR.SECONDARY)
        .setStrokeStyle(1.5, 0x000000, 0.2);
      c.setDepth(100);
      this._meterNodes.push(c);
    }
    this.updateMascotMeter(true);
  }

  updateMascotMeter(initial = false) {
    this._meterNodes.forEach((node, i) => {
      const filled = i < this.energy;
      node.fillColor = filled ? this.COLOR.SECONDARY : 0xffffff;
      if (!initial) {
        this.tweens.add({ targets: node, scale: filled ? 1.15 : 1.0, yoyo: true, duration: 120 });
      }
    });
  }

  bumpEnergy(delta) {
    // Se o medidor não foi criado, não faz nada visual
    if (!this._meterNodes || this._meterNodes.length === 0) return;
    const old = this.energy;
    this.energy = Phaser.Math.Clamp(this.energy + delta, 0, this.energyMax);
    if (this.energy !== old) this.updateMascotMeter();
  }

  // Fundo branco global (laterais menores; topo/rodapé mais altos)
  addActivityBackdrop(opts = {}) {
    const W = this.scale.width, H = this.scale.height;

    const {
      top        = this.LAYOUT.titleY,
      bottom     = this.LAYOUT.footerY() - 96,
      paddingX   = 68,   // ↓ antes 80 (laterais menores por padrão)
      radius     = 22,
      alpha      = 1,
      shadowA    = 0.08,
      showBorder = true,
    } = opts;

    // --- controles globais (pode afinar só estes três valores) ---
    const SAFE_SIDE = Math.max(64, Math.round(W * 0.04));
    const EXT_TOP   = 18;  // ↑ antes 8   (placa sobe mais)
    const EXT_BOT   = 44;  // ↑ antes 26  (placa desce mais)
    // -------------------------------------------------------------

    // aplica as extensões verticais
    const y1 = Math.max(84, Math.min(top - EXT_TOP, H - 180));
    const y2 = Math.max(y1 + 140, Math.min(bottom + EXT_BOT, H - 40));

    // margem lateral efetiva (não deixa exagerar mesmo se passar paddingX alto)
    // aplica um extra global para estreitar horizontalmente todas as placas
    const basePad = Math.max(SAFE_SIDE, Math.min(paddingX, SAFE_SIDE + 60));
    const EXTRA_SIDE = this.BACKDROP_SIDE_EXTRA || 0;
    const pad = basePad + EXTRA_SIDE;

    // largura calculada a partir do pad efetivo (placa fica mais estreita)
    const BW  = Math.max(560, Math.min(W - pad * 2, W - 160));
    const BH  = Math.max(160, y2 - y1);
    const X   = Math.round(W / 2 - BW / 2);

    const layer = this.add.container(0, 0);

    const sh = this.add.graphics();
    sh.fillStyle(0x000000, shadowA).fillRoundedRect(X, y1 + 6, BW, BH, radius);

    const g = this.add.graphics();
    g.fillStyle(0xFFFFFF, alpha).fillRoundedRect(X, y1, BW, BH, radius);
    if (showBorder) g.lineStyle(2, this.COLOR.BORDER, 1).strokeRoundedRect(X, y1, BW, BH, radius);

    layer.add([sh, g]);

    if (this.activityContainer) this.activityContainer.addAt(layer, 0);
    else this.add.existing(layer);

    return { layer, x: X, yTop: y1, yBottom: y2, w: BW, h: BH };
  }
  
  createProgressBar() {
    const y = 48;          // altura dentro do header
    const marginLeft = 60; // distância da borda esquerda

    const total = this.totalActivities || 9;

    // 👉 barra maior (chip branco)
    const chipHeight   = 40;   // antes 32
    const chipRadius   = 20;   // antes 18
    const innerPadding = 14;   // antes 12

    // 👉 barrinhas internas mais largas e altas
    const segmentGap    = 6;   // espaço entre elas
    const segmentWidth  = 24;  // antes 18
    const segmentHeight = 22;  // bem mais grossa que antes

    const innerWidth = total * segmentWidth + (total - 1) * segmentGap;
    const chipWidth  = innerWidth + innerPadding * 2;

    const COLOR_FILLED = 0xF97316; // laranja
    const COLOR_EMPTY  = 0xE5E7EB; // cinza clarinho
    const COLOR_BORDER = this.COLOR.BORDER || 0xD1D5DB;

    // limpa barra antiga
    if (this.progressCont) {
      this.progressCont.destroy(true);
      this.progressCont = null;
    }

    this.progressSegments = [];

    const cont = this.add
      .container(marginLeft + chipWidth / 2, y)
      .setDepth(120);

    // sombra
    const shadow = this.add.graphics();
    shadow
      .fillStyle(0x000000, 0.15)
      .fillRoundedRect(-chipWidth / 2, -chipHeight / 2 + 4, chipWidth, chipHeight, chipRadius);

    // fundo branco
    const bg = this.add.graphics();
    bg
      .fillStyle(0xFFFFFF, 0.98)
      .fillRoundedRect(-chipWidth / 2, -chipHeight / 2, chipWidth, chipHeight, chipRadius)
      .lineStyle(1.8, COLOR_BORDER, 1)
      .strokeRoundedRect(-chipWidth / 2, -chipHeight / 2, chipWidth, chipHeight, chipRadius);

    cont.add([shadow, bg]);

    // cria as barrinhas internas
    for (let i = 0; i < total; i++) {
      const x =
        -chipWidth / 2 +
        innerPadding +
        segmentWidth / 2 +
        i * (segmentWidth + segmentGap);

      const seg = this.add
        .rectangle(x, 0, segmentWidth, segmentHeight, COLOR_EMPTY)
        .setOrigin(0.5)
        .setStrokeStyle(1, COLOR_BORDER, 1)
        .setAlpha(0.95);

      this.progressSegments.push(seg);
      cont.add(seg);
    }

    this.progressCont = cont;

    // pinta conforme a atividade atual
    this.updateProgressBar();
  }
  
  updateProgressBar() {
    if (!this.progressSegments || this.progressSegments.length === 0) return;

    const total       = this.progressSegments.length;
    const filledCount = Phaser.Math.Clamp(this.currentActivity, 0, total);

    const COLOR_FILLED = 0xF97316;
    const COLOR_EMPTY  = 0xE5E7EB;

    this.progressSegments.forEach((seg, index) => {
      const shouldBeFilled = index < filledCount;
      const targetColor    = shouldBeFilled ? COLOR_FILLED : COLOR_EMPTY;

      if (seg.fillColor !== targetColor) {
        seg.fillColor = targetColor;

        // anima só a barrinha que acabou de acender
        if (shouldBeFilled && index === filledCount - 1) {
          this.tweens.add({
            targets: seg,
            scaleY: 1.25,
            duration: 140,
            yoyo: true,
            ease: 'Quad.easeOut'
          });
        }
      }
    });
  }
  // =========================
  // COMPONENTES VISUAIS REUTILIZÁVEIS (botões, cards, etc.)
  // =========================

  createModernButton(x, y, text, width = 160, height = 48, color = this.COLOR.PRIMARY, onClick = null) {
    const R = 10;
    const cont = this.add.container(x, y);

    // fundo flat com borda sutil
    const bg = this.add.graphics();
    bg.fillStyle(color, 1).fillRoundedRect(-width/2, -height/2, width, height, R)
      .lineStyle(2, 0x000000, 0.06).strokeRoundedRect(-width/2, -height/2, width, height, R);

    const label = this.add.text(0, 0, fixMojibake(text), {
      fontFamily: 'Quicksand, Arial, sans-serif',
      fontSize: '18px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    cont.add([bg, label]);
    cont.setSize(width, height).setInteractive() // só pra bloquear cliques no fundo;

    cont.on('pointerover', () => {
      this.tweens.add({
        targets: cont,
        scaleX: 1.04,
        scaleY: 1.04,
        duration: 120,
        ease: 'Quad.easeOut',
      });
    });
    cont.on('pointerout', () => {
      this.tweens.add({
        targets: cont,
        scaleX: 1.00,
        scaleY: 1.00,
        duration: 120,
        ease: 'Quad.easeOut',
      });
    });
    cont.on('pointerdown', () => {
      if (this.startInputCooldown && this.startInputCooldown(260)) return;

      this.tweens.add({ targets: cont, scaleX: 0.98, scaleY: 0.98, duration: 90, yoyo: true });
      if (onClick) onClick();
    });

    return cont;
  }

  // Botão redondo só com ícone (setinha)
  createCircleIconButton(x, y, icon = '▶', size = 72, color = this.COLOR.SUCCESS, onClick = null) {
    const cont = this.add.container(x, y);

    // sombra sutil
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.12).fillCircle(0, 6, size/2);
    // círculo
    const g = this.add.graphics();
    g.fillStyle(color, 1).fillCircle(0, 0, size/2)
      .lineStyle(2, 0x000000, 0.06).strokeCircle(0, 0, size/2);

    const label = this.add.text(0, 0, icon, {
      fontFamily: 'Quicksand, Arial, sans-serif',
      fontSize: `${Math.round(size * 0.5)}px`,
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    cont.add([shadow, g, label]);
    cont.setSize(size, size).setInteractive() // só pra bloquear cliques no fundo;

    cont.on('pointerover', () => this.tweens.add({ targets: cont, duration: 100, scale: 1.06 }));
    cont.on('pointerout',  () => this.tweens.add({ targets: cont, duration: 100, scale: 1.00 }));
    cont.on('pointerdown', () => {
      if (this.startInputCooldown && this.startInputCooldown(260)) return;

      this.tweens.add({ targets: cont, scaleX: 0.96, scaleY: 0.96, duration: 90, yoyo: true });
      if (onClick) onClick();
    });

    return cont;
  }

  createImageCard(x, y, imageKey, width = 200, height = 150, onClick = null) {
    const R = 14;
    const cont = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(0xFFFFFF).fillRoundedRect(-width/2, -height/2, width, height, R)
      .lineStyle(2, this.COLOR.BORDER).strokeRoundedRect(-width/2, -height/2, width, height, R);

    let img;
    if (this.textures.exists(imageKey)) {
      const tex = this.textures.get(imageKey).get();
      const fit = this.fitTexture(tex, width - 44, height - 44); // margem
      img = this.add.image(0, 0, imageKey).setDisplaySize(fit.w, fit.h);
    } else {
      img = this.add.rectangle(0, 0, width - 44, height - 44, 0xF3F4F6)
            .setStrokeStyle(2, this.COLOR.BORDER);
    }

    cont.add([bg, img]);
    cont.setSize(width, height).setInteractive({ useHandCursor: !!onClick });
    cont._avoidScale = true; // o stagger não escala (evita vazamento)

    cont.on('pointerover', () => this.tweens.add({ targets: cont, duration: 120, scale: 1.04, ease: 'Quad.easeOut' }));
    cont.on('pointerout',  () => this.tweens.add({ targets: cont, duration: 120, scale: 1.00, ease: 'Quad.easeIn' }));
    if (onClick) cont.on('pointerdown', () => {
      if (this.startInputCooldown && this.startInputCooldown(260)) return;
      onClick(imageKey, cont);
    });

    return cont;
  }
  // Marca visual de acerto: glow + badge ✓ + ripple

// Acerto: se for botão (tem _face) pinta a face de verde e dá um micro-bounce.
// Se for card/imagem, põe um highlight suave verde e some.
drawCheck(target, W, H, color = this.COLOR.SUCCESS) {
  if (!target) return;

  // Botões (makeChoiceButton / createSyllableButton) têm _face
  if (target._face) {
    this.tweenShake(target, 5, 1, 60);
    this.flashFaceColor(target, color, 320);
    return;
  }

  // Cards/imagens (efeito sutil que combina com o estilo)
  const overlay = this.add.graphics();
  overlay
    .fillStyle(color, 0.10) // antes era 0.16, agora mais suave
    .fillRoundedRect(-W/2, -H/2, W, H, 16)
    .lineStyle(3, color, 1)
    .strokeRoundedRect(-W/2, -H/2, W, H, 16);

  try { target.add(overlay); } catch { overlay.destroy(); return; }
  this.tweens.add({ targets: target, scaleX: 1.06, scaleY: 1.06, duration: 110, yoyo: true });
  this.tweens.add({ targets: overlay, alpha: 0, duration: 220, delay: 120, onComplete: () => overlay.destroy() });
}

// Erro: tremidinha curta; se for botão, face vermelha rápida; se for card, flash vermelho leve.
drawError(target, W, H, color = this.COLOR.DANGER) {
  if (!target) return;

  this.tweenShake(target, 8, 2, 60);

  if (target._face) {
    this.flashFaceColor(target, color, 420);
    return;
  }

  const overlay = this.add.graphics();
  overlay
    .fillStyle(color, 0.10) // antes era 0.14, agora mais suave
    .fillRoundedRect(-W/2, -H/2, W, H, 16)
    .lineStyle(3, color, 1)
    .strokeRoundedRect(-W/2, -H/2, W, H, 16);

  try { target.add(overlay); } catch { overlay.destroy(); return; }
  this.tweens.add({ targets: overlay, alpha: 0, duration: 200, ease: 'Quad.easeOut', onComplete: () => overlay.destroy() });
}

// Marca de acerto PERMANENTE (sem fade) para cards/imagens
markPermanentSuccess(target, W, H, color = this.COLOR.SUCCESS) {
  if (!target) return;
  
  // Se já tem um halo permanente, não adiciona outro
  if (target._permHalo) return;
  
  const halo = this.add.graphics();
  halo
    .fillStyle(color, 0.08)
    .fillRoundedRect(-W/2, -H/2, W, H, 16)
    .lineStyle(3, color, 0.9)
    .strokeRoundedRect(-W/2, -H/2, W, H, 16);

  try { target.add(halo); } catch { halo.destroy(); return; }
  target._permHalo = halo; // se um dia quiser remover manualmente
}

  // =========================
  // SONS E EFEITOS
  // =========================
  playClickSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.log('Áudio não suportado');
    }
  }
  
  playHoverSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.log('Áudio não suportado');
    }
  }
  
  playSuccessSound() {
    if (!this.sound) return;
    const key = 'sfx_acerto';
    try {
      if (!this.cache.audio.exists(key)) return;
      let s = this.sound.get(key);
      if (!s) s = this.sound.add(key);
      s.stop();
      s.play();
    } catch (e) {
      console.warn('Falha ao tocar som de acerto', e);
    }
  }

  playErrorSound() {
    if (!this.sound) return;
    const key = 'sfx_erro';
    try {
      if (!this.cache.audio.exists(key)) return;
      let s = this.sound.get(key);
      if (!s) s = this.sound.add(key);
      s.stop();
      s.play();
    } catch (e) {
      console.warn('Falha ao tocar som de erro', e);
    }
  }

  playCompletedSound() {
    if (!this.sound) return;
    const key = 'sfx_concluido';
    try {
      if (!this.cache.audio.exists(key)) return;
      let s = this.sound.get(key);
      if (!s) s = this.sound.add(key);
      s.stop();
      s.play();
    } catch (e) {
      console.warn('Falha ao tocar som de conclusão', e);
    }
  }

  startBackgroundMusic() {
    if (!this.sound) return;
    const key = 'bg_music_fase2';
    try {
      if (!this.cache.audio.exists(key)) return;
      
      // Para qualquer música anterior se existir
      if (this.bgMusic) {
        this.bgMusic.stop();
        this.bgMusic.destroy();
      }
      
      // Cria e inicia a música de fundo com loop
      this.bgMusic = this.sound.add(key, { loop: true, volume: 0.08 });
      this.bgMusic.play();
    } catch (e) {
      console.warn('Falha ao tocar música de fundo', e);
    }
  }

  stopBackgroundMusic() {
    if (this.bgMusic) {
      try {
        console.log('Fase2: parando música de fundo...');
        this.bgMusic.stop();
        this.bgMusic.destroy();
        this.bgMusic = null;
      } catch (e) {
        console.warn('Falha ao parar música de fundo', e);
      }
    }
  }

  // Apenas efeito visual de sucesso sobre um botão/contêiner (sem som/energia)
  flashSuccessOverlay(target) {
    if (!target) return;
    const w = target.width || target.displayWidth;
    const h = target.height || target.displayHeight;
    if (!w || !h) return;
    const ov = this.add.graphics();
    ov.fillStyle(this.COLOR.SUCCESS, 0.18)
      .fillRoundedRect(-w/2, -h/2, w, h, 14)
      .lineStyle(3, this.COLOR.SUCCESS, 1)
      .strokeRoundedRect(-w/2, -h/2, w, h, 14);
    try { target.add(ov); } catch(e) { ov.destroy(); return; }
    this.tweens.add({ targets: ov, alpha: { from: 0, to: 1 }, duration: 160, yoyo: true, ease: 'Quad.easeOut', onComplete: () => ov.destroy() });
  }

  // Feedback visual padronizado (agora também ajusta medidor)
  showSuccessFeedback(obj) {
    this.playSuccessSound();
    this.bumpEnergy(+1);
    this.tweens.add({
      targets: obj,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 200,
      yoyo: true,
      ease: 'Back.easeOut'
    });
    
    if (obj.setFillStyle) {
      const originalColor = obj.fillColor || this.COLOR.PRIMARY;
      obj.setFillStyle(this.COLOR.SUCCESS);
      this.time.delayedCall(400, () => obj.setFillStyle(originalColor));
    }
  }

  showErrorFeedback(obj) {
    // Conta erro da fase para calcular estrelas
    this.registerPhaseError();
    this.playErrorSound();
    this.bumpEnergy(-1);
    this.tweenShake(obj);
    
    if (obj.setFillStyle) {
      const originalColor = obj.fillColor || this.COLOR.PRIMARY;
      obj.setFillStyle(this.COLOR.DANGER);
      this.time.delayedCall(600, () => obj.setFillStyle(originalColor));
    }
  }

  // Mensagem de dica flutuante (desaparece sozinha)
  showHint(text) {
    const t = String(text || '');

    // Textos de ajuda que NÃO devem aparecer por enquanto
    const blockedHints = [
      'Escute a palavra falada e toque na imagem correspondente.',
      'Escute o som e toque na sílaba que começa a palavra.',
      'Toque apenas nas imagens cujos nomes começam com a letra C.',
      'Encontre a imagem que não combina com as outras.',
      'Arraste cada imagem para o cesto da sílaba correta: BA ou BO.',
      'Olhe a imagem e escolha a palavra que a descreve.',
      'Arraste as sílabas da bandeja para os espaços vazios e forme a palavra da imagem.',
      'Vire duas cartas iguais (sílaba e figura).',
      'Toque duas imagens para encontrar pares iguais. Lembre-se onde cada uma está!'
    ];

    if (blockedHints.some(h => t.includes(h))) {
      // TEMPORÁRIO: desativa esses textos de ajuda
      return;
    }

    const W = this.scale.width;
    const hint = this.add.text(W / 2, 96, fixMojibake(text), {
      fontFamily: 'Quicksand, Arial, sans-serif',
      fontSize: '20px',
      color: '#1F2937',
      backgroundColor: '#fff',
      padding: { x: 12, y: 6 }
    })
      .setOrigin(0.5)
      .setAlpha(0)
      .setDepth(2000);

    this.tweens.add({
      targets: hint,
      alpha: 1,
      y: 86,
      duration: 160,
      ease: 'Quad.easeOut'
    });

    this.time.delayedCall(2200, () => {
      this.tweens.add({
        targets: hint,
        alpha: 0,
        y: 76,
        duration: 160,
        ease: 'Quad.easeIn',
        onComplete: () => hint.destroy()
      });
    });
  }

  // =========================
  // NAVEGAÇÃO / PROGRESSO
  // =========================
  setupNavigation() {
    // Removemos a navegação por botões no rodapé.
    // A progressão agora é automática pelo pop-up de conclusão.
    this.btnPrevious?.destroy();
    this.btnMenu?.destroy();
    this.btnNext?.destroy();

    this.btnPrevious = null;
    this.btnMenu = null;
    this.btnNext = null;
  }
  
  updateNavigationButtons() {
    if (this.btnPrevious) {
      // Esconde "Anterior" quando currentActivity === 1
      this.btnPrevious.setVisible(this.currentActivity > 1);
    }
    if (this.btnNext) {
      const isLast = this.currentActivity >= this.totalActivities;
      const nextText = isLast ? 'Finalizar' : 'Próximo ▶';
      
      if (this.btnNext.list && this.btnNext.list.length > 0) {
        const label = this.btnNext.list.find(item => item.type === 'Text');
        if (label) label.setText(fixMojibake(nextText));
      }
      
      this.btnNext.setAlpha(1);
      this.btnNext.setInteractive() // só pra bloquear cliques no fundo;

      if (isLast && this.btnNext?.setSize) {
        this.btnNext.setSize(240, 48);
      }
    }
  }

  // SAVE: marca fase e atividades como conclu?das
  marcarFaseCompleta() {
    for (let i = 1; i <= this.totalActivities; i += 1) {
      SaveManager.updateActivity(this.phaseLetter, i, {
        completed: true,
        stars: this.getPhaseStars(),
        correct: 0,
        wrong: Math.max(0, this.phaseErrors || 0)
      });
    }

    const estrelas = this.savePhaseStars();

    // Marca que, ao voltar para o mapa, a fase 2 deve animar a ins?gnia
    localStorage.setItem('fase2ShouldAnimate', '1');
    return estrelas;
  }

  // UTILITÁRIOS GLOBAIS
  // =========================
  // ===== SISTEMA DE ÁUDIO GRAVADO (palavras, sílabas e help) =====
  // SISTEMA DE ÁUDIO GRAVADO movido para o bloco HELPERS acima
  
  handleWrong(target) {
    if (!target) return;
    this.tweens.killTweensOf(target);
    // Conta erro da fase (drag & drop errado, etc.)
    this.registerPhaseError();

    // trava a "casa" como a posição original da bandeja
    if (target._homeX === undefined) {
      target._homeX = (target.originalX !== undefined ? target.originalX : target.x);
      target._homeY = (target.originalY !== undefined ? target.originalY : target.y);
    }

    // feedback (balanço + flash vermelho opcional)
    this.tweenShake(target, 8, 2, 60);
    if (typeof target.setTint === 'function') target.setTint(0xff6b6b);

    // VOLTA para a bandeja e limpa tint
    this.time.delayedCall(180, () => {
      if (typeof target.clearTint === 'function') target.clearTint();
      this.returnToOrigin(target);            // usa originalX/Y + tween seguro
    });
  }

  // --- NOVO makeChoiceButton: botões em camadas + cores variadas ---
  makeChoiceButton(label, x, y, onClick) {
    const W = 220, H = 74, R = 18;

    // Tema fixo: azul (neutro)
    const theme = { base: 0x0EA5E9, dark: 0x0284C7, light: 0x38BDF8 };

    const btn = this.add.container(x, y).setSize(W, H).setInteractive() // só pra bloquear cliques no fundo;

    // sombra suave
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.12).fillRoundedRect(-W/2, -H/2 + 6, W, H, R);

    // "base" escura (borda inferior) para dar profundidade
    const base = this.add.graphics();
    base.fillStyle(theme.dark, 1).fillRoundedRect(-W/2, -H/2 + 2, W, H - 2, R);


  // face principal do botão
  const face = this.add.graphics();
  face.fillStyle(theme.base, 1).fillRoundedRect(-W/2, -H/2, W, H - 4, R);
  face.lineStyle(2, 0x000000, 0.06).strokeRoundedRect(-W/2, -H/2, W, H - 4, R);

  // guarda a cor original para o flashFaceColor voltar certinho
  face._lastColor = theme.base;

    // highlight fininho na borda superior (sem "reflexo" falso)
    const bevel = this.add.graphics();
    bevel.lineStyle(1, theme.light, 0.9).strokeRoundedRect(-W/2 + 2, -H/2 + 2, W - 4, H - 8, R - 3);

    // texto
    const txt = this.add.text(0, 0, label, {
      fontFamily: 'Quicksand, Arial, sans-serif',
      fontSize: '32px',
      fontStyle: '700',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    btn.add([shadow, base, face, bevel, txt]);

    // permita feedback bonito (pintar a face do botão)
    btn._face = face;
    btn._W = W; 
    btn._H = H; 
    btn._R = R;

    // hover/press
    btn.on('pointerover', () => {
      this.tweens.add({ targets: btn, scale: 1.035, duration: 110, ease: 'Quad.easeOut' });
    });
    btn.on('pointerout', () => {
      this.tweens.add({ targets: btn, scale: 1.00, duration: 110, ease: 'Quad.easeIn' });
    });
    btn.on('pointerdown', () => {
      // cooldown globalzinho de 220 ms pros botões de texto
      if (this.startInputCooldown && this.startInputCooldown(220)) return;

      this.playClickSound?.();
      this.tweens.add({ targets: btn, scaleX: 0.98, scaleY: 0.98, duration: 90, yoyo: true });
      if (onClick) onClick(btn);
    });

    // util (se precisar desativar/ativar)
    btn.setEnabled = (v) => v
      ? btn.setAlpha(1).setInteractive() // só pra bloquear cliques no fundo
      : btn.setAlpha(0.55).disableInteractive();

    return btn;
  }

  // Gera textura lisa branca com borda cinza (agora com raio configurável)
  makeCardSkin(key, w, h, r = 22) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xFFFFFF, 1).fillRoundedRect(0, 0, w, h, r);
    g.lineStyle(2, 0xE5E7EB, 1).strokeRoundedRect(0, 0, w, h, r);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  // Abre todas as cartas e fecha depois de ms (bloqueio controlado por quem chama)
  revealAll(cards, ms = 5000, onDone = null) {
    cards.forEach(c => this.flip(c, true));
    this.time.delayedCall(ms, () => {
      cards.forEach(c => this.flip(c, false));
      if (typeof onDone === 'function') onDone();
    });
  }

  flip(card, showFace) {
    this.tweens.add({
      targets: card, scaleX: 0, duration: 120, yoyo: true, onYoyo: () => {
        card.setTexture(showFace ? card.getData('faceKey') : 'card-bg');
      }
    });
  }

  // =========================
  // ATIVIDADES
  // =========================
  // Envolve a troca com transição
  goToActivity(n) {
    // anima saída
    if (this.activityContainer && this.activityContainer.list.length) {
      this.tweens.add({
        targets: this.activityContainer,
        alpha: 0, y: -10,
        duration: 160,
        ease: 'Quad.easeIn',
        onComplete: () => {
          this.showActivity(n, /*withIntro*/ true);
        }
      });
    } else {
      this.showActivity(n, /*withIntro*/ true);
    }
  }

  // Versão com intro animada
  showActivity(n, withIntro=false) {
    // Proteção contra chamadas múltiplas simultâneas
    if (this._showingActivity) return;
    this._showingActivity = true;
    
    this.updateProgressBar();
    this.doClearActivity();

    // Reset da flag de atividade completada para permitir nova conclusão
    this._activityCompleted = false;

    // Navegação livre habilitada
    this.updateNavigationButtons();

    // Cooldown breve ao entrar na atividade para evitar cliques frenéticos logo de cara
    if (this.startInputCooldown) {
      this.startInputCooldown(400);
    }
    
    // cria atividade (nova ordem pedagógica)
    switch (n) {
      case 1: this.setupAtividade8(); break; // A8 → Ouça e toque a imagem correta
      case 2: this.setupAtividade1(); break; // A1 → Toque na sílaba inicial (2 opções)
      case 3: this.setupAtividade2(); break; // A2 → Toque nas imagens que começam com /c/
      case 4: this.setupAtividade4(); break; // A4 → Toque o intruso (NÃO começa com CO)
      case 5: this.setupAtividade5(); break; // A5 → Arraste para o cesto correto (CA × CO)
      case 6: this.setupAtividade3(); break; // A3 → Qual palavra combina com a figura? (3 opções)
      case 7: this.setupAtividade7(); break; // A7 → Arraste sílabas para montar a palavra
      case 8: this.setupAtividade6(); break; // A6 → Memória (2→3→4 pares progressão)
      case 9: this.setupAtividade9(); break; // A9 → Arraste a sílaba inicial para cada imagem
      default: this.showPlaceholder(n);
    }



    if (withIntro && this.activityContainer) {
      this.activityContainer.setAlpha(0).setY(10);
      this.tweens.add({
        targets: this.activityContainer,
        alpha: 1, y: 0,
        duration: 220,
        ease: 'Quad.easeOut',
        onComplete: () => {
          // Reset da flag após animação completa
          this._showingActivity = false;
        }
      });
    } else {
      // Reset da flag imediatamente se não há animação
      this._showingActivity = false;
    }


  }

  doClearActivity() {
    // 0) Cancelar timer de áudio pendente
    if (this._afterTitleTimer) {
      this._afterTitleTimer.remove(false);
      this._afterTitleTimer = null;
    }

    // 1) Remover listeners globais
    this.input.off('dragstart'); this.input.off('drag');
    this.input.off('dragend');   this.input.off('drop');

    // 2) Destruir containers específicos se existirem
    ['a1','a2','a3','a4','a5','a6','a7','a8','a9'].forEach(k=>{
      const c = this[`${k}C`]; 
      if (c) { 
        c.list?.forEach(o=>o.removeAllListeners?.());
        c.destroy(true); 
        this[`${k}C`]=null; 
      }
    });

    // 3) Container raiz
    if (this.activityContainer){
      this.activityContainer.list?.forEach(o=>o.removeAllListeners?.());
      this.activityContainer.destroy(true);
    }
    this.activityContainer = this.add.container(0,0);

    // 4) Teardown específico da A9 e limpeza defensiva
    this.teardownA9?.();
    this.clearA9Artifacts?.();
  }

  showPlaceholder(n) {
    const W = this.scale.width, H = this.scale.height;
    const placeholder = this.add.text(W/2, H/2, 
      `Atividade ${n}\n(Em desenvolvimento)`, {
      fontSize: '32px',
      color: '#666666',
      fontFamily: 'Quicksand, Arial, sans-serif',
      align: 'center'
    }).setOrigin(0.5);
    this.activityContainer.add(placeholder);
  }

  // POP-UP de conclusão (sem "Repetir" e só com setinha)
  showCompletion(message = "Atividade conclu�da!") {
    // Evita múltiplas chamadas de showCompletion na mesma atividade
    if (this._activityCompleted) return;
    this._activityCompleted = true;
    // SAVE: updateActivity ao concluir
    SaveManager.updateActivity(this.phaseLetter, this.currentActivity, {
      completed: true,
      stars: this.getPhaseStars(),
      correct: 0,
      wrong: Math.max(0, this.phaseErrors || 0)
    });


    const isLast = (this.currentActivity >= this.totalActivities);

    const nextFn = () => {
      if (isLast) {
        this.marcarFaseCompleta();
        this.showPhaseCompletedModal();
      } else {
        this.currentActivity++;
        this.goToActivityPalm(this.currentActivity);
        this.updateNavigationButtons();
      }
    };

    // usa o pop-up em formato vertical (retrato)
    this.showEndModalPortrait(nextFn);
  }

  // Pop-up de conclusao em formato vertical (retangulo em pe)
  showEndModalPortrait(nextFn) {
    const scene = this;
    const w = scene.scale.width;
    const h = scene.scale.height;

    const ui = scene.add.container(0, 0).setDepth(2000);

    // overlay escuro - apenas bloqueia cliques, sem responder
    const overlay = scene.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.45)
      .setInteractive()
      .removeAllListeners(); // remove qualquer listener que possa existir
    ui.add(overlay);
    
    // Garante que o overlay não responde a nenhum evento
    overlay.off('pointerup');
    overlay.off('pointerdown');

    // dimensoes do cartao (vertical)
    const cx = Math.floor(w / 2);
    const cy = Math.floor(h / 2);
    const cardW = Math.min(440, Math.floor(w * 0.76));
    const cardH = Math.min(460, Math.floor(h * 0.64));

    // sombra e cartao
    const shadow = scene.add.graphics();
    shadow.fillStyle(0x000000, 0.16)
      .fillRoundedRect(cx - cardW / 2, cy - cardH / 2 + 8, cardW, cardH, 24);
    ui.add(shadow);

    const card = scene.add.graphics();
    card.fillStyle(0xFFFFFF, 1)
      .fillRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 24);
    card.lineStyle(2, 0xE5E7EB, 1)
      .strokeRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 24);
    ui.add(card);

    // Título (imagem/texto) um pouco mais abaixo do topo
    const isLast = (this.currentActivity >= this.totalActivities);
    const title = scene.add.text(cx, cy - cardH / 2 + 66, fixMojibake('Muito bem!'), {
      fontFamily: 'Quicksand, Arial, sans-serif',
      fontSize: '28px',
      color: '#111827',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);
    ui.add(title);

    // Se existir a imagem do título, usa ela (sem subtítulo)
    if (scene.textures.exists('titulo_muito_bem')) {
      const titleImg = scene.add.image(cx, title.y, 'titulo_muito_bem').setOrigin(0.5);
      const maxW = Math.floor(cardW * 0.7);
      const s = Math.min(maxW / titleImg.width, 1.0);
      titleImg.setScale(s);
      ui.add(titleImg);
      title.setVisible(false);
    }

    // --- Mascote central (MAIOR) ---
    let mascot = null;
    let _mascotTargetW = 0;
    if (scene.textures.exists('papagaio_joinha')) {
      mascot = scene.add.image(cx, cy + 8, 'papagaio_joinha');
      const maxW = cardW * 0.75;
      const maxH = cardH * 0.55;
      const s = Math.min(maxW / mascot.width, maxH / mascot.height);
      mascot.setScale(s * 0.82).setAlpha(0).setAngle(-6);
      mascot.y += 12;
      ui.add(mascot);

      // animação de aparecer + flutuar
      scene.tweens.add({ targets: mascot, alpha: 1, y: mascot.y - 12, angle: 0, scale: s, duration: 420, ease: 'Back.Out' });
      mascot._idleTween = scene.tweens.add({
        targets: mascot,
        y: { from: mascot.y - 4, to: mascot.y + 4 },
        duration: 1600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut'
      });
      _mascotTargetW = mascot.width * s;
    }

    const cleanup = () => { try { ui.destroy(true); } catch (e) {} };

    // trava para não chamar nextFn duas vezes com cliques frenéticos
    let alreadyHandled = false;
    let nextFnCalled = false;
    const handleNext = () => {
      if (alreadyHandled || nextFnCalled) return;
      if (scene._modalShown) return; // proteção global adicional
      if (scene._navigationInProgress) return; // nova proteção para navegação em andamento
      
      alreadyHandled = true;
      nextFnCalled = true;
      scene._modalShown = true;
      scene._navigationInProgress = true;

      try { scene.playSuccessSound?.(); } catch (e) {}
      cleanup();
      
      if (typeof nextFn === 'function') {
        // Delay antes de executar nextFn para garantir que cliques múltiplos sejam ignorados
        scene.time.delayedCall(150, () => {
          if (!nextFnCalled) return; // dupla verificação
          
          nextFn();
          
          // Reset das flags após a transição estar completa
          scene.time.delayedCall(500, () => {
            scene._modalShown = false;
            scene._navigationInProgress = false;
          });
        });
      }
    };

    // botao de avancar no rodape do cartao
    let cta;
    const btnY = cy + cardH / 2 - 60;
    if (scene.textures.exists('popup_next')) {
      cta = scene.add.image(cx, btnY, 'popup_next')
        .setInteractive() // só pra bloquear cliques no fundo;

      // botão bem mais largo que o mascote
      const targetW = Math.min(cardW * 0.97, Math.max(_mascotTargetW * 1.30, cardW * 0.70));
      const maxBtnH = 140;
      const baseScale = Math.min(targetW / cta.width, maxBtnH / cta.height);
      cta.setScale(baseScale);
      ui.add(cta);

      // efeito HOVER (passar o mouse)
      cta.on('pointerover', () => {
        scene.tweens.add({ targets: cta, scaleX: baseScale * 1.10, scaleY: baseScale * 1.10, duration: 140, ease: 'Quad.Out' });
      });
      cta.on('pointerout', () => {
        scene.tweens.add({ targets: cta, scaleX: baseScale, scaleY: baseScale, duration: 140, ease: 'Quad.Out' });
      });

      let buttonClicked = false; // flag específica do botão
      cta.on('pointerdown', () => {
        // Proteção tripla: cooldown global + flag específica do botão + navegação em progresso
        if (buttonClicked) return;
        if (scene._navigationInProgress) return;
        if (scene.startInputCooldown && scene.startInputCooldown(400)) return;
        
        buttonClicked = true; // desabilita o botão imediatamente
        cta.disableInteractive(); // desabilita completamente a interatividade
        
        // Remove todos os listeners de hover para evitar interferência
        cta.off('pointerover');
        cta.off('pointerout');

        scene.tweens.add({
          targets: cta,
          scaleX: baseScale * 0.92,
          scaleY: baseScale * 0.92,
          duration: 90,
          yoyo: true,
          onComplete: () => {
            handleNext();
          }
        });
      });
    } else {
      // Fallback texto
      const btnLabel = isLast ? fixMojibake('Finalizar') : fixMojibake('Próxima atividade');
      cta = scene.createModernButton(
        cx,
        btnY,
        fixMojibake('Próxima atividade'),
        Math.min(260, Math.floor(cardW * 0.8)),
        56,
        scene.COLOR.SUCCESS,
        handleNext
      );
      ui.add(cta);
    }

    // animacao de aparicao
    ui.setAlpha(0);
    ui.setScale(0.96);
    scene.tweens.add({ targets: ui, alpha: 1, duration: 160, ease: 'Quad.Out' });
    scene.tweens.add({ targets: ui, scale: 1, duration: 220, ease: 'Back.Out' });

    // confete caindo pela tela toda

    // confete caindo pela tela inteira (do topo da tela)
    const makeConfettiTextureOnce = (sc) => {
      if (sc.textures.exists('confettiDot')) return;
      const g = sc.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1).fillCircle(4, 4, 4);
      g.generateTexture('confettiDot', 8, 8);
      g.destroy();
    };

    try {
      makeConfettiTextureOnce(scene);

      const halfW = w / 2;

      // Emissor principal: faixa grande no topo da TELA
      const emitter = scene.add.particles(w / 2, -20, 'confettiDot', {
        // espalha quase a largura toda da tela
        x: { min: -halfW + 40, max: halfW - 40 },
        y: { min: 0, max: 40 },
        speed: { min: 120, max: 260 },
        angle: { min: 80, max: 100 },
        gravityY: 420,
        lifespan: 1400,
        quantity: 22,
        tint: [0xF59E0B, 0x22C55E, 0x3B82F6, 0xEF4444, 0xA855F7],
        scale: { start: 1.0, end: 0.4 }
      }).setDepth(2001);

      ui.add(emitter);
      scene.time.delayedCall(700, () => emitter.stop());

      // Emissores extras nas laterais da tela (esquerda e direita)
      const ensureConfetti = (sc) => {
        if (!sc.textures.exists('confettiSquare')) {
          const g2 = sc.make.graphics({ x: 0, y: 0, add: false });
          g2.fillStyle(0xffffff, 1).fillRect(0, 0, 8, 8);
          g2.generateTexture('confettiSquare', 8, 8);
          g2.destroy();
        }
      };
      ensureConfetti(scene);

      const topY = -20;                // um pouco acima do topo da tela
      const sidePadding = 56;
      const leftX  = sidePadding;      // lado esquerdo da tela
      const rightX = w - sidePadding;  // lado direito da tela

      const colors = [0xF59E0B, 0x22C55E, 0x3B82F6, 0xEF4444, 0xA855F7, 0x06B6D4];
      const common = {
        x: { min: -30, max: 30 },
        speed: { min: 140, max: 260 },
        angle: { min: 70, max: 110 },
        gravityY: 420,
        lifespan: 1500,
        quantity: 0,
        frequency: 40,
        tint: colors,
        rotate: { start: 0, end: 360 },
        scale: { start: 1.0, end: 0.6 },
        alpha: { start: 1, end: 0.6 }
      };

      const leftA  = scene.add.particles(leftX,  topY, 'confettiDot',    common).setDepth(2001);
      const leftB  = scene.add.particles(leftX,  topY, 'confettiSquare', common).setDepth(2001);
      const rightA = scene.add.particles(rightX, topY, 'confettiDot',    common).setDepth(2001);
      const rightB = scene.add.particles(rightX, topY, 'confettiSquare', common).setDepth(2001);

      ui.add(leftA); ui.add(leftB); ui.add(rightA); ui.add(rightB);

      // para de emitir depois de um tempo
      scene.time.delayedCall(900, () => {
        leftA.stop(); leftB.stop(); rightA.stop(); rightB.stop();
      });

      // limpa tudo quando fechar o pop-up
      const stopAllExtra = () => {
        try { leftA.destroy(); } catch(_) {}
        try { leftB.destroy(); } catch(_) {}
        try { rightA.destroy(); } catch(_) {}
        try { rightB.destroy(); } catch(_) {}
        try { emitter.destroy(); } catch(_) {}
        if (mascot?._idleTween) {
          try { mascot._idleTween.stop(); } catch (_) {}
        }
      };

    // overlay só limpa confetes/mascote, mas NÃO avança de atividade
    overlay.once('pointerup', stopAllExtra);
    if (cta) cta.once('pointerdown', stopAllExtra);
  } catch (e) {
    // se der erro ao criar confete, não fazemos nada especial no overlay;
    // ele continua apenas bloqueando cliques no fundo.
  }

    // som ao abrir
    this.playSuccessSound?.();
  }

  // Pop-up de conclus�o � vers�o polida com uma setinha
  setupAtividade1() {
    // A1 — placa do tamanho que você marcou (entra um pouco acima do título e para bem antes dos botões)
    const a1Back = this.addActivityBackdrop({
      top: this.LAYOUT.titleY - 8,
      bottom: this.LAYOUT.footerY() - 110,
      paddingX: 120
    });
    this._a1Back = a1Back;
  this.makeTitle('Que sílaba começa?');
    this.playTitleAudio(2);

    this.addTutorialButton(
      a1Back,
      'Escute o som e toque na sílaba que começa a palavra.',
      'help_a2_que_silaba_comeca'
    );

    // Cobertura balanceada de todas as 5 sílabas C
    const allOptions = [
      { image:'casa',     correct:'CA' },
      { image:'cana',     correct:'CA' },
      { image:'cadeado',  correct:'CA' },
      { image:'cebola',   correct:'CE' },
      { image:'cenoura',  correct:'CE' },
      { image:'cidade',   correct:'CI' },
      { image:'circo',    correct:'CI' },
      { image:'coelho',   correct:'CO' },
      { image:'copo',     correct:'CO' },
      { image:'corda',    correct:'CO' },
      { image:'cubo',     correct:'CU' },
      { image:'curativo', correct:'CU' },
      { image:'cola',     correct:'CO' },
    ];

    // Garante pelo menos 1 de cada sílaba, depois completa aleatoriamente
    const required = ['CA','CE','CI','CO','CU'];
    const selected = [];
    
    required.forEach(syl => {
      const matches = allOptions.filter(opt => opt.correct === syl);
      selected.push(Phaser.Utils.Array.GetRandom(matches));
    });
    
    Phaser.Utils.Array.Shuffle(selected);
    
    this.a1List = selected.map(item => ({
      ...item,
      wrong: Phaser.Utils.Array.GetRandom(['CA','CE','CI','CO','CU'].filter(s => s !== item.correct))
    }));
    
    this.a1List = Phaser.Utils.Array.Shuffle(this.a1List).slice(0,4);
    this.a1i = 0;
    this._lockA1 = false;
    this._a1FirstRound = true;

    this.renderA1();
  }

renderA1() {
  // 1. Resetar o estado de travas no começo da função
  this._lockA1 = false;
  this.__clickCooldown = false;
  
  // Cancelar qualquer timer de cooldown anterior que possa estar rodando
  if (this._a1CooldownTimer) {
    this._a1CooldownTimer.remove(false);
    this._a1CooldownTimer = null;
  }

  this.clearA9Artifacts(); // limpeza defensiva
  if (this.a1C) this.a1C.destroy(true);
  this.a1C = this.add.container(0,0);
  this.activityContainer.add(this.a1C);

  const bk   = this._a1Back;                 // limites da placa branca
  const midX = this.scale.width / 2;

  const r = this.a1List[this.a1i];

  const delay = this._a1FirstRound ? TITLE_AUDIO_GAP_MS : 600;
  this._a1FirstRound = false;

  // título já foi tocado no setupAtividade1 com playTitleAudio(2)
  // aqui só agendamos o áudio da palavra/sílaba:
  this.queueAfterTitle(() => {
    try {
      // Fala o nome da figura (ex: "bola", "bota"), não a sílaba
      this.playWordAudio(r.image);
    } catch (e) {}
  }, delay);

  // Mapeia imagem para palavra completa
  const wordMap = {
    'casa': 'CASA', 'cana': 'CANA', 'cadeado': 'CADEADO', 'cavalo': 'CAVALO',
    'caneca': 'CANECA', 'canoa': 'CANOA', 'canudo': 'CANUDO',
    'cebola': 'CEBOLA', 'cenoura': 'CENOURA',
    'cidade': 'CIDADE', 'circo': 'CIRCO',
    'coelho': 'COELHO', 'copo': 'COPO', 'corda': 'CORDA',
    'cubo': 'CUBO', 'curativo': 'CURATIVO', 'cola': 'COLA'
  };
  const currentWord = wordMap[r.image] || r.image.toUpperCase();
  const cardW = 260, cardH = 200;
  const cardX = midX;
  const cardY = Math.round(bk.yTop + bk.h * 0.46);
  const card  = this.drawCard(cardX, cardY, cardW, cardH, this.COLOR.BORDER);
  this.a1C.add(card.img);

  // Imagem central com "fit" (menor e clicável)
  let img;
  if (this.textures.exists(r.image)) {
    const tex = this.textures.get(r.image).get();
    const maxW = 230;
    const maxH = 190;
    const fit = this.fitTexture(tex, maxW, maxH);
    img = this.add.image(cardX, cardY - 10, r.image)
      .setDisplaySize(fit.w, fit.h)
      .setInteractive() // só pra bloquear cliques no fundo
      .on('pointerdown', () => {
        if (this.startInputCooldown && this.startInputCooldown(260)) return;

        // animaçãozinha rápida
        this.tweens.add({
          targets: img,
          scaleX: img.scaleX * 0.95,
          scaleY: img.scaleY * 0.95,
          duration: 80,
          yoyo: true,
          ease: 'Quad.easeOut'
        });
        // fala o nome da figura (BOTA, BOLA, BULE…)
        this.playWordAudio(r.image);
      });
  } else {
    img = this.add.rectangle(cardX, cardY - 10, 230, 190, 0xF3F4F6)
          .setStrokeStyle(2, this.COLOR.BORDER);
  }
  this.a1C.add(img);

  // Linha de botões (posição mais baixa com botões menores)
  const rowY = cardY + cardH/2 + 62; // desce mais 12px para dar mais respiro
  
  // 2. Controlar todos os botões da rodada em um array
  const a1Buttons = [];
  
  const makeBtn = (label) => {
    const btn = this.createSyllableButton(0, 0, label, this.COLOR.SYLLABLE, 120, 90, 22);
    
    // Inicialmente desabilitado até a animação terminar
    btn.disableInteractive();
    
    // Guardar o botão dessa rodada
    a1Buttons.push(btn);
    
    btn.on('pointerover', () => this.tweens.add({ targets: btn, duration: 100, scale: 1.03 }));
    btn.on('pointerout',  () => this.tweens.add({ targets: btn, duration: 100, scale: 1.00 }));
    btn.on('pointerdown', () => {
      if (this._lockA1) return;                 // já tem alguém sendo avaliado
      
      // 3. Travar todos os botões assim que um é clicado
      this._lockA1 = true;
      a1Buttons.forEach(b => b.disableInteractive());

      const ok = (label === r.correct);

      if (ok) {
        // 4. No caso de ACERTO: mantém toda a lógica existente
        this.animateSyllable(btn, true);
        this.time.delayedCall(this.SUCCESS_DELAY, () => {
          this.a1i++;
          this._lockA1 = false;                 // libera antes de chamar a próxima
          if (this.a1i < this.a1List.length) {
            this.renderA1();
          } else {
            this.showCompletion();
          }
        });

      } else {
        // 5. No caso de ERRO: reabilita botões após delay
        this.animateSyllable(btn, false);
        // Conta erro desta atividade
        this.registerPhaseError();
        this.time.delayedCall(800, () => {      // 800 ms = 0,8s; ajusta se quiser
          this._lockA1 = false;
          a1Buttons.forEach(b => b.setInteractive());
        });
      }
    });
    this.a1C.add(btn);
    return btn;
  };

  const options = Math.random() > 0.5 ? [r.correct, r.wrong] : [r.wrong, r.correct];
  const btns = options.map(makeBtn);
  this.placeRow(btns, midX, rowY, 40, /*setOrigin=*/true);

  // Entrada suave dos elementos
  this.staggerIn([card.img, img, ...btns], { delay: 35 });
  
  // Garantir que os botões só fiquem interativos após a animação de entrada
  this.time.delayedCall(btns.length * 35 + 100, () => {
    // Verificação dupla: só habilita se não estiver travado
    if (!this._lockA1) {
      a1Buttons.forEach(b => {
        if (b && b.setInteractive) b.setInteractive();
      });
    }
  });
}

  // =============== A2 — Clique nas imagens que começam com /b/
  setupAtividade2() {
    const a2Back = this.addActivityBackdrop({
      top: this.LAYOUT.titleY - 8,
      bottom: this.LAYOUT.footerY() - 110,
      paddingX: 64
    });
    this._a2Back = a2Back;
  this.makeTitle('Figuras com C');
    this.playTitleAudio(3);

    this.addTutorialButton(
      a2Back,
      'Toque apenas nas imagens cujos nomes começam com a letra C.',
      'help_c_a3_figuras_com_c'
    );

    this.a2Rounds = [
      // 3 corretas (começam com C) + 3 distratoras (NÃO começam com C)
      ["casa","cana","cadeado","gato","pato","vela"],
      ["cebola","cenoura","cidade","dado","gato","pato"]
    ];
    this.a2RoundIndex = 0;
    this.renderA2Round();
  }

  renderA2Round() {
    this.clearA9Artifacts(); // limpeza defensiva
    if (this.a2C) this.a2C.destroy(true);
    this.a2C = this.add.container(0,0);
    this.activityContainer.add(this.a2C);
    this.a2Cards = [];

    const bk = this._a2Back;
    const imgs = Phaser.Utils.Array.Shuffle(this.a2Rounds[this.a2RoundIndex].slice());

    const CW = 200, CH = 200;
    const GX = 28,  GY = 20;
    const cols = 3, rows = 2;
    const cx = this.scale.width / 2;
    const cy = Math.round(bk.yTop + bk.h * 0.56);

    const totW = cols*CW + (cols-1)*GX;
    const totH = rows*CH + (rows-1)*GY;
    const sx = cx - totW/2 + CW/2;
    const sy = cy - totH/2 + CH/2;

    this.a2_total = imgs.filter(n => n[0]==='c').length;
    this.a2_hits  = 0;

    imgs.forEach((key,i)=>{
      const col=i%3,row=(i/3|0);
      const x = sx + col*(CW+GX), y = sy + row*(CH+GY);
      const cont = this.createImageCard(x,y,key,CW,CH);
      this.a2C.add(cont);
      this.a2Cards.push(cont);
      cont._done=false; cont._isC = (key[0]==='c');
      cont.setInteractive({useHandCursor:true});
      cont.on('pointerdown', ()=>{
        if (cont._done) return;
        if (this._activityCompleted) return; // proteção global adicional
        if (this.startInputCooldown && this.startInputCooldown(260)) return;

        // Removido: playWordAudio(key) para deixar mais visual
        // this.playWordAudio(key);

        if (cont._isC) {
          // Marca como feito ANTES de qualquer ação para evitar cliques múltiplos
          cont._done = true;
          cont.disableInteractive();
          
          this.playSuccessSound();
          this.bumpEnergy(+1);
          this.markPermanentSuccess(cont, CW, CH);  // fica verde até trocar de rodada
          
          // Garantir que a imagem permanece totalmente opaca
          cont.setAlpha(1.0);
          
          this.a2_hits++;
          
          if (this.a2_hits >= this.a2_total) {
            // Proteção adicional: desabilita todas as imagens imediatamente
            this.a2Cards.forEach(card => {
              if (!card._done) {
                card._done = true;
                card.disableInteractive();
              }
            });
            
            this.time.delayedCall(this.SUCCESS_DELAY, () => {
              if (this.a2RoundIndex < this.a2Rounds.length - 1) {
                this.transitionStep('a2C', () => { this.a2RoundIndex++; this.renderA2Round(); }, 'slideLeft');
              } else {
                this.showCompletion();
              }
            });
          }
        } else {
          // ERRO: flash vermelho + shake rápido e sem "dica" em texto
          this.drawError(cont, CW, CH, this.COLOR.DANGER);
          this.tweenShake(cont);
          this.playErrorSound();
          this.bumpEnergy(-1);
          // Conta erro desta atividade
          this.registerPhaseError();
        }
      });
    });

    this.staggerIn(this.a2Cards, { delay: 35 });
    
    // Garantir que todas as cartas ficam com alpha 1.0 completo após animação
    this.time.delayedCall(this.a2Cards.length * 35 + 250, () => {
      this.a2Cards.forEach(card => {
        if (card && card.setAlpha) card.setAlpha(1.0);
      });
    });
  }

  // =============== A4 — Palavra × Figura (múltipla escolha) com dicas progressivas
  setupAtividade3() {
    const a4Back = this.addActivityBackdrop({
      top: this.LAYOUT.titleY - 8,
      bottom: this.LAYOUT.footerY() - 110,
      paddingX: 80
    });
    this._a4Back = a4Back;
  this.makeTitle('Que palavra é essa?');
    this.playTitleAudio(6);

    this.addTutorialButton(
      a4Back,
      'Olhe a imagem e escolha a palavra que a descreve.',
      'help_a6_que_palavra_e_essa'
    );
    this.a4List = [
      { image:'casa',    correct:'CASA',     options:['CASA','CANECA','CUBO'] },
      { image:'caneca',  correct:'CANECA',   options:['CANECA','CASA','COPO'] },
      { image:'coelho',  correct:'COELHO',   options:['COELHO','COPO','CORDA'] },
      { image:'cubo',    correct:'CUBO',     options:['CUBO','CASA','COPO'] },
      { image:'cenoura', correct:'CENOURA',  options:['CENOURA','CEBOLA','CIDADE'] },
    ];
    this.a4i=0; this.renderA4();
  }

  renderA4() {
    if (this.a4Root) this.a4Root.destroy(true);
    if (this.a4Buttons) this.a4Buttons.forEach(b => b.destroy());

    const W  = this.scale.width;
    const bk = this._a4Back;
    const r  = this.a4List[this.a4i];

    this._a4Resolved = false;
    this._a4Eliminated = false;
    this.a4Attempts = 0;
    this.a4Root = this.add.container(W / 2, 0);
    this.activityContainer.add(this.a4Root);

    const C = this.add.container(0, 0);
    this.a4Root.add(C);
    this.a4Buttons = [];

    // ---------- imagem principal aumentada ~15% ----------
    const SCALE = 0.95; // aumentado de 0.82

    // Cartão + imagem (aumentados)
    const CARD_W   = Math.round(340 * SCALE);
    const CARD_H   = Math.round(220 * SCALE);
    const cardTopY = Math.round(bk.yTop + bk.h * 0.31); // levemente mais para baixo

    const card = this.drawCard(0, cardTopY, CARD_W, CARD_H);

    let imgNode;
    if (this.textures.exists(r.image)) {
      const tex   = this.textures.get(r.image).get();
      const innerW = CARD_W - 80;           // imagem um pouco maior
      const innerH = CARD_H - 86;
      const fit   = this.fitTexture(tex, innerW, innerH);
      // agora a imagem FICA pequena, não passa do cartão
      imgNode = this.add.image(0, cardTopY - 4, r.image).setDisplaySize(fit.w, fit.h);
      imgNode._avoidScale = true;
    } else {
      imgNode = this.add.rectangle(0, cardTopY, CARD_W - 86, CARD_H - 96, 0xF3F4F6)
                .setStrokeStyle(2, this.COLOR.BORDER);
      imgNode._avoidScale = true;
    }

    C.add(card.img);
    C.add(imgNode);
    C.bringToTop(imgNode);

    // Tornar a imagem clicável para tocar o áudio
    imgNode.setInteractive({ useHandCursor: true });

    // Guardar escala original para animações proporcionais
    imgNode._baseScaleX = imgNode.scaleX;
    imgNode._baseScaleY = imgNode.scaleY;

    // Efeito hover suave
    imgNode.on('pointerover', () => {
      this.tweens.add({
        targets: imgNode,
        scaleX: imgNode._baseScaleX * 1.03,
        scaleY: imgNode._baseScaleY * 1.03,
        duration: 120,
        ease: 'Quad.easeOut'
      });
    });

    imgNode.on('pointerout', () => {
      this.tweens.add({
        targets: imgNode,
        scaleX: imgNode._baseScaleX,
        scaleY: imgNode._baseScaleY,
        duration: 120,
        ease: 'Quad.easeIn'
      });
    });

    imgNode.on('pointerdown', () => {
      if (this._a4Resolved || this._a4ClickLock) return;
      if (this.startInputCooldown && this.startInputCooldown(260)) return;

      // 1) Falar o nome da figura
      this.playWordAudio(r.image);

      // 2) Pulinho rápido sem sair da moldura
      this.tweens.add({
        targets: imgNode,
        scaleX: imgNode._baseScaleX * 1.05,
        scaleY: imgNode._baseScaleY * 1.05,
        duration: 110,
        yoyo: true,
        ease: 'Back.easeOut'
      });
    });

    // ===== Painel dos botões – 3 em coluna, mais compactos =====
    let BTN_W = 260;   // antes 280
    let BTN_H = 62;    // antes 68
    const GAP  = 14;   // antes 18
    const PADX = 26;   // antes 32
    const PADY = 16;   // antes 20

    const labels = Phaser.Utils.Array.Shuffle((r.options || []).slice()).slice(0, 3);

    // largura/altura do painel
    let PANEL_W = BTN_W + PADX * 2;
    let PANEL_H = labels.length * BTN_H + (labels.length - 1) * GAP + PADY * 2;

    const MAX_PANEL_W = Math.min(this._a4Back.w - 48, 720);
    const MAX_PANEL_H = Math.min(this._a4Back.h - 200, 400);
    if (PANEL_W > MAX_PANEL_W) { BTN_W = MAX_PANEL_W - PADX * 2; PANEL_W = BTN_W + PADX * 2; }
    if (PANEL_H > MAX_PANEL_H) { BTN_H = Math.floor((MAX_PANEL_H - PADY * 2 - (labels.length - 1) * GAP) / labels.length);
                                 PANEL_H = labels.length * BTN_H + (labels.length - 1) * GAP + PADY * 2; }

    const R = 20;
    // desce um pouco o painel para abrir espaço sob a imagem
    const panelY = Math.round(bk.yTop + bk.h * 0.72);

    // sombra + painel
    const shadow = this.add.graphics()
      .fillStyle(0x000000, 0.08)
      .fillRoundedRect(-PANEL_W/2, panelY - PANEL_H/2 + 6, PANEL_W, PANEL_H, R);
    const panel = this.add.graphics()
      .fillStyle(0xFFFFFF)
      .fillRoundedRect(-PANEL_W/2, panelY - PANEL_H/2, PANEL_W, PANEL_H, R)
      .lineStyle(2, this.COLOR.BORDER)
      .strokeRoundedRect(-PANEL_W/2, panelY - PANEL_H/2, PANEL_W, PANEL_H, R);
    C.add(shadow); C.add(panel);

    // --- botões (com feedback verde/vermelho) ---
    this.a4Buttons = [];
    const makeBtn = (label) => {
      const btn = this.makeChoiceButton(label, 0, 0, (clickedBtn) => {
        if (this._a4Resolved || this._a4ClickLock) return;

        clickedBtn.disableInteractive();
        const correta = (label === r.correct);

        if (correta) {
          this._a4Resolved = true;
          this.playSuccessSound();
          this.bumpEnergy(+1);
          // ✅ efeito de acerto (glow/✓ verde no próprio botão)
          this.drawCheck(clickedBtn, BTN_W, BTN_H, this.COLOR.SUCCESS);

          this.a4Buttons.forEach(b => b.disableInteractive());
          this.tweens.add({ targets: clickedBtn, scaleX: 1.06, scaleY: 1.06, duration: 110, yoyo: true });

          this.time.delayedCall(this.SUCCESS_DELAY, () => {
            this.transitionStep('a4Root', () => {
              this.a4i++; this._a4Resolved = false;
              if (this.a4i < this.a4List.length) this.renderA4();
              else this.showCompletion();
            }, 'slideLeft');
          });
        } else {
          // ❌ erro: tremidinha + flash vermelho + som + energia
          this.handleWrong(clickedBtn);
          this.drawError(clickedBtn, BTN_W, BTN_H, this.COLOR.DANGER);
          this.playErrorSound();
          this.bumpEnergy(-1);
        }

        this.time.delayedCall(300, () => { if (!this._a4Resolved) clickedBtn.setInteractive(); });
      });

      C.add(btn);
      this.a4Buttons.push(btn);
      return btn;
    };

    const btns = labels.map(makeBtn);
    // posiciona em coluna dentro do painel
    const startY = panelY - PANEL_H/2 + PADY + BTN_H/2;
    btns.forEach((b, i) => {
      b.setPosition(0, Math.round(startY + i*(BTN_H + GAP)));
      b.originalX = b.x;
      b.originalY = b.y;
      b._homeX = b.x;   // reforço
      b._homeY = b.y;
    });

    // Garantias: nunca passar do topo nem do rodapé da placa
    const topMost    = cardTopY - CARD_H/2;
    const bottomMost = panelY + PANEL_H/2;
    if (topMost < bk.yTop + 16) {
      C.y += Math.round((bk.yTop + 16) - topMost);
    }
    if (bottomMost > bk.yBottom - 16) {
      C.y -= Math.round(bottomMost - (bk.yBottom - 16));
    }

    this.staggerIn([card.img, imgNode, ...btns], { delay: 35 });
  }

  // =============== A5 — O Intruso (3 rodadas)
  setupAtividade4(){
    const a5Back = this.addActivityBackdrop({
      top: this.LAYOUT.titleY - 8,
      bottom: this.LAYOUT.footerY() - 110,
      paddingX: 72
    });
    this._a5Back = a5Back;
    // Título FIXO (sem parênteses)
  this.a5Title?.destroy();
  this.a5Title = this.makeTitle(fixMojibake('Ache o intruso'));
  // AUMENTA o título só nessa atividade
  this.a5Title.setFontSize(46);
    this.playTitleAudio(4);

    // Áudio de ajuda não disponível - usando apenas áudio padrão help_a4_nao_comeca_com quando necessário
    this.addTutorialButton(
      a5Back,
      'Encontre a imagem que não combina com as outras.',
      'help_a4_nao_comeca_com'
    );
    this.a5Rounds = [
      { alvo:'CO', itens:['coelho','copo','corda','casa'] },    // intruso: casa
      { alvo:'CA', itens:['casa','cana','cadeado','copo'] },   // intruso: copo
      { alvo:'CE', itens:['cebola','cenoura','cesta','cidade'] }, // intruso: cidade (CI)
    ];
    this.a5i=0;
    this._a5FirstRound = true;   // primeira rodada da atividade de intruso
    this.renderA5();
  }

  renderA5(){
    if (this.a5Root) this.a5Root.destroy(true);
    if (this.a5Cards) this.a5Cards.forEach(c => c.destroy());
    this.a5Cards = [];

    const W = this.scale.width, bk = this._a5Back, r = this.a5Rounds[this.a5i];

    // Título fica sempre "Ache o intruso"
    if (!this.a5Title || !this.a5Title.active) {
      this.a5Title = this.makeTitle(fixMojibake('Ache o intruso'));
    } else {
      this.a5Title.setText(fixMojibake('Ache o intruso'));
    }
    // garante que o título da A5 continue grande
    this.a5Title.setFontSize(46);

    // Áudio automático da rodada:
    // 1) "Qual figura que NÃO começa com..."
    // 2) sílaba da rodada (BA, BE, BI, BO, BU)
    const delay = this._a5FirstRound ? TITLE_AUDIO_GAP_MS : 600;
    this._a5FirstRound = false;

    this.queueAfterTitle(() => {
      // frase fixa gravada em help_a4_nao_comeca_com.mp3
      this.playHelpAudio('help_a4_nao_comeca_com');

      // depois de ~2.2s, fala a sílaba alvo da rodada (ex.: "BO")
      this.time.delayedCall(2200, () => {
        if (r && r.alvo) {
          this.playSyllableAudio(r.alvo); // usa os áudios word_BA, word_BO, etc.
        }
      });
    }, delay);

    this._a5Resolved = false;
    this._a5ClickLock = false;

    this.a5Root = this.add.container(W/2, 0);
    this.activityContainer.add(this.a5Root);
    const C = this.add.container(0, 0);
    this.a5Root.add(C);

    // Chip/legenda mostra a regra com a sílaba da rodada
    const hintPrefix = 'NÃO começa com ';
    const hintSyll   = r.alvo; // ex.: "BO"

    const chipY = Math.round(bk.yTop + bk.h * 0.18 + 8); // levemente abaixo do título
    const chipW = 420, chipH = 40, chipR = 18;

    const chipShadow = this.add.graphics();
    chipShadow
      .fillStyle(0x000000, 0.08)
      .fillRoundedRect(-chipW/2, chipY - chipH/2 + 4, chipW, chipH, chipR);

    const chip = this.add.graphics();
    chip
      .fillStyle(0xFFFFFF)
      .fillRoundedRect(-chipW/2, chipY - chipH/2, chipW, chipH, chipR)
      .lineStyle(2, this.COLOR.BORDER)
      .strokeRoundedRect(-chipW/2, chipY - chipH/2, chipW, chipH, chipR);

    // container só para alinhar os textos no centro do pill
    const labelCont = this.add.container(0, chipY);

    const baseStyle = {
      fontFamily: 'Quicksand, Arial, sans-serif',
      fontSize: '22px',
      fontStyle: 'bold'
    };

    // parte cinza: "NÃO começa com "
    const prefixText = this.add.text(0, 0, fixMojibake(hintPrefix), {
      ...baseStyle,
      color: '#4B5563' // cinza mais escuro
    }).setOrigin(0, 0.5);

    // parte azul: "BO", "BA", etc.
    const syllText = this.add.text(prefixText.width, 0, fixMojibake(hintSyll), {
      ...baseStyle,
      color: '#0EA5E9' // azul igual aos botões de escolha
    }).setOrigin(0, 0.5);

    labelCont.add([prefixText, syllText]);

    // centraliza o container dentro do pill
    const totalTextW = prefixText.width + syllText.width;
    labelCont.x = -Math.round(totalTextW / 2);

    // não precisamos mais de this.a5Hint como Text
    this.a5Hint = null;

    C.add([chipShadow, chip, labelCont]);

    const cardW = 250, cardH = 165; // menor para caber melhor

    const objs = Phaser.Utils.Array.Shuffle(r.itens.slice()).map(key => {
      // usa o componente padronizado (já faz fit + ordem correta)
      const cont = this.createImageCard(0, 0, key, cardW, cardH, (_imgKey, node) => {
        const isIntruso = !key.toUpperCase().startsWith(r.alvo);

        // se já resolveu ou está em cooldown, ignora o clique
        if (this._a5Resolved) return;
        if (this._a5ClickLock) return;

        // trava tudo assim que clicar em QUALQUER carta
        this._a5ClickLock = true;

        if (isIntruso) {
          // ---------- ACERTO ----------
          this._a5Resolved = true;
          this.a5Cards.forEach(c => c.input && c.disableInteractive());

          this.playSuccessSound();
          this.bumpEnergy(+1);
          this.tweens.add({ targets: node, scale: 1.06, duration: 120, yoyo: true });
          this.drawCheck(node, cardW, cardH, this.COLOR.SUCCESS);

          // avança só uma vez
          this.time.delayedCall(this.SUCCESS_DELAY, () => {
            this.transitionStep('a5Root', () => {
              this.a5i++;
              if (this.a5i < this.a5Rounds.length) {
                this.renderA5();
              } else {
                this.showCompletion();
              }
            }, 'slideLeft');
          });

        } else {
          // ---------- ERRO ----------
          this.handleWrong(node);
          this.drawError(node, cardW, cardH, this.COLOR.DANGER);
          this.playErrorSound();
          this.bumpEnergy(-1);

          // cooldown MAIS LONGO no erro (0.8s)
          this.time.delayedCall(800, () => {
            this._a5ClickLock = false; // libera de novo para tentar outra carta
          });
        }
      });

      // pequenos efeitos de hover
      cont.on('pointerover', () => this.tweens.add({ targets: cont, duration: 120, scale: 1.04, ease: 'Quad.easeOut' }));
      cont.on('pointerout',  () => this.tweens.add({ targets: cont, duration: 120, scale: 1.00, ease: 'Quad.easeIn' }));

      C.add(cont);
      this.a5Cards.push(cont);
      return cont;
    });

    const cols = 2, rows = 2;
    const CARD_W = 250, CARD_H = 165;
    const gapX = 24, gapY = 18;
    const totalW = cols*CARD_W + (cols-1)*gapX;
    const totalH = rows*CARD_H + (rows-1)*gapY;

  const offsetY = -25; // desce o grid 15px para dar mais espaço entre chip e cartas
  const centerY = Math.round(bk.yTop + bk.h * 0.62) + offsetY; // grade no centro da placa
    const startX  = - totalW/2 + CARD_W/2;
    const startY  = centerY - totalH/2 + CARD_H/2;

    objs.forEach((o, i) => {
      const c = i % cols;
      const rlin = (i / cols) | 0;
      o.setPosition(
        Math.round(startX + c*(CARD_W + gapX)),
        Math.round(startY + rlin*(CARD_H + gapY))
      );
    });
    
    this.staggerIn(this.a5Cards, { delay: 45 });
  }

  // =============== A6 — Classificar em cestos (BA × BO)
  setupAtividade5() {
    const a6Back = this.addActivityBackdrop({ top: this.LAYOUT.titleY - 10, bottom: this.LAYOUT.footerY() - 86, paddingX: 64 });
    this._a6Back = a6Back;
    const W = this.scale.width;
    this.makeTitle('Separe as figuras');
    this.playTitleAudio(5);



    this.addTutorialButton(
      a6Back,
      'Arraste cada imagem para o cesto da sílaba correta: CA ou CO.',
      'help_c_a5_separe_ca_co'
    );

    this.a6C = this.add.container(0, 0);
    this.activityContainer.add(this.a6C);

    const bk = this._a6Back;
    const bucketY = Math.round(bk.yTop + bk.h * 0.28); // cestos no topo da área de conteúdo
    // Reduz altura dos cestos de 160 para 120
    this.a6Left  = this.makeBucketPanel(W/2 - 200, bucketY, 'CA', this.COLOR.SECONDARY, 120);
    this.a6Right = this.makeBucketPanel(W/2 + 200, bucketY, 'CO', this.COLOR.PRIMARY, 120);
    const leftZone  = this.a6Left.zone;  leftZone.syll = 'CA';
    const rightZone = this.a6Right.zone; rightZone.syll = 'CO';

    // Realce de alvo quando um item entra no cesto
    const setBorder = (zone, color, width = 3, alpha = 1) => {
      const g = zone._border; if (!g) return;
      const WZ = zone._W || 270, HZ = zone._H || 160, RZ = zone._R || 18;
      g.clear();
      g.fillStyle(0xFFFFFF).fillRoundedRect(-WZ/2, -HZ/2, WZ, HZ, RZ);
      g.lineStyle(width, color, alpha).strokeRoundedRect(-WZ/2, -HZ/2, WZ, HZ, RZ);
    };
    const restoreBorder = (zone) => setBorder(zone, (zone === leftZone ? this.COLOR.SECONDARY : this.COLOR.PRIMARY), 3, 1);
    [leftZone, rightZone].forEach(z => {
      z.on('dragenter', (_p, obj) => {
        const ok = (obj?.syll === z.syll);
        setBorder(z, ok ? this.COLOR.SUCCESS : this.COLOR.PRIMARY, ok ? 4 : 3, 1);
        if (z._container) this.tweens.add({ targets: z._container, scale: 1.04, duration: 120 });
      });
      z.on('dragleave', () => {
        restoreBorder(z);
        if (z._container) this.tweens.add({ targets: z._container, scale: 1.00, duration: 120 });
      });
    });

    const snapOffsets = [-70, 0, 70];
    const snapState = { CA: 0, CO: 0 };
    const getSnap = (zone) => {
      const key = zone.syll;
      const i = Math.min(snapState[key], 2);
      const x = zone.x + snapOffsets[i];
      const y = zone.y;
      snapState[key] = i + 1;
      return { x, y };
    };


  const OUTER_PADDING = 72;
  const SAFE_BOTTOM   = 36;
  const barXMax       = this.scale.width - OUTER_PADDING * 2;

  const PIECE_W = 112;
  const PIECE_H = 100;

  const cols = 3, rows = 2;

  // Aumenta margens internas e altura da bandeja
  const INNER_PAD_H = 36; // antes 18
  const INNER_PAD_V = 28; // antes 12
  const GAP_X_TARGET = 32;
  const GAP_Y        = 24; // antes 20

  const neededW = INNER_PAD_H * 2 + cols * PIECE_W + (cols - 1) * GAP_X_TARGET;
  const neededH = INNER_PAD_V * 2 + rows * PIECE_H + (rows - 1) * GAP_Y;

  const BAR_W = Math.min(Math.max(neededW, 700), barXMax); // bandeja mais larga
  const BAR_H = Math.max(neededH, 210); // bandeja mais alta
  const R     = 26;

  const barY = Math.round(bk.yTop + bk.h * 0.70);
  const barX = this.scale.width / 2 - BAR_W / 2;

  const shadow = this.add.graphics();
  shadow.fillStyle(0x000000, 0.06)
      .fillRoundedRect(barX, barY - BAR_H/2 + 6, BAR_W, BAR_H, R)
      .setDepth(0);

  const tray = this.add.graphics();
  tray.fillStyle(0xFFFFFF)
    .fillRoundedRect(barX, barY - BAR_H/2, BAR_W, BAR_H, R)
    .lineStyle(2, this.COLOR.BORDER)
    .strokeRoundedRect(barX, barY - BAR_H/2, BAR_W, BAR_H, R)
    .setDepth(1);


  this.a6C.add([shadow, tray]);

    const data = Phaser.Utils.Array.Shuffle([
      { img:'casa',    syll:'CA' },
      { img:'cadeado', syll:'CA' },
      { img:'cavalo',  syll:'CA' },
      { img:'coelho',  syll:'CO' },
      { img:'copo',    syll:'CO' },
      { img:'corda',   syll:'CO' },
    ]);

    const usableW = BAR_W - INNER_PAD_H * 2;
    let gapX = (usableW - cols * PIECE_W) / (cols - 1);
    gapX = Phaser.Math.Clamp(Math.round(gapX), 24, 64);


    const gridW  = cols * PIECE_W + (cols - 1) * gapX;
    const startX = Math.round(this.scale.width / 2 - gridW / 2);

    const totalGridH = rows * PIECE_H + (rows - 1) * GAP_Y;
    const lineY = [
      Math.round(barY - totalGridH / 2 + PIECE_H / 2),
      Math.round(barY + totalGridH / 2 - PIECE_H / 2),
    ];

    const pieces = data.map((p, i) => {
      const r = (i / cols) | 0, c = i % cols;
      const cx = Math.round(startX + (PIECE_W / 2) + c * (PIECE_W + gapX));
      const cy = lineY[r];

      const spr = this.createDraggableImage(cx, cy, p.img, PIECE_W, PIECE_H);
      spr.syll = p.syll;
      spr.originalX = cx;
      spr.originalY = cy;
      spr.setDepth(50);
      this.a6C.add(spr);
      return spr;
    });

    this.input.on('dragstart', (_p, obj) => {
      obj._origDepth = obj.depth ?? 50;
      obj.setDepth(100);
      this.tweens.add({ targets: obj, scale: 1.05, duration: 100 });
      // Removido: playWordAudio/playSyllableAudio no dragstart
    });
    this.input.on('dragend', (_p, obj, dropped) => {
      if (!dropped) {
        this.returnToOrigin(obj);
        obj.setDepth(obj._origDepth || 50);
        this.tweens.add({ targets: obj, scale: 1.0, duration: 100 });
        // Removido: playWordAudio/playSyllableAudio no dragend
      }
    });

    this.a6Placed = 0;
    const total = pieces.length;

    this.input.off('drop');
    this.input.on('drop', (_p, obj, zone) => {
      try {
        if (!zone?.syll || !obj?.syll) return;

        if (zone.syll === obj.syll) {
          const dest = getSnap(zone);
          obj.disableInteractive();

          // feedback e encaixe
          this.drawCheck(obj, PIECE_W, PIECE_H, this.COLOR.SUCCESS);
          this.tweens.add({ targets: obj, x: dest.x, y: dest.y, scale: 0.95, duration: 220, ease: 'Quad.easeOut' });
          this.tweens.add({ targets: obj, alpha: 0, duration: 220, delay: 140, onComplete: () => { try{ obj.destroy(); }catch(e){} } });

          // ✅ FIX: não tweene 'tint' em Graphics — redesenha a borda e depois restaura
          setBorder(zone, this.COLOR.SUCCESS, 4, 1);
          this.time.delayedCall(200, () => restoreBorder(zone));

          this.playSuccessSound?.();
          this.bumpEnergy(+1);
          this.a6Placed++;
          if (this.a6Placed >= total) {
            this.time.delayedCall(this.SUCCESS_DELAY, () =>
              this.showCompletion()
            );
          }
        } else {
          // ❌ Drop errado — só feedback + volta suave (sem "voar")
          this.tweens.killTweensOf(obj);
          obj._snapped = false;

          try { restoreBorder(zone); zone?.emit?.('dragleave'); } catch {}

          // ERRO: só feedback visual e sonoro + voltar direto (sem shake maluco)
          this.drawError(obj, PIECE_W, PIECE_H, this.COLOR.DANGER);  // flash vermelho curto
          this.playErrorSound();
          this.bumpEnergy(-1);
          this.returnToOrigin(obj);      // volta direto, sem tween maluco antes

          obj.setDepth(obj._origDepth || 50);
          this.tweens.add({ targets: obj, scale: 1.0, duration: 100 });
        }
      } catch (e) {
        console.warn('drop handler error (A5):', e);
        this.returnToOrigin(obj); // fallback para garantir que não quebre a cena
      }
    });
  }

  // ========================= A6 — Jogo da Memória =========================
  // Chame setupAtividade6() quando for a atividade 6.

  setupAtividade6() {
    // limpa vestígios e listeners da atividade anterior
    try { this.input.off('pointerdown'); this.input.off('gameobjectdown'); } catch(e){}
    if (this.activityContainer) this.activityContainer.list?.forEach(o => o.removeAllListeners?.());

    // ---- LIMPA HIGHLIGHTS AGRESSIVOS DO MEMÓRIA ----
    this.drawCheck = (target) => {
      // só uma borda sutil verde quando precisar
      if (target?.setStrokeStyle) target.setStrokeStyle(3, 0x22C55E, 1);
    };
    this.drawCross = (target) => {
      // só uma borda sutil vermelha quando precisar
      if (target?.setStrokeStyle) target.setStrokeStyle(3, 0xEF4444, 1);
    };

    const bk = this.addActivityBackdrop({
      top: this.LAYOUT.titleY - 8,
      bottom: this.LAYOUT.footerY() - 110,
      paddingX: 72
    });

  this.makeTitle?.('Jogo da memória');
    this.playTitleAudio(8);

    this.addTutorialButton(
      bk,
      'Toque duas imagens para encontrar pares iguais. Lembre-se onde cada uma está!',
      'help_a8_jogo_memoria'
    );

    this.A6 = {
      c: this.add.container(0, 0),
      bk,
      round: 1,
      totalRounds: 3,
      first: null,
      lock: false,
      matches: 0,
      cards: [],
      tutorialDone: false
    };
    this.activityContainer.add(this.A6.c);

    // ---- SHUTDOWN SEGURO ----
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      try { this.tweens.killAll(); } catch(e){}
      try { this.time.removeAllEvents(); } catch(e){}
      try {
        this.children.list
          .filter(n => n && n.type === 'Graphics')
          .forEach(g => { try { g.destroy(); } catch(e){} });
      } catch(e){}
    });

    const sub = this.add.text(
      this.scale.width/2,
      this.LAYOUT.titleY + 56, // estava + 36
      'Rodada 1 de 3',
      { fontFamily: 'Quicksand, Arial, sans-serif', fontSize: '18px', color: '#6B7280' }
    ).setOrigin(0.5);
    this.A6.c.add(sub);
    this.A6.sub = sub;

    this.startA6Round();
  }

  startA6Round() {
    const A6 = this.A6, bk = A6.bk;

    // Rodadas com 2, 3 e 4 pares (2x2, 3x2, 4x2)
    const ROUNDS = [
      [ ['CA','casa'], ['CO','coelho'] ],                                        // 2 pares  → 4 cartas
      [ ['CA','cana'], ['CU','cubo'], ['CI','cidade'] ],                         // 3 pares  → 6 cartas
      [ ['CA','cadeado'], ['CO','copo'], ['CU','curativo'], ['CE','cebola'] ],   // 4 pares  → 8 cartas
    ];
    const pairs = ROUNDS[A6.round - 1] || ROUNDS[0];

    // monta baralho (sílaba + imagem de cada par)
    const deck = [];
    pairs.forEach(([syl, img], i) => {
      deck.push({ pair: i, type: 'syl', syl });
      deck.push({ pair: i, type: 'img', key: img });
    });
    Phaser.Utils.Array.Shuffle(deck);

    // === GRID QUE NUNCA ULTRAPASSA A PLACA ===
    const total = deck.length;               // 4, 6 ou 8
    const cols  = Math.min(4, Math.max(2, Math.ceil(total / 2))); // 2, 3, 4
    const rows  = 2;

    const centerX = bk.x + bk.w / 2;                     // centraliza na PLACA
    const centerY = Math.round(bk.yTop + bk.h * 0.60);   // zona "meio-baixa" da placa

    const PAD_W = 64;                                    // margem interna da placa
    const PAD_H = Math.round(bk.h * 0.10);
    const usableW = Math.max(440, bk.w - PAD_W * 2);     // nunca usa largura > placa
    const usableH = Math.max(260, Math.floor(bk.h * 0.58));

    const GAP_X = 28, GAP_Y = 24;

    // calcula tamanho exato da carta para CABER
    let CW = Math.floor((usableW - GAP_X * (cols - 1)) / cols);
    let CH = Math.floor((usableH - GAP_Y * (rows - 1)) / rows);

    // limites visuais seguros
    CW = Phaser.Math.Clamp(CW, 180, 260);
    CH = Phaser.Math.Clamp(CH, 140, 200);

    // largura/altura finais ocupadas pela grade (para posicionar)
    const totW = cols * CW + (cols - 1) * GAP_X;
    const totH = rows * CH + (rows - 1) * GAP_Y;

    const startX = Math.round(centerX - totW / 2 + CW / 2);
    const startY = Math.round(centerY - totH / 2 + CH / 2);

    // reseta estado da rodada
    A6.cards.forEach(o => o.cont?.destroy());
    A6.cards = []; A6.first = null; A6.matches = 0; A6.lock = false;

    // cria cartas
    deck.forEach((data, idx) => {
      const col = idx % cols, row = (idx / cols) | 0;
      const x = startX + col * (CW + GAP_X);
      const y = startY + row * (CH + GAP_Y);
      const card = this.createA6Card(data, x, y, CW, CH);
      card.cont.setDepth(100 + idx);
      A6.c.add(card.cont);
      A6.cards.push(card);
    });

    A6.sub.setText(`Rodada ${A6.round} de ${A6.totalRounds}`);

    // Gere uma vez (ou no maior tamanho) e depois só redimensione com setDisplaySize
    const TEX_W = Math.max(CW, 360);
    const TEX_H = Math.max(CH, 260);
    if (!this.textures.exists('card-bg')) {
      this.makeCardSkin('card-bg', TEX_W, TEX_H); // sua função que desenha a carta
    }

    // PRÉVIA: cartas nascem FECHADAS, abrem, esperam 1.020 ms e fecham de novo
    A6.lock = true;

    // garante que nascem fechadas e sem hover/clique
    A6.cards.forEach(c => {
      this.setCardFace(c.cont, false);
      c.cont._hit?.removeInteractive();
    });

    // abre com flip (pequeno atraso para posição estabilizar)
    this.time.delayedCall(80, () => {
      A6.cards.forEach((c, i) => this.flipOpen(c.cont));
      // espera 1.020 ms visíveis e fecha novamente
      this.time.delayedCall(1020, () => {
        A6.cards.forEach(c => {
          this.flipClose(c.cont);
          // Reativa o hitArea corretamente (zone não possui .sys)
          if (
            c.cont._hit &&
            typeof c.cont._hit.setInteractive === 'function' &&
            c.cont._hit.scene &&
            !c.cont._hit.scene.sys.destroyed
          ) {
            c.cont._hit.setInteractive() // só pra bloquear cliques no fundo;
          }
        });
        A6.lock = false;
      });
    });

    // tutorial simples na 1ª rodada (mão fantasma destacando 1 par)
    if (!A6.tutorialDone && A6.round === 1) {
      A6.tutorialDone = true;
      this.showA6Tutorial();
    }
  }

  createA6Card(data, x, y, CW, CH) {
  const R = 20; // raio padronizado
    const cont = this.add.container(x, y);
    cont._open = false;
    cont._pair = data.pair;
    cont._data = data;
    cont.setSize(CW, CH);

    // Sombra suave
  const shadow = this.add.graphics();
  shadow.fillStyle(0x000000, 0.08).fillRoundedRect(-CW/2, -CH/2 + 6, CW, CH, R);
  cont._shadow = shadow; // <- guarda a sombra para animar no flip

  // Verso (textura) – nova key para garantir raio bonito
  const TEX_W = CW, TEX_H = CH;
  if (!this.textures.exists('card-bg-a6')) this.makeCardSkin('card-bg-a6', TEX_W, TEX_H, R);
  const back = this.add.image(0, 0, 'card-bg-a6').setDisplaySize(CW, CH).setOrigin(0.5);

    // FACE (conteúdo) – começa oculta
    const face = this.add.container(0, 0).setVisible(false);

  // Fundo branco arredondado da face
  const faceBg = this.add.graphics();
  faceBg.fillStyle(0xFFFFFF, 1).fillRoundedRect(-CW/2, -CH/2, CW, CH, R);
  faceBg.lineStyle(2, 0xE5E7EB, 1).strokeRoundedRect(-CW/2, -CH/2, CW, CH, R);
  face.add(faceBg);

    // Conteúdo (sílaba ou imagem)
    if (data.type === 'syl') {
      const txt = this.add.text(0, 0, data.syl, {
        fontFamily: 'Quicksand, Arial, sans-serif',
        fontSize: `${Math.round(CH * 0.42)}px`,
        fontStyle: '900',
        color: '#0B3B8C',
        stroke: '#FFFFFF',
        strokeThickness: 4
      }).setOrigin(0.5);
      face.add(txt);
    } else {
      if (this.textures.exists(data.key)) {
        const tex = this.textures.get(data.key).get();
        const scale = Math.min((CW - 36) / tex.width, (CH - 36) / tex.height);
        face.add(this.add.image(0, 0, data.key).setOrigin(0.5).setScale(scale));
      } else {
        face.add(this.add.text(0, 0, (data.key || '').toUpperCase(), {
          fontFamily: 'Quicksand, Arial, sans-serif',
          fontSize: `${Math.round(CH * 0.30)}px`,
          color: '#111827',
          fontStyle: '700'
        }).setOrigin(0.5));
      }
    }

    // CAPA (cartas viradas) – branca ARREDONDADA
  const cover = this.add.graphics();
  cover.fillStyle(0xFFFFFF, 1).fillRoundedRect(-CW/2, -CH/2, CW, CH, R);
  cover.lineStyle(2, 0xE5E7EB, 1).strokeRoundedRect(-CW/2, -CH/2, CW, CH, R);

    // Hitzone (NÃO deixe interativo aqui!)
    const hit = this.add.zone(0, 0, CW, CH).setOrigin(0.5);

    // Hover suave (só quando não estiver travado e carta fechada)
    hit.on('pointerover', () => {
      if (this.A6?.lock || cont._open) return;
      this.tweens.add({ targets: cont, duration: 120, scale: 1.02 });
    });
    hit.on('pointerout', () => {
      this.tweens.add({ targets: cont, duration: 120, scale: 1.00 });
    });
    hit.on('pointerdown', () => {
      if (this.startInputCooldown && this.startInputCooldown(260)) return;
      this.flipA6Card(cont);
    });

    // guarde a ref
    cont._hit = hit;

    cont.add([shadow, back, face, cover, hit]);

    // Para o sistema flip() funcionar
    cont._face = face;
    cont._cover = cover;
    cont.setData('faceKey', data.key || 'card-bg-a6');
    cont.setTexture = (key) => {
      if (key === 'card-bg-a6') { // virada para baixo
        cover.setVisible(true);
        face.setVisible(false);
      } else {                     // virada para cima
        cover.setVisible(false);
        face.setVisible(true);
      }
    };

    this.setCardFace(cont, false); // garante costas na criação

    return { cont, cover, face, base: back, data };
  }

  // Define a face da carta imediatamente (sem tween)
  setCardFace(cont, open) {
    cont._open = !!open;
    cont._cover?.setVisible(!open);
    cont._face?.setVisible(open);
  }

  // Flip 3D suave: escala no eixo X até 0, troca a face, volta a 1
  prettyFlip(cont, toOpen = true, duration = 220, onShown = null) {
    if (!cont || cont._animating) return;
    cont._animating = true;

    // desliga clique durante o flip (só se for um GameObject interativo)
    // Só desativa se for GameObject válido e não destruído
    if (
      cont._hit &&
      typeof cont._hit.disableInteractive === 'function' &&
      cont._hit.scene &&
      !cont._hit.scene.sys.destroyed
    ) {
      cont._hit.disableInteractive();
    }

    const sh = cont._shadow;
    this.tweens.add({
      targets: cont,
      scaleX: 0.06,
      duration: Math.round(duration * 0.45),
      ease: 'Cubic.easeIn',
      onComplete: () => {
        this.setCardFace(cont, toOpen);              // troca face
        if (sh) this.tweens.add({ targets: sh, y: (toOpen ? '+=2' : '-=2'), alpha: (toOpen ? 0.16 : 0.10), duration: 90 });
        this.tweens.add({
          targets: cont,
          scaleX: 1,
          duration: Math.round(duration * 0.55),
          ease: 'Back.Out',
          onComplete: () => {
            cont._animating = false;
            // reativa interação somente quando estiver fechada (aberta fica aguardando par)
            if (
              !toOpen &&
              cont._hit &&
              typeof cont._hit.setInteractive === 'function' &&
              cont._hit.scene &&
              !cont._hit.scene.sys.destroyed
            ) {
              cont._hit.setInteractive() // só pra bloquear cliques no fundo;
            }
            if (typeof onShown === 'function') onShown();
          }
        });
      }
    });
  }

  // atalhos práticos
  flipOpen(cont, cb)  { this.prettyFlip(cont, true,  220, cb); }
  flipClose(cont, cb) { this.prettyFlip(cont, false, 200, cb); }

  flipA6Card(cont) {
    const A6 = this.A6 || {};
    if (A6.lock || cont._matched || cont._animating || cont._open) return;
    this.flipOpen(cont, () => this.onA6CardOpened(cont)); // chama check depois que abrir de verdade
  }

  onA6CardOpened(cont) {
    // Removido: fala ao virar carta para deixar mais visual
    // try {
    //   const d = cont._data;
    //   if (d?.type === 'syl') {
    //     this.playSyllableAudio(d.syl);
    //   } else if (d?.key) {
    //     this.playWordAudio(d.key);
    //   }
    // } catch (e) {}
    
    this.checkA6Match(cont);
  }

  checkA6Match(cont) {
    const A6 = this.A6;
    if (!A6.first) { A6.first = cont; return; }

    const a = A6.first, b = cont;
    A6.first = null;

    if (a._pair === b._pair) {
      // Par correto → desabilita o clique definitivamente
      a._matched = true;
      b._matched = true;
      a._hit?.disableInteractive();
      b._hit?.disableInteractive();
      A6.matches++;

      this.tweens.add({ targets: [a, b], props: { y: { value: '+=6' } }, yoyo: true, repeat: 1, duration: 90 });
      if (A6.matches * 2 === A6.cards.length) {
        this.time.delayedCall(280, () => {
          if (A6.round < A6.totalRounds) {
            A6.round++;
            A6.sub.setText(`Rodada ${A6.round} de ${A6.totalRounds}`);
            A6.cards.forEach(o => o.cont.destroy());
            A6.cards = [];
            this.startA6Round();
          } else {
            this.showCompletion?.('Atividade concluída!');
          }
        });
      }
    } else {
      // Fecha as duas com flip e reabilita clique
      A6.lock = true;
      this.time.delayedCall(260, () => {
        this.flipClose(a);
        this.flipClose(b);
        A6.lock = false;
      });
    }
  }

  // =============== A8 — Monte palavras (BU/BO/BI/BA + sílaba 2)
  setupAtividade7() {
    const a8Back = this.addActivityBackdrop({ top: this.LAYOUT.titleY - 8, bottom: this.LAYOUT.footerY() - 110, paddingX: 80 });
    this._a8Back = a8Back;
  this.makeTitle('Monte a palavra');
    this.playTitleAudio(7);

    this.addTutorialButton(
      a8Back,
      'Arraste as sílabas da bandeja para os espaços vazios e forme a palavra da imagem.',
      'help_a7_monte_palavra'
    );

    this.a8Rounds = [
      { key:'cana', seq:['CA','NA'] },
      { key:'casa', seq:['CA','SA'] },
      { key:'cola', seq:['CO','LA'] },
      { key:'copo', seq:['CO','PO'] },
      { key:'cubo', seq:['CU','BO'] },
    ];
    this.a8i = 0;

    this.input.off('drop');
    this.renderA8Round();
  }

renderA8Round() {
  if (this.a8C) this.a8C.destroy(true);
  this.a8C = this.add.container(0, 0);
  this.activityContainer.add(this.a8C);

  const W = this.scale.width, bk = this._a8Back;

  const r = this.a8Rounds[this.a8i];


  // --- CARD DA IMAGEM ---
  const CARD_W = 260;
  const CARD_H = 190;
  const CARD_X = this.scale.width / 2;
  const CARD_Y = bk.yTop + 180;  // desce um pouco a imagem

  const card = this.drawCard(CARD_X, CARD_Y, CARD_W, CARD_H, this.COLOR.PRIMARY);
  this.a8C.add(card.img);

  // imagem centralizada com "fit"
  const tex = this.textures.get(r.key).get();
  const fit = this.fitTexture(tex, CARD_W - 52, CARD_H - 84);
  const img = this.add.image(CARD_X, CARD_Y - 6, r.key).setDisplaySize(fit.w, fit.h);
  this.a8C.add(img);

  // salva a escala original após setDisplaySize
  img.baseScaleX = img.scaleX;
  img.baseScaleY = img.scaleY;

  // --- clique na imagem: fala a palavra e faz um "pulinho" suave ---
  img.setInteractive({ useHandCursor: true });

  img.on('pointerdown', () => {
    if (this.startInputCooldown && this.startInputCooldown(260)) return;

    // r.key é 'bota', 'bule', 'bola', 'bala'...
    this.playWordAudio(r.key);

    // mata qualquer tween antigo desse sprite para não acumular
    this.tweens.killTweensOf(img);
    img.setScale(img.baseScaleX, img.baseScaleY);

    // animação rápida de "inchar" ~6% e voltar
    this.tweens.add({
      targets: img,
      scaleX: img.baseScaleX * 1.06,
      scaleY: img.baseScaleY * 1.06,
      duration: 120,
      yoyo: true,
      ease: 'Sine.easeOut'
    });
  });

  // --- PLACA DOS ESPAÇOS (onde caem as sílabas) ---
  const PLATE_W = 320;
  const PLATE_H = 110;   // placa um pouco mais baixa
  const GAP_CARD_PLATE = 60;  // aproxima a barra de slots da imagem

  const baseY = CARD_Y + CARD_H / 2 + GAP_CARD_PLATE;

  const plateGroup = this.createSlotPlate(CARD_X, baseY, {
    PLATE_W,
    PLATE_H,
    R: 20,
    SLOT_W: 92,
    SLOT_H: 86,
    GAP: 26,      // mais espaço entre as duas caixas
    HIT_PAD: 22
  });
  this.a8C.add([plateGroup.plateShadow, plateGroup.plate]);

  const slots = plateGroup.slots.map((s, i) => {
    s.zone.expected = r.seq[i];
    if (s.shadow) this.a8C.add(s.shadow);
    this.a8C.add([s.bg, s.border, s.inset, s.zone]);
    s.zone.occupied = false;
    return s.zone;
  });
  // slots começam vazios
  slots.forEach(z => { z.placed = null; z.placedNode = null; });

  // --- BANDEJA DAS SÍLABAS (em baixo) ---
  const SYLL_BANK = ['CA','CE','CI','CO','CU','LA','LE','LI','LO','LU','NA','NE','NI','NO','NU','PO','SA','TA','TE','TI','TO','TU','BO'];
  const MAX_BLOCKS = 4;
  const keep = r.seq.slice();
  const rest = Phaser.Utils.Array.Shuffle(SYLL_BANK.filter(s => !keep.includes(s)));
  const opts = Phaser.Utils.Array.Shuffle([ ...keep, ...rest.slice(0, MAX_BLOCKS - keep.length) ]);

  const TILE = 84;
  const GAP_X = 28;
  const PAD_H = 24;
  const PAD_V = 16;
  const R = 20;
  const gridW = opts.length * TILE + (opts.length - 1) * GAP_X;
  const needW = PAD_H * 2 + gridW;
  const BAR_W = Math.max(PLATE_W + 140, needW); // garante que todos os blocos cabem
  const BAR_H = 100;   // barra um pouco mais baixa
  const GAP_PLATE_TRAY = 75;  // bandeja um pouco mais perto da placa
  const trayY = baseY + PLATE_H / 2 + GAP_PLATE_TRAY;
  const trayX = Math.round(this.scale.width / 2 - BAR_W / 2);

  const trayShadow = this.add.graphics().setDepth(8);
  trayShadow.fillStyle(0x000000, 0.08)
           .fillRoundedRect(trayX, trayY + 6 - BAR_H / 2, BAR_W, BAR_H, R);
  const tray = this.add.graphics().setDepth(9);
  tray.fillStyle(0xFFFFFF)
      .fillRoundedRect(trayX, trayY - BAR_H / 2, BAR_W, BAR_H, R)
      .lineStyle(2, this.COLOR.BORDER)
      .strokeRoundedRect(trayX, trayY - BAR_H / 2, BAR_W, BAR_H, R);
  this.a8C.add([trayShadow, tray]);

  // cria os blocos arrastáveis com micro-zoom/hover
  const startX = trayX + PAD_H;
  const blocksY = trayY;
  opts.forEach((syl, i) => {
  const x = Math.round(startX + i * (TILE + GAP_X) + TILE / 2);
  const p = this.createDragSyllable(x, blocksY, syl, TILE, TILE);
  p.originalX = x;
  p.originalY = blocksY;
  p._baseScale = p.scale;   // <- guarda o tamanho original
  p.setDepth(10);
  this.a8C.add(p);
  });

  // --- DROP DAS SÍLABAS (A8) ---
  // Quando a criança solta uma sílaba em um slot:
  // - confere se é o lugar certo
  // - encaixa o bloco no slot
  // - mostra check verde, som de acerto e aumenta energia
  const REVEAL_MS = 1200;   // tempo visível antes de avançar
  this._a8Revealing = false;

  this.input.off('drop');
  this.input.on('drop', (_p, obj, zone) => {
    const ok = !!zone && !!obj && zone.expected === obj.syllable && !zone.occupied;


    if (ok) {
      zone.occupied   = true;
      zone.placed     = obj.syllable;
      zone.placedNode = obj;

      // Encaixa centralizado no slot e deixa a sílaba um pouco maior
      const baseScale   = obj._baseScale || obj.scale || 1;
      const targetScale = baseScale * 1.12;

      obj.disableInteractive();
      this.tweens.add({
        targets: obj,
        x: zone.x,
        y: zone.y,
        scale: targetScale,
        duration: 220,
        ease: 'Quad.easeOut',
        onComplete: () => {
          // Pequeno “pop” para chamar atenção sem exagerar
          this.tweens.add({
            targets: obj,
            scale: targetScale * 1.06,
            duration: 120,
            yoyo: true,
            ease: 'Sine.easeOut'
          });
          // Aqui você pode tocar o áudio da sílaba, se quiser
          // this.playSyllableSound?.(obj.syllable);
        }
      });

      // Feedback positivo no cartão + som + energia
      this.drawCheck(card.img, CARD_W, CARD_H, this.COLOR.SUCCESS);
      this.playSuccessSound?.();
      this.bumpEnergy?.(+1);

      // Se todas as sílabas foram colocadas, espera um pouco e avança
      const finished = slots.every(s => !!s.placed);
      if (finished && !this._a8Revealing) {
        this._a8Revealing = true;
        // espera um pouco para a criança ver a palavra montada
        this.time.delayedCall(REVEAL_MS, () => {
          if (this.a8i < this.a8Rounds.length - 1) {
            this.transitionStep('a8C', () => { this.a8i++; this.renderA8Round(); }, 'slideLeft');
          } else {
            this.showCompletion('Atividade ' + this.currentActivity + ' concluída!');
          }
        });
      }
    } else {
      this.tweenShake(obj);
      this.returnToOrigin(obj);
      this.playErrorSound?.();
      this.bumpEnergy?.(-1);
    }
  });
}

  // =============== A9 — Ouça e toque a imagem correta (com dicas)
  setupAtividade8() {
    const a9Back = this.addActivityBackdrop({ top: this.LAYOUT.titleY - 8, bottom: this.LAYOUT.footerY() - 92, paddingX: 72 });
    this._a9Back = a9Back;
  this.makeTitle('Ache a figura certa');
    this.playTitleAudio(1);

    this.addTutorialButton(
      a9Back,
      'Escute a palavra falada e toque na imagem correspondente.',
      'help_a1_ache_figura_certa'
    );

    this.a9Rounds = [
      { word:'CASA',    correct:'casa',     pool:['caneca','cubo','cavalo','cidade'] },
      { word:'CANECA',  correct:'caneca',   pool:['casa','copo','cana','coelho'] },
      { word:'COELHO',  correct:'coelho',   pool:['copo','corda','casa','cubo'] },
      { word:'CUBO',    correct:'cubo',     pool:['casa','caneca','cidade','cebola'] },
      { word:'CENOURA', correct:'cenoura',  pool:['cebola','cidade','casa','caneca'] },
      { word:'CIDADE',  correct:'cidade',   pool:['circo','cenoura','casa','caneca'] },
    ];
    this.a9Index = 0;
    this._a9FirstRound = true;
    this.renderA9Round();
  }

  criarGrade4Figuras(scene, container, config) {
    const { x, y, cardW, cardH, gapX, gapY, keys, onCardClick } = config;
    const cols = 2, rows = 2;
    const totalW = cols * cardW + (cols - 1) * gapX;
    const totalH = rows * cardH + (rows - 1) * gapY;
    const startX = x - totalW / 2 + cardW / 2;
    const startY = y - totalH / 2 + cardH / 2;
    const cards = [];
    keys.forEach((key, i) => {
      const c = i % cols, rlin = (i / cols) | 0;
      const card = scene.createImageCard(
        Math.round(startX + c * (cardW + gapX)),
        Math.round(startY + rlin * (cardH + gapY)),
        key,
        cardW,
        cardH,
        onCardClick
      );
      container.add(card);
      cards.push(card);
    });
    return cards;
  }

  renderA9Round() {
    if (this.a9C) this.a9C.destroy(true);
    this.a9C = this.add.container(0,0);
    this.activityContainer.add(this.a9C);

    if (this.a9Index >= this.a9Rounds.length) {
      this.showCompletion('Atividade ' + this.currentActivity + ' concluída!');
      return;
    }


  const r = this.a9Rounds[this.a9Index];

  const delay = this._a9FirstRound ? TITLE_AUDIO_GAP_MS : 600;
  this._a9FirstRound = false;

  // título já foi tocado no setupAtividade8 com playTitleAudio(1)
  // aqui só agendamos o áudio da palavra:
  this.queueAfterTitle(() => {
    // Fala o nome da figura que a criança deve procurar (ex: "bola")
    this.playWordAudio(r.correct);
  }, delay);

  // libera o lock sempre que começa uma nova palavra
  this._a1Lock = false;

  this._a9Resolved = false;
  this._a9Eliminated = false;

    const picks = Phaser.Utils.Array.Shuffle(
      [r.correct, ...Phaser.Utils.Array.Shuffle(r.pool).slice(0,3)]
    );

    // --- Layout idêntico ao "Ache o intruso" ---
    const bk = this._a9Back;
    const W = this.scale.width;

    // Texto da palavra (BOLA, BOTA, BULE, BALA...)
    const label = r.word.toUpperCase();
    const textStyle = {
      fontFamily: 'Quicksand',
      fontSize: '26px',      // ↑ maior que antes
      color: '#374151',
      fontStyle: 'bold'
    };

    // Cria o texto "fantasma" só pra medir o tamanho
    const tmpText = this.add.text(0, 0, label, textStyle)
      .setOrigin(0.5)
      .setVisible(false);

    const textWidth   = tmpText.width;
    const paddingX    = 80;      // espaço total extra (40px de cada lado)
    const minChipW    = 240;     // largura mínima pra não ficar pequeno demais
    const chipW       = Math.max(minChipW, textWidth + paddingX);
    const chipH       = 40;
    const chipR       = 20;
    const chipY       = Math.round(bk ? (bk.yTop + bk.h * 0.18 + 8) : (this.LAYOUT.subTitleY));

    // sombra
    const chipShadow = this.add.graphics();
    chipShadow.fillStyle(0x000000, 0.06)
      .fillRoundedRect(W/2 - chipW/2, chipY - chipH/2 + 4, chipW, chipH, chipR);

    // fundo branco
    const chip = this.add.graphics();
    chip.fillStyle(0xFFFFFF)
      .fillRoundedRect(W/2 - chipW/2, chipY - chipH/2, chipW, chipH, chipR)
      .lineStyle(2, this.COLOR.BORDER)
      .strokeRoundedRect(W/2 - chipW/2, chipY - chipH/2, chipW, chipH, chipR);

    // reposiciona o texto agora no centro real da pílula
    const chipTxt = tmpText.setPosition(W/2, chipY).setVisible(true);

    this.a9C.add([chipShadow, chip, chipTxt]);

    // 3. Grade 2x2: mesma posição/tamanho/spacing do intruso
    const cardW = 250, cardH = 165, gapX = 24, gapY = 18;
    const cx = W / 2;
    const cy = Math.round(bk ? (bk.yTop + bk.h * 0.62) : (this.LAYOUT.contentY + 40)) - 25; // -25 igual ao offsetY do intruso

    const onCardClick = (imgKey, card) => {
      // 1) anti-spam: se estiver travado, ignora
      if (this._a1Lock) return;

      // Fala o nome da figura que foi clicada
      this.playWordAudio(imgKey);

      // 2) assim que clicar, trava tudo
      this._a1Lock = true;

      const isCorrect = imgKey === r.correct;

      if (isCorrect) {
        // --- Código de acerto ---
        this._a9Resolved = true;
        this.a9C.list.forEach(o => o.input && o.disableInteractive());
        this.playSuccessSound();
        this.bumpEnergy(+1);
        this.tweens.add({ targets: card, scale: 1.06, duration: 120, yoyo: true });
        this.drawCheck(card, cardW, cardH, this.COLOR.SUCCESS);
        this.time.delayedCall(this.SUCCESS_DELAY, () => {
          this.transitionStep('a9C', () => {
            this.a9Index++;
            this._a9Resolved = false;
            this._a9Eliminated = false;
            this.renderA9Round();
          }, 'slideLeft');
        });
        // NÃO destrava aqui: o lock volta a false lá no começo de renderA9Round()
      } else {
        // --- Código de erro ---
        this.tweenShake(card);
        this.playErrorSound();
        this.bumpEnergy(-1);
        // Conta erro desta atividade
        this.registerPhaseError();
        this.drawError(card, cardW, cardH, this.COLOR.DANGER);

        // 3) espera alguns ms e libera de novo
        this.time.delayedCall(800, () => {
          this._a1Lock = false;
        });
      }
    };

    this.criarGrade4Figuras(this, this.a9C, {
      x: cx,
      y: cy,
      cardW,
      cardH,
      gapX,
      gapY,
      keys: picks,
      onCardClick
    });
  }

  // Mapeamento único para cada imagem → sílaba inicial
  getSyllableForKey(key) {
    const map = {
      casa: 'CA', cana: 'CA', cadeado: 'CA', cavalo: 'CA', caneca: 'CA', canoa: 'CA', canudo: 'CA',
      cebola: 'CE', cenoura: 'CE',
      cidade: 'CI', circo: 'CI',
      coelho: 'CO', copo: 'CO', corda: 'CO',
      cubo: 'CU', curativo: 'CU', cola: 'CO'
    };
    return map[key] || 'CA'; // fallback seguro
  }

  // Monte a rodada da A9 com base nas imagens mostradas
  buildA9Round() {
    // escolha 3 imagens do pool
    const pool = ['bule','boia','buzina','banana','bota','bola','bala','balde','bebe','bigode'];
    const imgs = Phaser.Utils.Array.Shuffle(pool).slice(0, 3);

    const targets = imgs.map(k => ({ key: k, syll: this.getSyllableForKey(k) }));

    // bandeja deve conter ao menos TODAS as sílabas necessárias
    const needed = Array.from(new Set(targets.map(t => t.syll)));

    const ALL = ['BA','BE','BI','BO','BU'];
    const distractors = Phaser.Utils.Array.Shuffle(ALL.filter(s => !needed.includes(s))).slice(0, Math.max(0, 3 - needed.length));

    const tray = Phaser.Utils.Array.Shuffle([...needed, ...distractors]); // fica 2–3 opções

    return { targets, tray };
  }



// ========== NOVA ATIVIDADE 9: Sílaba certa para cada figura (drag & drop) ==========
buildA9Round() {
  // Pool de imagens com C (pode ser o mesmo já usado)
  const pool = ['casa','cana','cadeado','cavalo','caneca','cebola','cenoura','cidade','circo','coelho','copo','corda','cubo','curativo','cola'];
  const imgs = Phaser.Utils.Array.Shuffle(pool).slice(0, 3);
  const targets = imgs.map(key => ({ key, syll: this.getSyllableForKey(key) }));
  // Bandeja: sempre ['CA','CE','CI','CO','CU']
  const tray = ['CA','CE','CI','CO','CU'];
  return { targets, tray };
}


// =========================
// A9 — "Sílaba certa para cada figura"
// =========================

// =========================
// A9 — "Sílaba certa para cada figura" (drag & drop simples)
// =========================
setupAtividade9() {
  this.doClearActivity();

  // ordem pedagógica: CA -> CE -> CI -> CO -> CU
  this._a9Order = ['CA','CE','CI','CO','CU'];
  this._a9Step  = 0;
  this._a9Lock  = false;

  // pool por família (usa os assets que você já carrega)
  this._a9Items = {
    CA: ['casa','cana','cadeado'],
    CE: ['cebola','cenoura'],
    CI: ['cidade','circo'],
    CO: ['coelho','copo','corda','cola'],
    CU: ['cubo','curativo'],
  };

  // container raiz da A9
  if (this.a9C && !this.a9C.destroyed) this.a9C.destroy(true);
  this.a9C = this.add.container(0, 0);
  this.activityContainer.add(this.a9C);

  // bind do drop (remove em teardownA9)
  this._a9Drop = (pointer, draggedObj, dropZone) => {
    if (!this._a9Tile || this._a9Lock) return;

    if (dropZone && dropZone.expected === true) {
      // ACERTO
      this._a9Lock = true;
      this._a9Tile._snapped = true;

      // feedback
      this.playSuccessSound?.();
      this.bumpEnergy?.(+1);

      // destaca a carta correta e "pinta" de verdinho
      const card = dropZone._wrap;
      if (card) {
        this.markPermanentSuccess(
          card,
          card.width || 220,
          card.height || 130,
          this.COLOR.SUCCESS
        );
      }

      this.tweens.add({
        targets: this._a9Tile,
        x: dropZone.x, y: dropZone.y + 80,
        scale: 1.0, duration: 140, ease: 'Quad.easeOut'
      });

      // próxima sílaba (ou finalizar)
      this.time.delayedCall(420, () => {
        this._a9Step++;
        if (this._a9Step < this._a9Order.length) {
          this._a9RenderStep();
        } else {
          this.showCompletion('Muito bem! Você colocou a sílaba certa em cada figura!');
        }
      });

    } else {
      // ERRO → volta pra bandeja
      this.handleWrong(this._a9Tile);
    }
  };
  this.input.on('drop', this._a9Drop, this);

  // registra teardown só da A9
  this.teardownA9 = () => {
    this.input.off('drop', this._a9Drop, this);
    try { this.a9C?.destroy(true); } catch(e) {}
    this.a9C = null;
  };

  // primeira rodada
  this._a9RenderStep();
}

// escolhe 1 figura correta da família e 2 distrações de outras famílias
_a9BuildRound(syl) {
  const correctPool = (this._a9Items[syl] || []).slice();
  const correctKey  = Phaser.Utils.Array.GetRandom(correctPool);

  // distrações
  let distractors = [];
  this._a9Order.forEach(s => { if (s !== syl) distractors = distractors.concat(this._a9Items[s]); });
  distractors = Phaser.Utils.Array.Shuffle(distractors).slice(0, 2);

  const options = Phaser.Utils.Array.Shuffle([correctKey, ...distractors]);
  return { syl, correctKey, options };
}

// limpa a rodada anterior (cartas, botões, zonas, fundo)
_a9ClearGrid() {
  try {
    if (this._a9Zones) this._a9Zones.forEach(z => z.destroy());
    this._a9Zones = [];
  } catch(e){}

  try { this._a9Tile?.destroy(); } catch(e){}
  this._a9Tile = null;

  try { this._a9Btn?.destroy(); } catch(e){}
  this._a9Btn = null;

  // Limpar botão de ajuda da A9
  try {
    if (this._a9Help && !this._a9Help.destroyed) {
      this._a9Help.destroy(true);
    }
  } catch(e){}
  this._a9Help = null;

  try { if (this._a9Back?.layer && !this._a9Back.layer.destroyed) this._a9Back.layer.destroy(true); } catch(e){}
  this._a9Back = null;

  // destrói filhos visuais da a9C (cartas etc.)
  try { this.a9C?.removeAll(true); } catch(e){}
}

// desenha uma rodada: 3 cartas + 1 peça arrastável com a sílaba atual
_a9RenderStep() {
  this._a9ClearGrid();
  this._a9Lock = false;

  const syl = this._a9Order[this._a9Step];
  const { correctKey, options } = this._a9BuildRound(syl);

  // placa branca
  const back = this.addActivityBackdrop({
    top:    this.LAYOUT.titleY - 6,
    bottom: this.LAYOUT.footerY() - 90,
    paddingX: 72,
  });
  this._a9Back = back;
  this.makeTitle('Sílaba certa para cada figura');
  this.playTitleAudio(9);

  // Criar botão de ajuda
  if (this._a9Help && !this._a9Help.destroyed) {
    try { this._a9Help.destroy(true); } catch (e) {}
  }
  
  this._a9Help = this.addTutorialButton(
    back,
    'Arraste a sílaba até a figura que começa com esse som.',
    'help_a9_silaba_certa_figura'
  );
  


  // cartas (3 colunas) — centralizadas, grid mais baixo, área útil maior
  const CARD_W = 272, CARD_H = 186, GAP = 36;
  const totalW = 3 * CARD_W + 2 * GAP;
  const startX = Math.round(this.scale.width / 2 - totalW / 2 + CARD_W / 2);
  const yCard  = Math.round(back.yTop + 230);

  this._a9Zones = [];

  options.forEach((imgKey, i) => {
    const x = Math.round(startX + i * (CARD_W + GAP));

    // cartão da imagem
    const card = this.createImageCard(x, yCard, imgKey, CARD_W, CARD_H);
    this.a9C.add(card);

    // drop zone por cima do cartão — acompanha o novo tamanho
    const zone = this.add
      .zone(x, yCard, CARD_W - 4, CARD_H - 4)
      .setRectangleDropZone(CARD_W - 4, CARD_H - 4);

    // a zone fica responsável por interações (hover/click/drag)
    zone.expected = (imgKey === correctKey); // true só na correta
    zone._wrap = card;
    zone.setDepth(this.Z.IMG + 1);
    zone.setInteractive({ useHandCursor: true });

    // highlight suave quando a peça entra/sai (drag da sílaba)
    zone.on('dragenter', () => {
      this.tweens.add({ targets: card, scale: 1.03, duration: 100 });
    });
    zone.on('dragleave', () => {
      this.tweens.add({ targets: card, scale: 1.00, duration: 100 });
    });

    // HOVER com mouse: “incha” um pouquinho
    zone.on('pointerover', () => {
      this.tweens.add({ targets: card, scale: 1.04, duration: 120, ease: 'Quad.easeOut' });
    });
    zone.on('pointerout', () => {
      this.tweens.add({ targets: card, scale: 1.00, duration: 120, ease: 'Quad.easeIn' });
    });

    // CLIQUE na imagem: anima + fala a palavra
    zone.on('pointerdown', () => {
      if (this.startInputCooldown && this.startInputCooldown(260)) return;

      // micro bounce
      this.tweens.add({
        targets: card,
        scale: 1.06,
        duration: 120,
        yoyo: true,
        ease: 'Back.easeOut'
      });

      // áudio da palavra (ex.: BOTA, BOLA, BANANA)
      this.playWordAudio(imgKey);
    });

    this._a9Zones.push(zone);
    this.a9C.add(zone);
  });

  // peça arrastável (quadrado flat, verde, sem cara de botão, 96x96)
  const btnY = back.yBottom - 140; // sobe a sílaba mais 50 px
  const tile = this.createSyllableButton(
    this.scale.width / 2,
    btnY,
    syl,
    this.COLOR.PRIMARY,   // fica igual ao “Monte a palavra” (verde)
    96,                   // W
    96,                   // H -> quadrado
    18,                   // raio
    true                  // <-- FLAT!
  );
  tile.setInteractive({ draggable: true, useHandCursor: true });
  this.input.setDraggable(tile);

  // animação de hover (desktop): dá uma “inchada” suave ao passar o mouse
  tile.on('pointerover', () => {
    if (tile._snapped) return;
    this.tweens.add({ targets: tile, scale: 1.04, duration: 100 });
  });

  tile.on('pointerout', () => {
    if (tile._snapped) return;
    this.tweens.add({ targets: tile, scale: 1.00, duration: 100 });
  });

  // origem p/ retorno se errar
  tile.originalX = tile.x; tile.originalY = tile.y;
  tile._baseScale = 1;
  tile._snapped = false;

  tile.on('pointerdown', () => {
    if (this.startInputCooldown && this.startInputCooldown(260)) return;

    this.playSyllableAudio(syl);
  });

  tile.on('dragstart', () => {
    tile._oldDepth = tile.depth ?? 10;
    tile.setDepth(1000);
    this.tweens.add({ targets: tile, scale: 1.04, duration: 100 });
  });
  tile.on('drag', (_p, dx, dy) => { tile.x = dx; tile.y = dy; });
  tile.on('dragend', () => {
    // se não caiu numa drop zone, volta
    if (!tile._snapped) {
      this.returnToOrigin(tile);
      this.tweens.add({ targets: tile, scale: 1.00, duration: 100 });
    }
  });

  this._a9Tile = tile;
  this.a9C.add(tile);
}


  // =========================
  // HELPERS ESPECÍFICOS
  // =========================
  placeRow(objs, centerX, y, gap, setOrigin = false){
    const w = o => (o.width ?? o.displayWidth ?? 0);
    const totalW = objs.reduce((acc,o,i)=> acc + w(o) + (i?gap:0), 0);
    let x = centerX - totalW/2;

    objs.forEach(o=>{
      const ww = w(o);
      o.setPosition(Math.round(x + ww/2), Math.round(y));
      if (setOrigin) {
        o.originalX = o.x;
        o.originalY = o.y;
      }
      x += ww + gap;
    });
  }

  showA6Tutorial() {
    const A6 = this.A6; if (!A6?.cards?.length) return;

    // Tutorial sem efeito visual azul - apenas dica escrita
    this.showHint('Vire duas cartas iguais (sílaba e figura).');
  }

  attachCardDropZone({ x, y, w, h, expected, onSuccess, targetImg, targetWrap }) {
    // zona de drop (um pouco menor que o cartão)
    const zone = this.add.zone(x, y, w - 20, h - 20).setRectangleDropZone(w - 20, h - 20);
    zone.expected = expected;
    zone.occupied = false;
    zone.width = w - 20;
    zone.height = h - 20;
    zone.onSuccess = onSuccess;
    zone.setDepth(this.Z.IMG + 1);

    // referências para efeitos visuais
    zone._wrap = targetWrap || null;   // container do cartão (bg+imagem)
    zone._halo = this.add.graphics().setDepth(this.Z.IMG + 2);
    const drawHalo = (alpha = 0) => {
      zone._halo.clear();
      zone._halo.lineStyle(4, 0x3B82F6, alpha)
        .strokeRoundedRect(x - w/2 + 4, y - h/2 + 4, w - 8, h - 8, 16);
    };
    drawHalo(0);

    zone.on('dragenter', () => {
      if (targetImg) targetImg.setTint(0xCFEFFF);
      drawHalo(1);
      if (zone._wrap) this.tweens.add({ targets: zone._wrap, scale: 1.03, duration: 100 });
    });

    zone.on('dragleave', () => {
      if (targetImg) targetImg.clearTint();
      drawHalo(0);
      if (zone._wrap) this.tweens.add({ targets: zone._wrap, scale: 1.00, duration: 100 });
    });

    this.a10C.add(zone._halo);
    this.a10C.add(zone);
    return zone;
  }

  drawCard(x, y, w, h, stroke = this.COLOR.PRIMARY) {
    const r = 20;
    const g = this.add.graphics();
    g.fillStyle(0xFFFFFF, 1).fillRoundedRect(x - w/2, y - h/2, w, h, r);
    g.lineStyle(3, stroke, 1).strokeRoundedRect(x - w/2, y - h/2, w, h, r);

    // máscara do mesmo formato (acompanha posição/escala do gráfico)
    const mask = g.createGeometryMask();

    return { x, y, img: g, mask };
  }

  // BOTÃO DE SÍLABA – camadas (shadow + base escura + face + bevel), sem reflexo
  createSyllableButton(x, y, syll, color = this.COLOR.PRIMARY, W = 110, H = 110, R = 22, flat = false) {
      const cont = this.add.container(x, y);
      cont.setSize(W, H);
      cont.width = W; cont.height = H;
      cont._W = W; cont._H = H; cont._R = R;

      // --- VARIANTE FLAT (sem cara de botão) ---
      if (flat) {
        const face = this.add.graphics();
        face.fillStyle(color, 1).fillRoundedRect(-W/2, -H/2, W, H, R);
        const fontSize = Math.max(30, Math.round(Math.min(W, H) * 0.45));
        const label = this.add.text(0, 0, syll, {
          fontFamily: 'Quicksand, Arial, sans-serif',
          fontSize: `${fontSize}px`,
          color: '#FFFFFF',
          fontStyle: 'bold'
        }).setOrigin(0.5);

        cont.add([face, label]);
        cont._face = face;                // mantém p/ flash de acerto/erro
        cont.setInteractive() // só pra bloquear cliques no fundo;
        return cont;                      // sai aqui: nada de sombra, bevel, etc.
      }

      // --- versão “3D” original continua igual abaixo ---
      // paleta fixa elegante p/ sílabas (azul)
      const tone = { base: color, dark: 0x0284C7, light: 0x38BDF8 };

      // sombra suave
      const shadow = this.add.graphics();
      shadow.fillStyle(0x000000, 0.12).fillRoundedRect(-W/2, -H/2 + 6, W, H, R);

      // base escura (profundidade)
      const base = this.add.graphics();
      base.fillStyle(tone.dark, 1).fillRoundedRect(-W/2, -H/2 + 2, W, H - 2, R);

      // face (cor principal)
      const face = this.add.graphics();
      face.fillStyle(tone.base, 1)
          .fillRoundedRect(-W/2, -H/2, W, H - 4, R)
          .lineStyle(2, 0x000000, 0.06).strokeRoundedRect(-W/2, -H/2, W, H - 4, R);
      face._lastColor = tone.base; // para reset rápido de cor

      // bevel fininho (sem brilho fake)
      const bevel = this.add.graphics();
      bevel.lineStyle(1, tone.light, 0.9).strokeRoundedRect(-W/2 + 2, -H/2 + 2, W - 4, H - 8, R - 3);

      // texto
      const fontSize = Math.max(34, Math.round(Math.min(W, H) * 0.42));
      const label = this.add.text(0, 0, syll, {
        fontFamily: 'Quicksand, Arial, sans-serif',
        fontSize: `${fontSize}px`,
        color: '#FFFFFF',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      cont.add([shadow, base, face, bevel, label]);
      cont._face = face; // guardado para "pintar" rápido

      cont.setInteractive() // só pra bloquear cliques no fundo;
      cont.on('pointerover', () => this.tweens.add({ targets: cont, duration: 100, scale: 1.035 }));
      cont.on('pointerout',  () => this.tweens.add({ targets: cont, duration: 100, scale: 1.00  }));
      cont.on('pointerdown', () => this.tweens.add({ targets: cont, duration: 90, scaleX: 0.98, scaleY: 0.98, yoyo: true }));

      // utilitário
      cont.setEnabled = (v) => v
        ? cont.setAlpha(1).setInteractive() // só pra bloquear cliques no fundo
        : cont.setAlpha(0.55).disableInteractive();

      this.activityContainer.add(cont);
      return cont;
    }

  createDragSyllable(x, y, text, w = 84, h = 84) {
    const R = 20;
    const cont = this.add.container(x, y);

    // sem sombra
    const bg = this.add.graphics()
      .fillStyle(this.COLOR.PRIMARY)
      .fillRoundedRect(-w/2, -h/2, w, h, R)
      .lineStyle(2, 0x000000, 0.06)
      .strokeRoundedRect(-w/2, -h/2, w, h, R);

    const fontSize = Math.round(w * 0.38);
    const label = this.add.text(0, 0, text, {
      fontFamily: 'Quicksand, Arial, sans-serif',
      fontSize: `${fontSize}px`,
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    cont.add([bg, label]);
    cont.setSize(w, h).setInteractive({ draggable: true, useHandCursor: true });

    cont._w = w; cont._h = h;
    cont._baseScale = 1;
    cont.originalX = x; cont.originalY = y;
    cont._homeX = cont.originalX;
    cont._homeY = cont.originalY;
    cont.syllable = text;
    cont._snapped = false;

    this.activityContainer.add(cont);
    this.input.setDraggable(cont);

    cont.on('dragstart', () => {
      cont._oldDepth = cont.depth ?? 10;
      cont.setDepth(1000);
      this.tweens.add({ targets: cont, scale: 1.04, duration: 100 });
    });
    cont.on('drag', (_p, dx, dy) => { cont.x = dx; cont.y = dy; });
    cont.on('dragend', () => {
      if (!cont._snapped) this.returnToOrigin(cont);
      this.tweens.add({ targets: cont, scale: 1.00, duration: 100 });
    });
    cont.on('pointerover', () => { if (!cont.input?.dragging) this.tweens.add({ targets: cont, duration: 100, scale: 1.03 }); });
    cont.on('pointerout',  () => { if (!cont.input?.dragging) this.tweens.add({ targets: cont, duration: 100, scale: 1.00 }); });

    return cont;
  }

  createDraggableImage(x, y, key, w, h){
    const c = this.add.container(x, y);

    // Card base
    const card = this.add.graphics()
      .fillStyle(0xFFFFFF)
      .fillRoundedRect(-w/2, -h/2, w, h, 16)
      .lineStyle(2, this.COLOR.BORDER)
      .strokeRoundedRect(-w/2, -h/2, w, h, 16);
    c.add(card);

    // Imagem (sem geometry mask para evitar sumiço)
    if (this.textures.exists(key)) {
      const tex = this.textures.get(key).get();
      const fit = this.fitTexture(tex, w - 18, h - 18);
      const imgNode = this.add.image(0, 0, key).setDisplaySize(fit.w, fit.h);
      imgNode.setDepth(1);
      c.add(imgNode);
    } else {
      c.add(this.add.rectangle(0, 0, w - 40, h - 40, 0xF3F4F6).setStrokeStyle(2, this.COLOR.BORDER));
    }

    c.setSize(w, h).setInteractive({ draggable: true, useHandCursor: true });
    c.originalX = x; c.originalY = y;
    c._homeX = c.originalX;
    c._homeY = c.originalY;
    this.activityContainer.add(c);
    this.input.setDraggable(c);

    c.on('drag', (_, dx, dy) => { c.x = dx; c.y = dy; });
    c.on('pointerover', () => { if (!c.input?.dragging) this.tweens.add({ targets: c, duration: 100, scale: 1.04 }); });
    c.on('pointerout',  () => { if (!c.input?.dragging) this.tweens.add({ targets: c, duration: 100, scale: 1.00 }); });

    return c;
  }

  fitTexture(tex, maxW, maxH) {
    // pega a imagem base se existir; cai para frame/objeto simples
    const base = (tex && typeof tex.getSourceImage === 'function') ? tex.getSourceImage() : tex || {};
    const w = Math.max(1, base.width  || tex?.width  || 1);
    const h = Math.max(1, base.height || tex?.height || 1);
    const s = Math.min(maxW / w, maxH / h, 1);
    return { w: Math.round(w * s), h: Math.round(h * s) };
  }

  returnToOrigin(obj) {
    this.tweens.killTweensOf(obj);
    obj._snapped = false;

    const ox = (obj.originalX !== undefined) ? obj.originalX
             : (obj._homeX     !== undefined) ? obj._homeX
             : obj.x;
    const oy = (obj.originalY !== undefined) ? obj.originalY
             : (obj._homeY     !== undefined) ? obj._homeY
             : obj.y;

    obj.setInteractive();
    obj.setDepth(10);

    this.tweens.add({
      targets: obj,
      x: Math.round(ox),
      y: Math.round(oy),
      scale: obj._baseScale || 1,
      duration: 200,
      ease: 'Quad.easeOut'
    });
  }

  toast(msg){ console.log(msg); }
  
  tweenShake(obj, amp = 8, reps = 2, dur = 60) {
    if (!obj || obj._shaking) return;
    this.tweens.killTweensOf(obj);

    // casa SEMPRE vem de originalX/Y (se existir)
    if (obj._homeX === undefined) {
      obj._homeX = (obj.originalX !== undefined ? obj.originalX : obj.x);
      obj._homeY = (obj.originalY !== undefined ? obj.originalY : obj.y);
    }
    const ox = obj._homeX, oy = obj._homeY;

    obj._shaking = true;
    this.tweens.add({
      targets: obj,
      x: { from: ox - amp, to: ox + amp },
      y: oy,
      duration: dur,
      yoyo: true,
      repeat: reps,
      ease: 'Sine.easeInOut',
      onComplete: () => { obj.setPosition(ox, oy); obj._shaking = false; }
    });
  }

  // pinta temporariamente a face do botão e volta
  flashFaceColor(btn, color, ms = 420) {
    if (!btn?._face) return;
    const W = btn._W, H = btn._H, R = btn._R;
    const face = btn._face;
    const back = face._lastColor || this.COLOR.PRIMARY;

    face.clear();
    face.fillStyle(color, 1)
        .fillRoundedRect(-W/2, -H/2, W, H - 4, R)
        .lineStyle(2, 0x000000, 0.06).strokeRoundedRect(-W/2, -H/2, W, H - 4, R);

    this.time.delayedCall(ms, () => {
      face.clear();
      face.fillStyle(back, 1)
          .fillRoundedRect(-W/2, -H/2, W, H - 4, R)
          .lineStyle(2, 0x000000, 0.06).strokeRoundedRect(-W/2, -H/2, W, H - 4, R);
    });
  }

  // padrão pedido: balança + verde no acerto / balança + vermelho no erro
  animateSyllable(btn, isCorrect) {
    const color = isCorrect ? this.COLOR.SUCCESS : this.COLOR.DANGER;
    const amp   = isCorrect ? 5 : 8;
    const reps  = isCorrect ? 1 : 2;

    this.tweenShake(btn, amp, reps, 60);
    this.flashFaceColor(btn, color, isCorrect ? 360 : 520);
    (isCorrect ? this.playSuccessSound : this.playErrorSound).call(this);
    this.bumpEnergy(isCorrect ? +1 : -1);
  }

  createSlotPlate(xCenter, yBase, opt = {}) {
    const {
      PLATE_W = 150, PLATE_H = 78, R = 16,
      SLOT_W = 96, SLOT_H = 72, GAP = 20,
      HIT_PAD = 20,
      numSlots = 2
    } = opt;

    const cx = xCenter, cy = yBase;

    // Base da placa com visual mais "cartão" (sombra suave + borda dupla sutil)
    const plateShadow = this.add.graphics();
    plateShadow.fillStyle(0x000000, 0.10)
              .fillRoundedRect(cx - PLATE_W/2, cy - PLATE_H/2 + 6, PLATE_W, PLATE_H, R + 2);

    const plate = this.add.graphics();
    // fundo levemente translúcido para parecer elevado
    plate.fillStyle(0xFFFFFF, 0.98)
        .fillRoundedRect(cx - PLATE_W/2, cy - PLATE_H/2, PLATE_W, PLATE_H, R)
        // borda externa
        .lineStyle(2, this.COLOR.BORDER, 0.85)
        .strokeRoundedRect(cx - PLATE_W/2, cy - PLATE_H/2, PLATE_W, PLATE_H, R);
    // brilho superior (bevel)
    plate.lineStyle(1, 0xFFFFFF, 0.9)
         .strokeRoundedRect(cx - PLATE_W/2 + 1, cy - PLATE_H/2 + 1, PLATE_W - 2, PLATE_H - 2, R - 2);

    const centers = numSlots === 1 ? [cx] : [cx - (SLOT_W + GAP) / 2, cx + (SLOT_W + GAP) / 2];

    const slots = centers.map(px => {
      const zone = this.add.zone(px, cy, SLOT_W + HIT_PAD*2, SLOT_H + HIT_PAD*2)
        .setRectangleDropZone(SLOT_W + HIT_PAD*2, SLOT_H + HIT_PAD*2);

      zone._slotW = SLOT_W;
      zone._slotH = SLOT_H;

      // sombra do slot (para dar profundidade)
      const slotShadow = this.add.graphics();
      slotShadow.fillStyle(0x000000, 0.08)
                .fillRoundedRect(px - SLOT_W/2, cy - SLOT_H/2 + 3, SLOT_W, SLOT_H, 12);

      const bg = this.add.graphics();
      bg.fillStyle(0xF8FAFC, 1.0) // cinza quase branco
        .fillRoundedRect(px - SLOT_W/2, cy - SLOT_H/2, SLOT_W, SLOT_H, 12);

      const border = this.add.graphics();
      border.lineStyle(2.5, this.COLOR.BORDER, 0.95)
            .strokeRoundedRect(px - SLOT_W/2, cy - SLOT_H/2, SLOT_W, SLOT_H, 12);

      const inset = this.add.graphics();
      inset.lineStyle(1, 0xFFFFFF, 0.9)
           .strokeRoundedRect(px - SLOT_W/2 + 1.5, cy - SLOT_H/2 + 1.5, SLOT_W - 3, SLOT_H - 3, 10);

      zone._bg = bg; zone._border = border; zone._inset = inset; zone._shadow = slotShadow;

      zone.on('dragenter', () => {
        border.clear().lineStyle(3, this.COLOR.PRIMARY, 1)
              .strokeRoundedRect(px - SLOT_W/2, cy - SLOT_H/2, SLOT_W, SLOT_H, 12);
        bg.clear().fillStyle(0xE0F2FE, 0.9) // azul bem claro de foco
          .fillRoundedRect(px - SLOT_W/2, cy - SLOT_H/2, SLOT_W, SLOT_H, 12);
      });
      zone.on('dragleave', () => {
        border.clear().lineStyle(2.5, this.COLOR.BORDER, 0.95)
              .strokeRoundedRect(px - SLOT_W/2, cy - SLOT_H/2, SLOT_W, SLOT_H, 12);
        bg.clear().fillStyle(0xF8FAFC, 1.0)
          .fillRoundedRect(px - SLOT_W/2, cy - SLOT_H/2, SLOT_W, SLOT_H, 12);
      });

      return { zone, bg, border, inset, shadow: slotShadow };
    });

    return { plate, plateShadow, slots };
  }

  makeBucketPanel(x, y, label, strokeColor) {
  // Permite passar altura customizada (default 160)
  const W = 270, R = 18;
  const H = arguments.length > 4 ? arguments[4] : 160;

  const group = this.add.container(x, y);
  this.a6C.add(group);

  const sh = this.add.graphics();
  sh.fillStyle(0x000000, 0.06).fillRoundedRect(-W/2, -H/2 + 6, W, H, R);
  const g = this.add.graphics();
  g.fillStyle(0xFFFFFF).fillRoundedRect(-W/2, -H/2, W, H, R);
  g.lineStyle(3, strokeColor).strokeRoundedRect(-W/2, -H/2, W, H, R);

  const t = this.add.text(0, 0, label, this.tx48()).setOrigin(0.5);

  // Área de drop mais generosa: aumenta 10px em cada direção
  const zoneW = W - 14;
  const zoneH = H - 14;
  const zone = this.add.zone(x, y, zoneW, zoneH).setRectangleDropZone(zoneW, zoneH);
  zone._border = g; zone._W = W; zone._H = H; zone._R = R; zone._container = group;

  group.add([sh, g, t]);
  return { container: group, zone, x, y };
  }

  // Helper functions
  // Transição com palmeiras cobrindo a tela (direita + esquerda flipada)
  startPalmWipe(nextFn) {
    const W = this.scale.width, H = this.scale.height;
    const key = 'palmeira_wipe';

    const runFallback = () => {
      this.cameras.main.fadeOut(140, 0, 0, 0);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        try { if (typeof nextFn === 'function') nextFn(); } catch(e) {}
        this.cameras.main.fadeIn(180, 0, 0, 0);
      });
    };

    if (!this.textures.exists(key)) { runFallback(); return; }

    const palmL = this.add.image(0, H/2, key).setOrigin(0.5).setFlipX(true).setDepth(5000);
    const palmR = this.add.image(0, H/2, key).setOrigin(0.5).setDepth(5000);

    const src = this.textures.get(key).getSourceImage();
    const ih = (src && src.height) ? src.height : palmR.height || H;
    const iw = (src && src.width)  ? src.width  : palmR.width  || (W/2);
    const scaleH = (H + 80) / Math.max(1, ih);
    const scaleW = (W/2 + 32) / Math.max(1, iw);
    const scale = Math.max(scaleH, scaleW);
    palmL.setScale(scale);
    palmR.setScale(scale);

    const halfW = palmR.displayWidth / 2;
    palmL.x = -halfW;
    palmR.x = W + halfW;

    const coverDur = 550;
    const uncoverDur = 600;

    const overlap = 24; // px de sobreposição no centro
    this.tweens.add({ targets: palmL, x: W/2 - halfW + overlap/2, duration: coverDur, ease: 'Quad.easeIn' });
    this.tweens.add({
      targets: palmR,
      x: W/2 + halfW - overlap/2,
      duration: coverDur,
      ease: 'Quad.easeIn',
      onComplete: () => {
        try { if (typeof nextFn === 'function') nextFn(); } catch(e) {}
        this.tweens.add({ targets: palmL, x: -halfW, duration: uncoverDur, delay: 150, ease: 'Quad.easeOut' });
        this.tweens.add({ targets: palmR, x: W + halfW, duration: uncoverDur, delay: 150, ease: 'Quad.easeOut', onComplete: () => { palmL.destroy(); palmR.destroy(); } });
      }
    });
  }

  // Wrapper para navegar com a transição de palmeiras
  // Esta função deve ser usada sempre que precisar navegar entre atividades
  // para manter consistência visual com a transição das palmeiras
  goToActivityPalm(n) {
    this.startPalmWipe(() => this.showActivity(n, /*withIntro*/ true));
  }
  makeTitle(txt) {
    const W = this.scale.width;

    const t = this.add.text(
      W / 2,
      this.LAYOUT.titleY,
      fixMojibake(txt),
      {
        fontSize: '32px',
        color: this.COLOR.TEXT_DARK,
        fontFamily: 'Fredoka, Quicksand, Arial, sans-serif',
        fontStyle: 'bold'
      }
    )
      .setOrigin(0.5)
      // garante que o título sempre fica na frente das imagens/cartas
      .setDepth(this.Z?.UI ?? 2000);

    this.activityContainer.add(t);
    return t;
  }

 'fade'
  transitionStep(refKey, buildNext, effect = 'slideLeft') {
    const oldC = (typeof refKey === 'string') ? this[refKey] : refKey;
    if (!oldC) { buildNext(); return; }

    this.input.enabled = false;

    let dx = 0, dy = 0;
    if (effect === 'slideLeft')  dx = -40;
    if (effect === 'slideRight') dx =  40;
    if (effect === 'slideUp')    dy = -24;
    if (effect === 'slideDown')  dy =  24;

    this.tweens.add({
      targets: oldC,
      alpha: 0,
      x: oldC.x + dx,
      y: oldC.y + dy,
      duration: 180,
      ease: 'Quad.easeIn',
      onComplete: () => {
        oldC.destroy(true);
        // constrói a próxima etapa (cria um NOVO container no mesmo this['refKey'])
        buildNext();

        const newC = (typeof refKey === 'string') ? this[refKey] : null;
        if (newC) {
          // entra invertendo o deslocamento
          newC.setAlpha(0).setX((newC.x || 0) - dx).setY((newC.y || 0) - dy);
          this.tweens.add({
            targets: newC,
            alpha: 1,
            x: (newC.x || 0) + dx,
            y: (newC.y || 0) + dy,
            duration: 220,
            ease: 'Quad.easeOut',
            onComplete: () => { this.input.enabled = true; }
          });
        } else {
          this.input.enabled = true;
        }
      }
    });
  }

  // Entrada com "escadinha" (stagger)
  staggerIn(nodes = [], { delay = 40, from = 'bottom' } = {}) {
    const off = (from === 'bottom') ? 12 : (from === 'top' ? -12 : 0);
    nodes.forEach((n, i) => {
      if (!n) return;
      const canScale = !(n._avoidScale) && typeof n.setScale === 'function';
      n.setAlpha(0);
      if (canScale) n.setScale(0.96);
      if (off) n.y += off;

      this.tweens.add({
        targets: n,
        alpha: 1,
        ...(canScale ? { scale: 1 } : {}),
        y: off ? n.y - off : n.y,
        delay: i * delay,
        duration: 220,
        ease: 'Quad.easeOut',
        onComplete: () => {
          // Garantir alpha 1.0 completo no final da animação
          if (n && n.setAlpha) n.setAlpha(1.0);
        }
      });
    });
  }

  // Evita double-click/disparo múltiplo em botões
  startInputCooldown(ms = 200) {
    if (this.__clickCooldown) return true;
    this.__clickCooldown = true;

    if (this._inputCooldownTimer) {
      try { this._inputCooldownTimer.remove(false); } catch (e) {}
      this._inputCooldownTimer = null;
    }

    this._inputCooldownTimer = this.time.delayedCall(ms, () => {
      this.__clickCooldown = false;
      this._inputCooldownTimer = null;
    });

    return false;
  }

  // Evita estourar o mesmo áudio várias vezes seguidas
  startAudioCooldown(ms = 250) {
    if (this.__audioCooldown) return true;
    this.__audioCooldown = true;

    if (this._audioCooldownTimer) {
      try { this._audioCooldownTimer.remove(false); } catch (e) {}
      this._audioCooldownTimer = null;
    }

    this._audioCooldownTimer = this.time.delayedCall(ms, () => {
      this.__audioCooldown = false;
      this._audioCooldownTimer = null;
    });

    return false;
  }

  // Teardown da Atividade 9
  teardownA9() {
    // desliga TODOS os listeners registrados pela A9
    this.input.off('dragstart', this._a9DragStart, this);
    this.input.off('drag',      this._a9Drag,      this);
    this.input.off('dragend',   this._a9DragEnd,   this);
    this.input.off('drop',      this._a9Drop,      this);

    // destrói o container com todos os filhos
    if (this.a10C && !this.a10C.destroyed) this.a10C.destroy(true);
    this.a10C = null;
  }

  // (Cinto e suspensório) Limpeza defensiva antes de cada atividade
  clearA9Artifacts() {
    this.children.list
      .filter(n => n && n._a9Tag)         // tudo que foi marcado na A9
      .forEach(n => { try { n.destroy(); } catch(e){} });
  }

  addTutorialButton(backdrop, hintText, hintAudioKey = null) {
    // canto superior direito da placa branca
    const x = backdrop.x + backdrop.w - 80;
    const y = backdrop.yTop + 60;

    const cont = this.add.container(x, y);

    const icon = this.add.image(0, 0, 'icon_ajuda');

    // ajustar escala para algo em torno de 150px (bem maior e sem sombra)
    try {
      const tex = this.textures.get('icon_ajuda').getSourceImage();
      const maxSize = 150;
      const s = Math.min(maxSize / tex.width, maxSize / tex.height);
      icon.setScale(s);
    } catch (e) {}

    cont.add([icon]);
    cont.setSize(150, 150);
    cont.setInteractive({ useHandCursor: true });

    cont.on('pointerover', () => {
      this.tweens.add({ targets: cont, duration: 100, scale: 1.06 });
    });

    cont.on('pointerout', () => {
      this.tweens.add({ targets: cont, duration: 100, scale: 1.0 });
    });

    cont.on('pointerdown', () => {
      if (this.startInputCooldown && this.startInputCooldown(260)) return;

      this.tweens.add({
        targets: cont,
        scaleX: 0.96,
        scaleY: 0.96,
        duration: 90,
        yoyo: true
      });
      this.playClickSound?.();
      if (hintAudioKey) {
        // marca que esse help veio de clique do usuário
        this._helpFromUserClick = true;
        this.playHelpAudio(hintAudioKey);
        this._helpFromUserClick = false;
      }
    });

    this.activityContainer.add(cont);
    return cont;
  }

  // Text presets
  tx32(){ return { fontFamily:'Quicksand, Arial, sans-serif', fontSize:'32px', color:'#333', fontStyle:'bold' }; }
  tx48(){ return { fontFamily:'Quicksand, Arial, sans-serif', fontSize:'48px', color:'#333', fontStyle:'bold' }; }

  // Limpar recursos quando a cena for destruída
  shutdown() {
    this.stopBackgroundMusic();
  }
}