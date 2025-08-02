import React, { forwardRef, useImperativeHandle } from 'react';
import { Button } from 'react-native';
export default forwardRef(function AudioRecorder({ onSend }, ref) {
  useImperativeHandle(ref, () => ({
    play: (url) => {
      // stub: play audio at URL
      console.log('Play audio:', url);
    }
  }));

  const recordAndSend = async () => {
    // stub: record audio -> blob
    const blob = await new Promise(res => setTimeout(() => res('audio_blob'), 1000));
    onSend(blob);
  };

  return <Button title="Hold to Talk" onPressIn={recordAndSend} />;
});