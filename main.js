// main.js - نسخه نهایی ویژه پرزنت مدیریتی با فلش، رنگ، پنل اطلاعات و رفرنس

const layerColors = {
  political: '#7a6fff',
  economic: '#ffd54f',
  environment: '#48b5ae',
  social: '#ef798a'
};

// بارگذاری داده‌ها از data.json
async function loadData() {
  try {
    const response = await fetch('data.json');
    return await response.json();
  } catch (err) {
    console.error('Failed to load data.json', err);
    return { nodes: [], links: [] };
  }
}

let selectedLayer = 'all';
let nodes = [];
let links = [];

function findLayer(node) {
  if(node.layer) return node.layer;
  if(node.label && node.label.match(/سیاسی|نماینده|مجلس|تصمیم/)) return 'political';
  if(node.label && node.label.match(/اقتصاد|هزینه|تقاضا/)) return 'economic';
  if(node.label && node.label.match(/محیط|زیست|جریان|تالاب|آب|بارش|اکوسیستم/)) return 'environment';
  if(node.label && node.label.match(/اعتراض|اجتماعی|ذینفع|شغل|محلی/)) return 'social';
  return 'environment';
}

function filterNodes(nodes, layer) {
  if(layer === 'all') return nodes;
  return nodes.filter(n => n.layer === layer);
}
function filterLinks(links, layer) {
  if(layer === 'all') return links;
  // یال‌هایی که هر دو سرشان در لایه انتخاب‌شده باشد
  const layerIds = new Set(
    nodes.filter(n => n.layer === layer).map(n => n.id)
  );
  return links.filter(l => {
    const src = l.source.id || l.source;
    const tgt = l.target.id || l.target;
    return layerIds.has(src) && layerIds.has(tgt);
  });
}

function drawGraph() {
  d3.select('#diagram').selectAll('*').remove();
  const width = 1100, height = 700;
  const svg = d3.select('#diagram')
    .attr('width', width)
    .attr('height', height);

  // --- تعریف فلش یال‌ها ---
  svg.append('defs').html(`
    <marker id="arrow-green" viewBox="0 -5 10 10" refX="36" refY="0" markerWidth="8" markerHeight="8" orient="auto" class="arrow">
      <path d="M0,-5L10,0L0,5"></path>
    </marker>
    <marker id="arrow-red" viewBox="0 -5 10 10" refX="36" refY="0" markerWidth="8" markerHeight="8" orient="auto" class="arrow-red">
      <path d="M0,-5L10,0L0,5"></path>
    </marker>
  `);

  const filteredNodes = filterNodes(nodes, selectedLayer);
  const filteredLinks = filterLinks(links, selectedLayer);
  // d3.forceLink mutates link objects by replacing source/target with node objects.
  // When redrawing the graph we want clean links using node ids so we clone them
  // before passing to the simulation.
  const simLinks = filteredLinks.map(l => ({
    ...l,
    source: l.source.id || l.source,
    target: l.target.id || l.target
  }));

  const simulation = d3.forceSimulation(filteredNodes)
    .force('link', d3.forceLink(simLinks).id(d => d.id).distance(220))
    .force('charge', d3.forceManyBody().strength(-630))
    .force('center', d3.forceCenter(width / 2, height / 2));

  // --- یال‌ها ---
  const link = svg.append('g')
    .selectAll('line')
    .data(simLinks)
    .enter().append('line')
    .attr('class', d => 'link ' + (d.type === '+' ? 'positive' : 'negative'))
    .attr('stroke', d => d.type === '+' ? '#1aaf5d' : (d.type === '-' ? '#e14646' : '#888'))
    .attr('stroke-dasharray', d => d.type === '-' ? '8 5' : null)
    .attr('stroke-width', 3)
    .attr('marker-end', d => d.type === '+' ? 'url(#arrow-green)' : 'url(#arrow-red)')
    .on('click', (event, d) => {
      event.stopPropagation();
      showLinkInfo(d);
    });

  // --- گره‌ها ---
  const node = svg.append('g')
    .selectAll('g')
    .data(filteredNodes)
    .enter().append('g')
    .attr('class', 'node')
    .call(d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended));
  node.append('circle')
    .attr('r', 38)
    .attr('fill', '#fff')
    .attr('stroke', d => layerColors[d.layer] || '#aaa')
    .attr('stroke-width', 4)
    .attr('class', d => d.layer)
    .on('click', (event, d) => {
      event.stopPropagation();
      node.selectAll('circle').classed('selected', false);
      d3.select(event.currentTarget).classed('selected', true);
      showNodeInfo(d);
    });
  node.append('text')
    .attr('class', 'label')
    .attr('text-anchor', 'middle')
    .attr('dy', '.35em')
    .style('font-size', '15.7px')
    .style('font-weight', 700)
    .style('fill', '#1a2846')
    .text(d => d.label);

  simulation.on('tick', () => {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);
    node
      .attr('transform', d => `translate(${d.x},${d.y})`);
  });
}

function dragstarted(event, d) {
  if (!event.active) d.fx = d.x, d.fy = d.y;
}
function dragged(event, d) {
  d.fx = event.x;
  d.fy = event.y;
}
function dragended(event, d) {
  if (!event.active) d.fx = null, d.fy = null;
}

// نمایش اطلاعات گره در پنل کناری
function showNodeInfo(node) {
  const panel = document.getElementById('panel-content');
  let info = `<h2 style="color:#4834d4;font-size:19.5px;margin-bottom:8px">${node.label}</h2>`;
  if(node.description) info += `<p style="margin:0 0 10px 0;color:#333">${node.description}</p>`;
  // منابع هر گره (در صورت داشتن refs)
  if(node.references && node.references.length) {
    info += '<ul style="margin:12px 0 0 0;padding-right:18px">';
    node.references.forEach(ref => {
      info += `<li style='margin-bottom:13px'><b>${ref.title}</b><br>` +
        (ref.url ? `<a href='${ref.url}' target='_blank'>${ref.url}</a><br>` : '') +
        `<span style='font-size:13px;color:#666'>${ref.why||''}</span></li>`;
    });
    info += '</ul>';
  }
  panel.innerHTML = info;
  document.getElementById('info-panel').style.boxShadow = '0 6px 32px #b8bedc28';
}
// نمایش اطلاعات یال با رفرنس و URL
function showLinkInfo(link) {
  const panel = document.getElementById('panel-content');
  let info = `<h3 style="color:#e67e22;font-size:17.5px">ارتباط</h3>`;
  if(link.label) info += `<div style="margin-bottom:6px"><b>${link.label}</b></div>`;
  if(link.references && link.references.length) {
    info += '<ul style="margin:14px 0 0 0;padding-right:18px">';
    link.references.forEach(ref => {
      info += `<li style='margin-bottom:13px'><b>${ref.title}</b><br>` +
        (ref.url ? `<a href='${ref.url}' target='_blank'>${ref.url}</a><br>` : '') +
        `<span style='font-size:13px;color:#666'>${ref.why||''}</span></li>`;
    });
    info += '</ul>';
  }
  panel.innerHTML = info;
  document.getElementById('info-panel').style.boxShadow = '0 8px 28px #ffd49c44';
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', async () => {
    const data = await loadData();
    nodes = data.nodes.map(n => Object.assign({}, n, { layer: findLayer(n) }));
    links = data.links;
    drawGraph();

  const layerBtns = document.querySelectorAll('#layer-menu button');
  layerBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      layerBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      selectedLayer = this.dataset.layer;
      drawGraph();
    });
  });
  });


// بستن پنل با کلیک خارج از گراف یا پنل
  window.addEventListener('click', (e) => {
    if(e.target.closest('#diagram') || e.target.closest('#info-panel')) return;
    document.getElementById('info-panel').style.boxShadow = '0 4px 16px #ffd59c30';
    document.getElementById('panel-content').innerHTML = 'برای مشاهده توضیحات و رفرنس، روی هر گره یا یال کلیک کنید.';
  });
}


// Make findLayer available when running under Node (e.g. in tests)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { findLayer };
}
