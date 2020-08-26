
DROP TABLE IF EXISTS order_details;
DROP TABLE IF EXISTS orders;

CREATE TABLE orders (
  id SERIAL PRIMARY KEY NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  phone VARCHAR(50) NOT NULL,
  comment VARCHAR(255),
  order_date DATE NOT NULL, /* this is set to the date when the user click submit on the page. */
  start_time TIMESTAMP NOT NULL, /* this time starts when the use click submit on the page */
  end_time TIMESTAMP /* should be set once the order is completed/delivered */
);

CREATE TABLE order_details (
  id SERIAL PRIMARY KEY NOT NULL,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  item_id INTEGER REFERENCES items(id) ON DELETE CASCADE, /* not sure about this. if you delete an item you cannot delete the line from the order detail. Soooo, do not delete items??*/
  description VARCHAR(255),
  quantity SMALLINT NOT NULL,
  price INTEGER NOT NULL,
  comment VARCHAR(255)
);

