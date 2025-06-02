d3.json("data.json").then(function(graph) {
  const svg = d3.select("#diagram"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

  // Simulation
  const simulation = d3.forceSimulation(graph.nodes)
      .force("link", d3.forceLink(graph.links).id(d => d.id).distance(200))
      .force("charge", d3.forceManyBody().strength(-500))
      .force("center", d3.forceCenter(width / 2, height / 2));

  // Links
  const link = svg.append("g")
      .selectAll("line")
      .data(graph.links)
      .enter().append("line")
      .attr("class", d => "link " + d.type);

  // Nodes
  const node = svg.append("g")
      .selectAll("g")
      .data(graph.nodes)
      .enter().append("g")
      .attr("class", "node");

  node.append("circle")
      .attr("r", 37);

  node.append("text")
      .attr("class", "label")
      .attr("text-anchor", "middle")
      .attr("y", 5)
      .text(d => d.label);

  // Tick update
  simulation.on("tick", () => {
    link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

    node
      .attr("transform", d => `translate(${d.x},${d.y})`);
  });
});
