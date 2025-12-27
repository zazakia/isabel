import { Component, input, output, computed, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Borrower, DataService, WorkflowStatus } from '../../services/data.service';
import { PdfService } from '../../services/pdf.service';
import { FlowVisualizerComponent } from './flow-visualizer.component';

@Component({
  selector: 'app-detail-panel',
  standalone: true,
  imports: [FlowVisualizerComponent, DatePipe, CurrencyPipe],
  template: `
    <div class="fixed inset-y-0 right-0 w-[500px] bg-white shadow-2xl transform transition-transform duration-500 ease-in-out border-l border-slate-200 flex flex-col z-50"
         [class.translate-x-0]="borrower()"
         [class.translate-x-full]="!borrower()"
    >
      @if (borrower(); as b) {
        <!-- Header -->
        <div class="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-xl font-bold text-slate-900">{{ b.full_name }}</h2>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide" [class]="statusBadgeClass(b.status)">
                {{ b.status.replace('_', ' ') }}
              </span>
            </div>
            <p class="text-sm text-slate-500 mt-1">{{ b.loan_id }} • {{ b.phone }}</p>
          </div>
          <button (click)="onClose()" class="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 18 18"/></svg>
          </button>
        </div>

        <!-- Scrollable Content -->
        <div class="flex-1 overflow-y-auto p-6 space-y-8">
          
          <!-- Financial Snapshot -->
          <div class="grid grid-cols-2 gap-4">
             <div class="p-4 rounded-lg bg-slate-50 border border-slate-200">
               <span class="text-xs text-slate-500 uppercase">Outstanding Balance</span>
               <div class="text-2xl font-bold text-slate-900 mt-1">{{ b.outstanding_balance | currency:'PHP':'symbol':'1.0-0' }}</div>
             </div>
             <div class="p-4 rounded-lg bg-slate-50 border border-slate-200">
               <span class="text-xs text-slate-500 uppercase">Days in Status</span>
               <div class="text-2xl font-bold text-slate-900 mt-1">{{ b.days_in_status }}d</div>
             </div>
          </div>

          <!-- Workflow Visualizer -->
          <div>
            <h3 class="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>
              Workflow Status
            </h3>
            <app-flow-visualizer [status]="b.status"></app-flow-visualizer>
          </div>

          <!-- Borrower Info -->
          <div>
            <h3 class="text-sm font-bold text-slate-900 mb-2">Contact Information</h3>
            <div class="bg-white rounded border border-slate-200 p-4 text-sm text-slate-600 space-y-2">
              <div class="flex justify-between">
                <span>Address:</span>
                <span class="font-medium text-slate-900 text-right w-1/2">{{ b.address }}</span>
              </div>
              <div class="flex justify-between">
                <span>Last Payment:</span>
                <span class="font-medium text-slate-900">{{ b.last_payment_date ? (b.last_payment_date | date) : 'Never' }}</span>
              </div>
            </div>
          </div>

          <!-- Add Note Section -->
          <div>
             <h3 class="text-sm font-bold text-slate-900 mb-2">Quick Actions</h3>
             <div class="bg-slate-50 rounded-lg border border-slate-200 p-4">
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-2">Log Activity / Note</label>
                <textarea #noteInput 
                  class="w-full text-sm p-3 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-white" 
                  rows="2" 
                  placeholder="E.g., Called borrower, left voicemail..."></textarea>
                <div class="flex justify-end mt-2">
                   <button 
                     (click)="saveNote(b, noteInput.value); noteInput.value = ''"
                     [disabled]="!noteInput.value"
                     class="text-xs bg-slate-800 text-white px-4 py-2 rounded hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed">
                     Save Note
                   </button>
                </div>
             </div>
          </div>

          <!-- Action History -->
          <div>
            <h3 class="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
              Action History
            </h3>
            <div class="relative border-l border-slate-200 ml-2 space-y-6 pl-6 pb-2">
              @for (log of logs(); track log.id) {
                <div class="relative">
                  <!-- Dot -->
                  <div class="absolute -left-[31px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm"
                       [class.bg-blue-500]="log.action_type === 'STATUS_CHANGE'"
                       [class.bg-green-500]="log.action_type === 'NOTE'"
                       [class.bg-slate-300]="log.action_type !== 'STATUS_CHANGE' && log.action_type !== 'NOTE'">
                  </div>
                  
                  <div class="flex flex-col gap-1">
                    <div class="flex items-baseline justify-between">
                       <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">{{ log.action_type.replace('_', ' ') }}</span>
                       <span class="text-[10px] text-slate-400">{{ log.performed_at | date:'MMM d, h:mm a' }}</span>
                    </div>
                    
                    @if(log.old_status !== log.new_status) {
                      <div class="text-xs font-medium text-slate-800 flex items-center gap-2">
                        <span class="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">{{ log.old_status.replace('_', ' ') }}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-300"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                        <span class="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100">{{ log.new_status.replace('_', ' ') }}</span>
                      </div>
                    }

                    @if (log.notes) {
                       <p class="text-sm text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 mt-1">
                         {{ log.notes }}
                       </p>
                    }
                  </div>
                </div>
              } @empty {
                <div class="text-sm text-slate-400 italic">No recorded actions for this borrower.</div>
              }
            </div>
          </div>

        </div>

        <!-- Footer Actions -->
        <div class="p-6 border-t border-slate-100 bg-white space-y-3">
          
          <!-- Dynamic Primary Action -->
          @let action = primaryAction(b);
          @if (action) {
            <button 
              (click)="performAction(b, action.code)"
              class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              @if(action.icon === 'pdf') {
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/></svg>
              }
              @if(action.icon === 'check') {
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              }
              {{ action.label }}
            </button>
          }

          <!-- Secondary Workflow Actions (State Transitions) -->
          <div class="flex gap-2">
            @for (nextState of nextStates(b); track nextState) {
              <button 
                (click)="transition(b, nextState)"
                class="flex-1 py-2 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded shadow-sm transition-colors"
              >
                Mark {{ nextState.replace('_', ' ') }}
              </button>
            }
          </div>
        </div>
      }
    </div>
    
    <!-- Backdrop -->
    @if (borrower()) {
      <div class="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity" (click)="onClose()"></div>
    }
  `
})
export class DetailPanelComponent {
  borrower = input<Borrower | null>(null);
  close = output<void>();
  
  private dataService = inject(DataService);
  private pdfService = inject(PdfService);

  // Computed logs for the selected borrower
  logs = computed(() => {
    const bId = this.borrower()?.id;
    if (!bId) return [];
    // Sort descending by date
    return this.dataService.logs()
      .filter(l => l.borrower_id === bId)
      .sort((a, b) => new Date(b.performed_at).getTime() - new Date(a.performed_at).getTime());
  });

  onClose() {
    this.close.emit();
  }

  nextStates(b: Borrower): WorkflowStatus[] {
    return this.dataService.getNextStates(b.status);
  }

  transition(b: Borrower, next: WorkflowStatus) {
    this.dataService.updateStatus(b.id, next, 'Manual status change');
  }

  saveNote(b: Borrower, note: string) {
    if (!note.trim()) return;
    this.dataService.addNote(b.id, note);
  }

  statusBadgeClass(status: string) {
    if (['LOCATED', 'MOVING', 'W_DISCLOSURE'].includes(status)) return 'bg-green-100 text-green-700';
    if (['NOT_MOVING', 'NOT_LOCATED'].includes(status)) return 'bg-red-100 text-red-700';
    if (['DEMAND_QUEUE', '1ST_DEMAND', '2ND_DEMAND', 'SMALL_CLAIMS'].includes(status)) return 'bg-amber-100 text-amber-800';
    return 'bg-slate-100 text-slate-600';
  }

  // Logic Engine for Primary Action
  primaryAction(b: Borrower): { label: string, code: string, icon: 'pdf' | 'check' | 'none' } | null {
    if (b.status === 'DEMAND_QUEUE') {
      return { label: 'Generate 1st Demand Letter', code: 'GEN_PDF_1', icon: 'pdf' };
    }
    if (b.status === '1ST_DEMAND' && b.days_in_status > 14) {
      return { label: 'Generate 2nd Demand Letter', code: 'GEN_PDF_2', icon: 'pdf' };
    }
    if (b.status === '2ND_DEMAND' && b.days_in_status > 14) {
      return { label: 'File Small Claims', code: 'FILE_LEGAL', icon: 'check' };
    }
    if (b.status === 'LOCATED') {
      return { label: 'Log Call / Outcome', code: 'LOG_CALL', icon: 'none' };
    }
    return null; 
  }

  performAction(b: Borrower, code: string) {
    if (code === 'GEN_PDF_1') {
      this.pdfService.generateDemandLetter(b, '1ST');
      this.dataService.updateStatus(b.id, '1ST_DEMAND', 'Generated 1st Demand Letter');
    }
    else if (code === 'GEN_PDF_2') {
      this.pdfService.generateDemandLetter(b, '2ND');
      this.dataService.updateStatus(b.id, '2ND_DEMAND', 'Generated 2nd Demand Letter');
    }
    else if (code === 'FILE_LEGAL') {
       this.dataService.updateStatus(b.id, 'SMALL_CLAIMS', 'Filed Small Claims Case');
    }
    // Other actions would open a modal, etc.
  }
}