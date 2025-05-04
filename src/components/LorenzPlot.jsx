import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const LorenzPlot = ({ signals, beats }) => {
  const ref = useRef();
  const [visible, setVisible] = useState(false);

useEffect(() => {
  if (!visible || !signals.length || !beats.length) return;

    const sorted = [...beats].sort((a, b) =>
      signals[a.beatIndex].timeInMs - signals[b.beatIndex].timeInMs
    );

    const rr = [];
    for (let i = 1; i < sorted.length; i++) {
      const t1 = signals[sorted[i - 1].beatIndex].timeInMs;
      const t2 = signals[sorted[i].beatIndex].timeInMs;
      rr.push(t2 - t1);
    }

    const points = rr.slice(0, -1).map((val, i) => [val, rr[i + 1]]);

    const svg = d3.select(ref.current);
    svg.selectAll('*').remove();

    const width = 400;
    const height = 400;
    const margin = 60;

    const x = d3.scaleLinear()
      .domain([980, 1020])
      .range([margin, width - margin]);

    const y = d3.scaleLinear()
      .domain([980, 1020])
      .range([height - margin, margin]);

    svg
      .attr('width', width)
      .attr('height', height);

    svg.append('g')
      .attr('transform', `translate(0,${height - margin})`)
      .call(d3.axisBottom(x));

    svg.append('g')
      .attr('transform', `translate(${margin},0)`)
      .call(d3.axisLeft(y));

    // Tooltip div
    const tooltip = d3.select('body')
      .append('div')
      .style('position', 'absolute')
      .style('padding', '4px 8px')
      .style('background', '#333')
      .style('color', '#fff')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('opacity', 0);

    svg.selectAll('circle')
      .data(points)
      .enter()
      .append('circle')
      .attr('cx', d => x(d[0]))
      .attr('cy', d => y(d[1]))
      .attr('r', 4)
      .attr('fill', 'steelblue')
      .attr('fill-opacity', 0.6)
      .on('mouseover', (event, d) => {
        tooltip.transition().duration(200).style('opacity', 1);
        tooltip.html(`RRₙ: ${d[0]}<br/>RRₙ₊₁: ${d[1]}`);
      })
      .on('mousemove', (event) => {
        tooltip.style('left', (event.pageX + 10) + 'px')
               .style('top', (event.pageY - 20) + 'px');
      })
      .on('mouseout', () => {
        tooltip.transition().duration(300).style('opacity', 0);
      });

    // X axis label
    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height - 15)
      .text("RRₙ (ms)")
      .attr("fill", "#333")
      .attr("font-size", "11px");

    // Y axis label
    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("transform", `rotate(-90)`)
      .attr("x", -height / 2)
      .attr("y", 10)
      .text("RRₙ₊₁ (ms)")
      .attr("fill", "#333")
      .attr("font-size", "11px");

    return () => {
      tooltip.remove();
    };
}, [signals, beats, visible]);

  return (
    <div>
      <div style={{ marginBottom: '0.5em' }}>
        <a href="#" onClick={(e) => { e.preventDefault(); setVisible(!visible); }}>
          {visible ? 'Hide' : 'Show'} Lorenz Plot
        </a>
      </div>
      {visible && (
        <>
          <h3>Lorenz Plot (RRₙ vs RRₙ₊₁)</h3>
          <svg ref={ref}></svg>
        </>
      )}
    </div>
  );
};

export default LorenzPlot;