import { ReactNode } from "react";

interface TooltipProps {
    content: ReactNode;
    children: ReactNode;
}

export default function Tooltip({ content, children }: TooltipProps) {
    return (
        <div className="relative group inline-block">
            {children}
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-gray-700 text-white text-sm rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                {content}
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-700 rotate-45" />
            </div>
        </div>
    );
}
