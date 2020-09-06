
let quarterLookup = {
  1: "Q1",
  4: "Q2",
  7: "Q3",
  10: "Q4"
}

fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json')
  .then(response => {
    response.json().then(data => {
        processData(data);
      }
    );
    
  })
  .catch(err => {
    console.warn("Fetch Failed: ",err)
  })

// Auto Resize
// Taken from: https://benclinkinbeard.com/d3tips/make-any-chart-responsive-with-one-function/
function responsivefy(svg) {
  // container will be the DOM element
  // that the svg is appended to
  // we then measure the container
  // and find its aspect ratio
  const container = d3.select(svg.node().parentNode),
    width = parseInt(svg.style('width'), 10),
    height = parseInt(svg.style('height'), 10),
    aspect = width / height;

  // set viewBox attribute to the initial size
  // control scaling with preserveAspectRatio
  // resize svg on inital page load
  svg.attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMinYMid')
    .call(resize);

  // add a listener so the chart will be resized
  // when the window resizes
  // multiple listeners for the same event type
  // requires a namespace, i.e., 'click.foo'
  // api docs: https://goo.gl/F3ZCFr
  d3.select(window).on(
    'resize.' + container.attr('id'),
    resize
  );

  // this is the code that resizes the chart
  // it will be called on load
  // and in response to window resizes
  // gets the width of the container
  // and resizes the svg to fill it
  // while maintaining a consistent aspect ratio
  function resize() {
    const w = parseInt(container.style('width'));
    svg.attr('width', w);
    svg.attr('height', Math.round(w / aspect));
  }
}

function processData(dataset) {
  let data = dataset.data.map(item => {
    let date = new Date(item[0]);
    
    return {
      date: date,
      dateString: item[0],
      year: date.getUTCFullYear(),
      label: date.getUTCFullYear() + " " + quarterLookup[date.getUTCMonth() + 1],
      value: item[1]
    }    
  });
    
  console.dir(data, {depth: null});
  
  let w = parseInt(d3.select('svg').style('width'));
  let h = parseInt(d3.select('svg').style('height'));
  let padding = 75;
  let barWidth = (w - padding * 2) / data.length;

  let tooltip = d3.select(".container")
    .append("div")
    .attr("class", "tooltip")
    .attr("id", "tooltip")
  
  let formatter = Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: "USD",
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    })
  
  let yScale = d3.scaleLinear()
    .domain([
      0,
      d3.max(data, d => d.value)
    ])
    .range([  h - padding * 1.5 , padding ])
  
  let xScale = d3.scaleTime()
    .domain([
      d3.min(data, d => d.date), 
      d3.max(data, d => d.date)
    ])
    .range([ padding, w - padding])
    
  let svg = d3.select('body').select('svg');
  svg.call(responsivefy);
  
    svg
    .selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('x', (d, i) => xScale(d.date) )
    .attr('y', (d, i) => yScale(d.value) + padding / 2  )
    .attr('width', parseInt(barWidth))
    .attr('height', d => h - yScale(d.value) - (padding * 1.5) )
    .attr('class', 'bar')
    .attr('data-date', d => d.dateString)
    .attr('data-gdp', d => d.value)
    .attr('data-label', d => d.label)
    .on('mouseover', function (e, d) {
        tooltip.transition()
          .duration(200)
          .style('opacity', 0.9)
        tooltip
          .html(`${d.label}<br>${formatter.format(d.value)} Billion`)
          .style("left", e.clientX + 20 + "px")
          .style("top", "30vw")
          .attr('data-date', d.dateString )
      })
      .on('mouseout', function (e, d) {
        tooltip
          .transition()
          .duration(200)
          .style("opacity", 0);
      })
  
    // Chart Title
    svg
      .append('text')
      .text("United States GDP")
      .attr('class','title')
      .attr('x', w/2)
      .attr('y', padding)
      .attr('id', 'title')
  
    // Chart Footnote
    let footnote = svg
      .append('text')
      .attr('class', 'footnote')
      .attr('x', w - padding)
      .attr('y', h - padding / 3)
    footnote
      .append("tspan")
      .text("More Information: ")
    
    footnote
      .append("a")
      .attr("xlink:href", "http://www.bea.gov/national/pdf/nipaguid.pdf")
      .text("http://www.bea.gov/national/pdf/nipaguid.pdf")


    let xAxis = d3.axisBottom(xScale);
    svg.append("g")
      .attr('id', 'x-axis')
      .attr("transform", `translate(${0}, ${h - padding })`)
      .call(xAxis)

    let yAxis = d3.axisLeft(yScale);
    svg.append("g")
      .attr('id', 'y-axis')
      .attr("transform", `translate(${padding },${padding/2})`)
      .call(yAxis)
}


