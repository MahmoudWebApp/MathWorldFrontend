export interface Category {
  Id: number;
  NameAr: string;
  NameEn: string;
  Name?: string;
  Icon: string;
  Order?: number;
  StageId?: number;
}

export interface ProblemPreview {
  Id: number;
  Title: string;
  StageId?: number;
  StageName?: string;
  CategoryId?: number;
  CategoryName: string;
  ViewsCount: number;
  RequiresLogin: boolean;
  Points?: number;
  IsSolved?: boolean;
  IsFavorite?: boolean;
}

export interface PagedProblemsResponse {
  CategoryName?: string;
  CategoryIcon?: string;
  Items: ProblemPreview[];
  Total?: number;
  Page?: number;
  PageSize?: number;
  TotalPages?: number;
}

export interface User {
  Id: number;
  FullName: string;
  Email: string;
  Role: 'Admin' | 'Student';
  Token: string;
  SubscriptionType: string;
  ProfilePicture?: string | null;
}

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
