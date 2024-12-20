document.addEventListener('DOMContentLoaded', () => {
    const aboutSection = document.getElementById('about');
    const aboutLink = document.querySelector('a[href="#about"]');
    const toggleIcon = document.getElementById('toggle-icon');

    // Check if elements exist
    console.log('aboutSection:', aboutSection);
    console.log('aboutLink:', aboutLink);
    console.log('toggleIcon:', toggleIcon);

    // Close about section when clicking outside
    if (aboutSection) {
        document.addEventListener('click', (e) => {
            if (!aboutSection.contains(e.target) && e.target !== aboutLink) {
                aboutSection.classList.remove('visible');
            }
        });
    }

    // Toggle day/night mode
    if (toggleIcon) {
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
    }

    // Optional: Set initial theme based on saved preference
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        if (toggleIcon) {
            toggleIcon.querySelector('.day-icon').style.display = 'none';
            toggleIcon.querySelector('.night-icon').style.display = 'block';
        }
    }
});
