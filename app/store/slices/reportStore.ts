import { create } from 'zustand';

export interface Report {
  id: string;
  type: string;
  status: string;
  photoUrl?: string;
  latitude: number;
  longitude: number;
  ward?: string;
  severity?: number;
  createdAt: string;
  updatedAt?: string;
}

interface ReportState {
  reports: Report[];
  isLoading: boolean;
  addReport: (report: Report) => void;
  updateReport: (id: string, updates: Partial<Report>) => void;
  setReports: (reports: Report[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useReportStore = create<ReportState>((set) => ({
  reports: [],
  isLoading: false,

  addReport: (report) =>
    set((state) => ({ reports: [report, ...state.reports] })),

  updateReport: (id, updates) =>
    set((state) => ({
      reports: state.reports.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    })),

  setReports: (reports) => set({ reports }),

  setLoading: (isLoading) => set({ isLoading }),
}));
