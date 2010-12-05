/**
 * Grafico - SVG graphing library - sparkline, sparkbar and sparkarea file
 *
 * Copyright (c) 2009 - 2010 Kilian Valkhof (kilianvalkhof.com) - Originally developed by Alex Young (http://alexyoung.org)
 * Visit grafico.kilianvalkhof.com for more information and changelogs.
 * Licensed under the MIT license. http://www.opensource.org/licenses/mit-license.php
 *
 */

"use strict";
Grafico.SparkLine = Class.create(Grafico.Base, {
  initialize: function (element, data, options) {
    this.element = element;
    this.data = data;

    this.options = {
      highlight: false,
      stroke_width: 1,
      color : this.makeRandomcolor(),
      width: parseInt(element.getStyle('width'), 10),
      height: parseInt(element.getStyle('height'), 10),
      acceptable_range: false,
      zeroline: false
    };
    Object.extend(this.options, options || { });

    this.step = this.calculateStep();
    this.paper = new Raphael(this.element, this.options.width, this.options.height);

    this.drawBackground();
    this.draw();
  },

  drawBackground : function () {
    if (this.options.acceptable_range) {
      this.background = this.paper.rect(
        0,
        this.options.height - this.normalise(this.options.acceptable_range[1]),
        this.options.width,
        this.normalise(this.options.acceptable_range[1]) - this.normalise(this.options.acceptable_range[0])
      );
    } else {
      this.background = this.paper.rect(0, 0, this.options.width, this.options.height);
    }

    this.background.attr({fill: this.options.background_color, stroke: 'none'});
  },

  calculateStep: function () {
    return this.options.width / (this.data.length - 1);
  },

  makeRandomcolor: function () {
    return Raphael.hsb2rgb(Math.random(), 1, 0.75).hex;
  },

  normalise: function (value) {
    var range = (this.data.min() < 0 ) ? this.data.max()-this.data.min() : this.data.max();
    value -= (this.data.min() < 0 ) ? this.data.min() : 0;
    return value / range * this.options.height;
  },

  draw: function () {
    var data = this.normaliseData(this.data),
        zero_value;

    if (this.options.zeroline && this.data.min() < 0 ) {
      this.options.zeroline = (this.options.zeroline === true) ? {'stroke-width': '1px', stroke: '#BBBBBB'} : this.options.zeroline;
      zero_value = parseInt(this.options.height - this.normalise(0), 10);
      this.paper.path()
        .attr(this.options.zeroline)
        .moveTo(0, zero_value)
        .lineTo(this.options.width, zero_value);
    }

    this.drawLines(this.options.color, data);

    if (this.options.highlight) {
      this.showHighlight(data);
    }
  },

  drawLines: function (color, data) {
    var line = this.paper.path().attr({ stroke: color, "stroke-width" : this.options.stroke_width }).moveTo(0, this.options.height - data.first()),
        x = 0,
        offset = this.data.min() < 0 ? this.options.stroke_width : 0;

    data.slice(1).each(function (value) {
      x = x + this.step;
      line.lineTo(x, this.options.height - value - offset);
    }.bind(this));
  },

  showHighlight: function (data) {
    var size = 1 + this.options.stroke_width / 2,
        x = this.options.width - size,
        i = this.options.highlight.index || data.length - 1,
        y = data[i] + (size / 2).round(),
        color = this.options.highlight.color || "#f00",
        circle;

    // Find the x position if it's not the last value
    if (typeof this.options.highlight.index !== 'undefined') {
      x = this.step * this.options.highlight.index;
    }
    circle = this.paper.circle(x, this.options.height - y + size / 2, size).attr({stroke: false, fill: color});
  }
});

Grafico.SparkBar = Class.create(Grafico.SparkLine, {
  calculateStep: function () {
    return this.options.width / this.data.length;
  },

  drawLines: function (color, data) {
    var lastcolor = this.options.bargraph_lastcolor,
        width = this.step > 2 ? this.step - 1 : this.step,
        x = width / 2,
        zero_value = this.normalise(0);

    data.each(function (value,index) {
      var color2, line;

      color2 = lastcolor && index === data.length - 1 ? lastcolor : color;
      line = this.paper.path().attr({stroke: color2, 'stroke-width': width});
      line.moveTo(x, this.options.height - value);
      line.lineTo(x, this.options.height - zero_value);
      if (value < zero_value) {
        var negcolor = this.options.bargraph_negativecolor || color2;
        line.attr({stroke: negcolor});
      }
      x = x + this.step;
    }.bind(this));
  },

  showHighlight: function (data) {
    //to be implemented
  }
});

Grafico.SparkArea = Class.create(Grafico.SparkLine, {
  drawLines: function (color, data) {
    var fillcolor = color,
        strokecolor = color,
        fillopacity = 0.2,
        zero_value = this.normalise(0);

    // if two colors are specified
    if (typeof color == "object") {
      fillcolor = color[1];
      strokecolor = color[0];
      fillopacity = 1;
    }

    var line = this.paper.path().attr({fill: fillcolor,  stroke: fillcolor, "stroke-width": 0, "stroke-opacity": 0, opacity: fillopacity})
        .moveTo(0, this.options.height - zero_value)
        .lineTo(0, this.options.height - data.first()),
        line2 = this.paper.path().attr({stroke: strokecolor, "stroke-width": this.options.stroke_width }).moveTo(0, this.options.height - data.first()),
        x = 0;

    data.slice(1).each(function (value) {
      x = x + this.step;
      line.lineTo(x, this.options.height - value);
      line2.lineTo(x, this.options.height - value);
    }.bind(this));

    line.lineTo(x,this.options.height - zero_value);
  }
});

