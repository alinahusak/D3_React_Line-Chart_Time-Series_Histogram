import * as d3 from 'd3'
import {useEffect, useRef, useState} from 'react'

interface LineChartProps {
  width: number;
  height: number;
}

// ex. {label: 1, value: 5}
interface Point {
  label: number;
  value: number;
}

// generate random data
// ex. [{label: 1, value: 5}, {label:2, value: 10}]
const generateData = (): Point[] => {
  const chartData: Point[] = [];
  for (let i = 0; i < 20; i++) {
    const value = Math.floor(Math.random() * i + 3);
    chartData.push({
      label: i,
      value
    });
  }
  return chartData;
}

const drawChart = (container: HTMLDivElement, data: Point[], width: number, height: number) => {

    // Establish margins
	const margin = { top: 10, right: 50, bottom: 50, left: 50 };

	// establish x and y max values
	const yMaxValue = d3.max(data, d => d.value) ?? 0;
	const xMinValue = d3.min(data, d => d.label) ?? 0;
	const xMaxValue = d3.max(data, d => d.label) ?? 0;

	// remove the previous chart before drawing a new one
	d3.select(container).selectAll('*').remove();

	// create chart area
	const svg = d3
	    .select(container)
	    .append('svg')
	    .attr('width', width + margin.left + margin.right)
	    .attr('height', height + margin.top + margin.bottom)
	    .append('g')
	    .attr('transform', `translate(${margin.left},${margin.top})`);

	// create scale for the x axis
	const xScale = d3
	    .scaleLinear()
	    .domain([xMinValue, xMaxValue])
	    .range([0, width]);

	// create scale for y axis
	const yScale = d3
	    .scaleLinear()
	    .range([height, 0])
	    .domain([0, yMaxValue]);

	// Create x grid
	svg
	    .append('g')
	    .attr('class', 'grid')
	    .attr('transform', `translate(0,${height})`)
	    .call(
	    d3.axisBottom(xScale)
	        .tickSize(-height)
	        .tickFormat(() => ''),
	    );

	// create y grid
	svg
	    .append('g')
	    .attr('class', 'grid')
	    .call(
	        d3.axisLeft(yScale)
	        .tickSize(-width)
	        .tickFormat(() => ''),
	    );

	// create the x axis on the bottom
	svg
	    .append('g')
	    .attr('class', 'x-axis')
	    .attr('transform', `translate(0,${height})`)
	    .call(d3.axisBottom(xScale).tickSize(15));

	// create the y axis on the left
	svg
	    .append('g')
	    .attr('class', 'y-axis')
	    .call(d3.axisLeft(yScale));

	    	// create a line with x and y coordinates scaled to the data
	const line = d3
	    .line<Point>()
	    .x(d => xScale(d.label))
	    .y(d => yScale(d.value))
	    .curve(d3.curveMonotoneX);

	// draw the line
	svg
	    .append('path')
	    .datum(data)
	    .attr('fill', 'none')
	    .attr('stroke', '#f6c3d0')
	    .attr('stroke-width', 4)
	    .attr('class', 'line')
	    .attr('d', line);
}

function LineChart(props: LineChartProps) {
  const {width, height } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const [data] = useState<Point[]>(generateData);

  // redraw whenever the data or the size changes
  useEffect(()=>{
  	if (containerRef.current && data.length > 0) {
  		drawChart(containerRef.current, data, width, height);
  	}
  },[data, width, height])

  return (
  	<div>
  	<h4> Line Chart - static fake data -
  		<a href='https://betterprogramming.pub/react-d3-plotting-a-line-chart-with-tooltips-ed41a4c31f4f'>Original Tutorial</a>
  		 </h4>
  <div ref={containerRef} />
  </div>

  )
}

export default LineChart;
