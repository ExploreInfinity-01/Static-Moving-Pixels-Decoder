import { createCanvasRecorder } from "./recorder.js";

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
    canvas.width = previewCanvas.width = video.videoWidth;
    canvas.height = previewCanvas.height = video.videoHeight;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    oldData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    if(record) recorder.start(1000 / recordingFrameRate);
    decode();
})

video.addEventListener('ended', () => {
    if(record) recorder.stop();
});

const movingColor = [0, 0, 0];
const staticColor = [255, 255, 255];
const preview = true;

let oldData;
function decode() {
    const { width, height } = canvas;

    if(preview) previewCtx.drawImage(video, 0, 0);
    ctx.drawImage(video, 0, 0);

    const newImageData = ctx.getImageData(0, 0, width, height);
    const { data } = newImageData;

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

    for(let i = 0; i < data.length; i+=4) {
        if(data[i] !== oldData[i]) {
            setMovingPixel(i);
        } else {
            setStaticPixel(i)
        }
    }

    const { value: threshold } = document.getElementById('threshold');
    document.getElementById('thresholdValue').textContent = threshold;

    // Fill with threshold
    for(let j = 0; j < height; j++) {
        let min;
        const checked = new Set();
        for(let i = 0; i < width; i++) {
            const index = (i + j * width) * 4;
            if(checked.has(index)) continue;
            if(data[index] == 0) {
                if(typeof(min) !== 'number') {
                    min = i;
                } else if(i - min < threshold) {
                    for(let x = min + 1; x < i + 1; x++) {
                        const index = (x + j * width) * 4;
                        checked.add(index);
                        setMovingPixel(index);
                    }
                    min = i;
                }
            }
        }
    }
    for(let i = 0; i < width; i++) {
        let min;
        const checked = new Set();
        for(let j = 0; j < height; j++) {
            const index = (i + j * width) * 4;
            if(checked.has(index)) continue;
            if(data[index] == 0) {
                if(typeof(min) !== 'number') {
                    min = j;
                } else if(j - min < threshold) {
                    for(let x = min + 1; x < j + 1; x++) {
                        const index = (i + x * width) * 4;
                        checked.add(index);
                        setMovingPixel(index);
                    }
                    min = j;
                }
            }
        }
    }

    oldData = ctx.getImageData(0, 0, width, height).data;
    ctx.putImageData(newImageData, 0, 0);

    video.requestVideoFrameCallback(decode);
}