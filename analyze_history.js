// Análisis estadístico de resultados EuroDreams
// Lee los datos desde la API local (que a su vez consulta Google Sheets)

const API_URL = 'http://localhost:3000/api/history';

async function main() {
  console.log('Obteniendo datos desde la API...');
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  const { draws, frequencies, gaps: apiGaps, dreamFrequencies, totalDraws } = await res.json();

  console.log(`Total sorteos analizados: ${totalDraws}\n`);

  // REGLA 1: SUMA
  const sums = draws.map(d => d.nums.reduce((a, b) => a + b, 0));
  const avgSum = sums.reduce((a, b) => a + b, 0) / sums.length;
  const minSum = Math.min(...sums);
  const maxSum = Math.max(...sums);
  const inRange = sums.filter(s => s >= 110 && s <= 136).length;
  const pctInRange = (inRange / sums.length * 100).toFixed(1);
  const sumRanges = {};
  sums.forEach(s => {
    const bucket = `${Math.floor(s / 10) * 10}-${Math.floor(s / 10) * 10 + 9}`;
    sumRanges[bucket] = (sumRanges[bucket] || 0) + 1;
  });
  const sortedSums = [...sums].sort((a, b) => a - b);
  const p10 = sortedSums[Math.floor(sums.length * 0.1)];
  const p25 = sortedSums[Math.floor(sums.length * 0.25)];
  const p50 = sortedSums[Math.floor(sums.length * 0.5)];
  const p75 = sortedSums[Math.floor(sums.length * 0.75)];
  const p90 = sortedSums[Math.floor(sums.length * 0.9)];

  console.log('=== REGLA 1: SUMA ===');
  console.log(`Media: ${avgSum.toFixed(1)} | Min: ${minSum} | Max: ${maxSum}`);
  console.log(`En rango [110-136]: ${inRange}/${sums.length} (${pctInRange}%)`);
  console.log('Distribucion:');
  Object.entries(sumRanges).sort().forEach(([k, v]) => {
    console.log(`  ${k}: ${v} (${(v / sums.length * 100).toFixed(1)}%)`);
  });
  console.log(`P10=${p10} P25=${p25} P50=${p50} P75=${p75} P90=${p90}`);

  // REGLA 2: PARIDAD
  const parityCounts = {};
  draws.forEach(d => {
    const evens = d.nums.filter(n => n % 2 === 0).length;
    const key = `${evens}P/${6 - evens}I`;
    parityCounts[key] = (parityCounts[key] || 0) + 1;
  });
  console.log('\n=== REGLA 2: PARIDAD ===');
  Object.entries(parityCounts).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => {
    console.log(`  ${k}: ${v} (${(v / draws.length * 100).toFixed(1)}%)`);
  });

  // REGLA 3: DÉCADAS
  const decadePatterns = {};
  draws.forEach(d => {
    const decades = [0, 0, 0, 0];
    d.nums.forEach(n => {
      if (n <= 10) decades[0]++;
      else if (n <= 20) decades[1]++;
      else if (n <= 30) decades[2]++;
      else decades[3]++;
    });
    const pattern = decades.sort((a, b) => b - a).join('-');
    decadePatterns[pattern] = (decadePatterns[pattern] || 0) + 1;
  });
  console.log('\n=== REGLA 3: DÉCADAS [1-10][11-20][21-30][31-40] ===');
  Object.entries(decadePatterns).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => {
    console.log(`  [${k}]: ${v} (${(v / draws.length * 100).toFixed(1)}%)`);
  });

  // REGLA 4: CONSECUTIVIDAD
  const consecCounts = {};
  draws.forEach(d => {
    let c = 0;
    for (let j = 0; j < 5; j++) if (d.nums[j + 1] === d.nums[j] + 1) c++;
    consecCounts[c] = (consecCounts[c] || 0) + 1;
  });
  console.log('\n=== REGLA 4: PAREJAS CONSECUTIVAS ===');
  Object.entries(consecCounts).sort((a, b) => a[0] - b[0]).forEach(([k, v]) => {
    console.log(`  ${k} pareja(s): ${v} (${(v / draws.length * 100).toFixed(1)}%)`);
  });

  // REGLA 5: TERMINACIONES
  const endingCounts = {};
  draws.forEach(d => {
    const unique = new Set(d.nums.map(n => n % 10)).size;
    endingCounts[unique] = (endingCounts[unique] || 0) + 1;
  });
  console.log('\n=== REGLA 5: TERMINACIONES ÚNICAS ===');
  Object.entries(endingCounts).sort((a, b) => a[0] - b[0]).forEach(([k, v]) => {
    console.log(`  ${k} terminaciones: ${v} (${(v / draws.length * 100).toFixed(1)}%)`);
  });

  // REGLA 6: COLUMNAS
  const colPatterns = {};
  draws.forEach(d => {
    const colCounts = {};
    d.nums.forEach(n => {
      const c = (n - 1) % 5 + 1;
      colCounts[c] = (colCounts[c] || 0) + 1;
    });
    const pattern = Object.values(colCounts).sort().join('-');
    colPatterns[pattern] = (colPatterns[pattern] || 0) + 1;
  });
  console.log('\n=== REGLA 6: PATRÓN COLUMNAS ===');
  Object.entries(colPatterns).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => {
    console.log(`  [${k}]: ${v} (${(v / draws.length * 100).toFixed(1)}%)`);
  });

  // REGLA 7: FILAS
  const rowCounts = {};
  draws.forEach(d => {
    const unique = new Set(d.nums.map(n => Math.floor((n - 1) / 5) + 1)).size;
    rowCounts[unique] = (rowCounts[unique] || 0) + 1;
  });
  console.log('\n=== REGLA 7: FILAS DISTINTAS ===');
  Object.entries(rowCounts).sort((a, b) => a[0] - b[0]).forEach(([k, v]) => {
    console.log(`  ${k} filas: ${v} (${(v / draws.length * 100).toFixed(1)}%)`);
  });

  // REGLA 8: GAPS ENTRE NÚMEROS
  const gapStats = { meanGaps: [], maxGaps: [] };
  draws.forEach(d => {
    const gps = [];
    for (let j = 0; j < 5; j++) gps.push(d.nums[j + 1] - d.nums[j]);
    gapStats.meanGaps.push(gps.reduce((a, b) => a + b, 0) / 5);
    gapStats.maxGaps.push(Math.max(...gps));
  });
  const avgMeanGap = gapStats.meanGaps.reduce((a, b) => a + b, 0) / gapStats.meanGaps.length;
  const avgMaxGap = gapStats.maxGaps.reduce((a, b) => a + b, 0) / gapStats.maxGaps.length;
  const idealGaps = draws.filter((_, i) => gapStats.meanGaps[i] >= 5 && gapStats.meanGaps[i] <= 10 && gapStats.maxGaps[i] <= 15).length;
  console.log('\n=== REGLA 8: GAPS ENTRE NÚMEROS ===');
  console.log(`Gap medio — Media: ${avgMeanGap.toFixed(2)} | Gap máximo — Media: ${avgMaxGap.toFixed(2)}`);
  console.log(`Ideal (mean 5-10, max ≤15): ${idealGaps}/${totalDraws} (${(idealGaps / totalDraws * 100).toFixed(1)}%)`);

  // REGLA 9: VECINOS EN GRID 8×5
  function areNeighbors(a, b) {
    const rA = Math.floor((a - 1) / 5), cA = (a - 1) % 5;
    const rB = Math.floor((b - 1) / 5), cB = (b - 1) % 5;
    return Math.abs(rA - rB) <= 1 && Math.abs(cA - cB) <= 1 && !(rA === rB && cA === cB);
  }
  const neighborCounts = {};
  draws.forEach(d => {
    let pairs = 0;
    for (let i = 0; i < 6; i++)
      for (let j = i + 1; j < 6; j++)
        if (areNeighbors(d.nums[i], d.nums[j])) pairs++;
    neighborCounts[pairs] = (neighborCounts[pairs] || 0) + 1;
  });
  console.log('\n=== REGLA 9: VECINOS GRID 8×5 ===');
  Object.entries(neighborCounts).sort((a, b) => a[0] - b[0]).forEach(([k, v]) => {
    console.log(`  ${k} parejas: ${v} (${(v / draws.length * 100).toFixed(1)}%)`);
  });

  // NÚMERO SUEÑO (desde API)
  console.log('\n=== NÚMERO SUEÑO ===');
  Object.entries(dreamFrequencies).sort((a, b) => a[0] - b[0]).forEach(([k, v]) => {
    console.log(`  Sueño ${k}: ${v} (${(v / totalDraws * 100).toFixed(1)}%)`);
  });

  // FRECUENCIA (desde API)
  const expectedFreq = (totalDraws * 6 / 40).toFixed(1);
  const freqArr = Object.entries(frequencies).map(([n, f]) => ({ n: Number(n), f })).sort((a, b) => b.f - a.f);
  console.log(`\n=== FRECUENCIA (media esperada: ${expectedFreq}) ===`);
  console.log('Top 10 calientes:');
  freqArr.slice(0, 10).forEach(({ n, f }) => console.log(`  N${String(n).padStart(2)}: ${f}`));
  console.log('Top 10 fríos:');
  freqArr.slice(-10).forEach(({ n, f }) => console.log(`  N${String(n).padStart(2)}: ${f}`));

  // GAPS / TEMPERATURA (desde API)
  const gapArr = Object.entries(apiGaps).map(([n, g]) => ({ n: Number(n), gap: g })).sort((a, b) => b.gap - a.gap);
  console.log('\n=== GAPS (sorteos desde última aparición) ===');
  console.log('Más fríos:');
  gapArr.slice(0, 10).forEach(({ n, gap }) => console.log(`  N${String(n).padStart(2)}: ${gap} sorteos`));
  console.log('Más calientes:');
  gapArr.slice(-10).forEach(({ n, gap }) => console.log(`  N${String(n).padStart(2)}: ${gap} sorteos`));

  // SCORE GLOBAL v4 (9 reglas ponderadas, max 42)
  // Pesos: Esencial(×3): Terminaciones, Filas, Décadas, Gaps
  //        Frecuente(×2): Consecutividad, Paridad, Columnas, Vecinos
  //        Variable(×1): Suma
  const scoreDist = {};
  draws.forEach(d => {
    let score = 0;
    const arr = d.nums;
    const sum = arr.reduce((a, b) => a + b, 0);
    if (sum >= 110 && sum <= 136) score += 2 * 1; else if (sum >= 100 && sum <= 145) score += 1 * 1;  // ×1
    const evens = arr.filter(n => n % 2 === 0).length;
    if (evens === 3) score += 2 * 2; else if (evens === 2 || evens === 4) score += 1 * 2;  // ×2
    const dec = [0, 0, 0, 0]; arr.forEach(n => { if (n <= 10) dec[0]++; else if (n <= 20) dec[1]++; else if (n <= 30) dec[2]++; else dec[3]++; });
    const dp = dec.sort((a, b) => b - a).join('-');
    if (dp === '2-2-1-1') score += 2 * 3; else if (['3-2-1-0', '3-1-1-1', '2-2-2-0'].includes(dp)) score += 1 * 3;  // ×3
    let con = 0; for (let j = 0; j < 5; j++) if (arr[j + 1] === arr[j] + 1) con++;
    if (con === 0) score += 2 * 2; else if (con === 1) score += 1 * 2;  // ×2
    const ue = new Set(arr.map(n => n % 10)).size;
    if (ue === 5) score += 2 * 3; else if (ue === 4 || ue === 6) score += 1 * 3;  // ×3
    const cc = {}; arr.forEach(n => { const c = (n - 1) % 5 + 1; cc[c] = (cc[c] || 0) + 1; });
    const cp = Object.values(cc).sort().join('-');
    if (cp === '1-1-2-2') score += 2 * 2; else if (cp === '1-2-3' || cp === '1-1-1-1-2') score += 1 * 2;  // ×2
    const ur = new Set(arr.map(n => Math.floor((n - 1) / 5) + 1)).size;
    if (ur === 5) score += 2 * 3; else if (ur === 4 || ur === 6) score += 1 * 3;  // ×3
    const gps = []; for (let j = 0; j < 5; j++) gps.push(arr[j + 1] - arr[j]);
    const mg = gps.reduce((a, b) => a + b, 0) / 5; const xg = Math.max(...gps);
    if (mg >= 5 && mg <= 10 && xg <= 15) score += 2 * 3; else if (mg >= 4 && mg <= 12 && xg <= 20) score += 1 * 3;  // ×3
    let np = 0;
    for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) if (areNeighbors(arr[i], arr[j])) np++;
    if (np <= 2) score += 2 * 2; else if (np === 3) score += 1 * 2;  // ×2
    scoreDist[score] = (scoreDist[score] || 0) + 1;
  });
  console.log('\n=== PUNTUACIÓN GLOBAL v4 (9 reglas ponderadas, max 42) ===');
  Object.entries(scoreDist).sort((a, b) => Number(a[0]) - Number(b[0])).forEach(([k, v]) => {
    console.log(`  ${k}/42: ${v} sorteos (${(v / totalDraws * 100).toFixed(1)}%)`);
  });
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  console.error('   Asegúrate de que el servidor está corriendo (npm run dev)');
  process.exit(1);
});
