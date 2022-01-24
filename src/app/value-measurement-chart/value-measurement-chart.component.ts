import { Component } from '@angular/core';
import { ChartConfiguration, ChartType } from 'chart.js';

@Component({
  selector: 'app-value-measurement-chart',
  templateUrl: './value-measurement-chart.component.html',
  styleUrls: ['./value-measurement-chart.component.scss']
})
export class ValueMeasurementChartComponent {
  public lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [ 1.00, 0.8, 0.3, 0.2, 0.1 ,0 ],
        label: 'Series A',
        backgroundColor: 'rgba(148,159,177,0.2)',
        borderColor: 'rgba(148,159,177,1)',
        pointBackgroundColor: 'rgba(148,159,177,1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(148,159,177,0.8)',
        fill: 'origin',
      }
    ],
    labels: [ '5', '10', '15', '20', '25', '30' ]
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
      legend: { display: true }
    }
  };

  lineChartType: ChartType = 'line';
}
