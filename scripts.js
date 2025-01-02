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
            updateStreamName(currentlyPlayingButton.textContent);
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
    const buttonsContainer = document.querySelector('.buttons');

    streams.forEach((stream, index) => {
        const soundId = `sound${index + 1}`;

        // Create button element
        const button = document.createElement('div');
        button.classList.add('sound-btn');
        button.setAttribute('data-sound', soundId);
        button.setAttribute('data-icon', 'fa fa-volume-up');
        button.setAttribute('data-color', '#FF5722');
        button.style.backgroundColor = '#FF5722';

        // Create image element
        const img = document.createElement('img');
        img.src = stream.image;
        img.alt = stream.name;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '10px';

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
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');

        button.classList.add('active');
        document.getElementById(button.getAttribute('data-tab')).style.display = 'block';
    });
});

// Show the first tab by default
document.getElementById('radio').style.display = 'block';

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
        const color = (flashes % 2 === 0) ? 'red' : '#121212';
        document.body.style.backgroundColor = color;
        document.querySelector('.tabs').style.backgroundColor = color;
        document.querySelector('.tab-content#timer').style.backgroundColor = color; // Flash the timer tab background
        flashes++;
        if (flashes >= 20) {
            clearInterval(flashInterval);
            document.body.style.backgroundColor = '#121212';
            document.querySelector('.tabs').style.backgroundColor = '#121212';
            document.querySelector('.tab-content#timer').style.backgroundColor = '#121212'; // Reset the timer tab background
        }
    }, 500); // Slower flashes, two per second
}

// Additional timer functionality
const addTimerBtn = document.getElementById('addTimerBtn');
const additionalTimersContainer = document.getElementById('additionalTimers');

addTimerBtn.addEventListener('click', () => {
    const additionalTimer = document.createElement('div');
    additionalTimer.classList.add('additional-timer');

    additionalTimer.innerHTML = `
        <div class="timer-display">
            <span class="digit">0</span><span class="digit">0</span>:<span class="digit">0</span><span class="digit">0</span>
        </div>
        <div class="timer-controls">
            <button class="startPauseBtn">Start</button>
            <button class="resetBtn">Reset</button>
            <button class="deleteBtn">Delete</button>
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
    const fontSize = Math.min(20 / timerCount, 20) + 'vw';
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