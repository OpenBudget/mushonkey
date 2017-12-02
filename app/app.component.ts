import { Component } from '@angular/core';
import {MushonKeyFlowGroup, MushonKeyFlow, MushonKeyChart} from "../src/components/MushonkeyComponent";
declare const process: any;

@Component({
  selector: 'my-app',
  template: `
    <div>Slope: <input type="number" step="0.05" [(ngModel)]="chart.groups[0].slope" (input)="mushonkey.updateChart()"/></div>
    <div>Roundness: <input type="number" step="0.2" [(ngModel)]="chart.groups[0].roundness" (input)="mushonkey.updateChart()"/></div>
    <div>Width: <input type="number" step="0.05" [(ngModel)]="chart.groups[0].width" (input)="mushonkey.updateChart()"/></div>
    <div>Offset: <input type="number" step="5" [(ngModel)]="chart.groups[0].offset" (input)="mushonkey.updateChart()"/></div>
    <div>Last selected: {{selected}}</div>
    <div id="mushonkey-container">
        <mushonkey #mushonkey [chart]="chart" (onSelected)="flowSelected($event)"></mushonkey>
    </div>
 `,
  styles: [`
    #mushonkey-container {
        width: 1200px;
        height: 600px;
    }

    :host >>> .centerpiece { 
        stroke: lightgray;
        stroke-width: 2;
        fill: gray;
     }

    :host >>> .centerpiece-text { 
        font-size: 20px;
        stroke: none;
        fill: white;
    }

    :host >>> .text { font-family: Courier; }
    :host >>> .taxes.connector { stroke: lightblue; }
    :host >>> .taxes.text { fill: voilet; }
    
    :host >>> .main-income.connector{ stroke: red; }
    :host >>> .main-income.text{ fill: black; }

    :host >>> .special-income.connector{ stroke: violet; }
    :host >>> .special-income.text{ fill: orange; }
    
    :host >>> .shopping.connector{ stroke: green; }
    :host >>> .shopping.text{ fill: turquoise; }    
    }
  `]
})
export class AppComponent {

  private chart: MushonKeyChart;
  private selected: string = 'aaa';

  constructor() {
    let x:Array<any>;
    let str = (x) => x[0] + ' $' + x[1];
    let leftFlows1 = [];
    for (x of [['City Tax', 10], ['Electricity', 25], ['Internet Provider', 100], ['Education', 300]]) {
      leftFlows1.push(new MushonKeyFlow(x[1], str(x), {clicked: x}))
    }
    let leftFlows2 = [];
    // for (let x of [400, 300, 200, 100, 50, 25, 12, 10]) {
    for (x of [['Rent', 400], ['Clothes', 50], ['Misc', 12], ['Food', 200]]) {
      leftFlows2.push(new MushonKeyFlow(x[1], str(x), {clicked: x}))
    }
    let rightFlows1 = [];
    for (x of [['Salary', 1000]]) {
      rightFlows1.push(new MushonKeyFlow(x[1], str(x), {clicked: x}))
    }
    let rightFlows2 = [];
    for (x of [['Gift Card', 37], ['Bitcoin Mining', 60]]) {
      rightFlows2.push(new MushonKeyFlow(x[1], str(x), {clicked: x}))
    }

    let groups: Array<MushonKeyFlowGroup> = [];

    groups.push(new MushonKeyFlowGroup(false, leftFlows1, 'taxes', -200));
    groups.push(new MushonKeyFlowGroup(true, rightFlows1, 'main-income', -100, 0.8, 5, 30));
    groups.push(new MushonKeyFlowGroup(true, rightFlows2, 'special-income', 100, 0.6, 0.6, 2));
    groups.push(new MushonKeyFlowGroup(false, leftFlows2, 'shopping', 100, 0.75, 0.8, 10));

    for ( let group of groups ) {
      group.labelTextSize = 12;
    }

    this.chart = new MushonKeyChart(groups, 'My Family Budget', 200, 100, false);
  }

  flowSelected(context) {
    this.selected = JSON.stringify(context);
  }
}
