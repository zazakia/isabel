import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { DataService, Borrower, WorkflowStatus } from '../services/data.service';
import { StatCardComponent } from './components/stat-card.component';
import { DetailPanelComponent } from './components/detail-panel.component';
import { ReportsComponent } from './components/reports.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, StatCardComponent, DetailPanelComponent, ReportsComponent],
  template: `
    <div class="flex h-screen bg-slate-50 text-slate-900 font-sans">
      
      <!-- LAYER A: Sidebar -->
      <aside class="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 flex-shrink-0 z-20">
        <div class="p-6">
          <h1 class="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span class="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs">IS</span>
            ISABEL
          </h1>
          <p class="text-xs text-slate-500 mt-1 uppercase tracking-wider">Collections OS v2.0</p>
        </div>

        <nav class="flex-1 px-4 space-y-1">
          <a (click)="setView('dashboard')" 
             class="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors"
             [class.bg-slate-800]="currentView() === 'dashboard'"
             [class.text-white]="currentView() === 'dashboard'"
             [class.hover:bg-slate-800_50]="currentView() !== 'dashboard'">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
            Dashboard
          </a>
          <a (click)="setView('reports')"
             class="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors"
             [class.bg-slate-800]="currentView() === 'reports'"
             [class.text-white]="currentView() === 'reports'"
             [class.hover:bg-slate-800_50]="currentView() !== 'reports'">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Reports
          </a>
        </nav>

        <div class="p-4 border-t border-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-slate-700"></div>
            <div>
              <p class="text-sm font-medium text-white">Agent Smith</p>
              <p class="text-xs text-slate-500">Senior Collector</p>
            </div>
          </div>
        </div>
      </aside>

      <!-- LAYER B: Main Content -->
      <main class="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50 relative z-10">
        
        <!-- Header -->
        <header class="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 flex-shrink-0">
          <h2 class="text-lg font-semibold text-slate-800">{{ currentView() === 'dashboard' ? 'Overview' : 'Analytics & Reports' }}</h2>
          <div class="flex items-center gap-4">
             <div class="relative">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-3 top-2.5 text-slate-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <input 
                  type="text" 
                  [value]="searchQuery()" 
                  (input)="updateSearch($event)"
                  placeholder="Search borrowers..." 
                  class="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 transition-all"
                >
             </div>
             <button class="p-2 text-slate-400 hover:bg-slate-100 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
             </button>
          </div>
        </header>

        <!-- View Switcher -->
        @if (currentView() === 'dashboard') {
          <div class="flex-1 overflow-y-auto p-8 relative">
            
            <!-- State 1: Overview Cards -->
            <div class="grid grid-cols-3 gap-6 mb-10">
              <app-stat-card 
                label="Legal Pipeline" 
                [value]="data.stats().legal" 
                color="red"
                [isActive]="filter() === 'legal'"
                (clicked)="setFilter('legal')"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>
              </app-stat-card>

              <app-stat-card 
                label="Stuck / No Contact" 
                [value]="data.stats().stuck" 
                color="blue"
                [isActive]="filter() === 'stuck'"
                (clicked)="setFilter('stuck')"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>
              </app-stat-card>

              <app-stat-card 
                label="Moving (Paying)" 
                [value]="data.stats().moving" 
                color="green"
                [isActive]="filter() === 'moving'"
                (clicked)="setFilter('moving')"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </app-stat-card>
            </div>

            <!-- State 2: Focus List (Data Table) -->
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-24">
              <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 class="font-bold text-slate-800">Borrower List</h3>
                <div class="flex items-center gap-4">
                   @if (searchQuery()) {
                     <span class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                       Searching: "{{ searchQuery() }}"
                     </span>
                   }
                   @if(filter() !== 'all') {
                     <button (click)="setFilter('all')" class="text-xs text-blue-600 font-medium hover:underline">Clear Filter</button>
                   }
                </div>
              </div>
              <table class="w-full text-left text-sm text-slate-600">
                <thead class="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
                  <tr>
                    <th class="px-6 py-3 w-10">
                      <input type="checkbox" 
                        [checked]="isAllSelected()" 
                        (change)="toggleAll()"
                        class="rounded border-slate-300 text-blue-600 focus:ring-blue-500">
                    </th>
                    <th class="px-6 py-3">Name</th>
                    <th class="px-6 py-3">Status</th>
                    <th class="px-6 py-3 text-right">Balance</th>
                    <th class="px-6 py-3 text-right">Last Action</th>
                    <th class="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  @for (b of filteredBorrowers(); track b.id) {
                    <tr class="hover:bg-slate-50 cursor-pointer transition-colors" 
                        [class.bg-blue-50]="selectedIds().has(b.id)"
                        (click)="toggleId(b.id, $event)">
                      <td class="px-6 py-4">
                         <input type="checkbox" 
                           [checked]="selectedIds().has(b.id)" 
                           class="rounded border-slate-300 text-blue-600 focus:ring-blue-500 pointer-events-none">
                      </td>
                      <td class="px-6 py-4 font-medium text-slate-900">{{ b.full_name }} <span class="text-xs font-normal text-slate-400 block">{{ b.loan_id }}</span></td>
                      <td class="px-6 py-4">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
                          [class]="statusBadgeClass(b.status)">
                          {{ b.status.replace('_', ' ') }}
                        </span>
                      </td>
                      <td class="px-6 py-4 text-right font-medium">{{ b.outstanding_balance | currency:'PHP':'symbol':'1.0-0' }}</td>
                      <td class="px-6 py-4 text-right text-xs">{{ b.last_action_date | date:'shortDate' }}</td>
                      <td class="px-6 py-4 text-right">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400"><path d="m9 18 6-6-6-6"/></svg>
                      </td>
                    </tr>
                  } @empty {
                    <tr><td colspan="6" class="p-8 text-center text-slate-400">
                       @if (searchQuery()) {
                         No borrowers found matching "{{ searchQuery() }}".
                       } @else {
                         No borrowers found in this category.
                       }
                    </td></tr>
                  }
                </tbody>
              </table>
            </div>
            
            <!-- Bulk Action Bar -->
            @if (selectedIds().size > 0) {
               <div class="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-6 z-30 w-[600px] border border-slate-700 animate-in slide-in-from-bottom-5 fade-in duration-300">
                  <div class="flex items-center gap-2">
                     <span class="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">{{ selectedIds().size }}</span>
                     <span class="text-sm font-medium">Selected</span>
                  </div>
                  
                  <div class="h-6 w-px bg-slate-700"></div>

                  <div class="flex items-center gap-2 flex-1">
                     <label class="text-xs text-slate-400 uppercase font-semibold">Move To:</label>
                     <select #bulkStatusSelect class="bg-slate-800 border border-slate-600 text-sm rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-200">
                        <option value="DEMAND_QUEUE">Demand Queue</option>
                        <option value="1ST_DEMAND">1st Demand</option>
                        <option value="SMALL_CLAIMS">Small Claims</option>
                        <option value="LOCATED">Located</option>
                        <option value="NOT_LOCATED">Not Located</option>
                     </select>
                  </div>

                  <div class="flex items-center gap-2">
                     <button (click)="applyBulkStatus(bulkStatusSelect.value)" class="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-4 py-2 rounded transition-colors">
                        Apply Update
                     </button>
                     <button (click)="clearSelection()" class="text-slate-400 hover:text-white p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 18 18"/></svg>
                     </button>
                  </div>
               </div>
            }

          </div>
        } @else {
          <app-reports></app-reports>
        }
      </main>

      <!-- LAYER C: Overlay -->
      <app-detail-panel 
        [borrower]="selectedBorrower()" 
        (close)="clearSelection()"
      ></app-detail-panel>

    </div>
  `
})
export class AppComponent {
  data = inject(DataService);
  
  currentView = signal<'dashboard' | 'reports'>('dashboard');
  filter = signal<'all' | 'legal' | 'stuck' | 'moving'>('all');
  searchQuery = signal<string>('');
  selectedBorrower = signal<Borrower | null>(null);

  // Bulk Selection State
  selectedIds = signal<Set<string>>(new Set());

  filteredBorrowers = computed(() => {
    let list = this.data.borrowers();
    
    // 1. Filter by Status
    const f = this.filter();
    if (f === 'legal') list = list.filter(b => ['DEMAND_QUEUE', '1ST_DEMAND', '2ND_DEMAND', 'SMALL_CLAIMS'].includes(b.status));
    else if (f === 'moving') list = list.filter(b => b.status === 'MOVING');
    else if (f === 'stuck') list = list.filter(b => ['NOT_LOCATED', 'NOT_MOVING', 'WRITE_OFF'].includes(b.status));

    // 2. Filter by Search Query
    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      list = list.filter(b => 
        b.full_name.toLowerCase().includes(q) || 
        b.loan_id.toLowerCase().includes(q) || 
        b.phone.includes(q)
      );
    }

    return list;
  });

  isAllSelected = computed(() => {
    const list = this.filteredBorrowers();
    const selected = this.selectedIds();
    return list.length > 0 && list.every(b => selected.has(b.id));
  });

  setView(view: 'dashboard' | 'reports') {
    this.currentView.set(view);
  }

  setFilter(f: 'all' | 'legal' | 'stuck' | 'moving') {
    this.selectedIds.set(new Set()); // Clear selection on filter change
    if (this.filter() === f) {
      this.filter.set('all');
    } else {
      this.filter.set(f);
    }
  }

  updateSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  // Refined Logic:
  // - Clicking the checkbox column toggles selection.
  // - Clicking the row body opens details, UNLESS shift/ctrl held (advanced) or just simple separation.
  // - To simplify: I'll make the first cell (checkbox) the toggle trigger, and the rest of the row the detail trigger.
  //   But in the template above, I put the click on the TR.
  //   Let's fix the template to put the click handler on the TD for details.
  
  // Actually, I'll update the logic in the Class to rely on where the user clicked.
  selectBorrower(b: Borrower) {
    // If user is selecting (checkbox clicked), don't open panel
    // This is handled by the template separation below
    this.selectedBorrower.set(b);
  }

  toggleIdFromRow(id: string, event: Event) {
    event.stopPropagation();
    this.selectedIds.update(set => {
      const newSet = new Set(set);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  }
  
  // Helper for template
  toggleId(id: string, event: Event) {
    // If the click came from the checkbox cell
    const target = event.target as HTMLElement;
    // Check if click was on the checkbox input itself or the cell
    if (target.tagName === 'INPUT' || target.closest('td')?.querySelector('input')) {
        // It's a selection toggle
        this.selectedIds.update(set => {
            const newSet = new Set(set);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
        // Stop it from bubbling to row click if row click opens details
        event.stopPropagation();
    } else {
        // It's a detail view open
        const b = this.data.borrowers().find(x => x.id === id);
        if (b) this.selectBorrower(b);
    }
  }

  toggleAll() {
    const list = this.filteredBorrowers();
    const allSelected = this.isAllSelected();
    
    if (allSelected) {
      this.selectedIds.set(new Set());
    } else {
      const newSet = new Set(this.selectedIds());
      list.forEach(b => newSet.add(b.id));
      this.selectedIds.set(newSet);
    }
  }

  clearSelection() {
    this.selectedBorrower.set(null);
    this.selectedIds.set(new Set());
  }

  applyBulkStatus(status: string) {
    this.data.bulkUpdateStatus(
      Array.from(this.selectedIds()), 
      status as WorkflowStatus, 
      'Bulk update via Dashboard'
    );
    this.selectedIds.set(new Set()); // Clear after action
  }

  statusBadgeClass(status: string) {
    if (['LOCATED', 'MOVING', 'W_DISCLOSURE'].includes(status)) return 'bg-green-100 text-green-700';
    if (['NOT_MOVING', 'NOT_LOCATED'].includes(status)) return 'bg-red-100 text-red-700';
    if (['DEMAND_QUEUE', '1ST_DEMAND', '2ND_DEMAND', 'SMALL_CLAIMS'].includes(status)) return 'bg-amber-100 text-amber-800';
    return 'bg-slate-100 text-slate-600';
  }
}