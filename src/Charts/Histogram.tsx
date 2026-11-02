import * as d3 from 'd3';
import {useEffect, useRef, useState} from 'react';

interface HistogramProps {
	width: number;
	height: number;
}

// the only field of the API response the chart needs
interface Brewery {
	state: string;
}

// ex. {state: 'Idaho', frequency: 1}
interface StateFrequency {
	state: string;
	frequency: number;
}

const jsonURL = "https://api.openbrewerydb.org/v1/breweries";

// fetchs json and converts to an array from a random API I found
// ex. [{state: 'Idaho', frequency: 1}]
const getURLData = async (): Promise<StateFrequency[]> => {
	    let urlResponse = await fetch(jsonURL);
	    let jsonResult: Brewery[] = await urlResponse.json();

	    // build a dictionary to record the frequency of each state in the json response
	    let stateFreq: Record<string, number> = {};
	    jsonResult.forEach((element) => {
	    	if (stateFreq[element.state] > 0) {
	    		stateFreq[element.state] = stateFreq[element.state] + 1;
	    	} else {
	    		stateFreq[element.state] = 1;
	    	}
	    	})

	    // convert the dictionary to an array
	    let stateFreqArray: StateFrequency[] = Object.keys(stateFreq).map(function(key) {
	    	return {'state': key, 'frequency': stateFreq[key]};
	    })

	    // sort the array by frequency
	    return stateFreqArray.sort(function(a,b){return b.frequency - a.frequency});
}

const drawChart = (container: HTMLDivElement, data: StateFrequency[], width: number, height: number) => {

	// declare margins
	const margin = {top: 70, right: 50, bottom: 70, left: 50};

	// remove the previous chart before drawing a new one
	d3.select(container).selectAll('*').remove();

	// create the svg that holds the chart
    const svg = d3.select(container)
    .append('svg')
		  .style("background-color", "white")
		  .attr("width", width)
		  .attr("height", height)
		  .append('g')
		  .attr("transform",`translate(0,-${margin.bottom-10})`);

	const maxFrequency = d3.max(data, d => d.frequency) ?? 0;

	// create the x axis scale, scaled to the states
	const xScale = d3.scaleBand()
		.domain(data.map(d => d.state))
		.rangeRound([margin.left, width - margin.right])
		.padding(0.1)

	// create the y axis scale, scaled from 0 to the max
	const yScale = d3.scaleLinear()
		.domain([0, maxFrequency])
		.range([height - margin.bottom, margin.top])

	// create a scale between colors that varies by the frequency
	const barColors = d3.scaleLinear<string>()
	  .domain([0, maxFrequency])
	  .range(["blue","red"])

	  	// set the x axis on the bottom.
	// tilts the axis text so it's readable and not smushed.
    svg.append("g")
      .attr('transform', `translate(0,${height-margin.bottom})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
	  .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-65)");

    // set the y axis on the left
    svg.append("g")
    .attr('transform', `translate(${margin.left},0)`)
    	.call(d3.axisLeft(yScale));

	  // create the actual bars on the graph, appends a 'rect' for every data element
	  // sets the x and y positions relative to the scales already established
	  // sets the height according to the yscale
	  // static bar width, color is scaled on the y axis
	  // finally the bars have an outline
	  svg
	  .selectAll("rect")
	  .data(data)
	  .enter().append("rect")
	    .attr('x', d => xScale(d.state) ?? 0)
	    .attr('y', d => yScale(d.frequency))
	    .attr('width', xScale.bandwidth())
	    .attr('height', d => yScale(0) - yScale(d.frequency))
	    .attr("fill", function(d) {return barColors(d.frequency)})
	    .attr("stroke", "black")
	    .attr("stroke-width", 1)
}

const Histogram = (props: HistogramProps) => {

	const {width, height } = props;

	const containerRef = useRef<HTMLDivElement>(null);
	const [data, setData] = useState<StateFrequency[]>([]);

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
	  	<h4> Histogram- http JSON response </h4>
	<div ref={containerRef}/>
	</div>
	)
}

export default Histogram;
