import { AfterViewInit, OnDestroy } from '@angular/core';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-rank-chart',
  templateUrl: './rank-chart.component.html',
  styleUrls: ['./rank-chart.component.scss']
})
export class RankChartComponent implements OnInit, AfterViewInit {
  @ViewChild('rankChart') canvas?: ElementRef<HTMLDivElement>;
  @ViewChild('primary') primary?: ElementRef;
  @ViewChild('accent') accent?: ElementRef;
  @ViewChild('hover') hover?: ElementRef;
  @ViewChild('rankChart') rankChart?: ElementRef;
  @Input() height?: string;
  @Input() width?: string;
  colors: string[] = [];
  barChartOptions: ChartConfiguration['options'];
  barChartType: ChartType = 'bar';
  barChartData?: ChartData<'bar'>;
  primaryColorString = 'rgb(103, 58, 183)'
  accentColorString = 'rgb(255, 236, 179)'
  hoverColorString = 'rgb(189, 189, 189)'


  constructor() {
  }

  ngOnInit(){
    this.configChart(this.primaryColorString, this.accentColorString, this.hoverColorString);
  }

  ngAfterViewInit() {
  //   const primaryColorString = getComputedStyle(this.primary?.nativeElement).color;
  //   const accentColorString = getComputedStyle(this.accent?.nativeElement).color;
  //   const hoverColorString = getComputedStyle(this.hover?.nativeElement).color;
  //   this.configChart(primaryColorString, accentColorString, hoverColorString);
  }

  configChart(primaryColor: string, accentColor: string, hoverColor: string){
    let colors = this.createColorArray(primaryColor, accentColor, 6);
    this.barChartData = {
      labels: [ '2006', '2007', '2008', '2009', '2010', '2011', '2012' ],
      datasets: [
        { data: [ 65, 59, 80, 81, 56, 55, 40 ], label: 'Series A', stack: 'a', backgroundColor: colors[0], hoverBackgroundColor: hoverColor },
        { data: [ 28, 48, 40, 19, 86, 27, 90 ], label: 'Series B', stack: 'a', backgroundColor: colors[1], hoverBackgroundColor: hoverColor },
        { data: [ 40, 19, 86, 28, 48, 27, 90 ], label: 'Series C', stack: 'a', backgroundColor: colors[2], hoverBackgroundColor: hoverColor },
        { data: [ 28, 48, 40, 27, 90, 19, 86 ], label: 'Series D', stack: 'a', backgroundColor: colors[3], hoverBackgroundColor: hoverColor},
        { data: [ 86, 27, 28, 48, 40, 19, 90 ], label: 'Series E', stack: 'a', backgroundColor: colors[4], hoverBackgroundColor: hoverColor },
        { data: [ 28, 19, 86, 27, 90, 48, 40 ], label: 'Series F', stack: 'a', backgroundColor: colors[5], hoverBackgroundColor: hoverColor }
      ]
    };
    this.barChartOptions  = {
      responsive: true,
      maintainAspectRatio: false,
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
      indexAxis: 'y',
    };
  }

  createColorArray(rgbColorStart: string, rgbColorEnd: string, total: number): string[]{

      let colorStart: number[] = rgbColorStart.replace(/[^\d,]/g, '').split(',').map(x => +x);
      let colorEnd: number[] = rgbColorEnd.replace(/[^\d,]/g, '').split(',').map(x => +x);
      let colors: string[] = [];
      for(let i = 0; i < total; i++){
        let fade = i/total;
        let diffRed = colorEnd[0] - colorStart[0];
        let diffGreen = colorEnd[1] - colorStart[1];
        let diffBlue = colorEnd[2] - colorStart[2];

        diffRed = (diffRed * fade) + colorStart[0];
        diffGreen = (diffGreen * fade) + colorStart[1];
        diffBlue = (diffBlue * fade) + colorStart[2];

        colors.push(`rgb(${diffRed}, ${diffGreen}, ${diffBlue})`);
      }
      return colors;
  }
}
