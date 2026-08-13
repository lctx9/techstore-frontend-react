import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '../../api/client';
import { MessageCircle, X, Send, Bot, Loader2 } from 'lucide-react';

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

export const ChatbotBubble: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'bot', text: 'Xin chào! Tôi là trợ lý ảo TechMart. Tôi có thể giúp gì cho bạn hôm nay?' },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize session ID
  useEffect(() => {
    setSessionId(crypto.randomUUID());
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = inputText.trim();
    setInputText('');
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const response = await apiClient.post('/api/v1/chatbot/chat', {
        message: userMsg,
        sessionId: sessionId,
      });

      const botReply = response.data.response;
      setMessages((prev) => [...prev, { sender: 'bot', text: botReply }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Xin lỗi, trợ lý AI đang quá tải. Bạn có thể thử hỏi lại sau ít phút.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans text-xs">
      {/* Chat window */}
      {isOpen && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-80 h-96 sm:w-96 sm:h-[450px] mb-4 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-indigo-600 text-white p-4 flex items-center justify-between shadow-sm shrink-0 text-left">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <div>
                <h3 className="font-bold text-sm tracking-wide">Trợ lý ảo TechMart</h3>
                <span className="text-[9px] text-indigo-200 font-medium">Hỗ trợ tư vấn mua hàng AI (RAG)</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-grow p-4 overflow-y-auto space-y-3 bg-slate-50 flex flex-col text-left">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`max-w-[80%] rounded-xl px-3.5 py-2 leading-relaxed shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white self-end rounded-tr-none'
                    : 'bg-white text-slate-800 self-start rounded-tl-none border border-slate-150'
                }`}
              >
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className="bg-white border border-slate-150 rounded-xl rounded-tl-none px-3.5 py-2 text-slate-500 self-start flex items-center space-x-1.5 shadow-sm">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" />
                <span>AI đang tìm câu trả lời...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input field */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-200 flex items-center space-x-2 shrink-0">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Bạn muốn hỏi gì về sản phẩm?..."
              className="flex-grow px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 text-xs"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors cursor-pointer disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {/* Bubble Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-105 transition-all cursor-pointer z-50 ml-auto border-2 border-white"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
};
