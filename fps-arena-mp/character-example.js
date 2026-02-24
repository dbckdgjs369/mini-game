// ============================================
// FPS Arena - 상세 캐릭터 생성 예시
// ============================================

function createDetailedCharacter(playerData) {
    const group = new THREE.Group();
    
    // 팀 색상 (레드팀 vs 블루팀)
    const teamColor = playerData.team === 'blue' ? 0x3366ff : 0xff3333;
    const secondaryColor = 0x333333; // 장비 색상
    
    // ========================================
    // 1. 몸통 (Torso) - 상의
    // ========================================
    const torsoGeo = new THREE.BoxGeometry(0.5, 0.6, 0.3);
    const torsoMat = new THREE.MeshLambertMaterial({ color: teamColor });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 1.3; // 허리 높이
    torso.castShadow = true;
    group.add(torso);
    
    // 조끼/방탄복
    const vestGeo = new THREE.BoxGeometry(0.52, 0.4, 0.32);
    const vestMat = new THREE.MeshLambertMaterial({ color: secondaryColor });
    const vest = new THREE.Mesh(vestGeo, vestMat);
    vest.position.y = 1.35;
    vest.position.z = 0.02;
    group.add(vest);
    
    // ========================================
    // 2. 머리 (Head)
    // ========================================
    const headGroup = new THREE.Group();
    headGroup.position.y = 1.75;
    
    // 얼굴
    const faceGeo = new THREE.BoxGeometry(0.25, 0.3, 0.28);
    const faceMat = new THREE.MeshLambertMaterial({ color: 0xffccaa }); // 피부색
    const face = new THREE.Mesh(faceGeo, faceMat);
    headGroup.add(face);
    
    // 헬멧
    const helmetGeo = new THREE.BoxGeometry(0.3, 0.15, 0.32);
    const helmetMat = new THREE.MeshLambertMaterial({ color: secondaryColor });
    const helmet = new THREE.Mesh(helmetGeo, helmetMat);
    helmet.position.y = 0.18;
    headGroup.add(helmet);
    
    // 고글/안경
    const goggleGeo = new THREE.BoxGeometry(0.22, 0.08, 0.05);
    const goggleMat = new THREE.MeshLambertMaterial({ 
        color: 0x111111,
        emissive: 0x222222,
        emissiveIntensity: 0.3
    });
    const goggles = new THREE.Mesh(goggleGeo, goggleMat);
    goggles.position.set(0, 0.02, 0.15);
    headGroup.add(goggles);
    
    group.add(headGroup);
    
    // ========================================
    // 3. 팔 (Arms) - 왼쪽/오른쪽 분리
    // ========================================
    
    // 왼쪽 팔
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.35, 1.5, 0);
    
    // 왼쪽 상완
    const leftUpperArmGeo = new THREE.BoxGeometry(0.15, 0.4, 0.15);
    const leftUpperArm = new THREE.Mesh(leftUpperArmGeo, torsoMat);
    leftUpperArm.position.y = -0.15;
    leftArmGroup.add(leftUpperArm);
    
    // 왼쪽 전완
    const leftForearmGeo = new THREE.BoxGeometry(0.12, 0.35, 0.12);
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xffccaa });
    const leftForearm = new THREE.Mesh(leftForearmGeo, skinMat);
    leftForearm.position.y = -0.5;
    leftArmGroup.add(leftForearm);
    
    // 왼손
    const leftHandGeo = new THREE.BoxGeometry(0.1, 0.12, 0.1);
    const gloveMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const leftHand = new THREE.Mesh(leftHandGeo, gloveMat);
    leftHand.position.y = -0.7;
    leftArmGroup.add(leftHand);
    
    group.add(leftArmGroup);
    
    // 오른쪽 팔
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.35, 1.5, 0);
    
    // 오른쪽 상완
    const rightUpperArm = new THREE.Mesh(leftUpperArmGeo, torsoMat);
    rightUpperArm.position.y = -0.15;
    rightArmGroup.add(rightUpperArm);
    
    // 오른쪽 전완
    const rightForearm = new THREE.Mesh(leftForearmGeo, skinMat);
    rightForearm.position.y = -0.5;
    rightArmGroup.add(rightForearm);
    
    // 오른손
    const rightHand = new THREE.Mesh(leftHandGeo, gloveMat);
    rightHand.position.y = -0.7;
    rightArmGroup.add(rightHand);
    
    group.add(rightArmGroup);
    
    // ========================================
    // 4. 다리 (Legs) - 왼쪽/오른쪽 분리
    // ========================================
    
    // 왼쪽 다리
    const leftLegGroup = new THREE.Group();
    leftLegGroup.position.set(-0.15, 0.95, 0);
    
    // 왼쪽 허벅지
    const thighGeo = new THREE.BoxGeometry(0.2, 0.45, 0.22);
    const pantsMat = new THREE.MeshLambertMaterial({ color: 0x224422 }); // 바지 색
    const leftThigh = new THREE.Mesh(thighGeo, pantsMat);
    leftThigh.position.y = -0.2;
    leftLegGroup.add(leftThigh);
    
    // 왼쪽 정강이
    const shinGeo = new THREE.BoxGeometry(0.16, 0.4, 0.18);
    const leftShin = new THREE.Mesh(shinGeo, pantsMat);
    leftShin.position.y = -0.6;
    leftLegGroup.add(leftShin);
    
    // 왼쪽 발
    const footGeo = new THREE.BoxGeometry(0.18, 0.1, 0.3);
    const bootMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    const leftFoot = new THREE.Mesh(footGeo, bootMat);
    leftFoot.position.y = -0.82;
    leftFoot.position.z = 0.05;
    leftLegGroup.add(leftFoot);
    
    group.add(leftLegGroup);
    
    // 오른쪽 다리
    const rightLegGroup = new THREE.Group();
    rightLegGroup.position.set(0.15, 0.95, 0);
    
    // 오른쪽 허벅지
    const rightThigh = new THREE.Mesh(thighGeo, pantsMat);
    rightThigh.position.y = -0.2;
    rightLegGroup.add(rightThigh);
    
    // 오른쪽 정강이
    const rightShin = new THREE.Mesh(shinGeo, pantsMat);
    rightShin.position.y = -0.6;
    rightLegGroup.add(rightShin);
    
    // 오른쪽 발
    const rightFoot = new THREE.Mesh(footGeo, bootMat);
    rightFoot.position.y = -0.82;
    rightFoot.position.z = 0.05;
    rightLegGroup.add(rightFoot);
    
    group.add(rightLegGroup);
    
    // ========================================
    // 5. 무기 (Weapon) - 더 자세한 총
    // ========================================
    const weaponGroup = new THREE.Group();
    weaponGroup.position.set(0.4, 1.2, 0.3); // 오른손에 위치
    
    // 총 몸체
    const gunBodyGeo = new THREE.BoxGeometry(0.08, 0.12, 0.5);
    const gunBodyMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const gunBody = new THREE.Mesh(gunBodyGeo, gunBodyMat);
    weaponGroup.add(gunBody);
    
    // 총열
    const barrelGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.3, 8);
    const barrelMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    const barrel = new THREE.Mesh(barrelGeo, barrelMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.z = 0.4;
    weaponGroup.add(barrel);
    
    // 손잡이
    const gripGeo = new THREE.BoxGeometry(0.06, 0.15, 0.1);
    const grip = new THREE.Mesh(gripGeo, gunBodyMat);
    grip.position.y = -0.12;
    grip.position.z = -0.05;
    grip.rotation.x = 0.3;
    weaponGroup.add(grip);
    
    // 탄창
    const magGeo = new THREE.BoxGeometry(0.05, 0.2, 0.08);
    const mag = new THREE.Mesh(magGeo, gunBodyMat);
    mag.position.y = -0.1;
    mag.position.z = 0.1;
    mag.rotation.x = 0.2;
    weaponGroup.add(mag);
    
    // 레이저 사이트
    const laserGeo = new THREE.BoxGeometry(0.02, 0.02, 0.1);
    const laserMat = new THREE.MeshLambertMaterial({ 
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 0.5
    });
    const laser = new THREE.Mesh(laserGeo, laserMat);
    laser.position.set(0.05, 0.02, 0.15);
    weaponGroup.add(laser);
    
    group.add(weaponGroup);
    
    // ========================================
    // 6. 추가 디테일
    // ========================================
    
    // 무전기
    const radioGeo = new THREE.BoxGeometry(0.08, 0.15, 0.05);
    const radioMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    const radio = new THREE.Mesh(radioGeo, radioMat);
    radio.position.set(-0.2, 1.35, 0.15);
    group.add(radio);
    
    // 안테나
    const antennaGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.2, 4);
    const antennaMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const antenna = new THREE.Mesh(antennaGeo, antennaMat);
    antenna.position.set(-0.2, 1.55, 0.15);
    group.add(antenna);
    
    // ========================================
    // 7. 이름표 & HP 바
    // ========================================
    
    // 이름표
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, 256, 64);
    ctx.fillStyle = playerData.team === 'blue' ? '#33ccff' : '#ff3333';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(playerData.name, 128, 42);
    
    const nameTexture = new THREE.CanvasTexture(canvas);
    const nameGeo = new THREE.PlaneGeometry(1.5, 0.375);
    const nameMat = new THREE.MeshBasicMaterial({ 
        map: nameTexture, 
        transparent: true 
    });
    const nameMesh = new THREE.Mesh(nameGeo, nameMat);
    nameMesh.position.y = 2.3;
    group.add(nameMesh);
    
    // HP 바
    const barGroup = new THREE.Group();
    barGroup.position.y = 2.1;
    
    const bgGeo = new THREE.PlaneGeometry(0.8, 0.1);
    const bgMat = new THREE.MeshBasicMaterial({ color: 0x333333 });
    const bg = new THREE.Mesh(bgGeo, bgMat);
    barGroup.add(bg);
    
    const fillGeo = new THREE.PlaneGeometry(0.76, 0.08);
    const fillMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const fill = new THREE.Mesh(fillGeo, fillMat);
    fill.position.x = -0.38;
    fill.geometry.translate(0.38, 0, 0.01);
    barGroup.add(fill);
    
    group.add(barGroup);
    
    // ========================================
    // 8. 위치 설정 & 저장
    // ========================================
    group.position.set(
        playerData.position.x, 
        0, 
        playerData.position.z
    );
    scene.add(group);
    
    // 애니메이션용 참조 저장
    const playerObj = {
        mesh: group,
        data: playerData,
        nameMesh: nameMesh,
        hpBar: fill,
        bodyParts: {
            head: headGroup,
            leftArm: leftArmGroup,
            rightArm: rightArmGroup,
            leftLeg: leftLegGroup,
            rightLeg: rightLegGroup,
            torso: torso,
            weapon: weaponGroup
        }
    };
    
    remotePlayers.set(playerData.id, playerObj);
    
    return playerObj;
}

// ============================================
// 걷기 애니메이션 예시
// ============================================

function updatePlayerAnimation(player, deltaTime) {
    if (!player.bodyParts) return;
    
    const time = Date.now() * 0.01;
    const speed = 0.5;
    const angle = Math.sin(time * speed) * 0.3;
    
    // 팔 흔들기
    player.bodyParts.leftArm.rotation.x = angle;
    player.bodyParts.rightArm.rotation.x = -angle;
    
    // 다리 흔들기
    player.bodyParts.leftLeg.rotation.x = -angle;
    player.bodyParts.rightLeg.rotation.x = angle;
    
    // 무기 반동 (쏠 때)
    if (player.recoil > 0) {
        player.bodyParts.weapon.position.z = 0.3 - player.recoil;
        player.bodyParts.weapon.rotation.x = -player.recoil * 2;
        player.recoil *= 0.9; // 반동 감소
    }
}

// ============================================
// 플레이어 색상 커스터마이징
// ============================================

const PLAYER_CLASSES = {
    assault: {
        color: 0x3366ff,
        vestColor: 0x222222,
        weapon: 'rifle'
    },
    heavy: {
        color: 0x664422,
        vestColor: 0x444444,
        weapon: 'machinegun'
    },
    sniper: {
        color: 0x226622,
        vestColor: 0x111111,
        weapon: 'sniper'
    },
    medic: {
        color: 0xffffff,
        vestColor: 0xff0000,
        weapon: 'smg'
    }
};
