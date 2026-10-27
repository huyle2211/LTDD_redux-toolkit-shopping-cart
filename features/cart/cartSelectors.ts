import type { RootState } from '../../app/store';

export const selectCartItems = (state: RootState) =>
  state.cart.items;

export const selectCartItemCount = (state: RootState) =>
  state.cart.items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

export const selectSubtotal = (state: RootState) =>
  state.cart.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

export const selectDiscount = (state: RootState) => {
  const subtotal = selectSubtotal(state);

  const rates: Record<string, number> = {
    SUMMER10: 0.1,
    SPECIAL20: 0.2,
  };

  const rate = rates[state.cart.discountCode ?? ''] ?? 0;

  return subtotal * rate;
};

export const selectTax = (state: RootState) => {
  const taxableAmount = Math.max(
    0,
    selectSubtotal(state) - selectDiscount(state),
  );

  return taxableAmount * state.cart.taxRate;
};

export const selectCartSummary = (state: RootState) => {
  const subtotal = selectSubtotal(state);
  const discount = selectDiscount(state);
  const tax = selectTax(state);
  const shipping = state.cart.shippingCost;

  return {
    subtotal,
    discount,
    tax,
    shipping,
    total: subtotal - discount + tax + shipping,
    itemCount: selectCartItemCount(state),
  };
};