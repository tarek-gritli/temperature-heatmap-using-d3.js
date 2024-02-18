import * as d3 from "d3";
import colorRanges from "./data/colorRanges";

const w=1000;
const h=500;
const padding=60;
// Create title and description for the heatmap
d3.select("main")
  .append("h1")
  .attr("id","title")
  .text("Monthly Global Land-Surface Temperature")
d3.select("main")
  .append("h3")
  .attr("id","description")
  .text("1753 - 2015: base temperature 8.66℃")

// Create svg element
const svg = d3.select("main")
              .append("svg")
              .attr("width",w)
              .attr("height",h);
// Create tooltip for the heatmap
const tooltip=d3.select("main").append("div")
               .attr("id","tooltip")
// Fetch data from the server
const method="GET";
const url="https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";
const req = new XMLHttpRequest();
req.open(method,url,true)
req.send();
req.onload=function(){
    let data=JSON.parse(req.responseText);
    const baseTemp=data.baseTemperature;
    data=data.monthlyVariance;
    const minYear=d3.min(data,d=>d.year);
    const maxYear=d3.max(data,d=>d.year);
    // Create scales for x and y axis
    const xScale=d3.scaleLinear()
                   .domain([minYear,maxYear+1])
                   .range([padding,w-2*padding]);
    const yScale=d3.scaleLinear()
                   .domain([1,12])
                   .range([padding,h-2*padding]);
    // Create x and y axis
    const xAxis=d3.axisBottom(xScale)
                  .tickFormat(d3.format('d'));
    const yAxis=d3.axisLeft(yScale)
                  .tickFormat(d => d3.timeFormat('%B')(new Date(2000, d-1, 1)));
    // Append x and y axis to the svg
    svg.append("g")
       .attr("id","x-axis")
       .attr("transform",`translate(0,${h-padding})`)
       .call(xAxis);
    svg.append("g")
       .attr("id","y-axis")
       .attr("transform",`translate(${padding},${padding})`)
       .call(yAxis);
    const handleMouseOut=()=>{
        return d3.select("#tooltip")
                 .style("opacity",0)
    }
    const handleMouseOver=(d)=>{
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return tooltip.style("opacity",0.75)
                      .html(months[d.month-1]+" "+d.year+"<br>"+(baseTemp+d.variance).toFixed(1)+"°C<br>"+d.variance.toFixed(1)+"°C")
                      .style("left",(d3.event.pageX)+"px")
                      .style("top",(d3.event.pageY+10)+"px")
                      .attr("data-year",d.year)
    }
    // Create heatmap and append it to the svg
    svg.selectAll("rect")
       .data(data)
       .enter()
       .append("rect")
       .attr("class","cell")
       .attr("width",(w-2*padding)/(maxYear-minYear+1))
       .attr("height",(h-2*padding)/12)
       .attr("x",d=>xScale(d.year)+1)
       .attr("y",d=>yScale(d.month-1)+padding-2.5)
       .attr("data-month",d=>d.month-1)
       .attr("data-year",d=>d.year)
       .attr("data-temp",d=>d.variance+baseTemp)
       .on("mouseover",handleMouseOver)
       .on("mouseout",handleMouseOut)
       .attr("fill",d=>{
            const temp=d.variance+baseTemp;
            if(temp<=2.8) return colorRanges[0].color;
            else if(temp>2.8 && temp<=3.9) return colorRanges[1].color;
            else if(temp>3.9 && temp<=5) return colorRanges[2].color;
            else if(temp>5 && temp<=6.1) return colorRanges[3].color;
            else if(temp>6.1 && temp<=7.2) return colorRanges[4].color;
            else if(temp>7.2 && temp<=8.3) return colorRanges[5].color;
            else if(temp>8.3 && temp<=9.5) return colorRanges[6].color;
            else if(temp>9.5 && temp<=10.6) return colorRanges[7].color;
            else if(temp>10.6 && temp<=11.7) return colorRanges[8].color;
            else if(temp>11.7 && temp<=12.8) return colorRanges[9].color;
            else return colorRanges[10].color;
       })
       // Create legend for the heatmap and append it to the svg
      const legend = svg.append("g")
        .attr("id", "legend")
        .attr("transform", `translate(${w-padding-40}, ${h/2-2*padding})`);
      legend.selectAll("rect")
        .data(colorRanges)
        .enter()
        .append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .attr("y", (d, i) => i * 25)
        .attr("fill", d => d.color);
      
      legend.selectAll("text")
        .data(colorRanges)
        .enter()
        .append("text")
        .attr("x", 30)
        .attr("y", (d, i) => i * 25 + 15)
        .text(d => d.label)
        .attr("fill", "black");
}