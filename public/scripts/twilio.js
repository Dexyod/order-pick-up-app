require("dotenv").config();


const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const restaurantPhone = process.env.RESTAURANT_NUMBER;
const twilioNumber = process.env.TWILIO_NUMBER;

const client = require('twilio')(accountSid, authToken);

const messageCustomer = (username, orderId, customerPhone, time) => {
  client.messages
    .create({
      body: `Hello ${username}, Thank you for Bacon-out! Your order id is ${orderId}. The estimated time until your food is ready to pick-up is ${time} minutes! Remember kids, as our lord and saviour said, "Don't Bac-in... Bac-out."`,
      from: `+1${twilioNumber}`,
      to: `+1${customerPhone}`
    })
    .then(message => console.log(message))
    .catch((error) => console.log(error.message));
};

const orderComplete = (username, orderId, customerPhone) => {
  client.messages
    .create({
      body: `Hello ${username}, your order ${orderId} is ready to be picked-up! See you soon! Wear a mask...`,
      from: `+1${twilioNumber}`,
      to: `+1${customerPhone}`
    })
    .then(message => console.log(message))
    .catch((error) => console.log(error.message));
};

const failedMessage = () => {
  client.messages
    .create({
      body: `Error...\nPlease use this format:\n\nAction\tClient-Username\tOrder ID\tClient Phone\tTime(for ETA only!)\n\nExample Message ETA:\n\nETA Declan 5 4169485080 35\n\nExample Message Complete:\n\nComplete Declan 5 4169485080`,
      from: `+1${twilioNumber}`,
      to: `+1${restaurantPhone}`
    })
    .catch((error) => console.log(error.message));
}
const messageRestaurant = (orderData) => {
  const { header, details } = orderData;
  
  let orderMessage = `\nOrder id: ${header.id},\n\nCustomer Phone: +1${header.phone},\n\nOrder Timestamp: ${header.start_time},\n\n`;
  details.map((item) => {
    orderMessage += `Item Name: ${item.name},\n\nQuantity: ${item.quantity},\n\nItem Comment: ${item.comment},\n\n`;
  });
  client.messages
    .create({
      body: orderMessage,
      from: `+1${twilioNumber}`,
      to: `+1${restaurantPhone}`
    });
};

module.exports = {
  messageCustomer,
  messageRestaurant,
  orderComplete,
  failedMessage
};
