/**
 * 角色对话页面
 * 
 * @description 恋与制作人风格的角色对话界面，展示角色信息和互动对话框
 * @author 开发团队
 * @version 1.0.0
 * 
 * 主要功能：
 * - 角色背景图片展示
 * - 动态对话框设计
 * - 多层渐变边框动画
 * - 脉冲和视差动画效果
 * - 触觉反馈和音效
 * - 优雅的转场动画
 */

import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    BackHandler,
    Dimensions,
    Image,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSpring,
    withTiming
} from 'react-native-reanimated';

// 导入类型定义
import type { Role } from '../types';

// 获取设备屏幕尺寸
const { width, height } = Dimensions.get('window');

/**
 * 对话页面主组件
 * 
 * @description 处理角色对话的展示和交互逻辑
 * @returns {JSX.Element} 对话页面组件
 */
export default function DialogueScreen() {
  // 获取路由参数和导航对象
  const params = useLocalSearchParams();
  const router = useRouter();
  
  // 解析传入的角色数据
  const character: Role = JSON.parse(params.character as string);
  
  // === 状态管理 ===
  /** 是否已播放问候语 */
  const [isGreetingPlayed, setIsGreetingPlayed] = useState(false);
  
  /** 动画是否完成 */
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  
  // === 动画共享值 ===
  /** 对话框透明度动画 */
  const dialogueOpacity = useSharedValue(0);
  
  /** 对话框缩放动画 */
  const dialogueScale = useSharedValue(0.8);
  
  /** 角色图片透明度动画 */
  const characterOpacity = useSharedValue(0);
  
  /** 角色图片缩放动画 */
  const characterScale = useSharedValue(1.1);
  
  /** 边框旋转动画 */
  const borderAnimation = useSharedValue(0);
  
  /** 脉冲缩放动画 */
  const pulseAnimation = useSharedValue(0);
  
  /** 背景视差动画 */
  const backgroundParallax = useSharedValue(0);

  // === 生命周期和副作用 ===
  
  /**
   * 页面初始化效果
   * 
   * @description 处理页面加载时的动画序列和音效播放
   * 动画序列：触觉反馈 -> 角色显示 -> 对话框显示 -> 循环动画启动
   */
  useEffect(() => {
    /**
     * 播放问候语和启动动画的异步函数
     * 
     * @async
     * @function playGreeting
     */
    const playGreeting = async () => {
      try {
        // 1. 触觉反馈增强用户体验
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        
        // 2. 播放问候语（预留语音合成接口）
        console.log(`播放问候语: ${character.greeting}`);
        
        // 3. 模拟语音播放时间
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsGreetingPlayed(true);
        
        // 4. 显示角色图片动画
        characterOpacity.value = withTiming(1, { duration: 800 });
        characterScale.value = withSpring(1, { damping: 15, stiffness: 100 });
        
        // 5. 延迟显示对话框，创造层次感
        setTimeout(() => {
          // 对话框淡入和缩放动画
          dialogueOpacity.value = withTiming(1, { duration: 600 });
          dialogueScale.value = withSpring(1, { damping: 12, stiffness: 80 });
          
          // 启动循环动画效果
          
          // 边框旋转动画（3秒一圈）
          borderAnimation.value = withRepeat(
            withTiming(1, { duration: 3000, easing: Easing.linear }),
            -1,  // 无限循环
            false // 不反向
          );
          
          // 脉冲呼吸动画（2秒一次，往返）
          pulseAnimation.value = withRepeat(
            withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
            -1,  // 无限循环
            true // 反向播放
          );
          
          // 背景视差动画（8秒一次）
          backgroundParallax.value = withRepeat(
            withTiming(1, { duration: 8000, easing: Easing.linear }),
            -1,  // 无限循环
            false // 不反向
          );
          
          setIsAnimationComplete(true);
        }, 400); // 400ms延迟，确保角色动画先完成
        
      } catch (error) {
        console.error('播放问候语时出错:', error);
      }
    };

    // 页面加载时执行动画序列
    playGreeting();
  }, []); // 空依赖数组，仅在组件挂载时执行

  // 返回处理
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true;
    });

    return () => {
      backHandler.remove();
    };
  }, []);

  const handleBack = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.back();
    } catch (error) {
      router.back();
    }
  };

  // 角色图片动画样式
  const characterAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: characterOpacity.value,
      transform: [
        { scale: characterScale.value },
      ],
    };
  });

  // 对话框动画样式
  const dialogueAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: dialogueOpacity.value,
      transform: [
        { scale: dialogueScale.value },
      ],
    };
  });

  // 边框动画样式
  const borderAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    const rotation = borderAnimation.value * 360;
    return {
      transform: [
        { rotate: `${rotation}deg` },
      ],
    };
  });

  // 脉冲动画样式
  const pulseAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    const scale = 1 + pulseAnimation.value * 0.05;
    const opacity = 1 - pulseAnimation.value * 0.3;
    return {
      transform: [
        { scale: scale },
      ],
      opacity: opacity,
    };
  });

  // 背景视差动画样式
  const backgroundAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    const translateX = backgroundParallax.value * 20 - 10;
    const translateY = backgroundParallax.value * 10 - 5;
    const scale = 1 + backgroundParallax.value * 0.1;
    return {
      transform: [
        { translateX: translateX },
        { translateY: translateY },
        { scale: scale },
      ],
    };
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* 动态背景层 - 增强恋与制作人风格 */}
      <Animated.View style={[styles.backgroundContainer, backgroundAnimatedStyle]}>
        <Image
          source={character.image}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        {/* 梦幻渐变遮罩 */}
        <LinearGradient
          colors={[
            'rgba(255,154,158,0.3)',
            'rgba(255,206,239,0.2)',
            'rgba(250,208,196,0.3)',
            'rgba(255,255,255,0.7)'
          ]}
          style={styles.backgroundOverlay}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        {/* 额外的光效层 */}
        <LinearGradient
          colors={[
            'transparent',
            'rgba(255,255,255,0.1)',
            'transparent',
            'rgba(255,154,158,0.1)',
            'transparent'
          ]}
          style={styles.lightEffect}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
      
      {/* 返回按钮 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'< 返回'}</Text>
        </TouchableOpacity>
      </View>
      
      {/* 主内容区域 */}
      <View style={styles.mainContent}>
        {/* 角色显示区域 */}
        <View style={styles.characterSection}>
          <Animated.View style={[styles.characterContainer, characterAnimatedStyle]}>
            <Image
              source={character.image}
              style={styles.characterImage}
              resizeMode="cover"
            />
            <View style={styles.characterInfo}>
              <Text style={styles.characterName}>{character.name}</Text>
              <Text style={styles.characterPromote}>{character.promote}</Text>
            </View>
          </Animated.View>
        </View>
        
        {/* 对话区域 - 根据恋与制作人风格重新设计 */}
        <View style={styles.dialogueSection}>
          {/* 主对话泡泡 */}
          <Animated.View style={[styles.dialogueBubble, dialogueAnimatedStyle]}>
            {/* 脉冲光晕背景 */}
            <Animated.View style={[styles.pulseBackground, pulseAnimatedStyle]}>
              <LinearGradient
                colors={['rgba(255,154,158,0.2)', 'rgba(255,206,239,0.1)', 'transparent']}
                style={styles.pulseGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            </Animated.View>
            
            {/* 多层渐变边框动画 */}
            <Animated.View style={[styles.borderGradient, borderAnimatedStyle]}>
              <LinearGradient
                colors={['#ff9a9e', '#fecfef', '#fecfef', '#fad0c4', '#ff9a9e']}
                style={styles.gradientBorder}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            </Animated.View>
            
            {/* 内层边框 */}
            <View style={styles.innerBorder}>
              <LinearGradient
                colors={['rgba(255,255,255,0.8)', 'rgba(255,255,255,0.6)']}
                style={styles.innerGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              />
            </View>
            
            {/* 对话内容容器 */}
            <View style={styles.dialogueContent}>
              <LinearGradient
                colors={[
                  'rgba(255,255,255,0.95)', 
                  'rgba(252,248,255,0.95)', 
                  'rgba(248,248,248,0.9)'
                ]}
                style={styles.dialogueGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              >
                {/* 角色名称标签 */}
                <View style={styles.characterTag}>
                  <LinearGradient
                    colors={['#ff9a9e', '#fad0c4']}
                    style={styles.characterTagGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.characterTagText}>{character.name}</Text>
                  </LinearGradient>
                </View>
                
                {/* 对话内容主体 */}
                <View style={styles.dialogueInner}>
                  {/* 问候语文本 */}
                  <View style={styles.greetingContainer}>
                    <Text style={styles.greetingText}>{character.greeting}</Text>
                  </View>
                  
                  {/* 装饰性分割线 */}
                  <View style={styles.decorativeLine}>
                    <LinearGradient
                      colors={['transparent', '#ff9a9e', 'transparent']}
                      style={styles.lineGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    />
                  </View>
                  
                  {/* 交互按钮组 */}
                  <View style={styles.actionButtons}>
                    <TouchableOpacity style={[styles.actionButton, styles.voiceButton]}>
                      <LinearGradient
                        colors={['#ff6b9d', '#ff8a80']}
                        style={styles.buttonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                      >
                        <Text style={styles.buttonIcon}>🎤</Text>
                        <Text style={styles.buttonLabel}>语音</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={[styles.actionButton, styles.chatButton]}>
                      <LinearGradient
                        colors={['#74b9ff', '#81ecec']}
                        style={styles.buttonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                      >
                        <Text style={styles.buttonIcon}>💬</Text>
                        <Text style={styles.buttonLabel}>聊天</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={[styles.actionButton, styles.heartButton]}>
                      <LinearGradient
                        colors={['#fd79a8', '#fdcb6e']}
                        style={styles.buttonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                      >
                        <Text style={styles.buttonIcon}>❤️</Text>
                        <Text style={styles.buttonLabel}>互动</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                  
                  {/* 底部装饰 */}
                  <View style={styles.bottomDecoration}>
                    <View style={styles.decorativeDots}>
                      {[1, 2, 3].map((_, index) => (
                        <View key={index} style={styles.dot} />
                      ))}
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  // 背景容器支持动画
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '110%',
    height: '110%',
    marginLeft: '-5%',
    marginTop: '-5%',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  // 额外光效层
  lightEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  backButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
    paddingTop: 100,
  },
  characterSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  characterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterImage: {
    width: width * 0.6,
    height: width * 0.8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  characterInfo: {
    alignItems: 'center',
    marginTop: 15,
  },
  characterName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2c3e50',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  characterPromote: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 5,
    fontWeight: '500',
  },
  dialogueSection: {
    height: height * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  // 对话泡泡主容器 - 增大尺寸，更符合恋与制作人风格
  dialogueBubble: {
    width: width * 0.9,
    height: width * 0.8,
    position: 'relative',
  },
  // 外层动态边框
  borderGradient: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 25,
    padding: 4,
  },
  gradientBorder: {
    width: '100%',
    height: '100%',
    borderRadius: 21,
  },
  // 内层边框装饰
  innerBorder: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    borderRadius: 19,
    padding: 2,
  },
  innerGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 17,
  },
  // 对话内容容器
  dialogueContent: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: 6,
    bottom: 6,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#ff9a9e',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  dialogueGradient: {
    width: '100%',
    height: '100%',
    paddingVertical: 20,
    paddingHorizontal: 25,
  },
  // 角色名称标签
  characterTag: {
    position: 'absolute',
    top: -10,
    left: 20,
    right: 20,
    zIndex: 1,
  },
  characterTagGradient: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#ff9a9e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  characterTagText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  // 对话内容主体
  dialogueInner: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
  },
  // 问候语容器
  greetingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  greetingText: {
    fontSize: 16,
    color: '#2c3e50',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(255,255,255,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  // 装饰性分割线
  decorativeLine: {
    width: '80%',
    height: 2,
    marginVertical: 15,
  },
  lineGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 1,
  },
  // 交互按钮组
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
  },
  // 通用按钮样式
  actionButton: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  buttonLabel: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  // 单独按钮样式（用于特殊效果）
  voiceButton: {
    // 额外样式可以在这里添加
  },
  chatButton: {
    // 额外样式可以在这里添加
  },
  heartButton: {
    // 额外样式可以在这里添加
  },
  // 底部装饰
  bottomDecoration: {
    alignItems: 'center',
    marginTop: 10,
  },
  decorativeDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ff9a9e',
    marginHorizontal: 3,
    opacity: 0.7,
  },
  // 脉冲背景样式
  pulseBackground: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderRadius: 35,
    zIndex: -1,
  },
  pulseGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
  },
}); 