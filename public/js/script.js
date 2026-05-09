// Return the user back to their previous scroll height after redirect.
document.addEventListener("DOMContentLoaded", function(event) { 
  var scrollpos = sessionStorage.getItem('scrollpos');
  if (scrollpos) window.scrollTo(0, scrollpos);
  sessionStorage.removeItem('scrollpos')
});

window.onbeforeunload = function(e) {
    sessionStorage.setItem('scrollpos', window.scrollY);
};

// `Enter` to submit textarea functionality.
const textareas = document.querySelectorAll('textarea');
textareas.forEach(element => {
  element.addEventListener('keydown', (e) => {
    if (e.key === "Enter") {
      // e.preventDefault();  // Stops newlines from being submitted.
      // Somehow submit it...
    }
  })
})