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
        // Configure session - GA Realtime API shape (session.type required,
        // audio nested under session.audio.input/output).
        this.send({
          type: 'session.update',
          session: {
            type: 'realtime',
            instructions: systemPrompt,
            audio: {
              input: {
                transcription: { model: 'gpt-realtime-whisper', language: 'en' },
                turn_detection: {
                  type: 'server_vad',
                  threshold: 0.7,
                  prefix_padding_ms: 500,
                  silence_duration_ms: 800,
                  create_response: true,
                  interrupt_response: true,
                },
              },
              output: {
                voice: 'ash',
              },
            },
          },
        });
        // response.create is sent after session.updated event (see handleEvent)
      };

      this.dc.onmessage = (e) => {
        const event = JSON.parse(e.data);
        // Log all event types so we can spot any name we're not handling yet
        // (GA renamed a bunch of them from the beta).
        if (window.__identitytxtDebug !== false && event.type) {
          console.debug('[realtime]', event.type, event);
        }
        this.handleEvent(event);
      };

      // Create offer
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);

      // Send to OpenAI - GA endpoint is /v1/realtime/calls. The model is
      // encoded in the client_secret (ek_...) so no query param needed.
      const sdpResponse = await fetch(
        `https://api.openai.com/v1/realtime/calls`,
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
      case 'session.updated':
        // Instructions are now applied — safe to ask the AI to speak
        this.send({ type: 'response.create' });
        this.onStateChange('speaking');
        break;

      case 'conversation.item.input_audio_transcription.completed':
        if (event.transcript?.trim()) {
          this.onTranscript('user', event.transcript.trim());
        }
        break;

      // Beta name was response.audio_transcript.done; GA renamed it.
      case 'response.audio_transcript.done':
      case 'response.output_audio_transcript.done':
        if (event.transcript?.trim()) {
          this.onTranscript('ai', event.transcript.trim());
        }
        break;

      case 'response.audio.done':
      case 'response.output_audio.done':
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

  // Inject a guidance note into the conversation to steer the AI
  injectGuidance(text) {
    this.send({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{ type: 'input_text', text: `[SYSTEM NOTE — not spoken by the interviewee, this is an internal instruction]: ${text}` }],
      },
    });
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
