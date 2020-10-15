//this file defines linkages between the globe and charts/tables

//selects table using d3, updates table values based on marker point clicked in globe.js
function update_station_table(vals) { //pass vals in same order as stationschemacop defined
    var stationschemacop = [
        ["Feed Name", ""],
        ["Station ID", ""],
        ["Relative Position", ""],
        ["Coordinates", ""]
    ]

    stationschemacop.forEach(function(d, i) {
        d[1] = vals[i]
    })
    d3.select(".stationtbody")
        .selectAll("tr").data(stationschemacop)
        .selectAll("td")
        .data(function(d) {
            return d;
        })
        .text(function(d) {
            return d;
        })
}

//stops globe rotation, uses external vars globetimeron/globetimer/globebuttontext defined in globe.js
function stop_globe_rotation() {
    if (globetimeron) {
        globetimeron = false
        globetimer.stop()
        globebuttontext.text("Rotate").attr("x", 30)
    }
}

//removes the intro message/rect for selecting a station defined in charts.js
var keep = true;

function remove_chart_select_msg() {
    if (keep) {
        keep = false
        d3.selectAll(".chintro").remove();
    }
}

//gets boolean:chartplaying, defined in charts.js
function getChartPlaying() {
    return chartplaying
}

//gets boolean:hasselectedstation, defined in globe.js
function getHasSelectedStation() {
    return hasselectedstation;
}

//resets the chart fully, meant to be used externally with vars defined in charts.js (for chart reuse)
function resetchart(newstat) {
    d3.csv('/data/' + newstat + '.csv', function(error, data) {
        data.forEach(function(d) {
            d["sea_floor_depth_below_sea_surface (m)"] = +d["sea_floor_depth_below_sea_surface (m)"]
            d["time (unix)"] = Date.parse(d["time (UTC)"])
        });

        console.log("new reset data")
        console.log(data)
        tsudata = data;


        console.log("resetting chart new file:", newstat)
        clearTimeout(charttimer);
        chtimeron = false
        chbuttontext.text("Play").attr("x", 700/2-50)
        chartplaying = false;
        indexcount = 0;
        time = tsudata[0]["time (unix)"]
        origtime = time

        chartdata = [];

        yScale = d3.scaleLinear()
            .domain([
                d3.min(tsudata, function(d) {
                    return d["sea_floor_depth_below_sea_surface (m)"] - 2;
                }),
                d3.max(tsudata, function(d) {
                    return d["sea_floor_depth_below_sea_surface (m)"] + 2;
                })
            ])
            .range([chartheight - (chartmargin * 2), 0]);

        yAxis = d3.axisRight(yScale)
            .ticks(4).tickFormat(function(d){
                                    return d+' m';
                                });

        chartsdivtes.selectAll('.line_').remove();

        chartsdivtes.selectAll('.x.axis').remove()
        chartsdivtes.selectAll('.y.axis').remove()

        chartsdivtes.append('g')
            .attr('transform', 'translate(' + (chartwidth - chartmargin * 2.5) + ',' + chartmargin + ')')
            .classed('y axis', true)
            .call(yAxis)
            .selectAll("text")
            .style("font-size","12");

        chartsdivtes.append('g')
            .attr('transform', 'translate(-12,' + (chartheight - chartmargin) + ')')
            .classed('x axis', true);

        chartsdivtes.append('g')
            .attr('clip-path', 'url(#clip)')
            .classed('line_', true)
            .append('path')
            .datum(chartdata)
            .classed('line', true)
            .style('fill', 'none')
            .style('stroke', 'steelblue')
            .style('stroke-width', '1.5px');

    });

}