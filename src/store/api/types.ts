// ============================================
// Central type definitions for API services
// ============================================

export interface Category {
  Id: number;
  NameAr: string;
  NameEn: string;
  Name: string;
  Icon: string;
  Order?: number;
  StageId?: number;
}

export interface ProblemPreview {
  Id: number;
  Title: string;
  StageId?: number;
  StageName?: string;
  CategoryName: string;
  ViewsCount: number;
  RequiresLogin: boolean;
  Points: number;
}

export interface PagedResponse<T> {
  Data: T;
  Meta: {
    Total: number;
    Page: number;
    PageSize: number;
    TotalPages: number;
  };
}

export interface PagedProblemsResponse {
  CategoryName?: string;
  CategoryIcon?: string;
  Items: ProblemPreview[];
}

export interface User {
  Id: number;
  FullName: string;
  Email: string;
  Role: 'Admin' | 'Student';
  Token: string;
  SubscriptionType: string;
}

// --- DASHBOARD TYPES ---

export interface RecentActivityItem {
  ProblemId: number;
  Title: string;
  CategoryName: string;
  SolvedAt: string;
}

export interface DashboardData {
  Id: number;
  FullName: string;
  Email: string;
  Role: string;
  SubscriptionType: string;
  SolvedProblemsCount: number;
  FavoriteProblemsCount: number;
  TotalPoints: number;
  SuccessRate: number;
  MemberSince: string;
  RecentSolved: ProblemPreview[];
  RecentFavorites: ProblemPreview[];
  RecentActivities: RecentActivityItem[];
}