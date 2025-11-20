# Endless Orgasm Machine UI

This is a browser-based UI for the Endless Orgasm Machine system for ESP32.

![Screenshot](../doc/Screenshot3.png)

It runs over bluetooth!  Just connect to your EOM directly by clicking the bluetooth icon.  No ip address, wifi setup, or websockets needed.  For now it is Android or PC Chrome or Edge only! Sorry Apple and Firefox enthusiasts but they have deemed web bluetooth an unacceptable risk and it will never be available.  I'm working on a native wrapper to get past this and into the app stores.

It is configured as a PWA!  This means you can pull it up once from https://rubberyfun.github.io/endless-orgasm-machine/eomui/public and install it as an app.  It does not require an internet connection to work after installation...its just there in app-mode ready to go.

It was meant to be stored in spiffs memory on an ESP32 but has outgrown that with the addition of buttplug.io connections to other sex toys.  A simpler version of the built output is included with the larger EOM project for monitoring websocket output. 

It can be run locally if you prefer.  It should be backwards compatible with the Edge-o-Matic & nogasm though missing some features like denial count and Orgasm Mode.

![Screenshot](../doc/Screenshot.png)
## Use
- Click the bluetooth icon to connect to the EOM (it should be visible as "Libotoy").  The UI will now respond to the pressure applied to the EOM
- Click the duck icon to connect to a toy such as a vibrator.  The toy will now increase in intensity along with the "pleasure" meter of the app.
- If clenches are detected by the EOM the "pleasure" meter will drop accordingly and the toy will follow.


## Building 
- from the eomui directory run ```npm install``` then ```npm run build```
- the output ```index.html``` will automatically overwrite the version in the /data directory of the EOM project.
- using platformIO tools ```build filesystem``` then ```upload filesystem``` to update your device
- the EOM code itself doesn't need to be built/uploaded again

## Development
- run ```vite```
- visit ```http://localhost:5173/``` in your browser
- enter the ip address of your EOM and hit connect - it will open a websocket connection and request a stream of readings
- to speed up development the IP address can be entered into the code on line 8 of [/src/App.svelte](/src/App.svelte) 
- if you need SSL locally use ```npm i @vitejs/plugin-basic-ssl```

## License
This UI was not derived from any previous projects and is released under GPL courtesy of Claus Macher.  If you aren't familiar with GPL it basically means you can do whatever you want with the code but anything you make with it should also be released under GPL.

The buttplug.io library used by this project has a BSD-3 License...which basically means the license and attribution must be distributed with any projects using the code.