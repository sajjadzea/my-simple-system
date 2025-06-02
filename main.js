// main.js - نسخه کاملاً اصلاح‌شده، سازگار با data.json و بدون SyntaxError

d3.json("data.json").then(function(graph) {
    // اندازه SVG و پارامترهای Force
    const width = window.innerWidth * 0.9;
    const height = window.innerHeight * 0.85;

    const svg = d3.select("#graph")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("background", "#f7f7fb");

    // تعریف force layout
    const simulation = d3.forceSimulation(graph.nodes)
        .force("link", d3.forceLink(graph.links).id(d => d.id).distance(210))
        .force("charge", d3.forceManyBody().strength(-950))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collide", d3.forceCollide(65));

    // رنگ و استایل یال‌ها
    function linkColor(type) {
        return type === "+" ? "#1aae1a" : "#d84343";
    }
    function linkDash(type) {
        return type === "+" ? "5,0" : "6,3";
    }

    // یال‌ها
    const link = svg.append("g")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line")
        .attr("stroke", d => linkColor(d.type))
        .attr("stroke-width", 3)
        .attr("stroke-dasharray", d => linkDash(d.type))
        .attr("marker-end", "url(#arrow)");

    // فلش انتهای یال
    svg.append("defs").append("marker")
        .attr("id", "arrow")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 26)
        .attr("refY", 0)
        .attr("markerWidth", 7)
        .attr("markerHeight", 7)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", "#888");

    // گره‌ها
    const node = svg.append("g")
        .selectAll("g")
        .data(graph.nodes)
        .enter().append("g")
        .attr("class", "node");

    node.append("circle")
        .attr("r", 38)
        .attr("fill", "#ddd")
        .attr("stroke", "#555")
        .attr("stroke-width", 2);

    node.append("text")
        .text(d => d.label)
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .style("font-size", "15px");

    // برچسب یال‌ها
    const linkLabel = svg.append("g")
        .selectAll("text")
        .data(graph.links)
        .enter().append("text")
        .attr("class", "link-label")
        .attr("text-anchor", "middle")
        .style("font-size", "13px")
        .text(d => d.label);

    // Tooltip مدیریتی
    const tooltip = d3.select("body").append("div")
        .attr("class", "custom-tooltip")
        .style("position", "fixed")
        .style("top", "15px")
        .style("right", "30px")
        .style("z-index", "1000")
        .style("min-width", "350px")
        .style("max-width", "500px")
        .style("direction", "rtl")
        .style("background", "#fff")
        .style("box-shadow", "0 2px 10px #aaa5")
        .style("border-radius", "14px")
        .style("padding", "18px 16px 14px 18px")
        .style("border", "1.5px solid #ddd")
        .style("display", "none");

    function showTooltip(html) {
        tooltip.html(html).style("display", "block");
    }
    function hideTooltip() {
        tooltip.style("display", "none");
    }

    // رویدادهای گره
    node.on("mouseenter", function(e, d) {
        let html = `<b style='color:#555'>${d.label}</b><br>${d.description ?? ''}`;
        showTooltip(html);
    })
    .on("mouseleave", hideTooltip);

    // رویدادهای یال (و نمایش منابع)
    link.on("mouseenter", function(e, d) {
        let refs = d.references && d.references.length ? d.references.map(r => `<li><a href='${r.url}' target='_blank' style='color:#007bb5'>${r.title}</a><br><span style='color:#888;font-size:12px'>${r.why ?? ''}</span></li>`).join("") : "<i>بدون منبع</i>";
        let html = `<b style='color:#333'>${d.label}</b><ul style='padding-right:16px'>${refs}</ul>`;
        showTooltip(html);
    })
    .on("mouseleave", hideTooltip);

    // Force Simulation tick
    simulation.on("tick", () => {
        link.attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);
        node.attr("transform", d => `translate(${d.x},${d.y})`);
        linkLabel.attr("x", d => (d.source.x + d.target.x) / 2)
            .attr("y", d => (d.source.y + d.target.y) / 2 - 10);
    });

    // زوم (Zoom)
    svg.call(
        d3.zoom()
            .scaleExtent([0.3, 2.5])
            .on("zoom", function (event) {
                svg.selectAll('g').attr("transform", event.transform);
            })
    );

    // جدول مدیریتی کناری (Side Table)
    const sidebox = d3.select("body").append("div")
        .attr("class", "sidebox")
        .style("position", "fixed")
        .style("top", "55px")
        .style("left", "40px")
        .style("width", "320px")
        .style("background", "#fafbff")
        .style("box-shadow", "0 1px 10px #ccc5")
        .style("border-radius", "10px")
        .style("padding", "14px 10px 8px 10px")
        .style("font-size", "14px")
        .style("z-index", "999")
        .html(`<b style='color:#214'>جدول منابع و روابط:</b><table style='width:100%;margin-top:12px;text-align:right'><thead><tr style='color:#888;background:#f5f5f5'><th>یال</th><th>چرایی</th><th>منبع</th></tr></thead><tbody>$
            {graph.links.map(l => `<tr style='border-bottom:1px solid #eee'>
                <td style='vertical-align:top'>${l.label}</td>
                <td style='font-size:13px;color:#666;vertical-align:top'>${(l.references && l.references[0]?.why) || ''}</td>
                <td style='vertical-align:top'>${l.references && l.references.length ? l.references.map(r => `<a href='${r.url}' target='_blank' style='color:#007bb5'>${r.title}</a>`).join("<br>") : ''}</td>
            </tr>`).join('')}</tbody></table>`);
});
