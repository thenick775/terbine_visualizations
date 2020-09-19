//predefined formats
var formatAsP = d3.format("%"),
    formatAsP4Dec = d3.format(".4%"),
    formatAsInt = d3.format(","),
    diam = 700,
    labelhang = 590, //next 3 are for bar chart external labels
    start = -70,
    intst = 52;
	group = "WHITEHALL STREET"; //"34TH STREET & 6TH AVENUE"; // set initial group value

//pie chart generation
function dsPieGen() {
    //the address used below is of python simpleserver I am using to serve my content, this would have to be set to the root directory of the project when deployed
    var data = d3.csv("https://raw.githack.com/thenick775/terbine_visualizations/livepreview/new_york_fare_card_vis/new_york_fare_Card_src/data/dfpie.csv", function(dataset) { //create within this function, as dataset is only accessible here after ajax call finishes
        dataset.forEach(function(d) { //edit data format for plot
            d.total_percentage = +d.total_percentage;
        });
        ////console.log(dataset);

        var outerRadius = diam / 2,
            innerRadius = outerRadius * .999,
            innerRadiusFinal = outerRadius * .5,
            innerRadiusFinal3 = outerRadius * .3,
            color = d3.scale.category20c() //version c,range of colors
        ;

        var vis = d3.select("#pieChart")
            .append("svg:svg") //create the SVG element inside the <body>
            .data([dataset]) //associate our data with the document
            .attr("width", diam) //set the width and height
            .attr("height", diam)
            .append("svg:g") //make a group to hold our pie chart
            .attr("transform", "translate(" + outerRadius + "," + outerRadius + ")") //move the center of the pie chart from 0, 0 to radius, radius
        ;

        var arc = d3.svg.arc() //this will create <path> elements for us using arc data
            .outerRadius(outerRadius).innerRadius(innerRadius);

        // for animation
        var arcFinal = d3.svg.arc().innerRadius(innerRadiusFinal).outerRadius(outerRadius);
        var arcFinal3 = d3.svg.arc().innerRadius(innerRadiusFinal3).outerRadius(outerRadius);

        var pie = d3.layout.pie() //this will create arc data for us given a list of values
            .value(function(d) {
                return d.total_percentage;
            }); //we must tell it out to access the value of each element in our data array

        var arcs = vis.selectAll("g.slice") //this selects all <g> elements with class slice (there aren't any yet)
            .data(pie) //associate the generated pie data (an array of arcs, each having startAngle, endAngle and value properties) 
            .enter() //this will create <g> elements for every "extra" data element that should be associated with a selection. The result is creating a <g> for every object in the data array
            .append("svg:g") //create a group to hold each slice (we will have a <path> and a <text> element associated with each slice)
            .attr("class", "slice") //allow us to style things in the slices (like text)
            .on("mouseover", mouseover)
            .on("mouseout", mouseout)
            .on("click", up);

        arcs.append("svg:path")
            .attr("fill", function(d, i) {
                return color(i);
            }) //set the color for each slice to be chosen from the color function defined above
            .attr("d", arc) //this creates the actual SVG path using the associated data (pie) with the arc drawing function
        ;

        d3.selectAll("g.slice").selectAll("path").transition()
            .duration(1000)
            .delay(10)
            .attr("d", arcFinal);

        // computes the label angle of an arc, converting from radians to degrees.
        function angle(d) {
            var a = (d.startAngle + d.endAngle) * 90 / Math.PI - 90;
            return a > 90 ? a - 180 : a;
        }


        // pie chart title			
        vis.append("svg:text")
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .text("Total Fare Card Counts")
            .attr("class", "title");

          var arr = ["string1","string2","string3","string4","string5"];

        //station hover label
        vis.append("svg:text")
            .attr("dy", ".25em")
            .attr("text-anchor", "middle")
            .attr("y", 25)
            .text(dataset[0].station + " : " + formatAsP4Dec(dataset[0].total_percentage))
            .attr("style", "font-size: 12;")
            .attr("class", "infoBox");

        function mouseover(d, i) {
            d3.select(this).select("path").transition()
                .duration(750)
                .attr("d", arcFinal3);

            d3.select(".infoBox").transition()
                .text(d.data.station + " : " + formatAsP4Dec(d.data.total_percentage))
                .attr("style", "font-size: 12;");
        }

        function mouseout(d, i) {
            d3.select(this).select("path").transition()
                .duration(750)
                .attr("d", arcFinal);
        }

        function up(d, i) {
            //update bar/line when a piece of the pie chart is selected
            updateBarChart(d.data.station, color(i));
            updateLineChart(d.data.station, color(i));
        }
    });
}

dsPieGen();

//bar chart generation
var datasetBarChart; //external holder, due to scope as this can be edited

function datasetBarChosen(group, data) {
    var ds = [];
    for (x in data) {
        if (data[x].station == group) {
            for (t in data[x]) {
                if (t != "station") {
                    ds.push(data[x][t]);
                }
            }
        }
    }
    return ds;
}

function dsBarChartConfig() {
    var margin = {
            top: 30,
            right: 5,
            bottom: 450,
            left: 50
        },
        width = 1200 - margin.left - margin.right,
        height = 1000 - margin.top - margin.bottom,
        colorBar = d3.scale.category20c(),
        barPadding = 3;

    return {
        margin: margin,
        width: width,
        height: height,
        colorBar: colorBar,
        barPadding: barPadding
    };
}

d3.csv("https://raw.githack.com/thenick775/terbine_visualizations/livepreview/new_york_fare_card_vis/new_york_fare_Card_src/data/dfbar.csv", function(dataset) { //create within this function, as dataset is only accessible here after ajax call finishes
    dataset.forEach(function(d) { //edit data format for plot
        d.full_fare = +d.full_fare;
        d.senior_citizen_disabled = +d.senior_citizen_disabled;
        d._7_day_ada_farecard_access_system_unlimited = +d._7_day_ada_farecard_access_system_unlimited;
        d._30_day_ada_farecard_access_system_unlimited = +d._30_day_ada_farecard_access_system_unlimited;
        d.joint_rail_road_ticket = +d.joint_rail_road_ticket;
        d._7_day_unlimited = +d._7_day_unlimited;
        d._30_day_unlimited = +d._30_day_unlimited;
        d._14_day_reduced_fare_media_unlimited = +d._14_day_reduced_fare_media_unlimited;
        d._1_day_unlimited = +d._1_day_unlimited;
        d._14_day_unlimited = +d._14_day_unlimited;
        d._7_day_express_bus_pass = +d._7_day_express_bus_pass;
        d.transit_check_metrocard = +d.transit_check_metrocard;
        d.lib_special_senior = +d.lib_special_senior;
        d.rail_road_unlimited_no_trade = +d.rail_road_unlimited_no_trade;
        d.transit_check_metrocard_annual_metrocard = +d.transit_check_metrocard_annual_metrocard;
        d.mail_and_ride_ezpay_express = +d.mail_and_ride_ezpay_express;
        d.mail_and_ride_unlimited = +d.mail_and_ride_unlimited;
        d.path_2_trip = +d.path_2_trip;
        d.airtrain_full_fare = +d.airtrain_full_fare;
        d.airtrain_30_day = +d.airtrain_30_day;
        d.airtrain_10_trip = +d.airtrain_10_trip;
        d.airtrain_monthly = +d.airtrain_monthly
    });
    //console.log(dataset);
    datasetBarChart = dataset;
    //console.log("datasetbarchart")
    //console.log(datasetBarChart)

    function dsBarChart() {
        var firstDatasetBarChart = datasetBarChosen(group, dataset);

        var basics = dsBarChartConfig();

        var margin = basics.margin,
            width = basics.width,
            height = basics.height,
            colorBar = basics.colorBar,
            barPadding = basics.barPadding;

        var xScale = d3.scale.linear()
            .domain([0, firstDatasetBarChart.length])
            .range([0, width]);

        // Create linear y scale 
        // Purpose: No matter what the data is, the bar should fit into the svg area; bars should not
        // get higher than the svg height. Hence incoming data needs to be scaled to fit into the svg area.  
        var yScale = d3.scale.linear()
            // use the max funtion to derive end point of the domain (max value of the dataset)
            // do not use the min value of the dataset as min of the domain as otherwise you will not see the first bar
            .domain([0, d3.max(firstDatasetBarChart, function(d) {
                return d;
            })])
            // As coordinates are always defined from the top left corner, the y position of the bar
            // is the svg height minus the data value. So you basically draw the bar starting from the top. 
            // To have the y position calculated by the range function
            .range([height, 0]);

        //Create SVG element
        var svg = d3.select("#barChart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("id", "barChartPlot");

        var plot = svg
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        plot.selectAll("rect")
            .data(firstDatasetBarChart)
            .enter()
            .append("rect")
            .attr("x", function(d, i) {
                return xScale(i);
            })
            .attr("width", width / firstDatasetBarChart.length - barPadding)
            .attr("y", function(d) {
                return yScale(d);
            })
            .attr("height", function(d) {
                return height - yScale(d);
            })
            .attr("fill", "lightgrey");

        //add x labels
        var xLabels = svg
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + (margin.top + height) + ")");

        xLabels.selectAll("text.xAxis")
            .data(firstDatasetBarChart)
            .enter()
            .append("text")
            .text(function(d) {
                return d;
            })
            .attr("text-anchor", "middle")
            // Set x position as left edge of each bar+half bar width
            .attr("x", function(d, i) {
                return (i * (width / firstDatasetBarChart.length)) + ((width / firstDatasetBarChart.length - barPadding) / 2);
            })
            .attr("y", 15)
            .attr("class", "xAxis")
            .attr("style", "font-size: 14; font-family: Helvetica;fill: purple");

        //append title
        svg.append("text")
            .attr("x", (width + margin.left + margin.right) / 2)
            .attr("y", 15)
            .attr("class", "title")
            .attr("text-anchor", "middle").attr("style", "font-size: 18;")
            .text(group + " Station Breakdown");

        //add chart demographic labels
        for (x in dataset[0]) {
            if (x != "station") {
                if (x.charAt(0) === '_') {
                    x = x.substring(1);
                }
                svg.append("text")
                    .attr("x", (width + margin.left + margin.right) / 2)
                    .attr("y", start)
                    .attr("x", labelhang)
                    .attr("class", "titlebarx")
                    .text(x).style("text-anchor", "start")
                    .attr('transform', 'rotate(90)');
                start = start - intst
            }
        }

    }
    dsBarChart();
});

//update the bar chart as requested by the pie
function updateBarChart(group, colorChosen) {
    var currentDatasetBarChart = datasetBarChosen(group, datasetBarChart);

    var basics = dsBarChartConfig();

    var margin = basics.margin,
        width = basics.width,
        height = basics.height,
        colorBar = basics.colorBar,
        barPadding = basics.barPadding;

    var xScale = d3.scale.linear()
        .domain([0, currentDatasetBarChart.length])
        .range([0, width]);


    var yScale = d3.scale.linear()
        .domain([0, d3.max(currentDatasetBarChart, function(d) {
            return d;
        })])
        .range([height, 0]);

    var svg = d3.select("#barChart svg");

    var plot = d3.select("#barChartPlot")
        .datum(currentDatasetBarChart);

    /* Note that here we only have to select the elements - no more appending! */
    plot.selectAll("rect")
        .data(currentDatasetBarChart)
        .transition()
        .duration(750)
        .attr("x", function(d, i) {
            return xScale(i);
        })
        .attr("width", width / currentDatasetBarChart.length - barPadding)
        .attr("y", function(d) {
            return yScale(d);
        })
        .attr("height", function(d) {
            return height - yScale(d);
        })
        .attr("fill", colorChosen);

    plot.selectAll("text.xAxis")
        .data(currentDatasetBarChart)
        .transition()
        .duration(750)
        .text(function(d) {
            return formatAsInt(d3.round(d));
        })
        .attr("text-anchor", "middle")
        // Set x position as left edge of each bar+half bar width
        .attr("x", function(d, i) {
            return (i * (width / currentDatasetBarChart.length)) + ((width / currentDatasetBarChart.length - barPadding) / 2);
        })
        .attr("y", 15)
        .attr("class", "xAxis")
    //.attr("style", "font-size: 12; font-family: Helvetica, sans-serif")
    ;

    svg.selectAll("text.title") // target the text element(s) which has a title class defined
        .attr("x", (width + margin.left + margin.right) / 2)
        .attr("y", 15)
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .text(group + " Station Breakdown");
}

//line chart generation
var datasetLineChart; //external ref required due to scoping

function datasetLineChartChosen(group, dataset) {
    var ds = [];
    for (x in dataset) {
        if (dataset[x].station == group) { //here push whole row
            ds.push(dataset[x]);
        }
    }
    return ds;
}

function dsLCInit() {
    var margin = {
            top: 20,
            right: 10,
            bottom: 80,
            left: 50
        },
        width = 510 - margin.left - margin.right,
        height = 200 - margin.top - margin.bottom;

    return {
        margin: margin,
        width: width,
        height: height
    };
}

//lc helpers
//sum array of object selection for total station label of the line chart
function amount(item) {
    return item.stat_time_tot;
}

function sum(prev, next) {
    return prev + next;
}

function g3getstt(d) {
    return d.stat_time_tot
}

d3.csv("https://raw.githack.com/thenick775/terbine_visualizations/livepreview/new_york_fare_card_vis/new_york_fare_Card_src/data/dfline.csv", function(dataset) { //create within this function, as dataset is only accessible here after ajax call finishes
    dataset.forEach(function(d) { //edit data format for plot
        d.stat_time_tot = +d.stat_time_tot;
    });

    //console.log(dataset)
    datasetLineChart = dataset

    function dsLineChart() {

        var firstDatasetLineChart = datasetLineChartChosen(group, dataset);

        var basics = dsLCInit();

        var margin = basics.margin,
            width = basics.width,
            height = basics.height;

        var xScale = d3.scale.linear()
            .domain([0, firstDatasetLineChart.length - 1])
            .range([0, width]);

        var yScale = d3.scale.linear()
            .domain([0, d3.max(firstDatasetLineChart, function(d) {
                return d.stat_time_tot;
            })])
            .range([height, 0]);

        var line = d3.svg.line()
            .x(function(d, i) {
                return xScale(i);
            })
            .y(function(d) {
                return yScale(d.stat_time_tot);
            });

        var svg = d3.select("#lineChart").append("svg")
            .datum(firstDatasetLineChart)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        // create group and move it so that margins are respected (space for axis and title)

        var plot = svg
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .attr("id", "lineChartPlot");

        //add titles
        var dsLength = firstDatasetLineChart.length;

        plot.append("text")
            .text(firstDatasetLineChart.map(amount).reduce(sum))
            .attr("id", "lineChartTitle2")
            .attr("x", width / 2)
            .attr("y", height * 3 / 4);

        plot.append("path")
            .attr("class", "line")
            .attr("d", line)
            .attr("stroke", "lightgrey");

        //add singular tooltip, process described here https://bl.ocks.org/d3noob/a22c42db65eb00d4e369
        var div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        plot.selectAll(".dot")
            .data(firstDatasetLineChart)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("fill", function(d) {
                return d.stat_time_tot == d3.min(firstDatasetLineChart, g3getstt) ? "green" : (d.stat_time_tot == d3.max(firstDatasetLineChart, g3getstt) ? "red" : "white")
            })
            .attr("cx", line.x())
            .attr("cy", line.y())
            .attr("r", 5)
            .attr("stroke", "lightgrey")
            .on("mouseover", function(d) {
                div.transition()
                    .duration(200)
                    .style("opacity", 1.0);
                div.html("Total: " + d.stat_time_tot + "<br/>Date: " + d.from_date)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        svg.append("text")
            .text("Performance Over Time")
            .attr("id", "lineChartTitle1")
            .attr("x", margin.left + ((width + margin.right) / 2))
            .attr("y", 10);

    }

    dsLineChart();
});

//update line chart
function updateLineChart(group, colorChosen) {
    var currentDatasetLineChart = datasetLineChartChosen(group, datasetLineChart);
    //console.log("current data line chart")
    //console.log(currentDatasetLineChart)
    var basics = dsLCInit();

    var margin = basics.margin,
        width = basics.width,
        height = basics.height;

    var xScale = d3.scale.linear()
        .domain([0, currentDatasetLineChart.length - 1])
        .range([0, width]);

    var yScale = d3.scale.linear()
        .domain([0, d3.max(currentDatasetLineChart, function(d) {
            return d.stat_time_tot;
        })])
        .range([height, 0]);

    var line = d3.svg.line()
        .x(function(d, i) {
            return xScale(i);
        })
        .y(function(d) {
            return yScale(d.stat_time_tot);
        });

    var plot = d3.select("#lineChartPlot")
        .datum(currentDatasetLineChart);

    var dsLength = currentDatasetLineChart.length;

    plot.select("text")
        .text(currentDatasetLineChart.map(amount).reduce(sum));

    plot
        .select("path")
        .transition()
        .duration(750)
        .attr("class", "line")
        .attr("d", line)
        .attr("stroke", colorChosen);

    plot.selectAll(".dot").remove() //added for leftover/variable amount of dots

    var div = d3.select(".tooltip")

    var path = plot //re-add dots
        .selectAll(".dot")
        .data(currentDatasetLineChart)
        .enter().append("circle")
        //.transition()
        //.duration(750)
        .attr("class", "dot")
        .attr("fill", function(d) {
            return d.stat_time_tot == d3.min(currentDatasetLineChart, g3getstt) ? "green" : (d.stat_time_tot == d3.max(currentDatasetLineChart, g3getstt) ? "red" : "white")
        })
        .attr("cx", line.x())
        .attr("cy", line.y())
        .attr("r", 5)
        .attr("stroke", colorChosen)
        .on("mouseover", function(d) {
            div.transition()
                .duration(200)
                .style("opacity", 1.0);
            div.html("Total: " + d.stat_time_tot + "<br/>Date: " + d.from_date)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });

    d3.select("#lineChartTitle1").remove() //remove old svg title
    var svg = d3.select("#lineChart svg")

    //add new title
    svg.append("text")
        .text("Performance Over Time")
        .attr("id", "lineChartTitle1")
        .attr("x", margin.left + ((width + margin.right) / 2))
        .attr("y", 10);

}
