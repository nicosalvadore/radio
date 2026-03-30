# radio

## disclaimer
this app was generated with Github Copilot and Claude Code, using prompting and agentic editing.

## features

### radio
- play internet radio streams via standard audio URLs
- play YouTube live streams embedded directly in the page
- volume slider (applies to both radio and YouTube streams)
- play/pause button with live status indicator
- last selected station and volume saved across page reloads

### timer
- countdown timer with clickable digits to set time
- start / pause / reset controls
- alarm sound + screen flash when timer reaches 00:00
- multiple simultaneous timers
- main timer value saved across page reloads

### today
- live date and time display

## config

- radio streams and YouTube lives are configured in `streams.json`
- radio images are stored in `media/`
- the alarm audio file played when the timer reaches 00:00 is `media/alarm.mp3`

### adding a standard stream
```json
{
    "stream": "https://your-stream-url.mp3",
    "name": "Station Name",
    "image": "media/station.png"
}
```

### adding a YouTube live stream
```json
{
    "type": "youtube",
    "youtubeVideoId": "VIDEO_ID",
    "name": "Stream Name",
    "image": "https://i.ytimg.com/vi/VIDEO_ID/mqdefault.jpg"
}
```
