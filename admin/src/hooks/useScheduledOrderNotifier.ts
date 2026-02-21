import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import dayjs from 'dayjs';
import { useOrdersQuery, useUpdateOrderMutation } from '@/data/order';
import { useSettings } from '@/contexts/settings.context';
import { API_ENDPOINTS } from '@/data/client/api-endpoints';
import { Order } from '@/types';
import { playNotificationSound } from '@/utils/notification-sound';

const AUTO_ACCEPT_READY_MINUTES = 45;
const AUTO_ACCEPT_WAIT_MS = 2 * 60 * 1000; // 2 minutes
const POLL_INTERVAL = 15_000; // 15 seconds

/**
 * Polls scheduled orders and implements a two-phase notification flow:
 *
 * Phase 1 — Notification time reached (schedule_time - notificationMinutes):
 *   Move order to "pending" so it appears in New Orders tab for the admin to accept with a ready time.
 *
 * Phase 2 — If not accepted within 2 minutes:
 *   Auto-accept the order with a 45-minute ready time and clear its schedule_time.
 */
export function useScheduledOrderNotifier() {
  const { t } = useTranslation();
  const settings = useSettings();
  const queryClient = useQueryClient();
  const { mutate: updateOrder } = useUpdateOrderMutation();

  /** Orders already moved to pending (notification time reached) — value = timestamp when moved */
  const movedToPendingRef = useRef<Map<string, number>>(new Map());
  /** Orders already auto-accepted (phase 2 done) */
  const autoAcceptedRef = useRef<Set<string>>(new Set());

  const notificationMinutes: number =
    settings?.orders?.deliveredOrderTime ?? 15;

  const { orders: scheduledOrders } = useOrdersQuery(
    { status: '__scheduled__', limit: 50, page: 1 },
    { refetchInterval: POLL_INTERVAL },
  );

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.ORDERS] });
  }, [queryClient]);

  const checkOrders = useCallback(() => {
    if (!scheduledOrders?.length) return;

    const now = dayjs();
    const nowMs = Date.now();

    scheduledOrders.forEach((order: Order) => {
      const scheduleTime = order.schedule_time;
      if (!scheduleTime) return;
      if (autoAcceptedRef.current.has(order.id)) return;

      const scheduleMoment = dayjs(scheduleTime);
      const notifyAt = scheduleMoment.subtract(notificationMinutes, 'minute');

      if (!now.isAfter(notifyAt)) return;

      if (!movedToPendingRef.current.has(order.id)) {
        movedToPendingRef.current.set(order.id, nowMs);

        playNotificationSound();

        updateOrder(
          { id: order.id, status: 'pending' },
          {
            onSuccess: () => {
              toast.warning(
                `${t('common:text-scheduled-order-reminder')}: #${order.tracking_number}`,
                { toastId: `schedule-notify-${order.id}`, autoClose: false },
              );
              invalidate();
            },
          },
        );
      }
    });
  }, [scheduledOrders, notificationMinutes, t, updateOrder, invalidate]);

  const checkAutoAccept = useCallback(() => {
    const nowMs = Date.now();

    movedToPendingRef.current.forEach((movedAt, orderId) => {
      if (autoAcceptedRef.current.has(orderId)) return;
      if (nowMs - movedAt < AUTO_ACCEPT_WAIT_MS) return;

      autoAcceptedRef.current.add(orderId);

      const order = scheduledOrders?.find((o) => o.id === orderId);
      if (!order) return;
      if (order.order_status !== 'pending') {
        movedToPendingRef.current.delete(orderId);
        return;
      }

      playNotificationSound();

      const autoReadyTime = dayjs().add(AUTO_ACCEPT_READY_MINUTES, 'minute').toISOString();

      updateOrder(
        { id: orderId, status: 'accepted', ready_time: autoReadyTime, clear_schedule: true },
        {
          onSuccess: () => {
            toast.info(
              `${t('common:text-scheduled-order-started')}: #${order.tracking_number}`,
              { toastId: `schedule-auto-${orderId}` },
            );
            invalidate();
          },
        },
      );
    });
  }, [scheduledOrders, t, updateOrder, invalidate]);

  useEffect(() => {
    checkOrders();
    checkAutoAccept();
    const interval = setInterval(() => {
      checkOrders();
      checkAutoAccept();
    }, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [checkOrders, checkAutoAccept]);
}
