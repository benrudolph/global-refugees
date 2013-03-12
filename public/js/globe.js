var feature;
var camps;
var flows;
var refugee_populations;
var isCoO = true;

var r = 260
var z = d3.scale.ordinal()


var velocity = [0.0050, 0.0000];
var origin = [-71.03, 25.37]
var stopRotating = false;

var width = 600,
    height = 600;
var projection = d3.geo.azimuthal()
    .scale(r)
    .origin(origin)
    .mode("orthographic")
    .translate([width / 2, height / 2]);

var circle = d3.geo.greatCircle()
    .origin(projection.origin());

// TODO fix d3.geo.azimuthal to be consistent with scale
var scale = {
  orthographic: r,
  stereographic: r,
  gnomonic: r,
  equidistant: r / Math.PI * 2,
  equalarea: r / Math.SQRT2
};

var path = d3.geo.path()
    .projection(projection);


var svg = d3.select("#body").append("svg:svg")
    .attr("width", width)
    .attr("height", height)
    .on("mousedown", mousedown);


svg.append("circle")
    .attr("r", r)
    .attr("fill", "black")
    .attr("cx", width / 2)
    .attr("cy", height / 2)

var radius = d3.scale.log()
    .domain(d3.extent(camp_data, function(d) { return +d.population }))
    .range([1, 10])

var thresholds = [
  1000,
  10000,
  25000,
  50000,
  100000,
  250000,
  500000,
  1000000,
  "Over 1,000,000"
]

var legendWidth = 300
var bucketHeight = 30;
var bucketWidth = 30;
var legend;

function drawLegend() {
  legend = d3.select("#legend")
    .append("svg")
    .attr("width", legendWidth)


  legend.selectAll(".bucket")
    .data(thresholds)
    .enter()
    .append("rect")
    .attr("x", 10)
    .attr("y", function(d, i) {
      return i*bucketHeight;
    })
    .attr("width", bucketWidth)
    .attr("height", bucketHeight)
    .attr("fill", function(d, i) {
      return z(thresholds.length - (i + 1));
    })
    .attr("rx", 7)
    .attr("ry", 7)
    .style("stroke", "black")
    .attr("class", "bucket")

  legend.selectAll(".label")
    .data(thresholds)
    .enter()
    .append("text")
    .attr("x", bucketWidth + 30)
    .attr("y", function(d, i) {
      return bucketHeight/2 + (i* bucketHeight) + 5;
    })
    .text(function(d, i) {
      console.log(i)
      console.log(thresholds.length -1)
      if (i === 0) {
        return thresholds[thresholds.length - (i + 1)]
      } else if (i === thresholds.length - 1) {
        return thresholds[thresholds.length - (i + 1)] + " or less"
      } else {
        return thresholds[thresholds.length - (i + 2)] + " to " + thresholds[thresholds.length - (i + 1)]
      }
    })
    .style("font-size", "12px")
    .attr("class", "legend")


}


function drawGlobe(collection, color) {
  z.domain([0,1,2,3,4,5,6,7,8])
    .range(colorbrewer[color][9]);
  feature = svg.selectAll("path")
        .data(collection.features)
      .enter().append("svg:path")
        .attr("d", clip)
      /*  .on("click", function(d) {
          console.log(refugee_populations[d.id])
          d3.selectAll(".show")
              .classed("show", false)
              .classed("flowin", false)
              .classed("flowout", false)

          d3.selectAll("." + d.id + "-flowin")
              .classed("show", true)
              .classed("flowin", true)

          d3.selectAll("." + d.id + "-flowout")
              .classed("show", true)
              .classed("flowout", true)

          d3.selectAll(".selected")
              .classed("selected", false)

          d3.select(this)
              .classed("selected", true)
        })*/
        .attr("fill", function(d) {
          var bucket;
          var pop = refugee_populations[d.id]

          if (!pop) {
            return "white"
          }

          if (pop < thresholds[0]) {
            bucket = 0
          } else if (pop < thresholds[1]) {
            bucket = 1
          } else if (pop < thresholds[2]) {
            bucket = 2
          } else if (pop < thresholds[3]) {
            bucket = 3
          } else if (pop < thresholds[4]) {
            bucket = 4
          } else if (pop < thresholds[5]) {
            bucket = 5
          } else if (pop < thresholds[6]) {
            bucket = 6
          } else if (pop < thresholds[7]) {
            bucket = 7
          } else {
            bucket = 8
          }
          console.log(bucket)
          return z(bucket);
        })

    /*feature.append("svg:title")
        .text(function(d) {
          return d.properties.name;
        })*/


    /*camps = svg.selectAll(".camp")
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
        })*/

    /*flows = svg.selectAll(".flow")
        .data(flow_data)
      .enter().append("svg:path")
        .attr("d", clip)
        .attr("class", function(d) {
          return d.asylum.iso + "-flowin flow " + d.origin.iso + "-flowout"
        })*/
    drawLegend();

}

var collection = []
d3.json("data/world-countries.json", function(c) {
  collection = c;
  refugee_populations = CoO;

  drawGlobe(collection, "Reds");
  spin();
});

d3.select("#play").on("click", function() {
  stopRotating = false;
  spin();
})

d3.select("#pause").on("click", function() {
  stopRotating = true;
})

d3.select("#toggle").on("click", function() {
  feature.remove()
  legend.remove()
  var color;
  if (isCoO) {
    refugee_populations = CoR;
    isCoO = false;
    color = "Greens"
    d3.select("#title").text("Where are refugees residing?");
    d3.select(this).text("CoO")
  } else {
    refugee_populations = CoO;
    isCoO = true;
    color = "Reds"
    d3.select("#title").text("Where are refugees originating from?");
    d3.select(this).text("CoR")
  }
  drawGlobe(collection, color);
})

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
  stopRotating = true;
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
  //(duration ? flows.transition().duration(duration) : flows).attr("d", clip);
  /*(duration ? camps.transition().duration(duration) : camps).attr('cx', function(d) {
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
    })*/
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


function spin() {
        t0 = Date.now();
        origin = projection.origin();
        d3.timer(function() {
            var t = Date.now() - t0;
            if (t > 500) {
                var o = [origin[0] + (t - 500) * velocity[0], origin[1] + (t - 500) * velocity[1]];
                projection.origin(o);
                circle.origin(o);
                refresh();
            }
            return stopRotating;
        });
    }
