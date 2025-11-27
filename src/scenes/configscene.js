import SaveManager from '../services/savemanager.js';

export default class ConfigScene extends Phaser.Scene {
    constructor() {
        super({ key: 'configscene' });
        this.shadowDepth = 6;
        this.COLOR = {
            PRIMARY: 0x4CAF50,
            SECONDARY: 0x2196F3,
            ACCENT: 0xFFC107,
            SUCCESS: 0x4CAF50,
            DANGER: 0xF44336,
            BG_LIGHT: 0xf5f5f5,
            BG_WHITE: 0xffffff,
            TEXT_DARK: '#333333',
            TEXT_LIGHT: '#ffffff'
        };
    }

    create() {
        // Proteção contra múltiplas chamadas rápidas
        if (this._isCreating) {
            console.warn('ConfigScene já está sendo criada, ignorando');
            return;
        }
        this._isCreating = true;
        this._closing = false; // Reset da flag de fechamento

        // Fundo com gradiente
        const overlay = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.6)
            .setOrigin(0, 0)
            .setInteractive();

        // Painel principal com bordas arredondadas
        const painel = this.add.graphics();
        painel.fillStyle(this.COLOR.BG_WHITE, 0.98);
        painel.fillRoundedRect(
            this.scale.width / 2 - 280,
            this.scale.height / 2 - 200,
            560, 400, 25
        );
        
        // Borda do painel
        painel.lineStyle(3, this.COLOR.PRIMARY, 0.8);
        painel.strokeRoundedRect(
            this.scale.width / 2 - 280,
            this.scale.height / 2 - 200,
            560, 400, 25
        );

        // Anima\u00e7\u00e3o suave de entrada do painel
        painel.setScale(0.8);
        painel.setAlpha(0);
        this.tweens.add({
            targets: painel,
            scale: 1,
            alpha: 1,
            duration: 300,
            ease: 'Back.Out'
        });

        // Header colorido
        const headerBg = this.add.graphics();
        headerBg.fillStyle(this.COLOR.PRIMARY);
        headerBg.fillRoundedRect(
            this.scale.width / 2 - 280,
            this.scale.height / 2 - 200,
            560, 80, { tl: 25, tr: 25, bl: 0, br: 0 }
        );

        // Ícone do título
        const iconBg = this.add.circle(this.scale.width / 2 - 180, this.scale.height / 2 - 160, 25, this.COLOR.BG_WHITE);
        
        // Criar ícone de engrenagem com gráficos
        const gearIcon = this.add.graphics();
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
        gearIcon.fillStyle(this.COLOR.BG_WHITE, 1);
        gearIcon.fillCircle(centerX, centerY, innerRadius);
        gearIcon.strokeCircle(centerX, centerY, innerRadius);
        
        gearIcon.setDepth(100);

        // Título principal
        this.add.text(this.scale.width / 2 - 130, this.scale.height / 2 - 160, 'Configurações', {
            fontSize: '36px',
            fontFamily: 'Bobby Jones Soft, Arial, sans-serif',
            color: this.COLOR.TEXT_LIGHT,
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        // Seção do Volume da Música
        const volumeY = this.scale.height / 2 - 70;
        
        // Ícone de volume
        const volumeIconBg = this.add.circle(this.scale.width / 2 - 200, volumeY, 22, this.COLOR.SECONDARY);
        this.add.text(this.scale.width / 2 - 200, volumeY, 'VOL', {
            fontSize: '14px',
            color: '#ffffff',
            fontFamily: 'Arial Black'
        }).setOrigin(0.5);

        // Label Volume da Música
        this.add.text(this.scale.width / 2 - 160, volumeY, 'Volume da Música:', {
            fontSize: '24px',
            fontFamily: 'Bobby Jones Soft, Arial, sans-serif',
            color: this.COLOR.TEXT_DARK,
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        // === CONFIGURAÇÃO DO SLIDER ===
        // Volume inicial da música (0 a 1) - DECLARAR PRIMEIRO
        const saveSettings = SaveManager.load().settings || {};
        let volumeMusica = (saveSettings.musicVolume !== undefined ? saveSettings.musicVolume : parseFloat(localStorage.getItem('musicVolume') || '0.3'));
        const sliderMinX = this.scale.width / 2 - 150;
        const sliderMaxX = this.scale.width / 2 + 150;
        const sliderWidth = 300;
        let handleX = sliderMinX + (volumeMusica * sliderWidth);

        // Trilha do slider (fundo)
        const sliderBg = this.add.graphics();
        sliderBg.fillStyle(0xe0e0e0);
        sliderBg.fillRoundedRect(sliderMinX, volumeY + 40, sliderWidth, 12, 6);
        
        // Trilha ativa do slider
        const sliderActive = this.add.graphics();
        sliderActive.fillStyle(this.COLOR.SECONDARY);
        sliderActive.fillRoundedRect(sliderMinX, volumeY + 40, volumeMusica * sliderWidth, 12, 6);

        // Display do valor do volume
        const volumeValueBg = this.add.graphics();
        volumeValueBg.fillStyle(this.COLOR.ACCENT);
        volumeValueBg.fillRoundedRect(this.scale.width / 2 + 170, volumeY + 30, 80, 32, 16);

        const volumeTexto = this.add.text(
            this.scale.width / 2 + 210, volumeY + 46,
            Math.round(volumeMusica * 100) + '%', { 
                fontSize: '20px', 
                fontFamily: 'Bobby Jones Soft, Arial, sans-serif',
                color: this.COLOR.TEXT_LIGHT,
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);
        
        // Handle do slider (bolinha) - usando container
        const sliderHandle = this.add.container(handleX, volumeY + 46);
        
        const handleBg = this.add.circle(0, 0, 18, this.COLOR.BG_WHITE);
        const handleBorder = this.add.circle(0, 0, 18).setStrokeStyle(4, this.COLOR.SECONDARY);
        
        sliderHandle.add([handleBg, handleBorder]);
        sliderHandle.setSize(36, 36);
        sliderHandle.setInteractive({ draggable: true, useHandCursor: true });

        // Função para atualizar o slider
        const updateSlider = (newX) => {
            const clampedX = Math.max(sliderMinX, Math.min(sliderMaxX, newX));
            handleX = clampedX;
            
            // Mover o handle para nova posição
            sliderHandle.x = handleX;
            
            // Atualizar volume da música
            volumeMusica = (clampedX - sliderMinX) / sliderWidth;
            const percentage = Math.round(volumeMusica * 100);
            volumeTexto.setText(percentage + '%');
            
            // Atualizar trilha ativa
            sliderActive.clear();
            sliderActive.fillStyle(this.COLOR.SECONDARY);
            sliderActive.fillRoundedRect(sliderMinX, volumeY + 40, (clampedX - sliderMinX), 12, 6);
            
            // Salvar no localStorage
            localStorage.setItem('musicVolume', volumeMusica.toString());
            try {
                const save = SaveManager.load();
                save.settings.musicVolume = volumeMusica;
                SaveManager.save(save);
            } catch (e) {}
            
            // Aplicar volume às músicas ativas
            this.updateMusicVolume(volumeMusica);
        };

        // Eventos de arrastar o slider
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

        // Clique na trilha para mover o handle
        const sliderArea = this.add.zone(
            this.scale.width / 2, volumeY + 46, 320, 40
        ).setInteractive({ useHandCursor: true });

        sliderArea.on('pointerdown', (pointer) => {
            updateSlider(pointer.x);
        });

        // Seção de botões
        const buttonsY = this.scale.height / 2 + 120;
        
        // Botão Fechar (centralizado)
        const fecharBg = this.add.graphics();
        fecharBg.fillStyle(this.COLOR.DANGER);
        fecharBg.fillRoundedRect(this.scale.width / 2 - 70, buttonsY - 25, 140, 50, 15);
        fecharBg.setInteractive(
            new Phaser.Geom.Rectangle(this.scale.width / 2 - 70, buttonsY - 25, 140, 50),
            Phaser.Geom.Rectangle.Contains,
            { useHandCursor: true }
        );

        const fecharTexto = this.add.text(this.scale.width / 2, buttonsY, 'FECHAR', {
            fontSize: '20px',
            fontFamily: 'Arial Black',
            color: this.COLOR.TEXT_LIGHT,
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Evento do botão fechar
        fecharBg.on('pointerdown', () => {
            // Proteção contra cliques múltiplos
            if (this._closing) {
                console.log('Já fechando, ignorando clique');
                return;
            }
            this._closing = true;
            console.log('Fechando ConfigScene...');
            
            // Salvar configurações
            localStorage.setItem('musicVolume', volumeMusica.toString());
            try {
                const save = SaveManager.load();
                save.settings.musicVolume = volumeMusica;
                SaveManager.save(save);
            } catch (e) {}
            
            // Retomar músicas
            this.resumeBackgroundMusic();
            
            // Fechar configurações com delay para evitar problemas
            this.time.delayedCall(100, () => {
                this.scene.stop();
            });
        });
        // Inicializar slider com valor salvo
        updateSlider(handleX);
        
        // Limpar flag de criação
        this._isCreating = false;
    }

    // Método para atualizar volume das músicas ativas em outras cenas
    updateMusicVolume(volume) {
        try {
            // Atualizar música do StartScene
            const startScene = this.scene.get('startscene');
            if (startScene && startScene.musicaInicio) {
                startScene.musicaInicio.setVolume(volume);
            }
            
            // Atualizar música do FaseScene
            const faseScene = this.scene.get('fasescene');
            if (faseScene && faseScene.musicaFases) {
                faseScene.musicaFases.setVolume(volume);
            }
        } catch (error) {
            console.warn('Erro ao atualizar volume das músicas:', error);
        }
    }

    // Método para retomar músicas de fundo
    resumeBackgroundMusic() {
        try {
            const volumeSalvo = parseFloat(localStorage.getItem('musicVolume') || '0.3');
            
            // Retomar música do StartScene
            const startScene = this.scene.get('startscene');
            if (startScene && startScene.musicaInicio && startScene.musicaInicio.isPaused) {
                startScene.musicaInicio.setVolume(volumeSalvo);
                startScene.musicaInicio.resume();
            }
            
            // Retomar música do FaseScene
            const faseScene = this.scene.get('fasescene');
            if (faseScene && faseScene.musicaFases && faseScene.musicaFases.isPaused) {
                faseScene.musicaFases.setVolume(volumeSalvo);
                faseScene.musicaFases.resume();
            }
        } catch (error) {
            console.warn('Erro ao retomar músicas:', error);
        }
    }

    // Método chamado quando a cena é destruída
    shutdown() {
        console.log('ConfigScene: iniciando shutdown');
        this._isCreating = false;
        this._closing = false;
        
        // Limpar listeners se existirem
        if (this.input) {
            this.input.removeAllListeners();
        }
        
        console.log('ConfigScene: shutdown completo');
    }
}
