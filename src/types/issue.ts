export type IssuePriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type IssueStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';

export interface Issue {
  _id: string;
  vesselId: string | {
    _id: string;
    name: string;
    imo?: string;
    status?: string;
    type?: string;
  };
  category: string;
  description: string;
  priority: IssuePriority;
  status: IssueStatus;
  createdBy?: string | {
    _id: string;
    email: string;
    role: string;
  };
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIssueData {
  vesselId: string;
  category: string;
  description: string;
  priority?: IssuePriority;
  status?: IssueStatus;
}

export interface UpdateIssueData {
  category?: string;
  description?: string;
  priority?: IssuePriority;
  status?: IssueStatus;
}

export interface RecommendationsResponse {
  success: boolean;
  cached: boolean;
  data: {
    recommendations: Issue[];
    category: string;
    vesselType: string;
    count: number;
  };
}

