// ============================================================
// Couriway's 100K Seeds - Statistics Dashboard
// ============================================================

const API_URL = 'https://couriway-seeds.datastudy.nl/api/runs/all';

const LOADING_MESSAGES = [
  'Entering the aether...',
  'Ascending through golden light...',
  'Gathering celestial data...',
  'Consulting the oracle...',
  'Aligning the constellations...',
  'Channeling divine statistics...',
  'Weaving threads of gold...',
  'Illuminating the records...',
  'Crunching the numbers...',
  'Almost there...',
];

const CHART_COLORS = [
  '#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899', '#6366f1', '#14b8a6', '#f97316',
  '#a855f7', '#0ea5e9', '#84cc16', '#e879f9', '#fb923c',
];

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function parseTime(str) {
  if (!str || str.trim() === '') return null;
  const parts = str.trim().split(':');
  if (parts.length === 3) {
    return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
  }
  if (parts.length === 2) {
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  }
  return null;
}

function formatTime(secs) {
  if (secs == null || isNaN(secs)) return '--';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatTimeLong(secs) {
  if (secs == null) return '--';
  const days = Math.floor(secs / 86400);
  const hours = Math.floor((secs % 86400) / 3600);
  const mins = Math.floor((secs % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

function parseRunId(str) {
  if (!str) return 0;
  return parseInt(String(str).replace(/,/g, ''), 10) || 0;
}

function median(arr) {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function average(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function percentile(arr, p) {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.ceil(sorted.length * p / 100) - 1;
  return sorted[Math.max(0, idx)];
}

function countBy(arr, key) {
  const counts = {};
  arr.forEach(item => {
    const val = (typeof key === 'function' ? key(item) : item[key]) || 'Unknown';
    counts[val] = (counts[val] || 0) + 1;
  });
  return counts;
}

function sortedEntries(obj) {
  return Object.entries(obj).sort((a, b) => b[1] - a[1]);
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function truncateSeed(seed) {
  if (!seed) return '--';
  if (seed.length > 16) return seed.slice(0, 8) + '...' + seed.slice(-6);
  return seed;
}

function chunkbaseUrl(seed) {
  return `https://www.chunkbase.com/apps/seed-map#${encodeURIComponent(seed)}`;
}

// ============================================================
// LOADING SCREEN
// ============================================================

let loadingMessageInterval = null;

function initLoadingScreen() {
  createParticles();
  cycleLoadingMessages();
}

function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  const count = 50;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const x = Math.random() * 100;
    const delay = Math.random() * 6;
    const duration = 4 + Math.random() * 6;
    const size = 2 + Math.random() * 3;
    const hue = 38 + Math.random() * 20; // golden range (38-58)
    const lightness = 55 + Math.random() * 20;
    p.style.cssText = `
      left: ${x}%;
      bottom: -10px;
      width: ${size}px;
      height: ${size}px;
      background: hsl(${hue}, 85%, ${lightness}%);
      box-shadow: 0 0 ${size * 2}px hsl(${hue}, 85%, ${lightness}%);
      animation-delay: ${delay}s;
      animation-duration: ${duration}s;
    `;
    container.appendChild(p);
  }
}

function cycleLoadingMessages() {
  let idx = 0;
  const el = document.getElementById('loading-message');
  if (!el) return;
  loadingMessageInterval = setInterval(() => {
    el.style.opacity = '0';
    setTimeout(() => {
      idx = (idx + 1) % LOADING_MESSAGES.length;
      el.textContent = LOADING_MESSAGES[idx];
      el.style.opacity = '1';
    }, 300);
  }, 2200);
}

function hideLoadingScreen() {
  if (loadingMessageInterval) clearInterval(loadingMessageInterval);
  const screen = document.getElementById('loading-screen');
  if (screen) {
    screen.classList.add('fade-out');
    setTimeout(() => { screen.style.display = 'none'; }, 900);
  }
}

// ============================================================
// DATA PROCESSING
// ============================================================

function processData(runs) {
  // Sort runs by run_id descending (most recent first)
  runs.sort((a, b) => parseRunId(b.run_id) - parseRunId(a.run_id));

  const igts = runs.map(r => parseTime(r.igt)).filter(t => t != null);
  const rtas = runs.map(r => parseTime(r.rta)).filter(t => t != null);

  // Max run_id = total seeds played
  const maxRunId = Math.max(...runs.map(r => parseRunId(r.run_id)));

  // Date range
  const dates = runs.map(r => {
    try { return new Date(r.date_played_est_2 || r.date_played_est); } catch(e) { return null; }
  }).filter(d => d && !isNaN(d));
  dates.sort((a, b) => a - b);

  const firstDate = dates.length ? dates[0] : null;
  const lastDate = dates.length ? dates[dates.length - 1] : null;
  const daySpan = firstDate && lastDate
    ? Math.max(1, Math.ceil((lastDate - firstDate) / 86400000))
    : 1;

  // Seeds per day (based on run_id which tracks all seeds, not just completions)
  const seedsPerDay = maxRunId / daySpan;

  // Estimated days remaining
  const seedsRemaining = Math.max(0, 100000 - maxRunId);
  const estDaysRemaining = seedsPerDay > 0 ? Math.ceil(seedsRemaining / seedsPerDay) : Infinity;

  // Split times
  const splitFields = [
    { key: 'time_wood', label: 'Wood' },
    { key: 'time_iron_pick', label: 'Iron Pickaxe' },
    { key: 'time_nether', label: 'Nether Enter' },
    { key: 'time_bastion', label: 'Bastion' },
    { key: 'time_fortress', label: 'Fortress' },
    { key: 'time_first_portal', label: 'First Portal' },
    { key: 'time_second_portal', label: 'Second Portal' },
    { key: 'time_stronghold', label: 'Stronghold' },
    { key: 'time_end', label: 'End Enter' },
  ];

  const splitStats = splitFields.map(f => {
    const times = runs.map(r => parseTime(r[f.key])).filter(t => t != null && t > 0);
    const best = times.length ? Math.min(...times) : null;
    const bestRun = best != null ? runs.find(r => parseTime(r[f.key]) === best) : null;
    return {
      label: f.label,
      key: f.key,
      best,
      avg: times.length ? average(times) : null,
      median: times.length ? median(times) : null,
      bestRunId: bestRun ? bestRun.run_id : null,
      bestSeed: bestRun ? bestRun.seed : null,
    };
  });

  // Calculate segment-based sum of best (true theoretical best)
  const segmentSplits = [
    'time_wood', 'time_iron_pick', 'time_nether', 'time_bastion',
    'time_fortress', 'time_first_portal', 'time_stronghold', 'time_end', 'igt'
  ];

  const segmentBests = [];
  for (let i = 0; i < segmentSplits.length; i++) {
    const prevKey = i > 0 ? segmentSplits[i - 1] : null;
    const currKey = segmentSplits[i];
    let bestSegment = Infinity;

    runs.forEach(r => {
      const curr = parseTime(r[currKey]);
      const prev = prevKey ? parseTime(r[prevKey]) : 0;
      if (curr != null && (prev != null || !prevKey)) {
        const segment = curr - (prev || 0);
        if (segment > 0 && segment < bestSegment) {
          bestSegment = segment;
        }
      }
    });

    if (bestSegment < Infinity) segmentBests.push(bestSegment);
  }
  const realSumOfBest = segmentBests.reduce((a, b) => a + b, 0);

  // Find best IGT run
  const bestIGTValue = Math.min(...igts);
  const bestIGTRun = runs.find(r => parseTime(r.igt) === bestIGTValue);
  const bestRTAValue = Math.min(...rtas);
  const bestRTARun = runs.find(r => parseTime(r.rta) === bestRTAValue);

  // Distributions
  const bastionTypes = countBy(runs, 'bastion_type');
  const enterTypes = countBy(runs, 'enter_type');
  const ironSources = countBy(runs, 'iron_source');
  const endFightTypes = countBy(runs, 'end_fight_type');
  const spawnBiomes = countBy(runs, 'spawn_biome');
  const goldSources = countBy(runs, 'gold_source');

  // Kill stats
  const killFields = [
    'killed_blaze', 'killed_hoglin', 'killed_enderman', 'killed_ghast',
    'killed_iron_golem', 'killed_zombie', 'killed_skeleton', 'killed_spider',
    'killed_creeper', 'killed_wither_skeleton', 'killed_pig', 'killed_cow',
    'killed_sheep', 'killed_chicken', 'killed_piglin', 'killed_endermite',
    'killed_witch', 'killed_cod', 'killed_salmon',
  ];

  const killTotals = {};
  killFields.forEach(field => {
    const label = field.replace('killed_', '').replace(/_/g, ' ');
    const total = runs.reduce((sum, r) => sum + (parseInt(r[field]) || 0), 0);
    if (total > 0) killTotals[label] = total;
  });

  // Food stats
  const foodFields = [
    'eaten_bread', 'eaten_cooked_porkchop', 'eaten_cooked_beef',
    'eaten_cooked_salmon', 'eaten_cooked_cod', 'eaten_cooked_mutton',
    'eaten_cooked_chicken', 'eaten_rotten_flesh', 'eaten_golden_carrot',
    'eaten_apple', 'eaten_golden_apple', 'eaten_enchanted_golden_apple',
    'eaten_mushroom_stew',
  ];

  const foodTotals = {};
  foodFields.forEach(field => {
    const label = field.replace('eaten_', '').replace(/_/g, ' ');
    const total = runs.reduce((sum, r) => sum + (parseInt(r[field]) || 0), 0);
    if (total > 0) foodTotals[label] = total;
  });

  // Travel stats
  const travelFields = [
    { key: 'travel_sprint', label: 'Sprint' },
    { key: 'travel_boat', label: 'Boat' },
    { key: 'travel_swim', label: 'Swim' },
    { key: 'travel_walk', label: 'Walk' },
    { key: 'travel_walk_on_water', label: 'Walk on Water' },
    { key: 'travel_walk_under_water', label: 'Walk Underwater' },
  ];

  const travelAvgs = {};
  const travelTotals = {};
  travelFields.forEach(f => {
    const vals = runs.map(r => parseInt(r[f.key]) || 0);
    travelAvgs[f.label] = Math.round(average(vals));
    travelTotals[f.label] = vals.reduce((a, b) => a + b, 0);
  });

  // Misc stats
  const avgGoldDropped = Math.round(average(runs.map(r => parseInt(r.gold_dropped) || 0)));
  const avgBlazeRods = average(runs.map(r => parseInt(r.blaze_rods) || 0)).toFixed(1);
  const avgBlazeKills = average(runs.map(r => parseInt(r.blazes_killed) || 0)).toFixed(1);
  const avgEyesUsed = average(runs.map(r => parseInt(r.eyes_used) || 0)).toFixed(1);
  const avgPearlsUsed = average(runs.map(r => parseInt(r.ender_pearls_used) || 0)).toFixed(1);

  return {
    runs,
    maxRunId,
    completions: runs.length,
    completionRate: runs.length / maxRunId,
    seedsPerDay,
    estDaysRemaining,
    firstDate,
    lastDate,
    daySpan,
    igts,
    rtas,
    bestIGT: bestIGTValue,
    bestIGTRun,
    bestRTA: bestRTAValue,
    bestRTARun,
    avgIGT: average(igts),
    medianIGT: median(igts),
    totalPlayTime: igts.reduce((a, b) => a + b, 0),
    sumOfBest: realSumOfBest,
    splitStats,
    bastionTypes,
    enterTypes,
    ironSources,
    endFightTypes,
    spawnBiomes,
    goldSources,
    killTotals,
    foodTotals,
    travelAvgs,
    travelTotals,
    avgGoldDropped,
    avgBlazeRods,
    avgBlazeKills,
    avgEyesUsed,
    avgPearlsUsed,
  };
}

// ============================================================
// RENDER FUNCTIONS
// ============================================================

function renderProgress(stats) {
  const pct = Math.min(100, (stats.maxRunId / 100000) * 100);
  document.getElementById('seeds-played').textContent = numberWithCommas(stats.maxRunId);
  document.getElementById('stat-completions').textContent = numberWithCommas(stats.completions);
  document.getElementById('stat-completion-rate').textContent = (stats.completionRate * 100).toFixed(2) + '%';
  document.getElementById('stat-runs-per-day').textContent = Math.round(stats.seedsPerDay).toLocaleString();

  if (stats.estDaysRemaining < Infinity) {
    const estDate = new Date();
    estDate.setDate(estDate.getDate() + stats.estDaysRemaining);
    document.getElementById('stat-est-completion').textContent =
      estDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } else {
    document.getElementById('stat-est-completion').textContent = '--';
  }

  // Animate progress bar
  requestAnimationFrame(() => {
    setTimeout(() => {
      const fill = document.getElementById('progress-bar-fill');
      const label = document.getElementById('progress-bar-label');
      fill.style.width = pct.toFixed(2) + '%';
      label.textContent = pct.toFixed(2) + '%';
    }, 200);
  });
}

function renderKeyMetrics(stats) {
  document.getElementById('metric-best-igt').textContent = formatTime(stats.bestIGT);
  document.getElementById('metric-best-igt-seed').textContent =
    stats.bestIGTRun ? 'Seed: ' + truncateSeed(stats.bestIGTRun.seed) : '--';

  document.getElementById('metric-avg-igt').textContent = formatTime(stats.avgIGT);
  document.getElementById('metric-avg-igt-detail').textContent =
    `Std: ~${formatTime(stddev(stats.igts))}`;

  document.getElementById('metric-median-igt').textContent = formatTime(stats.medianIGT);
  document.getElementById('metric-median-igt-detail').textContent =
    `P90: ${formatTime(percentile(stats.igts, 90))}`;

  document.getElementById('metric-best-rta').textContent = formatTime(stats.bestRTA);
  document.getElementById('metric-best-rta-seed').textContent =
    stats.bestRTARun ? 'Seed: ' + truncateSeed(stats.bestRTARun.seed) : '--';

  document.getElementById('metric-total-time').textContent = formatTimeLong(stats.totalPlayTime);
  document.getElementById('metric-total-time-detail').textContent =
    `Across ${numberWithCommas(stats.completions)} runs`;

  document.getElementById('metric-sum-of-best').textContent = formatTime(stats.sumOfBest);
}

function stddev(arr) {
  if (arr.length < 2) return 0;
  const avg = average(arr);
  const sqDiffs = arr.map(v => (v - avg) ** 2);
  return Math.sqrt(sqDiffs.reduce((a, b) => a + b, 0) / arr.length);
}

function renderHeaderMeta(stats) {
  const lastRun = stats.runs[0];
  if (lastRun) {
    document.getElementById('last-updated').textContent =
      'Last run: ' + (lastRun.date_played_est_2 || lastRun.date_played_est || '--');
  }
  document.getElementById('data-count').textContent =
    numberWithCommas(stats.completions) + ' completions';
}

function renderSplitsTable(stats) {
  const tbody = document.getElementById('splits-table-body');
  tbody.innerHTML = stats.splitStats.map(s => `
    <tr>
      <td class="split-name">${s.label}</td>
      <td class="best-val">${formatTime(s.best)}</td>
      <td>${formatTime(s.avg)}</td>
      <td>${formatTime(s.median)}</td>
      <td style="font-family: var(--font-mono); font-size: 0.82rem;">${s.bestRunId || '--'}</td>
      <td>${s.bestSeed
        ? `<a class="seed-link" href="${chunkbaseUrl(s.bestSeed)}" target="_blank" title="${s.bestSeed}">${truncateSeed(s.bestSeed)}</a>`
        : '--'}</td>
    </tr>
  `).join('');

  renderSplitsLineChart(stats);
}

function renderSplitsLineChart(stats) {
  const labels = stats.splitStats.map(s => s.label);
  const bestTimes = stats.splitStats.map(s => s.best);
  const avgTimes = stats.splitStats.map(s => s.avg);
  const medianTimes = stats.splitStats.map(s => s.median);

  new Chart(document.getElementById('chart-splits-line'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Best',
          data: bestTimes,
          backgroundColor: 'rgba(16, 185, 129, 0.7)',
          borderColor: '#10b981',
          borderWidth: 1,
          borderRadius: 4,
        },
        {
          label: 'Average',
          data: avgTimes,
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: '#3b82f6',
          borderWidth: 1,
          borderRadius: 4,
        },
        {
          label: 'Median',
          data: medianTimes,
          backgroundColor: 'rgba(245, 158, 11, 0.6)',
          borderColor: '#f59e0b',
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2.5,
      interaction: { mode: 'index', intersect: false },
      scales: {
        y: {
          title: { display: true, text: 'Time', color: '#94a3b8' },
          ticks: { callback: v => formatTime(v) },
          grid: { color: 'rgba(255,255,255,0.04)' },
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 11 } },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${formatTime(ctx.raw)}`,
          },
        },
        legend: { position: 'top' },
      },
    },
  });
}

// ============================================================
// CHART RENDERING
// ============================================================

function setupChartDefaults() {
  Chart.defaults.color = '#94a3b8';
  Chart.defaults.borderColor = 'rgba(255,255,255,0.06)';
  Chart.defaults.font.family = "'Inter', sans-serif";
  Chart.defaults.font.size = 12;
  Chart.defaults.plugins.legend.labels.usePointStyle = true;
  Chart.defaults.plugins.legend.labels.padding = 16;
  Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(15, 15, 30, 0.95)';
  Chart.defaults.plugins.tooltip.titleFont = { weight: '600' };
  Chart.defaults.plugins.tooltip.padding = 12;
  Chart.defaults.plugins.tooltip.cornerRadius = 8;
  Chart.defaults.plugins.tooltip.borderColor = 'rgba(255,255,255,0.1)';
  Chart.defaults.plugins.tooltip.borderWidth = 1;
}

let performanceChart = null;

function filterRunsByRange(runs, range) {
  if (range === 'all') return runs;

  const now = new Date();
  const cutoff = new Date(now);
  switch (range) {
    case 'year':  cutoff.setFullYear(cutoff.getFullYear() - 1); break;
    case 'month': cutoff.setMonth(cutoff.getMonth() - 1); break;
    case 'week':  cutoff.setDate(cutoff.getDate() - 7); break;
    case 'day':   cutoff.setDate(cutoff.getDate() - 1); break;
  }

  return runs.filter(r => {
    const dateStr = r.date_played_est_2 || r.date_played_est;
    if (!dateStr) return false;
    try {
      const d = new Date(dateStr);
      return !isNaN(d) && d >= cutoff;
    } catch(e) { return false; }
  });
}

function renderPerformanceChart(stats, range) {
  range = range || 'all';
  const filtered = filterRunsByRange(stats.runs, range);
  const recent = filtered.slice().reverse();
  const validRuns = recent.filter(r => parseTime(r.igt) != null);

  // Update description
  const desc = document.getElementById('perf-desc');
  if (validRuns.length === 0) {
    desc.textContent = 'No completions found for this time range';
  } else {
    const rangeLabels = { all: 'all time', year: 'the last year', month: 'the last month', week: 'the last week', day: 'the last 24 hours' };
    desc.textContent = `${numberWithCommas(validRuns.length)} completions over ${rangeLabels[range]}`;
  }

  const igts = validRuns.map(r => parseTime(r.igt));
  const labels = validRuns.map(r => `#${parseRunId(r.run_id)}`);

  // Moving average (adaptive window: smaller for fewer points)
  const windowSize = Math.max(3, Math.min(20, Math.floor(igts.length / 5)));
  const movingAvg = igts.map((_, i) => {
    const start = Math.max(0, i - windowSize + 1);
    const slice = igts.slice(start, i + 1);
    return average(slice);
  });

  const canvas = document.getElementById('chart-performance');
  if (performanceChart) {
    performanceChart.destroy();
    performanceChart = null;
  }

  performanceChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'IGT',
          data: igts,
          borderColor: 'rgba(139, 92, 246, 0.4)',
          backgroundColor: 'rgba(139, 92, 246, 0.05)',
          borderWidth: 1.5,
          pointRadius: igts.length < 60 ? 3 : 0,
          pointHitRadius: 8,
          pointBackgroundColor: 'rgba(139, 92, 246, 0.7)',
          fill: true,
          tension: 0.1,
        },
        {
          label: `Moving Avg (${windowSize})`,
          data: movingAvg,
          borderColor: '#f59e0b',
          borderWidth: 2.5,
          pointRadius: 0,
          pointHitRadius: 8,
          fill: false,
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2.5,
      interaction: { mode: 'index', intersect: false },
      scales: {
        y: {
          ticks: {
            callback: v => formatTime(v),
          },
          grid: { color: 'rgba(255,255,255,0.04)' },
        },
        x: {
          ticks: { maxTicksLimit: 15, font: { size: 10 } },
          grid: { display: false },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.dataset.label}: ${formatTime(ctx.raw)}`,
          },
        },
        legend: { position: 'top' },
      },
    },
  });
}

function setPerformanceRange(range) {
  // Update active pill
  document.querySelectorAll('#perf-filters .pill').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.range === range);
  });
  if (window.__scatterStats) {
    renderPerformanceChart(window.__scatterStats, range);
  }
}

// ============================================================
// SCATTER PLOT
// ============================================================

const STACKED_COLORS = [
  '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#84cc16',
  '#14b8a6', '#a855f7', '#e879f9', '#fb923c', '#0ea5e9',
  '#facc15', '#4ade80', '#f43f5e', '#22d3ee', '#c084fc',
];

let stackedChart = null;
const BUCKET_SIZE = 200;

function renderStackedChart(stats, colorBy) {
  const runs = stats.runs;

  // Determine bucket range from run IDs
  const runIds = runs.map(r => parseRunId(r.run_id)).filter(id => id > 0);
  const maxId = Math.max(...runIds);
  const bucketCount = Math.ceil(maxId / BUCKET_SIZE);

  // Count occurrences of each category globally to find the top ones
  const globalCounts = {};
  runs.forEach(r => {
    const label = r[colorBy] || 'Unknown';
    globalCounts[label] = (globalCounts[label] || 0) + 1;
  });
  const allSortedLabels = Object.keys(globalCounts).sort((a, b) => globalCounts[b] - globalCounts[a]);

  // Limit to top 8 categories; group the rest as "Other"
  const MAX_CATEGORIES = 8;
  let sortedLabels;
  let hasOther = false;
  if (allSortedLabels.length > MAX_CATEGORIES) {
    sortedLabels = allSortedLabels.slice(0, MAX_CATEGORIES);
    sortedLabels.push('Other');
    hasOther = true;
  } else {
    sortedLabels = allSortedLabels;
  }
  const topSet = new Set(sortedLabels.slice(0, MAX_CATEGORIES));

  // Build bucket labels and per-category data
  const bucketLabels = [];
  for (let i = 0; i < bucketCount; i++) {
    const lo = i * BUCKET_SIZE + 1;
    const hi = (i + 1) * BUCKET_SIZE;
    bucketLabels.push(`${numberWithCommas(lo)}-${numberWithCommas(hi)}`);
  }

  // Initialize counts: category -> array of bucket counts
  const bucketData = {};
  sortedLabels.forEach(label => {
    bucketData[label] = new Array(bucketCount).fill(0);
  });

  runs.forEach(r => {
    const id = parseRunId(r.run_id);
    if (id <= 0) return;
    const bucket = Math.floor((id - 1) / BUCKET_SIZE);
    let label = r[colorBy] || 'Unknown';
    if (hasOther && !topSet.has(label)) {
      label = 'Other';
    }
    if (bucket < bucketCount) {
      bucketData[label][bucket]++;
    }
  });

  const datasets = sortedLabels.map((label, i) => ({
    label,
    data: bucketData[label],
    backgroundColor: STACKED_COLORS[i % STACKED_COLORS.length] + 'cc',
    borderColor: STACKED_COLORS[i % STACKED_COLORS.length],
    borderWidth: 1,
    borderRadius: 2,
  }));

  const canvas = document.getElementById('chart-scatter');
  if (stackedChart) {
    stackedChart.destroy();
    stackedChart = null;
  }

  stackedChart = new Chart(canvas, {
    type: 'bar',
    data: { labels: bucketLabels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2.2,
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: {
          stacked: true,
          title: { display: true, text: 'Seed Range', color: '#94a3b8' },
          grid: { display: false },
          ticks: { font: { size: 9 }, maxRotation: 50, minRotation: 30 },
        },
        y: {
          stacked: true,
          title: { display: true, text: 'Completions', color: '#94a3b8' },
          grid: { color: 'rgba(255,255,255,0.04)' },
        },
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            padding: 14,
            font: { size: 11 },
            boxWidth: 12,
            boxHeight: 12,
          },
        },
        tooltip: {
          callbacks: {
            title: ctx => `Seeds ${ctx[0].label}`,
            afterTitle: ctx => {
              const idx = ctx[0].dataIndex;
              const total = datasets.reduce((sum, ds) => sum + ds.data[idx], 0);
              return `Total completions: ${total}`;
            },
            label: ctx => {
              if (ctx.raw === 0) return null;
              const idx = ctx.dataIndex;
              const total = datasets.reduce((sum, ds) => sum + ds.data[idx], 0);
              const pct = total > 0 ? ((ctx.raw / total) * 100).toFixed(1) : '0';
              return ` ${ctx.dataset.label}: ${ctx.raw} (${pct}%)`;
            },
          },
        },
      },
    },
  });
}

function updateScatter() {
  const colorBy = document.getElementById('scatter-color-by').value;
  if (window.__scatterStats) {
    renderStackedChart(window.__scatterStats, colorBy);
  }
}

function renderDistributionChart(stats) {
  // Create histogram of IGT times
  const igts = stats.igts;
  const minTime = Math.floor(Math.min(...igts) / 60) * 60; // round down to minute
  const maxTime = Math.ceil(Math.max(...igts) / 60) * 60;
  const binSize = 60; // 1 minute bins
  const bins = [];
  const binLabels = [];

  for (let t = minTime; t < maxTime; t += binSize) {
    const count = igts.filter(v => v >= t && v < t + binSize).length;
    bins.push(count);
    binLabels.push(formatTime(t));
  }

  new Chart(document.getElementById('chart-distribution'), {
    type: 'bar',
    data: {
      labels: binLabels,
      datasets: [{
        label: 'Completions',
        data: bins,
        backgroundColor: bins.map((_, i) => {
          const ratio = i / bins.length;
          if (ratio < 0.15) return 'rgba(16, 185, 129, 0.7)';
          if (ratio < 0.35) return 'rgba(6, 182, 212, 0.7)';
          if (ratio < 0.6) return 'rgba(59, 130, 246, 0.7)';
          return 'rgba(139, 92, 246, 0.7)';
        }),
        borderRadius: 4,
        borderSkipped: false,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2.5,
      scales: {
        y: {
          title: { display: true, text: 'Count' },
          grid: { color: 'rgba(255,255,255,0.04)' },
        },
        x: {
          title: { display: true, text: 'IGT' },
          grid: { display: false },
          ticks: { maxTicksLimit: 20, font: { size: 10 } },
        },
      },
      plugins: {
        legend: { display: false },
      },
    },
  });

  // Pace breakdown cards
  const paceThresholds = [
    { label: 'Sub 15:00', max: 900 },
    { label: 'Sub 17:00', max: 1020 },
    { label: 'Sub 20:00', max: 1200 },
    { label: 'Sub 25:00', max: 1500 },
    { label: 'Sub 30:00', max: 1800 },
  ];

  const paceContainer = document.getElementById('pace-cards');
  paceContainer.innerHTML = paceThresholds.map(p => {
    const count = igts.filter(t => t < p.max).length;
    const pct = ((count / igts.length) * 100).toFixed(1);
    return `
      <div class="pace-card">
        <div class="pace-card-label">${p.label}</div>
        <div class="pace-card-value">${numberWithCommas(count)}</div>
        <div class="pace-card-pct">${pct}% of runs</div>
      </div>
    `;
  }).join('');
}

function renderDoughnutChart(canvasId, data, title) {
  const entries = sortedEntries(data);
  new Chart(document.getElementById(canvasId), {
    type: 'doughnut',
    data: {
      labels: entries.map(e => e[0]),
      datasets: [{
        data: entries.map(e => e[1]),
        backgroundColor: CHART_COLORS.slice(0, entries.length),
        borderColor: 'rgba(8, 8, 14, 0.8)',
        borderWidth: 2,
        hoverOffset: 8,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      cutout: '55%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { padding: 12, font: { size: 11 } },
        },
        tooltip: {
          callbacks: {
            label: ctx => {
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
              const pct = ((ctx.raw / total) * 100).toFixed(1);
              return ` ${ctx.label}: ${numberWithCommas(ctx.raw)} (${pct}%)`;
            },
          },
        },
      },
    },
  });
}

function renderBarChart(canvasId, data, label, color) {
  const entries = sortedEntries(data).slice(0, 15);
  new Chart(document.getElementById(canvasId), {
    type: 'bar',
    data: {
      labels: entries.map(e => e[0]),
      datasets: [{
        label,
        data: entries.map(e => e[1]),
        backgroundColor: color || 'rgba(139, 92, 246, 0.6)',
        borderRadius: 4,
        borderSkipped: false,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 1.8,
      indexAxis: 'y',
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { callback: v => numberWithCommas(v) },
        },
        y: {
          grid: { display: false },
          ticks: { font: { size: 11 } },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${numberWithCommas(ctx.raw)} total`,
          },
        },
      },
    },
  });
}

function renderBiomeChart(stats) {
  const entries = sortedEntries(stats.spawnBiomes).slice(0, 20);
  new Chart(document.getElementById('chart-biomes'), {
    type: 'bar',
    data: {
      labels: entries.map(e => e[0]),
      datasets: [{
        label: 'Spawn Count',
        data: entries.map(e => e[1]),
        backgroundColor: entries.map((_, i) => CHART_COLORS[i % CHART_COLORS.length] + 'aa'),
        borderRadius: 4,
        borderSkipped: false,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2.5,
      scales: {
        y: {
          grid: { color: 'rgba(255,255,255,0.04)' },
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 10 }, maxRotation: 45, minRotation: 30 },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => {
              const pct = ((ctx.raw / stats.completions) * 100).toFixed(1);
              return ` ${numberWithCommas(ctx.raw)} (${pct}%)`;
            },
          },
        },
      },
    },
  });
}

function renderTravelChart(stats) {
  const entries = Object.entries(stats.travelAvgs).sort((a, b) => b[1] - a[1]);
  new Chart(document.getElementById('chart-travel'), {
    type: 'bar',
    data: {
      labels: entries.map(e => e[0]),
      datasets: [{
        label: 'Avg Distance (blocks)',
        data: entries.map(e => e[1]),
        backgroundColor: ['#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899']
          .map(c => c + 'cc'),
        borderRadius: 6,
        borderSkipped: false,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2.5,
      scales: {
        y: {
          title: { display: true, text: 'Blocks' },
          grid: { color: 'rgba(255,255,255,0.04)' },
        },
        x: {
          grid: { display: false },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => {
              const totalKey = ctx.label;
              const total = stats.travelTotals[totalKey] || 0;
              return [
                ` Avg: ${numberWithCommas(ctx.raw)} blocks`,
                ` Total: ${numberWithCommas(total)} blocks`,
              ];
            },
          },
        },
      },
    },
  });
}

// ============================================================
// SEED MAP EXPLORER
// ============================================================

let allRuns = [];
let seedPage = 0;
const SEEDS_PER_PAGE = 12;
let selectedSeed = null;

function renderSeedGrid(runs) {
  allRuns = runs;
  seedPage = 0;
  renderSeedPage();
  renderSeedPagination();
}

function renderSeedPage() {
  const start = seedPage * SEEDS_PER_PAGE;
  const pageRuns = allRuns.slice(start, start + SEEDS_PER_PAGE);
  const grid = document.getElementById('seed-grid');
  grid.innerHTML = pageRuns.map((r, i) => `
    <div class="seed-card" data-idx="${start + i}" onclick="selectSeedByIndex(${start + i})">
      <div class="seed-card-header">
        <span class="seed-number" title="${r.seed}">${truncateSeed(r.seed)}</span>
        <span class="seed-igt">${r.igt}</span>
      </div>
      <div class="seed-card-meta">
        <span class="seed-tag">${r.spawn_biome || '--'}</span>
        <span class="seed-tag">${r.bastion_type || '--'}</span>
        <span class="seed-tag">${r.enter_type || '--'}</span>
        <span class="seed-tag">#${r.run_id}</span>
      </div>
    </div>
  `).join('');
}

function renderSeedPagination() {
  const totalPages = Math.ceil(allRuns.length / SEEDS_PER_PAGE);
  const container = document.getElementById('seed-pagination');
  if (totalPages <= 1) { container.innerHTML = ''; return; }

  // Show limited page buttons
  const maxButtons = 7;
  let startPage = Math.max(0, seedPage - Math.floor(maxButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxButtons);
  if (endPage - startPage < maxButtons) startPage = Math.max(0, endPage - maxButtons);

  let html = '';
  if (seedPage > 0) {
    html += `<button class="btn btn-page" onclick="goSeedPage(${seedPage - 1})">&laquo;</button>`;
  }
  for (let i = startPage; i < endPage; i++) {
    html += `<button class="btn btn-page ${i === seedPage ? 'active' : ''}" onclick="goSeedPage(${i})">${i + 1}</button>`;
  }
  if (seedPage < totalPages - 1) {
    html += `<button class="btn btn-page" onclick="goSeedPage(${seedPage + 1})">&raquo;</button>`;
  }
  container.innerHTML = html;
}

function goSeedPage(page) {
  seedPage = page;
  renderSeedPage();
  renderSeedPagination();
}

function selectSeedByIndex(idx) {
  const run = allRuns[idx];
  if (!run) return;
  const seed = run.seed;
  selectedSeed = seed;

  // Highlight active card
  document.querySelectorAll('.seed-card').forEach(c => c.classList.remove('active'));
  const activeCard = document.querySelector(`.seed-card[data-idx="${idx}"]`);
  if (activeCard) activeCard.classList.add('active');

  // Show preview container
  const container = document.getElementById('seed-preview-container');
  container.style.display = 'block';

  // Set title
  document.getElementById('seed-preview-title').textContent = `Seed: ${seed}`;

  // Set links
  const url = chunkbaseUrl(seed);
  document.getElementById('seed-chunkbase-link').href = url;
  document.getElementById('seed-fallback-link').href = url;

  // Set stats
  if (run) {
    const statsHtml = [
      { label: 'IGT', value: run.igt },
      { label: 'RTA', value: run.rta },
      { label: 'Biome', value: run.spawn_biome },
      { label: 'Bastion', value: run.bastion_type },
      { label: 'Iron', value: run.iron_source },
      { label: 'Enter', value: run.enter_type },
      { label: 'End Fight', value: run.end_fight_type },
      { label: 'Eyes Used', value: run.eyes_used },
      { label: 'Pearls Used', value: run.ender_pearls_used },
      { label: 'Gold', value: run.gold_dropped },
    ].map(s => `
      <div class="seed-stat">
        <div class="seed-stat-label">${s.label}</div>
        <div class="seed-stat-value">${s.value || '--'}</div>
      </div>
    `).join('');

    // Add notes if available
    const notesHtml = run.notes
      ? `<div style="grid-column: 1/-1; padding: 8px 0 0; border-top: 1px solid rgba(255,255,255,0.06); margin-top: 4px;">
           <div class="seed-stat-label" style="margin-bottom: 4px;">Notes</div>
           <div style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.5;">${run.notes}</div>
         </div>`
      : '';
    document.getElementById('seed-preview-stats').innerHTML = statsHtml + notesHtml;
  }

  // Load iframe
  const iframe = document.getElementById('seed-iframe');
  iframe.src = url;

  // Scroll preview into view
  container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function closeSeedPreview() {
  document.getElementById('seed-preview-container').style.display = 'none';
  document.querySelectorAll('.seed-card').forEach(c => c.classList.remove('active'));
  selectedSeed = null;
}

function copySeed() {
  if (selectedSeed) {
    navigator.clipboard.writeText(selectedSeed).then(() => {
      const btn = document.getElementById('seed-copy-btn');
      const orig = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = orig; }, 1500);
    });
  }
}

// ============================================================
// ALL COMPLETIONS TABLE (SORTABLE)
// ============================================================

let runsPage = 0;
const RUNS_PER_PAGE = 25;
let runsSortField = 'run_id';
let runsSortDir = 'desc'; // 'asc' or 'desc'

function initSortableHeaders() {
  document.querySelectorAll('#runs-table th.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const field = th.dataset.sort;
      const type = th.dataset.type;
      if (runsSortField === field) {
        runsSortDir = runsSortDir === 'asc' ? 'desc' : 'asc';
      } else {
        runsSortField = field;
        runsSortDir = (type === 'string') ? 'asc' : 'desc';
      }
      sortAllRuns();
      updateSortArrows();
      runsPage = 0;
      renderRunsPage();
      renderRunsPagination();
    });
  });
  updateSortArrows();
}

function updateSortArrows() {
  document.querySelectorAll('#runs-table th.sortable').forEach(th => {
    const arrow = th.querySelector('.sort-arrow');
    if (th.dataset.sort === runsSortField) {
      th.classList.add('sorted');
      arrow.innerHTML = runsSortDir === 'asc' ? '&#x25B2;' : '&#x25BC;';
    } else {
      th.classList.remove('sorted');
      arrow.innerHTML = '';
    }
  });
}

function sortAllRuns() {
  const runs = window.__allRuns;
  if (!runs) return;
  const field = runsSortField;
  const dir = runsSortDir === 'asc' ? 1 : -1;

  runs.sort((a, b) => {
    let va, vb;
    if (field === 'run_id') {
      va = parseRunId(a.run_id);
      vb = parseRunId(b.run_id);
    } else if (field === 'date') {
      va = new Date(a.date_played_est_2 || a.date_played_est || '').getTime() || 0;
      vb = new Date(b.date_played_est_2 || b.date_played_est || '').getTime() || 0;
    } else if (field === 'igt') {
      va = parseTime(a.igt) ?? Infinity;
      vb = parseTime(b.igt) ?? Infinity;
    } else if (field === 'rta') {
      va = parseTime(a.rta) ?? Infinity;
      vb = parseTime(b.rta) ?? Infinity;
    } else {
      va = (a[field] || '').toLowerCase();
      vb = (b[field] || '').toLowerCase();
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    }
    return (va - vb) * dir;
  });
}

function renderRecentRuns(runs) {
  initSortableHeaders();
  renderRunsPage();
  renderRunsPagination();
}

function renderRunsPage() {
  const runs = window.__allRuns || [];
  const start = runsPage * RUNS_PER_PAGE;
  const pageRuns = runs.slice(start, start + RUNS_PER_PAGE);
  const tbody = document.getElementById('runs-table-body');
  tbody.innerHTML = pageRuns.map(r => `
    <tr>
      <td>${r.run_id}</td>
      <td>${r.date_played_est_2 || r.date_played_est || '--'}</td>
      <td style="color: var(--accent-green); font-weight: 600;">${r.igt}</td>
      <td>${r.rta}</td>
      <td class="run-seed">
        <a href="${chunkbaseUrl(r.seed)}" target="_blank" title="${r.seed}" style="color: var(--accent-purple); text-decoration: none;">
          ${truncateSeed(r.seed)}
        </a>
      </td>
      <td>${r.bastion_type || '--'}</td>
      <td>${r.iron_source || '--'}</td>
      <td>${r.enter_type || '--'}</td>
      <td>${r.end_fight_type || '--'}</td>
      <td>${r.spawn_biome || '--'}</td>
    </tr>
  `).join('');
}

function renderRunsPagination() {
  const runs = window.__allRuns || [];
  const totalPages = Math.ceil(runs.length / RUNS_PER_PAGE);
  const container = document.getElementById('runs-pagination');
  if (totalPages <= 1) { container.innerHTML = ''; return; }

  const maxButtons = 7;
  let startPage = Math.max(0, runsPage - Math.floor(maxButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxButtons);
  if (endPage - startPage < maxButtons) startPage = Math.max(0, endPage - maxButtons);

  let html = '';
  if (runsPage > 0) {
    html += `<button class="btn btn-page" onclick="goRunsPage(${runsPage - 1})">&laquo;</button>`;
  }
  for (let i = startPage; i < endPage; i++) {
    html += `<button class="btn btn-page ${i === runsPage ? 'active' : ''}" onclick="goRunsPage(${i})">${i + 1}</button>`;
  }
  if (runsPage < totalPages - 1) {
    html += `<button class="btn btn-page" onclick="goRunsPage(${runsPage + 1})">&raquo;</button>`;
  }
  container.innerHTML = html;
}

function goRunsPage(page) {
  runsPage = page;
  renderRunsPage();
  renderRunsPagination();
}

// ============================================================
// RUN INSPECTOR
// ============================================================

let inspectorChart = null;

function initInspector(stats) {
  // Populate the recent runs dropdown
  const select = document.getElementById('inspector-select');
  const recentRuns = stats.runs.slice(0, 100);
  recentRuns.forEach(r => {
    const opt = document.createElement('option');
    opt.value = r.run_id;
    opt.textContent = `#${r.run_id}  —  ${r.igt}  (${r.bastion_type || '?'})`;
    select.appendChild(opt);
  });
}

function selectInspectorRun() {
  const runId = document.getElementById('inspector-select').value;
  if (!runId) return;
  document.getElementById('inspector-input').value = runId;
  loadInspectorRun(runId);
}

function searchInspectorRun() {
  const raw = document.getElementById('inspector-input').value.trim();
  if (!raw) return;
  loadInspectorRun(raw);
}

function loadInspectorRun(runIdStr) {
  const stats = window.__scatterStats;
  if (!stats) return;

  const targetId = parseRunId(runIdStr);
  const run = stats.runs.find(r => parseRunId(r.run_id) === targetId);
  if (!run) {
    document.getElementById('inspector-content').style.display = 'none';
    return;
  }

  document.getElementById('inspector-content').style.display = 'block';

  // Sync dropdown
  const select = document.getElementById('inspector-select');
  select.value = run.run_id;

  renderInspectorHeader(run);
  renderInspectorSplits(run, stats);
  renderInspectorDetails(run);
  renderInspectorCombat(run, stats);
  renderInspectorFoodTravel(run, stats);
  renderInspectorNotes(run);
  renderInspectorChart(run, stats);

  // Scroll into view
  document.getElementById('inspector-content').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderInspectorHeader(run) {
  const container = document.getElementById('inspector-header');
  const cards = [
    { label: 'Run #', value: run.run_id },
    { label: 'IGT', value: run.igt },
    { label: 'RTA', value: run.rta },
    { label: 'Seed', value: truncateSeed(run.seed) },
    { label: 'Date', value: run.date_played_est_2 || run.date_played_est || '--' },
    { label: 'Biome', value: run.spawn_biome || '--' },
  ];
  container.innerHTML = cards.map(c => `
    <div class="inspector-header-card">
      <div class="inspector-header-label">${c.label}</div>
      <div class="inspector-header-value">${c.value}</div>
    </div>
  `).join('');
}

function formatDiff(runTime, compareTime) {
  if (runTime == null || compareTime == null) return { text: '--', cls: 'diff-neutral' };
  const diff = runTime - compareTime;
  const sign = diff > 0 ? '+' : '-';
  const cls = diff > 0 ? 'diff-positive' : diff < 0 ? 'diff-negative' : 'diff-neutral';
  return { text: `${sign}${formatTime(Math.abs(diff))}`, cls };
}

function renderInspectorSplits(run, stats) {
  const tbody = document.getElementById('inspector-splits-body');
  const splitFields = [
    { key: 'time_wood', label: 'Wood' },
    { key: 'time_iron_pick', label: 'Iron Pickaxe' },
    { key: 'time_nether', label: 'Nether Enter' },
    { key: 'time_bastion', label: 'Bastion' },
    { key: 'time_fortress', label: 'Fortress' },
    { key: 'time_first_portal', label: 'First Portal' },
    { key: 'time_second_portal', label: 'Second Portal' },
    { key: 'time_stronghold', label: 'Stronghold' },
    { key: 'time_end', label: 'End Enter' },
    { key: 'igt', label: 'IGT (Finish)' },
  ];

  tbody.innerHTML = splitFields.map(f => {
    const runTime = parseTime(run[f.key]);
    const splitStat = stats.splitStats.find(s => s.key === f.key);
    // For IGT row, compute from igts
    const best = f.key === 'igt' ? stats.bestIGT : (splitStat ? splitStat.best : null);
    const avg = f.key === 'igt' ? stats.avgIGT : (splitStat ? splitStat.avg : null);
    const med = f.key === 'igt' ? stats.medianIGT : (splitStat ? splitStat.median : null);

    const vsBest = formatDiff(runTime, best);
    const vsAvg = formatDiff(runTime, avg);

    return `
      <tr>
        <td class="split-name">${f.label}</td>
        <td style="font-weight:600;">${formatTime(runTime)}</td>
        <td class="best-val">${formatTime(best)}</td>
        <td>${formatTime(avg)}</td>
        <td>${formatTime(med)}</td>
        <td class="${vsBest.cls}" style="font-weight:600;">${vsBest.text}</td>
        <td class="${vsAvg.cls}" style="font-weight:600;">${vsAvg.text}</td>
      </tr>
    `;
  }).join('');
}

function renderInspectorDetails(run) {
  const container = document.getElementById('inspector-details');
  const details = [
    { label: 'Bastion Type', value: run.bastion_type },
    { label: 'Enter Type', value: run.enter_type },
    { label: 'Iron Source', value: run.iron_source },
    { label: 'Gold Source', value: run.gold_source },
    { label: 'End Fight', value: run.end_fight_type },
    { label: 'Gold Dropped', value: run.gold_dropped },
    { label: 'Blaze Rods', value: run.blaze_rods },
    { label: 'Blazes Killed', value: run.blazes_killed },
    { label: 'Eyes Used', value: run.eyes_used },
    { label: 'Frame Eyes', value: run.frame_eyes },
    { label: 'Ender Pearls Used', value: run.ender_pearls_used },
    { label: 'Obsidian Placed', value: run.obsidian_placed },
    { label: 'Jumps', value: run.jumps },
    { label: 'Deaths', value: run.deaths_total },
    { label: 'Diamond Picks', value: run.diamond_picks_crafted },
    { label: 'Diamond Sword', value: run.diamond_sword_crafted },
    { label: 'Gravel Mined', value: run.gravel_mined },
    { label: 'Netherrack Mined', value: run.netherrack_mined },
    { label: 'Stone Mined', value: run.stone_mined },
    { label: 'Flint Picked Up', value: run.flint_picked_up },
  ];
  container.innerHTML = details.map(d => `
    <div class="inspector-kv">
      <span class="inspector-kv-label">${d.label}</span>
      <span class="inspector-kv-value">${d.value || '0'}</span>
    </div>
  `).join('');
}

function inspectorAvg(field) {
  const runs = window.__allRuns || [];
  const vals = runs.map(r => parseInt(r[field]) || 0);
  return vals.length ? average(vals) : 0;
}

function kvWithAvg(label, run, field) {
  const val = parseInt(run[field]) || 0;
  const avg = inspectorAvg(field);
  const diff = val - avg;
  const cls = Math.abs(diff) < 0.5 ? 'diff-neutral' : (diff > 0 ? 'diff-positive' : 'diff-negative');
  // For kills/resources, more isn't necessarily bad, keep neutral
  return `
    <div class="inspector-kv">
      <span class="inspector-kv-label">${label}</span>
      <span class="inspector-kv-value">${val} <span style="font-size:0.7rem;font-weight:400;color:var(--text-muted);">(avg ${avg.toFixed(1)})</span></span>
    </div>
  `;
}

function renderInspectorCombat(run, stats) {
  const container = document.getElementById('inspector-combat');
  const fields = [
    ['Blazes Killed', 'blazes_killed'],
    ['Blaze Rods', 'blaze_rods'],
    ['Gold Dropped', 'gold_dropped'],
    ['Eyes Used', 'eyes_used'],
    ['Pearls Used', 'ender_pearls_used'],
    ['Obsidian Placed', 'obsidian_placed'],
    ['Netherrack Mined', 'netherrack_mined'],
    ['Stone Mined', 'stone_mined'],
    ['Gravel Mined', 'gravel_mined'],
    ['Jumps', 'jumps'],
  ];
  container.innerHTML = fields.map(([label, field]) => kvWithAvg(label, run, field)).join('');
}

function renderInspectorFoodTravel(run, stats) {
  const container = document.getElementById('inspector-food-travel');
  const foodFields = [
    ['Bread', 'eaten_bread'],
    ['Cooked Porkchop', 'eaten_cooked_porkchop'],
    ['Cooked Beef', 'eaten_cooked_beef'],
    ['Cooked Salmon', 'eaten_cooked_salmon'],
    ['Cooked Mutton', 'eaten_cooked_mutton'],
    ['Rotten Flesh', 'eaten_rotten_flesh'],
    ['Golden Carrot', 'eaten_golden_carrot'],
    ['Golden Apple', 'eaten_golden_apple'],
  ];
  const travelFields = [
    ['Sprint', 'travel_sprint'],
    ['Boat', 'travel_boat'],
    ['Swim', 'travel_swim'],
    ['Walk', 'travel_walk'],
  ];

  const foodHtml = foodFields
    .filter(([, field]) => parseInt(run[field]) > 0)
    .map(([label, field]) => kvWithAvg(label, run, field)).join('');
  const travelHtml = travelFields
    .map(([label, field]) => kvWithAvg(label + ' (blocks)', run, field)).join('');

  container.innerHTML = (foodHtml || '<div class="inspector-kv"><span class="inspector-kv-label">No food eaten</span><span></span></div>') + travelHtml;
}

function renderInspectorNotes(run) {
  const container = document.getElementById('inspector-notes');
  if (run.notes && run.notes.trim()) {
    container.style.display = 'block';
    container.innerHTML = `
      <div class="inspector-notes-title">Run Notes</div>
      <div class="inspector-notes-text">${run.notes}</div>
    `;
  } else {
    container.style.display = 'none';
  }
}

function renderInspectorChart(run, stats) {
  const splitFields = [
    { key: 'time_wood', label: 'Wood' },
    { key: 'time_iron_pick', label: 'Iron Pick' },
    { key: 'time_nether', label: 'Nether' },
    { key: 'time_bastion', label: 'Bastion' },
    { key: 'time_fortress', label: 'Fortress' },
    { key: 'time_first_portal', label: '1st Portal' },
    { key: 'time_stronghold', label: 'Stronghold' },
    { key: 'time_end', label: 'End' },
    { key: 'igt', label: 'IGT' },
  ];

  const runTimes = splitFields.map(f => parseTime(run[f.key]));
  const avgTimes = splitFields.map(f => {
    if (f.key === 'igt') return stats.avgIGT;
    const s = stats.splitStats.find(ss => ss.key === f.key);
    return s ? s.avg : null;
  });
  const bestTimes = splitFields.map(f => {
    if (f.key === 'igt') return stats.bestIGT;
    const s = stats.splitStats.find(ss => ss.key === f.key);
    return s ? s.best : null;
  });

  const canvas = document.getElementById('chart-inspector');
  if (inspectorChart) {
    inspectorChart.destroy();
    inspectorChart = null;
  }

  inspectorChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: splitFields.map(f => f.label),
      datasets: [
        {
          label: 'This Run',
          data: runTimes,
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          borderWidth: 2.5,
          pointRadius: 5,
          pointBackgroundColor: '#8b5cf6',
          pointBorderColor: '#8b5cf6',
          pointHoverRadius: 7,
          fill: false,
          tension: 0.3,
        },
        {
          label: 'Average',
          data: avgTimes,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2.5,
          pointRadius: 5,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#3b82f6',
          pointHoverRadius: 7,
          fill: false,
          tension: 0.3,
        },
        {
          label: 'Best',
          data: bestTimes,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2.5,
          pointRadius: 5,
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#10b981',
          pointHoverRadius: 7,
          fill: false,
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2.5,
      scales: {
        y: {
          title: { display: true, text: 'Time', color: '#94a3b8' },
          ticks: { callback: v => formatTime(v) },
          grid: { color: 'rgba(255,255,255,0.04)' },
        },
        x: {
          grid: { display: false },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${formatTime(ctx.raw)}`,
          },
        },
        legend: { position: 'top' },
      },
    },
  });
}

// ============================================================
// MAIN INITIALIZATION
// ============================================================

async function main() {
  initLoadingScreen();

  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    const data = await response.json();

    if (!data.runs || !data.runs.length) {
      throw new Error('No run data received');
    }

    const stats = processData(data.runs);
    window.__allRuns = stats.runs;

    // Setup Chart.js
    setupChartDefaults();

    // Render all sections
    renderProgress(stats);
    renderKeyMetrics(stats);
    renderHeaderMeta(stats);
    renderSplitsTable(stats);
    renderPerformanceChart(stats);
    window.__scatterStats = stats;
    renderStackedChart(stats, 'bastion_type');
    renderDistributionChart(stats);

    // Strategy charts
    renderDoughnutChart('chart-bastion', stats.bastionTypes);
    renderDoughnutChart('chart-enter', stats.enterTypes);
    renderDoughnutChart('chart-iron', stats.ironSources);
    renderDoughnutChart('chart-end-fight', stats.endFightTypes);

    // Biome chart
    renderBiomeChart(stats);

    // Combat & food charts
    renderBarChart('chart-kills', stats.killTotals, 'Total Kills', 'rgba(239, 68, 68, 0.6)');
    renderBarChart('chart-food', stats.foodTotals, 'Total Consumed', 'rgba(245, 158, 11, 0.6)');

    // Travel chart
    renderTravelChart(stats);

    // Seed map
    renderSeedGrid(stats.runs);

    // Recent runs
    renderRecentRuns(stats.runs);

    // Run inspector
    initInspector(stats);

    // Show main content
    document.getElementById('main-content').classList.remove('hidden');
    hideLoadingScreen();

  } catch (error) {
    console.error('Failed to load data:', error);
    document.getElementById('main-content').classList.remove('hidden');
    document.getElementById('main-content').innerHTML = `
      <div class="error-container">
        <h2>Failed to Load Data</h2>
        <p>${error.message}. The API might be slow or temporarily unavailable. Please try refreshing the page.</p>
        <button class="btn btn-primary" onclick="location.reload()">Retry</button>
      </div>
    `;
    hideLoadingScreen();
  }
}

// Start the app
document.addEventListener('DOMContentLoaded', main);
