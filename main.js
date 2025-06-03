// main.js - نسخه اصلاح شده مطابق با نیاز شما
// فرض بر این است که data.json بارگذاری می‌شود (مثلاً با fetch)

const layerColors = {
  political: '#b388ff',
  economic: '#ffd54f',
  environment: '#4dd0e1',
  social: '#e57373'
};

// بارگذاری داده‌ها از data.json
async function loadData() {
  const response = await fetch('data.json');
  return await response.json();
}

let selectedLayer = 'all';
let nodes = [];
let links = [];

function filterNodes(nodes, layer) {
  if(layer === 'all') return nodes;
  // اگر لایه انتخابی است فقط نودهای همان لایه را نمایش بده
  return nodes.filter(n => n.layer === layer);
}
function filterLinks(links, layer) {
  if(layer === 'all') return links;
  // نمایش یال‌هایی که مبدا یا مقصدشان به نود همان لایه تعلق دارد
  return links.filter(l => {
    const s = nodes.find(n => n.id === l.source || n.id === l.source.id);
    return s && s.layer === layer;
  });
}

function drawGraph() {
  d3.select('#diagram').selectAll('*').remove();
  const width = 1100, height = 700;
  const svg = d3.select('#diagram')
    .attr('width', width)
    .attr('height', height);

  const filteredNodes = filterNodes(nodes, selectedLayer);
  const filteredLinks = filterLinks(links, selectedLayer);

  // Force simulation
  const simulation = d3.forceSimulation(filteredNodes)
    .force('link', d3.forceLink(filteredLinks).id(d => d.id).distance(220))
    .force('charge', d3.forceManyBody().strength(-630))
    .force('center', d3.forceCenter(width / 2, height / 2));

  // یال‌ها
  const link = svg.append('g')
    .selectAll('line')
    .data(filteredLinks)
    .enter().append('line')
    .attr('class', d => 'link ' + (d.type === '+' ? 'positive' : 'negative'))
    .attr('stroke', d => {
      // رنگ براساس لایه یا نوع
      if(d.type === '+') return '#1aaf5d';
      if(d.type === '-') return '#e14646';
      return '#888';
    })
    .attr('stroke-dasharray', d => d.type === '-' ? '8 5' : null)
    .attr('stroke-width', 3)
    .on('click', (event, d) => showLinkInfo(d));

  // گره‌ها
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
    .attr('fill', '#f7f7f7')
    .attr('stroke', d => layerColors[d.layer] || '#888')
    .attr('stroke-width', 3.2)
    .on('click', (event, d) => showNodeInfo(d));
  node.append('text')
    .attr('class', 'label')
    .attr('text-anchor', 'middle')
    .attr('dy', '.35em')
    .style('font-size', '15.5px')
    .style('font-weight', 600)
    .style('fill', '#20406a')
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
  let info = `<h2 style="color:#20406a;font-size:19px">${node.label}</h2>`;
  if(node.description) info += `<p>${node.description}</p>`;
  // نمایش منابع (در آینده اگر آرایه refs داشتی اضافه کن)
  panel.innerHTML = info;
  document.getElementById('info-panel').style.display = 'block';
}
// نمایش اطلاعات یال با رفرنس و URL
function showLinkInfo(link) {
  const panel = document.getElementById('panel-content');
  let info = `<h3 style="color:#444">${link.label || ''}</h3>`;
  if(link.references && link.references.length) {
    info += '<ul>';
    link.references.forEach(ref => {
      info += `<li style='margin-bottom:10px'><b>${ref.title}</b><br>` +
        `<a href='${ref.url}' target='_blank'>${ref.url}</a><br>` +
        `<span style='font-size:13px;color:#666'>${ref.why}</span></li>`;
    });
    info += '</ul>';
  }
  panel.innerHTML = info;
  document.getElementById('info-panel').style.display = 'block';
}

// مدیریت انتخاب لایه از منو
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

// توابع کمک: تعیین لایه گره
function findLayer(node) {
  // در صورت داشتن فیلد لایه واقعی پروژه، اینجا نگه دار
  if(node.layer) return node.layer;
  // نمونه: تشخیص از روی لیبل یا منطق پروژه
  if(node.label && node.label.match(/سیاسی|نماینده|مجلس|تصمیم/)) return 'political';
  if(node.label && node.label.match(/اقتصاد|هزینه|تقاضا/)) return 'economic';
  if(node.label && node.label.match(/محیط|زیست|جریان|تالاب|آب|بارش|اکوسیستم/)) return 'environment';
  if(node.label && node.label.match(/اعتراض|اجتماعی|ذینفع|شغل|محلی/)) return 'social';
  return 'environment';
}

// کلیک خارج از گراف، بستن پنل اطلاعات
window.addEventListener('click', (e) => {
  if(e.target.closest('#diagram') || e.target.closest('#info-panel')) return;
  document.getElementById('info-panel').style.display = 'none';
});
