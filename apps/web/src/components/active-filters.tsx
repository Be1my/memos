import { useNavigate, useSearch } from "@tanstack/react-router";
import { useMemo } from "react";
import { m } from "@/paraglide/messages";

export function ActiveFilters() {
  const search = useSearch({ strict: false }) as {
    q?: string;
    date?: string;
    tag?: string;
  };
  const navigate = useNavigate();

  const filters = useMemo(() => {
    const result: { key: string; label: string }[] = [];
    if (search.q) {
      result.push({ key: "q", label: m.search_filter_search({ query: search.q }) });
    }
    if (search.date) {
      result.push({ key: "date", label: search.date });
    }
    if (search.tag) {
      result.push({ key: "tag", label: m.search_filter_tag({ tag: search.tag }) });
    }
    return result;
  }, [search.q, search.date, search.tag]);

  if (filters.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {filters.map((f) => (
        <span
          key={f.key}
          className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
        >
          {f.label}
          <button
            type="button"
            onClick={() =>
              navigate({
                to: ".",
                search: (prev: Record<string, unknown>) => ({
                  ...prev,
                  [f.key]: undefined,
                }),
                replace: true,
              })
            }
            className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-primary/20"
            aria-label={`${m.search_filter_remove()} ${f.label}`}
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
}
