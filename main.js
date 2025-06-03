// فرض بر این است که داده‌ها به این صورت هستند:
// هر نود یک کلید 'layer' دارد (مثلاً: 'political', 'economic', 'environment', 'social')
// هر یال هم یک کلید 'layer' دارد یا می‌تواند با لایه گره مبدأ/مقصد تعیین شود

// رنگ لایه‌ها باید از index.html دریافت شود (layerColors)
// اگر در این فایل نیست، اینجا هم تعریف می‌شود:
const layerColors = {
  political: '#b388ff',
  economic: '#ffd54f',
  environment: '#4dd0e1',
  social: '#e57373'
};

// داده نمونه (در پروژه اصلی جایگزین کن)
const nodes = [
  { id: 1, label: 'برداشت آب', layer: 'environment' },
  { id: 2, label: 'تصمیم نماینده', layer: 'political' },
  { id: 3, label: 'افزایش تقاضا', layer: 'economic' },
  { id: 4, label: 'واکنش اجتماعی', layer: 'social' }
];
const links = [
  { source: 1, target: 2, type: 'positive', layer: 'environment' },
  { source: 2, target: 3, type: 'positive', layer: 'political' },
  { source: 3, target: 4, type: 'negative', layer: 'economic' }
];

// مقدار انتخاب شده لایه (all یا نام لایه)
let selectedLayer = 'all';

// توابع فیلتر بر اساس لایه
function filterNodes(nodes, layer) {
  if(layer === 'all') return nodes;
  return nodes.filter(n => n.layer === layer);
}
function filterLinks(links, layer) {
  if(layer === 'all') return links;
  return links.filter(l => l.layer === layer);
}

// رسم گراف D3 (ساده، بسته به پروژه اصلی خود تغییر بده)
function drawGraph() {
  d3.select('#diagram').selectAll('*').remove();

  const filteredNodes = filterNodes(nodes, selectedLayer);
  const filteredLinks = filterLinks(links, selectedLayer);

  const width = 1100, height = 700;
  const svg = d3.select('#diagram');

  const simulation = d3.forceSimulation(filteredNodes)
    .force('link', d3.forceLink(filteredLinks).id(d => d.id).distance(220))
    .force('charge', d3.forceManyBody().strength(-650))
    .force('center', d3.forceCenter(width / 2, height / 2));

  // رسم یال‌ها (لینک)
  const link = svg.append('g')
    .selectAll('line')
    .data(filteredLinks)
    .enter().append('line')
    .attr('class', d => 'link ' + d.type)
    .attr('stroke', d => layerColors[d.layer] || '#bbb')
    .attr('stroke-width', 3);

  // رسم نودها
  const node = svg.append('g')
    .selectAll('g')
    .data(filteredNodes)
    .enter().append('g')
    .attr('class', 'node');
  node.append('circle')
    .attr('r', 38)
    .attr('fill', '#f7f7f7')
    .attr('stroke', d => layerColors[d.layer] || '#888')
    .attr('stroke-width', 3.2);

  node.append('text')
    .attr('class', 'label')
    .attr('text-anchor', 'middle')
    .attr('dy', '.35em')
    .style('font-size', '16px')
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

drawGraph();

// مدیریت انتخاب لایه از منو
const layerBtns = document.querySelectorAll('#layer-menu button');
layerBtns.forEach(btn => {
  btn.addEventListener('click', function() {
    layerBtns.forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    selectedLayer = this.dataset.layer;
    drawGraph();
  });
});
