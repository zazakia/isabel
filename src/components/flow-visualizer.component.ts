import { Component, input } from '@angular/core';
import { WorkflowStatus } from '../services/data.service';

@Component({
  selector: 'app-flow-visualizer',
  standalone: true,
  template: `
    <div class="flex flex-col items-center space-y-2 py-6">
      
      <!-- Discovery Phase -->
      @let s = status();
      <div class="flex flex-col items-center">
        <div [class]="getNodeClass('NOT_LOCATED', s)">Not Located</div>
        <div class="h-4 w-0.5 bg-slate-300"></div>
        <div [class]="getNodeClass('LOCATED', s)">Located</div>
      </div>

      <!-- Branching -->
      <div class="h-4 w-0.5 bg-slate-300"></div>
      <div class="flex space-x-4">
        <div class="flex flex-col items-center">
          <div [class]="getNodeClass('W_DISCLOSURE', s)">W/ Disclosure</div>
        </div>
        <div class="flex flex-col items-center">
          <div [class]="getNodeClass('WO_DISCLOSURE', s)">No Disclosure</div>
        </div>
      </div>

      <!-- Moving/Not Moving -->
      <div class="h-4 w-0.5 bg-slate-300"></div>
      <div class="flex space-x-4">
         <div [class]="getNodeClass('MOVING', s)">Moving (Paying)</div>
         <div [class]="getNodeClass('NOT_MOVING', s)">Not Moving</div>
      </div>

      <!-- Legal Pipeline -->
      <div class="h-4 w-0.5 bg-slate-300"></div>
      <div class="p-3 bg-slate-50 rounded-lg border border-slate-200 w-full">
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-2">Legal Pipeline</p>
        <div class="flex flex-col items-center space-y-2">
           <div [class]="getNodeClass('DEMAND_QUEUE', s)">Demand Queue</div>
           <div class="h-3 w-0.5 bg-slate-300"></div>
           <div [class]="getNodeClass('1ST_DEMAND', s)">1st Demand Letter</div>
           <div class="h-3 w-0.5 bg-slate-300"></div>
           <div [class]="getNodeClass('2ND_DEMAND', s)">2nd Demand Letter</div>
           <div class="h-3 w-0.5 bg-slate-300"></div>
           <div [class]="getNodeClass('SMALL_CLAIMS', s)">Small Claims Court</div>
        </div>
      </div>

    </div>
  `,
  styles: []
})
export class FlowVisualizerComponent {
  status = input.required<WorkflowStatus>();

  getNodeClass(nodeState: WorkflowStatus, currentState: WorkflowStatus): string {
    const base = "text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-300 ";
    
    if (nodeState === currentState) {
      // Active State (Pulsing)
      return base + "bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-200 ring-offset-1";
    }

    // Heuristic for "Passed" states is tricky in a complex graph without history traversing,
    // so we'll just style the current one distinctly and others as neutral.
    // In a real app, we'd traverse the log history to color 'passed' nodes green.
    
    return base + "bg-white text-slate-500 border-slate-200";
  }
}