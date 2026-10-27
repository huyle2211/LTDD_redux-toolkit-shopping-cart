import { useEffect, useState } from 'react';

import { useAppDispatch, useAppSelector } from '../app/hooks';

import { fetchProducts } from '../features/products/productsSlice';

import {
  addToCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart,
  applyDiscount,
  setShippingCost,
} from '../features/cart/cartSlice';

import { selectCartSummary } from '../features/cart/cartSelectors';

function ShoppingCart() {
  const dispatch = useAppDispatch();

  const products = useAppSelector((state) => state.products.items);
  const status = useAppSelector((state) => state.products.status);
  const error = useAppSelector((state) => state.products.error);
  const cartItems = useAppSelector((state) => state.cart.items);
  const shippingCost = useAppSelector(
    (state) => state.cart.shippingCost,
  );
  const discountCode = useAppSelector(
    (state) => state.cart.discountCode,
  );
  const summary = useAppSelector(selectCartSummary);

  const [discountInput, setDiscountInput] = useState('');
  const [discountMessage, setDiscountMessage] = useState('');

  useEffect(() => {
    if (status === 'idle') {
      void dispatch(fetchProducts());
    }
  }, [dispatch, status]);

  const formatPrice = (price: number) =>
    `$${price.toFixed(2)}`;

  const handleDiscount = () => {
    const code = discountInput.trim().toUpperCase();

    if (!['SUMMER10', 'SPECIAL20'].includes(code)) {
      setDiscountMessage('Mã giảm giá không hợp lệ.');
      return;
    }

    dispatch(applyDiscount(code));
    setDiscountMessage(`Đã áp dụng mã ${code}.`);
  };

  return (
    <main className="shop">
      <header className="shop-header">
        <div>
          <p className="eyebrow">REDUX TOOLKIT PROJECT</p>
          <h1>Online Store</h1>
          <p>Khám phá sản phẩm và quản lý giỏ hàng của bạn.</p>
        </div>

        <div className="cart-badge">
          🛒 {summary.itemCount} sản phẩm
        </div>
      </header>

      <section>
        <h2>Sản phẩm</h2>

        {status === 'loading' && <p>Đang tải sản phẩm...</p>}

        {status === 'failed' && (
          <div className="error">
            <p>{error}</p>
            <button onClick={() => void dispatch(fetchProducts())}>
              Thử lại
            </button>
          </div>
        )}

        {status === 'succeeded' && (
          <div className="product-grid">
            {products.map((product) => (
              <article className="product-card" key={product.id}>
                <img src={product.image} alt={product.title} />

                <h3>{product.title}</h3>

                <p className="price">
                  {formatPrice(product.price)}
                </p>

                <button
                  onClick={() =>
                    dispatch(
                      addToCart({
                        id: product.id,
                        title: product.title,
                        price: product.price,
                        image: product.image,
                      }),
                    )
                  }
                >
                  Thêm vào giỏ
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="cart-section">
        <div className="section-heading">
          <h2>Giỏ hàng</h2>

          {cartItems.length > 0 && (
            <button
              className="button-secondary"
              onClick={() => dispatch(clearCart())}
            >
              Xóa tất cả
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <p className="empty-cart">
            Giỏ hàng đang trống. Hãy thêm sản phẩm bạn yêu thích!
          </p>
        ) : (
          <div className="cart-list">
            {cartItems.map((item) => (
              <article className="cart-item" key={item.id}>
                <img src={item.image} alt={item.title} />

                <div className="cart-item-info">
                  <h3>{item.title}</h3>
                  <p>{formatPrice(item.price)}</p>
                </div>

                <div className="quantity">
                  <button
                    aria-label={`Giảm số lượng ${item.title}`}
                    onClick={() =>
                      dispatch(decreaseQuantity(item.id))
                    }
                  >
                    −
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    aria-label={`Tăng số lượng ${item.title}`}
                    onClick={() =>
                      dispatch(increaseQuantity(item.id))
                    }
                  >
                    +
                  </button>
                </div>

                <strong>
                  {formatPrice(item.price * item.quantity)}
                </strong>

                <button
                  className="remove-button"
                  onClick={() => dispatch(removeFromCart(item.id))}
                >
                  Xóa
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="checkout-grid">
        <div className="checkout-panel">
          <h2>Mã giảm giá</h2>

          <div className="discount-form">
            <input
              value={discountInput}
              onChange={(event) =>
                setDiscountInput(event.target.value)
              }
              placeholder="Nhập mã giảm giá"
              aria-label="Mã giảm giá"
            />

            <button onClick={handleDiscount}>Áp dụng</button>
          </div>

          <p className="hint">
            SUMMER10 giảm 10% · SPECIAL20 giảm 20%
          </p>

          {discountMessage && <p>{discountMessage}</p>}

          {discountCode && (
            <p className="success">
              Mã đang áp dụng: {discountCode}
            </p>
          )}

          <h2>Phí vận chuyển</h2>

          <div className="shipping-options">
            {[
              { label: 'Miễn phí', value: 0 },
              { label: 'Tiêu chuẩn ($10)', value: 10 },
              { label: 'Giao nhanh ($25)', value: 25 },
            ].map((option) => (
              <label key={option.value}>
                <input
                  type="radio"
                  name="shipping"
                  checked={shippingCost === option.value}
                  onChange={() =>
                    dispatch(setShippingCost(option.value))
                  }
                />

                {option.label}
              </label>
            ))}
          </div>
        </div>

        <div className="checkout-panel summary">
          <h2>Tóm tắt đơn hàng</h2>

          <div className="summary-row">
            <span>Tạm tính</span>
            <span>{formatPrice(summary.subtotal)}</span>
          </div>

          <div className="summary-row discount-row">
            <span>Giảm giá</span>
            <span>-{formatPrice(summary.discount)}</span>
          </div>

          <div className="summary-row">
            <span>Thuế (10%)</span>
            <span>{formatPrice(summary.tax)}</span>
          </div>

          <div className="summary-row">
            <span>Vận chuyển</span>
            <span>{formatPrice(summary.shipping)}</span>
          </div>

          <div className="summary-row total-row">
            <strong>Thành tiền</strong>
            <strong>{formatPrice(summary.total)}</strong>
          </div>

          <button
            className="checkout-button"
            disabled={cartItems.length === 0}
            onClick={() =>
              window.alert(
                'Đây là bản demo. Chức năng thanh toán chưa được tích hợp.',
              )
            }
          >
            Tiến hành thanh toán
          </button>

          <p className="hint">
            Giỏ hàng được lưu tự động trên trình duyệt này.
          </p>
        </div>
      </section>
    </main>
  );
}

export default ShoppingCart;