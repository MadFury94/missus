"use client";

interface RemovedItem {
    name: string;
    image?: string;
}

interface RecentlyRemovedProps {
    items: RemovedItem[];
    onRestore?: (index: number) => void;
}

export default function RecentlyRemoved({ items, onRestore }: RecentlyRemovedProps) {
    if (items.length === 0) return null;

    return (
        <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="font-display text-[13px] font-bold tracking-[.12em] uppercase text-gray-500 mb-3.5">
                Recently Removed
            </p>
            <div className="flex gap-2.5">
                {items.map((item, index) => (
                    <div
                        key={index}
                        className="w-[72px] cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
                        onClick={() => onRestore?.(index)}
                    >
                        <div className="w-[72px] h-24 bg-[#f0ece8] flex items-center justify-center font-display text-[8px] font-bold tracking-[.06em] uppercase text-black/25 text-center p-1.5 leading-tight mb-1.5">
                            {item.name}
                        </div>
                        <p className="text-[10px] text-gray-600 leading-tight line-clamp-2">
                            {item.name}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
