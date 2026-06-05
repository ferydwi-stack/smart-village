'use client';

import { useState, useEffect, useRef } from 'react';
import { useChatHistory, useSendMessage } from '@/hooks/useChat';
import Header from '@/components/layout/Header';
import { formatDateTime } from '@/lib/utils';
import { Bot, User, Send, Search, Plus, MessageSquare, ArrowLeft, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const quickReplies = [
  "Cara beli barang", "Cara jual barang", "Lacak pesanan", "Lapor Produk Tidak Pantas", "Laporkan masalah"
];

export default function ChatPage() {
  const [message, setMessage] = useState('');
  const [chatList, setChatList] = useState([
    { id: '1', name: 'DesaMart Bot', lastMessage: 'Halo! Ada yang bisa saya bantu?', time: 'Baru saja' }
  ]);
  const [activeChat, setActiveChat] = useState('1');
  
  const { data: historyData, isLoading: isLoadingHistory } = useChatHistory(1, 50);
  const { mutate: sendMessage, isPending: isSending } = useSendMessage();

  const [messages, setMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize messages with welcome message or history
  useEffect(() => {
    if (historyData?.data && historyData.data.length > 0) {
      // Map API history to local message format
      const historyMessages = [...historyData.data].reverse().map((item: any) => [
        {
          id: `u-${item.id}`,
          text: item.raw_message,
          sender: 'user',
          time: item.created_at,
        },
        {
          id: `b-${item.id}`,
          text: item.bot_response || 'Maaf, saya tidak mengerti.',
          sender: 'bot',
          time: item.created_at,
          category: item.category,
        }
      ]).flat();
      
      setMessages(historyMessages);
    } else {
      // Welcome message
      setMessages([
        {
          id: 'welcome',
          text: "Halo! 👋 Saya DesaMart Bot. Ada yang bisa saya bantu hari ini?\n\nAnda bisa bertanya tentang:\n• Cara beli barang\n• Cara menjual barang\n• Status pesanan\n• Atau laporkan kendala",
          sender: 'bot',
          time: new Date().toISOString(),
        }
      ]);
    }
  }, [historyData]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMessage = {
      id: `temp-${Date.now()}`,
      text: textToSend,
      sender: 'user',
      time: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage('');

    sendMessage(textToSend, {
      onSuccess: (data) => {
        const botMessage = {
          id: `bot-${Date.now()}`,
          text: data.response || 'Maaf, terjadi kesalahan.',
          sender: 'bot',
          time: new Date().toISOString(),
          category: data.category,
        };
        setMessages((prev) => [...prev, botMessage]);
      },
      onError: (err: any) => {
        console.error('Chat Error:', err.response?.data || err.message);
        toast.error('Gagal mengirim pesan. Silakan coba lagi.');
      },
    });
  };

  return (
    <div className="h-screen flex flex-col bg-surface">
      <Header />

      <div className="flex-1 flex overflow-hidden container mx-auto px-4 py-4 gap-4">
        {/* LEFT PANEL: Chat List (Desktop) */}
        <div className="hidden md:flex w-80 bg-white rounded-xl border border-slate-100 flex-col overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-on-surface">Pesan</h2>
              <button className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-full">
                <Plus className="h-5 w-5" />
              </button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="Cari obrolan..."
                className="pl-9 w-full rounded-lg border-slate-200 focus:border-primary-500 focus:ring-primary-500 text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {chatList.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setActiveChat(chat.id)}
                className={cn(
                  "w-full p-4 flex gap-3 hover:bg-surface transition-colors border-l-4",
                  activeChat === chat.id 
                    ? "border-primary-600 bg-primary-50/50" 
                    : "border-transparent"
                )}
              >
                <div className="h-10 w-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="font-bold text-on-surface text-sm">{chat.name}</span>
                    <span className="text-xs text-slate-400">{chat.time}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{chat.lastMessage}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL: Chat Area */}
        <div className="flex-1 bg-white rounded-xl border border-slate-100 flex flex-col overflow-hidden shadow-sm">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
            <div className="flex items-center gap-3">
              <button className="md:hidden p-1.5 text-slate-600 hover:bg-slate-100 rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="h-10 w-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center relative">
                <Bot className="h-5 w-5" />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 rounded-full border-2 border-white"></span>
              </div>
              <div>
                <h3 className="font-bold text-on-surface text-sm">DesaMart Bot</h3>
                <span className="text-xs text-green-500">Online</span>
              </div>
            </div>
            
            <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface/50">
            {isLoadingHistory ? (
              <div className="flex justify-center p-4">
                <div className="animate-pulse flex space-x-2">
                  <div className="h-2 w-2 bg-slate-400 rounded-full"></div>
                  <div className="h-2 w-2 bg-slate-400 rounded-full"></div>
                  <div className="h-2 w-2 bg-slate-400 rounded-full"></div>
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={msg.id || idx}
                  className={cn(
                    "flex",
                    msg.sender === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[75%] p-3 rounded-2xl text-sm whitespace-pre-line",
                      msg.sender === 'user'
                        ? "bg-white text-on-surface border border-slate-100 shadow-sm rounded-tr-none"
                        : "bg-primary-50 text-on-surface rounded-tl-none"
                    )}
                  >
                    <p>{msg.text}</p>
                    
                    {msg.category && msg.sender === 'bot' && (
                      <span className="inline-block mt-2 text-xs font-semibold px-2 py-0.5 bg-white text-primary-600 rounded-full">
                        📌 Kategori: {msg.category}
                      </span>
                    )}
                    
                    <p className={cn(
                      "text-[10px] mt-1 text-right",
                      msg.sender === 'user' ? "text-slate-400" : "text-primary-600"
                    )}>
                      {formatDateTime(msg.time)}
                    </p>
                  </div>
                </div>
              ))
            )}

            {/* Typing Indicator */}
            {isSending && (
              <div className="flex justify-start">
                <div className="bg-primary-50 text-on-surface p-3 rounded-2xl rounded-tl-none max-w-[75%]">
                  <div className="flex items-center gap-2 text-primary-600">
                    <div className="animate-bounce h-1.5 w-1.5 bg-primary-600 rounded-full"></div>
                    <div className="animate-bounce h-1.5 w-1.5 bg-primary-600 rounded-full [animation-delay:0.2s]"></div>
                    <div className="animate-bounce h-1.5 w-1.5 bg-primary-600 rounded-full [animation-delay:0.4s]"></div>
                    <span className="text-xs ml-1 font-medium text-slate-500">DesaMart Bot sedang mengetik...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {messages.length < 5 && !isSending && (
            <div className="p-3 bg-white border-t border-slate-100 overflow-x-auto flex gap-2 custom-scrollbar">
              {quickReplies.map((reply, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(reply)}
                  className="px-3 py-1.5 border border-primary-100 hover:border-primary-600 hover:bg-primary-50 text-primary-600 text-xs font-medium rounded-full whitespace-nowrap transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          {/* Chat Input */}
          <div className="p-4 bg-white border-t border-slate-100">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(message);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                placeholder="Ketik pesan Anda..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isSending}
                className="flex-1 rounded-lg border-slate-200 focus:border-primary-500 focus:ring-primary-500 text-sm"
              />
              <button
                type="submit"
                disabled={!message.trim() || isSending}
                className="h-10 w-10 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

