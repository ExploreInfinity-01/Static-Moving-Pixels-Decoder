export function createCanvasRecorder(canvas) {
    const stream = canvas.captureStream(30);
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    const chunks = [];
    let recording = false;

    recorder.ondataavailable = e => {
        if(e.data.size > 0) {
            chunks.push(e.data);
        }
    };

    recorder.onstart = () => {
        recording = true;
        console.log('Recording Started');
    }

    recorder.onstop = () => {
        if(recording) {
            console.log('Recording Stopped');
            const blob = new Blob(chunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
    
            const a = document.createElement('a');
            a.href = url;
            a.download = 'recording.webm';
            a.click();

            recording = false;
        }
    }

    return recorder
}