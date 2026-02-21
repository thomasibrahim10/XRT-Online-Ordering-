import cn from 'classnames';

interface SkeletonProps {
    className?: string;
}

/**
 * Base skeleton component with shimmer animation.
 */
export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                'animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200',
                'bg-[length:400%_100%] rounded',
                className
            )}
        />
    );
}

/**
 * Text skeleton with line height matching typical text.
 */
export function SkeletonText({ className }: SkeletonProps) {
    return <Skeleton className={cn('h-4 rounded', className)} />;
}

/**
 * Circle skeleton for avatars and icons.
 */
export function SkeletonCircle({ className }: SkeletonProps) {
    return <Skeleton className={cn('rounded-full', className)} />;
}

/**
 * Button skeleton.
 */
export function SkeletonButton({ className }: SkeletonProps) {
    return <Skeleton className={cn('h-10 rounded-md', className)} />;
}

/**
 * Card skeleton for list items.
 */
export function SkeletonCard({ className }: SkeletonProps) {
    return (
        <div className={cn('bg-white rounded-lg border border-border-200 p-4', className)}>
            <div className="flex items-center justify-between mb-3">
                <SkeletonText className="w-32" />
                <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <div className="space-y-2">
                <SkeletonText className="w-full" />
                <SkeletonText className="w-3/4" />
            </div>
        </div>
    );
}

/**
 * Table row skeleton.
 */
interface SkeletonTableRowProps {
    columns?: number;
    className?: string;
}

export function SkeletonTableRow({ columns = 5, className }: SkeletonTableRowProps) {
    return (
        <tr className={cn('border-b border-border-100', className)}>
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="py-4 px-4">
                    <SkeletonText className={cn('w-full', i === 0 && 'w-32', i === columns - 1 && 'w-24')} />
                </td>
            ))}
        </tr>
    );
}

/**
 * Full table skeleton.
 */
interface SkeletonTableProps {
    rows?: number;
    columns?: number;
    className?: string;
}

export function SkeletonTable({ rows = 5, columns = 5, className }: SkeletonTableProps) {
    return (
        <div className={cn('bg-white rounded-lg shadow overflow-hidden', className)}>
            <table className="w-full">
                <thead className="bg-gray-50 border-b border-border-200">
                    <tr>
                        {Array.from({ length: columns }).map((_, i) => (
                            <th key={i} className="py-3 px-4 text-left">
                                <SkeletonText className="w-20" />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: rows }).map((_, i) => (
                        <SkeletonTableRow key={i} columns={columns} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

/**
 * Form skeleton with labeled inputs.
 */
interface SkeletonFormProps {
    fields?: number;
    className?: string;
}

export function SkeletonForm({ fields = 4, className }: SkeletonFormProps) {
    return (
        <div className={cn('space-y-6', className)}>
            {Array.from({ length: fields }).map((_, i) => (
                <div key={i}>
                    <SkeletonText className="w-24 mb-2" />
                    <Skeleton className="h-10 w-full rounded-md" />
                </div>
            ))}
        </div>
    );
}

/**
 * Order card skeleton - vertical (grid) layout.
 * Matches OrderCard structure: header, items, footer.
 */
export function OrderCardSkeletonVertical() {
  return (
    <div className="flex w-full flex-col min-h-0 rounded-xl bg-white shadow-card border border-border-200">
      {/* Header */}
      <div className="relative overflow-hidden rounded-t-xl bg-white p-4 sm:p-5 border-b border-gray-100">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-5 w-20 rounded-full" />
          <div className="flex flex-col gap-1">
            <SkeletonText className="w-24" />
            <Skeleton className="h-6 w-32 rounded" />
          </div>
          <div className="flex flex-col gap-1 pt-3 border-t border-gray-100">
            <SkeletonText className="w-3/4" />
            <SkeletonText className="w-1/2" />
            <SkeletonText className="w-full" />
          </div>
        </div>
      </div>
      {/* Items */}
      <div className="flex flex-1 flex-col min-h-0 px-4 pb-4 pt-3 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <SkeletonText className="w-16" />
          <div className="flex-1 h-px bg-gray-100" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between gap-2 pb-3 border-b border-gray-50">
              <div className="flex gap-3 flex-1 min-w-0">
                <Skeleton className="w-6 h-6 rounded shrink-0" />
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <SkeletonText className="w-full" />
                  <SkeletonText className="w-2/3" />
                </div>
              </div>
              <SkeletonText className="w-12 shrink-0" />
            </div>
          ))}
        </div>
      </div>
      {/* Footer */}
      <div className="mt-auto border-t border-gray-100 bg-gray-50 rounded-b-xl p-5 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <SkeletonText className="w-20" />
            <SkeletonText className="w-16" />
          </div>
          <div className="flex justify-between">
            <SkeletonText className="w-12" />
            <SkeletonText className="w-12" />
          </div>
          <div className="flex justify-between pt-3 border-t border-gray-200">
            <SkeletonText className="w-14" />
            <Skeleton className="h-6 w-20 rounded" />
          </div>
        </div>
        <SkeletonButton className="w-full h-12 rounded-lg" />
      </div>
    </div>
  );
}

/**
 * Order card skeleton - horizontal (list) layout.
 * Matches HorizontalOrderCard: basic info, order summary, actions.
 */
export function OrderCardSkeletonHorizontal() {
  return (
    <div className="flex flex-col md:flex-row w-full items-center justify-between rounded-xl bg-white p-5 shadow-card border border-border-200 gap-4">
      {/* Basic Info */}
      <div className="flex flex-col gap-1.5 w-full md:w-1/3">
        <div className="flex items-center gap-2">
          <SkeletonText className="w-16" />
          <Skeleton className="h-3 w-3 rounded-full shrink-0" />
          <SkeletonText className="w-24" />
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>
        <SkeletonText className="w-3/4" />
        <SkeletonText className="w-1/2" />
        <SkeletonText className="w-full" />
      </div>
      {/* Order Summary */}
      <div className="flex flex-col gap-1 w-full md:w-1/4 border-l pl-4 border-gray-100">
        <SkeletonText className="w-12" />
        <Skeleton className="h-7 w-20 rounded" />
        <SkeletonText className="w-16" />
      </div>
      {/* Actions */}
      <div className="flex flex-col gap-3 w-full md:w-1/3 items-end">
        <div className="flex gap-2 justify-end">
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
        <SkeletonText className="w-24" />
      </div>
    </div>
  );
}

/**
 * Modifier group list skeleton.
 */
export function ModifierGroupListSkeleton() {
    return (
        <div className="space-y-4">
            {/* Desktop skeleton */}
            <div className="hidden md:block">
                <SkeletonTable rows={5} columns={7} />
            </div>

            {/* Mobile skeleton */}
            <div className="md:hidden space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonCard key={i} />
                ))}
            </div>
        </div>
    );
}

export default Skeleton;
