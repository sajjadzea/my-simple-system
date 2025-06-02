d3.json("data.json").then(function(graph) {
  const svg = d3.select("#diagram"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

  // Zoom & Pan
  const container = svg.append("g");
  svg.call(
    d3.zoom()
      .extent([[0, 0], [width, height]])
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
      })
  );

  // Marker
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

  // Force
  const simulation = d3.forceSimulation(graph.nodes)
    .force("link", d3.forceLink(graph.links).id(d => d.id).distance(200))
    .force("charge", d3.forceManyBody().strength(-700))
    .force("center", d3.forceCenter(width/2, height/2));

  // Links
  const link = container.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter().append("line")
    .attr("class", d => "link " + (d.type === "+" ? "positive" : "negative"))
    .attr("stroke", d => d.type === "+" ? "#1aaf5d" : "#e14646")
    .attr("stroke-width", 3)
    .attr("stroke-dasharray", d => d.type === "-" ? "8 5" : null)
    .attr("marker-end", d => d.type === "+" ? "url(#arrow-positive)" : "url(#arrow-negative)");

  // Nodes
  const node = container.append("g")
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

  // Tooltip ساده (فقط توضیح کوتاه برای گره‌ها/یال‌ها)
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "#fff")
    .style("border", "1.5px solid #bbb")
    .style("padding", "12px 18px")
    .style("border-radius", "10px")
    .style("font-size", "15px")
    .style("box-shadow", "0 4px 14px #ccc")
    .style("pointer-events", "none")
    .style("max-width", "340px")
    .style("visibility", "hidden");

  // گره‌ها: نمایش توضیح در Tooltip
  node.on("mouseover", function(event, d) {
      tooltip.style("visibility", "visible")
        .html(
          `<div style='font-weight:bold;color:#148;'>${d.label}</div>` +
          (d.description ? `<div style='margin:6px 0;color:#333;'>${d.description}</div>` : "") +
          (d.source ? `<div style='margin-top:8px;font-size:13px;color:#888;'>${d.source}</div>` : "")
        );
    })
    .on("mousemove", function(event) {
      tooltip.style("top", (event.pageY + 12) + "px")
             .style("left", (event.pageX + 16) + "px");
    })
    .on("mouseout", function() {
      tooltip.style("visibility", "hidden");
    })
    .on("click", function(event, d) {
      d3.select("#info-panel").style("display", "block");
      d3.select("#panel-content").html(
        `<div style='font-weight:bold;color:#287d62;font-size:19px;margin-bottom:9px;'>${d.label}</div>` +
        (d.description ? `<div style='color:#444;font-size:15px;margin-bottom:7px;'>${d.description}</div>` : "") +
        (d.source ? `<div style='font-size:13px;color:#666;'>${d.source}</div>` : "")
      );
      event.stopPropagation();
    });

  // یال‌ها: نمایش توضیح در Tooltip
  link.on("mouseover", function(event, d) {
      tooltip.style("visibility", "visible")
        .html(
          `<div style='font-weight:bold;color:#148;'>${d.label || (d.type === "+" ? "اثر مثبت" : "اثر منفی")}</div>`
        );
    })
    .on("mousemove", function(event) {
      tooltip.style("top", (event.pageY + 10) + "px").style("left", (event.pageX + 12) + "px");
    })
    .on("mouseout", function() { tooltip.style("visibility", "hidden"); })
    .on("click", function(event, d) {
      d3.select("#info-panel").style("display", "block");
      d3.select("#panel-content").html(
        `<div style='font-weight:bold;color:#9a8e3d;font-size:18px;margin-bottom:8px;'>${d.label || 'رابطه'}</div>` +
        (d.references && d.references.length
          ? `<table><thead>
          <tr><th>عنوان</th><th>چرایی</th><th>لینک</th></tr></thead><tbody>` +
          d.references.map(r =>
            `<tr>
              <td style='vertical-align:top;'>${r.title || '—'}</td>
              <td style='vertical-align:top;color:#865;'>${r.why || '—'}</td>
              <td style='vertical-align:top;'><a href='${r.url}' target='_blank'>مشاهده</a></td>
            </tr>`
          ).join('') + `</tbody></table>` : "<div style='color:#987;'>منبع مستند ندارد.</div>")
      );
      event.stopPropagation();
    });

  d3.select("body").on("click", function() {
    d3.select("#info-panel").style("display", "none");
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
