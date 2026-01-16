// Graph Class for handling individual charts
class SystemGraph {
  constructor(canvasId, colorPrimary, colorSecondary) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.data = new Array(40).fill(0); // History buffer
    this.color1 = colorPrimary;
    this.color2 = colorSecondary;

    // Handle DPI scaling
    if (this.canvas) {
      const dpr = window.devicePixelRatio || 1;
      const rect = this.canvas.getBoundingClientRect();
      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;
      this.ctx.scale(dpr, dpr);
      this.width = rect.width;
      this.height = rect.height;
    }
  }

  update(value, max = 100) {
    if (!this.ctx) return;
    this.data.shift();
    this.data.push(value);
    this.draw(max);
  }

  draw(max) {
    const { ctx, width, height, data } = this;
    ctx.clearRect(0, 0, width, height);

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, this.color1);
    gradient.addColorStop(1, this.color2);

    ctx.beginPath();
    ctx.moveTo(0, height);

    const step = width / (data.length - 1);

    data.forEach((val, i) => {
      const x = i * step;
      const normalized = Math.min(Math.max(val, 0), max) / max;
      const y = height - (normalized * height);
      if (i === 0) ctx.moveTo(x, height);
      ctx.lineTo(x, y);
    });

    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath();
    data.forEach((val, i) => {
      const x = i * step;
      const normalized = Math.min(Math.max(val, 0), max) / max;
      const y = height - (normalized * height);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.strokeStyle = this.color1.replace('0.5', '1');
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

// Elements
const cpuVal = document.getElementById('cpuVal');
const ramVal = document.getElementById('ramVal');
const gpuVal = document.getElementById('gpuVal');
const netVal = document.getElementById('netVal');

// Initialize Graphs
const cpuGraph = new SystemGraph('cpuGraph', 'rgba(255, 152, 0, 0.5)', 'rgba(255, 152, 0, 0.05)');
const ramGraph = new SystemGraph('ramGraph', 'rgba(33, 150, 243, 0.5)', 'rgba(33, 150, 243, 0.05)');
const gpuGraph = new SystemGraph('gpuGraph', 'rgba(233, 30, 99, 0.5)', 'rgba(233, 30, 99, 0.05)');
const netGraph = new SystemGraph('netGraph', 'rgba(0, 188, 212, 0.5)', 'rgba(0, 188, 212, 0.05)');

// Debug: Set initial state
if (cpuVal) cpuVal.textContent = "Wait...";

// ==========================================
// WALLPAPER ENGINE SUPPORT
// ==========================================
window.wallpaperPropertyListener = {
  applyUserProperties: function (properties) {
    // Background Image Handler
    if (properties.backgroundImage) {
      let path = properties.backgroundImage.value;
      if (path) {
        // Prepare path (Lively usually sends relative path for folderDropdown)
        // If it sends just filename, we prepend 'photos/'
        if (path.indexOf('/') === -1 && path.indexOf('\\') === -1) {
          path = 'photos/' + path;
        }
        // Apply to background div
        const bgEl = document.querySelector('.background');
        if (bgEl) {
          bgEl.style.backgroundImage = `url('${path}')`;
        }
      }
    }

    // City Name Handler
    if (properties.cityName) {
      // Save to localStorage or update weather directly if supported
      if (properties.cityName.value) {
        localStorage.setItem('userCity', properties.cityName.value);
        // Trigger weather refresh if function exists
        if (window.getWeather) window.getWeather(properties.cityName.value);
      }
    }
  },
  applyGeneralProperties: function (properties) { }
};

function updateStatsWE() {
  if (!isLivelyRunning && window.wallpaperSystemInfo && window.wallpaperSystemInfo.cpuUsage !== undefined) {
    const info = window.wallpaperSystemInfo;
    const cpu = info.cpuUsage || 0;
    if (cpuVal) cpuVal.textContent = Math.round(cpu) + '%';
    cpuGraph.update(cpu, 100);

    const ram = info.memoryUsage || 0;
    if (ramVal) ramVal.textContent = Math.round(ram) + '%';
    ramGraph.update(ram, 100);

    if (gpuVal) gpuVal.textContent = "N/A";
    if (netVal) netVal.textContent = "N/A";
  }
}

// ==========================================
// LIVELY WALLPAPER SUPPORT
// ==========================================
let isLivelyRunning = false;

// Main Handler called by inline script
window.updateLivelyStats = function (data) {
  isLivelyRunning = true;
  // Stop Demo if running
  if (window.demoInterval) {
    clearInterval(window.demoInterval);
    window.demoInterval = null;
    if (cpuVal) cpuVal.style.color = "";
  }
  if (cpuVal && cpuVal.textContent === "Wait...") cpuVal.textContent = "0%"; // Clear wait

  try {
    const obj = JSON.parse(data);

    // CPU
    const cpu = obj.CurrentCpu;
    if (cpuVal) cpuVal.textContent = Math.round(cpu) + '%';
    cpuGraph.update(cpu, 100);

    // GPU (3D Load)
    const gpu = obj.CurrentGpu3D;
    if (gpuVal) gpuVal.textContent = Math.round(gpu) + '%';
    gpuGraph.update(gpu, 100);

    // RAM
    const memTotal = obj.TotalRam;
    const memFree = obj.CurrentRamAvail;
    const memUsed = memTotal - memFree;
    const ramPercent = (memUsed / memTotal) * 100;

    if (ramVal && memTotal) {
      const usedGB = (memUsed / 1024).toFixed(1);
      const totalGB = (memTotal / 1024).toFixed(0);
      ramVal.textContent = `${usedGB}/${totalGB} GB`;
    }
    ramGraph.update(ramPercent, 100);

    // NET
    const down = (obj.CurrentNetDown * 8) / (1024 * 1024);
    const up = (obj.CurrentNetUp * 8) / (1024 * 1024);
    const total = down + up;

    if (netVal) {
      netVal.textContent = `${down.toFixed(1)}↓ ${up.toFixed(1)}↑ Mb/s`;
    }
    netGraph.update(total, 100);
  } catch (e) {
    console.error("Lively Data Error:", e);
    if (cpuVal) cpuVal.textContent = "Err";
  }
};

// Check for buffered data (if we loaded late)
if (window._livelyDataBuffered) {
  window.updateLivelyStats(window._livelyDataBuffered);
  window._livelyDataBuffered = null;
}

// AUTO-FALLBACK: If no data after 3 seconds, start Demo
setTimeout(() => {
  if (!isLivelyRunning && cpuVal && cpuVal.textContent === "Wait...") {
    // Start Demo automatically
    console.log("No Lively data detected. Starting Demo Mode.");
    window.demoInterval = setInterval(runDemoMode, 1000);
    if (cpuVal) cpuVal.style.color = "#ffb74d";
  }
}, 3000);

// Manual Demo Trigger (Click Title to Test)
const titleEl = document.querySelector('h1');
if (titleEl) {
  titleEl.style.cursor = "pointer";
  titleEl.title = "Click to Toggle Demo Mode";
  titleEl.onclick = function () {
    // Toggle logic
    if (window.demoInterval) {
      clearInterval(window.demoInterval);
      window.demoInterval = null;
      if (cpuVal) cpuVal.style.color = "";
      if (cpuVal) cpuVal.textContent = "Wait...";
      isLivelyRunning = false;
    } else {
      isLivelyRunning = false; // Force demo
      window.demoInterval = setInterval(runDemoMode, 500);
      if (cpuVal) cpuVal.style.color = "#ffb74d";
    }
  };
}

function runDemoMode() {
  const time = Date.now() * 0.002;
  // ... reused demo logic ...
  const demoCpu = 35 + Math.sin(time) * 20 + Math.random() * 10;
  if (cpuVal) cpuVal.textContent = Math.round(demoCpu) + '% (Demo)';
  cpuGraph.update(demoCpu, 100);

  // ... other stats
  // Just for visual confirmation
  ramGraph.update(50 + Math.cos(time) * 20, 100);
  gpuGraph.update(40 + Math.sin(time) * 30, 100);
  netGraph.update(Math.abs(Math.sin(time) * 50), 100);

  if (ramVal) ramVal.textContent = "8.2/16 GB";
  if (gpuVal) gpuVal.textContent = Math.round(40 + Math.sin(time) * 30) + '%';
  if (netVal) netVal.textContent = "24.5↓ 5.1↑ Mb/s";
}

// Update Loop for Wallpaper Engine
setInterval(updateStatsWE, 1000);
