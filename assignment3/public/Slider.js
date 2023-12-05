export let direction = 1;
export let speed = getRandomSpeed();

export function moveSlider() {
    const sliderContainer = document.querySelector('.slider-container');
    const slider = document.getElementById('slider');

    if (!slider || !sliderContainer) {
        console.log('Slider or slider container not found');
        return;
    }
    const sliderPosition = slider.offsetLeft;
    const containerWidth = sliderContainer.offsetWidth;
    const sliderWidth = slider.offsetWidth;

    if (sliderPosition >= containerWidth - sliderWidth || sliderPosition <= 0) {
        direction *= -1;
    }

    const newPosition = Math.max(0, Math.min(containerWidth - sliderWidth, sliderPosition + direction * speed));
    slider.style.left = newPosition + 'px';
}

function getRandomSpeed() {
    return (Math.random() + 0.1) * 13;
}

export function changeSpeed() {
    speed = getRandomSpeed();
}
