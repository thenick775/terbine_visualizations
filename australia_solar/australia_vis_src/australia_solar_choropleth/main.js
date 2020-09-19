var objAgent = navigator.userAgent;
var objOffsetVersion;
var zoomnum = 4; //zoom in map
let delay = 80;  //animation delay
var play = true //initial play configuration

//map relating regionid's to state names
let regmap = new Map();
regmap.set('New South Wales', 'NSW1');
regmap.set('Victoria', 'VIC1');
regmap.set('Queensland', 'QLDA'); //aggregated all QLD
regmap.set('South Australia', 'SA1');
regmap.set('Western Australia', ''); //no data
regmap.set('Tasmania', 'TASA'); //aggregated all TAS
regmap.set('Northern Territory', ''); //no data
regmap.set('Australian Capital Territory', ''); //no data


//**for some reason this was different at first, but then was the same, uncomment if needed
// In Chrome
/*if ((objOffsetVersion = objAgent.indexOf("Chrome")) != -1) {
    zoomnum = 4;
}
// In Safari 
else if ((objOffsetVersion = objAgent.indexOf("Safari")) != -1) {
    zoomnum = 5;
}*/


var map = L.map("map", {
    center: [-29.2744, 133.7751],
    zoom: zoomnum
});
var tiles = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
});
tiles.addTo(map);

map.on('click', function(e) { //add click to change play configuration
    play = !play;
});

//add metainfo pane
var info = L.control();

info.update = function(row, raw) {
    if (row && row.INTERVAL_DATETIME === raw.INTERVAL_DATETIME) {
        var res = ""
        for (val in raw) {
            if (val != "INTERVAL_DATETIME") {
                res += val + ": " + raw[val].toFixed(3) + " MW<br/>"
            }
        }

        this._div.innerHTML = (row ? '<b>' + row.INTERVAL_DATETIME + '</b>' + "<br/><br/>" + res : 'Date');
    }
};

info.onAdd = function(map) {
    this._div = L.DomUtil.create('div', 'metainfo'); // create a div with a class metainfo
    this.update();
    return this._div;
};

info.addTo(map);

var geoobjs = [];
var australiaOverlay = L.d3SvgOverlay(function(sel, proj) { //plot svg overlay here

    var upd = sel.selectAll('path').data(geoobjs);
    upd.enter()
        .append('path')
        .attr("class", "geoobj") //for easy identification later
        .attr('d', proj.pathFromGeojson)
        .attr('stroke', 'black')
        .attr('fill', "black")
        .attr('fill-opacity', '0.5')
    upd.attr('stroke-width', 1 / proj.scale).attr("pointer-events", "visible");
});

L.control.layers({
    "Geo Tiles": tiles
}, {
    "Australian States": australiaOverlay
}).addTo(map);

d3.json("http://localhost:8768/states.min.geojson", function(data) { //initialize data, and add configuration to map here
    geoobjs = data.features;
    australiaOverlay.addTo(map);

    //generate bounding rectangle for max bounds
    var bBox = australiaOverlay.selection[0][0].getBBox();
    var corner1 = australiaOverlay.projection.layerPointToLatLng([bBox.x, bBox.y]);
    var corner2 = australiaOverlay.projection.layerPointToLatLng([bBox.x + bBox.width, bBox.y + bBox.height]);
    map.options.maxBounds = L.latLngBounds(corner1, corner2); //set calculated max bounds for map viewport
    map.options.minZoom = map.getZoom(); //set max map zoom (existing already set to 5)

});

d3.csv("http://localhost:8768/dfchoro1.csv", function(datasetch) {
    datasetch.forEach(function(d) { //edit data format for plot
        d.NSW1 = +d.NSW1;
        d.QLDA = +d.QLDA;
        d.SA1 = +d.SA1;
        d.TAS1 = +d.TASA;
        d.VIC1 = +d.VIC1;
    });
    //console.log("dfchoro")
    //console.log(datasetch)

    var datecount = 0
    var dataraw;
    d3.csv("http://localhost:8768/dfraw1.csv", function(datasetraw) {
        datasetraw.forEach(function(d) {
            d.NSW1 = +d.NSW1;
            d.QLDA = +d.QLDA;
            d.SA1 = +d.SA1;
            d.TASA = +d.TASA;
            d.VIC1 = +d.VIC1;
        });
        dataraw = datasetraw
        //console.log("dataraw")
        //console.log(dataraw)

        let timerId = setTimeout(function request() { //here is where we can iterate through the data and transition based on color values
            if (play) {
                info.update(datasetch[datecount], dataraw[datecount])
                //console.log(datasetch[datecount])
                l = d3.selectAll(".geoobj").each(function(d, i) {
                    if (regmap.get(d.properties.STATE_NAME) !== "") {
                        //console.log(datasetch[datecount][regmap.get(d.properties.STATE_NAME)])
                        d3.select(this)
                            .transition()
                            .duration(delay * 1.1 | 0)
                            .attr('fill', function() {
                                return d3.hsl(datasetch[datecount][regmap.get(d.properties.STATE_NAME)] * 360, 0.9, 0.5)
                            })
                    }
                })

                datecount += 1
                if (datecount >= datasetch.length) {
                    datecount = 0
                }
            }

            timerId = setTimeout(request, delay)

        }, delay);

    });
});
