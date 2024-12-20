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
    });

    // Save theme preference
    toggleSwitch.addEventListener('change', () => {
        if (toggleSwitch.checked) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
    });

    // Update JavaScript for inline SVG toggle functionality
    toggleIcon.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        // Change icon based on mode
        if (document.body.classList.contains('dark-mode')) {
            toggleIcon.querySelector('.day-icon').style.display = 'none';
            toggleIcon.querySelector('.night-icon').style.display = 'block';
        } else {
            toggleIcon.querySelector('.day-icon').style.display = 'block';
            toggleIcon.querySelector('.night-icon').style.display = 'none';
        }
    });

    // Optional: Set initial theme based on saved preference
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        toggleIcon.querySelector('.day-icon').style.display = 'none';
        toggleIcon.querySelector('.night-icon').style.display = 'block';
    }
});
