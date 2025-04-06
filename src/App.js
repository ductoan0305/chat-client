// 📦 React Chat Client Demo
// Kết nối đến server Socket.IO bạn vừa deploy (Render)
// Hỗ trợ nhập tên, chọn nhóm, gửi và nhận tin nhắn realtime

import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('https://chat-server-2qcm.onrender.com/'); // 👈 Thay bằng link server của bạn nếu khác

export default function ChatApp() {
  const [username, setUsername] = useState('');
  const [groupId, setGroupId] = useState('general');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    socket.on('chat_history', (history) => {
      setMessages(history);
    });

    socket.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off('chat_history');
      socket.off('receive_message');
    };
  }, []);

  const handleJoin = () => {
    if (!username || !groupId) return;
    socket.emit('join_group', groupId);
    setJoined(true);
  };

  const handleSend = () => {
    if (!message.trim()) return;
    socket.emit('send_message', {
      groupId,
      sender: username,
      content: message
    });
    setMessage('');
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      {!joined ? (
        <div className="space-y-4">
          <h1 className="text-xl font-bold">Join Chat Group</h1>
          <input
            className="border p-2 w-full"
            placeholder="Your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="border p-2 w-full"
            placeholder="Group ID (e.g. general, team1)"
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
          />
          <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleJoin}>
            Join
          </button>
        </div>
      ) : (
        <div>
          <h2 className="text-lg font-semibold mb-2">Group: {groupId}</h2>
          <div className="border h-64 overflow-y-scroll p-2 bg-gray-100 rounded mb-2">
            {messages.map((msg, index) => (
              <div key={index} className="mb-1">
                <strong>{msg.sender}:</strong> {msg.content}
              </div>
            ))}
          </div>
          <div className="flex space-x-2">
            <input
              className="border p-2 flex-1"
              value={message}
              placeholder="Type a message..."
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={handleSend}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
