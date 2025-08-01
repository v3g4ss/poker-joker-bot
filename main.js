const chatBox = document.getElementById('chatBox');
const input = document.getElementById('userInput');
const button = document.getElementById('sendButton');
const STORAGE_KEY = 'pokerjoker_chatlog';

if (chatBox && input && button) {
  // 🔁 Chatverlauf beim Start laden
  loadChatFromStorage();

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      button.click();
    }
  });

  button.addEventListener('click', () => {
    const message = input.value.trim();
    if (!message) return;

    appendMessage('user', message);
    input.value = '';
    input.focus();

    sendToBot(message);

    if (message.toLowerCase().includes('witz')) {
      showBotOptions(['Fun Fact', 'Etwas anderes']);
    }
  });

  function sendToBot(message) {
    fetch('http://localhost:3001/api/pokerjoker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    })
      .then(res => res.json())
      .then(data => {
        const reply = data.reply || '❌ Keine Antwort vom Bot erhalten.';
        appendMessage('bot', reply);
      })
      .catch(err => {
        console.error('Fehler bei der Bot-Kommunikation:', err);
        appendMessage('bot', '🛑 Ups... da lief was schief.');
      });
  }

  function appendMessage(sender, text) {
    const msg = document.createElement('div');
    msg.classList.add('message', sender);
    msg.innerHTML = `<strong>${sender === 'bot' ? '🤖 Poker Joker' : '🧑‍💻 Du'}:</strong><br>${text}`;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;

    // 💾 In localStorage speichern
    saveMessageToStorage(sender, text);
  }

  function saveMessageToStorage(sender, text) {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    existing.push({ sender, text });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  }

  function loadChatFromStorage() {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved)) {
      saved.forEach(msg => appendMessage(msg.sender, msg.text));
    }
  }

} else {
  console.error('❌ DOM-Elemente nicht gefunden! Checke deine IDs in index.html');
}

// 🔴 Chatverlauf löschen mit Bestätigung (immer aktiv!)
const clearBtn = document.getElementById('clearChatButton');
if (clearBtn) {
  clearBtn.addEventListener('click', () => {
    const sicher = confirm('Willst du den gesamten Chatverlauf wirklich löschen?');
    if (sicher) {
      localStorage.removeItem(STORAGE_KEY);
      location.reload();
    }
  });
}
