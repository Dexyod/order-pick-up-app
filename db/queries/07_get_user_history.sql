SELECT order_details.quantity, items.name, order_details.description,
order_details.price, items.photo_url
FROM order_details
JOIN orders ON orders.id = order_details.order_id
JOIN users ON users.id = orders.user_id
JOIN items ON items.id = order_details.item_id
WHERE users.id = 1
AND orders.end_time IS NOT NULL
ORDER BY orders.order_date
LIMIT 2;
