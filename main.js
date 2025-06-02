// main.js - D3.js System Diagram with Kumu Data (نمونه قابل استفاده در گیت‌هاب)

d3.json("data.json").then(function(graph) {
  const svg = d3.select("#diagram"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

  // تعریف marker برای فلش سر یال
  svg.append("defs").selectAll("marker")
    .data(["positive", "negative"])
    .enter().append("marker")
    .attr("id", d => "arrow-"+d)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 34)
    .attr("refY", 0)
    .attr("markerWidth", 8)
    .attr("markerHeight", 8)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    .attr("fill", d => d === "positive" ? "#1aaf5d" : "#e14646");

  // شبیه‌سازی نیرو
  const simulation = d3.forceSimulation(graph.nodes)
    .force("link", d3.forceLink(graph.links).id(d => d.id).distance(200))
    .force("charge", d3.forceManyBody().strength(-700))
    .force("center", d3.forceCenter(width/2, height/2));

  // رسم یال‌ها
  const link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter().append("line")
    .attr("class", d => "link " + (d.type === "+" ? "positive" : "negative"))
    .attr("stroke", d => d.type === "+" ? "#1aaf5d" : "#e14646")
    .attr("stroke-width", 3)
    .attr("stroke-dasharray", d => d.type === "-" ? "8 5" : null)
    .attr("marker-end", d => d.type === "+" ? "url(#arrow-positive)" : "url(#arrow-negative)");

  // رسم گره‌ها
  const node = svg.append("g")
    .attr("class", "nodes")
    .selectAll("g")
    .data(graph.nodes)
    .enter().append("g")
    .attr("class", "node")
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

  node.append("circle")
    .attr("r", 37)
    .attr("fill", "#f7f7f7")
    .attr("stroke", "#777")
    .attr("stroke-width", 2.3);

  node.append("text")
    .attr("class", "label")
    .attr("text-anchor", "middle")
    .attr("y", 5)
    .text(d => d.label);

  // Tooltip
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "#fff")
    .style("border", "1.5px solid #bbb")
    .style("padding", "8px 15px")
    .style("border-radius", "7px")
    .style("font-size", "14px")
    .style("box-shadow", "0 4px 14px #ccc")
    .style("pointer-events", "none")
    .style("visibility", "hidden");

  node.on("mouseover", function(event, d) {
    tooltip.style("visibility", "visible")
      .html(
        `<div><strong>${d.label}</strong></div>` +
        (d.description ? `<div style='margin-top:6px;'>${d.description}</div>` : "") +
        (d.source ? `<div style='margin-top:8px;font-size:12px;color:#666;'>${d.source}</div>` : "")
      );
  }).on("mousemove", function(event) {
    tooltip.style("top", (event.pageY+14)+"px")
           .style("left", (event.pageX-40)+"px");
  }).on("mouseout", function() {
    tooltip.style("visibility", "hidden");
  });

  simulation.on("tick", () => {
    link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

    node
      .attr("transform", d => `translate(${d.x},${d.y})`);
  });

  // Drag functions
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }
  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
});
