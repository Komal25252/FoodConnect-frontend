import { useState, useEffect, useRef } from "react";
import api from "../api";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchChats();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChats = async () => {
    try {
      const response = await api.get("/chats/my-chats");
      setChats(response.data.chats || []);
      
      // Auto-refresh chats every 5 seconds when widget is open
      if (isOpen) {
        setTimeout(fetchChats, 5000);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  const fetchChatDetails = async (chatId) => {
    try {
      console.log("Fetching chat details for:", chatId);
      const response = await api.get(`/chats/${chatId}`);
      console.log("Chat details fetched:", response.data);
      setSelectedChat(response.data.chat);
      
      // Mark chat as read
      await markChatAsRead(chatId);
    } catch (error) {
      console.error("Error fetching chat details:", error);
      // Fallback to local chat if API fails
      const chat = chats.find(c => c._id === chatId);
      if (chat) {
        setSelectedChat(chat);
      }
    }
  };

  const markChatAsRead = async (chatId) => {
    try {
      await api.post(`/chats/${chatId}/mark-read`);
      // Refresh chats to update unread count
      fetchChats();
    } catch (error) {
      console.error("Error marking chat as read:", error);
    }
  };

  const getUnreadCount = (chat) => {
    if (!chat.messages || chat.messages.length === 0) return 0;
    
    const lastReadField = user.role === "restaurant" 
      ? chat.lastReadByRestaurant 
      : chat.lastReadByNGO;
    
    if (!lastReadField) {
      // Count all messages not sent by current user
      return chat.messages.filter(msg => 
        msg.sender.toString() !== user.id.toString()
      ).length;
    }
    
    const lastReadTime = new Date(lastReadField);
    return chat.messages.filter(msg => 
      msg.sender.toString() !== user.id.toString() &&
      new Date(msg.timestamp) > lastReadTime
    ).length;
  };

  const getTotalUnreadCount = () => {
    return chats.reduce((total, chat) => total + getUnreadCount(chat), 0);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim() || !selectedChat) {
      console.log("Cannot send: message or chat missing", { message, selectedChat });
      return;
    }

    setLoading(true);
    console.log("Sending message to chat:", selectedChat._id);
    
    try {
      const response = await api.post(`/chats/${selectedChat._id}/message`, {
        message: message.trim()
      });
      
      console.log("Message sent successfully:", response.data);
      
      if (response.data.success) {
        // Update selected chat with new message
        setSelectedChat(response.data.chat);
        setMessage("");
        
        // Update chats list
        setChats(prevChats => prevChats.map(c => 
          c._id === response.data.chat._id ? response.data.chat : c
        ));
      }
    } catch (error) {
      console.error("Error sending message:", error);
      console.error("Error response:", error.response?.data);
      alert(`Failed to send message: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-blue-600 text-white p-3 sm:p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all z-50"
        title="Open Chat"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        {getTotalUnreadCount() > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {getTotalUnreadCount()}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 w-full sm:w-96 h-[100vh] sm:h-[500px] bg-white sm:rounded-lg shadow-2xl flex flex-col z-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-3 sm:p-4 sm:rounded-t-lg flex justify-between items-center">
        <h3 className="font-semibold text-sm sm:text-base">💬 Messages</h3>
        <button
          onClick={() => {
            setIsOpen(false);
            setSelectedChat(null);
          }}
          className="text-white hover:text-gray-200"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      {!selectedChat ? (
        // Chat List (WhatsApp style)
        <div className="flex-1 overflow-y-auto bg-white">
          {chats.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <div className="text-4xl mb-3">💬</div>
              <p className="font-medium">No conversations yet</p>
              <p className="text-sm mt-2">Chats will appear here when you request or receive donation requests</p>
            </div>
          ) : (
            <div>
              {chats.map((chat) => {
                const lastMsg = chat.messages[chat.messages.length - 1];
                const contactName = user.role === "restaurant" 
                  ? `${chat.ngo?.name} (NGO)` 
                  : `${chat.restaurant?.name} (Restaurant)`;
                const unreadCount = getUnreadCount(chat);
                
                return (
                  <div
                    key={chat._id}
                    onClick={() => fetchChatDetails(chat._id)}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b flex items-center gap-3 relative"
                  >
                    {/* Avatar */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg ${
                      user.role === "restaurant" ? 'bg-blue-500' : 'bg-green-500'
                    }`}>
                      {user.role === "restaurant" ? '🏢' : '🍴'}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h4 className={`text-sm truncate ${unreadCount > 0 ? 'font-bold' : 'font-semibold'}`}>
                          {contactName}
                        </h4>
                        {lastMsg && (
                          <span className="text-xs text-gray-400 ml-2">
                            {new Date(lastMsg.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        )}
                      </div>
                      {lastMsg ? (
                        <p className={`text-xs mt-1 truncate ${unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                          {lastMsg.sender.toString() === user.id.toString() ? '✓ ' : ''}{lastMsg.message}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400 mt-1 italic">
                          No messages yet
                        </p>
                      )}
                    </div>
                    
                    {/* Unread badge */}
                    {unreadCount > 0 && (
                      <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        // Chat Messages
        <>
          {/* Chat Header */}
          <div className="p-3 border-b flex items-center gap-3 bg-gray-50">
            <button
              onClick={() => setSelectedChat(null)}
              className="text-gray-600 hover:text-gray-800 text-xl"
            >
              ←
            </button>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
              user.role === "restaurant" ? 'bg-blue-500' : 'bg-green-500'
            }`}>
              {user.role === "restaurant" ? '🏢' : '🍴'}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm">
                {user.role === "restaurant" ? selectedChat.ngo?.name : selectedChat.restaurant?.name}
              </h4>
              <p className="text-xs text-gray-500">
                {user.role === "restaurant" ? 'NGO' : 'Restaurant'}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {selectedChat.messages.length === 0 ? (
              <p className="text-center text-gray-500 text-sm">No messages yet. Start the conversation!</p>
            ) : (
              selectedChat.messages.map((msg, index) => {
                const isMine = msg.sender.toString() === user.id.toString();
                return (
                  <div
                    key={index}
                    className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        isMine
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <p className={`text-xs mt-1 ${isMine ? 'text-blue-100' : 'text-gray-500'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={sendMessage} className="p-3 border-t flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '...' : 'Send'}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default ChatWidget;