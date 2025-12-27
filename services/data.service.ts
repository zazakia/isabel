import { Injectable, signal, computed } from '@angular/core';

export type WorkflowStatus = 
  'NOT_LOCATED' | 'LOCATED' | 'W_DISCLOSURE' | 'WO_DISCLOSURE' | 
  'MOVING' | 'NOT_MOVING' | 'DEMAND_QUEUE' | '1ST_DEMAND' | 
  '2ND_DEMAND' | 'SMALL_CLAIMS' | 'WRITE_OFF';

export interface Borrower {
  id: string;
  full_name: string;
  loan_id: string;
  phone: string;
  address: string;
  status: WorkflowStatus;
  days_in_status: number;
  last_action_date: string;
  total_loan: number;
  outstanding_balance: number;
  last_payment_date: string | null;
}

export interface ActionLog {
  id: string;
  borrower_id: string;
  action_type: string;
  old_status: WorkflowStatus;
  new_status: WorkflowStatus;
  notes: string;
  performed_at: string;
}

@Injectable({ providedIn: 'root' })
export class DataService {
  // Mock Data
  private mockBorrowers: Borrower[] = [
    { id: '1', full_name: 'Alice Johnson', loan_id: 'LN-2023-001', phone: '555-0101', address: '123 Maple St, Springfield', status: 'NOT_LOCATED', days_in_status: 12, last_action_date: new Date().toISOString(), total_loan: 5000, outstanding_balance: 5000, last_payment_date: null },
    { id: '2', full_name: 'Bob Smith', loan_id: 'LN-2023-002', phone: '555-0102', address: '456 Oak Ave, Metropolis', status: 'LOCATED', days_in_status: 3, last_action_date: new Date().toISOString(), total_loan: 12000, outstanding_balance: 11500, last_payment_date: '2023-12-01' },
    { id: '3', full_name: 'Charlie Davis', loan_id: 'LN-2023-003', phone: '555-0103', address: '789 Pine Ln, Gotham', status: 'MOVING', days_in_status: 45, last_action_date: new Date().toISOString(), total_loan: 3000, outstanding_balance: 1200, last_payment_date: '2024-05-15' },
    { id: '4', full_name: 'Diana Prince', loan_id: 'LN-2023-004', phone: '555-0104', address: '101 Island Dr, Themyscira', status: 'NOT_MOVING', days_in_status: 5, last_action_date: new Date().toISOString(), total_loan: 8500, outstanding_balance: 8500, last_payment_date: '2024-01-20' },
    { id: '5', full_name: 'Evan Wright', loan_id: 'LN-2023-005', phone: '555-0105', address: '202 Cloud St, Sky City', status: 'DEMAND_QUEUE', days_in_status: 2, last_action_date: new Date().toISOString(), total_loan: 15000, outstanding_balance: 15000, last_payment_date: null },
    { id: '6', full_name: 'Fiona Green', loan_id: 'LN-2023-006', phone: '555-0106', address: '303 Forest Rd, Emerald City', status: '1ST_DEMAND', days_in_status: 16, last_action_date: new Date().toISOString(), total_loan: 4500, outstanding_balance: 4500, last_payment_date: null },
    { id: '7', full_name: 'George Hall', loan_id: 'LN-2023-007', phone: '555-0107', address: '404 Error Way, Silicon Valley', status: '2ND_DEMAND', days_in_status: 20, last_action_date: new Date().toISOString(), total_loan: 2500, outstanding_balance: 2500, last_payment_date: null },
    { id: '8', full_name: 'Hannah Lee', loan_id: 'LN-2023-008', phone: '555-0108', address: '505 Ocean Blvd, Atlantis', status: 'SMALL_CLAIMS', days_in_status: 60, last_action_date: new Date().toISOString(), total_loan: 20000, outstanding_balance: 19000, last_payment_date: '2023-11-10' },
    { id: '9', full_name: 'Ian Curtis', loan_id: 'LN-2023-009', phone: '555-0109', address: '606 Dark St, Manchester', status: 'WRITE_OFF', days_in_status: 120, last_action_date: new Date().toISOString(), total_loan: 500, outstanding_balance: 500, last_payment_date: null },
    { id: '10', full_name: 'Julia Roberts', loan_id: 'LN-2023-010', phone: '555-0110', address: '707 Movie Star Dr, Hollywood', status: 'W_DISCLOSURE', days_in_status: 1, last_action_date: new Date().toISOString(), total_loan: 10000, outstanding_balance: 9800, last_payment_date: '2024-05-20' },
  ];

  private mockLogs: ActionLog[] = [
    { id: '101', borrower_id: '1', action_type: 'SYSTEM', old_status: 'NOT_LOCATED', new_status: 'NOT_LOCATED', notes: 'Account imported', performed_at: '2023-10-01T09:00:00Z' },
    { id: '102', borrower_id: '5', action_type: 'STATUS_CHANGE', old_status: 'NOT_MOVING', new_status: 'DEMAND_QUEUE', notes: 'Automated escalation due to missed payment', performed_at: '2023-11-15T10:00:00Z' },
    { id: '103', borrower_id: '6', action_type: 'STATUS_CHANGE', old_status: 'DEMAND_QUEUE', new_status: '1ST_DEMAND', notes: 'Generated 1st Demand Letter', performed_at: '2023-11-20T11:00:00Z' },
    { id: '104', borrower_id: '2', action_type: 'STATUS_CHANGE', old_status: 'NOT_LOCATED', new_status: 'LOCATED', notes: 'Found new address via skip trace', performed_at: '2023-12-01T14:00:00Z' },
    { id: '105', borrower_id: '8', action_type: 'STATUS_CHANGE', old_status: '2ND_DEMAND', new_status: 'SMALL_CLAIMS', notes: 'Approved for legal action', performed_at: '2023-10-05T09:30:00Z' },
  ];

  // Signals
  readonly borrowers = signal<Borrower[]>(this.mockBorrowers);
  readonly logs = signal<ActionLog[]>(this.mockLogs);

  // Computed Stats
  readonly stats = computed(() => {
    const list = this.borrowers();
    return {
      total: list.length,
      legal: list.filter(b => ['DEMAND_QUEUE', '1ST_DEMAND', '2ND_DEMAND', 'SMALL_CLAIMS'].includes(b.status)).length,
      moving: list.filter(b => b.status === 'MOVING').length,
      stuck: list.filter(b => ['NOT_LOCATED', 'NOT_MOVING', 'WRITE_OFF'].includes(b.status)).length,
    };
  });

  // KPI Statistics for Reports
  readonly portfolioStats = computed(() => {
    const list = this.borrowers();
    // Explicitly type accumulator as number to prevent TS arithmetic errors
    const totalOutstanding = list.reduce((acc: number, b) => acc + b.outstanding_balance, 0);
    const totalLoanAmount = list.reduce((acc: number, b) => acc + b.total_loan, 0);
    
    // Group totals for charts
    const movingBal = list.filter(b => b.status === 'MOVING').reduce((acc: number, b) => acc + b.outstanding_balance, 0);
    const legalBal = list.filter(b => ['DEMAND_QUEUE', '1ST_DEMAND', '2ND_DEMAND', 'SMALL_CLAIMS'].includes(b.status)).reduce((acc: number, b) => acc + b.outstanding_balance, 0);
    const stuckBal = list.filter(b => ['NOT_LOCATED', 'NOT_MOVING', 'WRITE_OFF'].includes(b.status)).reduce((acc: number, b) => acc + b.outstanding_balance, 0);
    const otherBal = totalOutstanding - movingBal - legalBal - stuckBal; // Remainder (e.g. LOCATED)

    return {
      totalOutstanding,
      totalLoanAmount,
      collectionRate: totalLoanAmount > 0 ? ((totalLoanAmount - totalOutstanding) / totalLoanAmount) * 100 : 0,
      financialDistribution: [
        { label: 'Performing', value: movingBal, color: '#22c55e' }, // green-500
        { label: 'Legal Action', value: legalBal, color: '#f59e0b' }, // amber-500
        { label: 'High Risk / Stuck', value: stuckBal, color: '#ef4444' }, // red-500
        { label: 'New / Other', value: otherBal, color: '#64748b' } // slate-500
      ],
      // Status Counts for Bar Chart
      statusCounts: Object.entries(
        list.reduce((acc, b) => {
          acc[b.status] = (acc[b.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).map(([k, v]) => ({ status: k, count: v }))
       .sort((a, b) => b.count - a.count) // Top counts first
    };
  });

  // FSM Logic
  getNextStates(currentStatus: WorkflowStatus): WorkflowStatus[] {
    switch (currentStatus) {
      case 'NOT_LOCATED': return ['LOCATED'];
      case 'LOCATED': return ['W_DISCLOSURE', 'WO_DISCLOSURE'];
      case 'W_DISCLOSURE': 
      case 'WO_DISCLOSURE': return ['MOVING', 'NOT_MOVING'];
      case 'MOVING': return ['NOT_MOVING']; // If payment stops
      case 'NOT_MOVING': return ['DEMAND_QUEUE', 'MOVING']; // Moving if payment resumes
      case 'DEMAND_QUEUE': return ['1ST_DEMAND'];
      case '1ST_DEMAND': return ['2ND_DEMAND'];
      case '2ND_DEMAND': return ['SMALL_CLAIMS'];
      case 'SMALL_CLAIMS': return ['WRITE_OFF', 'MOVING']; // Can settle or write off
      default: return [];
    }
  }

  // Mutation
  updateStatus(borrowerId: string, newStatus: WorkflowStatus, note: string = '') {
    const currentList = this.borrowers();
    const idx = currentList.findIndex(b => b.id === borrowerId);
    if (idx === -1) return;

    const borrower = currentList[idx];
    const oldStatus = borrower.status;

    // Simulate DB Update
    const updatedBorrower = { 
      ...borrower, 
      status: newStatus,
      last_action_date: new Date().toISOString(),
      days_in_status: 0 
    };

    const newList = [...currentList];
    newList[idx] = updatedBorrower;
    this.borrowers.set(newList);

    // Log Action
    const newLog: ActionLog = {
      id: Math.random().toString(36).slice(2, 11), // Replaced deprecated substr
      borrower_id: borrower.id,
      action_type: 'STATUS_CHANGE',
      old_status: oldStatus,
      new_status: newStatus,
      notes: note,
      performed_at: new Date().toISOString()
    };
    this.logs.update(logs => [newLog, ...logs]);
  }

  // Bulk Status Update
  bulkUpdateStatus(borrowerIds: string[], newStatus: WorkflowStatus, note: string = '') {
    if (borrowerIds.length === 0) return;

    const currentList = this.borrowers();
    const newList = [...currentList];
    const newLogs: ActionLog[] = [];
    const timestamp = new Date().toISOString();

    borrowerIds.forEach(id => {
      const idx = newList.findIndex(b => b.id === id);
      if (idx !== -1) {
        const borrower = newList[idx];
        const oldStatus = borrower.status;

        // Update Borrower
        newList[idx] = {
          ...borrower,
          status: newStatus,
          last_action_date: timestamp,
          days_in_status: 0
        };

        // Create Log
        newLogs.push({
          id: Math.random().toString(36).slice(2, 11),
          borrower_id: borrower.id,
          action_type: 'STATUS_CHANGE_BULK',
          old_status: oldStatus,
          new_status: newStatus,
          notes: note,
          performed_at: timestamp
        });
      }
    });

    this.borrowers.set(newList);
    this.logs.update(logs => [...newLogs, ...logs]);
  }

  // Add a note without changing status
  addNote(borrowerId: string, note: string) {
    const currentList = this.borrowers();
    const borrower = currentList.find(b => b.id === borrowerId);
    if (!borrower) return;

    const newLog: ActionLog = {
      id: Math.random().toString(36).slice(2, 11),
      borrower_id: borrowerId,
      action_type: 'NOTE',
      old_status: borrower.status,
      new_status: borrower.status,
      notes: note,
      performed_at: new Date().toISOString()
    };
    this.logs.update(logs => [newLog, ...logs]);
  }
}