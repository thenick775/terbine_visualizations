var chartplaying = false;
var filefinished = false;
var charttimer;
var chtimeron = false;
var chbuttontext;
var indexcount = 0;
var time;
var chartdata = [];
var xAxis;
var xScale;
var chartsdivtes;
var origtime;
var time_frame = 16000000;
var chartwidth;
var chartmargin = 20;
var chartheight;
var yScale;
var tsudata;
var yAxis;

function Charts() {
    //graph
    var box = {
        width: 700,
        height: 700
    };

    //var tsudata;
    d3.csv('/data/46409.csv', function(error, data) { //temporary filler
        data.forEach(function(d) {
            d["sea_floor_depth_below_sea_surface (m)"] = +d["sea_floor_depth_below_sea_surface (m)"]
            d["time (unix)"] = Date.parse(d["time (UTC)"])
        });

        //console.log("tsunameter data")
        //console.log(data)
        tsudata = data;

        chartsdivtes = holder.append("svg")
            .style("background-color", "#f2f2f2")
            .style("left", "50%")
            .attr("width", '50%')
            .attr("height", '50%')
            .attr('viewBox', '0 0 ' + Math.min(box.width, box.height) + ' ' + Math.min(box.width, box.height))
            .attr('preserveAspectRatio', 'xMinYMin')
            .append("g")

        chartheight = box.height / 2;
        chartwidth = box.width;

        var duration = 20;
        origtime = tsudata[0]["time (unix)"]
        time = tsudata[0]["time (unix)"]

        xScale = d3.scaleTime()
            .domain([time, time - (duration * 2) - time_frame * 6])
            .range([chartwidth - (chartmargin * 2) - time_frame * 6, 0]);

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

        xAxis = d3.axisBottom(xScale)
            .ticks(d3.utcHour.every(1))
            .tickFormat(d3.utcFormat("%Y/%m/%d %H:%M:%S"));

        yAxis = d3.axisRight(yScale)
            .ticks(4).tickFormat(function(d) {
                return d + ' m';
            });

        chartsdivtes.append('g')
            .attr('transform', 'translate(' + (chartwidth - chartmargin * 2.5) + ',' + chartmargin + ')')
            .classed('y axis', true)
            .call(yAxis)
            .selectAll("text")
            .style("font-size", "12");

        chartsdivtes.append('g')
            .attr('transform', 'translate(0,' + (chartheight - chartmargin) + ')')
            .classed('x axis', true);

        chartsdivtes.append('defs')
            .append('clipPath')
            .attr('id', 'clip')
            .append('rect')
            .attr('width', (chartwidth - (chartmargin * 2.5)))
            .attr('height', (chartheight - (chartmargin * 2)))
            .attr('transform', 'translate(-1.5, 20)');

        chartsdivtes.append('g')
            .attr('clip-path', 'url(#clip)')
            .classed('line_', true)
            .append('path')
            .datum(chartdata)
            .classed('line', true)
            .style('fill', 'none')
            .style('stroke', 'steelblue')
            .style('stroke-width', '1.5px');

        function chartupdate() {
            oldtime = time;
            time = tsudata[indexcount]["time (unix)"]
            delta = time - oldtime;

            customdur = duration;
            if (delta != 0 && delta > 900000) { //15 minute interval is my gauge
                customdur = duration * (((delta) / 900000) + 1) //why? dont quite understand yet but the +1 appears to fix transition problems
            } else if (delta != 0 && delta < 900000) {
                customdur = duration / delta
            }

            //console.log("duration",duration)
            //console.log("customdur",customdur)

            console.log(delta);
            chartdata.push({
                'x': time,
                'y': tsudata[indexcount]["sea_floor_depth_below_sea_surface (m)"]
            });
            chartdraw(customdur);
            indexcount++;
            if (indexcount > tsudata.length - 1) {
                clearTimeout(charttimer);
                chtimeron = false
                chbuttontext.text("Play").attr("x", 35)
                chartplaying = false;
                filefinished = true;
                indexcount = 0; //needs to be here or else it doesnt reset correctly on the next go around
                time = origtime
                chartdata = [];
            }
        }

        function resetchart() {
            filefinished = false;

            chartsdivtes.selectAll('.line_').remove();

            var xScale = d3.scaleTime()
                .domain([origtime, origtime - (duration * 2) - time_frame * 6])
                .range([chartwidth - (chartmargin * 2) - time_frame * 6, 0]);

            chartsdivtes.selectAll('.x.axis')
                .transition()
                .duration(customdur)
                .ease(d3.easeLinear)
                .call(xAxis)

            chartsdivtes.append('g')
                .attr('clip-path', 'url(#clip)')
                .classed('line_', true)
                .append('path')
                .datum(chartdata)
                .classed('line', true)
                .style('fill', 'none')
                .style('stroke', 'steelblue')
                .style('stroke-width', '1.5px');
        }

        function chartdraw(customdur) {
            if (filefinished) {
                resetchart();
            }
            var line = d3.line()
                .x(function(d) {
                    return xScale(d.x);
                })
                .y(function(d) {
                    return yScale(d.y);
                });

            var lineselection = chartsdivtes.selectAll('.line_')
                .select('path');

            lineselection.interrupt()
                .transition()
                .duration(customdur)
                .ease(d3.easeLinear)
                .attr('transform', 'translate(' + -(xScale(chartdata[chartdata.length - 1].x) - xScale.range()[0]) + ',' + chartmargin + ')');


            if (chartdata[0].x < time - time_frame * 7 - duration) {
                chartdata.shift();
            }

            lineselection.attr('d', line)
                .attr('transform', 'translate(0,' + chartmargin + ')');

            xScale.domain([time, time + (duration * 2) - time_frame * 6])
                .range([chartwidth - (chartmargin * 2), 0]);


            chartsdivtes.selectAll('.x.axis')
                .transition()
                .duration(customdur)
                .ease(d3.easeLinear)
                .call(xAxis)
                .on('end', function() {
                    if (chtimeron) {
                        charttimer = setTimeout(chartupdate);
                    }
                }) //so that the x axis container width doesnt grow unbounded during transition

            chartsdivtes.selectAll('.x.axis').selectAll("text")
                .style("text-anchor", "end")
                .style("font-size", "12")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-65)")
        }

        function chbuttonclickfunc() {
            chplaybutton.attr("fill", "#FFF")
            if (!getHasSelectedStation()) {
                return
            } else if (chtimeron) {
                clearTimeout(charttimer);
                chtimeron = false
                chbuttontext.text("Play").attr("x", box.width/2-50)
                chartplaying = false;
            } else {
                chtimeron = true
                chbuttontext.text("Pause").attr("x", box.width/2-55)
                chartupdate();
                chartplaying = true;
                stop_globe_rotation()
            }
        }

        function chbutmousedown() {
            chplaybutton.attr("fill", "darkgray")
        }

        var chplaybutton = chartsdivtes.append("rect")
            .attr("fill", "#FFF")
            .attr("stroke", "#000")
            .attr("stroke-width", "0.2")
            .attr("x", box.width/2-60)
            .attr("y", box.height / 2 + 105)
            .attr("width", 50)
            .attr("height", 30)
            .attr("r", 20)
            .on("click", chbuttonclickfunc)
            .on("mousedown", chbutmousedown);

        chbuttontext = chartsdivtes.append("text")
            .text("Play")
            .attr("x", box.width/2-50)
            .attr("y", box.height / 2 + 125)
            .on("click", chbuttonclickfunc)
            .on("mousedown", chbutmousedown);

        dropdown = chartsdivtes.append("foreignObject") //for dynamically setting the animation speed
            .attr("width", 60)
            .attr("height", 40)
            .attr("x", box.width/2+10)
            .attr("y", box.height * 7.5 / 12 + 18)
            .append("xhtml:select")
            .style("width", "50px")
            .style("height", "30px")
            .attr("class", "speeddropdown")
            .on('change', function() {
                var newData = eval(d3.select(this).property('value'));
                duration = +newData
            });

        mynums = []; //for dropdown speed options
        for (let i = 10; i < 51; i++) {
            if (i % 10 == 0) {
                mynums.push(i)
            }
        };

        dropdown.selectAll("option")
            .data(function(d) {
                let options = mynums
                return options
            })
            .enter()
            .append("option")
            .attr("value", function(d) {
                return d
            })
            .text(function(d) {
                return d
            })
            .property("selected", function(d) {
                return d === 20;
            });

        chartsdivtes.append("rect")
            .attr("class", "chintro")
            .attr("fill", "#FFF")
            .attr("stroke", "#000")
            .attr("stroke-width", "0.2")
            .attr("x", box.width / 2 - 120)
            .attr("y", box.height / 4 - 20)
            .attr("width", 240)
            .attr("height", 30)
            .attr("r", 20)

        chartsdivtes.append("text")
            .attr("class", "chintro")
            .style("text-anchor", "middle")
            .text("Select a station to view its chart!")
            .attr("x", box.width / 2)
            .attr("y", box.height / 4)

        var d3ondrag = d3.drag().on('drag', () => {
            chplaybutton.attr("fill", "#FFF")
        });

        chplaybutton.call(d3ondrag);
        chbuttontext.call(d3ondrag);

        //tables
        var table = chartsdivtes.append("foreignObject")
            .attr("width", box.width)
            .attr("height", 160)
            .attr("y", box.height * 8.5 / 12 + 10)
            .append("xhtml:table")
            .style("border-collapse", "collapse")
            .style("border", "2px black solid")
            .style("margin-left", "auto")
            .style("margin-right", "auto")
            .attr("class", "statinfo");

        table.append("thead").append("tr")
            .selectAll("th")
            .data(["Station Info", ""])
            .enter().append("th")
            .text(function(d) {
                return d;
            })
            .style("border", "1px black solid")
            .style("padding", "5px")
            .style("background-color", "lightgray")
            .style("font-size", "13px");

        // data
        table.append("tbody").attr("class", "stationtbody")
            .selectAll("tr").data([
                ["Feed Name", ""],
                ["Station ID", ""],
                ["Relative Position", ""],
                ["Coordinates", ""]
            ])
            .enter().append("tr")
            .selectAll("td")
            .data(function(d) {
                return d;
            })
            .enter().append("td")
            .style("border", "1px black solid")
            .style("padding", "5px")
            .on("mouseover", function() {
                d3.select(this).style("background-color", "lightgray");
            })
            .on("mouseout", function() {
                d3.select(this).style("background-color", "white");
            })
            .text(function(d) {
                return d;
            })
            .style("font-size", "13px");

    });

}