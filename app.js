const { useState, useEffect, useRef } = React;

function loadConversations() {
  try {
    return JSON.parse(localStorage.getItem('conversations')) || [];
  } catch {
    return [];
  }
}

function saveConversations(convs) {
  localStorage.setItem('conversations', JSON.stringify(convs));
}

function Sidebar({ conversations, currentId, onSelect, onNew }) {
  return React.createElement(
    'aside',
    { className: 'w-60 glass bg-gray-800/40 p-4 flex flex-col rounded-r-lg border-r border-gray-700/50' },
    React.createElement(
      'div',
      { className: 'flex items-center mb-4' },
      React.createElement('span', { className: 'flex-1 font-semibold' }, 'Conversations'),
      React.createElement(
        'button',
        { className: 'bg-green-600 px-2 py-1 rounded text-sm', onClick: onNew },
        '+'
      )
    ),
    React.createElement(
      'div',
      { className: 'flex-1 overflow-y-auto space-y-2' },
      conversations.map(c =>
        React.createElement(
          'button',
          {
            key: c.id,
            onClick: () => onSelect(c.id),
            className: `block w-full text-left px-3 py-2 rounded glass ${currentId === c.id ? 'bg-gray-700/60 text-white' : 'bg-gray-700/40 text-gray-300 hover:bg-gray-600/50'}`
          },
          c.title
        )
      )
    )
  );
}

function MessageList({ messages }) {
  const endRef = useRef(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return React.createElement(
    'div',
    { className: 'flex-1 overflow-y-auto p-4 space-y-4' },
    messages.map((m, i) =>
      React.createElement(
        'div',
        { key: i, className: `flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}` },
        React.createElement(
          'div',
          { className: `max-w-lg px-4 py-2 rounded-lg glass ${m.sender === 'user' ? 'bg-green-600/60 text-white' : 'bg-gray-700/60 text-white'}` },
          m.text
        )
      )
    ),
    React.createElement('div', { ref: endRef })
  );
}

function MessageInput({ onSend }) {
  const [value, setValue] = useState('');

  const send = async () => {
    if (!value.trim()) return;
    const q = value;
    setValue('');
    await onSend(q);
  };

  const handleKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return React.createElement(
    'div',
    { className: 'p-4 glass bg-gray-800/40 border-t border-gray-700/50 flex' },
    React.createElement('textarea', {
      className: 'flex-1 resize-none bg-transparent p-2 rounded-l-md focus:outline-none text-gray-200 placeholder-gray-400',
      value,
      placeholder: 'Ask something...',
      onChange: e => setValue(e.target.value),
      onKeyDown: handleKey
    }),
    React.createElement(
      'button',
      { className: 'bg-green-600/70 px-4 text-white rounded-r-md hover:bg-green-500/80', onClick: send },
      'Send'
    )
  );
}

function ChatArea({ conversation, onAddMessage }) {
  const sendQuestion = async question => {
    onAddMessage(conversation.id, 'user', question);
    try {
      const res = await fetch('http://localhost:3000/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });
      const data = await res.json();
      onAddMessage(conversation.id, 'ai', data.answer || 'No response');
    } catch {
      onAddMessage(conversation.id, 'ai', 'Error contacting server.');
    }
  };

  return React.createElement(
    'div',
    { className: 'flex-1 flex flex-col' },
    React.createElement(
      'header',
      { className: 'p-4 glass bg-gray-800/40 border-b border-gray-700/50 font-semibold' },
      conversation.title
    ),
    React.createElement(MessageList, { messages: conversation.messages }),
    React.createElement(MessageInput, { onSend: sendQuestion })
  );
}

function App() {
  const [conversations, setConversationsState] = useState([]);
  const [currentId, setCurrentId] = useState(null);

  useEffect(() => {
    const convs = loadConversations();
    setConversationsState(convs);
    if (convs.length) setCurrentId(convs[0].id);
  }, []);

  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  const createConversation = () => {
    const newId = Date.now().toString();
    setConversationsState(convs => {
      const newConv = { id: newId, title: `Chat ${convs.length + 1}`, messages: [] };
      return [newConv, ...convs];
    });
    setCurrentId(newId);
  };

  const selectConversation = id => setCurrentId(id);

  const addMessage = (id, sender, text) => {
    setConversationsState(convs =>
      convs.map(c =>
        c.id === id ? { ...c, messages: [...c.messages, { sender, text }] } : c
      )
    );
  };

  const current = conversations.find(c => c.id === currentId);

  return React.createElement(
    'div',
    { className: 'flex h-full gap-4 p-4' },
    React.createElement(Sidebar, { conversations, currentId, onSelect: selectConversation, onNew: createConversation }),
    current ? React.createElement(ChatArea, { conversation: current, onAddMessage: addMessage }) : React.createElement('div', { className: 'flex-1 flex items-center justify-center text-gray-400' }, 'No conversation selected.')
  );
}

ReactDOM.render(React.createElement(App), document.getElementById('root'));
