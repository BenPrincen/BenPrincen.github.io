let GEO_JSON_1 = "/geo_data/japan/geojson/level_1/ogr_japan_1.json";
let JPN_POP_DEN_CSV = "/jpn_prefecture_pop.csv"; 

//Width and height
var w = 500;
var h = 600;

//Create SVG element
var svg = d3.select("body")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

var defs = svg.append("defs")

var linearGradient = defs.append("linearGradient")
                            .attr("id", "linear-gradient")
                            .attr("x1", "0%")
                            .attr("y1", "0%")
                            .attr("x2", "100%")
                            .attr("y2", "0%");

linearGradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", "#0000ff")

linearGradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", "#000000")

var legend = svg.append("rect")
                .attr("width", w / 2 + 6)
                .attr("height", 10)
                .attr("x", 5)
                .attr("y", h - 55)
                .style("fill", "url(#linear-gradient)")

var colorScale = d3.scaleLinear().range([255, 0]);
var legendScale = d3.scaleLinear().range([0, 255]);
var colorAxis = d3.axisBottom(legendScale).ticks(5);


d3.csv(JPN_POP_DEN_CSV).then(function(data) {
    let max_pop_density = d3.max(data, function(d) {
        return parseFloat(d["2015_pop_den"].replace(/,/g, ''));
    });
    // let min_pop_density = d3.min(data, function(d) {
    //     return parseFloat(d["2015_pop_den"].replace(/,/g, ''));
    // });

    let round_up = Math.ceil(max_pop_density / 1000) * 1000;
    console.log(max_pop_density);
    console.log(round_up)

    colorScale.domain([0, round_up]);
    legendScale.domain([0, round_up]);

    x = svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(5," + (h - 45) + ")")
        .call(colorAxis)

    d3.json(GEO_JSON_1).then(function(geo_data) {
        for (var i = 0; i < data.length; i++) {
            let prefecture = data[i]["prefectures"];
            let prefecture_pop_den = parseFloat(data[i]["2015_pop_den"].replace(/,/g, ''));

            for (var j = 0; j < geo_data.features.length; j++) {
                let geo_json_prefecture = geo_data.features[j].properties["NAME_1"];
                if(geo_json_prefecture == prefecture) {
                    geo_data.features[j].properties.value = prefecture_pop_den;
                    j = geo_data.features.length;
                }
            }
        }

        let projection = d3.geoIdentity()
                        .reflectY(true)
                        .fitSize([w, h - 100], geo_data);

        let geo_path = d3.geoPath().projection(projection);
        svg.append("g")
            .selectAll("path")
            .data(geo_data.features)
            .enter()
            .append("path")
            .attr("d", geo_path)
            .style("fill", function(d) {
                let value = d.properties.value;
                if (value) {
                    return "rgb(0, 0, " + colorScale(value).toString() + ")";
                } else {
                    console.log("unsuccessful:", d.properties["NAME_1"]);
                    return "#ccc";
                }

            })

    });
});

//Load in GeoJSON data
// d3.json(GEO_JSON_1).then(function(json) {
    // console.log(json);
    // Bind data and create one path per GeoJSON feature
    // projection_2 = d3.geoIdentity()
                    // .reflectY(true)
                    // .fitSize([w, h], json);
    // console.log(json.key)
    // svg.selectAll("path")
        // .data(json.features)
        // .enter()
        // .append("path")
        // .attr("d", d3.geoPath().projection(projection_2));
// 
// });
			
