import { Component } from '@angular/core';
import {MushonKeyFlowGroup, MushonKeyFlow, MushonKeyChart} from 'mushonkey';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  chart: MushonKeyChart;
  selected: string = 'aaa';

  constructor() {
    let x:Array<any>;
    let str = (x: any) => x[0] + ' $' + x[1];
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

  flowSelected(context: any) {
    this.selected = JSON.stringify(context);
  }
}
