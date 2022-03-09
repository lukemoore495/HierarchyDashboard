import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartType, ChartEvent, ChartTypeRegistry, Plugin } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { Chart } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

@Component({
  selector: 'app-sensitivity-analysis',
  templateUrl: './sensitivity-analysis.component.html',
  styleUrls: ['./sensitivity-analysis.component.scss']
})
export class SensitivityAnalysisComponent implements OnInit, AfterViewInit {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  @Input() height: string | undefined;
  @Input() width: string | undefined;
  
  constructor() { }

  ngOnInit(): void {
    Chart.register(annotationPlugin);
  }

  ngAfterViewInit(): void {
    this.chart?.update()
  }

  public lineChartData : ChartConfiguration['data'] = {
    datasets: [
        {
            data: [0.7, 0.65, 0.6, 0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2],
            label: 'Security',
            backgroundColor: 'rgba(148,159,177,0.2)',
            fill: false,
        }, 
        {
          data: [0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7],
          label: 'Justice',
          backgroundColor: 'rgba(148,159,177,0.2)',
          fill: false,
      },
      {
        data: [1, 0.95, 0.9, 0.85, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45],
        label: 'Economic Opportunities',
        backgroundColor: 'rgba(148,159,177,0.2)',
        fill: false,
      },
      {
        data: [0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1],
        label: 'Education',
        backgroundColor: 'rgba(148,159,177,0.2)',
        fill: false,
      },
      {
        data: [0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2, 0.15, 0.1, 0],
        label: 'Socio Economic',
        backgroundColor: 'rgba(148,159,177,0.2)',
        fill: false,
      }
    ],
    labels: ['0', '0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1']
};

public lineChartOptions: ChartConfiguration['options'] = {
    elements: {
      line: {
        tension: 0.5
      }
    },
    scales: {
      // We use this empty structure as a placeholder for dynamic theming.
      x: {},
      'y-axis-0':
        {
          position: 'left',
        },
      'y-axis-1': {
        position: 'right',
        grid: {
          color: 'rgba(255,0,0,0.3)',
        },
        ticks: {
          color: 'red'
        }
      }
    },

    plugins: {
      legend: { display: true },
      annotation: {
        annotations: [
          {
            type: 'line',
            scaleID: 'x',
            value: '0.5',
            borderColor: 'black',
            borderWidth: 2,
          }
        ]
      }
    }
  };

lineChartType: ChartType = 'line';
}
