import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ChatWidget = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleChatSend = async () => {
    if (!chatInput.trim()) return;

    const userMessage = { type: "user", content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setIsLoading(true);

    try {
      const response = await axios.post(`${API}/chat`, {
        message: chatInput,
        session_id: sessionId
      });

      const aiMessage = { type: "ai", content: response.data.response };
      setChatMessages(prev => [...prev, aiMessage]);
      setSessionId(response.data.session_id);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = { type: "ai", content: "Sorry, I'm having trouble connecting right now. Please try again!" };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isChatOpen && (
        <Button
          onClick={() => setIsChatOpen(true)}
          className="rounded-full w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 shadow-lg shadow-cyan-500/25"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      )}

      {isChatOpen && (
        <Card className="w-80 h-96 bg-slate-800 border-slate-700 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white p-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg">Chat with Pat</CardTitle>
                <CardDescription className="text-cyan-100">AI Assistant • Usually replies instantly</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsChatOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="flex flex-col h-64 p-0">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.length === 0 && (
                <div className="text-gray-400 text-sm">
                  Hey! 👋 I'm Pat's AI assistant. Ask me anything about services, pricing, or how I can help grow your business!
                </div>
              )}
              
              {chatMessages.map((msg, index) => (
                <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    msg.type === 'user' 
                      ? 'bg-cyan-600 text-white' 
                      : 'bg-slate-700 text-gray-200'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-700 p-3 rounded-lg">
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            
            <div className="border-t border-slate-700 p-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Type your message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
                />
                <Button 
                  onClick={handleChatSend} 
                  className="bg-gradient-to-r from-cyan-500 to-purple-600"
                  disabled={isLoading}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ChatWidget;
