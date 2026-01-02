import React from 'react';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface AnimatedTableProps {
  columns: Column[];
  data: any[];
  onRowClick?: (row: any) => void;
}

const AnimatedTable: React.FC<AnimatedTableProps> = ({ columns, data, onRowClick }) => {
  return (
    <div className="overflow-hidden rounded-xl border border-border/50 bg-card/50">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-secondary/50">
            {columns.map((col) => (
              <th 
                key={col.key} 
                className="text-left py-4 px-5 text-muted-foreground font-medium text-sm"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, index) => (
              <tr
                key={row.id || index}
                onClick={() => onRowClick?.(row)}
                className="border-b border-border/30 last:border-none
                          hover:bg-primary/5 transition-all duration-300 cursor-pointer
                          animate-fade-in-up group"
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                {columns.map((col) => (
                  <td 
                    key={col.key} 
                    className="py-4 px-5 transition-colors group-hover:text-foreground"
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center text-muted-foreground">
                <div className="animate-float">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p>No data available</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AnimatedTable;
