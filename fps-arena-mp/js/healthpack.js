// ============================================
// FPS Arena - Health Pack Module
// 중앙 힐팩 시스템
// ============================================

// 힐팩 변수
let healthPack = {
    active: false,
    mesh: null,
    position: new THREE.Vector3(0, 0.5, 0),
    respawnTime: 10000 // 10초
};

// 힐팩 생성
function spawnHealthPack(position = null) {
    const scene = window.FPSCore.scene();
    
    if (position) {
        healthPack.position.copy(position);
    }
    
    const geo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
    const mat = new THREE.MeshLambertMaterial({ 
        color: 0xff4444,
        emissive: 0xff0000,
        emissiveIntensity: 0.3
    });
    
    healthPack.mesh = new THREE.Mesh(geo, mat);
    healthPack.mesh.position.copy(healthPack.position);
    healthPack.mesh.position.y = 0.3;
    scene.add(healthPack.mesh);
    
    healthPack.active = true;
}

// 힐팩 체크
function checkHealthPackPickup(onHeal) {
    if (!healthPack.active || !healthPack.mesh) return false;
    
    const camera = window.FPSCore.camera();
    const gameState = window.FPSCore.gameState();
    const CONFIG = window.FPSCore.CONFIG;
    
    const playerPos = camera.position.clone();
    playerPos.y = 0.5; // 플레이어 발 높이
    
    const distance = playerPos.distanceTo(healthPack.mesh.position);
    
    // 1.5미터 이내이면 획득
    if (distance < 1.5 && gameState.health < CONFIG.maxHealth) {
        // 체류력 회복 (+50)
        const healAmount = 50;
        const newHealth = Math.min(gameState.health + healAmount, CONFIG.maxHealth);
        window.FPSCore.setGameState('health', newHealth);
        
        // 콜백 실행
        if (onHeal) onHeal(healAmount);
        
        // 획득 효과
        showHealthPackEffect();
        
        // 힐팩 비활성화
        const scene = window.FPSCore.scene();
        scene.remove(healthPack.mesh);
        healthPack.mesh = null;
        healthPack.active = false;
        
        // 10초 후 재스폰
        setTimeout(() => {
            const currentGameState = window.FPSCore.gameState();
            if (currentGameState.isPlaying) {
                spawnHealthPack();
            }
        }, healthPack.respawnTime);
        
        return true;
    }
    
    return false;
}

// 힐팩 획득 효과
function showHealthPackEffect() {
    // 초록색 플래시
    const flash = document.createElement('div');
    flash.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 255, 0, 0.3);
        pointer-events: none;
        z-index: 260;
        transition: opacity 0.5s;
    `;
    document.body.appendChild(flash);
    
    // 힐 사운드
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.frequency.value = 600;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.2;
        
        oscillator.start();
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.3);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        oscillator.stop(audioCtx.currentTime + 0.3);
    } catch (e) {}
    
    // 회복 텍스트 표시
    const healText = document.createElement('div');
    healText.textContent = '+50 HP';
    healText.style.cssText = `
        position: fixed;
        top: 60%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 36px;
        font-weight: bold;
        color: #0f0;
        text-shadow: 0 0 20px #0f0;
        z-index: 261;
        pointer-events: none;
    `;
    document.body.appendChild(healText);
    
    setTimeout(() => {
        flash.style.opacity = '0';
        setTimeout(() => flash.remove(), 500);
        healText.remove();
    }, 800);
}

// 힐팩 애니메이션
function updateHealthPackAnimation() {
    if (healthPack.active && healthPack.mesh) {
        const time = Date.now() * 0.002;
        healthPack.mesh.rotation.y = time;
        healthPack.mesh.position.y = 0.3 + Math.sin(time * 2) * 0.1;
    }
}

// 초기화
function initHealthPack() {
    healthPack.active = false;
    healthPack.mesh = null;
}

// 모듈 낵내기
window.FPSHealthPack = {
    spawnHealthPack,
    checkHealthPackPickup,
    updateHealthPackAnimation,
    initHealthPack,
    healthPack: () => healthPack
};
