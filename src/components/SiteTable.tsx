'use client';
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  subtitle: string;
  color: 'purple' | 'teal' | 'coral';
  data: any[];
  loading: boolean;
}

export default function SiteTable({ title, subtitle, color: _color, data, loading }: Props) {
  const cols = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div className="border rounded-xl overflow-hidden bg-background">
      <div className="flex items-center justify-between px-5 py-3.5 border-b bg-background">
        <div>
          <p className="text-[13px] font-medium leading-none">{title}</p>
          <p className="text-[11px] font-mono text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground border rounded-full px-2.5 py-1 bg-muted/50">
          {loading ? '—' : `${data.length} lignes`}
        </span>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="py-16 text-center text-[12px] text-muted-foreground">
            Chargement…
          </div>
        ) : data.length === 0 ? (
          <div className="py-16 text-center text-[12px] text-muted-foreground">
            Aucune donnée
          </div>
        ) : (
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr>
                {cols.map((col) => (
                  <th
                    key={col}
                    className="px-4 py-2.5 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-wider border-b bg-muted/30 whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  {cols.map((col) => (
                    <td key={col} className="px-4 py-2.5 text-foreground whitespace-nowrap">
                      {col === 'quantite' ? (
                        <span className="font-mono text-[11px] border rounded px-1.5 py-0.5 bg-muted/50 text-muted-foreground">
                          {row[col]}
                        </span>
                      ) : row[col] != null ? (
                        <span className={cn(
                          typeof row[col] === 'number'
                            ? 'font-mono text-[11px] text-muted-foreground'
                            : 'text-foreground'
                        )}>
                          {String(row[col])}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}