"use client";

import { memo } from "react";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  SparklesIcon,
  ShieldCheckIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

export type BadgeStatus = "approved" | "needs_review" | "rejected" | "analyzing";

interface AIModerationBadgeProps {
  status: BadgeStatus;
  confidence?: number;
  showConfidence?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
}

interface BadgeConfig {
  label: string;
  icon: typeof CheckCircleIcon;
  bgColor: string;
  textColor: string;
  borderColor: string;
  description: string;
}

const BADGE_CONFIGS: Record<BadgeStatus, BadgeConfig> = {
  approved: {
    label: "AI Approved",
    icon: CheckCircleIcon,
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200",
    description: "Content passed AI moderation",
  },
  needs_review: {
    label: "Needs Review",
    icon: ExclamationTriangleIcon,
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
    description: "Content flagged for manual review",
  },
  rejected: {
    label: "AI Rejected",
    icon: XCircleIcon,
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-200",
    description: "Content violates guidelines",
  },
  analyzing: {
    label: "Analyzing...",
    icon: SparklesIcon,
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-700",
    borderColor: "border-indigo-200",
    description: "AI is analyzing content",
  },
};

const SIZE_CLASSES = {
  sm: {
    container: "px-2 py-0.5 text-xs gap-1",
    icon: "h-3 w-3",
    iconOnly: "h-5 w-5",
  },
  md: {
    container: "px-3 py-1.5 text-sm gap-1.5",
    icon: "h-4 w-4",
    iconOnly: "h-6 w-6",
  },
  lg: {
    container: "px-4 py-2 text-base gap-2",
    icon: "h-5 w-5",
    iconOnly: "h-7 w-7",
  },
};

export const AIModerationBadge = memo(function AIModerationBadge({
  status,
  confidence,
  showConfidence = false,
  size = "md",
  className = "",
  onClick,
}: AIModerationBadgeProps) {
  const config = BADGE_CONFIGS[status];
  const sizeClass = SIZE_CLASSES[size];
  const Icon = config.icon;

  const confidencePercent = confidence !== undefined ? Math.round(confidence * 100) : undefined;

  const getConfidenceLabel = () => {
    if (confidencePercent === undefined) return null;
    if (confidencePercent >= 90) return "Very High";
    if (confidencePercent >= 75) return "High";
    if (confidencePercent >= 50) return "Medium";
    if (confidencePercent >= 25) return "Low";
    return "Very Low";
  };

  const confidenceLabel = getConfidenceLabel();

  return (
    <div className={`inline-flex ${className}`}>
      <button
        type="button"
        onClick={onClick}
        className={`
          inline-flex items-center rounded-full border font-medium
          transition-all duration-200
          ${config.bgColor} ${config.textColor} ${config.borderColor}
          ${sizeClass.container}
          ${onClick ? "cursor-pointer hover:shadow-md active:scale-95" : "cursor-default"}
        `}
        title={config.description}
        disabled={status === "analyzing"}
      >
        <Icon className={`${sizeClass.icon} ${status === "analyzing" ? "animate-pulse" : ""}`} />
        <span className="font-semibold">{config.label}</span>
        {showConfidence && confidencePercent !== undefined && (
          <span className="ml-1 rounded bg-white/60 px-1.5 py-0.5 text-xs font-medium">
            {confidencePercent}%
          </span>
        )}
        {onClick && (
          <EyeIcon className={`${sizeClass.icon} opacity-60`} />
        )}
      </button>

      {/* Tooltip for confidence level */}
      {showConfidence && confidenceLabel && size !== "sm" && (
        <div
          className={`
            absolute left-0 top-full z-10 mt-1 rounded-lg border bg-white px-3 py-2
            text-xs shadow-lg opacity-0 pointer-events-none transition-opacity
            group-hover:opacity-100
          `}
        >
          <div className="font-medium text-gray-900">Confidence: {confidenceLabel}</div>
          <div className="mt-1 text-gray-500">
            {confidencePercent}% probability
          </div>
        </div>
      )}
    </div>
  );
});

interface ConfidenceBarProps {
  value: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export const ConfidenceBar = memo(function ConfidenceBar({
  value,
  size = "md",
  showLabel = true,
  className = "",
}: ConfidenceBarProps) {
  const percent = Math.round(value * 100);

  const getColor = () => {
    if (percent >= 75) return "bg-emerald-500";
    if (percent >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  const getLabel = () => {
    if (percent >= 90) return "Very High";
    if (percent >= 75) return "High";
    if (percent >= 50) return "Medium";
    if (percent >= 25) return "Low";
    return "Very Low";
  };

  const sizeClasses = {
    sm: { bar: "h-1.5", text: "text-[10px]" },
    md: { bar: "h-2", text: "text-xs" },
    lg: { bar: "h-3", text: "text-sm" },
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`flex-1 overflow-hidden rounded-full bg-gray-200 ${sizeClasses[size].bar}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${getColor()}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      {showLabel && (
        <span className={`min-w-[60px] text-right font-medium text-gray-700 ${sizeClasses[size].text}`}>
          {percent}% {getLabel()}
        </span>
      )}
    </div>
  );
});

interface ViolationAlertProps {
  type: "profanity" | "adult" | "copyright" | "spam" | "violence" | "hate";
  matched?: string;
  count?: number;
  className?: string;
}

const VIOLATION_CONFIG: Record<ViolationAlertProps["type"], {
  label: string;
  icon: typeof ExclamationTriangleIcon;
  bgColor: string;
  textColor: string;
  borderColor: string;
}> = {
  profanity: {
    label: "Profanity Detected",
    icon: ExclamationTriangleIcon,
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
    borderColor: "border-orange-200",
  },
  adult: {
    label: "Adult Content",
    icon: XCircleIcon,
    bgColor: "bg-pink-50",
    textColor: "text-pink-700",
    borderColor: "border-pink-200",
  },
  copyright: {
    label: "Copyright Concern",
    icon: ShieldCheckIcon,
    bgColor: "bg-purple-50",
    textColor: "text-purple-700",
    borderColor: "border-purple-200",
  },
  spam: {
    label: "Spam Pattern",
    icon: ExclamationTriangleIcon,
    bgColor: "bg-gray-50",
    textColor: "text-gray-700",
    borderColor: "border-gray-200",
  },
  violence: {
    label: "Violent Content",
    icon: XCircleIcon,
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-200",
  },
  hate: {
    label: "Hate Speech",
    icon: XCircleIcon,
    bgColor: "bg-red-100",
    textColor: "text-red-800",
    borderColor: "border-red-300",
  },
};

export const ViolationAlert = memo(function ViolationAlert({
  type,
  matched,
  count,
  className = "",
}: ViolationAlertProps) {
  const config = VIOLATION_CONFIG[type];
  const Icon = config.icon;

  return (
    <div
      className={`
        inline-flex items-center gap-2 rounded-lg border px-3 py-2
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        ${className}
      `}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <div className="flex flex-col">
        <span className="font-medium">{config.label}</span>
        {matched && (
          <span className="text-xs opacity-80">Matched: &quot;{matched}&quot;</span>
        )}
        {count !== undefined && count > 1 && (
          <span className="text-xs opacity-80">Found {count} instances</span>
        )}
      </div>
    </div>
  );
});

interface AnalysisSummaryProps {
  passed: boolean;
  confidence: number;
  flags: string[];
  categories: {
    profanity: boolean;
    adult: boolean;
    copyrighted: boolean;
    spam: boolean;
    violence: boolean;
    hate: boolean;
  };
  className?: string;
}

export const AnalysisSummary = memo(function AnalysisSummary({
  passed,
  confidence,
  flags,
  categories,
  className = "",
}: AnalysisSummaryProps) {
  const activeCategories = Object.entries(categories)
    .filter(([, active]) => active)
    .map(([name]) => name);

  return (
    <div className={`rounded-xl border bg-white p-4 shadow-sm ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SparklesIcon className="h-5 w-5 text-indigo-500" />
          <span className="font-semibold text-gray-900">AI Analysis Summary</span>
        </div>
        <AIModerationBadge
          status={passed ? "approved" : "needs_review"}
          confidence={confidence}
          showConfidence
          size="sm"
        />
      </div>

      <div className="mb-4">
        <div className="mb-1 text-xs font-medium text-gray-500">Confidence Score</div>
        <ConfidenceBar value={confidence} size="sm" />
      </div>

      {activeCategories.length > 0 && (
        <div>
          <div className="mb-2 text-xs font-medium text-gray-500">Detected Categories</div>
          <div className="flex flex-wrap gap-1.5">
            {activeCategories.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 capitalize"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      )}

      {flags.length > 0 && (
        <div className="mt-3">
          <div className="mb-2 text-xs font-medium text-gray-500">Flags</div>
          <div className="flex flex-wrap gap-1.5">
            {flags.map((flag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700"
              >
                {flag.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </div>
      )}

      {passed && activeCategories.length === 0 && (
        <div className="mt-2 rounded-lg bg-emerald-50 p-3 text-center">
          <CheckCircleIcon className="mx-auto h-6 w-6 text-emerald-500" />
          <p className="mt-1 text-sm font-medium text-emerald-700">
            No violations detected
          </p>
          <p className="text-xs text-emerald-600">
            Content is safe for publication
          </p>
        </div>
      )}
    </div>
  );
});

interface AIModerationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  content?: string;
  result?: {
    passed: boolean;
    confidence: number;
    flags: string[];
    categories: {
      profanity: boolean;
      adult: boolean;
      copyrighted: boolean;
      spam: boolean;
      violence: boolean;
      hate: boolean;
    };
    violations: Array<{
      type: string;
      matched: string;
      position: number;
      length: number;
    }>;
    message: string;
  };
  loading?: boolean;
  className?: string;
}

export const AIModerationPanel = memo(function AIModerationPanel({
  isOpen,
  onClose,
  content,
  result,
  loading = false,
  className = "",
}: AIModerationPanelProps) {
  if (!isOpen) return null;

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center
        bg-black/50 backdrop-blur-sm
        ${className}
      `}
      onClick={onClose}
    >
      <div
        className="mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
          <div className="flex items-center gap-2">
            <SparklesIcon className="h-6 w-6 text-indigo-500" />
            <h2 className="text-lg font-bold text-gray-900">AI Content Analysis</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <XCircleIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <SparklesIcon className="h-12 w-12 animate-pulse text-indigo-500" />
              <p className="mt-4 text-gray-600">Analyzing content...</p>
            </div>
          ) : result ? (
            <div className="space-y-6">
              {/* Main Result */}
              <div className="flex items-center justify-between rounded-xl border bg-gray-50 p-4">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {result.passed ? "Content Passed" : "Content Flagged"}
                  </h3>
                  <p className="text-sm text-gray-500">{result.message}</p>
                </div>
                <AIModerationBadge
                  status={result.passed ? "approved" : "needs_review"}
                  confidence={result.confidence}
                  showConfidence
                  size="lg"
                />
              </div>

              {/* Confidence */}
              <div>
                <h4 className="mb-2 text-sm font-medium text-gray-700">Confidence Score</h4>
                <ConfidenceBar value={result.confidence} size="lg" />
              </div>

              {/* Categories */}
              {Object.values(result.categories).some(Boolean) && (
                <div>
                  <h4 className="mb-2 text-sm font-medium text-gray-700">Detected Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(result.categories)
                      .filter(([, active]) => active)
                      .map(([name]) => (
                        <ViolationAlert
                          key={name}
                          type={name as ViolationAlertProps["type"]}
                        />
                      ))}
                  </div>
                </div>
              )}

              {/* Violations */}
              {result.violations.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-medium text-gray-700">
                    Matched Violations ({result.violations.length})
                  </h4>
                  <div className="space-y-2">
                    {result.violations.slice(0, 10).map((v, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm"
                      >
                        <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                        <code className="flex-1 truncate font-mono text-red-700">
                          &quot;{v.matched}&quot;
                        </code>
                        <span className="text-xs text-gray-500">
                          at position {v.position}
                        </span>
                      </div>
                    ))}
                    {result.violations.length > 10 && (
                      <p className="text-sm text-gray-500">
                        ...and {result.violations.length - 10} more violations
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Flags */}
              {result.flags.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-medium text-gray-700">Flags</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.flags.map((flag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700"
                      >
                        {flag.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Content Preview */}
              {content && (
                <div>
                  <h4 className="mb-2 text-sm font-medium text-gray-700">Content Preview</h4>
                  <div className="max-h-40 overflow-y-auto rounded-lg border bg-gray-50 p-3">
                    <p className="whitespace-pre-wrap text-sm text-gray-600">
                      {content.length > 500 ? content.substring(0, 500) + "..." : content}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500">
              No analysis data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default AIModerationBadge;
