export default class Webcam {
  constructor(webcamElement, facingMode = 'user', canvasElement = null) {
    this._webcamElement = webcamElement;
    this._webcamElement.width = this._webcamElement.width || 640;
    this._webcamElement.height = this._webcamElement.height || video.width * (3 / 4);
    this._facingMode = facingMode;
    this._webcamList = [];
    this._streamList = [];
    this._selectedDeviceId = '';
    this._canvasElement = canvasElement;
    this._mediaRecorder = null;
    this._mediaDataChunks = [];
    this._DEFAULT_RECORD_MIME_TYPE = 'video/webm; codecs=vp9';
    this._DEFAULT_RECORD_TIMESLICE = 250;
  }

  get facingMode() {
    return this._facingMode;
  }

  set facingMode(value) {
    this._facingMode = value;
  }

  get webcamList() {
    return this._webcamList;
  }

  get webcamCount() {
    return this._webcamList.length;
  }

  get selectedDeviceId() {
    return this._selectedDeviceId;
  }

  getVideoInputs(mediaDevices) {
    this._webcamList = mediaDevices.filter(mediaDevice => (mediaDevice.kind === 'videoinput'))

    if (this._webcamList.length == 1)
      this._facingMode = 'user';

    return this._webcamList;
  }

  getMediaConstraints() {
    const videoConstraints = {};
    if (this._selectedDeviceId == '')
      videoConstraints.facingMode = this._facingMode;
    else
      videoConstraints.deviceId = { exact: this._selectedDeviceId };

    const constraints = {
      video: videoConstraints,
      audio: false
    };

    return constraints;
  }

  selectCamera() {
    for (let webcam of this._webcamList) {
      if ((this._facingMode == 'user' && webcam.label.toLowerCase().includes('front'))
        || (this._facingMode == 'enviroment' && webcam.label.toLowerCase().includes('back'))
      ) {
        this._selectedDeviceId = webcam.deviceId;
        break;
      }
    }
  }

  flip() {
    this._facingMode = (this._facingMode == 'user') ? 'enviroment' : 'user';
    this._webcamElement.style.transform = "";
    this.selectCamera();
  }

  async start(startStream = true) {
    return new Promise(async (resolve, reject) => {
      try {
        this.stop();

        const stream = await navigator.mediaDevices.getUserMedia(this.getMediaConstraints());
        this._streamList.push(stream);

        await this.info();
        this.selectCamera();

        if (!startStream)
          return resolve(this._selectedDeviceId);

        await this.stream()
        resolve(this._facingMode);
      }
      catch (error) {
        reject(error);
      };
    });
  }

  async info() {
    return new Promise(async (resolve, reject) => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        this.getVideoInputs(devices);
        resolve(this._webcamList);
      } catch (error) {
        reject(error);
      };
    });
  }

  async stream() {
    return new Promise(async (resolve, reject) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(this.getMediaConstraints());
        this._streamList.push(stream);
        this._webcamElement.srcObject = stream;
        if (this._facingMode == 'user') {
          this._webcamElement.style.transform = "scale(-1,1)";
        }
        this._webcamElement.play();
        resolve(this._facingMode);
      } catch (error) {
        reject(error);
      };
    });
  }

  stop() {
    this._streamList.forEach(stream => {
      stream.getTracks().forEach(track => {
        track.stop();
      });
    });
  }

  snap() {
    if (this._canvasElement == null)
      throw "canvas element is missing";

    this._canvasElement.height = this._webcamElement.scrollHeight;
    this._canvasElement.width = this._webcamElement.scrollWidth;
    let context = this._canvasElement.getContext('2d');
    if (this._facingMode == 'user') {
      context.translate(this._canvasElement.width, 0);
      context.scale(-1, 1);
    }

    context.clearRect(0, 0, this._canvasElement.width, this._canvasElement.height);
    context.drawImage(this._webcamElement, 0, 0, this._canvasElement.width, this._canvasElement.height);
    let data = this._canvasElement.toDataURL('image/png');
    return data;
  }

  startRecording({
    mimeType = this._DEFAULT_RECORD_MIME_TYPE,
    timeslice = this._DEFAULT_RECORD_TIMESLICE,
    ...restOptions
  } = {}) {
    try {
      if (this._mediaRecorder) return;

      this._mediaRecorder = new MediaRecorder(this._webcamElement.srcObject, {
        mimeType: MediaRecorder.isTypeSupported(mimeType)
          ? mimeType
          : MediaRecorder.isTypeSupported('video/webm; codecs=vp9') ? 'video/webm; codecs=vp9'
            : MediaRecorder.isTypeSupported('video/webm') ? 'video/webm'
              : MediaRecorder.isTypeSupported('video/mp4') ? 'video/mp4' : this._DEFAULT_RECORD_MIME_TYPE,
        ...restOptions
      });

      this._mediaRecorder.onerror = ({ error }) => {
        return error
      }

      this._mediaRecorder.ondataavailable = ({ data }) => {
        this._mediaDataChunks.push(data)
      }

      this._mediaRecorder.start(timeslice)

    } catch (error) {
      return error
    }
  }

  stopRecording() {
    try {
      if (!this._mediaRecorder) return;

      this._mediaRecorder.stop();

      const mimeType = this._mediaRecorder.mimeType;
      const chunks = this._mediaDataChunks;

      this._mediaRecorder.ondataavailable = null;
      this._mediaRecorder = null;
      this._mediaDataChunks = [];

      return { chunks, mimeType }

    } catch (error) {
      return error
    }
  }
}