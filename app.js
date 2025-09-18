const toggleBtn = document.getElementById("modeToggle");

  toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    // Update button text dynamically
    if (document.body.classList.contains("dark-mode")) {
      toggleBtn.textContent = "☀️ Light Mode"; // now in dark mode
    } else {
      toggleBtn.textContent = "🌙 Dark Mode";  // back to light mode
    }
  });

  // Toggle nav on hamburger click
    const hamburger = document.getElementById("hamburger");
    const navLinks = document.getElementById("navLinks");

    hamburger.addEventListener("click", () => {
      navLinks.classList.toggle("active");
    });