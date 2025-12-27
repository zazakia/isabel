import { Component, ElementRef, inject, viewChild, effect, AfterViewInit, computed } from '@angular/core';
import { DataService } from '../../services/data.service';
import { CommonModule, CurrencyPipe, DecimalPipe, PercentPipe } from '@angular/common';

declare const d3: any;

@Component({
  selector: 'app-reports',
  imports: [CommonModule, DecimalPipe, PercentPipe, CurrencyPipe],
  template: `
    <div class="p-8 h-full flex flex-col overflow-y-auto">
      <h2 class="text-2xl font-bold text-slate-900 mb-6">Executive Reports</h2>
      
      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Portfolio Value</p>
          <h3 class="text-2xl font-bold text-slate-900 mt-1">{{ stats().totalLoanAmount | currency:'PHP':'symbol':'1.0-0' }}</h3>
          <div class="mt-2 text-xs text-green-600 flex items-center gap-1">
             <span class="bg-green-100 px-1.5 py-0.5 rounded">Total Issued</span>
          </div>
        </div>

        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Outstanding Debt</p>
          <h3 class="text-2xl font-bold text-slate-900 mt-1">{{ stats().totalOutstanding | currency:'PHP':'symbol':'1.0-0' }}</h3>
           <div class="mt-2 text-xs text-red-600 flex items-center gap-1">
             <span class="bg-red-100 px-1.5 py-0.5 rounded">To Collect</span>
          </div>
        </div>

        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Collection Rate</p>
          <h3 class="text-2xl font-bold text-slate-900 mt-1">{{ stats().collectionRate / 100 | percent:'1.1-1' }}</h3>
           <div class="mt-2 text-xs text-blue-600 flex items-center gap-1">
             <span class="bg-blue-100 px-1.5 py-0.5 rounded">Performance</span>
          </div>
        </div>

        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Legal Cases</p>
          <h3 class="text-2xl font-bold text-slate-900 mt-1">{{ legalCount() }}</h3>
          <div class="mt-2 text-xs text-amber-600 flex items-center gap-1">
             <span class="bg-amber-100 px-1.5 py-0.5 rounded">Escalated</span>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[400px]">
        
        <!-- Donut Chart -->
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 class="font-bold text-slate-800 mb-4">Risk Exposure (By Balance)</h3>
          <div class="flex-1 relative" #donutContainer></div>
        </div>

        <!-- Bar Chart -->
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 class="font-bold text-slate-800 mb-4">Workflow Bottlenecks (Cases by Status)</h3>
          <div class="flex-1 relative" #barContainer></div>
        </div>

      </div>
    </div>
  `,
  styles: [`:host { display: block; height: 100%; }`]
})
export class ReportsComponent implements AfterViewInit {
  private dataService = inject(DataService);

  donutContainer = viewChild<ElementRef>('donutContainer');
  barContainer = viewChild<ElementRef>('barContainer');

  stats = this.dataService.portfolioStats;
  legalCount = computed(() => this.dataService.stats().legal);

  constructor() {
    effect(() => {
      // Re-run whenever stats change
      const s = this.stats();
      this.renderCharts(s);
    });
  }

  ngAfterViewInit() {
    // Initial draw happens via effect, but we need to ensure containers exist.
    // The effect might run before view init, so we might need a flag or setTimeout.
    // However, D3 needs DOM.
    setTimeout(() => this.renderCharts(this.stats()), 0);
  }

  renderCharts(data: any) {
    const donutEl = this.donutContainer()?.nativeElement;
    const barEl = this.barContainer()?.nativeElement;

    if (typeof d3 === 'undefined') {
        console.warn('D3 not loaded');
        return;
    }

    if (donutEl) this.drawDonut(donutEl, data.financialDistribution);
    if (barEl) this.drawBar(barEl, data.statusCounts);
  }

  drawDonut(element: HTMLElement, data: {label: string, value: number, color: string}[]) {
    d3.select(element).selectAll('*').remove();
    
    const width = element.clientWidth;
    const height = element.clientHeight || 300;
    const radius = Math.min(width, height) / 2;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const pie = d3.pie().value((d: any) => d.value).sort(null);
    const arc = d3.arc().innerRadius(radius * 0.6).outerRadius(radius * 0.9);
    
    // Tooltip area in center
    const centerText = svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .style('font-size', '14px')
        .style('fill', '#64748b')
        .text('Total Exposure');

    svg.selectAll('path')
      .data(pie(data))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', (d: any) => d.data.color)
      .attr('stroke', 'white')
      .style('stroke-width', '2px')
      .style('opacity', 0.9)
      .on('mouseover', function(this: any, event: any, d: any) {
         d3.select(this).style('opacity', 1);
         centerText.text(`₱${(d.data.value / 1000).toFixed(1)}k`);
         centerText.style('font-weight', 'bold').style('fill', '#1e293b');
      })
      .on('mouseout', function(this: any) {
         d3.select(this).style('opacity', 0.9);
         centerText.text('Total Exposure');
         centerText.style('font-weight', 'normal').style('fill', '#64748b');
      });

    // Legend
    const legend = svg.append('g').attr('transform', `translate(${radius + 20}, ${-radius + 20})`);
    // Simple legend implementation omitted for space, relying on tooltips/colors
  }

  drawBar(element: HTMLElement, data: {status: string, count: number}[]) {
    d3.select(element).selectAll('*').remove();
    
    // Take top 6 statuses
    const chartData = data.slice(0, 6);
    
    const margin = {top: 20, right: 20, bottom: 40, left: 100};
    const width = element.clientWidth - margin.left - margin.right;
    const height = (element.clientHeight || 300) - margin.top - margin.bottom;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
      .domain([0, d3.max(chartData, (d: any) => d.count) || 10])
      .range([0, width]);

    const y = d3.scaleBand()
      .range([0, height])
      .domain(chartData.map((d: any) => d.status.replace('_', ' ')))
      .padding(0.2);

    // Bars
    svg.selectAll('rect')
      .data(chartData)
      .enter()
      .append('rect')
      .attr('x', x(0))
      .attr('y', (d: any) => y(d.status.replace('_', ' ')))
      .attr('width', (d: any) => x(d.count))
      .attr('height', y.bandwidth())
      .attr('fill', '#3b82f6')
      .attr('rx', 4);

    // Labels
    svg.append('g')
      .call(d3.axisLeft(y).tickSize(0))
      .select('.domain').remove();
    
    svg.selectAll('.tick text')
       .attr('font-size', '10px')
       .attr('color', '#64748b');

    // Values at end of bar
    svg.selectAll('.label')
       .data(chartData)
       .enter()
       .append('text')
       .attr('x', (d: any) => x(d.count) + 5)
       .attr('y', (d: any) => y(d.status.replace('_', ' ')) + y.bandwidth() / 2)
       .attr('dy', '.35em')
       .text((d: any) => d.count)
       .attr('font-size', '10px')
       .attr('fill', '#64748b');
  }
}