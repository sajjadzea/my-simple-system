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

  // ==== Tooltip مدیریتی بالا ====
  const managerTooltip = d3.select("#manager-tooltip");
  let hideTooltipTimeout = null;

  function showManagerTooltip(content) {
    managerTooltip.html(content).style("display", "block");
    clearTimeout(hideTooltipTimeout);
  }
  function hideManagerTooltip() {
    hideTooltipTimeout = setTimeout(() => managerTooltip.style("display", "none"), 380);
  }

  // هاور روی گره‌ها
  node.on("mouseover", function(event, d) {
      showManagerTooltip(
        `<div class='title'>${d.label}</div>` +
        (d.description ? `<div style='margin:4px 0 9px 0;color:#356;'>${d.description}</div>` : "")
      );
    })
    .on("mouseout", hideManagerTooltip)
    .on("mousemove", function(event) { managerTooltip.style("top", "14px").style("left", "50%"); });

  // هاور روی یال‌ها
  link.on("mouseover", function(event, d) {
      showManagerTooltip(
        `<div class='title'>${d.label || (d.type === "+" ? "اثر مثبت" : "اثر منفی")}</div>` +
        (d.references && d.references.length ?
        `<table><thead><tr><th>عنوان</th><th>چرایی</th><th>لینک</th></tr></thead><tbody>`+
        d.references.map(r =>
          `<tr>
            <td>${r.title||"—"}</td>
            <td>${r.why||"—"}</td>
            <td><a href='${r.url}' target='_blank'>مشاهده</a></td>
          </tr>`
        ).join('')+
        `</tbody></table>` : "<div style='color:#987;'>منبع مستند ندارد.</div>")
      );
    })
    .on("mouseout", hideManagerTooltip)
    .on("mousemove", function(event) { managerTooltip.style("top", "14px").style("left", "50%"); });

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
    d.fx = d.x; d.fy = d.y;
  }
  function dragged(event, d) {
    d.fx = event.x; d.fy = event.y;
  }
  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null;
  }

  // ==== جدول ثابت خلاصه ====  (فقط روابط؛ قابل توسعه به گره‌ها)
  function renderSideTable(filterValue="") {
    let filtered = graph.links;
    if (filterValue && filterValue.length>1)
      filtered = filtered.filter(d =>
        (d.label && d.label.includes(filterValue)) ||
        (d.references && d.references.some(r =>
          (r.title && r.title.includes(filterValue)) || (r.why && r.why.includes(filterValue)) ))
      );
    d3.select("#side-table-content").html(
      `<table><thead><tr><th>رابطه</th><th>چرایی/دلیل</th><th>لینک</th></tr></thead><tbody>`+
      filtered.map(d =>
        `<tr style='background:#fff;cursor:pointer;' onmouseover='document.getElementById("manager-tooltip").innerHTML = `<div class=\'title\'>${d.label}</div>${(d.references && d.references.length ? `<table><tr><th>عنوان</th><th>چرایی</th><th>لینک</th></tr>`+d.references.map(r=>`<tr><td>${r.title||"—"}</td><td>${r.why||"—"}</td><td><a href=\'${r.url}\' target=\'_blank\'>مشاهده</a></td></tr>`).join('')+`</table>` : "")}`;document.getElementById("manager-tooltip").style.display = "block";' onmouseout='document.getElementById("manager-tooltip").style.display = "none";'>
          <td>${d.label||"—"}</td>
          <td>${(d.references && d.references[0] && d.references[0].why) ? d.references[0].why : "—"}</td>
          <td>${(d.references && d.references[0] && d.references[0].url) ? `<a href='${d.references[0].url}' target='_blank'>مشاهده</a>` : "—"}</td>
        </tr>`
      ).join('')+`</tbody></table>`
    );
  }

  renderSideTable();
  d3.select("#side-table-search").on("input", function() { renderSideTable(this.value.trim()); });

});
