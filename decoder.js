import { createCanvasRecorder } from "./recorder.js";
import options from "./options.js";
import { lerp } from "./utils.js";

const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });

const previewCanvas = document.getElementById('previewCanvas');
const previewCtx = previewCanvas.getContext('2d', { willReadFrequently: true });

let pause = false;
window.addEventListener('keydown', ({key}) => {
    if(key === ' ') {
        pause = !pause;
        pause ? video.pause() : video.play();
    } else if(key === 's') {
        const url = canvas.toDataURL();
        const a = document.createElement('a');
        a.href = url;
        a.download = 'screenshot';
        a.click();
    }
})

const video = document.createElement('video');
video.src = 'static.webm';
video.muted = true;
video.play();

const record = false;
const recordingFrameRate = 30;
const recorder = createCanvasRecorder(canvas);

video.addEventListener('loadeddata', () => {
    const { videoWidth: width, videoHeight: height } = video;
    canvas.width = previewCanvas.width = width;
    canvas.height = previewCanvas.height = height;
    pixelArrayLen = width * height * 4;
    oldData = prevFrame = new Uint8ClampedArray(pixelArrayLen).fill(255);
    if(record) recorder.start(1000 / recordingFrameRate);
    decode();
})

video.addEventListener('ended', () => {
    if(record) recorder.stop();
});

const { movingColor, staticColor } = options;
const preview = true;

let oldData, prevFrame, pixelArrayLen;
function decode() {
    const { width, height } = canvas;
    const { fillThreshold: threshold, colorChange } = options;

    if(preview) previewCtx.drawImage(video, 0, 0);
    ctx.drawImage(video, 0, 0);

    const newImageData = ctx.getImageData(0, 0, width, height);
    const { data: newData } = newImageData;

    const data = new Uint8ClampedArray(pixelArrayLen).fill(255);

    const setMovingPixel = (index) => {
        data[index] = movingColor[0];
        data[index+1] = movingColor[1];
        data[index+2] = movingColor[2];
    }
    const setStaticPixel = (index) => {
        data[index] = staticColor[0];
        data[index+1] = staticColor[1];
        data[index+2] = staticColor[2];
    }

    let movingPixels = 0;
    let staticPixels = 0;
    for(let i = 0; i < data.length; i+=4) {
        if(newData[i] !== oldData[i]) {
            setMovingPixel(i);
            movingPixels++;
        } else {
            setStaticPixel(i)
            staticPixels++;
        }
    }

    // const fillArray = new Uint8ClampedArray(pixelArrayLen).fill(255);

    // Fill with threshold
    function fill({color, setColorFunction}) {
        const checkColor = (index) => {
            return ( data[index] === color[0] &&
                     data[index+1] === color[1] &&
                     data[index+2] === color[2] )
        }

        // This array is for testing
        // const fillDataArray = (index) => {
        //     fillArray[index] = color[0];
        //     fillArray[index+1] = color[1];
        //     fillArray[index+2] = color[2];
        // }

        const fill = (i, j) => {
            for(let x = i-1; x < i+2; x++) {
                if(x < 0 || x >= width) continue;
                for(let y = j-1; y < j+2; y++) {
                    if(y < 0 || y >= height) continue;
                    const index = (x + y * width) * 4;
                    setColorFunction(index);
                    // fillDataArray(index);
                }
            }
        }

        // Horizontal Fill
        for(let j = 0; j < height; j++) {
            let min;
            const checked = new Set();
            for(let i = 0; i < width; i++) {
                const index = (i + j * width) * 4;
                if(checked.has(index)) continue;
                if(checkColor(index)) {
                    if(typeof(min) !== 'number') {
                        min = i;
                    } else if(i - min < threshold) {
                        for(let x = min + 1; x < i; x++) {
                            const index = (x + j * width) * 4;
                            checked.add(index);
                            setColorFunction(index);
                            fill(x, j);
                        }
                        min = null;
                    }
                }
            }
        }

        // Vertical Fill
        for(let i = 0; i < width; i++) {
            let min;
            const checked = new Set();
            for(let j = 0; j < height; j++) {
                const index = (i + j * width) * 4;
                if(checked.has(index)) continue;
                if(checkColor(index)) {
                    if(typeof(min) !== 'number') {
                        min = j;
                    } else if(j - min < threshold) {
                        for(let x = min + 1; x < j; x++) {
                            const index = (i + x * width) * 4;
                            checked.add(index);
                            setColorFunction(index);
                            fill(i, x);
                        }
                        min = null;
                    }
                }
            }
        }
    }

    if(threshold > 0) {
        fill( movingPixels < staticPixels ? 
             { color: movingColor, setColorFunction: setMovingPixel } : 
             { color: staticColor, setColorFunction: setStaticPixel });
    }

    oldData = ctx.getImageData(0, 0, width, height).data;

    const convertionRate = colorChange;
    const convertedData = new Uint8ClampedArray(pixelArrayLen).fill(255);
    for(let i = 0; i < data.length; i+=4) {
        convertedData[i] = lerp(prevFrame[i], data[i], convertionRate);
        convertedData[i+1] = lerp(prevFrame[i+1], data[i+1], convertionRate);
        convertedData[i+2] = lerp(prevFrame[i+2], data[i+2], convertionRate);
    }
    prevFrame = convertedData;

    ctx.putImageData(new ImageData(convertedData, width, height), 0, 0);

    video.requestVideoFrameCallback(decode);
}