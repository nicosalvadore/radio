// ============================================================
// Improvement 2: Single <audio> element
// ============================================================
const audio = new Audio();
let isPlaying = false;
let currentlyPlayingButton = null;
let currentStreamName = '';

audio.addEventListener('ended', soundEnded);
audio.addEventListener('error', () => {
    updateStreamName('Stream unavailable', false);
    isPlaying = false;
    if (currentlyPlayingButton) {
        currentlyPlayingButton.classList.remove('playing');
        currentlyPlayingButton = null;
    }
    updatePlayPauseButton();
});

// ============================================================
// Audio functions
// ============================================================
function toggleSound(streamUrl, button, streamName) {
    if (currentlyPlayingButton && currentlyPlayingButton !== button) {
        currentlyPlayingButton.classList.remove('playing');
    }

    audio.src = streamUrl;
    audio.currentTime = 0;

    updateStreamName(streamName, true);

    audio.play().then(() => {
        currentlyPlayingButton = button;
        currentStreamName = streamName;
        button.classList.add('playing');
        isPlaying = true;
        updatePlayPauseButton();
        updateStreamName(streamName, false);
        // Improvement 3: Save selected station
        localStorage.setItem('radio_station', streamUrl);
    }).catch((error) => {
        console.error('Error playing sound:', error);
        updateStreamName('', false);
    });
}

function updatePlayPauseButton() {
    const playPauseButton = document.getElementById('playPauseBtn');
    if (isPlaying || isYoutubePlaying) {
        playPauseButton.innerHTML = '<i class="fa fa-pause"></i>';
    } else {
        playPauseButton.innerHTML = '<i class="fa fa-play"></i>';
    }
}

function updateStreamName(name, isLoading) {
    const streamNameElement = document.getElementById('streamName');
    if (isLoading) {
        streamNameElement.innerHTML = `${name} <i class="fa fa-spinner fa-spin"></i>`;
    } else {
        streamNameElement.textContent = name;
    }
}

function playPauseSound() {
    if (isYoutubePlaying) {
        stopYoutube();
    } else if (isPlaying) {
        audio.pause();
        isPlaying = false;
        updatePlayPauseButton();
        updateStreamName('');
    } else {
        if (audio.src) {
            audio.play().then(() => {
                isPlaying = true;
                updatePlayPauseButton();
                updateStreamName(currentStreamName);
            }).catch(console.error);
        }
    }
}

function soundEnded() {
    if (currentlyPlayingButton) {
        currentlyPlayingButton.classList.remove('playing');
    }
    isPlaying = false;
    updatePlayPauseButton();
    updateStreamName('');
}

// ============================================================
// YouTube player
// ============================================================
const youtubePlayer = document.getElementById('youtubePlayer');
let isYoutubePlaying = false;
let ytPlayer = null;

// Load YouTube IFrame API
const ytScript = document.createElement('script');
ytScript.src = 'https://www.youtube.com/iframe_api';
document.head.appendChild(ytScript);

window.onYouTubeIframeAPIReady = function () {};

function playYoutube(videoId, button, streamName) {
    if (currentlyPlayingButton && currentlyPlayingButton !== button) {
        currentlyPlayingButton.classList.remove('playing');
    }

    audio.pause();
    isPlaying = false;

    if (ytPlayer) {
        ytPlayer.destroy();
        ytPlayer = null;
    }

    const container = document.getElementById('youtubeIframeContainer');
    container.innerHTML = '';
    const div = document.createElement('div');
    container.appendChild(div);

    ytPlayer = new YT.Player(div, {
        videoId,
        playerVars: { autoplay: 1, rel: 0 },
        events: {
            onReady: (e) => e.target.setVolume(volumeSlider.value * 100),
        },
    });

    youtubePlayer.classList.remove('d-none');
    isYoutubePlaying = true;

    currentlyPlayingButton = button;
    currentStreamName = streamName;
    button.classList.add('playing');
    updateStreamName(streamName, false);
    updatePlayPauseButton();
}

function stopYoutube() {
    if (ytPlayer) {
        ytPlayer.destroy();
        ytPlayer = null;
    }
    youtubePlayer.classList.add('d-none');
    isYoutubePlaying = false;
    if (currentlyPlayingButton) {
        currentlyPlayingButton.classList.remove('playing');
        currentlyPlayingButton = null;
    }
    updateStreamName('');
    updatePlayPauseButton();
}

function createButtons(streams) {
    const buttonsContainer = document.getElementById('buttonsContainer');

    streams.forEach((stream) => {
        const button = document.createElement('div');
        button.classList.add('col', 'sound-btn', 'btn', 'btn-dark');

        const img = document.createElement('img');
        img.src = stream.image;
        img.alt = stream.name;
        img.classList.add('img-fluid', 'rounded');

        button.appendChild(img);

        if (stream.type === 'youtube') {
            button.setAttribute('data-youtube', stream.youtubeVideoId);
            button.addEventListener('click', () => {
                playYoutube(stream.youtubeVideoId, button, stream.name);
            });
        } else {
            button.setAttribute('data-stream', stream.stream);
            button.addEventListener('click', () => {
                stopYoutube();
                toggleSound(stream.stream, button, stream.name);
            });
        }

        buttonsContainer.appendChild(button);
    });

}

fetch('streams.json')
    .then(response => response.json())
    .then(streams => {
        createButtons(streams);
    })
    .catch(error => console.error('Error fetching streams:', error));

const playPauseBtn = document.getElementById('playPauseBtn');
const volumeSlider = document.getElementById('volumeSlider');

playPauseBtn.addEventListener('click', playPauseSound);

// Improvement 3: Restore saved volume on page load
const savedVolume = localStorage.getItem('radio_volume');
if (savedVolume !== null) {
    volumeSlider.value = savedVolume;
    audio.volume = parseFloat(savedVolume);
}

volumeSlider.addEventListener('input', (event) => {
    audio.volume = event.target.value;
    if (ytPlayer) {
        ytPlayer.setVolume(event.target.value * 100);
    }
    localStorage.setItem('radio_volume', event.target.value);
});

// ============================================================
// Date/Time
// ============================================================
function updateDateTime() {
    const dateDisplay = document.getElementById('dateDisplay');
    const timeDisplay = document.getElementById('timeDisplay');

    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = now.toLocaleDateString('fr-FR', options);
    const timeString = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    dateDisplay.textContent = dateString;
    timeDisplay.textContent = timeString;
}

setInterval(updateDateTime, 1000);
updateDateTime();

// Tab functionality
document.querySelectorAll('#myTab a').forEach(tab => {
    tab.addEventListener('click', function (e) {
        e.preventDefault();
        new bootstrap.Tab(this).show();
    });
});

// ============================================================
// Utilities used by Timer
// ============================================================
function playAlarm() {
    const alarm = new Audio('media/alarm.mp3');
    alarm.play();
}

function flashScreen() {
    let flashes = 0;
    const flashInterval = setInterval(() => {
        document.body.classList.toggle('flash-red');
        flashes++;
        if (flashes >= 10) {
            clearInterval(flashInterval);
        }
    }, 500);
}

// ============================================================
// Improvement 1: Timer class
// ============================================================
class Timer {
    constructor({ display, startPauseBtn, resetBtn, deleteBtn }) {
        this.display = display;
        this.startPauseBtn = startPauseBtn;
        this.resetBtn = resetBtn;
        this.deleteBtn = deleteBtn || null;
        this.timerValue = 0;
        this.timerInterval = null;
        this._bindEvents();
    }

    _bindEvents() {
        this.display.addEventListener('click', (event) => {
            if (event.target.classList.contains('digit')) {
                let value = parseInt(event.target.textContent, 10);
                value = (value + 1) % 10;
                event.target.textContent = value;
                this._updateTimerValue();
            }
        });

        this.startPauseBtn.addEventListener('click', () => this._toggleStartPause());
        this.resetBtn.addEventListener('click', () => this.reset());

        if (this.deleteBtn) {
            this.deleteBtn.addEventListener('click', () => {
                clearInterval(this.timerInterval);
                this.display.closest('.additional-timer').remove();
                resizeTimers();
                updateGridView();
            });
        }
    }

    _toggleStartPause() {
        if (this.timerInterval) {
            // Currently running — pause by stopping the interval
            clearInterval(this.timerInterval);
            this.timerInterval = null;
            this.startPauseBtn.textContent = 'Start';
        } else {
            // Stopped or paused — start/resume
            if (this.timerValue > 0) {
                this.timerInterval = setInterval(() => this._countDown(), 1000);
                this.startPauseBtn.textContent = 'Pause';
            }
        }
    }

    reset() {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
        this.timerValue = 0;
        this._updateDisplay();
        this.startPauseBtn.textContent = 'Start';
        document.body.classList.remove('flash-red');
    }

    _countDown() {
        if (this.timerValue > 0) {
            this.timerValue--;
            this._updateDisplay();
        } else {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
            playAlarm();
            flashScreen();
            this.startPauseBtn.textContent = 'Start';
        }
    }

    _updateTimerValue() {
        const digits = this.display.querySelectorAll('.digit');
        const minutes = parseInt(digits[0].textContent + digits[1].textContent, 10);
        const seconds = parseInt(digits[2].textContent + digits[3].textContent, 10);
        this.timerValue = minutes * 60 + seconds;
    }

    _updateDisplay() {
        const minutes = String(Math.floor(this.timerValue / 60)).padStart(2, '0');
        const seconds = String(this.timerValue % 60).padStart(2, '0');
        const digits = this.display.querySelectorAll('.digit');
        digits[0].textContent = minutes[0];
        digits[1].textContent = minutes[1];
        digits[2].textContent = seconds[0];
        digits[3].textContent = seconds[1];
    }

    static createAdditional(wrapper) {
        wrapper.innerHTML = `
            <div class="timer-display display-1">
                <span class="digit">0</span><span class="digit">0</span>:<span class="digit">0</span><span class="digit">0</span>
            </div>
            <div class="btn-group">
                <button class="startPauseBtn btn btn-dark timer-control">Start</button>
                <button class="resetBtn btn btn-dark timer-control">Reset</button>
                <button class="deleteBtn btn btn-dark timer-control">Delete</button>
            </div>
        `;
        return new Timer({
            display: wrapper.querySelector('.timer-display'),
            startPauseBtn: wrapper.querySelector('.startPauseBtn'),
            resetBtn: wrapper.querySelector('.resetBtn'),
            deleteBtn: wrapper.querySelector('.deleteBtn'),
        });
    }
}

// Main timer initialization
const mainTimer = new Timer({
    display: document.getElementById('timerDisplay'),
    startPauseBtn: document.getElementById('startPauseBtn'),
    resetBtn: document.getElementById('resetBtn'),
});

// Improvement 3: Restore saved timer value on page load
const savedTimerValue = localStorage.getItem('timer_value');
if (savedTimerValue !== null) {
    mainTimer.timerValue = parseInt(savedTimerValue, 10);
    mainTimer._updateDisplay();
}

// Improvement 3: Save timer value on each digit click
document.getElementById('timerDisplay').addEventListener('click', (event) => {
    if (event.target.classList.contains('digit')) {
        // Timer class listener fires first and updates timerValue; we read it here
        localStorage.setItem('timer_value', mainTimer.timerValue);
    }
});

// Additional timer button
const addTimerBtn = document.getElementById('addTimerBtn');
const additionalTimersContainer = document.getElementById('additionalTimers');

addTimerBtn.addEventListener('click', () => {
    const wrapper = document.createElement('div');
    wrapper.classList.add('additional-timer', 'col-12', 'col-md-4', 'text-center');
    additionalTimersContainer.appendChild(wrapper);
    Timer.createAdditional(wrapper);
    resizeTimers();
    updateGridView();
});

function resizeTimers() {
    const timers = document.querySelectorAll('#timerDisplay, .additional-timer .timer-display');
    const timerCount = timers.length;
    if (timerCount === 1) {
        timers[0].style.fontSize = '15rem';
        return;
    }
    const fontSize = Math.min(10 / timerCount, 10) + 'rem';
    timers.forEach(timer => {
        timer.style.fontSize = fontSize;
    });
}

function updateGridView() {
    const additionalTimers = document.querySelectorAll('.additional-timer');
    if (additionalTimers.length >= 3) {
        additionalTimersContainer.classList.add('grid-view');
    } else {
        additionalTimersContainer.classList.remove('grid-view');
    }
}
