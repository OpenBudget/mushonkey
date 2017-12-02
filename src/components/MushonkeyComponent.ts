import {
  Component, OnInit, OnChanges, ViewChild, ElementRef, Input, ViewEncapsulation, Output,
  EventEmitter
} from '@angular/core';
import * as d3 from 'd3';

const debug = false;

export class MushonKeyFlow {
  public size: number;
  public label: string;
  public context: any;
  public group: MushonKeyFlowGroup;
  public centerOfs: number;
  public sideOfs: number;

  constructor(size: number,
              label: string,
              context: any)
  {
    this.size = size;
    this.label = label;
    this.context = context;
  }
}

export class MushonKeyFlowGroup {
  public leftSide: boolean;
  public offset: number;
  public flows: Array<MushonKeyFlow>;
  public klass: string;
  public labelTextSize: number;
  public width: number;
  public widthPx: number;
  public slope: number;
  public roundness: number;
  public headLength: number;
  public tailLength: number;
  public headLengthPx: number;
  public tailLengthPx: number;

  constructor(leftSide: boolean,
              flows: Array<MushonKeyFlow>,
              klass: string,
              offset?: number,
              width?: number,
              slope?: number,
              roundness?: number,
              headLength?: number,
              tailLength?: number,
              labelTextSize?: number,
  )
  {
    this.leftSide = leftSide;
    this.flows = flows;
    this.klass = klass;
    this.labelTextSize = labelTextSize || 20;
    this.offset = offset || 200;
    this.width = width || 1.0;
    this.slope = slope || 1.0;
    this.roundness = roundness || 9;
    this.headLength = headLength || 0.25;
    this.tailLength = tailLength || 0.25;

    for (let flow of flows) {
      flow.group = this;
    }
  }
}

export class MushonKeyChart {
  public groups: Array<MushonKeyFlowGroup>;
  public centerText: string;
  public centerWidth: number;
  public centerHeight: number;
  public centerDirectionLeft: boolean;
  public margin: any;

  constructor(groups: Array<MushonKeyFlowGroup>,
              centerText?: string,
              centerWidth?: number,
              centerHeight?: number,
              centerDirectionLeft?: boolean,
              margin?: any) {
    this.groups = groups;
    this.centerText = centerText || '';
    this.centerHeight = centerHeight || 150;
    this.centerWidth = centerWidth || 200;
    this.centerDirectionLeft = centerDirectionLeft == null ? true : centerDirectionLeft;
    this.margin = margin || {top: 20, bottom: 20, left: 20, right: 20}
  }
}

@Component({
    selector: 'mushonkey',
    template: `<div class="d3-chart" #el></div>`,
    styles: [`
.d3-chart {
  width: 100%;
  height: 100%;
}
`],
    encapsulation: ViewEncapsulation.None
})
export class MushonkeyComponent implements OnInit, OnChanges {
    @ViewChild('el') private el: ElementRef;
    @Input('chart') private chart: MushonKeyChart;
    @Output() onSelected = new EventEmitter<any>();

  private layout: Array<MushonKeyFlow> = [];

    private connectorWidth: number;
    private center: number;
    private centerOfs: number;
    private textIndent: number = 30;

    private minSideHeight: number = 20;
    private sideSeparation: number = 30;
    private centerSeparation: number = 1;

    // private slope: number = 1.5;
    private centerScale: any;

    private d3Chart: any;
    private width: number;
    private height: number;

    constructor() { }

    ngOnInit() {
        this.createChart();
        if (this.d3Chart) {
            this.updateChart();
            this.drawCenter();
        }
    }

    ngOnChanges() {
        if (this.d3Chart) {
            this.updateChart();
        }
    }

    createChart() {
      const element = this.el.nativeElement;
      this.width = element.offsetWidth - this.chart.margin.left - this.chart.margin.right;
      this.height = element.offsetHeight - this.chart.margin.top - this.chart.margin.bottom;
      this.connectorWidth = this.width / 2;
      this.centerOfs = <number>d3.max(this.chart.groups, g => -g.offset);
      this.center = this.centerOfs + this.chart.centerHeight / 2;

      const svg = d3.select(element).append('svg')
        .attr('width', element.offsetWidth)
        .attr('height', element.offsetHeight);

      // chart plot area
      this.d3Chart = svg.append('g')
        .attr('class', 'mushonkey')
        .attr('transform', `translate(${this.chart.margin.left}, ${this.chart.margin.top})`);
      this.d3Chart.append('g')
        .attr('class', 'connectors');
      this.d3Chart.append('g')
        .attr('class', 'centerpiece-container');
      this.d3Chart.append('g')
        .attr('class', 'labels');
    }

    processData() {
        let leftSum = 0,
            rightSum = 0,
            leftCount = 0,
            rightCount= 0;
        let groups = this.chart.groups;
        for (let group of groups) {
          group.widthPx = group.width * this.connectorWidth;
          group.widthPx -= this.chart.centerWidth / 2;
          group.headLengthPx = group.headLength * group.widthPx;
          group.tailLengthPx = group.tailLength * group.widthPx;
          for (let flow of group.flows) {
            if (group.leftSide) {
              leftCount += 1;
              leftSum += flow.size;
            } else {
              rightCount += 1;
              rightSum += flow.size;
            }
          }
        }
        let sum: number = <number>d3.max([leftSum, rightSum]);
        let count: number = <number>d3.max([leftCount, rightCount]);
        this.centerScale = d3.scaleLinear().domain([0, sum]).range([0, this.chart.centerHeight - this.centerSeparation*(count - 1)]);

        let leftOfs = {
          count: leftCount - 1,
          centerOfs: this.centerOfs,
          sideOfs: 0
        };

        let rightOfs = {
          count: rightCount - 1,
          centerOfs: this.centerOfs,
          sideOfs: 0
        };

      this.layout=[];
        for (let group of groups) {
          let ofs = group.leftSide ? leftOfs : rightOfs;
          ofs.sideOfs = this.center + group.offset;
          for (let flow of group.flows) {
            let scaledWidth = this.centerScale(flow.size);
            flow.size = scaledWidth;
            flow.centerOfs = ofs.centerOfs + scaledWidth/2;
            flow.sideOfs = ofs.sideOfs + scaledWidth/2;
            this.layout.push(flow);
            ofs.centerOfs += scaledWidth + this.centerSeparation*(count-1)/ofs.count;
            ofs.sideOfs += <number>d3.max([scaledWidth + this.sideSeparation, this.minSideHeight])
          }
        }

    }

    generatePath(d: MushonKeyFlow) {
      let p=d3.path();
      let diffY = d.sideOfs - d.centerOfs,
          down = diffY > 0 ? 1 : -1,
          r = d.group.headLengthPx / Math.tan(Math.atan(1/d.group.slope) / 2),
          refy = down == 1 ? this.centerOfs : this.centerOfs + this.chart.centerHeight,
          ry = refy + down * r,
          diffXtop = Math.abs(d.group.slope * diffY),
          head = d.group.headLengthPx * Math.abs(ry - d.centerOfs) / r
        ;
      if (diffXtop > d.group.widthPx - d.group.tailLengthPx - head) {
        diffXtop = d.group.widthPx - d.group.tailLengthPx - head;
      }
      let right = d.group.leftSide ? -1 : 1,
          slope = Math.abs(diffXtop / diffY),
          x0 = this.connectorWidth,
          x1 = x0 + right * this.chart.centerWidth/2,
          x2 = x1 + right * head,
          x3 = x2 + right * diffXtop,
          x4 = x1 + right * d.group.widthPx,
          y1 = d.centerOfs,
          y2 = d.sideOfs,

          ta =  (Math.atan(-down/slope) - Math.PI/2),

          c1y = down == 1 ?
            ((this.centerOfs + this.chart.centerHeight) * d.group.roundness + ry)/(d.group.roundness+1) :
            ((this.centerOfs * d.group.roundness) + ry) / (d.group.roundness+1),
          c1x = x1 + right * Math.abs(c1y-ry) / r * d.group.headLengthPx,

          r1 = Math.abs(c1y - y1),

          r2 = r1,

          c2x = x3 - (c1x - x2),
          c2y = y2 - down * r2
        ;

      const lw = 0;//.5;
      p.moveTo(x0, y1 );
      if (debug) {
        p.lineTo(x2, y1);
        // p.lineTo(x1, ry);
        // p.lineTo(x2, y1);
        p.lineTo(c1x, c1y);
        p.lineTo(x2, y1);
        p.lineTo(x1, y1 );
      }
      if (right == 1) {
        if (down == 1) {
          p.arc(c1x, c1y, r1, 3*Math.PI/2, -ta + Math.PI, false);
          p.arc(c2x, c2y, r2, -ta, Math.PI/2, true);
        } else {
          p.arc(c1x, c1y, r1, Math.PI/2, -ta, true);
          p.arc(c2x, c2y, r2, -ta - Math.PI, -Math.PI/2, false);
        }
      } else {
        if (down == 1) {
          p.arc(c1x, c1y, r1, -Math.PI/2, ta, true);
          p.arc(c2x, c2y, r2, ta + Math.PI, Math.PI/2, false);
        } else {
          p.arc(c1x, c1y, r1, Math.PI/2, ta + Math.PI, false);
          p.arc(c2x, c2y, r2, ta, -Math.PI/2, true);
        }
      }
      if (debug) {
        p.lineTo(x3, y2);
        p.lineTo(c2x, c2y);
        p.lineTo(x3, y2);
      }
      p.lineTo(x4, y2);
      return p.toString();
    }

    updateChart() {

        this.processData();

        let connectorsUpdate = this.d3Chart.select('g.connectors').selectAll('.connector')
          .data(this.layout);
      let labelsUpdate = this.d3Chart.select('g.labels').selectAll('.text')
          .data(this.layout);

        // remove exiting connectors
        connectorsUpdate.exit().remove();
        labelsUpdate.exit().remove();

        // add new bars
        connectorsUpdate.enter()
          .append('path')
          .attr('class', d => 'connector ' + d.group.klass)
          .style('fill', 'none');

        labelsUpdate.enter()
          .append('text')
          .attr('class', d => 'text ' + d.group.klass)
          .style('paint-order', 'stroke')
          .style('stroke-linejoin', 'round')
          .style('alignment-baseline', 'middle')
          .style('cursor', d => d.context ? 'pointer' : 'inherit')
          .on('click', d => { if (d.context) { this.onSelected.emit(d.context); } });

      connectorsUpdate = this.d3Chart.select('g.connectors').selectAll('.connector')
        .data(this.layout);
      labelsUpdate = this.d3Chart.select('g.labels').selectAll('.text')
        .data(this.layout);

      connectorsUpdate
          .attr('d', d => this.generatePath(d))
          .style('stroke-width', d => debug ? 1 : d.size+0.5);

        labelsUpdate
          .attr('y', d => d.sideOfs)
          .attr('x', d => d.group.leftSide ?
            this.connectorWidth - this.chart.centerWidth/2 - d.group.widthPx + this.textIndent :
            this.connectorWidth + this.chart.centerWidth/2 + d.group.widthPx - this.textIndent)
          .style('text-anchor', d => d.group.leftSide ? 'start' : 'end' )
          .style('fill', d =>  d.group.textColor )
          .style('font-size', d => d.group.labelTextSize)
          .style('stroke', d => d.size < d.group.labelTextSize ? 'white': 'none' )
          .style('stroke-width', d => d.group.labelTextSize/2)
          .text(d => { return d.label; });
    }

    drawCenter() {
      let arrowOfs = this.chart.centerDirectionLeft ? -this.chart.centerHeight/3: this.chart.centerHeight/3;
      let centerPath = d3.path();
      centerPath.moveTo(this.connectorWidth - this.chart.centerWidth/2, this.centerOfs);
      centerPath.lineTo(this.connectorWidth + this.chart.centerWidth/2, this.centerOfs);
      centerPath.lineTo(this.connectorWidth + this.chart.centerWidth/2 + arrowOfs, this.centerOfs + this.chart.centerHeight/2);
      centerPath.lineTo(this.connectorWidth + this.chart.centerWidth/2, this.centerOfs + this.chart.centerHeight);
      centerPath.lineTo(this.connectorWidth - this.chart.centerWidth/2, this.centerOfs + this.chart.centerHeight);
      centerPath.lineTo(this.connectorWidth - this.chart.centerWidth/2 + arrowOfs, this.centerOfs + this.chart.centerHeight/2);
      centerPath.closePath();

      let center = this.d3Chart.select('g.centerpiece-container');

      center.append('path')
        .attr('class', 'centerpiece')
        .attr('d', centerPath)
      ;
      center.append('text')
        .attr('class', 'centerpiece-text')
        .text(this.chart.centerText)
        .attr('x', this.connectorWidth + arrowOfs)
        .attr('y', this.centerOfs + this.chart.centerHeight/2)
        .style('alignment-baseline', 'middle')
        .style('text-anchor', 'middle')
      ;
    }
}