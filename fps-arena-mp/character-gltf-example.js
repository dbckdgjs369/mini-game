// ============================================
// FPS Arena - GLTF 모델 로딩 예시
// ============================================

// CDN에서 Three.js examples 로더 사용
// <script src="https://cdn.jsdelivr.net/npm/three@0.160.0/examples/js/loaders/GLTFLoader.js"></script>

let soldierModel = null;

// 모델 미리 로드
function preloadCharacterModel() {
    const loader = new THREE.GLTFLoader();
    
    // 모델 경로 (assets/models/ 폴더에 저장)
    loader.load(
        'assets/models/soldier.glb',
        function (gltf) {
            soldierModel = gltf.scene;
            
            // 모델 최적화
            soldierModel.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            
            console.log('Soldier model loaded');
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.error('Error loading model:', error);
        }
    );
}

// GLTF 캐릭터 생성
function createGLTFPlayer(playerData) {
    if (!soldierModel) {
        console.warn('Model not loaded yet, using fallback');
        return createDetailedCharacter(playerData); // 폴백
    }
    
    // 모델 복제
    const group = soldierModel.clone();
    
    // 스케일 조정
    group.scale.set(0.01, 0.01, 0.01); // 모델에 따라 조정
    
    // 애니메이션 믹서 설정
    const mixer = new THREE.AnimationMixer(group);
    
    // 저장된 애니메이션 재생
    const clips = soldierModel.animations;
    if (clips && clips.length > 0) {
        const idleAction = mixer.clipAction(clips[0]); // idle 애니메이션
        idleAction.play();
    }
    
    // 위치 설정
    group.position.set(
        playerData.position.x,
        0,
        playerData.position.z
    );
    
    scene.add(group);
    
    // 이름표 추가
    const nameTag = createNameTag(playerData.name, playerData.team);
    nameTag.position.y = 2;
    group.add(nameTag);
    
    remotePlayers.set(playerData.id, {
        mesh: group,
        data: playerData,
        mixer: mixer, // 애니메이션 믹서 저장
        nameTag: nameTag
    });
}

// ============================================
// Mixamo 캐릭터 사용 (묶음 애니메이션)
// ============================================

/* 
Mixamo에서 물리는 방법:
1. https://www.mixamo.com 접속
2. 캐릭터 선택 (예: "Swat")
3. 애니메이션 다운로드:
   - Idle (대기)
   - Rifle Run (달리기)
   - Rifle Shoot (사격)
   - Rifle Reload (재장전)
   - Death (사망)
4. FBX → GLB 변환 (Blender 또는 온라인 컨버터)
5. assets/models/ 폴더에 저장
*/

const ANIMATIONS = {
    idle: null,
    run: null,
    shoot: null,
    reload: null,
    death: null
};

// 애니메이션 상태 관리
class PlayerAnimator {
    constructor(mesh, mixer) {
        this.mesh = mesh;
        this.mixer = mixer;
        this.currentAction = null;
        this.actions = {};
    }
    
    addAnimation(name, clip) {
        this.actions[name] = this.mixer.clipAction(clip);
    }
    
    play(name, fadeDuration = 0.2) {
        const newAction = this.actions[name];
        if (!newAction) return;
        
        if (this.currentAction) {
            this.currentAction.fadeOut(fadeDuration);
        }
        
        newAction.reset()
            .setEffectiveTimeScale(1)
            .setEffectiveWeight(1)
            .fadeIn(fadeDuration)
            .play();
        
        this.currentAction = newAction;
    }
    
    update(deltaTime) {
        this.mixer.update(deltaTime);
    }
}

// ============================================
// 물리 기반 캐릭터 (Ragdoll)
// ============================================

// 캐릭터가 죽었을 때 래그돌 효과
function enableRagdoll(player) {
    // 애니메이션 정지
    if (player.mixer) {
        player.mixer.stopAllAction();
    }
    
    // 물리 엔진 적용 (Cannon.js 또는 Ammo.js 필요)
    player.mesh.traverse((child) => {
        if (child.isMesh && child.parent) {
            // 각 부위에 물리 바디 추가
            // 구현은 사용하는 물리 엔진에 따라 다름
        }
    });
}

// ============================================
// 캐릭터 커스터마이징 시스템
// ============================================

const CHARACTER_PARTS = {
    // 머리
    head: ['helmet', 'cap', 'beret', 'none'],
    // 상의
    torso: ['vest_light', 'vest_heavy', 'vest_medic', 'shirt'],
    // 하의
    legs: ['pants_green', 'pants_tan', 'pants_black'],
    // 무기
    weapon: ['rifle', 'smg', 'sniper', 'shotgun']
};

function createCustomCharacter(playerData, customization) {
    const group = new THREE.Group();
    
    // 기본 몸체
    const body = createCharacterBase(customization.torso, customization.legs);
    group.add(body);
    
    // 머리 + 액세서리
    const head = createHead(customization.head);
    head.position.y = 1.7;
    group.add(head);
    
    // 무기
    const weapon = createWeapon(customization.weapon);
    weapon.position.set(0.4, 1.2, 0.3);
    group.add(weapon);
    
    // 팀 색상 적용
    applyTeamColor(group, playerData.team);
    
    return group;
}

// ============================================
// 성능 최적화: InstancedMesh
// ============================================

// 많은 캐릭터가 필요한 경우 (관전자 모드 등)
function createInstancedPlayers(count) {
    const geometry = new THREE.BoxGeometry(0.6, 1.8, 0.4);
    const material = new THREE.MeshLambertMaterial({ color: 0xff3333 });
    
    const instancedMesh = new THREE.InstancedMesh(geometry, material, count);
    instancedMesh.castShadow = true;
    instancedMesh.receiveShadow = true;
    
    const dummy = new THREE.Object3D();
    
    for (let i = 0; i < count; i++) {
        dummy.position.set(
            Math.random() * 100 - 50,
            0.9,
            Math.random() * 100 - 50
        );
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);
    }
    
    scene.add(instancedMesh);
    return instancedMesh;
}
