SELECT order_details.line_no, order_details.quantity, items.name, order_details.description,
order_details.price, items.photo_url, order_details.comment
FROM order_details
JOIN items ON items.id = order_details.item_id
WHERE order_id = 1;
