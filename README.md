
# Human Kubernetes 🧠☸️

> **"Oggi Kubernetes siete voi!"**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v14+-green.svg)](https://nodejs.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.x-black.svg)](https://socket.io/)

**Human Kubernetes** è una demo interattiva multigiocatore massiva progettata per talk e conferenze Cloud Native.
Invece di spiegare concetti complessi con diagrammi statici, questa web-app trasforma il pubblico in un Cluster per visualizzare i concetti di **Reconciliation Loop** e il **Configuration Drift** in tempo reale.

---

## 🎯 Il Concept

Durante il talk, lo speaker diventa il **Chaos Engineer** e il pubblico diventa l'infrastruttura.

1. **Il Pubblico**: Si connette via smartphone. Ogni telefono è un Pod che può crashare.

2. **Lo Speaker:** Avvia il *Chaos Engine* che simula guasti di rete e OOMKilled.

3. **La Missione:** Il pubblico deve agire come una *Liveness Probe* umana, riavviando manualmente i propri pod per mantenere l'SLA del cluster sopra il 90%.

## ✨ Features

* **⚡ Real-time Websockets:** Zero latenza client grazie a `Socket.io`.
I crash appaiono istantaneamente su 100+ dispositivi.

* **🔥 Chaos Engine Configurabile:** Algoritmo lato server che "uccide" una percentuale fissa di pod ogni secondo (`CHAOS_RATE_MS`).

* **📱 Mobile-First UX:** Interfaccia client con feedback aptico (vibrazione) e sonoro in stile "retro-game".

* **📊 Live Dashboard:** Vista per il proiettore con calcolo SLA in tempo reale, gestione fasi (Lobby/Game/Outro) e QR Code dinamici.

* **🛑 Visualizzazione Drift:** Allarmi visivi critici (sfondo rosso lampeggiante) quando l'automazione umana fallisce e l'SLA crolla.

---

![human-k8s-architecture](https://github.com/user-attachments/assets/df173d22-cef2-41f2-a35f-45ba4feee682)


## 🛠️ Quick Start (Setup Locale)

### Prerequisiti

* Node.js (v14 o superiore)
* Tutti i dispositivi (Speaker + Pubblico) devono essere sulla stessa rete LAN/Wi-Fi.
* (opzionale) Ngrok

### Installazione

1. Clona il repository:

    ```bash
    git clone https://github.com/partyslayer/human-k8s.git
    cd human-k8s
    ```

2. Installa le dipendenze:

    ```bash
    npm install
    ```

3. Avvia il server:

    ```bash
    node server.js
    ```

4. (opzionale) Avvia il tunnel ngrok:

    ```bash
    ngrok http 3000
    ```

5. Apri la dashboard sul computer collegato al proiettore:
    * `http://localhost:3000/dashboard.html`
    (oppure link ngrok)

6. Fai connettere i partecipanti scansionando il QR Code proiettato.

---

## 🕹️ Speaker Run Sheet (Regia del Talk)

Questo progetto è strutturato in **3 Fasi** controllabili direttamente dalla Dashboard amministratore.

### 0. 🟢 LOBBY (Pre-Talk)

* **Stato:** I partecipanti entrano, ricevono un nome Pod univoco (es. `nginx-x8y9z`) e vedono lo stato "Running".
* **Visual:** QR Code gigante a schermo.

### 1. 🔴 GAME MODE (Il Caos)

* **Azione:** `START CHAOS` sulla Dashboard.
* **Cosa succede:** Il 10% dei pod crasha ogni secondo con errori reali (`SegFault`, `DiskPressure`).
* **Obiettivo:** Il pubblico deve cliccare ("fixare") freneticamente per tenere la barra SLA verde.
* **Takeaway:** Far sentire la "fatica" fisica del Reconciliation Loop.

### 2. 💀 DRIFT (Il Silenzio)

* **Azione:** *"STOP! MANI IN ALTO!"*.
* **Cosa succede:** Nessuno clicca più. I pod continuano a morire.  L'SLA crolla.
* **Takeaway:** Visualizzazione del **Configuration Drift**. \\ Senza automazione (o intervento umano), lo stato desiderato diverge dalla realtà.

### 3. 🔵 OUTRO (Conclusione)

* **Azione:**  `OUTRO`.
* **Cosa succede:** Il caos si ferma. Appare il messaggio finale e il link al codice.

---

## ⚙️ Configurazione Avanzata

Puoi modificare alcuni parametri attraverso le costanti in `server.js`:

```javascript
// server.js

// Velocità del loop di caos (default: 1 secondo)
const CHAOS_RATE_MS = 1000; 

// Percentuale di vittime ad ogni ciclo (0.10 = 10% del cluster muore ogni sec)
const CRASH_PERCENTAGE = 0.10; 

// Tipi di errori simulati
const ERROR_MESSAGES = [
    "OOMKilled (Exit Code 137)",
    "SegFault (Core Dumped)",
    "Network Timeout",
    ...
];
```

---

## 📂 Struttura File

* **server.js:** Cuore dell'applicazione. Gestisce le stanze socket, il loop di gioco e lo stato globale.

* **public/dashboard.html**: L'interfaccia "Admin" da proiettare. Contiene la logica di rendering della griglia e i bottoni di controllo.

* **public/index.html**: Il client mobile leggero per i partecipanti. Gestisce vibrazione e suoni via Web Audio API.

## 🤝 Contributing

**Vuoi aggiungere nuove funzionalità o puntualizzazioni tecniche?** **Apri una pull request!**
