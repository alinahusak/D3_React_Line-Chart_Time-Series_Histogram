import * as d3 from 'd3';
import {useEffect, useRef, useState} from 'react';

interface TimeSeriesProps {
	width: number;
	height: number;
}

// ex. {date: new Date('2021-12-12'), value: 1000}
interface TimePoint {
	date: Date;
	value: number;
}

const csvURL = "https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/3_TwoNumOrdered_comma.csv"

// gets csv data from a random csv I found
// ex. [{date: '2021-12-12', value: 1000}]
const getURLData = async (): Promise<TimePoint[]> => {
    const parseDate = d3.timeParse("%Y-%m-%d");
    return d3.csv(csvURL,
      function(d): TimePoint | undefined {
        const date = parseDate(d.date ?? '');
        // skip rows with an unreadable date
        return date ? {date, value: parseFloat(d.value ?? '')} : undefined;
      }
    )
}

const drawChart = (container: HTMLDivElement, data: TimePoint[], width: number, height: number) => {

	// establish margins
	const margin = { top: 10, right: 50, bottom: 50, left: 50 };

	// remove the previous chart before drawing a new one
	d3.select(container).selectAll('*').remove();

	// create the chart area
	const svg = d3
	    .select(container)
	    .append('svg')
	    .attr('width', width + margin.left + margin.right)
	    .attr('height', height + margin.top + margin.bottom)
	    .append('g')
	    .attr('transform', `translate(${margin.left},${margin.top})`);

// Add X axis --> it is a date format
    const x = d3.scaleTime()
      .domain(d3.extent(data, function(d) { return d.date; }) as [Date, Date])
      .range([ 0, width ]);

    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));


    // Add Y axis
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, function(d) { return +d.value; }) ?? 0])
      .range([ height, 0 ]);
    svg.append("g")
      .call(d3.axisLeft(y));

    // set line coordinates
    const line = d3.line<TimePoint>()
      .x(function(d) { return x(d.date) })
      .y(function(d) { return y(d.value) })

    // Add the line
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", line)
}

const TimeSeries = (props: TimeSeriesProps) => {

	const {width, height } = props;

	const containerRef = useRef<HTMLDivElement>(null);
	const [data, setData] = useState<TimePoint[]>([]);

  // load the data once; ignore the response if the component is already unmounted
  useEffect(()=>{
    let cancelled = false;
    getURLData().then(result => {
      if (!cancelled) setData(result);
    });
    return () => { cancelled = true; };
  },[])

  // redraw whenever the data or the size changes
  useEffect(()=>{
    if (containerRef.current && data.length > 0) {
      drawChart(containerRef.current, data, width, height);
    }
  },[data, width, height])

return (
	<div>
	  	<h4> Time Series - http CSV response -
  		<a href='https://www.d3-graph-gallery.com/graph/line_basic.html'>Original Tutorial</a>
  		 </h4>
	<div ref={containerRef}/>
	</div>
	)

}

export default TimeSeries;
