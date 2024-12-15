document.addEventListener('mousemove', (event) => {
    const pixel = document.createElement('div');
    pixel.classList.add('pixel');

    // Set random color for each crosshair
    const randomColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
    pixel.style.color = randomColor; // Use 'color' property

    // Position the crosshair at the mouse coordinates
    pixel.style.left = `${event.pageX}px`;
    pixel.style.top = `${event.pageY}px`;

    // Append the crosshair to the body
    document.body.appendChild(pixel);

    // Remove the crosshair after the animation ends
    pixel.addEventListener('animationend', () => {
        pixel.remove();
    });
});
