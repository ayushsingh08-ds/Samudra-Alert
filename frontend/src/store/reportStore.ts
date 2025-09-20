// Shared store for managing reports across different dashboards
export interface ReportData {
  id: string;
  type: "photo" | "video" | "audio" | "text";
  hazardType: string;
  location: {
    coordinates: string;
    address: string;
    lat: number;
    lng: number;
  };
  timestamp: Date;
  citizen: {
    name: string;
    credibilityScore: number;
  };
  media?: {
    url: string;
    thumbnail?: string;
  };
  description?: string;
  status: "pending" | "verified" | "rejected" | "escalated";
  priority: "low" | "medium" | "high" | "critical";
  aiAnalysis: {
    severityScore: number;
    misinformationScore: number;
    sentimentScore: number;
    confidence: number;
    insights: string[];
  };
  analystNotes?: string;
  verifiedBy?: string;
  escalatedAt?: Date;
}

export interface AlertData {
  id: string;
  title: string;
  message: string;
  type: "information" | "warning" | "danger";
  severity: "low" | "medium" | "high" | "critical";
  location: {
    coordinates: string;
    address: string;
    lat: number;
    lng: number;
  };
  timestamp: Date;
  targetAudience: string[];
  channels: string[];
  status: "sent" | "pending" | "failed";
}

// Simple in-memory store (in production, use a proper state management solution)
class ReportStore {
  private reports: ReportData[] = [];
  private alerts: AlertData[] = [];
  private listeners: (() => void)[] = [];

  // Report management
  addReport(report: ReportData) {
    this.reports.push(report);
    this.notifyListeners();
  }

  updateReport(id: string, updates: Partial<ReportData>) {
    const index = this.reports.findIndex(report => report.id === id);
    if (index !== -1) {
      this.reports[index] = { ...this.reports[index], ...updates };
      this.notifyListeners();
    }
  }

  getReports(status?: ReportData['status']): ReportData[] {
    if (status) {
      return this.reports.filter(report => report.status === status);
    }
    return [...this.reports];
  }

  getReportById(id: string): ReportData | undefined {
    return this.reports.find(report => report.id === id);
  }

  // Alert management
  addAlert(alert: AlertData) {
    this.alerts.push(alert);
    this.notifyListeners();
  }

  getAlerts(): AlertData[] {
    return [...this.alerts];
  }

  // Workflow methods
  verifyReport(id: string, analystNotes: string, verifiedBy: string) {
    this.updateReport(id, {
      status: 'verified',
      analystNotes,
      verifiedBy
    });
  }

  rejectReport(id: string, analystNotes: string, verifiedBy: string) {
    this.updateReport(id, {
      status: 'rejected',
      analystNotes,
      verifiedBy
    });
  }

  escalateReport(id: string, analystNotes: string, escalatedBy: string) {
    this.updateReport(id, {
      status: 'escalated',
      analystNotes,
      verifiedBy: escalatedBy,
      escalatedAt: new Date()
    });
  }

  // Listener management for real-time updates
  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  // Generate AI insights (mock implementation)
  generateAIInsights(_reportType: string, _description: string): string[] {
    const insights = [
      "High probability of coastal erosion based on image analysis",
      "Wave pattern suggests unusual tidal activity",
      "Environmental factors indicate potential debris accumulation",
      "Historical data shows similar patterns in monsoon season",
      "Satellite imagery confirms unusual water levels",
      "Community reports correlate with weather patterns",
      "Geological surveys indicate vulnerable coastal structure",
      "Marine ecosystem disruption detected in area"
    ];
    
    // Return 2-3 random insights
    const shuffled = insights.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 2 + Math.floor(Math.random() * 2));
  }

  // Generate mock severity scores
  generateAIAnalysis(reportType: string, description: string) {
    return {
      severityScore: Math.floor(Math.random() * 10) + 1,
      misinformationScore: Math.floor(Math.random() * 3) + 1,
      sentimentScore: Math.floor(Math.random() * 5) + 3,
      confidence: Math.floor(Math.random() * 30) + 70,
      insights: this.generateAIInsights(reportType, description)
    };
  }
}

// Export singleton instance
export const reportStore = new ReportStore();

// Utility functions for generating IDs
export const generateReportId = () => `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
export const generateAlertId = () => `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Test function for workflow verification
export const testWorkflow = () => {
  console.log("Testing complete workflow...");
  
  // Step 1: Create a test report
  const testReport: ReportData = {
    id: generateReportId(),
    type: "photo",
    hazardType: "High Waves",
    location: {
      coordinates: "19.0760, 72.8777",
      address: "Marine Drive, Mumbai",
      lat: 19.0760,
      lng: 72.8777,
    },
    timestamp: new Date(),
    citizen: {
      name: "testuser",
      credibilityScore: 85,
    },
    description: "Test report for workflow verification",
    status: "pending",
    priority: "high",
    aiAnalysis: reportStore.generateAIAnalysis("High Waves", "Test report"),
  };

  console.log("Step 1: Adding test report", testReport);
  reportStore.addReport(testReport);

  setTimeout(() => {
    console.log("Step 2: Escalating report to admin");
    reportStore.escalateReport(testReport.id, "Test escalation", "Test Analyst");
    
    setTimeout(() => {
      console.log("Step 3: Creating test alert");
      const testAlert: AlertData = {
        id: generateAlertId(),
        title: "Test High Wave Alert",
        message: "This is a test alert to verify the workflow",
        type: "warning",
        severity: "high",
        location: testReport.location,
        timestamp: new Date(),
        targetAudience: ["citizens"],
        channels: ["push"],
        status: "sent",
      };
      
      reportStore.addAlert(testAlert);
      console.log("Workflow test completed! Check all dashboards for updates.");
    }, 1000);
  }, 1000);
};