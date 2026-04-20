import React, { useState } from "react";

const Chatbot = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const sendMessage = async () => {
    if (!input) return;

    // Add user message
    setMessages((prev) => [...prev, { sender: "user", text: input }]);

    try {
      const res = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, context: "general" })
      });
      const data = await res.json();

      // Add bot response
      setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Error: Cannot reach chatbot API" }
      ]);
    }

    setInput("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>POS Chatbot</h2>
      <div style={{ border: "1px solid #ccc", padding: "10px", height: "300px", overflowY: "auto", marginBottom: "10px" }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ textAlign: msg.sender === "user" ? "right" : "left" }}>
            <b>{msg.sender === "user" ? "You" : "Bot"}: </b>{msg.text}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        placeholder="Type your message..."
        style={{ width: "80%", padding: "5px" }}
      />
      <button onClick={sendMessage} style={{ padding: "5px 10px", marginLeft: "5px" }}>Send</button>
    </div>
  );
};

export default Chatbot;
