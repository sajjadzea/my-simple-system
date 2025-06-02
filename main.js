// main.js نسخه ویرایش‌شده: گراف با Drag & Drop انیمیشنی و ظاهر مدرن + نمایش اطلاعات گره و یال و فلش روی یال‌ها

fetch('data.json')
  .then(response => response.json())
  .then(graph => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // SVG
    const svg = d3.select('body').append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('background', '#f7f8fc');

    // گرادیان زیبا برای دایره گره‌ها
    svg.append('defs').append('radialGradient')
      .attr('id', 'grad1')
      .attr('cx', '50%').attr('cy', '50%').attr('r', '60%')
      .selectAll('stop')
      .data([
        { offset: '0%', color: '#fff' },
        { offset: '100%', color: '#e0eeff' }
      ])
      .enter().append('stop')
      .attr('offset', d => d.offset)
      .attr('stop-color', d => d.color);

    // تعریف فلش یال
    svg.append('defs').selectAll('marker')
      .data(['arrowPlus','arrowMinus'])
      .enter().append('marker')
      .attr('id', d => d)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 33)
      .attr('refY', 0)
      .attr('markerWidth', 10)
      .attr('markerHeight', 10)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', d => d === 'arrowPlus' ? '#4ad991' : '#e85454');

    // رنگ یال‌ها بر اساس نوع
    function edgeColor(type) {
      return type === '+' ? '#4ad991' : '#e85454';
    }
    function edgeArrow(type) {
      return type === '+' ? 'url(#arrowPlus)' : 'url(#arrowMinus)';
    }

    // Force Simulation
    const simulation = d3.forceSimulation(graph.nodes)
      .force('link', d3.forceLink(graph.links).id(d => d.id).distance(180))
      .force('charge', d3.forceManyBody().strength(-650))
      .force('center', d3.forceCenter(width * 0.6, height / 2));

    // رسم یال‌ها
    const link = svg.append('g')
      .attr('stroke-width', 3)
      .selectAll('line')
      .data(graph.links)
      .enter().append('line')
      .attr('stroke', d => edgeColor(d.type))
      .attr('stroke-dasharray', d => d.type === '+' ? '' : '6,6')
      .attr('marker-end', d => edgeArrow(d.type));

    // رسم گره‌ها
    const node = svg.append('g')
      .selectAll('g.node')
      .data(graph.nodes)
      .enter().append('g')
      .attr('class', 'node')
      .call(drag(simulation));

    node.append('circle')
      .attr('r', 32)
      .attr('fill', 'url(#grad1)')
      .attr('stroke', '#3f51b5')
      .attr('stroke-width', 1.5)
      .style('filter', 'drop-shadow(0 4px 8px #b9d0f7c0)');

    node.append('text')
      .text(d => d.label)
      .attr('text-anchor', 'middle')
      .attr('dy', 5)
      .style('font-family', 'Vazirmatn, IRANSans, Tahoma')
      .style('font-size', '14px')
      .style('fill', '#222');

    // نمایش توضیحات و لینک منبع روی هاور گره/یال
    const infoBox = d3.select('body').append('div')
      .attr('id', 'info-box')
      .style('position', 'absolute')
      .style('background', '#fff')
      .style('border-radius', '15px')
      .style('box-shadow', '0 6px 24px #b2b6c699')
      .style('padding', '17px 18px 13px 18px')
      .style('font-size', '14px')
      .style('color', '#17416a')
      .style('font-family', 'Vazirmatn, IRANSans, Tahoma')
      .style('display', 'none')
      .style('z-index', '30');

    node.on('mouseover', (event, d) => {
      infoBox.html(`
        <b>گره: ${d.label}</b><br>
        <div style='margin-top:7px;color:#2c2c2c;'>${d.description || ''}</div>
        ${d.source ? `<div style='margin-top:8px;font-size:13px;'><a href='${d.source}' target='_blank'>منبع/رفرنس</a></div>` : ''}
      `)
        .style('left', (event.pageX + 20) + 'px')
        .style('top', (event.pageY - 30) + 'px')
        .style('display', 'block');
    });
    node.on('mouseout', () => {
      infoBox.style('display', 'none');
    });

    link.on('mouseover', (event, d) => {
      infoBox.html(`
        <b>یال: ${d.source.label} → ${d.target.label}</b><br>
        <div style='margin-top:7px;color:#2c2c2c;'>${d.label || ''}</div>
        ${d.ref ? `<div style='margin-top:8px;font-size:13px;'><a href='${d.ref}' target='_blank'>منبع/رفرنس</a></div>` : ''}
      `)
        .style('left', (event.pageX + 20) + 'px')
        .style('top', (event.pageY - 30) + 'px')
        .style('display', 'block');
    });
    link.on('mouseout', () => {
      infoBox.style('display', 'none');
    });

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
      node
        .attr('transform', d => `translate(${d.x},${d.y})`);
    });

    function drag(simulation) {
      function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
        d3.select(this).select('circle')
          .transition()
          .duration(180)
          .attr('r', 38)
          .style('filter', 'drop-shadow(0 8px 20px #8bb7f6c8)');
      }
      function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      }
      function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
        d3.select(this).select('circle')
          .transition()
          .duration(180)
          .attr('r', 32)
          .style('filter', 'drop-shadow(0 4px 8px #b9d0f7c0)');
      }
      return d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    }
  });
