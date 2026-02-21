import { Order } from '@/types';
import { OrderCardHeader } from './card/order-card-header';
import { OrderCardItems } from './card/order-card-items';
import { OrderCardFooter } from './card/order-card-footer';

type OrderCardProps = {
  order: Order;
  onViewDetails?: (order: Order) => void;
};

const OrderCard = ({ order, onViewDetails }: OrderCardProps) => (
  <div className="group relative flex w-full max-w-full min-w-0 flex-col min-h-0 rounded-xl bg-white shadow-card transition-all duration-300 hover:shadow-cardHover border border-border-200 hover:border-accent/30">
    <OrderCardHeader order={order} />
    <OrderCardItems order={order} />
    <OrderCardFooter order={order} onViewDetails={onViewDetails} />
  </div>
);

export default OrderCard;
