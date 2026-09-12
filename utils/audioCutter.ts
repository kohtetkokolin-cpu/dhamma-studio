export async function trimAudio(
  audioUrl: string,
  startTime: number,
  endTime: number
): Promise<Blob> {
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  const audioContext = new AudioCtx();

  // Audio Context suspended ဖြစ်နေပါက resume လုပ်ပေးရန်
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }

  const response = await fetch(audioUrl, { mode: 'cors' });
  if (!response.ok) {
    throw new Error(`Audio fetch failed: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  const sampleRate = audioBuffer.sampleRate;
  const startOffset = Math.max(0, Math.floor(startTime * sampleRate));
  const endOffset = Math.min(Math.floor(endTime * sampleRate), audioBuffer.length);
  const frameCount = Math.max(1, endOffset - startOffset);

  const trimmedBuffer = audioContext.createBuffer(
    audioBuffer.numberOfChannels,
    frameCount,
    sampleRate
  );

  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
    const channelData = audioBuffer.getChannelData(channel);
    const newChannelData = trimmedBuffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      newChannelData[i] = channelData[startOffset + i];
    }
  }

  return bufferToWave(trimmedBuffer, frameCount);
}

function bufferToWave(abuffer: AudioBuffer, totalSteps: number): Blob {
  const numOfChan = abuffer.numberOfChannels;
  const length = totalSteps * numOfChan * 2 + 44;
  const out = new DataView(new ArrayBuffer(length));
  let pos = 0;

  function setUint16(data: number) { out.setUint16(pos, data, true); pos += 2; }
  function setUint32(data: number) { out.setUint32(pos, data, true); pos += 4; }

  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8);
  setUint32(0x45564157); // "WAVE"
  setUint32(0x20746d66); // "fmt "
  setUint32(16);
  setUint16(1);          // PCM
  setUint16(numOfChan);
  setUint32(abuffer.sampleRate);
  setUint32(abuffer.sampleRate * 2 * numOfChan);
  setUint16(numOfChan * 2);
  setUint16(16);
  setUint32(0x61746164); // "data"
  setUint32(length - pos - 4);

  const channels: Float32Array[] = [];
  for (let i = 0; i < abuffer.numberOfChannels; i++) {
    channels.push(abuffer.getChannelData(i));
  }

  let offset = 0;
  while (pos < length && offset < totalSteps) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      out.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([out.buffer], { type: 'audio/wav' });
}
