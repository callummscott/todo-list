/* Return the user back to their previous scroll height after redirect. */
document.addEventListener("DOMContentLoaded", function(event) { 
  var scrollpos = sessionStorage.getItem('scrollpos');
  if (scrollpos) window.scrollTo(0, scrollpos);
  sessionStorage.removeItem('scrollpos')
});

window.onbeforeunload = function(e) {
    sessionStorage.setItem('scrollpos', window.scrollY);
};


/* Adds `Esc` to cancel and `Enter` to submit functionality. */
document.querySelectorAll('textarea').forEach(element => {
  let originalText = "";
  element.addEventListener('keydown', (e) => {
    switch (e.key) {
      // Prevent newlines and submit edited text.
      case "Enter":
        e.preventDefault();
        element.closest('form').requestSubmit();
        break;
      // Cancel any changes to the text content
      case "Escape":
        document.activeElement.blur(); 
        // this triggers the `blur` event listener, resetting the text.
        break;
    }
  });
  element.addEventListener('focus', () => {
    originalText = element.value;
  });
  element.addEventListener('blur', () => {
    element.value = originalText;
  })
});

/* Delete item checkbox form submission */
document.querySelectorAll('.item-checkbox').forEach(checkbox => {
  checkbox.addEventListener('change', () => {
    checkbox.closest('form').requestSubmit();
  });
});