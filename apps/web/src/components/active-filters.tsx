import { useNavigate, useSearch } from "@tanstack/react-router";

export function ActiveFilters() {
  const search = useSearch({ strict: false }) as {
    q?: string;
    date?: string;
    tag?: string;
  };
  const navigate = useNavigate();

  const filters: { key: string; label: string }[] = [];

  if (search.q) {
    filters.push({ key: "q", label: `搜索: ${search.q}` });
  }
  if (search.date) {
    filters.push({ key: "date", label: search.date });
  }
  if (search.tag) {
    filters.push({ key: "tag", label: `标签: ${search.tag}` });
  }

  if (filters.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {filters.map((f) => (
        <span
          key={f.key}
          className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700"
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
            className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-blue-200"
            aria-label={`移除${f.label}`}
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
}
