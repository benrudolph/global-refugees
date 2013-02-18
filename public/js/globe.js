var feature;
var camps;
var flows;

var projection = d3.geo.azimuthal()
    .scale(380)
    .origin([-1.03,10.37])
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
    .projection(projection);

var width = 1280,
    height = 800;

var svg = d3.select("#body").append("svg:svg")
    .attr("width", width)
    .attr("height", height)
    .on("mousedown", mousedown);

var r = 380

svg.append("circle")
    .attr("r", r)
    .attr("fill", "black")
    .attr("cx", width / 2)
    .attr("cy", height / 2)

var radius = d3.scale.log()
    .domain(d3.extent(camp_data, function(d) { return +d.population }))
    .range([1, 10])

d3.json("data/world-countries.json", function(collection) {
  feature = svg.selectAll("path")
      .data(collection.features)
    .enter().append("svg:path")
      .attr("d", clip)
      .on("click", function(d) {
        console.log(d)
        d3.selectAll(".show")
            .classed("show", false)
        d3.selectAll("." + d.id)
            .classed("show", true)

        d3.selectAll(".selected")
            .classed("selected", false)

        d3.select(this)
            .classed("selected", true)
      })

  feature.append("svg:title")
      .text(function(d) {
        return d.properties.name;
      })


  camps = svg.selectAll(".camp")
      .data(camp_data)
    .enter().append("circle")

  camps.attr("class", "camp")
      .attr("r", function(d) {
        if (updateCamp(d)[2] === 0) {
          return 0
        }
        return radius(+d.population)
      })
      .attr("cx", function(d) {
        return updateCamp(d)[0]
      })
      .attr("cy", function(d) {
        return updateCamp(d)[1]
      })

  flows = svg.selectAll(".flow")
      .data(flow_data)
    .enter().append("svg:path")
      .attr("d", clip)
      .attr("class", function(d) {
        return d.asylum.iso + " flow"
      })
});

d3.select(window)
    .on("mousemove", mousemove)
    .on("mouseup", mouseup);

d3.select("select").on("change", function() {
  projection.mode(this.value).scale(scale[this.value]);
  refresh(750);
});

var m0,
    o0;

function mousedown() {
  m0 = [d3.event.pageX, d3.event.pageY];
  o0 = projection.origin();
  d3.event.preventDefault();
}

function mousemove() {
  if (m0) {
    var m1 = [d3.event.pageX, d3.event.pageY],
        o1 = [o0[0] + (m0[0] - m1[0]) / 8, o0[1] + (m1[1] - m0[1]) / 8];
    projection.origin(o1);
    circle.origin(o1)
    refresh();
  }
}

function mouseup() {
  if (m0) {
    mousemove();
    m0 = null;
  }
}

function refresh(duration) {
  (duration ? feature.transition().duration(duration) : feature).attr("d", clip);
  (duration ? flows.transition().duration(duration) : flows).attr("d", clip);
  (duration ? camps.transition().duration(duration) : camps).attr('cx', function(d) {
      return updateCamp(d)[0]
    })
    .attr('cy', function(d) {
      return updateCamp(d)[1]
    })
    .attr('r', function(d) {
        if (updateCamp(d)[2] === 0) {
          return 0
        }
        return radius(+d.population)
    })
}

function clip(d) {
  return path(circle.clip(d));
}

function updateCamp(d) {
  var coords = [];
  d.type = 'Point'
  d.coordinates = [d.lng, d.lat]
  clipped = circle.clip(d);
  if (clipped) {
      coords[0] = projection(clipped.coordinates)[0];
      coords[1] = projection(clipped.coordinates)[1];
      coords[2] = 1;
  } else {
      coords[0] = projection([d.lng, d.lat])[0];
      coords[1] = projection([d.lng, d.lat])[1];
      coords[2] = 0;
  }
  return coords;
}
