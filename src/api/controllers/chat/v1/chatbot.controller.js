const {
  sendMessageToRasa,
} = require('../../../../services/chat/chatbot.service');

exports.driverChatbot = async (req, res) => {
  const { message } = req.body;
  const sender = req.user._id;
  if (!message || !sender) {
    return res.status(400).json({ error: 'Message is required' });
  }
  try {
    const rasaResponse = await sendMessageToRasa(message, sender, 'driver');
    res.json({ responses: rasaResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.passengerChatbot = async (req, res) => {
  const { message } = req.body;
  const sender = req.user._id;
  if (!message || !sender) {
    return res.status(400).json({ error: 'Message is required' });
  }
  try {
    const rasaResponse = await sendMessageToRasa(message, sender, 'passenger');
    res.json({ responses: rasaResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
