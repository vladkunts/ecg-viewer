import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const EcgChart = () => {
  const ref = useRef();

  const [editingIndex, setEditingIndex] = useState(null);
  const [beatData, setBeatData] = useState([]);
  const [signals, setSignals] = useState([]);
  const [selection, setSelection] = useState(null);
  const [activeLabels, setActiveLabels] = useState(['N', 'S', 'V', 'A']);

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

    const filteredBeats = beatData.filter(b => activeLabels.includes(b.label));

    svg.selectAll('.r-peak-line')
      .data(filteredBeats)
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
      .data(filteredBeats)
      .enter()
      .each(function (d, i) {
        const xCoord = x(signals[d.beatIndex].timeInMs);
        const yCoord = y(signals[d.beatIndex].point) - 10;

        if (editingIndex === d.beatIndex) {
          svg.append('foreignObject')
            .attr('x', xCoord)
            .attr('y', yCoord)
            .attr('width', 50)
            .attr('height', 30)
            .append('xhtml:select')
            .on('change', function () {
              const newLabel = this.value;
              const updated = [...beatData];
              const idx = updated.findIndex(b => b.beatIndex === d.beatIndex);
              if (idx !== -1) {
                updated[idx] = { ...updated[idx], label: newLabel };
              }
              setBeatData(updated);
              setEditingIndex(null);
            })
            .selectAll('option')
            .data(['N', 'S', 'V', 'A'])
            .enter()
            .append('xhtml:option')
            .attr('value', d => d)
            .text(d => d)
            .property('selected', d => d === beatData.find(b => b.beatIndex === d.beatIndex)?.label);
        } else {
          svg.append('text')
            .text(d.label)
            .attr('x', xCoord + 4)
            .attr('y', yCoord)
            .attr('font-size', '10px')
            .attr('fill', 'darkred')
            .style('cursor', 'pointer')
            .style('pointer-events', 'all')
            .on('click', () => {
              setEditingIndex(d.beatIndex);
            });
        }
      });

    const brush = d3.brushX()
      .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])
      .on('end', (event) => {
        if (!event.selection) return;
        const [x0, x1] = event.selection;
        const time0 = x.invert(x0);
        const time1 = x.invert(x1);
    
        // Filter beats based on the selected range
        const selectedBeats = beatData.filter(b => {
          const t = signals[b.beatIndex].timeInMs;
          return t >= time0 && t <= time1;
        });
    
        const duration = time1 - time0; // in milliseconds
        const bpm = selectedBeats.length / (duration / 1000) * 60;
    
        setSelection({
          from: Math.round(time0),
          to: Math.round(time1),
          beats: selectedBeats.length,
          bpm: Math.round(bpm),
        });
      });
    
    
    svg.insert('g', ':first-child')
      .attr('class', 'brush')
      .call(brush);
  }, [signals, beatData, editingIndex, activeLabels]);

  return <>
    <div style={{ marginBottom: '1em' }}>
      <strong>Filter annotations:</strong>
      {['N', 'S', 'V', 'A'].map(label => (
        <label key={label} style={{ marginLeft: '10px' }}>
          <input
            type="checkbox"
            checked={activeLabels.includes(label)}
            onChange={() => {
              setActiveLabels(prev =>
                prev.includes(label)
                  ? prev.filter(l => l !== label)
                  : [...prev, label]
              );
            }}
          />
          {label}
        </label>
      ))}
    </div>
    <svg ref={ref}></svg>
    {selection && (
      <div style={{ marginTop: '1em', fontSize: '14px' }}>
        <strong>Selected range:</strong><br />
        From: {selection.from} ms — To: {selection.to} ms<br />
        Beats: {selection.beats} <br />
        BPM: {selection.bpm}
      </div>
    )}
  </>;
};

export default EcgChart;