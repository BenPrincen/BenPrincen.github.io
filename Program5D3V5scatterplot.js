// Implemented pan-drag and zoom

// constants
const CSV_NAME = "Program5D3V5scatterdata.csv";
const MAX_RADIUS = 50;
const MIN_RADIUS = 10;
const LEGEND_WIDTH = MAX_RADIUS + 225;
const LEGEND_HEIGHT = 2 * (MAX_RADIUS + (MAX_RADIUS + MIN_RADIUS) / 2 + MIN_RADIUS) + 30;
const FONT_SIZE = 12;
const TOOL_TIP_HEIGHT = FONT_SIZE * 8;
const TOOL_TIP_WIDTH = 250;

// globals
var x;
var y;
var global_xScale;
var global_yScale;

var prev_transform = null;

// functions
function rowConverter(data) {
    return {"country"       : data["country"],
            "gdp"           : parseFloat(data["gdp"]),
            "population"    : data["population"],
            "ecc"           : parseFloat(data["ecc"]),
            "ec"            : parseFloat(data["ec"])
        };
}

var zoom = d3.zoom()
    .scaleExtent([1, 40])
    .on("zoom", zoomed);

var margin = {top: 20, right: 80, bottom: 30, left: 50},
    width = 1000 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

const g = svg.append("g")
    .attr("cursor", "grab");

function zoomed() {
    prev_transform = d3.event.transform;
    d3.selectAll(".country_ec").attr("transform", d3.event.transform);
    d3.selectAll(".countries").attr("transform", d3.event.transform);
    d3.selectAll(".tool_tip").attr("transform", d3.event.transform);
    d3.selectAll(".tool_tip_text").attr("transform", d3.event.transform);
    x.call(xAxis.scale(d3.event.transform.rescaleX(xScale)));
    y.call(yAxis.scale(d3.event.transform.rescaleY(yScale)));
}

function onCreateToolTip(d) {

    svg.append("rect")
        .attr("class", "tool_tip")
        .attr("x", xScale(d["gdp"]))
        .attr("y", yScale(d["ecc"]))
        .attr("transform", prev_transform)
        .attr("width", TOOL_TIP_WIDTH)
        .attr("height", TOOL_TIP_HEIGHT)
        .style("fill", "rgb(200, 200, 200)")

    // tool tip country title
    svg.append("text")
        .attr("x", xScale(d["gdp"]) + TOOL_TIP_WIDTH / 2)
        .attr("y", yScale(d["ecc"] - 12))
        .attr("transform", prev_transform)
        .attr("text-anchor", "middle")
        .attr("class", "tool_tip_text")
        .text(d["country"]);
    
    // tool tip colons
    svg.append("text")
        .attr("x", xScale(d["gdp"]) + TOOL_TIP_WIDTH / 2)
        .attr("y", yScale(d["ecc"] - 24))
        .attr("transform", prev_transform)
        .attr("text-anchor", "middle")
        .attr("class", "tool_tip_text")
        .text(":");

    svg.append("text")
        .attr("x", xScale(d["gdp"]) + TOOL_TIP_WIDTH / 2)
        .attr("y", yScale(d["ecc"] - 36))
        .attr("transform", prev_transform)
        .attr("text-anchor", "middle")
        .attr("class", "tool_tip_text")
        .text(":");

    svg.append("text")
        .attr("x", xScale(d["gdp"]) + TOOL_TIP_WIDTH / 2)
        .attr("y", yScale(d["ecc"] - 48))
        .attr("transform", prev_transform)
        .attr("text-anchor", "middle")
        .attr("class", "tool_tip_text")
        .text(":");

    svg.append("text")
        .attr("x", xScale(d["gdp"]) + TOOL_TIP_WIDTH / 2)
        .attr("y", yScale(d["ecc"] - 60))
        .attr("transform", prev_transform)
        .attr("text-anchor", "middle")
        .attr("class", "tool_tip_text")
        .text(":");

    // tool tip labels
    svg.append("text")
        .attr("x", xScale(d["gdp"]) + 5)
        .attr("y", yScale(d["ecc"] - 24))
        .attr("transform", prev_transform)
        .attr("text-anchor", "start")
        .attr("class", "tool_tip_text")
        .text("Population");

    svg.append("text")
        .attr("x", xScale(d["gdp"]) + 5)
        .attr("y", yScale(d["ecc"] - 36))
        .attr("transform", prev_transform)
        .attr("text-anchor", "start")
        .attr("class", "tool_tip_text")
        .text("GDP");

    svg.append("text")
        .attr("x", xScale(d["gdp"]) + 5)
        .attr("y", yScale(d["ecc"] - 48))
        .attr("transform", prev_transform)
        .attr("text-anchor", "start")
        .attr("class", "tool_tip_text")
        .text("EPC");

    svg.append("text")
        .attr("x", xScale(d["gdp"]) + 5)
        .attr("y", yScale(d["ecc"] - 60))
        .attr("transform", prev_transform)
        .attr("text-anchor", "start")
        .attr("class", "tool_tip_text")
        .text("Total");

    // tool tip information
    svg.append("text")
        .attr("x", xScale(d["gdp"]) + TOOL_TIP_WIDTH - 5)
        .attr("y", yScale(d["ecc"] - 24))
        .attr("transform", prev_transform)
        .attr("text-anchor", "end")
        .attr("class", "tool_tip_text")
        .text(d["population"].toString() + " Million");

    svg.append("text")
        .attr("x", xScale(d["gdp"]) + TOOL_TIP_WIDTH - 5)
        .attr("y", yScale(d["ecc"] - 36))
        .attr("transform", prev_transform)
        .attr("text-anchor", "end")
        .attr("class", "tool_tip_text")
        .text("$" + d["gdp"].toString() + " Trillion");

    svg.append("text")
        .attr("x", xScale(d["gdp"]) + TOOL_TIP_WIDTH - 5)
        .attr("y", yScale(d["ecc"] - 48))
        .attr("transform", prev_transform)
        .attr("text-anchor", "end")
        .attr("class", "tool_tip_text")
        .text(d["ecc"].toString() + " Million BTUs");

    svg.append("text")
        .attr("x", xScale(d["gdp"]) + TOOL_TIP_WIDTH - 5)
        .attr("y", yScale(d["ecc"] - 60))
        .attr("transform", prev_transform)
        .attr("text-anchor", "end")
        .attr("class", "tool_tip_text")
        .text(d["ec"].toString() + " Trillion BTUs");
}

// Create scales
var xScale = d3.scaleLinear().range([0, width - LEGEND_WIDTH - MAX_RADIUS]);
var yScale = d3.scaleLinear().range([height, MAX_RADIUS]);
var radScale = d3.scaleLinear().range([5, 50]);
var colorScaleArray = [d3.schemeSet1, d3.schemeSet2];
var colorScale = d3.scaleOrdinal().range(d3.schemeSet1.concat(d3.schemeSet2))

// Create axes
var xAxis = d3.axisBottom(xScale).tickFormat(d3.format(".1f")).tickPadding(2);
var yAxis = d3.axisLeft(yScale).tickPadding(2);


// get data and display info
d3.csv(CSV_NAME, rowConverter).then(function(data) {
    
    // create lists to make calculating max values easier
    var list_ecc = [];
    var list_ec = [];
    var list_gdp = [];
    var list_countries = [];

    for (var i = 0; i < data.length; i++) {
        list_ecc.push(data[i]["ecc"]);
        list_ec.push(data[i]["ec"]);
        list_gdp.push(data[i]["gdp"]);
        list_countries.push(data[i]["country"]);
    }

    console.log(list_ecc);
    console.log(list_ec);
    console.log(list_gdp);
    console.log(list_countries);
    colorScale.domain(list_countries);

    // get max values for domains
    var max_ecc = d3.max(list_ecc);
    var max_ec = d3.max(list_ec);
    var max_gdp = d3.max(list_gdp);

    var min_ec = d3.min(list_ec); 

    // set domains
    xScale.domain([0, max_gdp]);
    yScale.domain([0, max_ecc]);
    radScale.domain([min_ec, max_ec]);

    g.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "country_ec")
        .attr("r", function (d) {return radScale(d["ec"]);})
        .attr("cx", function (d) {return xScale(d["gdp"]);})
        .attr("cy", function (d) {return yScale(d["ecc"]);})
        .style("fill", function(d) {
            return colorScale(d["country"]);
        })
        .on("mouseover", function (d) {
            onCreateToolTip(d);
        })
        .on("mouseout", function () {
            d3.selectAll(".tool_tip").remove();

            d3.selectAll(".tool_tip_text").remove();
        }); 
    
    // draw circle titles
    g.selectAll(".countries")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "countries")
        .attr("x", function(d) {return xScale(d["gdp"]);})
        .attr("y", function(d) {return yScale(d["ecc"]);})
        .attr("text-anchor", "start")
        .attr("font-size", "10px")
        .text(function(d) {return d["country"];})
        .on("mouseover", function (d) {
            onCreateToolTip(d);
        })
        .on("mouseout", function () {
            d3.selectAll(".tool_tip").remove();

            d3.selectAll(".tool_tip_text").remove();
        }); 

    // draw x axis
    x = svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        
    // draw y axis
    y = svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)

    // draw x axis title
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(" + ((width - LEGEND_WIDTH - MAX_RADIUS) / 2) + ", " + (height + margin.bottom - 4) + ")")
        .text("GDP (in Trillions of US Dollars)")
        .style("font", "Times")
        .attr("font-size", "12px");

    // draw y axis title
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(" + (-margin.left / 1.5) + ", " + ((height + MAX_RADIUS) / 2) + ")rotate(-90)")
        .text("Energy Consumption per Capita (in Million BTUs per person)")
        .style("font", "Times")
        .attr("font-size", "12px");

    // draw legend
    svg.append("rect")
        .attr("x", width - LEGEND_WIDTH)
        .attr("y", height - LEGEND_HEIGHT - 10)
        .attr("width", LEGEND_WIDTH)
        .attr("height", LEGEND_HEIGHT)
        .style("fill", "rgb(200, 200, 200)");

    svg.append("circle")
        .attr("cx", width - MAX_RADIUS - 20)
        .attr("cy", height - MAX_RADIUS - 15)
        .attr("r", MAX_RADIUS)
        .style("fill", "white");

    svg.append("circle")
        .attr("cx", width - MAX_RADIUS - 20)
        .attr("cy", height - 2 * MAX_RADIUS - (MIN_RADIUS + MAX_RADIUS) / 2 - 20)
        .attr("r", (MAX_RADIUS + MIN_RADIUS) / 2)
        .style("fill", "white");

    svg.append("circle")
        .attr("cx", width - MAX_RADIUS - 20)
        .attr("cy", height - 2 * MAX_RADIUS - (MIN_RADIUS + MAX_RADIUS) - MIN_RADIUS - 25)
        .attr("r", MIN_RADIUS)
        .style("fill", "white");

    svg.append("text")
        .attr("x", width - LEGEND_WIDTH + 10)
        .attr("y", height - 12 - MAX_RADIUS)
        .text((parseInt(radScale(MAX_RADIUS)).toString()) + " Trillion BTUs")
        .style("font", "Times")
        .attr("font-size", "12px");

    svg.append("text")
        .attr("x", width - LEGEND_WIDTH + 10)
        .attr("y", height - 12 - 2 * MAX_RADIUS - (MIN_RADIUS + MAX_RADIUS) / 2 - 5)
        .text((parseInt(radScale((MIN_RADIUS + MAX_RADIUS) / 2)).toString()) + " Trillion BTUs")
        .style("font", "Times")
        .attr("font-size", "12px");

    svg.append("text")
        .attr("x", width - LEGEND_WIDTH + 10)
        .attr("y", height - 12 - 2 * MAX_RADIUS - (MIN_RADIUS + MAX_RADIUS) - MIN_RADIUS - 10)
        .text((parseInt(radScale(MIN_RADIUS)).toString()) + " Trillion BTUs")
        .style("font", "Times")
        .attr("font-size", "12px");
    
    svg.append("text")
        .attr("x", width - LEGEND_WIDTH / 2 + 10)
        .attr("y", height - LEGEND_HEIGHT)
        .text("Total Energy Consumption")
        .attr("text-anchor", "middle")
        .style("font", "Times")
        .attr("font-size", "12px");
    
    svg.call(zoom);
});