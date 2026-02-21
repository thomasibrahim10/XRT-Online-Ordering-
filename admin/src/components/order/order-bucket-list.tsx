import { Order, MappedPaginatorInfo } from '@/types';
import OrderCard from '@/components/order/order-card';
import HorizontalOrderCard from '@/components/order/horizontal-order-card';
import Pagination from '@/components/ui/pagination';
import { useTranslation } from 'next-i18next';
import { NoDataFound } from '@/components/icons/no-data-found';
import { OrderCardSkeletonVertical, OrderCardSkeletonHorizontal } from '@/components/ui/loading-skeleton';
import cn from 'classnames';
import { useState, useMemo, useEffect } from 'react';

export type OrderViewMode = 'grid' | 'list';

const SKELETON_COUNT_VERTICAL = 8;
const SKELETON_COUNT_HORIZONTAL = 5;

type OrderBucketListProps = {
  orders: Order[];
  paginatorInfo: MappedPaginatorInfo | null;
  onPagination: (current: number) => void;
  /** @deprecated Use viewMode instead. Kept for backward compatibility. */
  variant?: 'vertical' | 'horizontal';
  /** Preferred: 'grid' = card grid, 'list' = horizontal list. Overrides variant when set. */
  viewMode?: OrderViewMode;
  onViewDetails?: (order: Order) => void;
  /** When set, use client-side pagination with this many cards per page (e.g. 8 for in-progress) */
  pageSize?: number;
  /** When true, show skeleton loaders instead of order cards */
  loading?: boolean;
};

const OrderBucketList = ({
  orders,
  paginatorInfo,
  onPagination,
  variant = 'vertical',
  viewMode,
  onViewDetails,
  pageSize,
  loading = false,
}: OrderBucketListProps) => {
  const { t } = useTranslation();
  const [clientPage, setClientPage] = useState(1);
  const effectiveVariant =
    viewMode === 'grid' ? 'vertical' : viewMode === 'list' ? 'horizontal' : variant;

  const totalOrders = orders?.length ?? 0;
  const useClientPagination = pageSize != null && totalOrders > pageSize;
  const paginatedOrders = useMemo(() => {
    if (!orders || !useClientPagination) return orders ?? [];
    const start = (clientPage - 1) * pageSize;
    return orders.slice(start, start + pageSize);
  }, [orders, clientPage, pageSize, useClientPagination]);

  useEffect(() => {
    if (useClientPagination && clientPage > 1 && (clientPage - 1) * pageSize >= totalOrders) {
      setClientPage(1);
    }
  }, [totalOrders, clientPage, pageSize, useClientPagination]);

  const showApiPagination = !useClientPagination && !!paginatorInfo?.total;
  const showClientPagination = useClientPagination && totalOrders > pageSize!;

  const SkeletonCard = effectiveVariant === 'horizontal' ? OrderCardSkeletonHorizontal : OrderCardSkeletonVertical;
  const skeletonCount = effectiveVariant === 'horizontal' ? SKELETON_COUNT_HORIZONTAL : SKELETON_COUNT_VERTICAL;

  return (
    <>
      <div
        className={cn(
          'grid w-full grid-cols-1 gap-4 sm:gap-5',
          effectiveVariant === 'vertical'
            ? 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4' // 1 mobile, 2 sm, 3 md/lg, 4 xl+
            : 'md:grid-cols-1 lg:grid-cols-1 2xl:grid-cols-1',
        )}
      >
        {loading ? (
          Array.from({ length: skeletonCount }).map((_, i) => (
            <SkeletonCard key={`skeleton-${i}`} />
          ))
        ) : paginatedOrders && paginatedOrders.length > 0 ? (
          paginatedOrders.map((order) =>
            effectiveVariant === 'horizontal' ? (
              <HorizontalOrderCard
                key={order.id}
                order={order}
                onViewDetails={onViewDetails}
              />
            ) : (
              <OrderCard
                key={order.id}
                order={order}
                onViewDetails={onViewDetails}
              />
            ),
          )
        ) : (
          <div className="flex flex-col items-center py-7 col-span-full">
            <NoDataFound className="w-52" />
            <div className="mb-1 pt-6 text-base font-semibold text-heading">
              {t('table:empty-table-data')}
            </div>
            <p className="text-[13px]">{t('table:empty-table-sorry-text')}</p>
          </div>
        )}
      </div>

      {!loading && showApiPagination && (
        <div className="mt-8 flex items-center justify-end">
          <Pagination
            total={paginatorInfo!.total}
            current={paginatorInfo!.currentPage}
            pageSize={paginatorInfo!.perPage}
            onChange={onPagination}
          />
        </div>
      )}
      {!loading && showClientPagination && (
        <div className="mt-8 flex items-center justify-end">
          <Pagination
            total={totalOrders}
            current={clientPage}
            pageSize={pageSize!}
            onChange={setClientPage}
          />
        </div>
      )}
    </>
  );
};

export default OrderBucketList;
