const Chat = require('../models/chat');
const Message = require('../models/Message');
const { updateAd } = require('./adsController');

// Start/get a chat between buyer and seller for a product
const startChat = async (req, res) => {
  const { productId, sellerId } = req.body;
  const buyerId = req.user.id;

  try {
    let chat = await Chat.findOne({
      product: productId,
      participants: { $all: [buyerId, sellerId] },
    });

    if (!chat) {
      chat = new Chat({
        product: productId,
        participants: [buyerId, sellerId].sort(),
      });
      await chat.save();
      console.log(`Chat created: ${chat._id} for product ${productId}`);
    }
    res.status(200).json(chat);
  } catch (err) {
    console.error('Error starting chat:' , err);
    res.status(500).json({ message: 'Failed to start chat', error: err.message });
  }
};

// Send message
const sendMessage = async (req, res) => {
  const { chatId } = req.params;
  const { text } = req.body;
  const senderId = req.user.id;

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      console.error(`Chat not found: ${chatId}`);
      return res.status(404).json({message: 'Chat not found' });
    }

    //find the other participant -> reciever
    const receiverId = chat.participants.find(
      (id) => id.toString() !== senderId.toString()
    );
    if (!receiverId)
      return res.status(400).json({ message: 'Receiver not found in chat'});

    const message = new Message({
      chat: chatId,
      sender: senderId,
      receiver: receiverId,
      text,
    });

    await message.save();
    console.log(`Message ${message._id} sent in chat ${chatId}`);
    res.status(201).json(message);
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ message: 'Failed to send message', error: err.message });
  }
};

// Get all messages in a chat
const getMessages = async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user.id;

  try {
    //ensure the user is a participant
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(userId)) {
      console.error(`Chat not found or access denied: ${chatId}`);
      return res.status(404).json({ message: 'Chat not found' });
    }

    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'name email')
      .sort({ createdAt: 1});
    console.log(`Fetched ${messages.length} messages for chat ${chatId}`);
    res.status(200).json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ message: 'Failed to get messages', error: err.message });
  }
};

//Get all chats for logged-in user
const getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user.id,
    })
      .populate('product')
      .populate('participants', 'name email');

    console.log(`Fetched ${chats.length} chats for user ${req.user.id}`);
    res.status(200).json(chats);
  } catch (err) {
    console.error('Error fetching user chats:', err);
    res.status(500).json({ message: 'Failed to fetch chats', error: err.message });
  }
};

//get unread message count for the logged-in user
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadCount = await Message.countDocuments({
      receiver: req.user.id, //message not sent by the current user
      read: false,
      //Join via chat model to only check user's chats
      chat: { $in: await Chat.find({ participants: userId}).distinct('_id')}
    })
    res.status(200).json({ unreadCount });
  } catch (err) {
    console.error('Error getting unread message count:', err);
    res.status(500).json({ message: 'Failed to fetch unread count', error: err.message });
  }
};

const getUserConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = await Chat.find({
      participants: userId
    })
      .populate('participants', 'name _id')
      .populate('product', 'name') // if using products
      .sort({ updatedAt: -1 });

    const convs = conversations.map((conv) => ({
      _id: conv._id,
      participants: conv.participants,
      productName: conv.product?.name || '',
    }));

    res.json(convs);
  } catch (error)  {
    console.error('Error fetching user conversations:', error);
    res.status(500).json({ message: 'Failed to get conversations' });
  }
};

const markMessagesAsRead = async (req, res)=> {
  const { chatId }= req.params;
  try {
    await Message.updateMany(
      { chat: chatId, receiver: req.user.id, read: false },
      { $set: { read: true }}
    );

    res.status(200).json({ message: 'Messages marked as read'});
  } catch (err) {
    console.error('Error marking messages as read:' , error);
    res.status(500).json({ message: 'Server error'})
  }
}

module.exports = { startChat, sendMessage, getMessages, getUserChats, getUnreadCount, getUserConversations, markMessagesAsRead };