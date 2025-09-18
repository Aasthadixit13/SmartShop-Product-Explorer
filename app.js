//  dark and light mode
    const toggleBtn = document.getElementById("modeToggle");

    toggleBtn.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");

      // change button text dynamically
      if (document.body.classList.contains("dark-mode")) {
        toggleBtn.textContent =" 🌙 Dark Mode";
      } else {
        toggleBtn.textContent = "☀️ Light Mode";
      }
    });
// on phonw viwe header code
    const hamburger = document.getElementById('hamburger');
      const navLinks = document.getElementById('navLinks');

      hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
      });

