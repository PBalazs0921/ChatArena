import { useState, useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";

interface Message {
  user: string;
  text: string;
}

function App() {
  const [username, setUsername] = useState("");
  const [roomName, setRoomName] = useState("");
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [joined, setJoined] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5196/chathub")
      .withAutomaticReconnect()
      .build();

    connection.on("ReceiveMessage", (user: string, text: string) => {
      setMessages((prev) => [...prev, { user, text }]);
    });

    connection.on("UserTyping", (user: string) => {
      setTypingUsers((prev) => (prev.includes(user) ? prev : [...prev, user]));
    });

    connection.on("UserStoppedTyping", (user: string) => {
      setTypingUsers((prev) => prev.filter((u) => u !== user));
    });

    connection.start().then(() => console.log("SignalR connected"));
    connectionRef.current = connection;

    return () => {
      connection.stop();
    };
  }, []);

  const joinRoom = async () => {
    await connectionRef.current?.invoke("JoinRoom", roomName);
    setJoined(true);
  };

  const handleTyping = async () => {
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      await connectionRef.current?.invoke("StartTyping", roomName, username);
    }

    // reset the timer on every keystroke
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(async () => {
      isTypingRef.current = false;
      await connectionRef.current?.invoke("StopTyping", roomName, username);
    }, 1500); // stop typing after 1.5s of inactivity
  };

  const sendMessage = async () => {
    if (!messageText.trim()) return;
    await connectionRef.current?.invoke(
      "SendMessage",
      roomName,
      username,
      messageText,
    );
    setMessageText("");

    // clear typing indicator on send
    isTypingRef.current = false;
    await connectionRef.current?.invoke("StopTyping", roomName, username);
  };

  const typingText =
    typingUsers.length === 0
      ? ""
      : typingUsers.length === 1
        ? `${typingUsers[0]} is typing...`
        : `${typingUsers.join(", ")} are typing...`;

  if (!joined) {
    return (
      <div>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Your name"
        />
        <input
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="Room name"
        />
        <button onClick={joinRoom}>Join</button>
      </div>
    );
  }

  return (
    <div>
      {messages.map((msg, i) => (
        <div key={i}>
          <strong>{msg.user}:</strong> {msg.text}
        </div>
      ))}
      <div style={{ height: "20px", fontStyle: "italic", color: "gray" }}>
        {typingText}
      </div>
      <input
        value={messageText}
        onChange={(e) => {
          setMessageText(e.target.value);
          handleTyping();
        }}
        placeholder="Message"
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default App;
