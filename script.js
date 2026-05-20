// --- GESTÃO DE TELAS ---
const startScreen = document.getElementById('start-screen');
const briefingModal = document.getElementById('briefing-modal');
const victoryScreen = document.getElementById('victory-screen');
const failureScreen = document.getElementById('failure-screen'); 
const startButton = document.getElementById('start-button');
const closeBriefing = document.getElementById('close-briefing');

// --- CRIAÇÃO DO HUD (MENSAGEM DE INTERAÇÃO) ---
const interactionMsg = document.createElement('div');
interactionMsg.style.position = 'absolute';
interactionMsg.style.top = '20%';
interactionMsg.style.left = '50%';
interactionMsg.style.transform = 'translate(-50%, -50%)';
interactionMsg.style.color = '#00ff66';
interactionMsg.style.fontFamily = 'monospace';
interactionMsg.style.fontSize = '20px';
interactionMsg.style.textShadow = '2px 2px #000';
interactionMsg.style.display = 'none';
interactionMsg.innerText = '[ CLIQUE PARA ACESSAR TERMINAL ]';
document.body.appendChild(interactionMsg);

// --- ESTADO DO CRONÔMETRO GLOBAL ---
let totalTime = 600; // 10 minutos em segundos
let timerInterval = null;
let isGameOver = false;

// Função que controla a contagem regressiva
function startGlobalTimer() {
    timerInterval = setInterval(() => {
        if (isGameOver) {
            clearInterval(timerInterval);
            return;
        }

        totalTime--;

        if (totalTime <= 0) {
            totalTime = 0;
            clearInterval(timerInterval);
            handleKernelPanic(); // Tempo esgotado = Derrota para a tela de fracasso
        }

        // Formata o tempo para o padrão MM:SS
        const minutes = Math.floor(totalTime / 60).toString().padStart(2, '0');
        const seconds = (totalTime % 60).toString().padStart(2, '0');
        
        const timerEl = document.getElementById('global-timer');
        if (timerEl) {
            timerEl.innerText = `TEMPO RESTANTE: ${minutes}:${seconds}`;
        }
    }, 1000);
}

// Função executada em caso de derrota por tempo
function handleKernelPanic() {
    isGameOver = true;
    clearInterval(timerInterval); 
    document.exitPointerLock(); // Devolve o cursor do mouse para o usuário
    
    // Esconde o modal de perguntas caso ele esteja aberto na tela ao zerar o tempo
    const questionModal = document.getElementById('question-modal');
    if (questionModal) questionModal.style.display = 'none';
    
    // Oculta a interface de progresso/tempo do HUD do jogo para não poluir visualmente
    const uiContainer = document.getElementById('ui-container');
    if (uiContainer) uiContainer.style.display = 'none';
    if (interactionMsg) interactionMsg.style.display = 'none';

    // Ativa a tela de fracasso HTML customizada
    if (failureScreen) {
        failureScreen.style.display = 'flex';
    }
}

startButton.onclick = () => { 
    startScreen.style.display = "none"; 
    briefingModal.style.display = "flex"; 
};

closeBriefing.onclick = () => { 
    briefingModal.style.display = "none"; 
    document.body.requestPointerLock(); 
    
    // Inicializa o HUD limpando resíduos estáticos com textContent
    const progressEl = document.getElementById('progress');
    if (progressEl) {
        progressEl.textContent = `SISTEMA: VULNERÁVEL [${solvedCount} / 16]`;
    }
    
    startGlobalTimer(); // Inicia o relógio perfeitamente aqui
};

// --- LOGICA DO BOTÃO [X] PARA FECHAR O TERMINAL ---
const closeModalX = document.getElementById('close-modal-x');
if (closeModalX) {
    closeModalX.onclick = () => {
        closeModal();
    };
}

// --- CONFIGURAÇÃO 3D ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 18);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- ESTADO ---
let solvedCount = 0;
let currentMonitor = null;
const computers = [];
const questions = [
    { q: "Qual a principal função do conceito de 'Máquina de Níveis'?", opts: ["Aumentar a frequência de clock", "Ocultar a complexidade do hardware", "Permitir execução no hardware puro", "Eliminar o gerenciamento de memória"], ans: 1 },
    { q: "Qual a vantagem do DMA na comunicação com dispositivos?", opts: ["Executar polling do dispositivo", "Liberar a CPU de transferências de grandes volumes", "Reduzir latência da memória cache", "Fornecer segurança contra rootkits"], ans: 1 },
    { q: "O que caracteriza um Loader Absoluto?", opts: ["Carregar o programa em endereço fixo", "Mover o programa durante a execução", "Funcionar apenas em 64 bits", "Não necessitar de endereçamento"], ans: 0 },
    { q: "O que caracteriza o Pipelining como técnica de otimização?", opts: ["Uso de múltiplos núcleos físicos", "Divisão de instruções em etapas paralelas", "Substituição da memória física por virtual", "Gerenciamento externo de interrupções"], ans: 1 },
    { q: "Qual o papel fundamental do Shell?", opts: ["Gerenciar sinais elétricos da ULA", "Traduzir linguagem de máquina", "Intermediar usuário e sistema operacional", "Executar a rotina física de boot"], ans: 2 },
    { q: "O que define um sistema 'Fortemente Acoplado'?", opts: ["Memórias isoladas por processador", "Compartilhamento de uma única memória principal", "Comunicação exclusiva via rede", "Ausência de sistema operacional"], ans: 1 },
    { q: "Por que a 'Espera Ocupada' é ineficiente?", opts: ["O processador fica ocioso", "A CPU é mantida ocupada inutilmente em um loop", "Causa travamento no barramento físico", "Impede o uso de interrupções"], ans: 1 },
    { q: "Qual a função do Barramento de Endereços?", opts: ["Transportar dados entre CPU e Memória", "Sincronizar sinais de clock", "Especificar o local de acesso na memória", "Gerenciar periféricos de E/S"], ans: 2 },
    { q: "O que define o Kernel no Linux?", opts: ["A interface gráfica do usuário", "O núcleo que gerencia hardware e processos", "Um aplicativo de edição de texto", "O conjunto de drivers pós-inicialização"], ans: 1 },
    { q: "Qual a diferença entre Compilador e Interpretador?", opts: ["Compilador gera executável antes da execução", "Interpretador é mais rápido que código compilado", "Compilador roda direto no hardware", "Ambos funcionam de forma idêntica"], ans: 0 },
    { q: "O que define um sistema operacional de Tempo Real (Hard)?", opts: ["Foco na interface gráfica", "Priorização de tarefas com prazos rígidos", "Redes de baixa velocidade", "Execução de tarefa única"], ans: 1 },
    { q: "Qual a função do comando 'chmod' em um ambiente Linux?", opts: ["Listar arquivos de diretório", "Alterar permissões de acesso", "Deletar arquivos permanentemente", "Compilar código-fonte"], ans: 1 },
    { q: "O que caracteriza um sistema operacional ser 'open source' como o Linux?", opts: ["O código-fonte é aberto para modificação", "O sistema é bloqueado para alterações", "Roda apenas em hardware licenciado", "Instalação obrigatória via mídia física"], ans: 0 },
    { q: "Qual a função dos Utilitários?", opts: ["Suprir deficiências ou facilitar a manutenção", "Executar tarefas do Kernel", "Substituir dispositivos de E/S", "Controlar hardware diretamente"], ans: 0 },
    { q: "O que é Multiprogramação?", opts: ["Uso exclusivo de múltiplos núcleos", "Maximizar uso da CPU mantendo programas na memória", "Divisão rígida da memória", "Segurança contra invasões"], ans: 1 },
    { q: "O que é a Unidade Lógica e Aritmética (ULA)?", opts: ["Gerenciador de interrupções", "Unidade de salvamento de logs", "Subsistema que executa cálculos e lógica", "Gerente de memória virtual"], ans: 2 }
];

// --- LUZES ---
const ambient = new THREE.AmbientLight(0xffffff, 1.2); 
scene.add(ambient);
const doorLight = new THREE.PointLight(0xff0000, 15, 30); 
doorLight.position.set(0, 8, -23); 
scene.add(doorLight);

// --- ARQUITETURA DA SALA ---
const tileGeo = new THREE.PlaneGeometry(10, 10);
const tileMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.8, roughness: 0.2 });

for(let x = -30; x < 30; x += 10) {
    for(let z = -30; z < 30; z += 10) {
        const tile = new THREE.Mesh(tileGeo, tileMat);
        tile.position.set(x + 5, 0, z + 5);
        tile.rotation.x = -Math.PI / 2;
        const edges = new THREE.LineSegments(
            new THREE.EdgesGeometry(tileGeo),
            new THREE.LineBasicMaterial({ color: 0x000000 })
        );
        edges.position.copy(tile.position);
        edges.rotation.copy(tile.rotation);
        scene.add(tile);
        scene.add(edges);
    }
}

function createDetailedWall(x, z, w, d, rotationY = 0) {
    const wallGroup = new THREE.Group();
    const wallBody = new THREE.Mesh(
        new THREE.BoxGeometry(w, 12, d),
        new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
    );
    wallGroup.add(wallBody);

    for (let h = -4; h <= 4; h += 4) {
        const groove = new THREE.Mesh(
            new THREE.BoxGeometry(w + 0.1, 0.05, d + 0.2),
            new THREE.MeshStandardMaterial({ color: 0x000000 })
        );
        groove.position.y = h;
        wallGroup.add(groove);
    }

    const baseboard = new THREE.Mesh(
        new THREE.BoxGeometry(w + 0.2, 0.3, d + 0.3),
        new THREE.MeshBasicMaterial({ color: 0x00ff66 }) 
    );
    baseboard.position.y = -5.8;
    wallGroup.add(baseboard);

    wallGroup.position.set(x, 6, z);
    wallGroup.rotation.y = rotationY;
    scene.add(wallGroup);
}

createDetailedWall(0, -25, 60, 1);
createDetailedWall(0, 25, 60, 1);
createDetailedWall(-25, 0, 60, 1, Math.PI / 2);
createDetailedWall(25, 0, 60, 1, Math.PI / 2);

const beamMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9 });
for(let i = -30; i <= 30; i += 5) {
    const beamL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.4, 60), beamMat);
    beamL.position.set(i, 11.8, 0); scene.add(beamL);
    const beamT = new THREE.Mesh(new THREE.BoxGeometry(60, 0.4, 0.2), beamMat);
    beamT.position.set(0, 11.8, i); scene.add(beamT);
}

const ceilingTop = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshBasicMaterial({ color: 0x020202 }));
ceilingTop.rotation.x = Math.PI / 2; ceilingTop.position.y = 12.5; scene.add(ceilingTop);

// --- PORTA E MOLDURA REESTILIZADA ---
const doorGroup = new THREE.Group();
doorGroup.position.set(0, 4.5, -24.5); 
scene.add(doorGroup);

const frameMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, metalness: 0.9, roughness: 0.1 });
const fL = new THREE.Mesh(new THREE.BoxGeometry(0.8, 9.5, 1.2), frameMat);
fL.position.set(-3.4, 4.5, -24.5); scene.add(fL);
const fR = new THREE.Mesh(new THREE.BoxGeometry(0.8, 9.5, 1.2), frameMat);
fR.position.set(3.4, 4.5, -24.5); scene.add(fR);
const fT = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.8, 1.2), frameMat);
fT.position.set(0, 9.3, -24.5); scene.add(fT);

const hinge = new THREE.Group();
hinge.position.set(-3, 0, 0); doorGroup.add(hinge);

const doorMainMat = new THREE.MeshStandardMaterial({ 
    color: 0x1f1f1f, 
    metalness: 1.0, 
    roughness: 0.3 
});

const doorMain = new THREE.Mesh(new THREE.BoxGeometry(6, 9, 0.6), doorMainMat);
doorMain.position.set(3, 0, 0); hinge.add(doorMain);

for(let i = -3; i <= 3; i += 3) {
    const detail = new THREE.Mesh(
        new THREE.BoxGeometry(5, 1.5, 0.2),
        new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8 })
    );
    detail.position.set(3, i, 0.35);
    hinge.add(detail);
}

const scannerBox = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.8, 0.3), new THREE.MeshStandardMaterial({color: 0x222222}));
scannerBox.position.set(3.8, 5, -24.1);
scene.add(scannerBox);

const scannerLight = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 16, 16), 
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
);
scannerLight.position.set(3.8, 5.1, -23.9);
scene.add(scannerLight);

function handleVictory() {
    if (timerInterval) clearInterval(timerInterval); // Interrompe o cronômetro na vitória
    doorMain.visible = false; 
    hinge.visible = false; 
    scannerLight.material.color.set(0x00ff00); 
    
    const portalFinish = new THREE.Mesh(
        new THREE.PlaneGeometry(6, 9), 
        new THREE.MeshBasicMaterial({ 
            color: 0xffffff, 
            transparent: true, 
            opacity: 0.8 
        })
    );
    portalFinish.position.set(0, 0, 0.05); 
    doorGroup.add(portalFinish);
    
    ambient.intensity = 6; 
    doorLight.intensity = 0;

    // Oculta o container antigo do cronômetro para evitar que fique por baixo da mensagem
    const timerEl = document.getElementById('global-timer');
    if (timerEl) {
        timerEl.style.display = 'none';
    }

    const progressEl = document.getElementById('progress');
    if (progressEl) {
        progressEl.innerHTML = `
            <div style="color: #00ff66; font-size: 22px; text-shadow: 0 0 10px #00ff66; font-weight: bold;">
                SISTEMA: COMPROMETIDO [16 / 16] - CONCLUÍDO
            </div>
            <div style="color: #ff0000; font-size: 1.3em; margin-top: 30px; font-weight: bold; text-shadow: 2px 2px #000; animation: blink 1s infinite; line-height: 1.4;">
                ⚠️ ATENÇÃO: EVACUAR IMEDIATAMENTE!<br>SAIA PELA PORTA CENTRAL!
            </div>
        `;
    }
}

// --- ESTAÇÕES COM MOLDURA NO MONITOR ---
function createComputer(x, z, id) {
    const stationGroup = new THREE.Group();

    const desk = new THREE.Mesh(
        new THREE.BoxGeometry(4, 0.2, 2.5), 
        new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.5, roughness: 0.5 })
    );
    desk.position.y = 1.1;
    stationGroup.add(desk);

    const legMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8 });
    const legPositions = [{x:-1.8, z:-1.1}, {x:1.8, z:-1.1}, {x:-1.8, z:1.1}, {x:1.8, z:1.1}];
    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.1, 0.15), legMat);
        leg.position.set(pos.x, 0.55, pos.z);
        stationGroup.add(leg);
    });

    const monitorGroup = new THREE.Group();
    monitorGroup.position.set(-0.5, 0, -0.4);

    const monitorBase = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.05, 0.5), new THREE.MeshStandardMaterial({ color: 0x111111 }));
    monitorBase.position.y = 1.2;
    monitorGroup.add(monitorBase);

    const stand = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.8, 0.1), new THREE.MeshStandardMaterial({ color: 0x111111 }));
    stand.position.y = 1.6;
    monitorGroup.add(stand);

    const monitorFrame = new THREE.Mesh(
        new THREE.BoxGeometry(2.15, 1.45, 0.15), 
        new THREE.MeshStandardMaterial({ color: 0x000000 })
    );
    monitorFrame.position.y = 2.2;
    monitorGroup.add(monitorFrame);

    const monitorScreen = new THREE.Mesh(
        new THREE.BoxGeometry(2, 1.3, 0.1), 
        new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xff0000, emissiveIntensity: 0.5 })
    );
    monitorScreen.position.set(0, 2.2, 0.05); 
    monitorScreen.userData = { id, solved: false };
    monitorGroup.add(monitorScreen);
    computers.push(monitorScreen); 
    
    stationGroup.add(monitorGroup);

    const keyboard = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.05, 0.6), new THREE.MeshStandardMaterial({ color: 0x111111 }));
    keyboard.position.set(-0.5, 1.22, 0.5);
    stationGroup.add(keyboard);

    const towerGroup = new THREE.Group();
    towerGroup.position.set(1.3, 2.1, 0);

    const towerBody = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2, 1.8), new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.7, roughness: 0.3 }));
    towerGroup.add(towerBody);

    for(let i = 0; i < 5; i++) {
        const grill = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.05, 0.05), new THREE.MeshBasicMaterial({ color: 0x000000 }));
        grill.position.set(0, 0.5 - (i * 0.2), 0.91);
        towerGroup.add(grill);
    }

    const powerBtn = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
    powerBtn.position.set(0, 0.8, 0.91);
    towerGroup.add(powerBtn);

    const pcLed = new THREE.Mesh(new THREE.BoxGeometry(0.02, 1.2, 1), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
    pcLed.position.set(0.41, 0, 0);
    towerGroup.add(pcLed);

    stationGroup.add(towerGroup);
    stationGroup.position.set(x, 0, z);
    scene.add(stationGroup);
}

let pcIdx = 0;
for(let x = -15; x <= 15; x += 10) { for(let z = -12; z <= 18; z += 10) { createComputer(x, z, pcIdx++); } }

// --- CONTROLES E LÓGICA ---
const keys = {};

let verticalVelocity = 0;
const gravity = -0.01;
const jumpStrength = 0.25;
let isJumping = false;

window.onkeydown = (e) => {
    keys[e.key.toLowerCase()] = true;
    if(e.key === " ") keys[" "] = true; 
};
window.onkeyup = (e) => {
    keys[e.key.toLowerCase()] = false;
    if(e.key === " ") keys[" "] = false;
};

document.addEventListener('click', () => {
    const modalOpen = document.getElementById('question-modal').style.display === 'block';
    const isStart = (document.getElementById('start-screen') && document.getElementById('start-screen').style.display !== 'none');
    
    if (!modalOpen && !isStart && !isGameOver) {
        document.body.requestPointerLock();
    }
});

document.addEventListener('mousedown', () => {
    if (document.pointerLockElement === document.body) {
        const ray = new THREE.Raycaster(); ray.setFromCamera(new THREE.Vector2(0, 0), camera);
        const hits = ray.intersectObjects(computers);
        if (hits.length > 0 && hits[0].distance < 6 && !hits[0].object.userData.solved) {
            currentMonitor = hits[0].object; openModal(currentMonitor.userData.id);
        }
    }
});

function openModal(id) {
    const q = questions[id]; // Usa o ID fixo da máquina (0 a 15)
    const qTextEl = document.getElementById('q-text');
    qTextEl.innerText = q.q;
    qTextEl.style.color = '#ffffff';
    
    // Mapeia opções mantendo quem é a correta
    let options = q.opts.map((text, index) => ({ text, isCorrect: index === q.ans }));
    
    // Embaralha as opções (Fisher-Yates)
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }
    
    const container = document.getElementById('options-container'); 
    container.innerHTML = "";
    
    options.forEach((opt) => {
        const btn = document.createElement('button'); 
        btn.className = 'option-btn'; 
        btn.innerText = opt.text;
        btn.onclick = () => {
            if (opt.isCorrect) {
                currentMonitor.userData.solved = true; 
                currentMonitor.material.emissive.set(0x00ff66);
                
                const tower = currentMonitor.parent.parent.children.find(c => c instanceof THREE.Group && c !== currentMonitor.parent);
                tower.children.forEach(part => {
                    if(part.material && (part.geometry.type === "BoxGeometry" || part.geometry.type === "SphereGeometry") && part.material.color.getHex() === 0xff0000) {
                        part.material.color.set(0x00ff66);
                    }
                });

                solvedCount++; 
                document.getElementById('progress').textContent = `SISTEMA: VULNERÁVEL [${solvedCount} / 16]`;
                
                if (solvedCount === 16) handleVictory();
                closeModal();
            } else { 
                totalTime -= 30;
                if (totalTime < 0) totalTime = 0;
                
                qTextEl.innerText = "❌ ACESSO NEGADO! (-30s)";
                qTextEl.style.color = "#ff3333";
                
                setTimeout(() => {
                    if (document.getElementById('question-modal').style.display === 'block') {
                        qTextEl.innerText = q.q;
                        qTextEl.style.color = '#ffffff';
                    }
                }, 2000);
            }
        };
        container.appendChild(btn);
    });
    document.getElementById('question-modal').style.display = 'block'; 
    document.exitPointerLock();
}

function closeModal() { document.getElementById('question-modal').style.display = 'none'; document.body.requestPointerLock(); }

function animate() {
    requestAnimationFrame(animate);
    if (isGameOver || (briefingModal && briefingModal.style.display !== 'none') || (startScreen && startScreen.style.display !== 'none')) return;
    
    const speed = 0.15;
    const prevPos = camera.position.clone();
    const dir = new THREE.Vector3(); camera.getWorldDirection(dir); dir.y = 0; dir.normalize();
    const side = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0));
    
    if (keys['w']) camera.position.addScaledVector(dir, speed);
    if (keys['s']) camera.position.addScaledVector(dir, -speed);
    if (keys['a']) camera.position.addScaledVector(side, -speed);
    if (keys['d']) camera.position.addScaledVector(side, speed);

    if (keys[' '] && !isJumping) {
        verticalVelocity = jumpStrength;
        isJumping = true;
    }

    if (isJumping) {
        verticalVelocity += gravity;
        camera.position.y += verticalVelocity;
        if (camera.position.y <= 2) {
            camera.position.y = 2;
            verticalVelocity = 0;
            isJumping = false;
        }
    }
    
    const ray = new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2(0, 0), camera);
    const hits = ray.intersectObjects(computers);

    if (solvedCount === 16) {
        interactionMsg.style.display = 'none';
    } else {
        if (hits.length > 0 && hits[0].distance < 6 && !hits[0].object.userData.solved) {
            interactionMsg.style.display = 'block';
        } else {
            interactionMsg.style.display = 'none';
        }
    }

    // ADICIONADO: Se o modal de perguntas estiver aberto, checa se o jogador andou para longe da mesa ativa
    const questionModal = document.getElementById('question-modal');
    if (questionModal && questionModal.style.display === 'block' && currentMonitor) {
        // Pega a posição da bancada (parent do monitorGroup, que é parent da tela)
        const currentDeskPos = currentMonitor.parent.parent.position;
        if (camera.position.distanceTo(currentDeskPos) > 6.0) {
            closeModal(); // Fecha o terminal automaticamente por distância
        }
    }

    computers.forEach(pc => {
        if (camera.position.distanceTo(pc.parent.parent.position) < 3.2) {
            camera.position.x = prevPos.x;
            camera.position.z = prevPos.z;
        }
    });

    camera.position.x = Math.max(-23, Math.min(23, camera.position.x));
    camera.position.z = Math.max(-24.9, Math.min(23, camera.position.z));

    if (solvedCount === 16 && camera.position.z < -24.2) {
        isGameOver = true; 
        document.exitPointerLock(); 
        victoryScreen.style.display = 'flex';
    }
    
    if (solvedCount < 16) doorLight.intensity = 12 + Math.sin(Date.now() * 0.005) * 6;
    renderer.render(scene, camera);
}

document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === document.body) {
        camera.rotation.order = 'YXZ'; 
        camera.rotation.y -= e.movementX * 0.002;
        camera.rotation.x = Math.max(-1.4, Math.min(1.4, camera.rotation.x - e.movementY * 0.002));
    }
});

animate();