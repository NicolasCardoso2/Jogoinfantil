import StartScene from './scenes/start.js';
import ConfigScene from './scenes/configscene.js';
import FaseScene from './scenes/fasescene.js';
import Fase1Atividades from './scenes/fase1_atividades.js';
import Fase2Atividades from './scenes/fase2_atividades.js';
import Fase3Atividades from './scenes/fase3_atividades.js';
import Fase4Atividades from './scenes/fase4_atividades.js';
import SaveManager from './services/savemanager.js';

// Proteção extra para evitar cenas duplicadas
function filtraCenasUnicas(scenes) {
    const keys = new Set();
    return scenes.filter(sceneClass => {
        // Tenta obter a chave da cena
        let key = sceneClass?.prototype?.sys?.settings?.key;
        if (!key && sceneClass?.prototype?.constructor) {
            // Tenta instanciar para pegar o key
            try {
                const inst = new sceneClass();
                key = inst.sys?.settings?.key;
            } catch {}
        }
        if (!key && sceneClass?.prototype) {
            // Tenta pegar do construtor
            try {
                const inst = Object.create(sceneClass.prototype);
                sceneClass.call(inst);
                key = inst.sys?.settings?.key;
            } catch {}
        }
        if (!key) return true; // Se não conseguir, deixa passar
        if (keys.has(key)) return false;
        keys.add(key);
        return true;
    });
}

const cenasOriginais = [
    StartScene,
    ConfigScene,
    FaseScene,
    Fase1Atividades,
    Fase2Atividades,
    Fase3Atividades,
    Fase4Atividades
];

const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1280,
        height: 720
    },
    backgroundColor: '#f5f7fb',
    scene: filtraCenasUnicas(cenasOriginais)
};

// Inicializa e exp?e o SaveManager no boot
try {
    SaveManager.load();
    window.saveManager = SaveManager;
} catch (e) {
    console.warn('N?o foi poss?vel inicializar SaveManager no boot', e);
}

// Função global para transições suaves entre cenas
window.mudarCenaComFade = function(scene, nomeDaProximaCena) {
  try {
    if (!scene || !scene.cameras || !scene.cameras.main) return;

    // Se estiver preso, libera após um tempo
    if (scene._transitioning) {
      // se já estava preso, solta e tenta de novo
      scene._transitioning = false;
    }

    scene._transitioning = true;

    let done = false;
    const finalize = () => {
      if (done) return;
      done = true;
      scene._transitioning = false;
      scene.scene.start(nomeDaProximaCena);
    };

    scene.cameras.main.fadeOut(300, 245, 247, 251);

    // normal
    scene.cameras.main.once('camerafadeoutcomplete', finalize);

    // watchdog: se o evento não disparar, ainda assim troca (sem travar)
    if (scene.time && scene.time.delayedCall) {
      scene.time.delayedCall(700, () => {
        if (!scene.sys || !scene.sys.isActive()) return;
        finalize();
      });
    } else {
      setTimeout(finalize, 700);
    }
  } catch (e) {
    try { scene._transitioning = false; } catch (e2) {}
    if (scene && scene.scene && scene.scene.start) scene.scene.start(nomeDaProximaCena);
  }
};

// Prevenir múltiplas instâncias do jogo
if (!window.gameInstance) {
    window.gameInstance = new Phaser.Game(config);
}
