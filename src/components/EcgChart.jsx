import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const EcgChart = () => {
  const ref = useRef();

  useEffect(() => {
    fetch('/ecg_graph_dto_realistic.json')
      .then(res => res.json())
      .then(data => {
        const { signals, beats } = data;
        drawChart(signals, beats);
      });
  }, []);

  const drawChart = (signals, beats) => {
    const svg = d3.select(ref.current);
    svg.selectAll('*').remove(); // Clear previous content

    const width = 1000;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };

    svg
      .attr('width', width)
      .attr('height', height);

    const x = d3.scaleLinear()
      .domain(d3.extent(signals, d => d.timeInMs))
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain(d3.extent(signals, d => d.point))
      .nice()
      .range([height - margin.bottom, margin.top]);

    const line = d3.line()
      .x(d => x(d.timeInMs))
      .y(d => y(d.point));

    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    // ECG waveform
    svg.append('path')
      .datum(signals)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 1)
      .attr('d', line);

    // R-peak markers
    svg.selectAll('.r-peak-line')
      .data(beats)
      .enter()
      .append('line')
      .attr('x1', d => x(signals[d.beatIndex].timeInMs))
      .attr('x2', d => x(signals[d.beatIndex].timeInMs))
      .attr('y1', y(y.domain()[0]))
      .attr('y2', y(y.domain()[1]))
      .attr('stroke', 'red')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4 2');

    // R-peak labels
    svg.selectAll('.r-peak-label')
      .data(beats)
      .enter()
      .append('text')
      .text(d => d.label)
      .attr('x', d => x(signals[d.beatIndex].timeInMs) + 4)
      .attr('y', d => y(signals[d.beatIndex].point) - 10)
      .attr('font-size', '10px')
      .attr('fill', 'darkred');
  };

  return <svg ref={ref}></svg>;
};

export default EcgChart;