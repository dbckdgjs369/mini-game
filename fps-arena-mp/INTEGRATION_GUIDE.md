# FPS Arena - 캐릭터 개선 가이드

## 빠른 적용 방법

### 1. 기존 `createRemotePlayer` 함수 대체

`multiplayer.html`의 798-887번 라인을 찾아서:

```javascript
// 기존 코드 (줄 798-887) 삭제하고 아래로 교체

function createRemotePlayer(playerData) {
    const group = new THREE.Group();
    
    // 팀 색상
    const teamColor = playerData.team === 'blue' ? 0x3366ff : 0xff3333;
    
    // 몸통
    const torsoGeo = new THREE.BoxGeometry(0.5, 0.6, 0.3);
    const torsoMat = new THREE.MeshLambertMaterial({ color: teamColor });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 1.3;
    torso.castShadow = true;
    group.add(torso);
    
    // 방탄복
    const vestGeo = new THREE.BoxGeometry(0.52, 0.4, 0.32);
    const vestMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const vest = new THREE.Mesh(vestGeo, vestMat);
    vest.position.y = 1.35;
    vest.position.z = 0.02;
    group.add(vest);
    
    // 머리 그룹
    const headGroup = new THREE.Group();
    headGroup.position.y = 1.75;
    
    // 얼굴
    const faceGeo = new THREE.BoxGeometry(0.25, 0.3, 0.28);
    const faceMat = new THREE.MeshLambertMaterial({ color: 0xffccaa });
    const face = new THREE.Mesh(faceGeo, faceMat);
    headGroup.add(face);
    
    // 헬멧
    const helmetGeo = new THREE.BoxGeometry(0.3, 0.15, 0.32);
    const helmetMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const helmet = new THREE.Mesh(helmetGeo, helmetMat);
    helmet.position.y = 0.18;
    headGroup.add(helmet);
    
    // 고글
    const goggleGeo = new THREE.BoxGeometry(0.22, 0.08, 0.05);
    const goggleMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    const goggles = new THREE.Mesh(goggleGeo, goggleMat);
    goggles.position.set(0, 0.02, 0.15);
    headGroup.add(goggles);
    
    group.add(headGroup);
    
    // 왼쪽 팔
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.35, 1.5, 0);
    
    const armGeo = new THREE.BoxGeometry(0.15, 0.4, 0.15);
    const leftUpperArm = new THREE.Mesh(armGeo, torsoMat);
    leftUpperArm.position.y = -0.15;
    leftArmGroup.add(leftUpperArm);
    
    const forearmGeo = new THREE.BoxGeometry(0.12, 0.35, 0.12);
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xffccaa });
    const leftForearm = new THREE.Mesh(forearmGeo, skinMat);
    leftForearm.position.y = -0.5;
    leftArmGroup.add(leftForearm);
    
    const gloveGeo = new THREE.BoxGeometry(0.1, 0.12, 0.1);
    const gloveMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const leftGlove = new THREE.Mesh(gloveGeo, gloveMat);
    leftGlove.position.y = -0.7;
    leftArmGroup.add(leftGlove);
    
    group.add(leftArmGroup);
    
    // 오른쪽 팔
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.35, 1.5, 0);
    
    const rightUpperArm = new THREE.Mesh(armGeo, torsoMat);
    rightUpperArm.position.y = -0.15;
    rightArmGroup.add(rightUpperArm);
    
    const rightForearm = new THREE.Mesh(forearmGeo, skinMat);
    rightForearm.position.y = -0.5;
    rightArmGroup.add(rightForearm);
    
    const rightGlove = new THREE.Mesh(gloveGeo, gloveMat);
    rightGlove.position.y = -0.7;
    rightArmGroup.add(rightGlove);
    
    group.add(rightArmGroup);
    
    // 왼쪽 다리
    const leftLegGroup = new THREE.Group();
    leftLegGroup.position.set(-0.15, 0.95, 0);
    
    const thighGeo = new THREE.BoxGeometry(0.2, 0.45, 0.22);
    const pantsMat = new THREE.MeshLambertMaterial({ color: 0x224422 });
    const leftThigh = new THREE.Mesh(thighGeo, pantsMat);
    leftThigh.position.y = -0.2;
    leftLegGroup.add(leftThigh);
    
    const shinGeo = new THREE.BoxGeometry(0.16, 0.4, 0.18);
    const leftShin = new THREE.Mesh(shinGeo, pantsMat);
    leftShin.position.y = -0.6;
    leftLegGroup.add(leftShin);
    
    const bootGeo = new THREE.BoxGeometry(0.18, 0.1, 0.3);
    const bootMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    const leftBoot = new THREE.Mesh(bootGeo, bootMat);
    leftBoot.position.set(0, -0.82, 0.05);
    leftLegGroup.add(leftBoot);
    
    group.add(leftLegGroup);
    
    // 오른쪽 다리
    const rightLegGroup = new THREE.Group();
    rightLegGroup.position.set(0.15, 0.95, 0);
    
    const rightThigh = new THREE.Mesh(thighGeo, pantsMat);
    rightThigh.position.y = -0.2;
    rightLegGroup.add(rightThigh);
    
    const rightShin = new THREE.Mesh(shinGeo, pantsMat);
    rightShin.position.y = -0.6;
    rightLegGroup.add(rightShin);
    
    const rightBoot = new THREE.Mesh(bootGeo, bootMat);
    rightBoot.position.set(0, -0.82, 0.05);
    rightLegGroup.add(rightBoot);
    
    group.add(rightLegGroup);
    
    // 무기 그룹
    const weaponGroup = new THREE.Group();
    weaponGroup.position.set(0.4, 1.2, 0.3);
    
    const gunBodyGeo = new THREE.BoxGeometry(0.08, 0.12, 0.5);
    const gunMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const gunBody = new THREE.Mesh(gunBodyGeo, gunMat);
    weaponGroup.add(gunBody);
    
    const barrelGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.3, 8);
    const barrel = new THREE.Mesh(barrelGeo, gunMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.z = 0.4;
    weaponGroup.add(barrel);
    
    group.add(weaponGroup);
    
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
    
    // 위치 설정
    group.position.set(playerData.position.x, 0, playerData.position.z);
    scene.add(group);
    
    remotePlayers.set(playerData.id, {
        mesh: group,
        data: playerData,
        nameMesh: nameMesh,
        hpBar: fill
    });
}
```

### 2. 팀 시스템 추가 (선택사항)

플레이어 데이터에 팀 정보 추가:

```javascript
// server.js의 Room 클래스 수정
class Room {
    addPlayer(ws, playerName) {
        // ... 기존 코드 ...
        
        // 팀 자동 배정
        const team = this.players.size % 2 === 0 ? 'red' : 'blue';
        
        const player = {
            id: playerId,
            ws: ws,
            name: playerName,
            team: team,  // 팀 추가
            roomId: this.id,
            position: { x: 0, y: 1.6, z: 0 },
            rotation: { x: 0, y: 0 },
            health: 100,
            isDead: false,
            ready: false
        };
        
        // ... 기존 코드 ...
    }
}
```

### 3. 애니메이션 추가 (고급)

`updateRemotePlayer` 함수에 애니메이션 추가:

```javascript
function updateRemotePlayer(data) {
    const player = remotePlayers.get(data.playerId);
    if (player) {
        // 부드러운 보간
        player.mesh.position.x += (data.position.x - player.mesh.position.x) * 0.3;
        player.mesh.position.z += (data.position.z - player.mesh.position.z) * 0.3;
        
        // 회전
        player.mesh.rotation.y = data.rotation.y + Math.PI;
        
        // 걷기 애니메이션 (이동 중일 때)
        const moveDistance = Math.abs(data.position.x - player.lastX) + 
                           Math.abs(data.position.z - player.lastZ);
        
        if (moveDistance > 0.001) {
            const time = Date.now() * 0.01;
            const angle = Math.sin(time) * 0.3;
            
            // 팔/다리 흔들기
            // (bodyParts 참조가 있다면)
        }
        
        player.lastX = data.position.x;
        player.lastZ = data.position.z;
        
        // 이름표가 항상 카메라를 향하도록
        player.nameMesh.lookAt(camera.position);
        player.hpBar.parent.lookAt(camera.position);
    }
}
```

## 외부 리소스 추천

### 무료 3D 모델 사이트
1. **Mixamo** - 애니메이션 포함 캐릭터
2. **Sketchfab** - CC 라이센스 모델
3. **Kenney.nl** - 게임 에셋
4. **Quaternius** - 로우폴리 캐릭터

### 변환 도구
- **Blender** - FBX → GLB 변환
- **Online GLB Converter** - https://products.aspose.app/3d/conversion/fbx-to-glb

### 파일 구조
```
fps-arena-mp/
├── assets/
│   ├── models/
│   │   ├── soldier.glb
│   │   └── animations/
│   └── textures/
├── multiplayer.html
└── server.js
```
