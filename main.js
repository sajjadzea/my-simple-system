

  // --- یال‌ها ---

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
  d.fx = d.x;
  d.fy = d.y;
}
function dragged(event, d) {
  d.fx = event.x;
  d.fy = event.y;
}
function dragended(event, d) {
  if (!event.active) {
    d.fx = null;
    d.fy = null;
  }
}

// نمایش اطلاعات گره در پنل کناری
function showNodeInfo(node) {
  const panel = document.getElementById('panel-content');
  let info = `<h2 style="color:#4834d4;font-size:19.5px;margin-bottom:8px">${node.label}</h2>`;
  if(node.description) info += `<p style="margin:0 0 10px 0;color:#333">${node.description}</p>`;
  // منابع هر گره (در صورت داشتن references)
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
