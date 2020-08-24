SELECT id, phone, comment, order_date, start_time
FROM orders
WHERE user_id = 1
AND end_time IS NULL;
