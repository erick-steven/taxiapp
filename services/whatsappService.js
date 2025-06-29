const axios = require('axios');

const WHATSAPP_TOKEN = 'YOUR_WHATSAPP_ACCESS_TOKEN';
const PHONE_NUMBER_ID = 'YOUR_PHONE_NUMBER_ID'; // from Meta Developer Console
const TO_PHONE_NUMBER = 'RECIPIENT_PHONE_INCLUDING_COUNTRY_CODE'; // e.g., 255...

module.exports = async function sendWhatsAppMessage(booking) {
  const message = `🚗 New Booking:\n
Name: ${booking.fullName}
Rental Type: ${booking.rentalType}
Pickup: ${booking.pickupLocation} at ${booking.pickupDate} ${booking.pickupTime}
Return: ${booking.returnDate} ${booking.returnTime}
Phone: ${booking.phoneNumber}
Email: ${booking.email}`;

  await axios.post(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
    messaging_product: 'whatsapp',
    to: TO_PHONE_NUMBER,
    type: 'text',
    text: { body: message }
  }, {
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
};
