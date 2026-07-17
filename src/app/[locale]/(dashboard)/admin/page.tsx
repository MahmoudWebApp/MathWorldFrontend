'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useGetAdminStatsQuery } from '@/store/api/statsApi';
import { useGetAdminUsersQuery } from '@/store/api/usersApi';
import { useGetAdminCategoriesQuery } from '@/store/api/categoriesApi';
import { useGetAdminStagesQuery } from '@/store/api/stagesApi';
import { 
  People, 
  Book, 
  TickCircle, 
  ArrowRight2,
  Warning2,
  Category2
} from 'iconsax-reactjs';
import { Card, CardContent } from '@/components/ui/Card';
import AdminStatsChart from '@/components/admin/AdminStatsChart';

interface AdminUser {
  Id: number; 
  FullName: string;
  Email: string;
  Role: string;
}

export default function AdminDashboardPage() {
  const t = useTranslations();
  
  // Fetch dashboard data from the supported admin APIs.
  const { data: stats, isLoading: statsLoading, isError: statsError } = useGetAdminStatsQuery();
  const { data: users, isLoading: usersLoading, isError: usersError } = useGetAdminUsersQuery({ PageSize: 5 });
  const { data: categories, isLoading: categoriesLoading, isError: categoriesError } = useGetAdminCategoriesQuery();
  const { data: stages, isLoading: stagesLoading, isError: stagesError } = useGetAdminStagesQuery();

  // Aggregate loading and error states
  const isCardsLoading = statsLoading || categoriesLoading || stagesLoading;
  const hasCardsError = statsError || categoriesError || stagesError;

  // Configure the four supported dashboard summary cards.
  const adminCards = [
    {
      icon: People,
      title: t('dashboard.admin.users'),
      count: stats?.TotalUsers || 0,
      href: '/admin/users',
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      icon: Book,
      title: t('dashboard.admin.problems'),
      count: stats?.TotalProblems || 0,
      href: '/admin/problems',
      color: 'text-green-500',
      bg: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      icon: TickCircle,
      title: t('dashboard.admin.categories'),
      count: categories?.length || 0,
      href: '/admin/categories',
      color: 'text-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      icon: Category2,
      title: t('dashboard.admin.stages'),
      count: stages?.length || 0,
      href: '/admin/stages',
      color: 'text-cyan-500',
      bg: 'bg-cyan-50 dark:bg-cyan-900/20',
    },
  ];

  // Prepare data for the chart
  const chartData = adminCards.map(card => {
    const colorMap: Record<string, string> = {
      'text-blue-500': '#3b82f6',
      'text-green-500': '#22c55e',
      'text-purple-500': '#a855f7',
      'text-cyan-500': '#06b6d4',
    };
    return {
      name: card.title,
      value: card.count,
      color: colorMap[card.color] || '#8884d8',
    };
  });

  return (
    <div className="container mx-auto py-8 lg:px-24 md:px-16 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('dashboard.admin.title')}</h1>
          <p className="text-muted-foreground">{t('dashboard.admin.subtitle')}</p>
        </div>
      </div>

      {/* Stats Cards - 4 columns on large screens */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isCardsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <div className="h-12 w-12 rounded-xl bg-muted animate-pulse mb-4" />
                <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))
        ) : hasCardsError ? (
          <div className="col-span-full p-4 bg-red-50 text-red-500 rounded-lg flex items-center gap-2">
            <Warning2 className="h-5 w-5" />
            <p>{t('common.errorLoadingData')}</p>
          </div>
        ) : (
          adminCards.map((card, index) => (
            <Link key={index} href={card.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg} mb-4`}>
                    <card.icon className={`h-6 w-6 ${card.color}`} variant="Bold" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{card.count}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    {card.title}
                    <ArrowRight2 className="h-3 w-3 rtl:rotate-180" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>

      {/* Quick Stats & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Stats Chart */}
        <AdminStatsChart 
          data={chartData} 
          isLoading={isCardsLoading} 
        />

        {/* Recent Users */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t('dashboard.admin.recentUsers')}</h3>
              <Link href="/admin/users" className="text-sm text-primary hover:underline">
                {t('common.viewAll')}
              </Link>
            </div>
            
            <div className="space-y-3">
              {usersLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 animate-pulse">
                    <div className="h-10 w-10 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-muted rounded" />
                      <div className="h-3 w-48 bg-muted rounded" />
                    </div>
                    <div className="h-6 w-16 bg-muted rounded-full" />
                  </div>
                ))
              ) : usersError ? (
                <div className="text-center py-8 text-red-500 flex flex-col items-center gap-2">
                  <Warning2 className="h-8 w-8" />
                  <p>{t('common.errorLoadingUsers')}</p>
                </div>
              ) : users?.Users && users.Users.length > 0 ? (
                users.Users.map((user: AdminUser) => (
                  <div key={user.Id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 transition-colors hover:bg-muted">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <People className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user.FullName || ""}</p>
                      <p className="text-sm text-muted-foreground truncate">{user.Email}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs shrink-0 ${
                      user.Role === 'Admin' 
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' 
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                    }`}>
                      {user.Role}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg">
                  {t('common.noData')}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}