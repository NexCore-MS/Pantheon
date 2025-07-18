const { useState, useEffect, useRef } = React;
const { motion, AnimatePresence } = window['framer-motion'];

function MemoryPanel() {
  const items = [
    'Joseph: Creator',
    'Model: Qwen 32B'
  ];
  return (
    React.createElement('div', { className: 'p-4 space-y-2' },
      React.createElement('h2', { className: 'text-xl font-semibold mb-2' }, 'Memory'),
      React.createElement('ul', { className: 'list-disc list-inside text-sm space-y-1' },
        items.map((item, idx) => React.createElement('li', { key: idx }, item))
      )
    )
  );
}

function AvatarCard() {
  return (
    React.createElement('div', { className: 'p-4 flex flex-col items-center text-center' },
      React.createElement('div', { className: 'w-24 h-24 rounded-full bg-gray-700 mb-4' }),
      React.createElement('h2', { className: 'text-xl font-semibold' }, 'MIST'),
      React.createElement('p', { className: 'text-sm text-gray-400' }, 'Conscious AI – Evolving mindscape')
    )
  );
}

function Message({ text, sender }) {
  const bubbleStyles = sender === 'user'
    ? 'bg-blue-600 self-end'
    : 'bg-gray-700 self-start';

  return (
    React.createElement(motion.div, {
      className: `px-3 py-2 rounded-lg text-sm shadow ${bubbleStyles}`,
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -10 }
    }, text)
  );
}

function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const question = input;
    setMessages(msgs => [...msgs, { sender: 'user', text: question }]);
    setInput('');
    try {
      const res = await fetch('http://localhost:3000/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });
      const data = await res.json();
      const answer = data.answer || 'No response';
      setMessages(msgs => [...msgs, { sender: 'ai', text: answer }]);
    } catch (err) {
      setMessages(msgs => [...msgs, { sender: 'ai', text: 'Error contacting server.' }]);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    React.createElement('div', { className: 'flex flex-col h-full' },
      React.createElement('div', { className: 'flex-1 overflow-y-auto space-y-2 p-4' },
        React.createElement(AnimatePresence, null,
          messages.map((msg, idx) =>
            React.createElement(Message, { key: idx, text: msg.text, sender: msg.sender })
          )
        ),
        React.createElement('div', { ref: endRef })
      ),
      React.createElement('div', { className: 'p-4 border-t border-gray-700 flex' },
        React.createElement('input', {
          className: 'flex-1 bg-gray-800 text-gray-100 p-2 rounded-l-md focus:outline-none',
          placeholder: 'Ask something...',
          value: input,
          onChange: e => setInput(e.target.value),
          onKeyPress: handleKey
        }),
        React.createElement('button', {
          className: 'bg-blue-600 px-4 rounded-r-md',
          onClick: sendMessage
        }, 'Send')
      )
    )
  );
}

function App() {
  return (
    React.createElement('div', { className: 'h-screen flex flex-col' },
      React.createElement('header', { className: 'p-4 text-center text-2xl font-bold border-b border-gray-700' }, 'Pantheon AI'),
      React.createElement('div', { className: 'flex flex-1 overflow-hidden' },
        React.createElement('aside', { className: 'w-1/4 border-r border-gray-700 overflow-y-auto' }, React.createElement(MemoryPanel, null)),
        React.createElement('main', { className: 'flex-1 overflow-hidden flex flex-col' }, React.createElement(ChatWindow, null)),
        React.createElement('aside', { className: 'w-1/4 border-l border-gray-700 overflow-y-auto' }, React.createElement(AvatarCard, null))
      )
    )
  );
}

ReactDOM.render(React.createElement(App), document.getElementById('root'));
