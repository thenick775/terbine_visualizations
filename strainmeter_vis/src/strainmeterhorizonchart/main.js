function run(filedf,startposf) {
    d3.csv(filedf).then(function(datastrain) { //d3 v6 uses promises so changed here
        const n = 4;
        const m = 964;
        var shouldplay = false;

        start = startposf; //where to start timewise within full data
        countinit = true;
        initcount = 0;

        straintoidx = ["LinearMicrostrain_ch0", "LinearMicrostrain_ch1", "LinearMicrostrain_ch2", "LinearMicrostrain_ch3"]

        datastrain.forEach(function(d) {
            d[straintoidx[0]] = +d[straintoidx[0]]
            d[straintoidx[1]] = +d[straintoidx[1]]
            d[straintoidx[2]] = +d[straintoidx[2]]
            d[straintoidx[3]] = +d[straintoidx[3]]
        });
        console.log(datastrain);

        const div = d3.select("body").append("div").style("position", "relative") //html`<div style="position:relative;">`;

        //convert the strainmeter data to array of array
        //calculate min/max for y scale's domain
        const data = new Array(n);
        const chmins = new Array(n);
        for (let i = 0; i < n; ++i) { //for each column here
            const d = data[i] = new Float64Array(m);
            chmins[i] = new Float64Array(2);
            col = datastrain.map(d => d[straintoidx[i]]).slice(start, start + m)
            colmin = d3.min(datastrain, d => Math.abs(d[straintoidx[i]]));
            colmax = d3.max(datastrain, d => Math.abs(d[straintoidx[i]]));

            chmins[i] = [colmin, colmax];
            for (let j = 0; j < m; ++j) { //copy rows here
                d[j] = v = col[j];
            }
        }
        console.log("data")
        console.log(data)
        console.log("mins for data")
        console.log(chmins)

        step = 100
        margin = ({
            top: 30,
            right: 200,
            bottom: 0,
            left: 10
        })
        height = data.length * (step + 10) + margin.top + margin.bottom
        width = 1000;
        overlap = 6;
        schemepos = "schemeOrRd"
        schemeneg = "schemeBuPu"

        color = i => d3[schemepos][Math.max(8, overlap)][i + 2]
        colorneg = i => d3[schemeneg][Math.max(8, overlap)][i + 2]

        //set yscales based on distance between abs min/max values
        var yscalesall = [];
        for(let i=0;i<4;i++){
            ychi = d3.scaleLinear()
            .domain([chmins[i][0], chmins[i][1]])
            .rangeRound([0, -overlap * step])
            yscalesall.push(ychi)
        }

        const canvas = div
            .selectAll("canvas")
            .data(data)
            .enter().append("canvas")
            .style("position", "absolute")
            .attr("width", width)
            .attr("height", step)
            .style("image-rendering", "pixelated")
            .style("top", (d, i) => `${i * (step + 10) + margin.top}px`)
            .property("context", function() {
                return this.getContext("2d");
            })
            .each(horizon);

        const svg = d3.select("body").append("svg")
            .style("position", "relative")
            .style("top", "20px")
            .attr("height", height.toString() + "px")
            .attr("width", (width + margin.right).toString() + "px")
            .style("font", "10px sans-serif");

        const gX = svg.append("g");
        equi = 25
        svg.append("g") //leftmost labels
            .selectAll("text")
            .data(data)
            .join("text")
            .attr("x", 4)
            .attr("y", (d, i) => (i + 0.5) * (step + 10))
            .attr("dy", "0.35em")
            .text((d, i) => "ch" + i.toString());

        svg.append("g") //date labels
            .selectAll("text")
            .data(data)
            .join("text")
            .attr("x", width + 10)
            .attr("y", (d, i) => (i + 0.5) * (step + 10) - equi / 2)
            .attr("dy", "0.35em")
            .text((d, i) => "Date: ch" + i.toString())
            .attr("class", "rightlabelsdate");

        svg.append("g") //strain labels
            .selectAll("text")
            .data(data)
            .join("text")
            .attr("x", width + 10)
            .attr("y", (d, i) => (i + 0.5) * (step + 10) + equi / 2)
            .attr("dy", "0.35em")
            .text((d, i) => "LinearMicrostrain: ch" + i.toString())
            .attr("class", "rightlabelsstrain");

        const refline = svg.append("line") //vertical line
            .attr("stroke", "#000")
            .attr("y1", -6)
            .attr("y2", height - margin.bottom - 18)
            .attr("x1", width - 20)
            .attr("x2", width - 20);

        const refline2 = svg.append("line") //vertical line 2 for pair
            .attr("stroke", "#000")
            .attr("y1", -6)
            .attr("y2", height - margin.bottom - 18)
            .attr("x1", width - 25)
            .attr("x2", width - 25);

        function horizon(d, idx) {
            var barsize = 5;
            const {
                context
            } = this;
            const {
                length: k
            } = d;
            //console.log("datalength",k)
            if (k < width) {
                context.drawImage(this, k > 1 ? k : barsize, 0, k > 1 ? width - k : width - barsize, step, 0, 0, k > 1 ? width - k : width - barsize, step);
            }
            context.fillStyle = "#fff";
            context.fillRect(k > 1 ? width - k : width - barsize, 0, k > 1 ? k : barsize, step);
            for (let i = 0; i < overlap; ++i) {
                context.save();
                context.translate(k > 1 ? width - k : width - barsize, (i + 1) * step);
                for (let j = 0, mu = 0; j < k, mu < width; ++j, mu += barsize) { //heres my problem I think, Im not drawing all the data cells at once and skipping with count below in update
                    if (idx == 2 && i == 0 && countinit) {
                        initcount++; //to keep track initially where we made it to in the original data array
                        //console.log(initcount)
                        //console.log("idx: ",idx,"mu: ",mu, "data val(",d[j]);
                    }
                    if (d[j] > 0) { //extensional strain (+)
                        context.fillStyle = color(i);
                        context.fillRect(mu, yscalesall[idx](d[j]), barsize, -yscalesall[idx](d[j]));
                    } else { //inwards (compressional) strain (-)
                        context.fillStyle = colorneg(i);
                        context.fillRect(mu, yscalesall[idx](-d[j]), barsize, -yscalesall[idx](-d[j]));
                    }
                }
                context.restore();
            }
        }

        div.update = data => {
            canvas.data(data).each(horizon);
        };

        delay = d3.select(".playbackentry").property("value"); //15;
        console.log("adding to count: ", initcount)
        count = start + initcount - 2; //watch here carefully
        function update() {
            console.log("initcount printing", initcount)
            countinit = false;
            const m = data[0].length;
            const tail = data.map(d => d.subarray(m - 1, m));
            let timerId = setTimeout(function request() { //here is where we can iterate through the data and transition based on color values
                if (shouldplay) {
                    if (count + 1 >= datastrain.length) {
                        count = 0
                    } else {
                        count = count + 1;
                    }
                    for (const [i, d] of data.entries()) {
                        /*console.log("logging data")
                        console.log(d)
                        console.log(i)
                        console.log("end logging data")*/

                        d.copyWithin(0, 1, m), d[m - 1] = datastrain[count][straintoidx[i]];

                        //label updates
                        svg.selectAll(".rightlabelsdate").each(function(d, i) {
                            d3.select(this).html("Date: " + datastrain[count - 4 >= 0 ? count - 4 : datastrain.length - (-(count - 4)) /*-Math.round(width*1/15)-6*/ ]["DateTimeUTC"]);
                        });
                        svg.selectAll(".rightlabelsstrain").each(function(d, i) {
                            d3.select(this).html("ch" + i.toString() + ": " + datastrain[count - 4 >= 0 ? count - 4 : datastrain.length - (-(count - 4)) /*-Math.round(width*1/15)-6*/ ][straintoidx[i]] + " LMS");
                        });
                    }
                    div.update(tail);
                }
                timerId = setTimeout(request, delay)
            }, delay);
        };

        update() //initiate timer

        function pause() {
            shouldplay = !shouldplay;
        }

        function setplayback() {
            val = parseInt(d3.select(".playbackentry").property("value"));
            if (!isNaN(val)) {
                console.log("setting playback", val);
                delay = val
            }
        }

        d3.select(".playbackset").on("click", setplayback)
        svg.on("click", pause);

        d3.select("#selectButton").on("change", function(d) {
            var selectedOption = d3.select(this).property("value")
            //remove existing chart/labels/lines/toucharea
            shouldplay=false;
            div.remove();
            d3.selectAll("g").remove()
            d3.selectAll("line").remove()
            svg.remove();
            console.log("startpos: ",startpos)
            run("https://raw.githack.com/thenick775/terbine_visualizations/livepreview/strainmeter_vis/src/strainmeterhorizonchart/maindf_" + selectedOption + ".csv",startpos); //adjust based on selected strainmeter
        })

    });
}

var allstrainmeters = ["B079", "B054", "B084"]

// add the options to the button
d3.select("#selectButton")
    .style("position", "relative")
    .style("top", "10px")
    .style("left","5px")
    .selectAll('Options')
    .data(allstrainmeters)
    .enter()
    .append('option')
    .text(function(d) {
        return d;
    }) // menu text
    .attr("value", function(d) {
        return d;
    }) // button value

var startpos=30000;

function setstart(){
  if(d3.select(this).text() == "Starting Pos: ~Half"){
    d3.select(this).text("Starting Pos: Beg")
    startpos=0;
  } else{
     d3.select(this).text("Starting Pos: ~Half")
     startpos=30000;
  }
}

d3.select(".startButton").style("width","85px").style("top", "5px")
d3.select(".startButton").on("click", setstart)

run("https://raw.githack.com/thenick775/terbine_visualizations/livepreview/strainmeter_vis/src/strainmeterhorizonchart/maindf_B079.csv",startpos); //trigger initial run
