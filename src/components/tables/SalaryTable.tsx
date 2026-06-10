"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  ArrowUpDown,
  Building,
  MapPin,
  Calendar,
  Briefcase
} from "lucide-react";
import { formatINR } from "@/lib/utils/normalization";

interface CompensationRow {
  id: string;
  company: { name: string; slug: string };
  role: { name: string };
  level: string;
  location: string;
  yoe: number;
  yoeAtCompany: number;
  base: number;
  bonus: number;
  stock: number;
  totalCompensation: number;
  submittedAt: string;
}

interface SalaryTableProps {
  data: CompensationRow[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function SalaryTable({ data, pagination }: SalaryTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle URL change for pagination and sorting
  const updateQuery = (updates: Record<string, string | null>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        current.delete(key);
      } else {
        current.set(key, value);
      }
    });
    router.push(`/?${current.toString()}`);
  };

  const handleSort = (field: string) => {
    const currentSortBy = searchParams.get("sortBy") || "submittedAt";
    const currentSortOrder = searchParams.get("sortOrder") || "desc";
    
    let order: "asc" | "desc" = "desc";
    if (currentSortBy === field) {
      order = currentSortOrder === "desc" ? "asc" : "desc";
    }
    
    updateQuery({ sortBy: field, sortOrder: order, page: "1" });
  };

  // TanStack Column Helper
  const columnHelper = createColumnHelper<CompensationRow>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("company.name", {
        header: () => (
          <button 
            onClick={() => handleSort("company")}
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            Company <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: (info) => {
          const row = info.row.original;
          return (
            <Link 
              href={`/companies/${row.company.slug}`}
              className="flex items-center gap-2 font-semibold text-bronze hover:text-bronze hover:underline transition-all"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-olive border border-olive text-[10px] text-muted-foreground">
                <Building className="h-3.5 w-3.5" />
              </div>
              {info.getValue()}
            </Link>
          );
        },
      }),
      columnHelper.accessor("role.name", {
        header: () => (
          <button 
            onClick={() => handleSort("role")}
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            Role <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: (info) => (
          <div className="flex items-center gap-1 text-foreground text-xs sm:text-sm">
            <Briefcase className="h-3.5 w-3.5 text-muted-foreground hidden sm:inline" />
            <span>{info.getValue()}</span>
          </div>
        ),
      }),
      columnHelper.accessor("level", {
        header: () => (
          <button 
            onClick={() => handleSort("level")}
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            Level <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: (info) => (
          <span className="inline-flex items-center rounded-md bg-muted border border-olive/60 px-2 py-0.5 text-xs font-semibold text-foreground tracking-wide">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("location", {
        header: () => (
          <button 
            onClick={() => handleSort("location")}
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            Location <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: (info) => (
          <span className="flex items-center gap-1 text-muted-foreground text-xs">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("yoe", {
        header: () => (
          <button 
            onClick={() => handleSort("yoe")}
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            Exp <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: (info) => {
          const row = info.row.original;
          return (
            <span className="text-foreground text-xs sm:text-sm">
              {info.getValue()}y <span className="text-[10px] text-muted-foreground">({row.yoeAtCompany}y co)</span>
            </span>
          );
        },
      }),
      columnHelper.accessor("base", {
        header: "Base",
        cell: (info) => (
          <span className="text-foreground font-medium text-xs sm:text-sm">
            {formatINR(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor("bonus", {
        header: "Bonus",
        cell: (info) => (
          <span className="text-muted-foreground text-xs sm:text-sm">
            {info.getValue() > 0 ? formatINR(info.getValue()) : "—"}
          </span>
        ),
      }),
      columnHelper.accessor("stock", {
        header: "Stock/yr",
        cell: (info) => (
          <span className="text-muted-foreground text-xs sm:text-sm">
            {info.getValue() > 0 ? formatINR(info.getValue()) : "—"}
          </span>
        ),
      }),
      columnHelper.accessor("totalCompensation", {
        header: () => (
          <button 
            onClick={() => handleSort("totalCompensation")}
            className="flex items-center gap-1 text-bronze hover:text-bronze font-semibold transition-colors"
          >
            Total <ArrowUpDown className="h-3 w-3 text-bronze" />
          </button>
        ),
        cell: (info) => (
          <span className="text-sm font-bold bg-gradient-to-r from-bronze to-desert bg-clip-text text-transparent">
            {formatINR(info.getValue())}
          </span>
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      {/* Tabular Container */}
      <div className="overflow-x-auto rounded-xl border border-olive bg-white/80 backdrop-blur-md">
        <table className="w-full text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-olive bg-background">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="p-4 text-xs font-semibold text-muted-foreground select-none uppercase tracking-wider whitespace-nowrap"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-olive/30">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-muted-foreground">
                  No compensation entries match these filters.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr 
                  key={row.id} 
                  className="hover:bg-muted/30 transition-colors group"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-4 align-middle whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-olive/50 pt-4 flex-col sm:flex-row gap-4">
          <div className="text-xs text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{data.length}</span> of{" "}
            <span className="font-semibold text-foreground">{pagination.total}</span> records
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={() => updateQuery({ page: "1" })}
              disabled={pagination.page <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-olive hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
              title="First Page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => updateQuery({ page: String(pagination.page - 1) })}
              disabled={pagination.page <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-olive hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
              title="Previous Page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <div className="px-3 text-xs text-muted-foreground">
              Page <span className="font-semibold text-foreground">{pagination.page}</span> of{" "}
              <span className="font-semibold text-foreground">{pagination.totalPages}</span>
            </div>

            <button
              onClick={() => updateQuery({ page: String(pagination.page + 1) })}
              disabled={pagination.page >= pagination.totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-olive hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
              title="Next Page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => updateQuery({ page: String(pagination.totalPages) })}
              disabled={pagination.page >= pagination.totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-olive hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
              title="Last Page"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
