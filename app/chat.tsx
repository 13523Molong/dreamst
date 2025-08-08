/**
 * 独立聊天界面
 * - 背景角色图
 * - 底部圆形气泡输入框（动态渐变边框）
 * - 支持文字输入 & 长按语音占位
 */

 import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, ImageBackground, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import Animated, { Easing, FadeIn, FadeOut, SlideInDown, SlideInUp, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { CHARACTER_IMAGES, ROLES } from '../config/characters';
import type { Role } from '../types';

export const options = {
  headerShown: false,
};

type ChatParams = {
  character?: string; // 传入的角色JSON字符串
};

function RippleWaves({ active, color = 'rgba(74,144,226,0.35)', baseSize = 56, energy }: { active: boolean; color?: string; baseSize?: number; energy?: SharedValue<number> }) {
  const p1 = useSharedValue(0);
  const p2 = useSharedValue(0);
  const p3 = useSharedValue(0);

  useEffect(() => {
    const animate = () => withRepeat(withTiming(1, { duration: 1800, easing: Easing.out(Easing.quad) }), -1, false);
    if (active) {
      p1.value = animate();
      setTimeout(() => { p2.value = animate(); }, 300);
      setTimeout(() => { p3.value = animate(); }, 600);
    } else {
      p1.value = withTiming(0, { duration: 180 });
      p2.value = withTiming(0, { duration: 180 });
      p3.value = withTiming(0, { duration: 180 });
    }
  }, [active, p1, p2, p3]);

  const ringStyle = (sv: any) => useAnimatedStyle(() => {
    const e = energy?.value ?? 0.5; // 0-1
    return {
      transform: [{ scale: 0.65 + sv.value * (0.8 + e * 0.25) }],
      opacity: (0.35 + e * 0.2) * (1 - sv.value),
    };
  });

  const r1 = ringStyle(p1);
  const r2 = ringStyle(p2);
  const r3 = ringStyle(p3);

  return (
    <View style={[styles.rippleWrap, { width: baseSize, height: baseSize }]}
      pointerEvents="none">
      <Animated.View style={[styles.ripple, { backgroundColor: color }, r1]} />
      <Animated.View style={[styles.ripple, { backgroundColor: color }, r2]} />
      <Animated.View style={[styles.ripple, { backgroundColor: color }, r3]} />
    </View>
  );
}

function PlayVisualizer({ active, energy }: { active: boolean; energy: SharedValue<number> }) {
  const bars = new Array(5).fill(0).map(() => useSharedValue(0));

  useEffect(() => {
    bars.forEach((sv, i) => {
      if (active) {
        sv.value = withRepeat(withTiming(1, { duration: 600 + i * 130, easing: Easing.inOut(Easing.quad) }), -1, true);
      } else {
        sv.value = withTiming(0, { duration: 220 });
      }
    });
  }, [active]);

  return (
    <View style={styles.visualizer} pointerEvents="none">
      {bars.map((sv, idx) => {
        const s = useAnimatedStyle(() => ({ height: 6 + (sv.value * 22 + energy.value * 18) }));
        return <Animated.View key={idx} style={[styles.vbar, s]} />;
      })}
    </View>
  );
}

function GradientBorderBubble({ children, radius = 34, thickness = 2, active = false, label }: { children: React.ReactNode; radius?: number; thickness?: number; active?: boolean; label?: string }) {
  // 通过阶段循环改变渐变的起止点，模拟动态边框
  const [phase, setPhase] = useState(0);
  const rotate = useSharedValue(0);
  const glow = useSharedValue(0);
  const sheen = useSharedValue(0);
  const halo = useSharedValue(0);

  useEffect(() => {
    const id = setInterval(() => setPhase((p) => (p + 1) % 4), 900);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (active) {
      rotate.value = withRepeat(withTiming(1, { duration: 2600, easing: Easing.linear }), -1);
      glow.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad) }), -1, true);
      sheen.value = withRepeat(withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.cubic) }), -1, false);
      halo.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.out(Easing.quad) }), -1, false);
    } else {
      rotate.value = withTiming(0, { duration: 300 });
      glow.value = withTiming(0, { duration: 200 });
      sheen.value = withTiming(0, { duration: 200 });
      halo.value = withTiming(0, { duration: 200 });
    }
  }, [active, glow, rotate, sheen, halo]);

  const startEnd = useMemo(() => {
    switch (phase) {
      case 0:
        return { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } };
      case 1:
        return { start: { x: 1, y: 0 }, end: { x: 0, y: 1 } };
      case 2:
        return { start: { x: 1, y: 1 }, end: { x: 0, y: 0 } };
      default:
        return { start: { x: 0, y: 1 }, end: { x: 1, y: 0 } };
    }
  }, [phase]);

  const rotatingStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${rotate.value * 360}deg` }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value * 0.6,
  }));

  const sheenStyle = useAnimatedStyle(() => {
    const span = radius * 3; // 近似跨越宽度
    return {
      transform: [{ translateX: -span + sheen.value * span * 2 }],
      opacity: 0.12 + sheen.value * 0.12,
    };
  });

  const haloStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + halo.value * 0.18 }],
    opacity: 0.25 * (1 - halo.value),
  }));

  return (
    <View style={{ borderRadius: radius, overflow: 'visible' }}>
      <Animated.View style={[StyleSheet.absoluteFill, rotatingStyle]}> 
        <LinearGradient
          colors={["#4a90e2", "#8e44ad", "#4a90e2"]}
          start={startEnd.start}
          end={startEnd.end}
          style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
        />
      </Animated.View>
      {/* 外圈柔光 */}
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, glowStyle, { borderRadius: radius + 6, left: -6, right: -6, top: -6, bottom: -6, backgroundColor: 'rgba(74,144,226,0.25)' }]}
      />
      {/* 外扩光环 */}
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, haloStyle, { borderRadius: radius + 12, left: -12, right: -12, top: -12, bottom: -12, borderWidth: 2, borderColor: 'rgba(74,144,226,0.35)' }]}
      />
      <View style={{ padding: thickness }}>
        <View style={{ borderRadius: radius - thickness, backgroundColor: 'rgba(255,255,255,0.96)' }}>
          {children}
        </View>
        {/* 斜向高光扫过 */}
        <Animated.View pointerEvents="none" style={[{ position: 'absolute', top: 0, bottom: 0, width: radius * 1.2 }, sheenStyle]}>
          <LinearGradient
            colors={["rgba(255,255,255,0.0)", "rgba(255,255,255,0.35)", "rgba(255,255,255,0.0)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1, transform: [{ rotateZ: '25deg' }] }}
          />
        </Animated.View>
      </View>
      {label ? (
        <Text
          style={{
            position: 'absolute',
            top: -18,
            alignSelf: 'center',
            paddingHorizontal: 8,
            fontSize: 11,
            color: '#eaf2ff',
            textShadowColor: 'rgba(74,144,226,0.9)',
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 8,
            letterSpacing: 1,
          }}
        >
          {label}
        </Text>
      ) : null}
    </View>
  );
}

export default function Chat() {
  const { width } = Dimensions.get('window');
  const params = useLocalSearchParams<ChatParams>();
  const parsedRole: Role | null = useMemo(() => {
    try {
      if (params?.character) return JSON.parse(String(params.character)) as Role;
    } catch (e) {}
    return null;
  }, [params]);

  // 背景切换为大图（非剪影）
  const backgroundSource = useMemo(() => {
    if (parsedRole?.image) return parsedRole.image;
    return ROLES[0]?.image ?? CHARACTER_IMAGES.explorer;
  }, [parsedRole]);

  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const scrollRef = useRef<ScrollView | null>(null);
  const energy = useSharedValue(0);

  type Message = { id: string; text: string; sender: 'me' | 'role'; timestamp: number };
  const [messages, setMessages] = useState<Message[]>(() => [
    { id: 'm1', text: parsedRole?.greeting || '很高兴见到你～有什么想聊的吗？', sender: 'role', timestamp: Date.now() },
  ]);

  const onLongPressMic = useCallback(async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    setIsRecording(true);
  }, []);

  const onPressOutMic = useCallback(() => {
    setIsRecording(false);
  }, []);

  const onTogglePlay = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  // 模拟播放能量（0-1），实际可接入音频可视化回调
  useEffect(() => {
    let id: any;
    if (isPlaying) {
      const tick = () => {
        const t = Date.now() % 2000;
        const v = 0.5 + Math.sin((t / 2000) * Math.PI * 2) * 0.5; // 0-1
        energy.value = withTiming(v, { duration: 120, easing: Easing.linear });
        id = requestAnimationFrame(tick);
      };
      id = requestAnimationFrame(tick);
    } else {
      energy.value = withTiming(0.1, { duration: 240 });
    }
    return () => cancelAnimationFrame(id);
  }, [isPlaying, energy]);

  // 输入框轻微呼吸动画（提升存在感）
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 1600 }), -1, true);
  }, [pulse]);

  const isActive = isRecording || isPlaying;
  const label = isRecording ? '录音中' : isPlaying ? '播放中' : '按住说话·点击播放';

  // 背景中心同心环
  const bgPulse = useSharedValue(0);
  useEffect(() => {
    bgPulse.value = withRepeat(withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [bgPulse]);
  const ringStyle = (baseScale: number) => useAnimatedStyle(() => ({
    transform: [{ scale: baseScale + bgPulse.value * 0.02 }],
    opacity: 0.35 + bgPulse.value * 0.1,
  }));
  const r1 = ringStyle(1);
  const r2 = ringStyle(0.88);
  const r3 = ringStyle(0.76);

  // 玻璃拟物圆钮（内凹 + 高光边 + 按下弹性凹陷）
  const GlassButton = ({ children, pressed }: { children: React.ReactNode; pressed?: boolean }) => {
    const press = useSharedValue(0);
    useEffect(() => {
      press.value = withTiming(pressed ? 1 : 0, { duration: 180, easing: Easing.out(Easing.quad) });
    }, [pressed]);
    const s = useAnimatedStyle(() => ({
      transform: [{ scale: 1 - press.value * 0.06 }, { translateY: press.value * 1 }],
      shadowOpacity: 0.35 - press.value * 0.2,
    }));
    return (
      <Animated.View style={[styles.centerButton, s]}>
        {/* 内凹渐变 */}
        <LinearGradient
          colors={["rgba(255,255,255,0.95)", "rgba(245,245,255,0.6)"]}
          start={{ x: 0.2, y: 0.1 }}
          end={{ x: 0.8, y: 0.9 }}
          style={StyleSheet.absoluteFill}
        />
        {/* 高光描边 */}
        <View style={styles.glassEdge} pointerEvents="none" />
        {children}
      </Animated.View>
    );
  };

  // 简易星尘粒子漂浮
  const StarField = () => {
    const stars = new Array(24).fill(0).map((_, i) => ({
      key: `s${i}`,
      left: Math.random() * width,
      top: Math.random() * 280 + 40,
      size: Math.random() * 2 + 1,
      delay: Math.floor(Math.random() * 1200),
    }));
    return (
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {stars.map((s) => (
          <Animated.View
            key={s.key}
            entering={FadeIn.duration(600).delay(s.delay)}
            style={{ position: 'absolute', left: s.left, top: s.top, width: s.size, height: s.size, borderRadius: 9999, backgroundColor: 'rgba(255,255,255,0.85)' }}
          />
        ))}
      </View>
    );
  };

  return (
    <Animated.View style={styles.container} entering={FadeIn.duration(350)} exiting={FadeOut.duration(250)}>
      <ImageBackground source={backgroundSource} style={StyleSheet.absoluteFill} resizeMode="cover">
        <LinearGradient colors={["rgba(0,0,0,0.25)", "rgba(0,0,0,0.55)"]} style={StyleSheet.absoluteFill} />
        <StarField />
      </ImageBackground>

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex} keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}>
          {/* 顶部标题 */}
          <Animated.View style={styles.headerArea} entering={SlideInDown.springify()}>
            <Text style={styles.headerTitle}>{parsedRole?.name || 'EVOL LOVE'}</Text>
          </Animated.View>

          {/* 背景同心环装饰 */}
          <View pointerEvents="none" style={styles.ringsOverlay}>
            <Animated.View style={[styles.ring, { width: width * 0.78, height: width * 0.78 }, r1]} />
            <Animated.View style={[styles.ring, { width: width * 0.62, height: width * 0.62 }, r2]} />
            <Animated.View style={[styles.ring, { width: width * 0.48, height: width * 0.48 }, r3]} />
          </View>

          {/* 消息区域 */}
          <ScrollView ref={scrollRef} style={styles.messagesArea} contentContainerStyle={styles.messagesContent} showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
            {messages.map((m) => (
              <View key={m.id} style={[styles.messageRow, m.sender === 'me' ? styles.rowRight : styles.rowLeft]}>
                <View style={[styles.messageBubble, m.sender === 'me' ? styles.bubbleMe : styles.bubbleRole]}>
                  <Text style={[styles.messageText, m.sender === 'me' ? styles.textMe : styles.textRole]}>{m.text}</Text>
                </View>
              </View>
            ))}
            <View style={{ height: 8 }} />
          </ScrollView>

          {/* 底部输入区 */}
          <Animated.View style={styles.inputBarWrapper} entering={SlideInUp.springify()}>
            <GradientBorderBubble active={isActive} label={label}>
              <TouchableOpacity
                activeOpacity={0.9}
                onLongPress={onLongPressMic}
                onPressOut={onPressOutMic}
                delayLongPress={220}
                style={styles.inputInnerCenter}
                onPress={onTogglePlay}
              >
                {/* 扩散波纹 */}
                <RippleWaves active={isRecording || isPlaying} energy={energy} />
                <GlassButton pressed={isRecording || isPlaying}>
                  <Ionicons name={isPlaying ? 'pause' : 'play'} size={22} color={isPlaying ? '#e74c3c' : '#4a90e2'} />
                  {/* 播放可视化条 */}
                  {isPlaying ? <PlayVisualizer active energy={energy} /> : null}
                </GlassButton>
              </TouchableOpacity>
            </GradientBorderBubble>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  headerArea: {
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  headerTitle: {
    fontSize: 18,
    color: '#eaf2ff',
    fontWeight: '700',
    letterSpacing: 1,
    textShadowColor: 'rgba(74,144,226,0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  messagesArea: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  ringsOverlay: {
    position: 'absolute',
    top: '16%',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: 'rgba(234, 242, 255, 0.35)',
    shadowColor: '#4a90e2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  inputBarWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  inputInnerCenter: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
  },
  centerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#4a90e2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  glassEdge: {
    position: 'absolute',
    top: 1,
    left: 1,
    right: 1,
    bottom: 1,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  rippleWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ripple: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 9999,
  },
  visualizer: {
    position: 'absolute',
    bottom: -12,
    left: 0,
    right: 0,
    height: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 3,
  },
  vbar: {
    width: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(74,144,226,0.7)',
    marginHorizontal: 2,
  },
  micDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e74c3c',
    right: 8,
    top: 8,
  },
  messageRow: {
    marginVertical: 6,
    flexDirection: 'row',
  },
  rowRight: {
    justifyContent: 'flex-end',
  },
  rowLeft: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '78%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  bubbleMe: {
    backgroundColor: 'rgba(74,144,226,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(74,144,226,0.35)',
    alignSelf: 'flex-end',
  },
  bubbleRole: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  textMe: {
    color: '#eaf2ff',
  },
  textRole: {
    color: 'rgba(255,255,255,0.92)',
  },
});


