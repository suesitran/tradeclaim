import { useCallback, useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { base64ToBytes, bytesToBase64, downsample, floatToPcm16, pcm16ToFloat } from '@/lib/liveAudio';

const INPUT_RATE = 16000;
const OUTPUT_RATE = 24000;
const SOCKET_URL = 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContentConstrained';

function audioContextConstructor() {
  return window.AudioContext || window.webkitAudioContext;
}

export default function useGeminiLive({ instruction, tools, onToolCall }) {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [messages, setMessages] = useState([]);

  const socketRef = useRef(null);
  const streamRef = useRef(null);
  const captureRef = useRef(null);
  const captureNodesRef = useRef(null);
  const playbackRef = useRef(null);
  const sourcesRef = useRef([]);
  const nextStartRef = useRef(0);
  const manualCloseRef = useRef(false);
  const configRef = useRef({ instruction, tools, onToolCall });

  useEffect(() => {
    configRef.current = { instruction, tools, onToolCall };
  });

  const send = useCallback((payload) => {
    const socket = socketRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(payload));
  }, []);

  const appendText = useCallback((role, text) => {
    setMessages((current) => {
      const next = [...current];
      const last = next[next.length - 1];
      if (last && last.role === role) {
        next[next.length - 1] = { role, text: last.text + text };
      } else {
        next.push({ role, text });
      }
      return next;
    });
  }, []);

  const stopPlayback = useCallback(() => {
    sourcesRef.current.forEach((source) => {
      try {
        source.stop();
      } catch (err) {
        // already finished
      }
    });
    sourcesRef.current = [];
    const context = playbackRef.current;
    nextStartRef.current = context ? context.currentTime : 0;
  }, []);

  const playChunk = useCallback((base64) => {
    const Ctor = audioContextConstructor();
    if (!playbackRef.current && Ctor) playbackRef.current = new Ctor();
    const context = playbackRef.current;
    if (!context) return;
    if (context.state === 'suspended') context.resume();
    const samples = pcm16ToFloat(base64ToBytes(base64));
    const buffer = context.createBuffer(1, samples.length || 1, OUTPUT_RATE);
    buffer.copyToChannel(samples, 0);
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    const startAt = Math.max(context.currentTime, nextStartRef.current);
    source.start(startAt);
    nextStartRef.current = startAt + buffer.duration;
    sourcesRef.current.push(source);
    source.onended = () => {
      sourcesRef.current = sourcesRef.current.filter((entry) => entry !== source);
    };
  }, []);

  const teardownCapture = useCallback(() => {
    const nodes = captureNodesRef.current;
    if (nodes) {
      if (nodes.processor) {
        nodes.processor.onaudioprocess = null;
        nodes.processor.disconnect();
      }
      if (nodes.source) nodes.source.disconnect();
      if (nodes.silence) nodes.silence.disconnect();
    }
    captureNodesRef.current = null;
    if (captureRef.current) {
      captureRef.current.close().catch(() => {});
      captureRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const shutdown = useCallback(() => {
    manualCloseRef.current = true;
    const socket = socketRef.current;
    socketRef.current = null;
    if (socket) {
      socket.onclose = null;
      socket.onmessage = null;
      socket.onerror = null;
      socket.close();
    }
    stopPlayback();
    teardownCapture();
  }, [stopPlayback, teardownCapture]);

  const stop = useCallback(() => {
    shutdown();
    setStatus('idle');
  }, [shutdown]);

  const startCapture = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    });
    streamRef.current = stream;
    const Ctor = audioContextConstructor();
    const context = new Ctor();
    captureRef.current = context;
    if (context.state === 'suspended') context.resume();
    const source = context.createMediaStreamSource(stream);
    const processor = context.createScriptProcessor(4096, 1, 1);
    const silence = context.createGain();
    silence.gain.value = 0;
    processor.onaudioprocess = (event) => {
      const input = event.inputBuffer.getChannelData(0);
      const samples = downsample(input, context.sampleRate, INPUT_RATE);
      const pcm = floatToPcm16(samples);
      send({
        realtimeInput: {
          mediaChunks: [{ mimeType: `audio/pcm;rate=${INPUT_RATE}`, data: bytesToBase64(new Uint8Array(pcm.buffer)) }],
        },
      });
    };
    source.connect(processor);
    processor.connect(silence);
    silence.connect(context.destination);
    captureNodesRef.current = { source, processor, silence };
  }, [send]);

  const runTools = useCallback(async (calls) => {
    const responses = [];
    for (const call of calls) {
      let result;
      try {
        result = await configRef.current.onToolCall(call.name, call.args || {});
      } catch (err) {
        result = { result: err.message || 'The value could not be saved' };
      }
      responses.push({ id: call.id, name: call.name, response: result || { result: 'Done' } });
    }
    send({ toolResponse: { functionResponses: responses } });
  }, [send]);

  const handleMessage = useCallback(async (event) => {
    let text = '';
    if (typeof event.data === 'string') text = event.data;
    else if (event.data instanceof Blob) text = await event.data.text();
    else text = new TextDecoder().decode(event.data);

    let payload;
    try {
      payload = JSON.parse(text);
    } catch (err) {
      return;
    }

    if (payload.setupComplete) {
      setStatus('live');
      return;
    }

    if (payload.toolCall) {
      await runTools(payload.toolCall.functionCalls || []);
      return;
    }

    const content = payload.serverContent;
    if (!content) return;

    if (content.interrupted) stopPlayback();

    const parts = (content.modelTurn && content.modelTurn.parts) || [];
    parts.forEach((part) => {
      if (part.inlineData && part.inlineData.data) playChunk(part.inlineData.data);
    });

    if (content.inputTranscription && content.inputTranscription.text) {
      appendText('user', content.inputTranscription.text);
    }
    if (content.outputTranscription && content.outputTranscription.text) {
      appendText('model', content.outputTranscription.text);
    }
  }, [appendText, playChunk, runTools, stopPlayback]);

  const start = useCallback(async () => {
    setError('');
    setMessages([]);
    setStatus('connecting');
    manualCloseRef.current = false;
    try {
      const response = await base44.functions.invoke('geminiLiveToken', {});
      const data = (response && response.data) || {};
      if (!data.token) throw new Error(data.error || 'The voice session could not be started');

      await startCapture();

      const socket = new WebSocket(`${SOCKET_URL}?access_token=${encodeURIComponent(data.token)}`);
      socketRef.current = socket;

      socket.onopen = () => {
        const config = configRef.current;
        socket.send(JSON.stringify({
          setup: {
            model: `models/${data.model || 'gemini-3.8-live'}`,
            generationConfig: {
              responseModalities: ['AUDIO'],
              speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
            },
            systemInstruction: { parts: [{ text: config.instruction || '' }] },
            tools: config.tools && config.tools.length ? [{ functionDeclarations: config.tools }] : undefined,
            inputAudioTranscription: {},
            outputAudioTranscription: {},
          },
        }));
      };

      socket.onmessage = handleMessage;

      socket.onerror = () => {
        if (manualCloseRef.current) return;
        setError('The voice connection dropped. Check the network and start again.');
        setStatus('error');
      };

      socket.onclose = () => {
        if (manualCloseRef.current) return;
        stopPlayback();
        teardownCapture();
        setStatus((current) => (current === 'error' ? current : 'idle'));
      };
    } catch (err) {
      shutdown();
      setError(err.message || 'The voice session could not be started');
      setStatus('error');
    }
  }, [handleMessage, shutdown, startCapture, stopPlayback, teardownCapture]);

  useEffect(() => () => shutdown(), [shutdown]);

  return { status, error, messages, start, stop };
}