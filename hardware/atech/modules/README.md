Drivers copied from the MIT-licensed PyPI package `atech==1.0.0a11`.
Local changes cap microphone recording at two seconds, synchronize recording-buffer reset/capture, erase/free captured RAM, and flush speaker DMA on stop.
Snapshot getSamples is not used for continuous capture. This project is a local hardware test, not the WiFi voice-agent transport.
