/*
Return the user back to their previous scroll height after redirect.
 > It gets disorienting and frustrating otherwise.
*/
document.addEventListener("DOMContentLoaded", (event) => { 
  const scrollpos = sessionStorage.getItem('scrollpos');
  if (scrollpos) window.scrollTo(0, scrollpos);
  sessionStorage.removeItem('scrollpos');
});

window.onbeforeunload = (e) => sessionStorage.setItem('scrollpos', window.scrollY);


const list = document.getElementById("item-list");
const addItemLi = document.getElementById('add-item');
const addItemBtn = addItemLi.querySelector('button');
const addItemInput = addItemLi.querySelector('input');

async function addNewItem () {
  const inputText = addItemInput.value.trim();
  
  if (!inputText) {
    addItemInput.value = "";
    return;
  }

  try {
    const res = await fetch('/api/items', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: inputText })
    });
  
    if (!res.ok) {
      const { error } = await res.json();
      showError(error);
      return;
    }
    
    const newItem = await res.json();
    const newLi = createTodoItem(newItem);
    list.insertBefore(newLi, addItemLi);
    addItemInput.value = "";
  } catch (err) {
    showError("Something went wrong, please try again");
  }
}

// add-item input KEYDOWN event listener
addItemInput.addEventListener('keydown', async e => {
  if (e.key === 'Enter') await addNewItem();
});

// add-item button CLICK event listener
addItemBtn.addEventListener('click', async e => {
  await addNewItem();
});


function createTodoItem(item) {
  // Construct a new list item
  const li = document.createElement('li');
  li.className = 'item';
  li.innerHTML = `
    <div class="item-content">
      <input type="checkbox" class="del-checkbox" aria-label="delete item"/>
    </div>
    <div class="char-count" hidden></div>
  `
  const textarea = document.createElement('textarea');
  textarea.rows = 1;
  textarea.maxLength = 100;
  textarea.setAttribute('aria-label', 'edit item');
  textarea.value = item.text;

  li.querySelector('.item-content').append(textarea);


  const checkbox = li.querySelector('.del-checkbox');

  // checkbox CHANGE event listener
  checkbox.addEventListener('change', async e => {
    try {
      const res = await fetch(`/api/items/${item.id}`, { method: "DELETE" });
      if (!res.ok) {
        const { error } = await res.json();
        showError(error);
        checkbox.checked = false;
        return;
      }
      li.remove();
    } catch (err) {
      checkbox.checked = false;
      showError('Something went wrong, please try again');
    }
  });

  const charCount = li.querySelector('.char-count');
  let cachedText;  // Needed for 'Esc`-to-cancel functionality
  const getCharCount = () => textarea.value.length;

  // textarea KEYDOWN event listener
  textarea.addEventListener('keydown', e => {
    switch (e.key) {
      // Prevent newlines
      case "Enter":
        e.preventDefault();
        document.activeElement.blur();
        break;
      // Cancel any changes to the text content
      case "Escape":
        textarea.value = cachedText;
        document.activeElement.blur();
        break;
    }
  });

  // textarea FOCUS event listener
  textarea.addEventListener('focus', () => {
    cachedText = textarea.value;
    charCount.removeAttribute("hidden");
    charCount.innerHTML = `${getCharCount()}/100`;
  });

  // textarea BLUR event listener
  textarea.addEventListener('blur', async () => {
    const finalText = textarea.value.trim();
    charCount.setAttribute("hidden", "");

    if (!finalText || finalText === cachedText) {
      textarea.value = cachedText;
      cachedText = undefined;
      return;
    }

    try {
      const res = await fetch(`/api/items/${item.id}`, {
        method: "PUT",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: finalText })
      });
  
      if (!res.ok) {
        textarea.value = cachedText;
        const { error } = await res.json();
        showError(error);
      }
    } catch (err) {
      showError("Something went wrong, please try again");
    }

    cachedText = undefined;
  });

  // textarea INPUT event listener
  textarea.addEventListener('input', () => {
    charCount.innerHTML = `${getCharCount()}/100`;
  });

  return li;
}

function showError(message) {
  const errorDiv = document.getElementById('error-message');
  errorDiv.removeAttribute('hidden');
  errorDiv.textContent = message;

  setTimeout(() => {
    errorDiv.setAttribute('hidden', '');
  }, 3000);
}
 
async function loadItems() {
  try {
    const res = await fetch("/api/items", { method: "GET" });
  
    if (!res.ok) {
      const { error } = await res.json();
      showError(error);
      return;
    }
  
    const items = await res.json();
  
    items.forEach(item => {
      const li = createTodoItem(item);
      list.insertBefore(li, addItemLi);
    });
  } catch (err) {
    showError("Something went wrong, please try again");
  }
}

loadItems();
