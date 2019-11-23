import {render, h} from 'preact';
import { useState, useEffect } from 'preact/hooks';
import {login, getMessages, sendMessage, checkForUpdate} from './api';

const App = () => {
  const [user, setUser] = useState("");
  const [messages, setMessages] = useState([]);
  const [lastEtag, setLastEtag] = useState("")

  const checkForMessages = (etag) => {
    setTimeout(() => {
      checkForUpdate().then(response => {
        const newEtag = response.headers.etag;
        if( newEtag !== etag) {
          getMessages().then(response => {
            setLastEtag(response.headers.etag)
            setMessages(response.data);
            checkForMessages(response.headers.etag)
          })
        } else {
          checkForMessages(newEtag)
        }
      })
    }, 4000);
  }

  useEffect(() => {
    getMessages().then(response => {
      setLastEtag(response.headers.etag)
      setMessages(response.data);
      checkForMessages(response.headers.etag);
    })
  }, [lastEtag])

  const handleLogin = (nick) => {
    login(nick).then(response => {
      const userData = response.data;
      setUser(userData);
    })
  }

  return (
    <div>
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
    <div className="loginForm">
      <h1>Nodeschool chat</h1>
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
    <div className="chat">
      <div>

      <h1>Nodeschool chat</h1>
      <h4>Hello {user.login}</h4>
      </div>
      <div>

      <div>
        {messages.map(message => {
          return (
            <div>
              <strong>{message.sentBy}</strong> napisał: {message.body}
            </div>
          )
        })}
      </div>
      <form onSubmit={handleSubmit}>
        <textarea className="messageInput" onChange={(e) => setMessageInput(e.target.value)} value={messageInput} placeholder="Type your message here..." />
        <input type="submit" value="send message" />
      </form>
      </div>
    </div>
  )
}

render(<App />, document.getElementById('app'));