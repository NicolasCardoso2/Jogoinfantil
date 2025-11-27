import SaveManager from '../services/savemanager.js';

// Painel simples para visualizar/debugar o JSON de save durante o jogo.
// Tecla P alterna visibilidade. Botões: salvar, recarregar, limpar, simular fase.
export default class SaveDebugPanel {
  constructor(scene, { currentPhaseLetter = 'B', onChange = null } = {}) {
    this.scene = scene;
    this.currentPhaseLetter = currentPhaseLetter;
    this.onChange = onChange;
    this.visible = false;
    this.container = null;
    this.keyP = null;
    this._build();
  }

  _build() {
    const scene = this.scene;
    const w = scene.scale.width;
    const h = scene.scale.height;

    this.container = scene.add.container(0, 0).setDepth(5000).setVisible(false);

    // Fundo semi-transparente
    const overlay = scene.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.35)
      .setInteractive({ useHandCursor: true });
    overlay.on('pointerdown', () => this.hide());

    const panelW = Math.min(760, w * 0.85);
    const panelH = Math.min(520, h * 0.8);
    const panelX = (w - panelW) / 2;
    const panelY = (h - panelH) / 2;

    const panel = scene.add.rectangle(panelX, panelY, panelW, panelH, 0xffffff, 0.96)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x2e7d32, 1)
      .setInteractive();

    const title = scene.add.text(panelX + 16, panelY + 10, 'Painel de Save (P para fechar)', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#0f172a'
    });

    // JSON text area
    const textBg = scene.add.rectangle(panelX + 12, panelY + 42, panelW - 24, panelH - 120, 0x0b1021, 0.75)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x1f2937, 1);

    this.jsonText = scene.add.text(panelX + 20, panelY + 50, '', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#e2e8f0',
      wordWrap: { width: panelW - 40 }
    });
    this.jsonText.setOrigin(0, 0);

    // Botões simples
    const buttons = [
      { label: 'Salvar agora', handler: () => this._handleSave() },
      { label: 'Recarregar', handler: () => this._handleReload() },
      { label: 'Limpar save', handler: () => this._handleReset() },
      { label: 'Simular conclusão', handler: () => this._handleSimulate() }
    ];

    const btnW = (panelW - 48) / buttons.length;
    const btnY = panelY + panelH - 60;
    this.buttonRefs = [];
    buttons.forEach((btn, idx) => {
      const x = panelX + 12 + idx * (btnW + 8);
      const g = scene.add.rectangle(x, btnY, btnW, 46, 0x2e7d32, 1)
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true });
      const label = scene.add.text(x + btnW / 2, btnY + 23, btn.label, {
        fontFamily: 'Arial Black',
        fontSize: '14px',
        color: '#ffffff'
      }).setOrigin(0.5);
      g.on('pointerdown', () => btn.handler());
      g.on('pointerover', () => g.setFillStyle(0x388e3c, 1));
      g.on('pointerout', () => g.setFillStyle(0x2e7d32, 1));
      this.buttonRefs.push(g);
      this.container.add([g, label]);
    });

    this.container.add([overlay, panel, title, textBg, this.jsonText]);

    // Hotkey
    this.keyP = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    this.keyP.on('down', () => this.toggle());

    this.refresh();
  }

  toggle() {
    this.visible = !this.visible;
    this.container?.setVisible(this.visible);
    if (this.visible) this.refresh();
  }

  show() {
    this.visible = true;
    this.container?.setVisible(true);
    this.refresh();
  }

  hide() {
    this.visible = false;
    this.container?.setVisible(false);
  }

  refresh() {
    try {
      SaveManager.load();
      this.jsonText.setText(SaveManager.exportJSON());
    } catch (e) {
      this.jsonText.setText('Erro ao ler save');
    }
  }

  _emitChange() {
    if (typeof this.onChange === 'function') {
      this.onChange(SaveManager.state);
    }
  }

  _handleSave() {
    SaveManager.save(SaveManager.state);
    this.refresh();
    this._emitChange();
  }

  _handleReload() {
    SaveManager.load();
    this.refresh();
    this._emitChange();
  }

  _handleReset() {
    SaveManager.resetAll();
    this.refresh();
    this._emitChange();
  }

  _handleSimulate() {
    const letter = this.currentPhaseLetter || 'B';
    SaveManager.updatePhase(letter, { starsEarnedThisRun: 3 });
    for (let i = 1; i <= 9; i += 1) {
      SaveManager.updateActivity(letter, i, { completed: true, stars: 3, correct: 0, wrong: 0 });
    }
    this.refresh();
    this._emitChange();
  }
}
