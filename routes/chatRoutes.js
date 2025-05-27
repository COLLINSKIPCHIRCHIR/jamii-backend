const express = require('express') 
const { startChat, sendMessage, getMessages, getUserChats, getUnreadCount, getUserConversations, markMessagesAsRead } = require('../controllers/chatController') 
const {protect} = require('../middleware/authMiddleware.js')

const router = express.Router();

router.post('/start', protect, startChat); //start or get chat
router.post('/:chatId/messages', protect, sendMessage); //send message
router.get('/:chatId/messages', protect, getMessages); // get messages for a product chat
router.get('/unread/count',protect, getUnreadCount ); //unread message route
router.get('/conversations' , protect, getUserConversations);
router.get('/', protect, getUserChats)
router.post('/:chatId/mark-read', protect, markMessagesAsRead);


module.exports = router;