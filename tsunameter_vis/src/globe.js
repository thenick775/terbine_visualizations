var globetimer;
var globetimeron = true;
var hasselectedstation = false;
var globebuttontext;

function Globe() {

    var box = {
        width: 700,
        height: 700
    };

    const sensitivity = 75

    let projection = d3.geoOrthographic()
        .scale(300)
        .center([0, 0])
        .rotate([150, -10])
        .translate([box.width / 2, box.height / 2])
        .clipAngle(90);

    const initscale = projection.scale()
    let path = d3.geoPath().projection(projection)

    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    //svg responsiveness from https://benclinkinbeard.com/d3tips/make-any-chart-responsive-with-one-function/?utm_content=buffer976d6&utm_medium=social&utm_source=twitter.com&utm_campaign=buffer
    function responsivefy(svg) {
        //remove tooltip
        // container will be the DOM element
        // that the svg is appended to
        // we then measure the container
        // and find its aspect ratio
        const container = d3.select(svg.node().parentNode),
            width = parseInt(svg.style('width'), 10),
            height = parseInt(svg.style('height'), 10),
            aspect = width / height;

        // set viewBox attribute to the initial size
        // control scaling with preserveAspectRatio
        // resize svg on inital page load
        svg.attr('viewBox', `0 0 ${width} ${height}`)
            .attr('preserveAspectRatio', 'xMinYMin')
            .call(resize);

        // add a listener so the chart will be resized
        // when the window resizes
        // multiple listeners for the same event type
        // requires a namespace, i.e., 'click.foo'
        // api docs: https://goo.gl/F3ZCFr
        d3.select(window).on(
            'resize.' + container.attr('id'),
            resize
        );

        // this is the code that resizes the chart
        // it will be called on load
        // and in response to window resizes
        // gets the width of the container
        // and resizes the svg to fill it
        // while maintaining a consistent aspect ratio
        function resize() {
            if (parseFloat(div.style("opacity")) == 0.9) { //remove tooltip if I havent already removed it
                div.transition()
                    .duration(50)
                    .style("opacity", 0);
            }

            const w = parseInt(container.style('width'));
            svg.attr('width', w / 2);
            svg.attr('height', Math.round(w / aspect) / 2);
        }
    }

    holder = d3.select("body").append("div").attr("class", "holder")

    svg = d3.select(".holder")
        .append("svg")
        .attr("width", box.width)
        .attr("height", box.height)
        .call(responsivefy)

    let globe = svg.append("circle")
        .attr("fill", "#000")
        .attr("stroke", "#000")
        .attr("stroke-width", "0.2")
        .attr("cx", box.width / 2)
        .attr("cy", box.height / 2)
        .attr("r", initscale)

    function clicked(d, i) {
        remove_chart_select_msg()
        playbutton.attr("fill", "#FFF")
        if (globetimeron) {
            globetimeron = false
            globetimer.stop()
            globebuttontext.text("Rotate").attr("x", 30)
        }
        if (d3.event.defaultPrevented) return; // dragged

        resetchart(d.id)

        update_station_table([d.name, d.id, d.rel_loc, "Lat: " + d.coordinates[1] + ", Lon: " + d.coordinates[0]])
        div.transition()
            .duration(200)
            .style("opacity", .9);
        div.html(d.name + ", Station ID: " + d.id)
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");


        if (!hasselectedstation) {
            hasselectedstation = true;
        }

    }

    svg.call(d3.drag().on('drag', () => {
            playbutton.attr("fill", "#FFF")
            if (globetimeron) {
                globetimeron = false
                globetimer.stop()
                globebuttontext.text("Rotate").attr("x", 30)
            }
            if (parseFloat(div.style("opacity")) == 0.9) { //remove tooltip if I havent already removed it
                div.transition()
                    .duration(50)
                    .style("opacity", 0);
            }
            const rotate = projection.rotate()
            const k = sensitivity / projection.scale()
            projection.rotate([
                rotate[0] + d3.event.dx * k,
                rotate[1] - d3.event.dy * k
            ])
            path = d3.geoPath().projection(projection)
            svg.selectAll("path").attr("d", path)
        }))
        .call(d3.zoom().on('zoom', () => {
            playbutton.attr("fill", "#FFF")
            if (globetimeron) {
                globetimeron = false
                globetimer.stop()
                globebuttontext.text("Rotate").attr("x", 30)
            }
            //console.log(d3.event.transform.k)
            if (parseFloat(div.style("opacity")) == 0.9) { //remove tooltip if I havent already removed it
                div.transition()
                    .duration(50)
                    .style("opacity", 0);
            }
            if (d3.event.transform.k > 0.9) {
                projection.scale(initscale * d3.event.transform.k)
                path = d3.geoPath().projection(projection)
                svg.selectAll("path").attr("d", path)
                globe.attr("r", projection.scale())
            } else {
                d3.event.transform.k = 0.9
            }
        }))


    let map = svg.append("g")
    var g;
    d3.json("world_map.json", function(err, d) {
        g = map.append("g")
            .attr("class", "countries");

        g.selectAll("path")
            .data(d.features)
            .enter().append("path")
            .attr("class", d => "country_" + d.properties.name.replace(" ", "_"))
            .attr("d", path)
            .attr("fill", "white")
            .style('stroke', 'black')
            .style('stroke-width', 0.3)
            .style("opacity", 0.8)

        d3.csv('statlonlat.csv', function(error, data) {
            data.forEach(function(d) {
                d.lon = +d.lon;
                d.lat = +d.lat;
                d.coordinate = function() {
                    return projection([d.lat, d.lon]);
                };
                d.xy = d.coordinate();
            });


            const markers = g.append("g");

            markers.selectAll('circle')
                .data(data)
                .enter().append('path')
                .attr('class', 'circle_tsunameter')
                .attr('fill', function(d) {
                    return "red";
                })
                .datum(function(d) {
                    return {
                        type: 'Point',
                        coordinates: [d.lon, d.lat],
                        radius: 5,
                        name: d.name,
                        id: d.stationid,
                        rel_loc: d.relloc
                    };
                })
                .attr('d', path)
                .attr("id", function(d) {
                    return d.id;
                })
                .on("click", clicked);
        });
    })

    //rotation button
    function buttonclickfunc() {
        playbutton.attr("fill", "#FFF")
        if (getChartPlaying()) {
            return
        }
        if (parseFloat(div.style("opacity")) == 0.9) { //remove tooltip if I havent already removed it
            div.transition()
                .duration(50)
                .style("opacity", 0);
        }
        if (globetimeron) {
            globetimeron = false
            globetimer.stop()
            globebuttontext.text("Rotate").attr("x", 30)
        } else {
            globetimeron = true
            globetimer = d3.interval(timerfunc, 25)
            globebuttontext.text("Stop").attr("x", 35)
        }
    }

    function butmousedown() {
        playbutton.attr("fill", "darkgray")
    }

    var playbutton = svg.append("rect")
        .attr("fill", "#FFF")
        .attr("stroke", "#000")
        .attr("stroke-width", "0.2")
        .attr("x", 25)
        .attr("y", 35)
        .attr("width", 50)
        .attr("height", 30)
        .attr("r", 20)
        .on("click", buttonclickfunc)
        .on("mousedown", butmousedown)

    globebuttontext = svg.append("text")
        .text("Stop")
        .attr("x", 35)
        .attr("y", 55)
        .on("click", buttonclickfunc)
        .on("mousedown", butmousedown);

    function timerfunc() {
        const rotate = projection.rotate()
        const k = sensitivity / 2 / projection.scale()
        projection.rotate([
            rotate[0] - 1 * k,
            rotate[1]
        ])
        path = d3.geoPath().projection(projection)
        svg.selectAll("path").attr("d", path)
    }

    globetimer = d3.interval(timerfunc, 45)

}