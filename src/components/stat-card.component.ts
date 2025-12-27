import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  template: `
    <div 
      (click)="onClick()"
      class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-300 group relative overflow-hidden"
      [class.ring-2]="isActive()"
      [class.ring-blue-500]="isActive()"
    >
      <div class="flex justify-between items-start mb-4">
        <div>
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">{{ label() }}</p>
          <h3 class="text-3xl font-bold text-slate-800 mt-1 group-hover:text-blue-600 transition-colors">{{ value() }}</h3>
        </div>
        <div class="p-2 rounded-lg" [class]="iconBgClass()">
          <ng-content></ng-content>
        </div>
      </div>
      
      <!-- Tiny trend line visualizer (static for demo) -->
      <div class="w-full h-1 bg-slate-100 rounded-full overflow-hidden mt-2">
        <div class="h-full rounded-full" [class]="barClass()" style="width: 70%"></div>
      </div>
    </div>
  `
})
export class StatCardComponent {
  label = input.required<string>();
  value = input.required<number>();
  isActive = input<boolean>(false);
  color = input<'blue' | 'red' | 'green'>('blue');
  clicked = output<void>();

  onClick() {
    this.clicked.emit();
  }

  iconBgClass() {
    switch(this.color()) {
      case 'red': return 'bg-red-50 text-red-600';
      case 'green': return 'bg-green-50 text-green-600';
      default: return 'bg-blue-50 text-blue-600';
    }
  }

  barClass() {
    switch(this.color()) {
      case 'red': return 'bg-red-500';
      case 'green': return 'bg-green-500';
      default: return 'bg-blue-500';
    }
  }
}