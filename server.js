/**
 * Human Kubernetes - Backend Server
 * Gestisce lo stato, il caos e le connessioni socket.
 */
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Configurazione base
const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, 'public')));


// --- CONFIGURAZIONE CAOS ---
const CHAOS_RATE_MS = 1000; 
const CRASH_PERCENTAGE = 0.10; 

const ERROR_MESSAGES = [
    "OOMKilled (Exit Code 137)",
    "SegFault (Core Dumped)",
    "Network Timeout",
    "NullPointer Exception",
    "DiskPressure",
    "CrashLoopBackOff",
    "ErrImagePull"
];

// Stato del gioco
let players = {}; 
let chaosInterval = null;
let currentPhase = 'LOBBY'; // Stati: 'LOBBY', 'GAME', 'OUTRO'

// Generazione nomi
const POD_PREFIXES = ["nginx", "redis", "api", "worker", "db"];
function generatePodName() {
    const prefix = POD_PREFIXES[Math.floor(Math.random() * POD_PREFIXES.length)];
    const suffix = Math.random().toString(36).substring(2, 7);
    return `${prefix}-${suffix}`;
}

// Calcolo SLA barra di salute
function calculateSLA() {
    const total = Object.keys(players).length;
    if (total === 0) return 100;
    const running = Object.values(players).filter(p => p.status === 'green').length;
    return Math.floor((running / total) * 100);
}

// Emissione evento per aggiornare dashboard, ogni volta che accade qualcosa e deve essere mostrato in dashboard si chiama questa funzione
function broadcastUpdate() {
    const sla = calculateSLA();
    io.emit('dashboard_update', { 
        players: Object.values(players), 
        sla: sla,
        phase: currentPhase // Inviamo la fase attuale alla dashboard
    });
}

// --- LOGICA CORE DEL CHAOS ---

// Avvio bottone start chaos
function startChaos() {
    if (chaosInterval) return;
    console.log("Chaos avviato correttamente");
    currentPhase = 'GAME'; // Passa alla fase corretta, questa logica è usta anche per gli altri bottoni
    
    chaosInterval = setInterval(() => {
        const playerIds = Object.keys(players);
        const greenPlayers = playerIds.filter(id => players[id].status === 'green');
        
        const killCount = Math.ceil(greenPlayers.length * CRASH_PERCENTAGE);
        const victims = greenPlayers.sort(() => 0.5 - Math.random()).slice(0, killCount);

        victims.forEach(id => {
            const error = ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)];
            players[id].status = 'red';
            players[id].errorMsg = error;
            io.to(id).emit('pod_crash', error);
        });

        if (victims.length > 0) broadcastUpdate();

    }, CHAOS_RATE_MS);
    broadcastUpdate();
}

function stopChaos() {
    if (chaosInterval) {
        clearInterval(chaosInterval);
        chaosInterval = null;
        console.log("Chaos stoppato con successo");
    }
}

// Reset completo: ferma caos, ripristina pod, torna in Lobby
function resetGame() {
    stopChaos();
    currentPhase = 'LOBBY';
    Object.keys(players).forEach(id => {
        players[id].status = 'green';
        players[id].errorMsg = null;
        io.to(id).emit('pod_running');
    });
    broadcastUpdate();
}

// Mostra la schermata finale
function triggerOutro() {
    currentPhase = 'OUTRO';
    stopChaos(); // Per l'outro fermiamo tutto per sicurezza se passiamo da chaos a outro direttamente
    broadcastUpdate();
}

// EVENTI IO

io.on('connection', (socket) => {               // Listener connessioni, a ogni socket equivale un client connesso
    const role = socket.handshake.query.role;   // Query al parametro del ruolo (passato durante la handshake)

    if (role === 'dashboard') {                 // Collegandoci alla dashboard, la popola aggiornando lo stato e inizializza i bottoni
        socket.emit('dashboard_update', { 
            players: Object.values(players), 
            sla: calculateSLA(),
            phase: currentPhase
        });
                                                
        socket.on('admin_start', startChaos);   
        socket.on('admin_stop', stopChaos);
        socket.on('admin_reset', resetGame);
        socket.on('admin_outro', triggerOutro);
    } else {                                            // Collegandoci all'index
        const name = generatePodName();                 // Genera un nome casuale
        players[socket.id] = {
            id: socket.id,
            name: name,
            status: 'green',
            errorMsg: null
        };

        socket.emit('init_player', { name: name });     // Inizializza il pod del giocatore con il nome generato 
        broadcastUpdate();

        socket.on('restart_pod', () => {                // Ripristina il pod (funzione chiamata al tap)
            if (players[socket.id]) {
                players[socket.id].status = 'green';
                players[socket.id].errorMsg = null;
                socket.emit('pod_running');
                broadcastUpdate();
            }
        });

        socket.on('disconnect', () => {                 // Disconnessione client
            delete players[socket.id];
            broadcastUpdate();
        });
    }
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});