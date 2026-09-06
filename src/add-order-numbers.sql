-- Backfill existing orders with sequential order_numbers
WITH numbered AS (
  SELECT
    id,
    order_number,
    ROW_NUMBER() OVER (ORDER BY created_at ASC) AS rn
  FROM orders
  WHERE order_number IS NULL OR order_number = ''
)
UPDATE orders
SET order_number = 'ORD-' || LPAD(numbered.rn::text, 5, '0')
FROM numbered
WHERE orders.id = numbered.id
  AND (orders.order_number IS NULL OR orders.order_number = '');

-- Add unique constraint on order_number
ALTER TABLE orders
  ADD CONSTRAINT orders_order_number_unique UNIQUE (order_number);
