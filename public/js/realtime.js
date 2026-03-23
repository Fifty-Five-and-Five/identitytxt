class RealtimeSession {
  constructor({ onTranscript, onStateChange, onAudioLevel, onError }) {
    this.onTranscript = onTranscript;
    this.onStateChange = onStateChange;
    this.onAudioLevel = onAudioLevel;
    this.onError = onError;

    this.pc = null;
    this.dc = null;
    this.audioEl = null;
    this.analyser = null;
    this.analyserData = null;
    this.levelInterval = null;
    this.localStream = null;
  }

  async connect(token, systemPrompt) {
    try {
      this.pc = new RTCPeerConnection();

      // Remote audio
      this.audioEl = document.createElement('audio');
      this.audioEl.autoplay = true;

      this.pc.ontrack = (e) => {
        this.audioEl.srcObject = e.streams[0];

        // Set up analyser for audio level
        const audioCtx = new AudioContext();
        const source = audioCtx.createMediaStreamSource(e.streams[0]);
        this.analyser = audioCtx.createAnalyser();
        this.analyser.fftSize = 256;
        source.connect(this.analyser);
        this.analyserData = new Uint8Array(this.analyser.frequencyBinCount);

        this.levelInterval = setInterval(() => {
          if (!this.analyser) return;
          this.analyser.getByteFrequencyData(this.analyserData);
          const avg = this.analyserData.reduce((a, b) => a + b, 0) / this.analyserData.length;
          const level = avg / 255;
          this.onAudioLevel(level);
          if (level > 0.02) {
            this.onStateChange('speaking');
          }
        }, 50);
      };

      // Local mic
      this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.localStream.getTracks().forEach(track => this.pc.addTrack(track, this.localStream));

      // Data channel for events
      this.dc = this.pc.createDataChannel('oai-events');
      this.dc.onopen = () => {
        // Configure session
        this.send({
          type: 'session.update',
          session: {
            instructions: systemPrompt,
            input_audio_transcription: { model: 'gpt-4o-mini-transcribe', language: 'en' },
            turn_detection: {
              type: 'server_vad',
              threshold: 0.7,
              prefix_padding_ms: 500,
              silence_duration_ms: 800,
            },
          },
        });
        // Prompt the AI to speak first — greet the interviewee
        this.send({ type: 'response.create' });
        this.onStateChange('speaking');
      };

      this.dc.onmessage = (e) => {
        const event = JSON.parse(e.data);
        this.handleEvent(event);
      };

      // Create offer
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);

      // Send to OpenAI
      const sdpResponse = await fetch(
        `https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/sdp',
          },
          body: offer.sdp,
        }
      );

      if (!sdpResponse.ok) {
        throw new Error(`SDP exchange failed: ${sdpResponse.status}`);
      }

      const answerSdp = await sdpResponse.text();
      await this.pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });

    } catch (err) {
      this.onError(err);
    }
  }

  handleEvent(event) {
    switch (event.type) {
      case 'conversation.item.input_audio_transcription.completed':
        if (event.transcript?.trim()) {
          this.onTranscript('user', event.transcript.trim());
        }
        break;

      case 'response.audio_transcript.done':
        if (event.transcript?.trim()) {
          this.onTranscript('ai', event.transcript.trim());
        }
        break;

      case 'response.audio.done':
        this.onStateChange('listening');
        break;

      case 'input_audio_buffer.speech_started':
        this.onStateChange('listening');
        break;

      case 'error':
        console.error('Realtime error:', event.error);
        this.onError(new Error(event.error?.message || 'Unknown realtime error'));
        break;
    }
  }

  send(event) {
    if (this.dc?.readyState === 'open') {
      this.dc.send(JSON.stringify(event));
    }
  }

  disconnect() {
    if (this.levelInterval) clearInterval(this.levelInterval);
    if (this.dc) this.dc.close();
    if (this.localStream) this.localStream.getTracks().forEach(t => t.stop());
    if (this.pc) this.pc.close();
    if (this.audioEl) {
      this.audioEl.srcObject = null;
      this.audioEl.remove();
    }
    this.pc = null;
    this.dc = null;
    this.analyser = null;
  }
}
