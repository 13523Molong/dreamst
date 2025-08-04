import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import { 
  ImageBackground, 
  Text, 
  View, 
  TouchableOpacity, 
  Dimensions, 
  StatusBar,
  Platform,
  BackHandler,
  StyleSheet,
  Image
} from 'react-native';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInUp, 
  SlideOutDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS
} from 'react-native-reanimated';
import { SharedElement } from 'react-navigation-shared-element';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

const { width, height } = Dimensions.get('window');

// 定义角色类型
type Role = {
  id: string;
  name: string;
  avatar: string;
  description: string;
  image: any;
  promote: string;
  tags: string[];
  greeting: string;
  accompanyDays: number;
};

export default function DialogueScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const character: Role = JSON.parse(params.character as string);
  
  const [isGreetingPlayed, setIsGreetingPlayed] = useState(false);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const [isHardwareConnected, setIsHardwareConnected] = useState(false);
  
  const backgroundOpacity = useSharedValue(0);
  const dialogueOpacity = useSharedValue(0);
  const dialogueScale = useSharedValue(0.8);
  const characterImageScale = useSharedValue(1.2);
  const hardwareIndicatorOpacity = useSharedValue(0);

  // 硬件连接检测
  useEffect(() => {
    // 模拟硬件连接检测
    const checkHardwareConnection = async () => {
      try {
        // 这里可以添加实际的硬件连接检测逻辑
        // 例如：蓝牙设备、传感器等
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsHardwareConnected(true);
        hardwareIndicatorOpacity.value = withSpring(1);
      } catch (error) {
        console.log('硬件连接检测失败:', error);
        setIsHardwareConnected(false);
      }
    };

    checkHardwareConnection();
  }, []);

  // 播放角色问候语
  useEffect(() => {
    const playGreeting = async () => {
      try {
        // 触觉反馈
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        
        // 播放问候语（这里可以集成语音合成）
        console.log(`播放问候语: ${character.greeting}`);
        
        // 模拟语音播放时间
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsGreetingPlayed(true);
        
        // 开始背景动画
        backgroundOpacity.value = withTiming(0.3, { duration: 1000 });
        characterImageScale.value = withSpring(1, { damping: 15, stiffness: 100 });
        
        // 显示对话界面
        setTimeout(() => {
          dialogueOpacity.value = withSpring(1);
          dialogueScale.value = withSpring(1);
          setIsAnimationComplete(true);
        }, 500);
        
      } catch (error) {
        console.error('播放问候语时出错:', error);
      }
    };

    playGreeting();
  }, []);

  // 返回处理
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true;
    });

    return () => backHandler.remove();
  }, []);

  const handleBack = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.back();
    } catch (error) {
      router.back();
    }
  };

  // 动画样式
  const backgroundAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: backgroundOpacity.value,
    };
  });

  const characterImageAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: characterImageScale.value },
      ],
    };
  });

  const dialogueAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: dialogueOpacity.value,
      transform: [
        { scale: dialogueScale.value },
      ],
    };
  });

  const hardwareIndicatorAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: hardwareIndicatorOpacity.value,
    };
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* 背景图片 */}
      <Animated.View style={[styles.backgroundContainer, backgroundAnimatedStyle]}>
        <SharedElement id={`item.${character.id}.photo`}>
          <Animated.View style={[styles.characterImageContainer, characterImageAnimatedStyle]}>
            <ImageBackground 
              source={character.image} 
              style={styles.backgroundImage}
              imageStyle={styles.backgroundImageStyle}
            />
          </Animated.View>
        </SharedElement>
      </Animated.View>

      {/* 顶部导航栏 */}
      <Animated.View entering={SlideInUp.delay(300)} style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={styles.characterName}>{character.name}</Text>
          <Text style={styles.characterPromote}>{character.promote}</Text>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="heart-outline" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="settings-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* 硬件连接指示器 */}
      <Animated.View style={[styles.hardwareIndicator, hardwareIndicatorAnimatedStyle]}>
        <View style={[styles.indicatorDot, { backgroundColor: isHardwareConnected ? '#4CAF50' : '#FF5722' }]} />
        <Text style={styles.indicatorText}>
          {isHardwareConnected ? '硬件已连接' : '硬件连接中...'}
        </Text>
      </Animated.View>

      {/* 问候语显示 */}
      {!isGreetingPlayed && (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.greetingContainer}>
          <View style={styles.greetingBubble}>
            <Text style={styles.greetingText}>{character.greeting}</Text>
          </View>
        </Animated.View>
      )}

      {/* 对话界面 */}
      {isAnimationComplete && (
        <Animated.View style={[styles.dialogueContainer, dialogueAnimatedStyle]}>
          <View style={styles.dialogueBox}>
            <View style={styles.dialogueHeader}>
              <Image source={{ uri: character.avatar }} style={styles.dialogueAvatar} />
              <View style={styles.dialogueInfo}>
                <Text style={styles.dialogueName}>{character.name}</Text>
                <Text style={styles.dialogueStatus}>在线</Text>
              </View>
              <View style={styles.dialogueActions}>
                <TouchableOpacity style={styles.dialogueAction}>
                  <Ionicons name="mic-outline" size={20} color="#888" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.dialogueAction}>
                  <Ionicons name="camera-outline" size={20} color="#888" />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.dialogueContent}>
              <Text style={styles.dialogueMessage}>
                {character.greeting}
              </Text>
              <Text style={styles.dialogueTime}>刚刚</Text>
            </View>
            
            <View style={styles.inputContainer}>
              <TouchableOpacity style={styles.inputButton}>
                <Ionicons name="add-circle-outline" size={24} color="#888" />
              </TouchableOpacity>
              <View style={styles.textInput}>
                <Text style={styles.inputPlaceholder}>输入消息...</Text>
              </View>
              <TouchableOpacity style={styles.sendButton}>
                <Ionicons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}

      {/* 底部安全区域 */}
      <View style={styles.bottomSafeArea} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  characterImageContainer: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backgroundImageStyle: {
    opacity: 0.3,
    resizeMode: 'cover',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(26, 26, 46, 0.8)',
    backdropFilter: 'blur(10px)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  characterName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  characterPromote: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  hardwareIndicator: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 120 : 100,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  indicatorText: {
    fontSize: 12,
    color: '#fff',
  },
  greetingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  greetingBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  greetingText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
  },
  dialogueContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  dialogueBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
    overflow: 'hidden',
  },
  dialogueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  dialogueAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  dialogueInfo: {
    flex: 1,
  },
  dialogueName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  dialogueStatus: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 2,
  },
  dialogueActions: {
    flexDirection: 'row',
  },
  dialogueAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  dialogueContent: {
    padding: 16,
    minHeight: 100,
  },
  dialogueMessage: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  dialogueTime: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  inputButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 20,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  inputPlaceholder: {
    fontSize: 14,
    color: '#888',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#64b5f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  bottomSafeArea: {
    height: Platform.OS === 'ios' ? 34 : 0,
    backgroundColor: 'transparent',
  },
}); 