// /sessionManager.js
const TIMEOUT_SESION_ONLINE = 14400000;  // 4 horas
const TIMEOUT_SESION_OFFLINE = 86400000; // 24 horas
const TIMEOUT_VERIFICACION = 1800000;    // 30 minutos
const API = "https://script.google.com/macros/s/AKfycbzi1x000HsPSQsWgz65jYWDWZI3cNQoKhoU5XCKagYcqs4en-d1YzO2sbnmzWlLIa9Vvw/exec";

const SessionManager = {
    sessionStartTime: null,
    lastActivityTime: null,
    isOnline: navigator.onLine,
    verificationInterval: null,
    watchdogInterval: null,
    
    init(tokenK) {
        this.tokenK = tokenK;
        
        // Restaurar tiempos del localStorage si existen
        this.sessionStartTime = parseInt(localStorage.getItem('vm_session_start') || Date.now());
        this.lastActivityTime = parseInt(localStorage.getItem('vm_last_activity') || Date.now());
        
        // Guardar nuevamente por si acaso
        localStorage.setItem('vm_session_start', this.sessionStartTime);
        this.recordActivity();
        
        // Monitorear conexión
        window.addEventListener('online', () => this.setOnline(true));
        window.addEventListener('offline', () => this.setOnline(false));
        
        // Monitorear actividad en ESTA página
        ['mousemove', 'mousedown', 'touchstart', 'click', 'keydown', 'scroll', 'change'].forEach(evt => 
            document.addEventListener(evt, () => this.recordActivity(), { passive: true })
        );
        
        // Iniciar vigilancia
        this.startWatchdog();
        this.startRemoteVerification();
        
        console.log('✅ SessionManager iniciado en', window.location.pathname);
    },
    
    setOnline(online) {
        this.isOnline = online;
        if (online) {
            console.log('🔗 Online detectado');
            this.startRemoteVerification();
        } else {
            console.log('📴 Offline detectado');
        }
    },
    
    recordActivity() {
        this.lastActivityTime = Date.now();
        localStorage.setItem('vm_last_activity', this.lastActivityTime);
    },
    
    startWatchdog() {
        if (this.watchdogInterval) clearInterval(this.watchdogInterval);
        
        this.watchdogInterval = setInterval(() => {
            const now = Date.now();
            const timeSinceActivity = now - this.lastActivityTime;
            const timeout = this.isOnline ? TIMEOUT_SESION_ONLINE : TIMEOUT_SESION_OFFLINE;
            
            if (timeSinceActivity > timeout) {
                const horas = Math.floor(timeout / 3600000);
                console.warn(`⏱️ Sesión expirada por inactividad (${horas}h)`);
                this.logout();
            }
        }, 60000); // Chequear cada minuto
    },
    
    startRemoteVerification() {
        if (this.verificationInterval) clearInterval(this.verificationInterval);
        if (!navigator.onLine) return;
        
        this.verificationInterval = setInterval(async () => {
            if (!navigator.onLine) return;
            
            try {
                const fd = new FormData();
                fd.append('action', 'verificarsesion');
                fd.append('k', this.tokenK);
                
                const r = await fetch(API, { 
                    method: 'POST', 
                    body: fd,
                    signal: AbortSignal.timeout(5000)
                });
                const data = await r.json();
                
                if (data.status !== 'success') {
                    console.error('❌ Sesión inválida en servidor');
                    this.logout();
                }
            } catch (e) {
                console.log('ℹ️ No se pudo verificar con servidor (puede ser normal)');
            }
        }, TIMEOUT_VERIFICACION);
    },
    
    logout() {
        localStorage.removeItem('vm_session_start');
        localStorage.removeItem('vm_last_activity');
        clearInterval(this.verificationInterval);
        clearInterval(this.watchdogInterval);
        
        // Redirigir a login
        window.location.replace('index.html');
    }
};