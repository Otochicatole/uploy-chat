type TabsProps = {
  items: Array<{
    id: string;
    label: string;
  }>;
  onSelect?: (itemId: string) => void;
  selected: string;
};

export function Tabs({ items, onSelect, selected }: TabsProps) {
  return (
    <div className="flex items-end">
      <span className="h-px w-6 bg-uploy-line" />
      {items.map((item) => {
        const active = item.id === selected;

        return (
          <button
            className={[
              "h-8 rounded-t-lg px-3 text-xs leading-4 transition",
              active
                ? "border-b-2 border-uploy-accent bg-uploy-surface text-uploy-primary"
                : "border-b border-uploy-line text-uploy-secondary hover:bg-uploy-surface/70",
            ].join(" ")}
            key={item.id}
            onClick={() => onSelect?.(item.id)}
            type="button"
          >
            {item.label}
          </button>
        );
      })}
      <span className="h-px flex-1 bg-uploy-line" />
    </div>
  );
}
