import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const EcgChart = () => {
  const ref = useRef();

  const [editingIndex, setEditingIndex] = useState(null);
  const [beatData, setBeatData] = useState([]);
  const [signals, setSignals] = useState([]);

  useEffect(() => {
    fetch('/ecg_graph_dto_realistic.json')
      .then(res => res.json())
      .then(data => {
        setBeatData(data.beats);
        setSignals(data.signals);
      });
  }, []);

  useEffect(() => {
    if (!signals.length || !beatData.length) return;

    const svg = d3.select(ref.current);
    svg.selectAll('*').remove();

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

    svg.append('path')
      .datum(signals)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 1)
      .attr('d', line);

    svg.selectAll('.r-peak-line')
      .data(beatData)
      .enter()
      .append('line')
      .attr('x1', d => x(signals[d.beatIndex].timeInMs))
      .attr('x2', d => x(signals[d.beatIndex].timeInMs))
      .attr('y1', y(y.domain()[0]))
      .attr('y2', y(y.domain()[1]))
      .attr('stroke', 'red')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4 2');

    svg.selectAll('.r-peak-label')
      .data(beatData)
      .enter()
      .each(function (d, i) {
        const xCoord = x(signals[d.beatIndex].timeInMs);
        const yCoord = y(signals[d.beatIndex].point) - 10;

        if (editingIndex === i) {
          svg.append('foreignObject')
            .attr('x', xCoord)
            .attr('y', yCoord)
            .attr('width', 50)
            .attr('height', 30)
            .append('xhtml:select')
            .on('change', function () {
              const newLabel = this.value;
              const updated = [...beatData];
              updated[i] = { ...updated[i], label: newLabel };
              setBeatData(updated);
              setEditingIndex(null);
            })
            .selectAll('option')
            .data(['N', 'S', 'V', 'A'])
            .enter()
            .append('xhtml:option')
            .attr('value', d => d)
            .text(d => d)
            .property('selected', d => d === beatData[i].label);
        } else {
          svg.append('text')
            .text(d.label)
            .attr('x', xCoord + 4)
            .attr('y', yCoord)
            .attr('font-size', '10px')
            .attr('fill', 'darkred')
            .style('cursor', 'pointer')
            .on('click', () => {
              setEditingIndex(i);
            });
        }
      });
  }, [signals, beatData, editingIndex]);

  return <svg ref={ref}></svg>;
};

export default EcgChart;