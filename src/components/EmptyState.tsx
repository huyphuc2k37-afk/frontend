"use client";

import { BookOpenIcon } from "@heroicons/react/24/outline";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ElementType;
  action?: { label: string; href?: string; onClick?: () => void };
}

export default function EmptyState({
  title = "Chưa có nội dung",
  description = "Hãy quay lại sau nhé!",
  icon: Icon = BookOpenIcon,
  action,
}: EmptyStateProps) {
  const ActionButton = action && (
    action.href ? (
      <a
        href={action.href}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary-500 px-5 py-2 text-body-sm font-medium text-white shadow-sm transition-all hover:bg-primary-600"
      >
        {action.label}
      </a>
    ) : action.onClick ? (
      <button
        onClick={action.onClick}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary-500 px-5 py-2 text-body-sm font-medium text-white shadow-sm transition-all hover:bg-primary-600"
      >
        {action.label}
      </button>
    ) : null
  );

  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <Icon className="h-10 w-10 text-gray-300" aria-hidden="true" />
      <p className="mt-3 text-body-md font-medium text-gray-700">{title}</p>
      <p className="mt-1 max-w-sm text-caption text-gray-400">{description}</p>
      {ActionButton}
    </div>
  );
}
