"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  useGetAdminUsersQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useActivateUserMutation,
  useDeactivateUserMutation,
  UserListItem,
} from "@/store/api/usersApi";
import {
  Trash,
  ShieldTick,
  Warning2,
  ArrowLeft2,
  ArrowRight2,
} from "iconsax-reactjs";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function AdminUsersPage() {
  const t = useTranslations();
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // Fetch Users with Pagination
  const { data, isLoading, isError } = useGetAdminUsersQuery({
    Page: page,
    PageSize: pageSize,
  });

  // Mutations
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [activateUser] = useActivateUserMutation();
  const [deactivateUser] = useDeactivateUserMutation();

  const handleRoleChange = async (user: UserListItem) => {
    const newRole = user.Role === "Admin" ? "Student" : "Admin";
    if (confirm(t("admin.users.confirmRoleChange"))) {
      try {
        // API expects { Id, Data: Partial<UserProfile> }
        await updateUser({ Id: user.Id, Data: { Role: newRole } }).unwrap();
      } catch (error) {
        console.error("Failed to update role:", error);
      }
    }
  };

  const handleStatusToggle = async (user: UserListItem) => {
    const mutationFn = user.IsActive ? deactivateUser : activateUser;
    const confirmKey = user.IsActive
      ? "admin.users.confirmDeactivate"
      : "admin.users.confirmActivate";

    if (confirm(t(confirmKey))) {
      try {
        await mutationFn(user.Id).unwrap();
      } catch (error) {
        console.error("Failed to toggle status:", error);
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm(t("common.confirmDelete"))) {
      try {
        await deleteUser(id).unwrap();
      } catch (error) {
        console.error("Failed to delete user:", error);
      }
    }
  };

  const totalPages = data?.Data?.TotalPages ?? 1;
  const currentPage = data?.Data?.Page ?? page;

  return (
    <div className="container mx-auto lg:px-24 md:px-16 px-4 py-8 ">
      <Breadcrumbs
        items={[
          { label: t("nav.admin"), href: "/admin" },
          { label: t("admin.users.title") },
        ]}
        className="mb-6"
      />
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{t("admin.users.title")}</h1>
        {!isLoading && data?.Data?.Total !== undefined && (
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
            {t("admin.users.total")}: {data.Data.Total}
          </span>
        )}
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-center">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="p-4 font-medium text-muted-foreground">
                    {t("admin.users.name")}
                  </th>
                  <th className="p-4 font-medium text-muted-foreground">
                    {t("admin.users.email")}
                  </th>
                  <th className="p-4 font-medium text-muted-foreground">
                    {t("admin.users.role")}
                  </th>
                  <th className="p-4 font-medium text-muted-foreground">
                    {t("admin.users.status")}
                  </th>
                  <th className="p-4 font-medium text-muted-foreground">
                    {t("admin.users.solved")}
                  </th>
                  <th className="p-4 font-medium text-muted-foreground ">
                    {t("common.actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="p-4">
                          <div className="h-4 w-full bg-muted animate-pulse rounded" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : isError ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-red-500">
                      <div className="flex flex-col items-center gap-2">
                        <Warning2 className="h-8 w-8" />
                        <p>{t("common.errorLoadingData")}</p>
                      </div>
                    </td>
                  </tr>
                ) : data?.Data?.Users && data.Data.Users.length > 0 ? (
                  data.Data.Users.map((user) => (
                    <tr
                      key={user.Id}
                      className="border-b hover:bg-muted/20 transition-colors"
                    >
                      <td className="p-4 font-medium">{user.FullName}</td>
                      <td className="p-4 text-muted-foreground">
                        {user.Email}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium shrink-0 ${
                            user.Role === "Admin"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                          }`}
                        >
                          {user.Role}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleStatusToggle(user)}
                          className={`px-2 py-1 rounded-full text-xs font-medium shrink-0 cursor-pointer hover:opacity-80 transition-opacity ${
                            user.IsActive
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                          }`}
                        >
                          {user.IsActive
                            ? t("admin.users.active")
                            : t("admin.users.inactive")}
                        </button>
                      </td>
                      <td className="p-4 text-muted-foreground font-medium">
                        {user.SolvedProblemsCount}
                      </td>
                      <td className="p-4  space-x-2 rtl:space-x-reverse whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRoleChange(user)}
                          disabled={isUpdating}
                          title={t("admin.users.changeRole")}
                        >
                          <ShieldTick
                            className={`h-4 w-4 ${isUpdating ? "text-muted-foreground" : "text-green-500"}`}
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(user.Id)}
                          disabled={isDeleting}
                          title={t("common.delete")}
                        >
                          <Trash
                            className={`h-4 w-4 ${isDeleting ? "text-muted-foreground" : "text-red-500"}`}
                          />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-muted-foreground bg-muted/10"
                    >
                      {t("common.noData")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/30">
            <span className="text-sm text-muted-foreground">
              {t("common.page")} {currentPage} {t("common.of")} {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                {isRtl ? (
                  <ArrowRight2 className="h-4 w-4" />
                ) : (
                  <ArrowLeft2 className="h-4 w-4" />
                )}
                {t("common.previous")}
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                {t("common.next")}
                {isRtl ? (
                  <ArrowLeft2 className="h-4 w-4" />
                ) : (
                  <ArrowRight2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
