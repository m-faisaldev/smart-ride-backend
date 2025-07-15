const axios = require('axios');
const { DRIVER_RASA_URL, PASSENGER_RASA_URL } = require('../../config/chatbot.config');

async function sendMessageToRasa(message, sender, type = 'driver') {
  const url = type === 'driver' ? DRIVER_RASA_URL : PASSENGER_RASA_URL;
  try {
    const response = await axios.post(url, {
      sender,
      message,
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to communicate with Rasa server');
  }
}

module.exports = {
  sendMessageToRasa,
}; 