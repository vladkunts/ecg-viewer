import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const EcgChart = () => {
  const ref = useRef();

  useEffect(() => {
    fetch('/ecg_graph_dto_realistic.json')
      .then(res => res.json())
      .then(data => {
        const { signals } = data;
        drawChart(signals);
      });
  }, []);

  const drawChart = (data) => {
    const svg = d3.select(ref.current);
    svg.selectAll('*').remove(); // Clear previous content

    const width = 1000;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };

    svg
      .attr('width', width)
      .attr('height', height);

    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d.timeInMs))
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain(d3.extent(data, d => d.point))
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

    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 1)
      .attr('d', line);
  };

  return <svg ref={ref}></svg>;
};

export default EcgChart;