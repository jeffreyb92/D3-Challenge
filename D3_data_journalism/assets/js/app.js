// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(healthData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
      d3.max(healthData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

function yScale(healthData, chosenYAxis) {
  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(healthData, d => d[chosenYAxis])])
    .range([height, 0]);
  
  return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderAxesX(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
};

function renderAxesY(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
  .duration(1000)
  .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCirclesX(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

function renderCirclesY(circlesGroup, newYScale, chosenYAxis) {

  circlesGroup.transition()
  .duration(1000)
  .attr("cy", d => newYScale(d[chosenYAxis]))

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  if (chosenXAxis === "poverty") {
    var label = "In Poverty (%)";
  }
  else {
    var label = "Age (Median)";
  }

  if (chosenYAxis === "healthcare") {
    var label = "Lacks Health Care (%)";
  }
  else {
    var label = "Smokes (%)";
  }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${label} ${d[chosenXAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}


// Retrieve data from the CSV file and execute everything below
d3.csv("D3_data_journalism/assets/data/data.csv").then(function(healthData, err) {
  if (err) throw err;

  // parse data
  healthData.forEach(function(data) {
    data.healthcare = +data.healthcare;
    data.poverty = +data.poverty;
    data.smokes = +data.smokes;
    data.age = +data.age;
  });

  var elem = svg.selectAll("g myCircleText").data(healthData);

  // xLinearScale function above csv import
  var xLinearScale = xScale(healthData, chosenXAxis);

  // Create y scale function
  var yLinearScale = yScale(healthData, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(healthData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.healthcare))
    .attr("r", 20)
    .attr("fill", "lightblue")
    .attr("opacity", ".5");

  // append circle text?
    var circlesText = circlesGroup
    .data(healthData)
    .enter()
    .append("text")
    .classed("aText", true)
    .text(healthData, d => d.abbr);


  // Create group for  2 x- axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);
  var labelsGroupY = chartGroup.append("g");

  var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  // append y axis
  var healthLabel = labelsGroupY.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - (margin.left - 20))
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "healthcare")
    .classed("axis-text", true)
    .classed("active",true)
    .text("Lacks Healthcare (%)");

  var smokeLabel = labelsGroupY.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height/2))
    .attr("dy", "1em")
    .attr("value", "smokes")
    .classed("axis-text", true)
    .classed("inactive", true)
    .text("Smokes (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(healthData, chosenXAxis);
        // yLinearScale = yScale(healthData, chosenYAxis);

        // updates x axis with transition
        xAxis = renderAxesX(xLinearScale, xAxis);
        // yAxis = renderAxesY(yLinearScale, yAxis);

        // updates circles with new x values
        circlesGroup = renderCirclesX(circlesGroup, xLinearScale, chosenXAxis);
        // circlesGroup = renderCirclesY(circlesGroup, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
        }
        if (chosenYAxis === "healthcare") {
          smokeLabel
            .classed("active", false)
            .classed("inactive", true);
          healthLabel
            .classed("active", true)
            .classed("inactive", false);
        }
        else {
          healthLabel
            .classed("active", false)
            .classed("inactive", true);
          smokeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
    labelsGroupY.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {

        // replaces chosenXAxis with value
        chosenYAxis = value;

        console.log(chosenYAxis)

        // functions here found above csv import
        // updates x scale for new data
        // xLinearScale = xScale(healthData, chosenXAxis);
        yLinearScale = yScale(healthData, chosenYAxis);

        // updates x axis with transition
        // xAxis = renderAxesX(xLinearScale, xAxis);
        yAxis = renderAxesY(yLinearScale, yAxis);

        // updates circles with new x values
        // circlesGroup = renderCirclesX(circlesGroup, xLinearScale, chosenXAxis);
        circlesGroup = renderCirclesY(circlesGroup, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
        }
        if (chosenYAxis === "healthcare") {
          smokeLabel
            .classed("active", false)
            .classed("inactive", true);
          healthLabel
            .classed("active", true)
            .classed("inactive", false);
        }
        else {
          healthLabel
            .classed("active", false)
            .classed("inactive", true);
          smokeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
}).catch(function(error) {
  console.log(error);
});
