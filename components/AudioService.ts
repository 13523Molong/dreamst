import { Audio } from 'expo-av';
import { useEffect, useRef } from 'react';


class AudioService {
  private static instance: AudioService;
  private backgroundMusic: Audio.Sound | null = null;
  private isPlaying = false;

  private constructor() {}

  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  // 初始化音频
  async initialize() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('音频初始化失败:', error);
    }
  }

  // 播放背景音乐
  async playBackgroundMusic() {
    try {
      if (this.isPlaying) return;

      // 替换为实际的钢琴轻音乐文件
      // const { sound } = await Audio.Sound.createAsync(
      //   require('../assets/audio/piano-background.mp3'),
      //   { shouldPlay: true, isLooping: true, volume: 0.3 }
      // );
      
      // 模拟播放背景音乐
      console.log('🎵 开始播放钢琴轻音乐');
      this.isPlaying = true;
      
      // 实际项目中，取消注释上面的代码并注释下面的模拟代码
      // this.backgroundMusic = sound;
    } catch (error) {
      console.error('播放背景音乐失败:', error);
    }
  }

  // 停止背景音乐
  async stopBackgroundMusic() {
    try {
      if (!this.isPlaying) return;

      console.log('🎵 停止播放背景音乐');
      this.isPlaying = false;
      
      if (this.backgroundMusic) {
        await this.backgroundMusic.stopAsync();
        await this.backgroundMusic.unloadAsync();
        this.backgroundMusic = null;
      }
    } catch (error) {
      console.error('停止背景音乐失败:', error);
    }
  }

  // 播放角色问候语
  async playGreeting(greeting: string) {
    try {
      // 这里可以集成语音合成服务
      // 例如：使用 expo-speech 或其他 TTS 服务
      console.log(`🗣️ 播放问候语: ${greeting}`);
      
      // 模拟语音播放
      // const { sound } = await Audio.Sound.createAsync(
      //   { uri: `https://tts-api.example.com/synthesize?text=${encodeURIComponent(greeting)}` },
      //   { shouldPlay: true, volume: 0.8 }
      // );
      
      // 等待播放完成
      // await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('播放问候语失败:', error);
    }
  }

  // 播放音效
  async playSoundEffect(effectType: 'tap' | 'success' | 'error') {
    try {
      const soundMap = {
        tap: 'tap.mp3',
        success: 'success.mp3',
        error: 'error.mp3'
      };

      // 这里可以添加实际的音效文件
      console.log(`🔊 播放音效: ${effectType}`);
      
      // const { sound } = await Audio.Sound.createAsync(
      //   require(`../assets/audio/${soundMap[effectType]}`),
      //   { shouldPlay: true, volume: 0.5 }
      // );
    } catch (error) {
      console.error('播放音效失败:', error);
    }
  }

  // 清理资源
  async cleanup() {
    await this.stopBackgroundMusic();
  }
}

export default AudioService; 