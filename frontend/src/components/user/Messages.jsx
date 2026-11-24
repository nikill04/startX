// "Messages" section: live chat between this startup and the admin
import React, { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import { io } from "socket.io-client";
import { Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api, { API_URL } from "../../api";

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const socketRef = useRef(null); // the live connection to the backend
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const startup = Cookies.get("startup");

  useEffect(() => {
    // 1. Load the old messages
    api
      .get(`/admin/messages/${startup}`)
      .then((response) => setMessages(response.data))
      .catch((error) => console.error("Error fetching messages:", error))
      .finally(() => setIsLoading(false));

    // 2. Connect to the chat and join this startup's room
    const socket = io(API_URL);
    socketRef.current = socket;
    socket.emit("joinRoom", startup);

    // 3. Every new message (ours or the admin's) arrives here
    socket.on("receiveMessage", (message) => {
      setMessages((previous) => [...previous, message]);
    });

    // Disconnect when we leave the Messages section
    return () => socket.disconnect();
  }, [startup]);

  // Scroll down whenever a message is added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    socketRef.current.emit("sendMessage", {
      roomId: startup,
      messageData: { message: newMessage, sender: "User" },
    });
    setNewMessage("");
    inputRef.current?.focus(); // put the cursor back in the text box
  };

  return (
    <div className="flex flex-col h-[80vh] w-full max-w-4xl mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg shadow-lg overflow-hidden">
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        // flex-1 lets the message list fill the box, so the typing bar sits at the bottom
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <p className="h-full flex items-center justify-center text-gray-500">
              No messages yet. Say hello to the StartX team!
            </p>
          )}
          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={msg._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`flex ${
                  msg.sender === "User" ? "justify-end" : "justify-start"
                }`}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 rounded-lg max-w-xs lg:max-w-lg ${
                    msg.sender === "admin"
                      ? "bg-blue-500 text-white"
                      : "bg-green-500 text-white"
                  }`}
                >
                  <p className="text-sm font-semibold">
                    {msg.sender === "User" ? "You" : msg.sender}
                  </p>
                  <p className="mt-1 text-sm lg:text-base">{msg.message}</p>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      )}

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="p-4 bg-white shadow-lg"
      >
        <div className="flex items-center space-x-2">
          <textarea
            ref={inputRef}
            className="flex-1 p-3 border border-gray-300 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out resize-none"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            rows={1}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out"
            onClick={handleSendMessage}
          >
            <Send size={20} />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
