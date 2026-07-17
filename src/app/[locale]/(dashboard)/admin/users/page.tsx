'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft2, ArrowRight2, Warning2 } from 'iconsax-reactjs';

import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useGetAdminUsersQuery } from '@/store/api/usersApi';

export default function AdminUsersPage() {
  const t = useTranslations();
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const { data, isLoading, isError } = useGetAdminUsersQuery({
    Page: page,
    PageSize: pageSize,
  });

  const totalPages = data?.TotalPages ?? 1;
  const currentPage = data?.Page ?? page;

  return (
    <div className="container mx-auto px-4 py-8 md:px-16 lg:px-24">
      <Breadcrumbs
        items={[
          { label: t('nav.admin'), href: '/admin' },
          { label: t('admin.users.title') },
        ]}
        className="mb-6"
      />

      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">{t('admin.users.title')}</h1>
        {!isLoading && data?.Total !== undefined && (
          <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            {t('admin.users.total')}: {data.Total}
          </span>
        )}
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-center">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="p-4 font-medium text-muted-foreground">
                    {t('admin.users.name')}
                  </th>
                  <th className="p-4 font-medium text-muted-foreground">
                    {t('admin.users.email')}
                  </th>
                  <th className="p-4 font-medium text-muted-foreground">
                    {t('admin.users.role')}
                  </th>
                  <th className="p-4 font-medium text-muted-foreground">
                    {t('admin.users.status')}
                  </th>
                  <th className="p-4 font-medium text-muted-foreground">
                    {t('admin.users.solved')}
                  </th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  Array.from({ length: pageSize }).map((_, rowIndex) => (
                    <tr key={rowIndex} className="border-b">
                      {Array.from({ length: 5 }).map((__, cellIndex) => (
                        <td key={cellIndex} className="p-4">
                          <div className="h-4 w-full animate-pulse rounded bg-muted" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : isError ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-red-500">
                      <div className="flex flex-col items-center gap-2">
                        <Warning2 className="h-8 w-8" />
                        <p>{t('common.errorLoadingData')}</p>
                      </div>
                    </td>
                  </tr>
                ) : data?.Users.length ? (
                  data.Users.map((user) => (
                    <tr
                      key={user.Id}
                      className="border-b transition-colors hover:bg-muted/20"
                    >
                      <td className="p-4 font-medium">{user.FullName}</td>
                      <td className="p-4 text-muted-foreground">
                        {user.Email}
                      </td>
                      <td className="p-4">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            user.Role === 'Admin'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                          }`}
                        >
                          {user.Role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            user.IsActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          }`}
                        >
                          {user.IsActive
                            ? t('admin.users.active')
                            : t('admin.users.inactive')}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-muted-foreground">
                        {user.SolvedProblemsCount}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="bg-muted/10 p-8 text-center text-muted-foreground"
                    >
                      {t('common.noData')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-3">
            <span className="text-sm text-muted-foreground">
              {t('common.page')} {currentPage} {t('common.of')} {totalPages}
            </span>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                className="gap-2"
              >
                <ArrowLeft2 className="h-4 w-4 rtl:rotate-180" />
                {t('common.previous')}
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() =>
                  setPage((value) => Math.min(totalPages, value + 1))
                }
                className="gap-2"
              >
                {t('common.next')}
                <ArrowRight2 className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
