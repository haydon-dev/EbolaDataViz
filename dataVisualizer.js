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
	.attr("width", 2 * BLOCK)
	.attr("height", 1 * BLOCK)
	.attr("id", "casesDeathsBar");
var map = body.append("svg")
	.attr("width", 3 * BLOCK)
	.attr("height", 3 * BLOCK)
	.attr("id", "map");
var stackedColumn = body.append("svg")
	.attr("width", 3 * BLOCK)
	.attr("height", 1 * BLOCK)
	.attr("id", "stackedColumn");
var line = body.append("svg")
	.attr("width", 3 * BLOCK)
	.attr("height", 1 * BLOCK)
	.attr("id", "line");

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
	
	//Create groups of data for relevant stats
	var types = byType.group().reduceSum(function(d){	return d.Value;	});
	var cases = byDate.group().reduceSum(function(d){
		if(d.Type === "Cases")
			return d.Value;
		return 0;
	});
	var deaths = byDate.group.reduceSum(function(d){
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
	
	//Define Date bounds
	var firstDay = byDate.bottom(1)[0].Date;
	var lastDay = byDate.top(1)[0].Date;
	
	
	
});