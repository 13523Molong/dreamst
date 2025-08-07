import { Audio } from 'expo-av';

// 音频适配器接口，为将来迁移到 expo-audio 做准备
interface IAudioAdapter {
  init(): Promise<void>;
  createSound(source: any, options?: any): Promise<any>;
  play(sound: any): Promise<void>;
  stop(sound: any): Promise<void>;
  unload(sound: any): Promise<void>;
}

// 当前使用 expo-av 的适配器实现
class ExpoAVAdapter implements IAudioAdapter {
  async init(): Promise<void> {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  }

  async createSound(source: any, options?: any): Promise<any> {
    const { sound } = await Audio.Sound.createAsync(source, options);
    return sound;
  }

  async play(sound: any): Promise<void> {
    await sound.playAsync();
  }

  async stop(sound: any): Promise<void> {
    await sound.stopAsync();
  }

  async unload(sound: any): Promise<void> {
    await sound.unloadAsync();
  }
}

class AudioService {
  private static instance: AudioService;
  private audioAdapter: IAudioAdapter;
  private backgroundMusic: Audio.Sound | null = null;
  private isPlaying = false;

  private constructor() {
    // 当前使用 expo-av 适配器，将来可以轻松切换到 expo-audio 适配器
    this.audioAdapter = new ExpoAVAdapter();
  }

  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  // 初始化音频
  async initialize() {
    try {
      await this.audioAdapter.init();
    } catch (error) {
      console.error('音频初始化失败:', error);
    }
  }

  // 播放背景音乐
  async playBackgroundMusic() {
    try {
      if (this.isPlaying) return;

      // 替换为实际的钢琴轻音乐文件
      // const sound = await this.audioAdapter.createSound(
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
        await this.audioAdapter.stop(this.backgroundMusic);
        await this.audioAdapter.unload(this.backgroundMusic);
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
      // const sound = await this.audioAdapter.createSound(
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
      
      // const sound = await this.audioAdapter.createSound(
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