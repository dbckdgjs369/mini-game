// ============================================
// FPS Arena - WebSocket 서버
// ============================================

const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const PORT = process.env.PORT || 3000;

// 정적 파일 서빙
const server = http.createServer((req, res) => {
    // URL 정규화
    let filePath = req.url === '/' ? '/index.html' : req.url;
    
    // 보안: 경로 탐색 방지
    filePath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, '');
    filePath = path.join(__dirname, filePath);
    
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json'
    };
    
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end('Not Found');
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    });
});

// WebSocket 서버
const wss = new WebSocket.Server({ server });

// 방 관리
const rooms = new Map();

class Room {
    constructor(id) {
        this.id = id;
        this.players = new Map();
        this.maxPlayers = 2; // 1:1 대전
        this.gameStarted = false;
    }
    
    addPlayer(ws, playerName, team = null) {
        if (this.players.size >= this.maxPlayers) {
            return null;
        }
        
        const playerId = uuidv4();
        // 팀 자동 배정 (번갈아가며)
        const autoTeam = team || (this.players.size % 2 === 0 ? 'red' : 'blue');
        
        const player = {
            id: playerId,
            ws: ws,
            name: playerName,
            team: autoTeam,
            roomId: this.id,
            position: { x: 0, y: 1.6, z: 0 },
            rotation: { x: 0, y: 0 },
            health: 100,
            isDead: false,
            ready: false,
            isHost: this.players.size === 0  // 첫 번째 플레이어가 방장
        };
        
        this.players.set(playerId, player);
        ws.playerId = playerId;
        ws.roomId = this.id;
        
        return player;
    }
    
    removePlayer(playerId) {
        this.players.delete(playerId);
        
        // 모든 플레이어에게 나간 알림
        this.broadcast({
            type: 'playerLeft',
            playerId: playerId
        });
        
        // 방이 비면 삭제
        if (this.players.size === 0) {
            rooms.delete(this.id);
        }
    }
    
    broadcast(data, excludePlayerId = null) {
        const message = JSON.stringify(data);
        this.players.forEach((player, id) => {
            if (id !== excludePlayerId && player.ws.readyState === WebSocket.OPEN) {
                player.ws.send(message);
            }
        });
    }
    
    sendTo(playerId, data) {
        const player = this.players.get(playerId);
        if (player && player.ws.readyState === WebSocket.OPEN) {
            player.ws.send(JSON.stringify(data));
        }
    }
    
    getOtherPlayer(playerId) {
        for (const [id, player] of this.players) {
            if (id !== playerId) return player;
        }
        return null;
    }
    
    canStart() {
        return this.players.size === this.maxPlayers;
    }
    
    startGame() {
        this.gameStarted = true;
        
        // 스폰 위치 설정
        const spawns = [
            { x: -15, y: 0.1, z: -15 },
            { x: 15, y: 0.1, z: 15 }
        ];
        
        let i = 0;
        this.players.forEach(player => {
            player.position = spawns[i];
            player.health = 100;
            player.isDead = false;
            i++;
        });
        
        // 게임 시작 알림
        this.broadcast({
            type: 'gameStart',
            players: Array.from(this.players.values()).map(p => ({
                id: p.id,
                name: p.name,
                position: p.position
            }))
        });
    }
}

// WebSocket 연결 처리
wss.on('connection', (ws) => {
    console.log('New connection');
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            handleMessage(ws, data);
        } catch (e) {
            console.error('Invalid message:', e);
        }
    });
    
    ws.on('close', () => {
        console.log('Connection closed');
        if (ws.roomId && rooms.has(ws.roomId)) {
            const room = rooms.get(ws.roomId);
            room.removePlayer(ws.playerId);
        }
    });
    
    ws.on('error', (err) => {
        console.error('WebSocket error:', err);
    });
});

function handleMessage(ws, data) {
    switch (data.type) {
        case 'createRoom':
            createRoom(ws, data.playerName);
            break;
            
        case 'joinRoom':
            joinRoom(ws, data.roomId, data.playerName);
            break;
            
        case 'ready':
            handleReady(ws);
            break;
            
        case 'updatePosition':
            handlePositionUpdate(ws, data);
            break;
            
        case 'shoot':
            handleShoot(ws, data);
            break;
            
        case 'hit':
            handleHit(ws, data);
            break;
            
        case 'respawn':
            handleRespawn(ws);
            break;
            
        case 'startGame':
            handleStartGame(ws);
            break;
    }
}

function createRoom(ws, playerName, team = null) {
    const roomId = generateRoomCode();
    const room = new Room(roomId);
    rooms.set(roomId, room);
    
    const player = room.addPlayer(ws, playerName, team);
    
    ws.send(JSON.stringify({
        type: 'roomCreated',
        roomId: roomId,
        playerId: player.id,
        team: player.team
    }));
    
    console.log(`Room created: ${roomId}, Player: ${playerName}`);
}

function joinRoom(ws, roomId, playerName, team = null) {
    const room = rooms.get(roomId);
    
    if (!room) {
        ws.send(JSON.stringify({
            type: 'error',
            message: '방을 찾을 수 없습니다'
        }));
        return;
    }
    
    if (room.players.size >= room.maxPlayers) {
        ws.send(JSON.stringify({
            type: 'error',
            message: '방이 가득 찼습니다'
        }));
        return;
    }
    
    const player = room.addPlayer(ws, playerName, team);
    
    ws.send(JSON.stringify({
        type: 'roomJoined',
        roomId: roomId,
        playerId: player.id,
        team: player.team
    }));
    
    // 다른 플레이어에게 알림
    room.broadcast({
        type: 'playerJoined',
        player: {
            id: player.id,
            name: player.name,
            team: player.team
        }
    }, player.id);
    
    // 기존 플레이어 정보 전송
    room.players.forEach((p, id) => {
        if (id !== player.id) {
            ws.send(JSON.stringify({
                type: 'playerJoined',
                player: {
                    id: p.id,
                    name: p.name,
                    team: p.team
                }
            }));
        }
    });
    
    // 방장에겐 상대방 입장 알림
    room.broadcast({
        type: 'playerJoined',
        player: {
            id: player.id,
            name: player.name,
            team: player.team
        }
    });
    
    console.log(`Player joined: ${playerName} to ${roomId}`);
}

function handleReady(ws) {
    if (!ws.roomId || !rooms.has(ws.roomId)) return;
    
    const room = rooms.get(ws.roomId);
    const player = room.players.get(ws.playerId);
    
    if (player) {
        player.ready = true;
        room.broadcast({
            type: 'playerReady',
            playerId: ws.playerId
        });
    }
}

function handlePositionUpdate(ws, data) {
    if (!ws.roomId || !rooms.has(ws.roomId)) return;
    
    const room = rooms.get(ws.roomId);
    const player = room.players.get(ws.playerId);
    
    if (player && room.gameStarted) {
        player.position = data.position;
        player.rotation = data.rotation;
        
        // 다른 플레이어에게 전송
        room.broadcast({
            type: 'playerUpdate',
            playerId: ws.playerId,
            position: data.position,
            rotation: data.rotation
        }, ws.playerId);
    }
}

function handleShoot(ws, data) {
    if (!ws.roomId || !rooms.has(ws.roomId)) return;
    
    const room = rooms.get(ws.roomId);
    
    // 다른 플레이어에게 발사 알림
    room.broadcast({
        type: 'playerShoot',
        playerId: ws.playerId,
        position: data.position,
        direction: data.direction
    }, ws.playerId);
}

function handleHit(ws, data) {
    if (!ws.roomId || !rooms.has(ws.roomId)) return;
    
    const room = rooms.get(ws.roomId);
    const targetPlayer = room.players.get(data.targetId);
    
    if (targetPlayer && !targetPlayer.isDead) {
        targetPlayer.health -= data.damage;
        
        if (targetPlayer.health <= 0) {
            targetPlayer.isDead = true;
            targetPlayer.health = 0;
            
            // 킬 알림 (헤드샷 여부 포함)
            room.broadcast({
                type: 'playerKilled',
                killerId: ws.playerId,
                victimId: data.targetId,
                isHeadshot: data.isHeadshot
            });
        } else {
            // 데미지 알림
            room.sendTo(data.targetId, {
                type: 'takeDamage',
                damage: data.damage,
                fromId: ws.playerId,
                isHeadshot: data.isHeadshot
            });
            
            room.broadcast({
                type: 'playerHit',
                playerId: data.targetId,
                health: targetPlayer.health,
                isHeadshot: data.isHeadshot
            }, data.targetId);
        }
    }
}

function handleRespawn(ws) {
    if (!ws.roomId || !rooms.has(ws.roomId)) return;
    
    const room = rooms.get(ws.roomId);
    const player = room.players.get(ws.playerId);
    
    if (player) {
        // 랜덤 스폰 위치
        const spawns = [
            { x: -15, y: 0.1, z: -15 },
            { x: 15, y: 0.1, z: 15 },
            { x: -15, y: 0.1, z: 15 },
            { x: 15, y: 0.1, z: -15 }
        ];
        const spawn = spawns[Math.floor(Math.random() * spawns.length)];
        
        player.health = 100;
        player.isDead = false;
        player.position = spawn;
        
        ws.send(JSON.stringify({
            type: 'respawn',
            position: spawn
        }));
        
        room.broadcast({
            type: 'playerRespawn',
            playerId: ws.playerId,
            position: spawn
        }, ws.playerId);
    }
}

function handleStartGame(ws) {
    if (!ws.roomId || !rooms.has(ws.roomId)) return;
    
    const room = rooms.get(ws.roomId);
    
    // 방장만 게임 시작 가능
    const player = room.players.get(ws.playerId);
    if (!player || !player.isHost) {
        ws.send(JSON.stringify({
            type: 'error',
            message: '방장만 게임을 시작할 수 있습니다'
        }));
        return;
    }
    
    // 게임 시작
    room.startGame();
}

function generateRoomCode() {
    // 4자리 숫자 코드 생성 (1000-9999)
    return Math.floor(1000 + Math.random() * 9000).toString();
}

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`WebSocket ready on ws://localhost:${PORT}`);
});
