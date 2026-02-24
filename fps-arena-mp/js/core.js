// ============================================
// FPS Arena - Core Module
// Three.js 초기화, 게임 설정, 기본 유틸리티
// ============================================

// 게임 설정
const CONFIG = {
    playerSpeed: 0.15,
    runSpeed: 0.25,
    mouseSensitivity: 0.002,
    gravity: 0.02,
    jumpForce: 0.4,
    maxHealth: 100,
    fireRate: 100, // ms
    damage: 20,
    magazineSize: 30,
    reloadTime: 2000,
    botAccuracy: 0.7,
    botReactionTime: 500 // ms
};

// 글로벌 변수
let scene, camera, renderer;
let bullets = [];
let particles = [];
let mapObjects = [];
let gameState = {
    isPlaying: false,
    kills: 0,
    deaths: 0,
    score: 0,
    canShoot: true,
    isReloading: false,
    ammo: CONFIG.magazineSize,
    health: CONFIG.maxHealth,
    isDead: false
};

// Three.js 초기화
function initCore(containerId) {
    // WebGL 지원 확인
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) {
        console.error("WebGL not supported");
        alert("브라우저가 WebGL을 지원하지 않습니다.");
        return;
    }
    console.log("initCore called with container:", containerId);    // 씬 생성
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 10, 100);
    
    // 치처
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    // 렌더러
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    const container = document.getElementById(containerId);
    if (!container) { console.error("Container not found:", containerId); return; }
    container.appendChild(renderer.domElement);
    console.log("Renderer appended");
    
    // 조명
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(50, 100, 50);
    dirLight.castShadow = true;
    dirLight.shadow.camera.left = -50;
    dirLight.shadow.camera.right = 50;
    dirLight.shadow.camera.top = 50;
    dirLight.shadow.camera.bottom = -50;
    scene.add(dirLight);
    
    // 창 크기 변경
    window.addEventListener('resize', onWindowResize);
    
    return { scene, camera, renderer };
}

function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// 바닥 생성
function createFloor() {
    const floorGeo = new THREE.BoxGeometry(100, 1, 100);
    const floorMat = new THREE.MeshLambertMaterial({ color: 0x555555 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -0.5;
    floor.receiveShadow = true;
    floor.userData = { isFloor: true };
    scene.add(floor);
    
    const gridHelper = new THREE.GridHelper(100, 50, 0x888888, 0x666666);
    scene.add(gridHelper);
    
    mapObjects.push(floor);
}

// 파티클 업데이트
function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.mesh.position.add(p.velocity);
        if (p.velocity.y !== undefined) {
            p.velocity.y -= 0.01; // 중력
        }
        p.life--;
        
        if (p.life <= 0) {
            scene.remove(p.mesh);
            particles.splice(i, 1);
        }
    }
}

// 총알 업데이트 (벽 충돌 제외 - walls.js에서 처리)
function updateBulletsBase() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        
        // 이동
        const moveVec = b.direction.clone().multiplyScalar(b.speed);
        b.mesh.position.add(moveVec);
        b.life--;
        
        // 제거 조건 (벽 충돌은 외부에서 처리)
        if (b.life <= 0 || b.mesh.position.y < 0) {
            scene.remove(b.mesh);
            bullets.splice(i, 1);
            return { removed: true, hit: false, bullet: b };
        }
        
        return { removed: false };
    }
    return { removed: false };
}

// 총알 생성
function createBullet(position, direction, owner, life = 100) {
    const geo = new THREE.SphereGeometry(0.05, 8, 8);
    const mat = new THREE.MeshBasicMaterial({ 
        color: owner.isBot ? 0xff0000 : 0xffff00,
        emissive: owner.isBot ? 0xff0000 : 0xffff00,
        emissiveIntensity: 1
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(position);
    scene.add(mesh);
    
    bullets.push({
        mesh: mesh,
        direction: direction,
        speed: 2,
        owner: owner,
        life: life
    });
}

// 충돌 이펙트
function createImpactEffect(position, color = 0xffff00) {
    for (let i = 0; i < 5; i++) {
        const geo = new THREE.BoxGeometry(0.05, 0.05, 0.05);
        const mat = new THREE.MeshBasicMaterial({ color: color });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(position);
        
        const velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.2,
            (Math.random() - 0.5) * 0.2,
            (Math.random() - 0.5) * 0.2
        );
        
        scene.add(mesh);
        particles.push({ mesh, velocity, life: 20 });
    }
}

// 범용 벽 생성 (외벽용)
function createStaticWall(x, y, z, w, h, d) {
    const wallMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, wallMat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    mapObjects.push(mesh);
    return mesh;
}

// UI 업데이트
function updateUI(player) {
    document.getElementById('kills').textContent = gameState.kills;
    document.getElementById('deaths').textContent = gameState.deaths;
    document.getElementById('score').textContent = gameState.score;
    
    if (player) {
        document.getElementById('ammo').textContent = player.ammo;
        const hpPercent = (player.health / player.maxHealth) * 100;
        document.getElementById('hpFill').style.width = hpPercent + '%';
        document.getElementById('hpText').textContent = `${player.health}/${player.maxHealth}`;
    }
}

// 킬 피드
function addKillFeed(killer, victim) {
    const feed = document.getElementById('killFeed');
    if (!feed) return;
    
    const msg = document.createElement('div');
    msg.className = 'kill-message';
    msg.textContent = `${killer} → ${victim}`;
    feed.appendChild(msg);
    
    setTimeout(() => msg.remove(), 3000);
}

// 마uzzle 플래시
function showMuzzleFlash() {
    const flash = document.getElementById('muzzleFlash');
    if (!flash) return;
    flash.classList.add('active');
    setTimeout(() => flash.classList.remove('active'), 50);
}

// 리스폰 카운트다운
function startRespawnCountdown(callback) {
    const respawnScreen = document.getElementById('respawnScreen');
    const respawnCount = document.getElementById('respawnCount');
    const crosshair = document.getElementById('crosshair');
    let count = 3;
    
    if (respawnScreen) respawnScreen.classList.add('show');
    if (respawnCount) respawnCount.textContent = count;
    if (crosshair) crosshair.style.display = 'none';
    
    const countdown = setInterval(() => {
        count--;
        if (respawnCount) respawnCount.textContent = count;
        
        if (count <= 0) {
            clearInterval(countdown);
            if (respawnScreen) respawnScreen.classList.remove('show');
            if (crosshair) crosshair.style.display = 'block';
            callback();
        }
    }, 1000);
}

// 히트마커
function showHitmarker() {
    const hitmarker = document.getElementById('hitmarker');
    if (!hitmarker) return;
    
    hitmarker.classList.add('show');
    playHitSound();
    setTimeout(() => hitmarker.classList.remove('show'), 150);
}

// 히트 사운드
function playHitSound() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.3;
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.05);
    } catch (e) {}
}

// 모듈 내보내기
window.FPSCore = {
    CONFIG,
    initCore,
    createFloor,
    updateParticles,
    updateBulletsBase,
    createBullet,
    createImpactEffect,
    createStaticWall,
    updateUI,
    addKillFeed,
    showMuzzleFlash,
    startRespawnCountdown,
    showHitmarker,
    playHitSound,
    scene: () => scene,
    camera: () => camera,
    renderer: () => renderer,
    bullets: () => bullets,
    particles: () => particles,
    mapObjects: () => mapObjects,
    setMapObjects: (arr) => { mapObjects = arr; },
    gameState: () => gameState,
    setGameState: (key, value) => { gameState[key] = value; }
};
