// main.js نسخه ویرایش‌شده: گراف با Drag & Drop انیمیشنی و ظاهر مدرن

fetch('data.json')
  .then(response => response.json())
  .then(graph => {
    // ابعاد SVG
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

    // رنگ یال‌ها بر اساس نوع
    function edgeColor(type) {
      return type === '+' ? '#4ad991' : '#e85454';
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
      .attr('stroke-dasharray', d => d.type === '+' ? '' : '6,6');

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

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // تابع Drag با افکت سایه و انیمیشن
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
