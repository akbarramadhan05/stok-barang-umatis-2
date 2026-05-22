/**
 * Stokbar Umatis — Simple bar chart renderer
 */

function renderInOutChart(containerId, days = 7) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const { labels, dataIn, dataOut } = getChartData(days);
  const maxVal = Math.max(...dataIn, ...dataOut, 1);

  let barsHtml = "";
  labels.forEach((label, i) => {
    const hIn = Math.max((dataIn[i] / maxVal) * 140, 4);
    const hOut = Math.max((dataOut[i] / maxVal) * 140, 4);
    barsHtml += `
      <div class="chart-bar-group">
        <div class="chart-bar-pair">
          <div class="chart-bar in" style="height:${hIn}px" title="Masuk: ${dataIn[i].toFixed(1)}"></div>
          <div class="chart-bar out" style="height:${hOut}px" title="Keluar: ${dataOut[i].toFixed(1)}"></div>
        </div>
        <span class="chart-label">${label}</span>
      </div>
    `;
  });

  container.innerHTML = `
    <div class="chart-bars">${barsHtml}</div>
    <div class="chart-legend" style="margin-top:0.5rem">
      <span><span class="legend-dot in"></span> Barang Masuk</span>
      <span><span class="legend-dot out"></span> Barang Keluar</span>
    </div>
  `;
}
