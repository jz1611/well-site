import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export default function drawChart(allDates, allDepthVals, simplifiedData, element, alt_urls) {
    document.getElementById('container').innerHTML = '';

    const width = document.getElementById("info").clientWidth - 50;
    const height = document.getElementById("info").clientHeight - 85;
    const margin = {top: 20, right: 200, bottom: 60, left: 60};
    const colors = ["#e60049", "#0bb4ff", "#50e991", "#e6d800", "#9b19f5", "#ffa300", "#dc0ab4", "#b3d4ff", "#00bfa0", "#000000", "#8a8a8a"];

    const x = d3.scaleUtc()
        .domain(d3.extent(allDates))
        .range([margin.left, width - margin.right])
        .nice();
    
    let yl = null;
    if (d3.extent(allDepthVals)[1] - d3.extent(allDepthVals)[0] <= 100) {
        if (Math.floor((((d3.extent(allDepthVals)[1] + d3.extent(allDepthVals)[0])/2) - 50) / 10) * 10 < 0) {
            yl = d3.scaleLinear()
                .domain([0, 100])
                .range([margin.top, height - margin.bottom])
                .nice();
        } else {
            yl = d3.scaleLinear()
                .domain([Math.floor((((d3.extent(allDepthVals)[1] + d3.extent(allDepthVals)[0])/2) - 50) / 10) * 10, Math.floor((((d3.extent(allDepthVals)[1] + d3.extent(allDepthVals)[0])/2) + 50) / 10) * 10])
                .range([margin.top, height - margin.bottom])
                .nice();
        }
    } else {
        yl = d3.scaleLinear()
            .domain(d3.extent(allDepthVals))
            .range([margin.top, height - margin.bottom])
            .nice();
    }

    const yr = d3.scaleLinear()
        .domain([simplifiedData[0].land_surface_alt - yl.domain()[1], simplifiedData[0].land_surface_alt - yl.domain()[0]])
        .range([height - margin.bottom, margin.top])
    
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height);

    let xAxisGrid = null;
    if (document.getElementById("info").clientWidth > 520) {
        xAxisGrid = d3.axisTop(x).tickSize(-(height - margin.top - margin.bottom)).tickFormat('')
    } else {
        xAxisGrid = d3.axisTop(x).tickSize(-(height - margin.top - margin.bottom)).ticks(5).tickFormat('')
    }

    svg.append("g")
        .attr("class", "xGrid")
        .attr("transform", `translate(0, ${margin.top})`)
        .call(xAxisGrid)

    let yAxisGrid = null;
    if (document.getElementById("info").clientHeight > 340) {
        yAxisGrid = d3.axisLeft(yl).tickSize(-(width - margin.left - margin.right)).tickFormat('')
    } else {
        yAxisGrid = d3.axisLeft(yl).tickSize(-(width - margin.left - margin.right)).ticks(5).tickFormat('')
    }

    svg.append("g")
        .attr("class", "yGrid")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(yAxisGrid)

    let xAxis = null;
    if (document.getElementById("info").clientWidth > 520) {
        xAxis = svg.append("g")
            .attr("transform", `translate(0, ${height - margin.bottom})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.5em")
            .attr("dy", ".5em")
            .attr("font-size", "1rem")
            .attr("transform", "rotate(-45)");
    } else {
        xAxis = svg.append("g")
            .attr("transform", `translate(0, ${height - margin.bottom})`)
            .call(d3.axisBottom(x).ticks(5))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.5em")
            .attr("dy", ".5em")
            .attr("font-size", "1rem")
            .attr("transform", "rotate(-45)");
    }

    let yAxisLeft = null;
    if (document.getElementById("info").clientHeight > 340) {
        yAxisLeft = svg.append("g")
            .attr("transform", `translate(${margin.left}, 0)`)
            .call(d3.axisLeft(yl))
            .selectAll("text")
            .attr("font-size", "1rem");
    } else {
        yAxisLeft = svg.append("g")
            .attr("transform", `translate(${margin.left}, 0)`)
            .call(d3.axisLeft(yl).ticks(5))
            .selectAll("text")
            .attr("font-size", "1rem");
    }

    let rightAxisVals = []
    for (let i = 0; i < 11; i++) {
        rightAxisVals.push(yr.domain()[0] + 10 * i)
    }

    let yAxisRight = null;
    if (d3.extent(allDepthVals)[1] - d3.extent(allDepthVals)[0] <= 100) {
        if (document.getElementById("info").clientHeight > 340) {
            yAxisRight = svg.append("g")
                .attr("transform", `translate(${width - margin.right}, 0)`)
                .call(d3.axisRight(yr).tickValues(rightAxisVals))
                .selectAll("text")
                .attr("font-size", "1rem")
        } else {
            yAxisRight = svg.append("g")
                .attr("transform", `translate(${width - margin.right}, 0)`)
                .call(d3.axisRight(yr).tickValues(rightAxisVals.filter((d, i) => i%2 == 0)))
                .selectAll("text")
                .attr("font-size", "1rem");
        }
    } else {
        if (document.getElementById("info").clientHeight > 340) {
            yAxisRight = svg.append("g")
                .attr("transform", `translate(${width - margin.right}, 0)`)
                .call(d3.axisRight(yr))
                .selectAll("text")
                .attr("font-size", "1rem")
        } else {
            yAxisRight = svg.append("g")
                .attr("transform", `translate(${width - margin.right}, 0)`)
                .call(d3.axisRight(yr).ticks(5))
                .selectAll("text")
                .attr("font-size", "1rem");
        }
    }

    var tooltip = d3.select("#container").append("div")
        .attr("class", "tooltip")
        .style("z-index", 1000)
        .style("opacity", 0);

    const tipMouseover = function(d) {
        const formatTime = d3.timeFormat("%B %d, %Y")
        var html = "<h1>" + formatTime(d.target.__data__.date) + "</h1>" + d.target.__data__.value + " ft bgs<br/>" + Math.round(d.target.__data__.calc_above_navd * 100)/100 + " ft above NAVD88";
        tooltip.html(html)
            .style("left", (event.layerX + 15) + "px")
            .style("top", (event.layerY - 30) + "px")
            .transition()
                .duration(200)
                .style("opacity", .95);
    };

    const tipMouseout = function(d) {
        tooltip.transition()
            .duration(200)
            .style("opacity", 0)
    };

    let sameAlt = true;
    let firstAlt = simplifiedData[0].land_surface_alt;
    for (let i = 0; i < simplifiedData.length; i++) {
        if (simplifiedData[i].land_surface_alt != firstAlt) {
            sameAlt = false;
            break;
        }
    }

    if (sameAlt) {
        simplifiedData.forEach((well, i) => {
            const line = svg.append("path")
                .datum(well.data.depth_to_gw)
                .attr("fill", "none")
                .attr("stroke", colors[i])
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                    .x(function(d) { return x(d.date) })
                    .y(function(d) { return yl(d.value) })
                );

            const points = svg.append("g")
                .selectAll("dot")
                .data(well.data.depth_to_gw)
                .enter()
                .append("circle")
                .attr("cx", function(d){return x(d.date)})
                .attr("cy", function(d){return yl(d.value)})
                .attr("r", 3)
                .style("fill", colors[i])
                .on("mouseover", tipMouseover)
                .on("mouseout", tipMouseout)
        });
    } else {
        simplifiedData.forEach((well, i) => {
            const line = svg.append("path")
                .datum(well.data.depth_to_gw)
                .attr("fill", "none")
                .attr("stroke", colors[i])
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                    .x(function(d) { return x(d.date) })
                    .y(function(d) { return yr(d.calc_above_navd) })
                );

            const points = svg.append("g")
                .selectAll("dot")
                .data(well.data.depth_to_gw)
                .enter()
                .append("circle")
                .attr("cx", function(d){return x(d.date)})
                .attr("cy", function(d){return yr(d.calc_above_navd)})
                .attr("r", 3)
                .style("fill", colors[i])
                .on("mouseover", tipMouseover)
                .on("mouseout", tipMouseout)
        });
    }

    var leftAxisLabel = svg.append("text")
        .attr("class", "left y label")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -(height + margin.top) / 2 + 30)
        .attr("y", margin.left / 4)
        .attr("font-size", "0.8rem")
        .attr("width", "100px")
        .attr("font-weight", "600")
        .attr("font-family", "Arial")
        .text("Depth to Groundwater (ft)");

    if(!sameAlt) {
        leftAxisLabel.text("Wells at different altitudes").style("fill", "red");
        yAxisLeft.attr("display", "none");
    }

    svg.append("text")
        .attr("class", "right y label")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -(height + margin.top) / 2 + 30)
        .attr("y", width - margin.right + 75)
        .attr("font-size", "0.8rem")
        .attr("font-weight", "600")
        .attr("font-family", "Arial")
        .text("GW Level above NAVD88 (ft)");

    for (let i = 0; i < element.wells.length; i++) {
        svg.append("circle")
            .attr("cx", width - margin.right + 95)
            .attr("cy", 28 + (i * 18))
            .attr("r", 4)
            .style("fill", colors[i]);
            
        d3.select("#container").append("div")
            .attr("class", "legend-link")
            .style('font-size', '1rem')
            .style('width', 'max-content')
            .style("left", (width - margin.right + 130) + "px")
            .style("top", (40 + document.getElementById("well-id").clientHeight / 2 + margin.top + (i * 18)) + "px")
            .style("position", "absolute")
            .html("<a href=" + alt_urls[i] + " target='_blank'>" + element.wells[i].SWN + "</a>");
            
    };
        
    if (d3.extent(allDepthVals)[1] - d3.extent(allDepthVals)[0] > 100) {
        svg.append("text")
            .attr("id", "alt-scale-message")
            .attr('font-size', '0.75rem')
            .style('fill', 'red')
            .attr("x", margin.left + 5)
            .attr("y", margin.top -5)
            .text("Scale is different due to large range in data.");
    }

    document.getElementById('info-loader').style.display = 'none';
    container.append(svg.node());
};