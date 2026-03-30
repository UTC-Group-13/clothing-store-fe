import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Trash2, Bot, User, Loader2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { chatService } from '../../services/api';
import { formatPrice } from '../../utils/helpers';
import type { ChatMessage, ChatProductSuggestion } from '../../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://160.30.113.40:8080';

const getImageUrl = (url: string | null | undefined): string => {
  if (!url) return '/placeholder-product.jpg';
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL}${url}`;
};

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom when new message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Load session from localStorage
  useEffect(() => {
    const savedSession = localStorage.getItem('chat-session');
    if (savedSession) {
      try {
        const { sessionId: savedId, messages: savedMessages } = JSON.parse(savedSession);
        setSessionId(savedId);
        // Convert timestamp strings back to Date objects
        setMessages(savedMessages.map((msg: ChatMessage) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      } catch (error) {
        console.error('Error loading chat session:', error);
      }
    }
  }, []);

  // Save session to localStorage
  useEffect(() => {
    if (sessionId || messages.length > 0) {
      localStorage.setItem('chat-session', JSON.stringify({ sessionId, messages }));
    }
  }, [sessionId, messages]);

  const sendMessage = async (userMessage: string, productId?: number) => {
    if (!userMessage.trim() || isLoading) return;

    const messageId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: messageId,
      role: 'user',
      content: userMessage.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage({
        message: userMessage.trim(),
        sessionId: sessionId,
        productId: productId,
      });

      // Save session ID for next requests
      setSessionId(response.sessionId);

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        suggestions: response.suggestions,
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputText);
    }
  };

  const clearChat = async () => {
    if (sessionId) {
      try {
        await chatService.deleteSession(sessionId);
      } catch (error) {
        console.error('Error deleting session:', error);
      }
    }
    setMessages([]);
    setSessionId(null);
    localStorage.removeItem('chat-session');
  };

  const handleProductClick = (_product: ChatProductSuggestion) => {
    // Navigation is handled by Link component, just close chat
    setIsOpen(false);
  };

  const handleAskAboutProduct = (product: ChatProductSuggestion) => {
    sendMessage(`Cho tôi biết thêm về ${product.name}`, product.id);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Quick questions
  const quickQuestions = [
    'Áo thun dưới 300k',
    'Quần jean nam',
    'Đồ thể thao',
    'Gợi ý phối đồ',
  ];

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? 'bg-gray-600 hover:bg-gray-700'
            : 'bg-primary-600 hover:bg-primary-700'
        }`}
        aria-label={isOpen ? 'Đóng chat' : 'Mở chat'}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Trợ lý mua sắm AI</h3>
                <p className="text-white/80 text-xs">Luôn sẵn sàng hỗ trợ bạn</p>
              </div>
            </div>
            <button
              onClick={clearChat}
              className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
              title="Xóa lịch sử chat"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-8 h-8 text-primary-600" />
                </div>
                <h4 className="text-gray-800 font-medium mb-2">
                  Xin chào! 👋
                </h4>
                <p className="text-gray-500 text-sm mb-4">
                  Tôi là trợ lý AI của Clothing Store. Hãy hỏi tôi về sản phẩm, tư vấn
                  size, hoặc gợi ý phối đồ!
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {quickQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendMessage(q)}
                      className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-primary-500 hover:text-primary-600 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${
                      msg.role === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                        msg.role === 'user'
                          ? 'bg-primary-600'
                          : 'bg-gray-200'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-gray-600" />
                      )}
                    </div>

                    {/* Message Content */}
                    <div
                      className={`max-w-[75%] ${
                        msg.role === 'user' ? 'text-right' : ''
                      }`}
                    >
                      <div
                        className={`inline-block px-4 py-2 rounded-2xl ${
                          msg.role === 'user'
                            ? 'bg-primary-600 text-white rounded-br-md'
                            : 'bg-white text-gray-800 shadow-sm rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">
                          {msg.content}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 px-1">
                        {formatTime(new Date(msg.timestamp))}
                      </p>

                      {/* Product Suggestions */}
                      {msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs text-gray-500 font-medium">
                            Gợi ý cho bạn:
                          </p>
                          <div className="space-y-2">
                            {msg.suggestions.map((product) => (
                              <div
                                key={product.id}
                                className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
                              >
                                <div className="flex items-center gap-3 p-2">
                                  <img
                                    src={getImageUrl(product.thumbnailUrl)}
                                    alt={product.name}
                                    className="w-16 h-16 object-cover rounded-md"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                                    }}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <Link
                                      to={`/product/${product.id}`}
                                      onClick={() => handleProductClick(product)}
                                      className="text-sm font-medium text-gray-800 hover:text-primary-600 line-clamp-2"
                                    >
                                      {product.name}
                                    </Link>
                                    <p className="text-primary-600 font-semibold text-sm mt-0.5">
                                      {formatPrice(product.price)}
                                    </p>
                                    {product.categoryName && (
                                      <p className="text-xs text-gray-400">
                                        {product.categoryName}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex border-t border-gray-100">
                                  <Link
                                    to={`/product/${product.id}`}
                                    onClick={() => handleProductClick(product)}
                                    className="flex-1 flex items-center justify-center gap-1 py-2 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                                  >
                                    <ShoppingBag className="w-3.5 h-3.5" />
                                    Xem chi tiết
                                  </Link>
                                  <button
                                    onClick={() => handleAskAboutProduct(product)}
                                    className="flex-1 flex items-center justify-center gap-1 py-2 text-xs text-primary-600 hover:bg-primary-50 transition-colors border-l border-gray-100"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                    Hỏi thêm
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
                        <span className="text-sm text-gray-500">
                          Đang trả lời...
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Quick Questions (when has messages) */}
          {messages.length > 0 && !isLoading && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {quickQuestions.slice(0, 3).map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(q)}
                    className="flex-shrink-0 px-3 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:border-primary-500 hover:text-primary-600 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập tin nhắn..."
                className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                disabled={isLoading}
              />
              <button
                onClick={() => sendMessage(inputText)}
                disabled={!inputText.trim() || isLoading}
                className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;

