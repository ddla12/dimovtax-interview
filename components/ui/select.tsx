"use client";

/**
 * Thin wrapper around the native select element with shared styling.
 */
export default function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
    return (
    <select
        className="max-w-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            {...props}
        >
            {children}
        </select>
    );
}