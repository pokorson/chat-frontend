import {render, h} from 'preact';
import { useState, useEffect } from 'preact/hooks';
import {login, getMessages, sendMessage, checkForUpdate} from './api';

const App = () => {
  const [user, setUser] = useState("");
  const [messages, setMessages] = useState([]);
  const [lastEtag, setLastEtag] = useState("")

  useEffect(() => {
    getMessages().then(response => {
      setLastEtag(response.headers.ETag)
      setMessages(response.data);
    })
    setInterval(() => {
      checkForUpdate().then(response => {
        const newEtag = response.headers.ETag;
        if( newEtag !== lastEtag) {
          getMessages().then(response => {
            setLastEtag(response.headers.ETag)
            setMessages([...messages, ...response.data]);
          })
        }
      })
    }, 1000)
  }, [])

  const handleLogin = (nick) => {
    login(nick).then(response => {
      const userData = response.data;
      setUser(userData);
    })
  }

  return (
    <div>
      <h1>Nodeschool chat</h1>
      {!user && (<LoginForm onLogin={handleLogin} />)}
      {user && <Chat messages={messages} user={user} setMessages={setMessages} />}
    </div>
  )
}

const LoginForm = ({onLogin}) => {
  const [loginInput, setLogin] = useState("")
  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(loginInput)
  }
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>Nick:</label>
        <input onChange={(e) => setLogin(e.target.value)} value={loginInput} />
        <input type="submit" value="Enter chat" />
      </form>
    </div>
  )
}

const Chat = ({user, messages, setMessages}) => {
  const [messageInput, setMessageInput] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(messageInput, user.login).then((response) => {
      const messageResponse = response.data;
      setMessages([...messages, messageResponse])
      setMessageInput("");
    })
  }
  return (
    <div>
      <h2>Chat</h2>
      <h4>Hello {user.login}</h4>
      <div>
        messages:
        {messages.map(message => {
          return (
            <div>
              <strong>{message.sentBy}</strong> napisał: {message.body}
            </div>
          )
        })}
      </div>
      <form onSubmit={handleSubmit}>
        <textarea onChange={(e) => setMessageInput(e.target.value)} value={messageInput} placeholder="Type your message here..." />
        <input type="submit" value="send message" />
      </form>
    </div>
  )
}

render(<App />, document.getElementById('app'));