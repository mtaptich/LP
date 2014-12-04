var app = angular.module('LPapp', ['ngDropdowns'])

// Text environment function
app.directive('evt', function() {
  function link(scope, el, attr) {
    var label = attr.label
    var bg = attr.bg
    scope.labelstyle = { backgroundColor: bg }
    scope.label = attr.label
  }
  return {
    link: link,
    scope: {},
    restrict: 'E',
    template: function(elem, attr){
        return '<div ng-style="labelstyle">{{label}}</div>'
    }
  }
})

// 1D Bounds examples
app.controller('OneDcontroller', ['$scope', function($scope) {
  $scope.ex1 = [[{x: 78, text: "Your brother's max preferred temp."}],[{x: 90, text: "Your heating systems's max temp."}]];
  $scope.ex2 = [[{x: 78, text: ""}],[{x: 90, text: ""}], [{x: 55, text: "Your heating systems's min temp."}], [{x: 62.5, text: "AC required."}]];
  $scope.ex3 = [[{x: 78, text: "Your optimal dial selection should be 78 degrees F."}],[{x: 90, text: ""}], [{x: 55, text: ""}], [{x: 62.5, text: ""}]];
  $scope.ex4 = [[{x: 60, text: "60 is not >= 62!"}],[{x: 90, text: ""}], [{x: 55, text: ""}], [{x: 62.5, text: ""}]];
  $scope.ex5 = [[{x: 55, text: ""}], [{x: 62.5, text: ""}]];
  $scope.limits = {"ex1": 77.65, "ex2": 62.85, "ex3": 77.65, "ex5": 130}
}])
.directive("oneDBounds", function($parse, $window) {
  return{
    restrict: "EA",
    template: function(elem, attr){ 
      return "<svg id='"+attr.id+"'width='"+attr.w+"' height='"+attr.h+"' class='oneDBounds'></svg>"
    },
    link: function(scope, elem, attrs){
       var margin = {top: 5, right: 110, bottom: 50, left: 110},
          width = attrs.w - margin.left - margin.right,
          height = attrs.h - margin.top - margin.bottom,
          xAxis, x, y;

       var d3 = $window.d3;
       var svg = d3.select("#"+attrs.id+" svg").append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
          .on("mouseover", optimize)

       function drawscale(){
          x = d3.scale.linear()
              .range([0, width])
              .domain([55,90])

          y = d3.scale.linear()
              .range([height, 0])
              .domain([0,1])

          xAxis = d3.svg.axis()
              .scale(x)
              .orient("bottom")
              .ticks(7);

          svg.append("svg:g")
              .attr("class", "boundsunder")
              .attr("transform", "translate(0," + height + ")")
              .call(xAxis)
            .append("text")
              .attr("class", "label")
              .attr("x", width)
              .attr("y", +40)
              .style("text-anchor", "end")
              .text("x (Degrees Fahrenheit)");
       }

       function addbounds(b){
          var bounds = svg.selectAll(".bounds")
            .data(scope[b]).enter()

          bounds.append("line")
              .attr("class", "bounds")
              .attr("y1", y(0))
              .attr("y2", y(0.5))
              .attr("x1", function(d){ return x(+d[0].x)}) 
              .attr("x2", function(d){ return x(+d[0].x)}) 

          bounds.append("text")
            .attr("y", y(0.6))
            .attr("x", function(d){ return x(+d[0].x)}) 
            .style("text-anchor", "middle")
            .text(function(d){return d[0].text})
       }

       function optimize(){
          svg.selectAll("circle").remove()
          svg.on("mouseover", null)
          
          var circle = svg.append("circle")
            .attr("class", "dial")
            .attr("cx", x(67))
            .attr("cy", y(0.15))
            .attr("r", 6)
          if(attrs.id !="ex4"){
            circle.transition().delay(1000).duration(4000).ease("bounce").attr("cx", x(scope.limits[attrs.id]))
            setTimeout(function(){ svg.on("mouseover", optimize)}, 5000);
          } else{
            circle.transition().delay(1000).duration(4000).style("fill-opacity", 0.1).attr("r", 100).remove()
            setTimeout(function(){ svg.on("mouseover", optimize)}, 5000);
          }
       }

       drawscale()
       addbounds(attrs.id)

    }
  };
})

// 2D Bounds examples
app.controller('TwoDcontroller', ['$scope', function($scope) {
  $scope.example = "ex21"
  $scope.options = {"ex21": [{text: "x >= 0"}, {text: "x <= 10"},{text: "y >= 0"}, {text: "y <= 10"}], "ex22": [{text: "x >= 0"}, {text: "x <= 10"},{text: "y >= 0"}, {text: "y <= 10"}, {text: "1x + 1y <= 12"}, {text: "3x + 1y <= 25"}] }
  $scope.constraints = [{text: "x >= 0"}, {text: "x <= 10"},{text: "y >= 0"}, {text: "y <= 10"}];
  $scope.lines = [];
  $scope.obj = []
  $scope.yconstraint = '';
  $scope.xconstraint = '';
  $scope.bconstraint = '';
  $scope.yobj = 1;
  $scope.xobj = 1;
  $scope.UporDown = {color:'#000'}
  $scope.xybound = [{x: -1, y: 0, b:0, sign:"<="}, {x: 1, y: 0, b:10, sign:"<="}, {x: 0, y: -1, b:0, sign:"<="},{x: 0, y: 1, b:10, sign:"<="}];
  $scope.Z = {x: 0, y:0};

  $scope.updateexample = function(obj){
    $scope.example = obj.target.attributes["data-id"].value;
  }

  $scope.addconstraint = function() {
    if($scope.xconstraint !="" && $scope.yconstraint !="" && $scope.bconstraint !=""){

      array = [$scope.xconstraint, $scope.yconstraint]
      
      $scope.constraints.push(
          {
            text:array[0]+"x + "+array[1]+"y "+$scope.ddSelectSelected.text+" "+$scope.bconstraint
          }
        );

      if ($scope.yconstraint == 0) $scope.yconstraint = 0.00005;

      $scope.lines.push([
          {
            xdata: 0, ydata: +$scope.bconstraint / +$scope.yconstraint, bdata: +$scope.bconstraint, sign: $scope.ddSelectSelected.text
          },
          {
            xdata: 10, ydata: (+$scope.bconstraint -10*+$scope.xconstraint) / +$scope.yconstraint, bdata: +$scope.bconstraint, sign:$scope.ddSelectSelected.text
          }]
        )

      console.log([
          {
            xdata: 0, ydata: +$scope.bconstraint / +$scope.yconstraint, bdata: +$scope.bconstraint, sign: $scope.ddSelectSelected.text
          },
          {
            xdata: 10, ydata: (+$scope.bconstraint -10*+$scope.xconstraint) / +$scope.yconstraint, bdata: +$scope.bconstraint, sign:$scope.ddSelectSelected.text
          }])

      $scope.xybound.push({x:$scope.xconstraint, y:$scope.yconstraint, b:$scope.bconstraint, sign:$scope.ddSelectSelected.text})

      $scope.yconstraint = '';
      $scope.xconstraint = '';
      $scope.bconstraint = '';
    }
  };

  $scope.clear = function() {
    $scope.constraints = [{text: "x >= 0"}, {text: "x <= 10"},{text: "y >= 0"}, {text: "y <= 10"}];
    $scope.lines = [];
    $scope.myStyle = {color:'#C33851', background:'#fff', borderColor: 'red'}
    $scope.yobj = 1;
    $scope.xobj = 1;
    $scope.xybound = [{x: -1, y: 0, b:0, sign:"<="}, {x: 1, y: 0, b:10, sign:"<="}, {x: 0, y: -1, b:0, sign:"<="},{x: 0, y: 1, b:10, sign:"<="}];
    d3.selectAll(".area").remove()
    d3.selectAll(".line").remove()
    if(d3.select("#linearChart circle")[0][0] != null){
      d3.select("#linearChart circle")[0][0].__data__.y = 330;
      d3.select("#linearChart circle")[0][0].__data__.x = 0;
      d3.select("#linearChart circle").transition().duration(300).attr("cx", 0).attr("cy", 330)
    }
  };

  $scope.poplast = function(){
    if($scope.constraints.length > 4){
      var a = $scope.constraints.slice(0,-1)
      var b = $scope.lines.slice(0,-1)
      var c = $scope.xybound.slice(0,-1)
      $scope.constraints = a;
      $scope.lines = b;
      $scope.xybound = c;
    }
  }

  $scope.ddSelectOptions = [
      {
          text: '<=',
      },
      {
          text: '>=',

      }
  ];

  $scope.ddSelectSelected = { text: '<='}; 

  $scope.objOptions = [
      {
          text: 'min',
      },
      {
          text: 'max',

      }
  ];

  $scope.objSelected = { text: 'max'}; // Must be an object
}])
.directive("linearChart", function($parse, $window) {
  return{
    restrict: "EA",
    template: "<svg id='linearChart' width='600' height='400'></svg>",
    link: function(scope, elem, attrs){
       var margin = {top: 20, right: 20, bottom: 50, left: 50},
          width = 600 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom,
          xAxis, yAxis, line, x, ylc, line, areaup, clip, drag

       var d3 = $window.d3;
       var svg = d3.select("#linearChart").append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

       var clip = svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("id", "clip-rect")
            .attr("x", "0")
            .attr("y", "0")
            .attr("width", width)
            .attr("height", height);

       svg.append('svg:rect')
          .attr('width', width)
          .attr('height', height)
          .attr('fill', '#eee')
          .on("click", function(){

             if (d3.select("circle")[0][0] == null){
                  var a = d3.mouse(this);

                 svg.append("g")
                    .attr("class", "dot")
                  .selectAll("circle")
                    .data([{x: a[0], y: a[1]}])
                  .enter().append("circle")
                    .attr("r", 5)
                    .attr("cx", function(d) { return d.x; })
                    .attr("cy", function(d) { return d.y; })
                    .call(drag);
             }
          })
            
       var exp = $parse(attrs.chartData);
       var DataToPlot=exp(scope);

       // Update the constraints
       scope.$watchCollection(exp, function(newVal, oldVal) {
          var e = scope.xybound[scope.xybound.length - 1];
          var cx = d3.select("#linearChart circle")[0][0].__data__.x
          var cy = d3.select("#linearChart circle")[0][0].__data__.y

          if (e.sign == "<="){
            if (e.x * x.invert(cx) + e.y * ylc.invert(cy) > e.b){
              d3.select("#linearChart circle").transition().duration(500).attr("r", 10).transition().duration(300).attr("r", 1).remove()                   
            } 
            DataToPlot = newVal;
            drawline();
          } else{
            if (e.x * x.invert(cx) + e.y * ylc.invert(cy) < e.b){
              d3.select("#linearChart circle").transition().duration(300).attr("r", 8).transition().duration(300).attr("r", 1).remove()                      
            } 
            DataToPlot = newVal;
            drawline();
          }          
       });

       //Load Examples
       scope.$watch("example", function(oldVal, newVal){
          scope.clear()
          if(scope.example =="ex22"){
            d3.select("#linearChart circle")[0][0].__data__.y = ylc(4);
            d3.select("#linearChart circle")[0][0].__data__.x = x(4);
            d3.select("#linearChart circle").transition().duration(300).attr("cx", x(4)).attr("cy", ylc(4));

            scope.yobj = -2;
            scope.objSelected = { text: 'min'};

            scope.constraints.push({text: "1x + 1y <= 12"}, {text: "3x + 1y <= 25"}, {text: "-2x + 1y <= 5"}, {text: "3x + 1y >= 6"});
            scope.lines = [[{xdata: 12, ydata: 0, bdata: 12, sign:"<="}, {xdata: 0, ydata: 12, bdata: 12, sign:"<="}], [{xdata: 0, ydata: 25, bdata: 25, sign:"<="}, {xdata: 10, ydata: -5, bdata: 25, sign:"<="}],[{xdata: 0, ydata: 5, bdata: 5, sign:"<="}, {xdata: 10, ydata: 25, bdata: 5, sign:"<="}], [{xdata: 0, ydata: 6, bdata: 6, sign:">="}, {xdata: 10, ydata: -24, bdata: 6, sign:">="}]]
            scope.xybound.push({x: 1, y: 1, b:12, sign:"<="},{x: 3, y: 1, b:25, sign:"<="},{x: -2, y: 1, b:5, sign:"<="}, {x: 3, y: 1, b:6, sign:">="})  
          } else if (scope.example =="ex23"){
            d3.select("#linearChart circle")[0][0].__data__.y = ylc(5);
            d3.select("#linearChart circle")[0][0].__data__.x = x(5);
            d3.select("#linearChart circle").transition().duration(300).attr("cx", x(5)).attr("cy", ylc(5));

            scope.xobj = -1;
            scope.yobj = 1;
            scope.objSelected = { text: 'min'};

            scope.constraints.push({text: "0x + 1y <= 8"}, {text: "10x + 1y >= 10"}, {text: "-30x + 9y <= 30"}, {text: "0x + 1y >= 2"});
            scope.lines = [[{xdata: 0, ydata: 8, bdata: 8, sign:"<="}, {xdata: 10, ydata: 8, bdata: 8, sign:"<="}], [{xdata: 0, ydata: 10, bdata: 10, sign:">="}, {xdata: 10, ydata: -90, bdata: 10, sign:">="}], [{xdata: 10, ydata: 36.666666666666666666, bdata: 30, sign:"<="}, {xdata: 0, ydata: 3.333333333333333333, bdata: 30, sign:"<="}], [{xdata: 10, ydata: 2, bdata: 2, sign:">="}, {xdata: 0, ydata: 2, bdata: 2, sign:">="}]]
            scope.xybound.push({x: 0, y: 1, b:8, sign:"<="}, {x: 10, y: 1, b:10, sign:">="}, {x: -30, y: 9, b:30, sign:"<="}, {x: 0, y: 1, b:2, sign:">="})  
          }
          drawline() 
       })

       // Update the style of the objective result
       scope.$watchGroup(["Z.x","Z.y"], function(newVal, oldVal) {
          if(scope.objSelected.text =="max"){
            if((scope.xobj*newVal[0] + scope.yobj*newVal[1]) > (scope.xobj*oldVal[0] + scope.yobj*oldVal[1])){
              scope.UporDown = {color:'green'}
            }else{
              scope.UporDown = {color:'red'}
            }
          } else{
            if((scope.xobj*newVal[0] + scope.yobj*newVal[1]) < (scope.xobj*oldVal[0] + scope.yobj*oldVal[1])){
              scope.UporDown = {color:'green'}
            }else{
              scope.UporDown = {color:'red'}
            }
          }
       });
     
        function drawLineChart() {

          x = d3.scale.linear()
              .range([0, width])
              .domain([0,10])

          ylc = d3.scale.linear()
              .range([height, 0])
              .domain([0,10])

          line = d3.svg.line()
              .x(function(d) { return x(+d.xdata); })
              .y(function(d) { return ylc(+d.ydata); });

          areaup = d3.svg.area()
              .x(function(d) { return x(+d.xdata); })
              .y0(function(d) { return ylc(+d.ydata)})
              .y1(function(d){ 
                if (d.sign =="<="){
                  return ylc(10); 
                } else if(d.sign ==">="){
                  return ylc(0); 
                }
              });

          xAxis = d3.svg.axis()
              .scale(x)
              .orient("bottom")
              .ticks(5);

          yAxis = d3.svg.axis()
              .scale(ylc)
              .orient("left")
              .ticks(5);

          drag = d3.behavior.drag()
            .origin(function(d) { return d; })
            .on("dragstart", dragstarted)
            .on("drag", dragged)
            .on("dragend", dragended);

           svg.append("svg:g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + height + ")")
              .call(xAxis)
            .append("text")
              .attr("class", "label")
              .attr("x", width)
              .attr("y", +40)
              .style("text-anchor", "end")
              .text("x");

           svg.append("svg:g")
              .attr("class", "y axis")
              .call(yAxis)
            .append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", -50)
              .attr("dy", ".71em")
              .style("text-anchor", "end")
              .text("y");  

          svg.append("g")
              .attr("class", "dot")
            .selectAll("circle")
              .data([{x: 0, y: height}])
            .enter().append("circle")
              .attr("r", 5)
              .attr("cx", function(d) { return d.x; })
              .attr("cy", function(d) { return d.y; })
              .call(drag);

          function checkbounds(e, index, array){
            if (e.sign =="<="){
              return e.x * x.invert(d3.event.x) + e.y * ylc.invert(d3.event.y) <= e.b
            } else{
              return e.x * x.invert(d3.event.x) + e.y * ylc.invert(d3.event.y) >= e.b
            }
          }

          function dragstarted(d) {
            d3.event.sourceEvent.stopPropagation();
            d3.select(this).classed("dragging", true);
          }

          function dragged(d) {
            if(scope.xybound.every(checkbounds)){
              d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
              scope.Z.x = x.invert(d3.event.x);
              scope.Z.y = ylc.invert(d3.event.y);
              scope.$apply()
            }
          }

          function dragended(d) {
            d3.select(this).classed("dragging", false);
          }  
        }

        function drawline(){
          d3.selectAll(".area").remove()
          d3.selectAll(".line").remove()

          svg.selectAll("areas")
            .data(DataToPlot).enter()
           .append("path")
              .attr("class", "area")
              .attr("d", areaup)
              .attr("clip-path", "url(#clip)");

          svg.selectAll(".lines")
            .data(DataToPlot).enter()
           .append("path")
              .attr("class", "line")
              .attr("d", line)
              .attr("clip-path", "url(#clip)");
        }

        drawLineChart()

    }
  };
})

// Simple charts to explain bounds
app.directive('simpleChart',function($parse, $window){
  return {
    restrict: 'EA', 
    template: function(elem, attr){ 
      return "<svg id='"+attr.id+"'width='"+attr.w+"' height='"+attr.h+"' class='simplechart'></svg>"
    },
    link: function(scope, elem, attrs) {
       var margin = {top: 50, right: 20, bottom: 50, left: 55},
          width = attrs.w - margin.left - margin.right,
          height = attrs.h - margin.top - margin.bottom,
          xAxis, x, y;

       var funcs = {"1dline": oneDline, "1Dcircle": oneDcircle, "2Dline": twoDline, "2Darea": twoDarea}
       var d3 = $window.d3;
       var svg = d3.select("#"+attrs.id+" svg").append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
          .on("mouseover", funcs[attrs.func])

       var clip = svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("id", "clip-rect")
            .attr("x", "0")
            .attr("y", "0")
            .attr("width", width)
            .attr("height", height);

       svg.append("text")
          .attr("y", -20)
          .attr("x", width/2)
          .text(attrs.t)
          .style("text-anchor", "middle")
          .style("font-size", 18)

       function drawscale(){
          x = d3.scale.linear()
              .range([0, width])
              .domain([0,10])

          y = d3.scale.linear()
              .range([height, 0])
              .domain([0,10])

          xAxis = d3.svg.axis()
              .scale(x)
              .orient("bottom")
              .ticks(5);

          svg.append("svg:g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + height + ")")
              .call(xAxis)
            .append("text")
              .attr("class", "label")
              .attr("x", width)
              .attr("y", +40)
              .style("text-anchor", "end")
              .text("x");

          if(attrs.dim =="2"){
            svg.append('svg:rect')
              .attr('width', width)
              .attr('height', height)
              .attr('fill', '#eee')

            yAxis = d3.svg.axis()
              .scale(y)
              .orient("left")
              .ticks(5);

            svg.append("svg:g")
                .attr("class", "y axis")
                .call(yAxis)
              .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", -50)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("y");  
          }
       }

       function oneDline(){
          svg.selectAll(".bounds").remove()
          svg.on("mouseover", null)

          var line = svg.append("line")
            .attr("class", "bounds")
            .attr("x1", x(0))
            .attr("x2", x(0))
            .attr("y1", height)
            .attr("y2", height)
            .style("stroke", "#B22222")

          line.transition().delay(100).duration(4000).attr("x2", x(attrs.xb))
          setTimeout(function(){ svg.on("mouseover", oneDline)}, 5000);
       }

       function oneDcircle(){
          svg.selectAll("circle").remove()
          svg.on("mouseover", null)

          var line = svg.append("circle")
            .attr("class", "dial")
            .attr("cx", x(attrs.xb))
            .attr("cy", -20)
            .attr("r", 10)
            .style("fill", "#B22222")
            .attr("clip-path", "url(#clip)");

          line.transition().duration(4000).ease("bounce").attr("cy", height-10)
          setTimeout(function(){ svg.on("mouseover", oneDcircle)}, 5000);
       }

       function twoDline(){
          svg.selectAll(".bounds").remove()
          svg.on("mouseover", null)

          var line = svg.append("line")
            .attr("class", "bounds")
            .attr("x1", x(0))
            .attr("x2", x(0))
            .attr("y1", y(attrs.yb))
            .attr("y2", y(attrs.yb))
            .style("stroke", "#B22222")

          line.transition().delay(100).duration(4000).attr("x2", x(attrs.xb)).attr("y2", y(0))
          setTimeout(function(){ svg.on("mouseover", twoDline)}, 5000);
       }

       function twoDarea(){
          svg.selectAll(".boundedarea").remove()
          svg.on("mouseover", null)

          var area = d3.svg.area()
              .x(function(d) { return x(+d.x); })
              .y0(function(d) { return y(0); })
              .y1(function(d) { return y(+d.y); });

          layers0 = [{x:0, y:+attrs.yb}, {x:0, y:+attrs.yb}]
          layers1 = [{x:0, y:+attrs.yb}, {x:attrs.xb, y: 0}]

          var fr = svg.append("path")
                  .attr("class", "boundedarea")
                  .datum(layers0)
                  .attr("d", area)
          
          fr.datum(layers1)
            .transition()
              .duration(2500)
              .attr("d", area);
          setTimeout(function(){ svg.on("mouseover", twoDarea)}, 5000);
          
       }
      
      drawscale()
    }
  };
});

// Chart to explain extreme points
app.directive('extremePoints', function($parse,$window){
  // Runs during compile
  return {
    restrict: 'EA', // E = Element, A = Attribute, C = Class, M = Comment
    template: function(elem, attr){ 
      return "<svg id='"+attr.id+"'width='"+attr.w+"' height='"+attr.h+"'></svg>"
    },
    link: function(scope, elem, attrs) {
      var margin = {top: 0, right: 20, bottom: 0, left: 20},
          width = attrs.w - margin.left - margin.right,
          height = attrs.h - margin.top - margin.bottom,
          x, y, areaup, line;

       var d3 = $window.d3;
       var svg = d3.select("#"+attrs.id+" svg").append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      
      function drawscale(){
          x = d3.scale.linear()
              .range([0, width])
              .domain([0,10])

          y = d3.scale.linear()
              .range([height, 0])
              .domain([0,10])

          areaup = d3.svg.area()
              .x(function(d) { return x(+d.x); })
              .y0(function(d) { return y(+d.y)})
              .y1(function(d){ 
                if (d.sign =="<="){
                  return y(10); 
                } else if(d.sign ==">="){
                  return y(0); 
                }
              });

          line = d3.svg.line()
              .x(function(d) { return x(+d.x); })
              .y(function(d) { return y(+d.y); });

          svg.append('svg:rect')
            .attr('width', width)
            .attr('height', height)
            .attr('fill', '#eee')
      }

      function addbounds(){

        var data = [[{x:0, y:15, sign:">="}, {x:10, y:-18, sign:">="}], [{x:0, y:4, sign:"<="}, {x:10, y:14, sign:"<="}], [{x:0, y:1, sign:">="}, {x:10, y:1, sign:">="}], [{x:0, y:18, sign:"<="}, {x:10, y:0, sign:"<="}]]

        svg.selectAll(".xp")
            .data(data).enter()
           .append("path")
              .attr("class", "xp")
              .attr("d", areaup)

        svg.selectAll(".xpline")
            .data(data).enter()
           .append("path")
              .attr("class", "xpline")
              .attr("d", line)

      }

      function drawpairs(){
        var data = [[{x:5, y:3}, {x:8, y:2}], [{x:2, y:7}, {x:4, y:5.4}]];
        var cdata = [{x:5, y:3, inside: 1}, {x:8, y:2, inside: 1},{x:2, y:7, inside: 0}, {x:4, y:5.4, inside: 1}]

        svg.selectAll(".pairs")
            .data(data).enter()
           .append("path")
              .attr("class", "pairs")
              .attr("d", line)

        svg.selectAll(".pts")
            .data(cdata).enter()
           .append("circle")
              .attr("fill", function(d){ if(d.inside ==1){ return "#B22222"} else{ return "#ccc"}})
              .attr("cx", function(d){ return x(+d.x)})
              .attr("cy", function(d){ return y(+d.y)})
              .attr("r", 10)

      }

      drawscale()
      addbounds()
      drawpairs()
      
    }
  };
});



