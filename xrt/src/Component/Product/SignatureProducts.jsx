import React from 'react';
import { products } from '../../config/constants';
import { useCart } from '../../context/CartContext';
import ProductCard from '../Menu_Items/ViewItems';

const SignatureProducts = () => {
  const { cartItems } = useCart();
  
  // Create cart id list
  const cartIds = cartItems.map(c => c.id);

  // Filter signature items not in cart
  const signatureItems = products
    .filter(p => p.is_signature && !cartIds.includes(p.id))
    .slice(0, 6);

  if (signatureItems.length === 0) return null;

  return (
    <section className="mt-12 max-w-7xl mx-[5px] px-4">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">
        Signature Items
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {signatureItems.map(item => (
          <div 
            key={item.id} 
            className="w-full max-w-[170px] mx-auto [&>div>div:first-child>img]:!h-[160px] [&>div>div:last-child]:!flex-row [&>div>div:last-child]:!gap-2 [&>div>div:last-child>div]:!flex-1 [&>div>div:last-child>div]:!h-auto [&>div>div:last-child>div]:!py-2 [&>div>div:last-child>div_h5]:!text-[10px] [&>div>div:last-child>div_svg]:!w-3.5"
          >
            <ProductCard product={item} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default SignatureProducts;
