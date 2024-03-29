import {
  Component, OnInit, OnChanges, ViewChild, ElementRef, Input, ViewEncapsulation, Output,
  EventEmitter,
  AfterViewInit
} from '@angular/core';
import { select as d3Select, Selection } from 'd3-selection';
import { max as d3Max } from 'd3-array';
import { scaleLinear as d3ScaleLinear } from 'd3-scale';
import { path as d3Path } from 'd3-path';

const debug = false;

export class MushonKeyFlow {
  public size: number;
  public scaledSize: number;
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
  public centerVerticalOffset: number;

  constructor(groups: Array<MushonKeyFlowGroup>,
              centerText?: string,
              centerWidth?: number,
              centerHeight?: number,
              centerDirectionLeft?: boolean,
              margin?: any,
              centerVerticalOffset?: number) {
    this.groups = groups;
    this.centerText = centerText || '';
    this.centerHeight = centerHeight || 150;
    this.centerWidth = centerWidth || 200;
    this.centerDirectionLeft = centerDirectionLeft == null ? true : centerDirectionLeft;
    this.margin = margin || {top: 20, bottom: 20, left: 20, right: 20}
    this.centerVerticalOffset = centerVerticalOffset || 0;
  }
}

@Component({
  selector: 'mushonkey',
  template: ``,
  styles: [`:host {
      width: 100%;
      height: 100%;
      display: block;
    }
  `]
})
export class MushonkeyComponent implements OnInit, OnChanges, AfterViewInit {
    // @ViewChild('el') private el: ElementRef;
    @Input('chart') chart: MushonKeyChart;
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
    private centerScaleRight: any;
    private centerScaleLeft: any;

    private d3Chart: Selection<SVGGElement, unknown, null, undefined>;
    private width: number;
    private height: number;

    constructor(private el: ElementRef) {}

    update() {
      if (!this.el?.nativeElement) {
        return;
      }
      if (this.chart) {
        if (!this.d3Chart) {
          this.createChart();
        }
        if (this.d3Chart) {
          this.updateChart();
        }
      }
    }

    ngOnInit() {
      this.update();
    }

    ngOnChanges() {
      this.update();
    }

    ngAfterViewInit() {
      this.update();
    }

    createChart() {
      const element = this.el.nativeElement;
      this.width = element.offsetWidth - this.chart.margin.left - this.chart.margin.right;
      this.height = element.offsetHeight - this.chart.margin.top - this.chart.margin.bottom;
      this.connectorWidth = this.width / 2;

      const svg = d3Select(element).append('svg')
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
        if (leftSum == 0) { leftSum = 1; }
        if (rightSum == 0) { rightSum = 1; }
        if (leftCount == 0) { leftCount = 1; }
        if (rightCount == 0) { rightCount = 1; }

        this.centerScaleLeft = d3ScaleLinear().domain([0, leftSum]).range([0, this.chart.centerHeight - this.centerSeparation*(leftCount - 1)]);
        this.centerScaleRight = d3ScaleLinear().domain([0, rightSum]).range([0, this.chart.centerHeight - this.centerSeparation*(rightCount - 1)]);

        if (this.chart.centerVerticalOffset) {
          this.centerOfs = this.chart.centerVerticalOffset;
        } else {
          if (this.chart.groups.length > 0) {
            this.centerOfs = <number>d3Max(this.chart.groups, g => -g.offset);
          } else {
            this.centerOfs = 0;
          }
        }
        this.centerOfs = this.centerOfs < 0 ? 0 : this.centerOfs;
        this.center = this.centerOfs + this.chart.centerHeight / 2;

        let leftOfs = {
          centerOfs: this.centerOfs,
          sideOfs: 0
        };

        let rightOfs = {
          centerOfs: this.centerOfs,
          sideOfs: 0
        };

        this.layout=[];
        for (let group of groups) {
          let ofs = group.leftSide ? leftOfs : rightOfs;
          ofs.sideOfs = this.center + group.offset;
          for (let flow of group.flows) {
            let scaledWidth;
            if (group.leftSide) {
              scaledWidth = this.centerScaleLeft(flow.size);
            } else {
              scaledWidth = this.centerScaleRight(flow.size);
            }
            flow.scaledSize = scaledWidth;
            flow.centerOfs = ofs.centerOfs + scaledWidth/2;
            flow.sideOfs = ofs.sideOfs + scaledWidth/2;
            this.layout.push(flow);
            ofs.centerOfs += scaledWidth + this.centerSeparation;
            ofs.sideOfs += <number>d3Max([scaledWidth + this.sideSeparation, this.minSideHeight])
          }
        }

    }

    generatePath(d: MushonKeyFlow) {
      let p=d3Path();
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

    updateChart(chart?: MushonKeyChart) {

      if (chart) {
        this.chart = chart;
      }

      this.processData();

      let connectorsUpdate = this.d3Chart.select('g.connectors').selectAll<SVGElement, MushonKeyFlow>('.connector')
        .data(this.layout, (d: MushonKeyFlow) => d.label);
      let labelsUpdate = this.d3Chart.select('g.labels').selectAll<SVGElement, MushonKeyFlow>('.text')
        .data(this.layout, (d: MushonKeyFlow) => d.label);

      // remove exiting connectors
      connectorsUpdate.exit().remove();
      labelsUpdate.exit().remove();

      // add new bars
      connectorsUpdate.enter()
        .append('path')
        .attr('class', 'connector')
        .style('fill', 'none');

      labelsUpdate.enter()
        .append('text')
        .attr('class', 'text')
        .style('paint-order', 'stroke')
        .style('stroke-linejoin', 'round')
        .style('alignment-baseline', 'middle')
        .on('click', (event: Event, d: MushonKeyFlow) => { 
          // console.log('MushonKey clicked', d.context);
          if (d.context) { this.onSelected.emit(d.context); } 
        });

      connectorsUpdate = this.d3Chart.select('g.connectors').selectAll<SVGElement, MushonKeyFlow>('.connector')
        .data(this.layout, (d: MushonKeyFlow) => d.label);
      labelsUpdate = this.d3Chart.select('g.labels').selectAll<SVGElement, MushonKeyFlow>('.text')
        .data(this.layout, (d: MushonKeyFlow) => d.label);

      connectorsUpdate
          .attr('d', (d: any) => this.generatePath(d))
          .attr('class', (d: any) => 'connector ' + d.group.klass)
          .style('stroke-width', (d: any) => debug ? 1 : d.scaledSize+0.5)
      ;

      labelsUpdate
        .attr('y', (d: any) => d.sideOfs)
        .attr('x', (d: any) => d.group.leftSide ?
          this.connectorWidth - this.chart.centerWidth/2 - d.group.widthPx + this.textIndent :
          this.connectorWidth + this.chart.centerWidth/2 + d.group.widthPx - this.textIndent)
        .attr('class', (d: any) => 'text ' + d.group.klass)
        .style('cursor', (d: any) => d.context ? 'pointer' : 'inherit')
        .style('text-anchor', (d: any) => d.group.leftSide ? 'start' : 'end' )
        .style('fill', (d: any) =>  d.group.textColor )
        .style('font-size', (d: any) => d.group.labelTextSize)
        .style('stroke', (d: any) => d.scaledSize < d.group.labelTextSize ? 'white': 'none' )
        .style('stroke-width', (d: any) => d.group.labelTextSize/2)
        .text((d: MushonKeyFlow) => { return d.label; });

      this.drawCenter();
    }

    drawCenter() {
      let arrowOfs = this.chart.centerDirectionLeft ? -this.chart.centerHeight/3: this.chart.centerHeight/3;
      let centerPath = d3Path();
      centerPath.moveTo(this.connectorWidth - this.chart.centerWidth/2, this.centerOfs);
      centerPath.lineTo(this.connectorWidth + this.chart.centerWidth/2, this.centerOfs);
      centerPath.lineTo(this.connectorWidth + this.chart.centerWidth/2 + arrowOfs, this.centerOfs + this.chart.centerHeight/2);
      centerPath.lineTo(this.connectorWidth + this.chart.centerWidth/2, this.centerOfs + this.chart.centerHeight);
      centerPath.lineTo(this.connectorWidth - this.chart.centerWidth/2, this.centerOfs + this.chart.centerHeight);
      centerPath.lineTo(this.connectorWidth - this.chart.centerWidth/2 + arrowOfs, this.centerOfs + this.chart.centerHeight/2);
      centerPath.closePath();

      let center = this.d3Chart.select('g.centerpiece-container');

      this.d3Chart.select('g.centerpiece-container')
        .selectAll('path')
        .data([1])
        .enter()
        .append('path')
        .attr('class', 'centerpiece')
      ;
      this.d3Chart.select('g.centerpiece-container')
        .selectAll('path')
        .data([1])
        .attr('d', centerPath.toString())
      ;
      this.d3Chart.select('g.centerpiece-container')
        .selectAll('text')
        .data([1])
        .enter()
        .append('text')
        .attr('class', 'centerpiece-text')
        .style('alignment-baseline', 'middle')
        .style('text-anchor', 'middle')
      ;
      this.d3Chart.select('g.centerpiece-container')
        .selectAll('text')
        .data([1])
        .text(this.chart.centerText)
        .attr('x', this.connectorWidth + arrowOfs)
        .attr('y', this.centerOfs + this.chart.centerHeight/2)
      ;
    }
}