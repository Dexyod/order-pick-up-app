/* this is a settled order */
INSERT INTO orders (user_id, phone, comment, order_date, start_time, end_time)
VALUES (1, '778-349-3299', 'This is comment 1', now()::date, now(), now());

INSERT INTO order_details (order_id, item_id, description, quantity, price)
VALUES (1, 1, '1/2 lb Mountain of crispy bacon, lettuce, tomato, mayonnaise, melted cheddar, choice of bread, baby dills, bacon & cheese potato puffs',
1, 1400),
(1, 2, 'This is grilled cheese and whole nuther level',
1, 1200);

INSERT INTO orders (user_id, phone, comment, order_date, start_time, end_time)
VALUES (1, '778-349-3299', 'This is comment 1', now()::date, now(), now());

INSERT INTO order_details (order_id, item_id, description, quantity, price)
VALUES (2, 1, '1/2 lb Mountain of crispy bacon, lettuce, tomato, mayonnaise, melted cheddar, choice of bread, baby dills, bacon & cheese potato puffs',
1, 1400),
(2, 2, 'This is grilled cheese and whole nuther level',
1, 1200);


INSERT INTO orders (user_id, phone, comment, order_date, start_time, end_time)
VALUES (2, '778-125-2216', 'This is comment 2', now()::date, now(), now());

INSERT INTO order_details (order_id, item_id, description, quantity, price)
VALUES (3, 4, 'If you’re one of those folks who think bacon is a food group, you’ll love this weeknight-friendly twist with a sweet and spicy kick from jalapeno jelly.',
2, 1100),
(3, 5, 'You will be truly satified with the work of bacon',
1, 900);



