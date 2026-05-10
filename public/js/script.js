/* Return the user back to their previous scroll height after redirect. */
document.addEventListener("DOMContentLoaded", function(event) { 
  var scrollpos = sessionStorage.getItem('scrollpos');
  if (scrollpos) window.scrollTo(0, scrollpos);
  sessionStorage.removeItem('scrollpos')
});

window.onbeforeunload = function(e) {
    sessionStorage.setItem('scrollpos', window.scrollY);
};

/* 
Adds '`Enter` to submit' and '`Esc` to cancel` functionality 
*/
const textareas = document.querySelectorAll('textarea');
textareas.forEach(element => {
  element.addEventListener('keydown', (e) => {
    switch (e.key) {
      case "Enter":
        e.preventDefault();
        element.onsubmit();
        break;
      case "Escape":
        document.activeElement.blur();
        break;
    }
  });

  let originalText = null;  /* Should I do something with `null`? */
  element.addEventListener('focus', () => {
    originalText = element.value;
  });
  element.addEventListener('blur', () => {
    element.value = originalText;
  })
});