import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData, ChartEvent, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-rank-chart',
  templateUrl: './rank-chart.component.html',
  styleUrls: ['./rank-chart.component.scss']
})
export class RankChartComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    // We use these empty structures as placeholders for dynamic theming.
    scales: {
      x: {
        display: false
      },
      y: {}
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom'
      }
    },
    indexAxis: 'y'
  };
  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: [ '2006', '2007', '2008', '2009', '2010', '2011', '2012' ],
    datasets: [
      { data: [ 65, 59, 80, 81, 56, 55, 40 ], label: 'Series A', stack: 'a' },
      { data: [ 28, 48, 40, 19, 86, 27, 90 ], label: 'Series B', stack: 'a' },
      { data: [ 40, 19, 86, 28, 48, 27, 90 ], label: 'Series C', stack: 'a' },
      { data: [ 28, 48, 40, 27, 90, 19, 86 ], label: 'Series D', stack: 'a' },
      { data: [ 86, 27, 28, 48, 40, 19, 90 ], label: 'Series E', stack: 'a' },
      { data: [ 28, 19, 86, 27, 90, 48, 40 ], label: 'Series F', stack: 'a' }
    ]
  };

  constructor() { }

  ngOnInit(): void {
  }

}
