// --- GESTÃO DE TELAS ---
const startScreen = document.getElementById('start-screen');
const briefingModal = document.getElementById('briefing-modal');
const victoryScreen = document.getElementById('victory-screen');
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

let isGameOver = false;

startButton.onclick = () => { startScreen.style.display = "none"; briefingModal.style.display = "flex"; };
closeBriefing.onclick = () => { briefingModal.style.display = "none"; document.body.requestPointerLock(); };

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
    { q: "O que caracteriza um Deadlock?", opts: ["Excesso de RAM", "Bloqueio mútuo de processos", "Vírus de rede"], ans: 1 },
    { q: "Qual a função do Kernel?", opts: ["Interface gráfica", "Gerenciar hardware", "Editar textos"], ans: 1 },
    { q: "Sistemas Distribuídos são?", opts: ["PCs isolados", "Vários nós interconectados", "Um único servidor"], ans: 1 },
    { q: "O comando 'chmod' serve para?", opts: ["Listar arquivos", "Alterar permissões", "Deletar pastas"], ans: 1 }
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

// Moldura mais robusta
const frameMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, metalness: 0.9, roughness: 0.1 });
const fL = new THREE.Mesh(new THREE.BoxGeometry(0.8, 9.5, 1.2), frameMat);
fL.position.set(-3.4, 4.5, -24.5); scene.add(fL);
const fR = new THREE.Mesh(new THREE.BoxGeometry(0.8, 9.5, 1.2), frameMat);
fR.position.set(3.4, 4.5, -24.5); scene.add(fR);
const fT = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.8, 1.2), frameMat);
fT.position.set(0, 9.3, -24.5); scene.add(fT);

const hinge = new THREE.Group();
hinge.position.set(-3, 0, 0); doorGroup.add(hinge);

// Material da porta com aparência metálica
const doorMainMat = new THREE.MeshStandardMaterial({ 
    color: 0x1f1f1f, 
    metalness: 1.0, 
    roughness: 0.3 
});

const doorMain = new THREE.Mesh(new THREE.BoxGeometry(6, 9, 0.6), doorMainMat);
doorMain.position.set(3, 0, 0); hinge.add(doorMain);

// Detalhes da Porta (Painéis de Reforço)
for(let i = -3; i <= 3; i += 3) {
    const detail = new THREE.Mesh(
        new THREE.BoxGeometry(5, 1.5, 0.2),
        new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8 })
    );
    detail.position.set(3, i, 0.35);
    hinge.add(detail);
}

// Scanner de Acesso lateral
const scannerBox = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.8, 0.3), new THREE.MeshStandardMaterial({color: 0x222222}));
scannerBox.position.set(3.8, 5, -24.1);
scene.add(scannerBox);

const scannerLight = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 16, 16), 
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
);
scannerLight.position.set(3.8, 5.1, -23.9);
scene.add(scannerLight);

// Atualização da Luz do Scanner na lógica de vitória
function handleVictory() {
    doorMain.visible = false; 
    hinge.visible = false; 
    scannerLight.material.color.set(0x00ff00); // Muda o scanner para verde
    
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
    document.getElementById('progress').innerText = "SISTEMA: COMPROMETIDO [16 / 16]";
}

// --- ESTAÇÕES COM MOLDURA NO MONITOR ---
function createComputer(x, z, id) {
    const stationGroup = new THREE.Group();

    // 1. MESA E PÉS
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

    // 2. MONITOR (COM MOLDURA)
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

    // 3. TECLADO
    const keyboard = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.05, 0.6), new THREE.MeshStandardMaterial({ color: 0x111111 }));
    keyboard.position.set(-0.5, 1.22, 0.5);
    stationGroup.add(keyboard);

    // 4. GABINETE DETALHADO
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

// Variáveis de física para o pulo
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

// Reativa o controle do mouse ao clicar na tela (resolve o problema do ESC)
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
    const q = questions[id % questions.length];
    document.getElementById('q-text').innerText = q.q;
    const container = document.getElementById('options-container'); container.innerHTML = "";
    q.opts.forEach((opt, i) => {
        const btn = document.createElement('button'); btn.className = 'option-btn'; btn.innerText = opt;
        btn.onclick = () => {
            if (i === q.ans) {
                currentMonitor.userData.solved = true; 
                currentMonitor.material.emissive.set(0x00ff66);
                
                const tower = currentMonitor.parent.parent.children.find(c => c instanceof THREE.Group && c !== currentMonitor.parent);
                tower.children.forEach(part => {
                    if(part.material && (part.geometry.type === "BoxGeometry" || part.geometry.type === "SphereGeometry") && part.material.color.getHex() === 0xff0000) {
                        part.material.color.set(0x00ff66);
                    }
                });

                solvedCount++; 
                document.getElementById('progress').innerText = `SISTEMA: VULNERÁVEL [${solvedCount} / 16]`;
                if (solvedCount === 16) handleVictory();
                closeModal();
            } else { alert("ACESSO NEGADO!"); }
        };
        container.appendChild(btn);
    });
    document.getElementById('question-modal').style.display = 'block'; document.exitPointerLock();
}

function handleVictory() {
    doorMain.visible = false; 
    hinge.visible = false; 
    
    const portalFinish = new THREE.Mesh(
        new THREE.PlaneGeometry(6, 9), 
        new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    portalFinish.position.set(0, 0, 0.05); 
    doorGroup.add(portalFinish);
    
    ambient.intensity = 6; 
    doorLight.intensity = 0;

    // Atualiza o status para CONCLUÍDO e adiciona mensagem de evacuação
    const progressEl = document.getElementById('progress');
    progressEl.innerHTML = `
        <div style="color: #00ff66;">SISTEMA: COMPROMETIDO [16 / 16] - CONCLUÍDO</div>
        <div style="color: #ff0000; font-size: 1.2em; margin-top: 10px; font-weight: bold; text-shadow: 2px 2px #000; animation: blink 1s infinite;">
            ⚠️ ATENÇÃO: EVACUAR IMEDIATAMENTE! SAIA PELA PORTA CENTRAL!
        </div>
    `;
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

    // Esconde mensagens de interação após vencer
    if (solvedCount === 16) {
        interactionMsg.style.display = 'none';
    } else {
        if (hits.length > 0 && hits[0].distance < 6 && !hits[0].object.userData.solved) {
            interactionMsg.style.display = 'block';
        } else {
            interactionMsg.style.display = 'none';
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
        isGameOver = true; document.exitPointerLock(); victoryScreen.style.display = 'flex';
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