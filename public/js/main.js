document.addEventListener('DOMContentLoaded', () => {
    const messageElement = document.getElementById('message');
    if (messageElement) {
        messageElement.textContent = 'JavaScript is loaded and executed successfully! This message was changed by public/js/main.js.';
        messageElement.style.color = 'darkblue';
    }

    console.log('Static JavaScript file (main.js) loaded.');
});
