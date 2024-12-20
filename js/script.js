document.addEventListener('DOMContentLoaded', () => {
    const aboutSection = document.getElementById('about');
    const aboutLink = document.querySelector('a[href="#about"]');
    const toggleSwitch = document.getElementById('toggle-switch');
    const toggleIcon = document.getElementById('toggle-icon');
    
    // Close about section when clicking outside
    document.addEventListener('click', (e) => {
        if (!aboutSection.contains(e.target) && e.target !== aboutLink) {
            aboutSection.classList.remove('visible');
        }
    });

    // Toggle about section
    aboutLink.addEventListener('click', (e) => {
        e.preventDefault();
        aboutSection.classList.toggle('visible');
    });

    // Toggle day/night mode
    toggleSwitch.addEventListener('change', () => {
        document.body.classList.toggle('dark-mode');
        // Change icon based on mode
        if (document.body.classList.contains('dark-mode')) {
            toggleIcon.classList.remove('fa-sun');
            toggleIcon.classList.add('fa-moon');
        } else {
            toggleIcon.classList.remove('fa-moon');
            toggleIcon.classList.add('fa-sun');
        }
    });

    // Optional: Set initial theme based on saved preference
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        toggleSwitch.checked = true;
        toggleIcon.classList.remove('fa-sun');
        toggleIcon.classList.add('fa-moon');
    }

    // Save theme preference
    toggleSwitch.addEventListener('change', () => {
        if (toggleSwitch.checked) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
    });
});
