import { hexToRgb } from "./utils.js";

const options = {
    fillThreshold: 5,
    colorChange: 0.2,
    movingColor: [0, 0, 0], 
    staticColor: [255, 255, 255], 
};

const thresholdInput = document.getElementById('threshold');
const thresholdValueShower = document.getElementById('thresholdValue');
thresholdInput.addEventListener('input', ({ target }) => {
    const { value } = target;
    options.fillThreshold = thresholdValueShower.textContent = Number(value);
});

const colorChangeInput = document.getElementById('colorChange');
const colorChangeValueShower = document.getElementById('colorChangeValue');
colorChangeInput.addEventListener('input', ({ target }) => {
    const { value } = target;
    options.colorChange = colorChangeValueShower.textContent = Number(value);
});

const movingColorInput = document.getElementById('movingColor');
const movingColorValueShower = document.getElementById('movingColorValue');
movingColorInput.addEventListener('input', ({ target }) => {
    const { value } = target;
    const color = hexToRgb(value);
    options.movingColor[0] = color.r;
    options.movingColor[1] = color.g;
    options.movingColor[2] = color.b;
    movingColorValueShower.textContent = color.string;
});

const staticColorInput = document.getElementById('staticColor');
const staticColorValueShower = document.getElementById('staticColorValue');
staticColorInput.addEventListener('input', ({ target }) => {
    const { value } = target;
    const color = hexToRgb(value);
    options.staticColor[0] = color.r;
    options.staticColor[1] = color.g;
    options.staticColor[2] = color.b;
    staticColorValueShower.textContent = color.string;
});

export default options;