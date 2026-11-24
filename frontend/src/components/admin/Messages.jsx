// Admin tab "Messages": chat with each startup, or broadcast one message to all of them
import { useState, useEffect, useRef } from 'react'
import { Send, ChevronRight, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { io } from 'socket.io-client'
import api, { API_URL } from '../../api'

export default function StartupMessages() {
  const [startups, setStartups] = useState([])
  const [selectedStartup, setSelectedStartup] = useState(null) // id of the open chat
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [unreadMessages, setUnreadMessages] = useState({}) // { startupId: number of new messages }
  const socketRef = useRef(null)
  const selectedRef = useRef(null) // same as selectedStartup, but readable inside the socket listener
  const messagesEndRef = useRef(null)

  useEffect(() => {
    const socket = io(API_URL)
    socketRef.current = socket

    // Load the startups and join every startup's chat room, so we hear all new messages
    api.get('/admin/startups').then((response) => {
      setStartups(response.data)
      response.data.forEach((startup) => socket.emit('joinRoom', startup._id))
    })

    socket.on('receiveMessage', (message) => {
      if (message.roomId === selectedRef.current) {
        setMessages((previous) => [...previous, message]) // the open chat
      } else if (message.sender !== 'admin') {
        setUnreadMessages((previous) => ({ ...previous, [message.roomId]: (previous[message.roomId] || 0) + 1 }))
      }
    })

    return () => socket.disconnect()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const openChat = async (startupId) => {
    selectedRef.current = startupId
    setSelectedStartup(startupId)
    setMessages([])
    setUnreadMessages((previous) => ({ ...previous, [startupId]: 0 }))
    try {
      const response = await api.get(`/admin/messages/${startupId}`)
      setMessages(response.data)
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const closeChat = () => {
    selectedRef.current = null
    setSelectedStartup(null)
  }

  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return
    socketRef.current.emit('sendMessage', {
      roomId: selectedStartup,
      messageData: { message: inputMessage, sender: 'admin' },
    })
    setInputMessage('')
  }

  const handleBroadcastMessage = () => {
    if (inputMessage.trim() === '') return
    if (!window.confirm('Send this message to ALL startups?')) return
    socketRef.current.emit('BroadcastMessage', {
      messageData: { message: inputMessage, sender: 'admin' },
    })
    setInputMessage('')
    alert('Message sent to all startups')
  }

  const selectedName = startups.find((s) => s._id === selectedStartup)?.kyc?.company_name

  return (
    <div className="flex flex-col h-[85vh] bg-purple-50 rounded-lg overflow-hidden shadow">
      <AnimatePresence mode="wait">
        {selectedStartup ? (
          <motion.div
            key="chat"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col h-full"
          >
            <div className="bg-purple-400 p-4 flex items-center text-white">
              <button onClick={closeChat} className="mr-4 hover:text-purple-100 focus:outline-none" title="Back">
                <ArrowLeft className="h-6 w-6" />
              </button>
              <h2 className="text-xl font-bold">{selectedName}</h2>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              {messages.length === 0 && <p className="text-center text-gray-500">No messages yet.</p>}
              {messages.map((message, index) => {
                const fromAdmin = message.sender === 'admin'
                return (
                  <motion.div
                    key={message._id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`mb-4 ${fromAdmin ? 'text-right' : 'text-left'}`}
                  >
                    <span
                      className={`inline-block p-3 rounded-lg max-w-[80%] whitespace-pre-wrap text-left ${
                        fromAdmin ? 'bg-purple-500 text-white' : 'bg-white text-purple-800 shadow'
                      }`}
                    >
                      <span className="block text-xs font-semibold opacity-80">{fromAdmin ? 'You' : selectedName}</span>
                      {message.message}
                    </span>
                  </motion.div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 bg-white shadow-inner">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 p-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  title="Send"
                  className="bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                >
                  <Send className="h-5 w-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="startups"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col h-full"
          >
            <div className="bg-purple-400 p-4 text-white">
              <h1 className="text-2xl font-bold">Startups</h1>
            </div>
            <div className="p-4 bg-white text-black shadow">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleBroadcastMessage()}
                  placeholder="Broadcast a message to all startups..."
                  className="flex-1 p-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBroadcastMessage}
                  title="Send to all startups"
                  className="bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                >
                  <Send className="h-5 w-5" />
                </motion.button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {startups.length === 0 && <p className="p-4 text-gray-500">No startups yet.</p>}
              <ul>
                {startups.map((startup) => (
                  <li key={startup._id} className="border-b last:border-b-0">
                    <button
                      className="w-full p-4 text-left hover:bg-purple-100 flex justify-between items-center focus:outline-none focus:bg-purple-100 transition-colors duration-200"
                      onClick={() => openChat(startup._id)}
                    >
                      <h2 className="font-semibold text-blue-800">{startup.kyc?.company_name}</h2>
                      <div className="flex items-center">
                        {unreadMessages[startup._id] > 0 && (
                          <span className="bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full mr-2">
                            {unreadMessages[startup._id]}
                          </span>
                        )}
                        <ChevronRight className="h-5 w-5 text-purple-400" />
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
