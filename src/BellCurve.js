import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';
import { Controls } from './Controls';
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
    setFormValue((form)=> ({...form}));
  }

  useEffect(() => {
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

    const numberOfDataPoints = 1000;

    const { mean = 0, max = 0, min = 0, std: stdDeviation = 0 } = form;

    var normalDistributionFunction = d3.randomNormal(mean, stdDeviation);
    const actualData = d3
      .range(numberOfDataPoints)
      .map(normalDistributionFunction);
    const sum = d3.sum(actualData);
    
    const probability = 1 / numberOfDataPoints;
    
    const variance = sum * probability * (1 - probability);
    
    const idealData = getProbabilityData(actualData, mean, variance);
 
    var x = d3.scaleLinear().range([0, width]).domain([min, max]);
    var dataBar = d3.bin()(actualData);
       
    var yMax = d3.max(dataBar, function (d) {
      return d.length;
    }); 
    
    var y = d3.scaleLinear().domain([0, yMax]).range([height, 0]);

    var xAxis = d3
      .axisBottom()
      .scale(x)
      .ticks(10);
    
    var yAxis = d3
      .axisLeft()
      .scale(y)
      .tickFormat(d3.format('.1s'));

    var xNormal = d3
      .scaleLinear()
      .range([0, width])
      .domain(
        d3.extent(idealData, function (d) {
          return d.q;
        })
      );

    var yNormal = d3.scaleLinear()
      .range([height, 0])
      .domain(
        d3.extent(idealData, function (d) {
          return d.p;
        })
      );

    var linePlot = d3
      .line()
      .x(function (d) {
        return xNormal(d.q); 
      })
      .y(function (d) {
        return yNormal(d.p);
      });

    const curveContainer = d3.select(container);
    d3.select("svg").remove();
    var svg = curveContainer
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('fill', 'white')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    const bar = svg
      .selectAll('.bar')
      .data(dataBar)
      .enter()
      .append('g')
      .attr('class', 'bar')
      .attr('transform', function (d) {
        return 'translate(' + x(d.x0) + ',' + y(d.length) + ')';
      });
      bar
        .append('rect')
        .attr('x', 1)
        .attr('width', function (d) {
          return  (x(d.x1-d.x0) - x(0)) <= 0 ? 0 : (x(d.x1-d.x0) - x(0)) - 1;
        })
        .attr('height', function (d) {
          return height - y(d.length);
        })
        .attr('fill', function () {
          return color(series[0]);
        });
    bar
      .append('text')
      .attr('dy', '.75em')
      .attr('y', -12)
      .attr('x', (x(dataBar[0].x0) - x(0)) / 2)
      .attr('text-anchor', 'middle')
      .text(function (d) {
        return formatCount(d.x0);
      });

    const lines = svg
      .selectAll('.series')
      .data([1])
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

    svg
      .append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis);
    // Add the Y Axis
  
    svg.append('g').attr('class', 'y axis').call(yAxis);
  
    function getProbabilityData(normalizedData, m, v) {
      var data = [];
      // probabily - quantile pairs
      for (var i = 0; i < normalizedData.length; i += 1) {
        var q = normalizedData[i],
          p = probabilityDensityCalculation(q, m, v),
          el = {
            q: q,
            p: p,
          };
        data.push(el);
      }
      data.sort(function (x, y) {
        return x.q - y.q;
      });
      return data;
    }
    function probabilityDensityCalculation(x, mean, variance) {
      var m = Math.sqrt(2 * Math.PI * variance);
      var e = Math.exp(-Math.pow(x - mean, 2) / (2 * variance));
      return e / m;
    }
 
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
