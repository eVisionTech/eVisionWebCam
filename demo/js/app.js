const webcam = new Webcam(webcamVideo, 'user');

const displayError = (err = '') => {
    if (err != '') {
        errorMsg.childNodes[1].innerHTML = err;
    }
    errorMsg.classList.remove("d-none");
}

const cameraStarted = () => {
    errorMsg.classList.add("d-none");
    webcamCaption.innerHTML = "on";
    webcamControl.classList.remove("webcam-off");
    webcamControl.classList.add("webcam-on");
    document.querySelector(".webcam-container").classList.remove("d-none");
    if (webcam.webcamList.length > 1) {
        cameraFlip.classList.remove('d-none');
    }
    window.scrollTo(0, 0);
    document.querySelector('body').style['overflow-y'] = 'hidden';
}

const cameraStopped = () => {
    errorMsg.classList.add("d-none");
    webcamControl.classList.remove("webcam-on");
    webcamControl.classList.add("webcam-off");
    cameraFlip.classList.add('d-none');
    webcamCaption.innerHTML = "Click to Start Camera";
    document.querySelector(".webcam-container").classList.add("d-none");
    document.querySelector('.md-modal').classList.remove('md-show');
}

const removeCapture = () => {
    webcamControl.classList.remove('d-none');
    cameraControls.classList.remove('d-none');
    exitApp.classList.add('d-none');
    downloadVideo.classList.add('d-none');
}

webcamSwitch.onchange = async function () {
    if (this.checked) {
        try {
            await webcam.start();
            cameraStarted();
            console.log("webcam started");
            startRec.classList.remove('d-none');
            exitApp.classList.remove('d-none');
            document.querySelector('.md-modal').classList.add("md-show");
        } catch (err) {
            displayError(err.toString(err));
        };
    }
    else {
        cameraStopped();
        webcam.stop();
        console.log("webcam stopped");
    }
}

cameraFlip.onclick = () => {
    webcam.flip();
    webcam.start();
};

closeError.onclick = () => {
    webcamSwitch.checked = false;
    webcamSwitch.onchange();
};

startRec.onclick = () => {
    const err = webcam.startRecord();

    if (err)
        displayError(err.toString(err));

    stopRec.classList.remove('d-none');
    startRec.classList.add('d-none');
};

stopRec.onclick = () => {
    const record = webcam.stopRecord();

    if (!record?.chunks)
        return displayError(record.toString(err));

    const blob = new Blob(record.chunks, {
        type: record.mimeType
    })

    downloadVideo.href = URL.createObjectURL(blob);
    downloadVideo.download = `new-record-${Date.now()}.${blob.type.split('/').at(-1).split(';').at(0)}`;
    stopRec.classList.add('d-none');
    downloadVideo.classList.remove('d-none');
};

downloadVideo.onclick = () => {
    startRec.classList.remove('d-none');
    downloadVideo.classList.add('d-none');
};

exitApp.onclick = () => {
    removeCapture();
    webcamSwitch.checked = false;
    webcamSwitch.onchange();
};