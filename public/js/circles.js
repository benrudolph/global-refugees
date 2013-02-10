//var camps;

/*var projection = d3.geo.azimuthal()
    .scale(380)
    .origin([-71.03,42.37])
    .mode("orthographic")
    .translate([640, 400]);

var circle = d3.geo.greatCircle()
    .origin(projection.origin());

// TODO fix d3.geo.azimuthal to be consistent with scale
var scale = {
  orthographic: 380,
  stereographic: 380,
  gnomonic: 380,
  equidistant: 380 / Math.PI * 2,
  equalarea: 380 / Math.SQRT2
};

var path = d3.geo.path()
    .projection(projection);*/

/*
var svg = d3.select("#body").append("svg:svg")
    .attr("width", 1280)
    .attr("height", 800)

camps = svg.selectAll(".camp")
    .data([1,2])
  .enter().append("circle")
    .attr("class", "camp")
    .attr("cx", function(d) {
      return 50
    })
    .attr("cy", function(d) {
      return 100
    })
    .attr("r", 50)

    */
var svg = d3.select("#body").append("svg")
    .attr("width", "500px")
    .attr("height", "500px")

var selection = svg.selectAll("rect")
  .data([127, 61, 256, 71])

selection.enter().append("rect")

selection
  .attr("x", 0)
  .attr("y", function(d,i) { return i*90+50 })
  .attr("width", function(d,i) { return d; })
  .attr("height", 20)
  .style("fill", "steelblue")
