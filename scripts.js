// Function to play or stop sounds
function toggleSound(streamUrl, soundId, button, streamName) {
    let sound = document.getElementById(soundId);

    // If the audio element does not exist, create it
    if (!sound) {
        sound = document.createElement('audio');
        sound.id = soundId;
        sound.addEventListener('ended', soundEnded);
        document.body.appendChild(sound);
    }

    // If there is a currently playing sound, pause it, remove its visual indication, and clear its src
    if (currentlyPlayingSound && currentlyPlayingSound !== sound) {
        currentlyPlayingSound.pause();
        currentlyPlayingSound.src = "";
        currentlyPlayingButton.classList.remove('playing');
    }

    // Set the src of the sound to the stream URL
    sound.src = streamUrl;

    // Reset the current time of the sound to the beginning
    sound.currentTime = 0;

    // Show loading spinner
    updateStreamName(streamName, true);

    // Play the selected sound
    sound.play().then(() => {
        currentlyPlayingSound = sound;
        currentlyPlayingButton = button;
        button.classList.add('playing'); // Add visual indication to the button
        isPlaying = true;
        updatePlayPauseButton();
        updateStreamName(streamName, false); // Remove loading spinner
    }).catch((error) => {
        console.error('Error playing sound:', error);
        updateStreamName('', false); // Remove loading spinner
    });
}

// Function to update the play/pause button state based on the current sound state
function updatePlayPauseButton() {
    const playPauseButton = document.getElementById('playPauseBtn');

    if (isPlaying) {
        playPauseButton.innerHTML = '<i class="fa fa-pause"></i>';
    } else {
        playPauseButton.innerHTML = '<i class="fa fa-play"></i>';
    }
}

// Function to update the stream name display
function updateStreamName(name, isLoading) {
    const streamNameElement = document.getElementById('streamName');
    if (isLoading) {
        streamNameElement.innerHTML = `${name} <i class="fa fa-spinner fa-spin"></i>`;
    } else {
        streamNameElement.textContent = name;
    }
}

// Function to handle play/pause button click
function playPauseSound() {
    if (isPlaying) {
        currentlyPlayingSound.pause();
        isPlaying = false;
        updatePlayPauseButton();
        updateStreamName('');
    } else {
        if (currentlyPlayingSound) {
            currentlyPlayingSound.play();
            isPlaying = true;
            updatePlayPauseButton();
            updateStreamName(currentlyPlayingButton ? currentlyPlayingButton.querySelector('img').alt : '');
        }
    }
}

// Function to handle sound ended event
function soundEnded() {
    const button = currentlyPlayingButton;
    if (button) {
        button.classList.remove('playing');
    }
    currentlyPlayingSound = null;
    isPlaying = false;
    updatePlayPauseButton();
    updateStreamName('');
}

// Function to create buttons from streams.json
function createButtons(streams) {
    const buttonsContainer = document.getElementById('buttonsContainer');

    streams.forEach((stream, index) => {
        const soundId = `sound${index + 1}`;

        // Create button element
        const button = document.createElement('div');
        button.classList.add('col', 'sound-btn', 'btn', 'btn-dark');
        button.setAttribute('data-sound', soundId);

        // Create image element
        const img = document.createElement('img');
        img.src = stream.image;
        img.alt = stream.name;
        img.classList.add('img-fluid', 'rounded');

        // Append image to button
        button.appendChild(img);

        // Add event listener to button
        button.addEventListener('click', () => {
            toggleSound(stream.stream, soundId, button, stream.name);
        });

        // Append button to container
        buttonsContainer.appendChild(button);
    });
}

// Fetch streams from streams.json and create buttons
fetch('streams.json')
    .then(response => response.json())
    .then(streams => {
        createButtons(streams);
    })
    .catch(error => console.error('Error fetching streams:', error));

// Set up event listeners for play/pause button
const playPauseBtn = document.getElementById('playPauseBtn');
const volumeSlider = document.getElementById('volumeSlider');
let isPlaying = false; // This tracks the overall play state (whether any sound is playing)
let currentlyPlayingSound = null; // This will track the currently playing sound
let currentlyPlayingButton = null; // This will track the currently playing button

playPauseBtn.addEventListener('click', playPauseSound);

// Set up event listener for volume slider
volumeSlider.addEventListener('input', (event) => {
    if (currentlyPlayingSound) {
        currentlyPlayingSound.volume = event.target.value;
    }
});

// Function to update the date and time display
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

// Update the date and time every second
setInterval(updateDateTime, 1000);

// Initialize the date and time display
updateDateTime();

// Tab functionality
document.querySelectorAll('#myTab a').forEach(tab => {
    tab.addEventListener('click', function (e) {
        e.preventDefault();
        new bootstrap.Tab(this).show();
    });
});

// Timer functionality
let timerInterval;
let timerValue = 0;
let isPaused = false;

const timerDisplay = document.getElementById('timerDisplay');
const startPauseBtn = document.getElementById('startPauseBtn');
const resetBtn = document.getElementById('resetBtn');

timerDisplay.addEventListener('click', (event) => {
    if (event.target.classList.contains('digit')) {
        let value = parseInt(event.target.textContent, 10);
        value = (value + 1) % 10;
        event.target.textContent = value;
        updateTimerValue();
    }
});

startPauseBtn.addEventListener('click', () => {
    if (timerInterval) {
        isPaused = !isPaused;
        startPauseBtn.textContent = isPaused ? 'Start' : 'Pause';
    } else {
        if (timerValue > 0) {
            isPaused = false;
            timerInterval = setInterval(countDown, 1000);
            startPauseBtn.textContent = 'Pause';
        }
    }
});

resetBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    timerInterval = null;
    timerValue = 0;
    updateTimerDisplay();
    startPauseBtn.textContent = 'Start';
    document.body.classList.remove('flash-red'); // Remove flash-red class when reset
});

function updateTimerValue() {
    const digits = timerDisplay.querySelectorAll('.digit');
    const minutes = parseInt(digits[0].textContent + digits[1].textContent, 10);
    const seconds = parseInt(digits[2].textContent + digits[3].textContent, 10);
    timerValue = minutes * 60 + seconds;
}

function updateTimerDisplay() {
    const minutes = String(Math.floor(timerValue / 60)).padStart(2, '0');
    const seconds = String(timerValue % 60).padStart(2, '0');
    const digits = timerDisplay.querySelectorAll('.digit');
    digits[0].textContent = minutes[0];
    digits[1].textContent = minutes[1];
    digits[2].textContent = seconds[0];
    digits[3].textContent = seconds[1];
}

function countDown() {
    if (!isPaused) {
        if (timerValue > 0) {
            timerValue--;
            updateTimerDisplay();
        } else {
            clearInterval(timerInterval);
            timerInterval = null;
            playAlarm();
            flashScreen();
            startPauseBtn.textContent = 'Start';
        }
    }
}

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
    }, 500); // Slower flashes, two per second
}

// Additional timer functionality
const addTimerBtn = document.getElementById('addTimerBtn');
const additionalTimersContainer = document.getElementById('additionalTimers');

addTimerBtn.addEventListener('click', () => {
    const additionalTimer = document.createElement('div');
    additionalTimer.classList.add('additional-timer', 'col-12', 'col-md-4', 'text-center');

    additionalTimer.innerHTML = `
        <div class="timer-display display-1">
            <span class="digit">0</span><span class="digit">0</span>:<span class="digit">0</span><span class="digit">0</span>
        </div>
        <div class="btn-group">
            <button class="startPauseBtn btn btn-dark timer-control">Start</button>
            <button class="resetBtn btn btn-dark timer-control">Reset</button>
            <button class="deleteBtn btn btn-dark timer-control">Delete</button>
        </div>
    `;

    additionalTimersContainer.appendChild(additionalTimer);

    const timerDisplay = additionalTimer.querySelector('.timer-display');
    const startPauseBtn = additionalTimer.querySelector('.startPauseBtn');
    const resetBtn = additionalTimer.querySelector('.resetBtn');
    const deleteBtn = additionalTimer.querySelector('.deleteBtn');

    let timerInterval;
    let timerValue = 0;
    let isPaused = false;

    timerDisplay.addEventListener('click', (event) => {
        if (event.target.classList.contains('digit')) {
            let value = parseInt(event.target.textContent, 10);
            value = (value + 1) % 10;
            event.target.textContent = value;
            updateTimerValue();
        }
    });

    startPauseBtn.addEventListener('click', () => {
        if (timerInterval) {
            isPaused = !isPaused;
            startPauseBtn.textContent = isPaused ? 'Start' : 'Pause';
        } else {
            if (timerValue > 0) {
                isPaused = false;
                timerInterval = setInterval(countDown, 1000);
                startPauseBtn.textContent = 'Pause';
            }
        }
    });

    resetBtn.addEventListener('click', () => {
        clearInterval(timerInterval);
        timerInterval = null;
        timerValue = 0;
        updateTimerDisplay();
        startPauseBtn.textContent = 'Start';
        document.body.classList.remove('flash-red'); // Remove flash-red class when reset
    });

    deleteBtn.addEventListener('click', () => {
        clearInterval(timerInterval);
        additionalTimer.remove();
        resizeTimers();
        updateGridView();
    });

    function updateTimerValue() {
        const digits = timerDisplay.querySelectorAll('.digit');
        const minutes = parseInt(digits[0].textContent + digits[1].textContent, 10);
        const seconds = parseInt(digits[2].textContent + digits[3].textContent, 10);
        timerValue = minutes * 60 + seconds;
    }

    function updateTimerDisplay() {
        const minutes = String(Math.floor(timerValue / 60)).padStart(2, '0');
        const seconds = String(timerValue % 60).padStart(2, '0');
        const digits = timerDisplay.querySelectorAll('.digit');
        digits[0].textContent = minutes[0];
        digits[1].textContent = minutes[1];
        digits[2].textContent = seconds[0];
        digits[3].textContent = seconds[1];
    }

    function countDown() {
        if (!isPaused) {
            if (timerValue > 0) {
                timerValue--;
                updateTimerDisplay();
            } else {
                clearInterval(timerInterval);
                timerInterval = null;
                playAlarm();
                flashScreen();
                startPauseBtn.textContent = 'Start';
            }
        }
    }

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