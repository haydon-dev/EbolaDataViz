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
	
});