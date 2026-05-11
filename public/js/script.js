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


/*
The functions below help prevent new anonymous functions being created
for every single `<textarea>` element during the `textareas.forEach(...)`
iteration — that's why they're a bit janky.
*/

document.querySelectorAll('textarea').forEach(element => {
  let originalText = "";
  let length = element.value.length;
  const textHasChanged = () => element.value !== originalText;
  const charCountDiv = element.closest('.item').querySelector('.char-count');
  
  /* Adds `Esc` to cancel and `Enter` to submit functionality. */
  element.addEventListener('keydown', e => {
    switch (e.key) {
      // Prevent newlines and submit edited text.
      case "Enter":
        e.preventDefault();
        if (textHasChanged()) {
          element.closest('form').requestSubmit();
          break;
        }
        document.activeElement.blur();
        break;
      // Cancel any changes to the text content
      case "Escape":
        element.value = originalText;
        document.activeElement.blur();
        break;
    }
  });

  element.addEventListener('focus', () => {
    originalText = element.value;
    charCountDiv.removeAttribute("hidden");
    charCountDiv.innerHTML = `${length}/100`
  });
  element.addEventListener('blur', () => {
    if (textHasChanged()) element.closest('form').requestSubmit();
    charCountDiv.setAttribute("hidden", "");
  });
  element.addEventListener('input', () => {
    length = element.value.length;
    charCountDiv.innerHTML = `${length}/100`;
  });
});

/* Delete-item checkbox form submission */
//  > Replaces `this.form.submit()` in the HTML.
document.querySelectorAll('.del-checkbox').forEach(checkbox => {
  checkbox.addEventListener('change', () => checkbox.closest('form').requestSubmit());
});

