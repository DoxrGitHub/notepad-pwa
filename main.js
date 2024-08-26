if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js');
  });
}

const client = new Client();

function exportFileAs() {
  const content = document.getElementById('noteContent').value;
  const blob = new Blob([content], {type: 'text/plain'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'notes.txt';
  link.click();
}

function importFile() {
  const input = document.createElement('input');
  input.type = 'file';
  input.onchange = function() {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      const content = e.target.result;
      const name = prompt('Enter a name for the imported note:', 'New Note');
      if (name && content) {
        saveNote(name, content);
        loadNoteContent("note-" + name)
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

async function saveNote(name, content) {
  try {
    await client.set(`note-${name}`, content);
    loadNotes();
  } catch (error) {
    console.error(error);
    alert('Failed to save note.');
  }
}

// Function to display notes
function loadNotes() {
  client.list().then(keys => {
    const notesList = document.getElementById('notesList');
    notesList.innerHTML = ''; // Clear the list
    keys.forEach(key => {
      if (key.startsWith('note-')) {
        const li = document.createElement('li');
        li.innerHTML = `
          ${key.slice(5)} 
          <button onclick="loadNoteContent('${key}')">Load</button>
          <button onclick="deleteNote('${key}')">Delete</button>
        `;
        notesList.appendChild(li);
      }
    });
  });
}

function loadNoteContent(key) {
  let name = key.slice(5);
  client.get(key).then(content => {
    document.getElementById('noteContent').value = content;
    document.getElementById('noteName').value = name;
  }).catch(error => {
    console.error(error);
  });
}

function deleteNote(key) {
  let name = key.slice(5);
  if (document.getElementById('noteName').value === name) {
    document.getElementById('noteName').value = ''
    document.getElementById('noteContent').value = '';
  }
  client.delete(key).then(() => {
    loadNotes();
  }).catch(error => {
    console.error(error);
    alert('Failed to delete note.');
  });
}

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('noteForm');
  form.addEventListener('submit', function(event) {
    event.preventDefault();
    const name = document.getElementById('noteName').value;
    const content = document.getElementById('noteContent').value;
    saveNote(name, content);
  });

  loadNotes();
});