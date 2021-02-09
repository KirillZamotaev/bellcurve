import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';
import { Controls } from './Controls';
import { getProbabilityData, probabilityDensityCalculation } from './utils';
import './BellCurve.css';

export const BellCurve = () => {
  const [form, setFormValue] = useState({
    mean: 20,
    max: 100,
    min: 0,
    std: 5,
  });

  const containerRef = useRef(null);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormValue((form) => ({ ...form, [name]: value }));
  };

  const handleRefresh = () => {
    setFormValue((form) => ({ ...form }));
  };

  const buildChart = () => {    
    const container = containerRef.current;

    const margin = {
      top: 20,
      right: 20,
      bottom: 30,
      left: 50,
    };

    const width = 1000 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
    const series = ['Factic', 'Ideal'];

    var color = d3.scaleOrdinal(d3.schemeCategory10);
    color.domain(series);
    var formatCount = d3.format(',.0f');

    const numberOfBuckets = 25;
    const numberOfDataPoints = 1000;

    const { mean = 0, max = 0, min = 0, std: stdDeviation = 0 } = form;

    const normalDistributionFunction = d3.randomNormal(mean, stdDeviation);
  
    const actualData = d3
      .range(numberOfDataPoints)
      .map(normalDistributionFunction);
    const sum = d3.sum(actualData);

    const probability = 1 / numberOfDataPoints;
    const variance = sum * probability * (1 - probability);

    const idealData = getProbabilityData(actualData, mean, variance);
    const dataBar = d3.bin().thresholds(numberOfBuckets)(actualData);

    const x = d3.scaleLinear().range([0, width]).domain([min, max]);
    const y = d3.scaleLinear().range([height, 0]).domain([min, max]);

    const xAxis = d3.axisBottom().scale(x).ticks(10); 
    const yAxis = d3.axisLeft().scale(y).tickFormat(d3.format('.2s'));

    const xNormal = d3
      .scaleLinear()      
      .domain([min, max])
      .range([0, width]);

    const toDomain =  d3.extent(idealData, function (d) {
      return d.p;
    });

    const yNormal = d3
      .scaleLinear()      
      .domain(toDomain)
      .range([height, 0]);
    // Line
    const linePlot = d3
      .line()
      .x(function (d) {
        return xNormal(d.q);
      })
      .y(function (d) {
        return yNormal(d.p);
      });

    const curveContainer = d3.select(container);
    d3.select('svg').remove();
    // Svg
    const svg = curveContainer
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('fill', 'white')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    // Bar
    const bar = svg
      .selectAll('.bar')
      .data(dataBar)
      .enter()
      .append('g')
      .attr('class', 'bar')
      .attr('transform', function (d) {
        return 'translate(' + x(d.x0) + ',' + y(d.length) + ')';
      });
    // Bar Rect
    bar
      .append('rect')
      .attr('x', 1)
      .attr('width', function (d) {
        return x(d.x1) - x(d.x0) -1;
      })
      .attr('height', function (d) {
        return height - y(d.length);
      })
      .attr('fill', function () {
        return color(series[0]);
      });
    // Bar Text
    bar
      .append('text')
      .attr('dy', '.75em')
      .attr('y', -12)
      .attr('x', (x(dataBar[0].x1 - dataBar[0].x0) - x(0)) / 2)
      .attr('text-anchor', 'middle')
      .text(function (d) {
        return formatCount(d.x0);
      });

    const lines = svg
      .selectAll('.series')
      .data([0])
      .enter()
      .append('g')
      .attr('class', 'series');

    lines
      .append('path')
      .datum(idealData)
      .attr('class', 'line')
      .attr('d', linePlot)
      .style('stroke', function () {
        return color(series[1]);
      })
      .style({ 'stroke-width': '2px', fill: 'none' });

    const draggedMean = (event) => {
      setFormValue((form) => ({ ...form, mean: x.invert(event.x) - 20 }));
    }

    const draggedStd = (event) => {
      setFormValue((form) => ({ ...form, std: x.invert(event.x) }));
    }

    const dragMean = d3.drag()
    .on("start", draggedMean)
    .on("drag", draggedMean)
    .on("end", draggedMean)
    const dragStd = d3.drag().on('drag', draggedStd);

    lines
      .append('circle')
      .attr('class', 'MeanAnchor')
      .attr('r', 8)
      .attr('transform', function (d) {
        return 'translate(' + x(mean) + ',' + 0 + ')';
      })
      .call(dragMean);

    lines
      .append('circle')
      .attr('class', 'StdAnchor')
      .attr('r', 8)
      .attr('transform', function (d) {
        return 'translate(' + x(stdDeviation) + ',' + (height / 2) + ')';
      })
      .call(dragStd);

    svg
      .append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis);
    // Add the Y Axis

    svg.append('g').attr('class', 'y axis').call(yAxis);  
  }
 
  useEffect(() => {
    buildChart();
  }, [form]);

  return (
    <div className="BellCurve">
      <Controls
        className="BellCurve__controls"
        form={form}
        handleRefresh={handleRefresh}
        handleInput={handleInput}
      />
      <div className="BellCurve__container" ref={containerRef} />
    </div>
  );
};
