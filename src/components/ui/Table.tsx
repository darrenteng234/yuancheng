import React from "react";

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  /** cell renderer; also used as the mobile data-label source via `header` */
  render: (row: T) => React.ReactNode;
  align?: "left" | "right" | "center";
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  empty?: React.ReactNode;
}

/**
 * Responsive data table. Uses the design system's .data-table, which on mobile
 * (<=768px) reflows each row into a card using the td[data-label] pattern —
 * so the same component adapts without per-page work.
 */
export function DataTable<T>({ columns, rows, rowKey, empty }: DataTableProps<T>) {
  if (rows.length === 0 && empty) return <>{empty}</>;
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="data-table">
        <thead>
          <tr>{columns.map((c) => <th key={c.key} style={{ textAlign: c.align }}>{c.header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((c) => (
                <td key={c.key} data-label={typeof c.header === "string" ? c.header : undefined}
                  style={{ textAlign: c.align }}>{c.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
