var test; //DEBUGGING VARIABLE

//Unit to be used for creating equal/proportional sized graphics
//	Graphics can be given sizes in terms of BLOCKs (1x2, 2x2, 1x1, etc.)
//	This way we can scale the graphics up/down easily and in one place
var BLOCK = 250;

var body = d3.select("body");
//Create SVG elements for each graph
var mortality = body.append("svg")
	.attr("width", 1 * BLOCK)
	.attr("height", 1 * BLOCK)
	.attr("id", "mortality");
var casesDeathsBar = body.append("svg")
	.attr("width", 1 * BLOCK)
	.attr("height", 1 * BLOCK)
	.attr("id", "casesDeathsBar");
//This 3:2 ratio fits our affected countries well
var map = body.append("svg")
	.attr("width", 3 * BLOCK)
	.attr("height", 2 * BLOCK)
	.attr("id", "map");
var stackedColumn = body.append("svg")
	.attr("width", 3 * BLOCK)
	.attr("height", 1 * BLOCK)
	.attr("id", "stackedColumn");
var line = body.append("svg")
	.attr("width", 3 * BLOCK)
	.attr("height", 1 * BLOCK)
	.attr("id", "line");
	
	
var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

d3.csv("graph_data.csv", function(err, data){
	
	var countryNameRange = [];
	var parseDate = d3.time.format("%m/%_d/%Y").parse;
	
	//Handle Date formatting and list of countries for imported data
	data.forEach(function(d){
		d.Date = parseDate(d.Date);
		
		if($.inArray(d.Country, countryNameRange) === -1){
			countryNameRange.push(d.Country);
		}
	});
	
	
	//Use Crossfilter to group data into better sets
	var xfilter = crossfilter(data);
	var allData = xfilter.groupAll();
	
	//Define dimensions for filtering data
	var byDate = xfilter.dimension(function(d){	return d.Date;	});
	var byCountry = xfilter.dimension(function(d){	return d.Country;	});
	var byType = xfilter.dimension(function(d){	return d.Type;	});
	var byMonth = xfilter.dimension(function(d){
		return d.Date.toString().substr(4,3);
	});
	
	//Create groups of data for relevant stats
	var types = byType.group().reduceSum(function(d){	return d.Value;	});
	var cases = byDate.group().reduceSum(function(d){
		if(d.Type === "Cases")
			return d.Value;
		return 0;
	});
	var deaths = byDate.group().reduceSum(function(d){
		if(d.Type === "Deaths")
			return d.Value;
		return 0;
	});
	var countries = byCountry.group().reduceSum(function(d){	return d.Value;	});
	var totalCases = byDate.group().reduceSum(function(d){
		if(d.Type === "Cases")
			return d.TotalValue;
		return 0;
	});
	var totalDeaths = byDate.group().reduceSum(function(d){
		if(d.Type === "Deaths")
			return d.TotalValue;
		return 0;
	});
	
	var casesAndDeaths = [];
	var casesByMonth = byMonth.group().reduceSum(function(d){
		if(d.Type === "Cases"){
			return d.Value;
		}
		return 0;
	});
	var deathsByMonth = byMonth.group().reduceSum(function(d){
		if(d.Type === "Deaths"){
			return d.Value;
		}
		return 0;
	});
	
	
	//Define Date bounds
	var firstDay = byDate.bottom(1)[0].Date;
	var lastDay = byDate.top(1)[0].Date;
	
	//Draw cases vs deaths bar
	var numCases = totalCases.all()[totalCases.all().length-1];
	var numDeaths = totalDeaths.all()[totalDeaths.all().length-1];
	var barXScale = d3.scale.ordinal()
		.domain([numCases.value, numDeaths.value])
		.rangeRoundBands([0, BLOCK], 0.05);
	var barYScale = d3.scale.linear()
		.domain([0, d3.max([numCases.value, numDeaths.value])])
		.range([0, BLOCK]);
	function setBars(){
		var bars = casesDeathsBar.selectAll('rect')
			.data([numCases.value, numDeaths.value])
			.enter().append('rect')
				.attr("class", "bar")
				.attr("x", function(d,i){
					//console.log(d + " " + d.value);
					return barXScale(d);
				})
				.attr("y", function(d,i){
					return BLOCK - barYScale(d);
				})
				.attr("width", barXScale.rangeBand())
				.attr("height", function(d){
					return barYScale(d);
				})
				.attr("fill", function(d,i){
					if(i < 1)
						return '#FF3333';
					else
						return '#222222';
				})
				.append("title")
				   .text(function(d, i) {
						if(i >= 1)
							return "Total Deaths: " + d;
						else
							return "Total Cases: " + d;
				   });
	}
	function setText(){
		casesDeathsBar.selectAll("text")
		   .data([numCases.value, numDeaths.value])
		   .enter()
		   .append("text")
		   .text(function(d) {
				return d;
		   })
		   .attr("text-anchor", "middle")
		   .attr("x", function(d, i) {
				return barXScale(d) + barXScale.rangeBand() / 2;
		   })
		   .attr("y", function(d) {
				return BLOCK - barYScale(d) + 24;
		   })
		   .attr("font-family", "'Ropa Sans', sans-serif")
		   .attr("font-size", "12px")
		   .attr("fill", function(d,i) {
				if(i >= 1)
					return "white";
				else
					return "black";
		   });
	}
	setBars();
	setText();
	
	test = {
		data: data,
		cases: casesByMonth,
		countries: countries,
		cnr: countryNameRange,
		totalCases: numCases,
		totalDeaths: numDeaths,
		xScale: barXScale,
		yScale: barYScale
	};
	
	//Sets up a path to draw the map
	var projection = d3.geo.mercator()
						.scale(1.25 * BLOCK)
						.center([-20,25]);
	var path = d3.geo.path().projection(projection);	
	
	d3.json("locations.json", function(error, countriesJSON){
		
		//Map of outbreak area
		map.selectAll('path')
			.data(countriesJSON.features)
			.enter().append('path')
				.attr('d', path)
				.attr('class','border')
				/*.attr('id',function(d){
					return d.properties.NAME;
				})*/
				//Set fill to a gradient depending on cases
				.attr('id', function(d){
					if(countryNameRange.indexOf(d.properties.NAME) !== -1){
						var cases;
						for(var x = 0; x < countries.all().length; x++){
							if(countries.all()[x].key === d.properties.NAME)
								cases = countries.all()[x].value;
						}
						//console.log(d.properties.NAME + " " + cases);
						if(cases >= 5000)
							return 'veryhigh';
						if(cases >= 2000)
							return 'high';
						if(cases >= 500)
							return 'medium';
						if(cases >= 100)
							return 'low';
						if(cases > 10)
							return 'verylow';
						return 'few';
					}
					//Country is unaffected, draw as default color
					return 'none';
				})
				.append("title")
				.text(function(d) {
					var cases;
					for(var x = 0; x < countries.all().length; x++){
						if(countries.all()[x].key === d.properties.NAME)
							cases = countries.all()[x].value;
					}
					if(countryNameRange.indexOf(d.properties.NAME) === -1)
						cases = 0;
					 return 'Country: ' + d.properties.NAME + '\nCases: ' + cases;
			   });
		
		
	});
	
});