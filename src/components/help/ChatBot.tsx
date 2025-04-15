
import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

type MessageType = {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
};

export const ChatBot = () => {
  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: "1",
      content: "👋 Hi there! How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Autofocus the input on component mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Find answer based on the question
  const getResponse = (question: string) => {
    const normalizedQuestion = question.toLowerCase();
    
    // Check for different topics based on keywords
    if (normalizedQuestion.includes("company") && (normalizedQuestion.includes("setup") || normalizedQuestion.includes("create"))) {
      return "To create a company, navigate to the Company Setup page from the sidebar. You'll need to provide your company information, industry, and contact details.";
    } else if (normalizedQuestion.includes("team") || normalizedQuestion.includes("member")) {
      return "You can add team members from the Company > Manage Team section. There are three roles available: admin, editor, and viewer. Admins have full control, editors can input data, and viewers can only see reports.";
    } else if (normalizedQuestion.includes("upload") || normalizedQuestion.includes("data") || normalizedQuestion.includes("emission")) {
      return "You can upload carbon data from the Data Upload page. We support CSV files with emission data which will automatically be categorized into the appropriate scope.";
    } else if (normalizedQuestion.includes("scope")) {
      return "We track three types of emissions: Scope 1 (direct emissions from owned sources), Scope 2 (indirect emissions from purchased energy), and Scope 3 (all other indirect emissions in your value chain). Each has its own tab in the emissions section.";
    } else if (normalizedQuestion.includes("action") || normalizedQuestion.includes("plan") || normalizedQuestion.includes("goal")) {
      return "You can create action plans and set climate goals in the Reports section. This helps track your progress toward emission reduction targets.";
    } else if (normalizedQuestion.includes("edit") || normalizedQuestion.includes("information") || normalizedQuestion.includes("preference")) {
      return "You can edit your company information and preferences in the Company section of the sidebar. This includes updating contact details, industry classification, and reporting preferences.";
    } else if (normalizedQuestion.includes("notification") || normalizedQuestion.includes("setting")) {
      return "You can manage notifications and other settings in the Settings page. This includes email notification preferences, display settings, and account security options.";
    }
    
    // Default response if no match found
    return "I'm not sure about that. You can always reach out to us at info@epccommodities.com.";
  };

  const handleSend = () => {
    if (inputValue.trim() === "") return;

    // Add user message
    const userMessage: MessageType = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate bot typing
    setTimeout(() => {
      const botResponse = getResponse(userMessage.content);
      const botMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        content: botResponse,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center">
          <span className="relative flex h-3 w-3 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-circa-green opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-circa-green"></span>
          </span>
          Chatbot Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] p-4 pt-0">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.sender === "user"
                      ? "bg-circa-green text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <p>{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg px-4 py-2 bg-gray-100 text-gray-800">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "100ms" }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "200ms" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t p-4">
        <div className="flex w-full items-center space-x-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your question here..."
            disabled={isTyping}
            className="flex-1"
          />
          <Button 
            onClick={handleSend} 
            disabled={isTyping || inputValue.trim() === ""}
            className="bg-circa-green hover:bg-circa-green-dark"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
