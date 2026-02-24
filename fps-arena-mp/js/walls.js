// ============================================
// FPS Arena - Walls Module
// 파괴 가능한 벽, 하늘에서 떨어지는 벽
// ============================================

// 벽 시스템 변수
let destructibleWalls = [];
let fallingWalls = [];

// 파괴 가능한 벽 생성
function createDestructibleWall(x, y, z, w, h, d) {
    const wallMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, wallMat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    // 메타데이터
    mesh.userData = {
        isDestructible: true,
        hp: 100,
        maxHp: 100,
        width: w,
        height: h,
        depth: d
    };
    
    // 씬에 추가
    window.FPSCore.scene().add(mesh);
    
    // mapObjects에 직접 추가 (참조 문제 방지)
    window.FPSCore.mapObjects().push(mesh);
    destructibleWalls.push(mesh);
    
    return mesh;
}

// 벽에 데미지
function damageWall(wall, damage) {
    if (!wall.userData.isDestructible) return false;
    
    wall.userData.hp -= damage;
    
    // 벽 색상 변화 (데미지에 따라 붉게)
    const damageRatio = 1 - (wall.userData.hp / wall.userData.maxHp);
    const r = 0.5 + damageRatio * 0.5;
    const g = 0.5 - damageRatio * 0.5;
    const b = 0.5 - damageRatio * 0.5;
    wall.material.color.setRGB(r, g, b);
    
    // 히트 이펙트
    createWallHitEffect(wall.position);
    
    // HP 0 이하면 파괴
    if (wall.userData.hp <= 0) {
        destroyWall(wall);
        return true; // 파괴 완료
    }
    
    return false;
}

// 벽 파괴
function destroyWall(wall) {
    // 파편 효과
    for (let i = 0; i < 10; i++) {
        const size = 0.1 + Math.random() * 0.2;
        const geo = new THREE.BoxGeometry(size, size, size);
        const mat = new THREE.MeshLambertMaterial({ color: wall.material.color.clone() });
        const mesh = new THREE.Mesh(geo, mat);
        
        mesh.position.copy(wall.position);
        mesh.position.x += (Math.random() - 0.5) * wall.userData.width;
        mesh.position.y += (Math.random() - 0.5) * wall.userData.height;
        mesh.position.z += (Math.random() - 0.5) * wall.userData.depth;
        
        const velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.5,
            Math.random() * 0.5,
            (Math.random() - 0.5) * 0.5
        );
        
        window.FPSCore.scene().add(mesh);
        window.FPSCore.particles().push({ mesh, velocity, life: 60 });
    }
    
    // 씬에서 제거
    window.FPSCore.scene().remove(wall);
    
    // 배열에서 제거
    const mapObjects = window.FPSCore.mapObjects();
    const mapIndex = mapObjects.indexOf(wall);
    if (mapIndex > -1) mapObjects.splice(mapIndex, 1);
    
    const wallIndex = destructibleWalls.indexOf(wall);
    if (wallIndex > -1) destructibleWalls.splice(wallIndex, 1);
    
    // 10초 후 재생성
    setTimeout(() => {
        const gameState = window.FPSCore.gameState();
        if (gameState.isPlaying) {
            createDestructibleWall(
                wall.position.x,
                wall.position.y,
                wall.position.z,
                wall.userData.width,
                wall.userData.height,
                wall.userData.depth
            );
        }
    }, 10000);
}

// 벽 맞을 때 이펙트
function createWallHitEffect(position) {
    // 먼지 파티클
    for (let i = 0; i < 5; i++) {
        const geo = new THREE.BoxGeometry(0.05, 0.05, 0.05);
        const mat = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
        const mesh = new THREE.Mesh(geo, mat);
        
        mesh.position.copy(position);
        mesh.position.x += (Math.random() - 0.5) * 0.5;
        mesh.position.y += (Math.random() - 0.5) * 0.5;
        mesh.position.z += (Math.random() - 0.5) * 0.5;
        
        const velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.1,
            Math.random() * 0.1,
            (Math.random() - 0.5) * 0.1
        );
        
        window.FPSCore.scene().add(mesh);
        window.FPSCore.particles().push({ mesh, velocity, life: 30 });
    }
}

// 하늘에서 벽 떨어짐
function spawnFallingWall() {
    const gameState = window.FPSCore.gameState();
    if (!gameState.isPlaying) return;
    
    const scene = window.FPSCore.scene();
    
    // 랜덤 위치 (-20 ~ 20)
    const x = (Math.random() - 0.5) * 40;
    const z = (Math.random() - 0.5) * 40;
    const size = 2 + Math.random() * 2;
    
    // 바닥에 경고 표시 (그림자)
    const shadowGeo = new THREE.PlaneGeometry(size, size);
    const shadowMat = new THREE.MeshBasicMaterial({ 
        color: 0xff0000,
        transparent: true,
        opacity: 0.3
    });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(x, 0.05, z);
    scene.add(shadow);
    
    // 경고 표시 (빨간 원)
    const ringGeo = new THREE.RingGeometry(size/2, size/2 + 0.2, 32);
    const ringMat = new THREE.MeshBasicMaterial({ 
        color: 0xff0000,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(x, 0.06, z);
    scene.add(ring);
    
    // 3초 후 벽 떨어짐
    let countdown = 3;
    const warningInterval = setInterval(() => {
        countdown--;
        ring.material.opacity = countdown > 0 ? 0.8 : 0.4;
        
        if (countdown <= 0) {
            clearInterval(warningInterval);
            
            // 벽 생성 (하늘에서)
            const wallGeo = new THREE.BoxGeometry(size, size, size);
            const wallMat = new THREE.MeshLambertMaterial({ color: 0x666666 });
            const wall = new THREE.Mesh(wallGeo, wallMat);
            wall.position.set(x, 20, z);
            wall.castShadow = true;
            wall.receiveShadow = true;
            wall.userData = {
                isFalling: true,
                damage: 80,
                size: size
            };
            scene.add(wall);
            fallingWalls.push(wall);
            
            // 그림자 제거
            scene.remove(shadow);
            scene.remove(ring);
        }
    }, 1000);
}

// 떨어지는 벽 업데이트
function updateFallingWalls(onPlayerHit) {
    const camera = window.FPSCore.camera();
    
    for (let i = fallingWalls.length - 1; i >= 0; i--) {
        const wall = fallingWalls[i];
        
        // 중력 적용
        wall.position.y -= 0.3;
        
        // 플레이어와 충돌 체크
        if (onPlayerHit && wall.userData.isFalling) {
            const playerPos = camera.position.clone();
            const dx = Math.abs(playerPos.x - wall.position.x);
            const dz = Math.abs(playerPos.z - wall.position.z);
            const halfSize = wall.userData.size / 2;
            
            // 벽 아래에 플레이어가 있고, 충분히 가까우면
            if (dx < halfSize && dz < halfSize && wall.position.y > 0 && wall.position.y < 3) {
                onPlayerHit(wall.userData.damage);
                wall.userData.isFalling = false;
            }
        }
        
        // 바닥에 닿으면
        if (wall.position.y <= wall.userData.size / 2) {
            wall.position.y = wall.userData.size / 2;
            wall.userData.isFalling = false;
            
            // 충돌 효과
            createImpactEffect(wall.position);
            
            // 파괴 가능한 벽으로 전환
            wall.userData.isDestructible = true;
            wall.userData.hp = 100;
            wall.userData.maxHp = 100;
            wall.userData.width = wall.userData.size;
            wall.userData.height = wall.userData.size;
            wall.userData.depth = wall.userData.size;
            destructibleWalls.push(wall);
            window.FPSCore.mapObjects().push(wall);
            
            fallingWalls.splice(i, 1);
        }
    }
}

// 충돌 효과
function createImpactEffect(position) {
    // 충격파
    for (let i = 0; i < 15; i++) {
        const geo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const mat = new THREE.MeshBasicMaterial({ color: 0x888888 });
        const mesh = new THREE.Mesh(geo, mat);
        
        mesh.position.copy(position);
        mesh.position.y = 0.2;
        
        const velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.8,
            Math.random() * 0.5,
            (Math.random() - 0.5) * 0.8
        );
        
        window.FPSCore.scene().add(mesh);
        window.FPSCore.particles().push({ mesh, velocity, life: 40 });
    }
    
    // 화면 흔들림 효과
    const camera = window.FPSCore.camera();
    const originalY = camera.position.y;
    let shakeCount = 0;
    const shake = setInterval(() => {
        camera.position.y = originalY + (Math.random() - 0.5) * 0.1;
        shakeCount++;
        if (shakeCount > 10) {
            clearInterval(shake);
            camera.position.y = originalY;
        }
    }, 20);
}

// 총알과 벽 충돌 체크
function checkBulletWallCollision(bulletPosition) {
    for (const wall of destructibleWalls) {
        const box = new THREE.Box3().setFromObject(wall);
        if (box.containsPoint(bulletPosition)) {
            return { hit: true, wall: wall };
        }
    }
    
    // 정적 벽과도 체크
    const mapObjects = window.FPSCore.mapObjects();
    for (const obj of mapObjects) {
        if (!obj.userData.isDestructible) {
            const box = new THREE.Box3().setFromObject(obj);
            if (box.containsPoint(bulletPosition)) {
                return { hit: true, wall: null };
            }
        }
    }
    
    return { hit: false };
}

// 초기화
function initWalls() {
    destructibleWalls = [];
    fallingWalls = [];
}

// 모듈 내보내기
window.FPSWalls = {
    createDestructibleWall,
    damageWall,
    destroyWall,
    spawnFallingWall,
    updateFallingWalls,
    checkBulletWallCollision,
    initWalls,
    destructibleWalls: () => destructibleWalls,
    fallingWalls: () => fallingWalls
};
