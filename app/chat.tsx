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
 import { Dimensions, ImageBackground, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal, Pressable } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import Animated, { Easing, FadeIn, FadeOut, SlideInDown, SlideInUp, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

 import { CHARACTER_IMAGES, ROLES } from '../config/characters';
import type { Role } from '../types';
 import { fetchHistoryMessages } from '../components/UploadService';
 import { API_CONFIG } from '../config/app.config';

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

function GradientBorderBubble({ children, radius = 34, thickness = 2, active = false, label, fillColor = 'rgba(255,255,255,0.96)' }: { children: React.ReactNode; radius?: number; thickness?: number; active?: boolean; label?: string; fillColor?: string }) {
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
        <View style={{ borderRadius: radius - thickness, backgroundColor: fillColor }}>
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
  const [isTyping, setIsTyping] = useState(false);
  const [inputText, setInputText] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [history, setHistory] = useState<{ id: string; conversation_id: string; sender: 'user' | 'role' | 'system' | 'hardware'; text?: string; created_at: string }[]>([]);

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

  // 圆形/气泡模式切换
  const hasRoleMessage = useMemo(() => messages.some((m) => m.sender === 'role'), [messages]);
  const latestRoleText = useMemo(() => {
    const list = messages.filter((m) => m.sender === 'role');
    return list.length ? list[list.length - 1].text : '';
  }, [messages]);
  const bubbleMode = useSharedValue(0); // 0: circle, 1: pill
  const isCircle = !hasRoleMessage && !isTyping;
  const circleSize = 84;
  const pillWidth = Math.min(width * 0.92, 392);
  const pillHeight = 100;
  useEffect(() => {
    bubbleMode.value = withTiming(isCircle ? 0 : 1, { duration: 260, easing: Easing.out(Easing.quad) });
  }, [isCircle, bubbleMode]);
  const bubbleStyle = useAnimatedStyle(() => ({
    width: circleSize + (pillWidth - circleSize) * bubbleMode.value,
    height: circleSize + (pillHeight - circleSize) * bubbleMode.value,
    alignSelf: 'center',
  }));

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
  const renderHeaderActions = () => {
    return (
      <View style={{ position: 'absolute', right: 12, top: 4, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <TouchableOpacity
          onPress={async () => {
            try {
              setShowHistory(true);
              setHistoryLoading(true);
              // TODO: 替换为实际用户ID与后端地址
              const userId = 'demo-user-001';
              const roleId = parsedRole?.id;
              const baseUrl = API_CONFIG.baseUrl;
              const data = await fetchHistoryMessages({ baseUrl, userId, roleId, limit: 100 });
              setHistory(data);
            } catch (e) {
              console.warn(e);
            } finally {
              setHistoryLoading(false);
            }
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={{ padding: 8 }}
        >
          <Ionicons name="time-outline" size={22} color="#eaf2ff" />
        </TouchableOpacity>
      </View>
    );
  };

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
            {renderHeaderActions()}
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

          {/* 圆形/气泡自适应对话框：无消息时圆形（点击输入/长按录音），有消息后气泡显示文字 */}
          <Animated.View style={styles.dialogWrapper} entering={SlideInUp.springify()}>
            <Animated.View style={bubbleStyle}>
              <GradientBorderBubble active={isActive || isTyping} label={!hasRoleMessage ? '点击输入 · 长按语音' : undefined} fillColor={'rgba(255,255,255,0.22)'}>
                {/* 内容层：圆形模式 -> 中心按钮；气泡模式 -> 文本内容 */}
                {isCircle ? (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => setIsTyping(true)}
                    onLongPress={onLongPressMic}
                    onPressOut={onPressOutMic}
                    delayLongPress={220}
                    style={styles.circleContent}
                  >
                    <RippleWaves active={isRecording || isPlaying} energy={energy} />
                    <GlassButton pressed={isRecording || isPlaying}>
                      <Ionicons name={isPlaying ? 'pause' : 'play'} size={22} color={isPlaying ? '#e74c3c' : '#4a90e2'} />
                    </GlassButton>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.pillContent}>
                    <Text style={styles.pillText} numberOfLines={2}>
                      {latestRoleText || '...'}
                    </Text>
                  </View>
                )}
              </GradientBorderBubble>
            </Animated.View>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* 历史会话弹窗 */}
      <Modal visible={showHistory} transparent animationType="fade" onRequestClose={() => setShowHistory(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ maxHeight: '68%', backgroundColor: '#121418', borderTopLeftRadius: 18, borderTopRightRadius: 18, paddingTop: 10 }}>
            <View style={{ paddingHorizontal: 16, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ color: '#eaf2ff', fontSize: 16, fontWeight: '700' }}>历史会话</Text>
              <Pressable onPress={() => setShowHistory(false)} style={{ padding: 6 }}>
                <Ionicons name="close" size={22} color="#eaf2ff" />
              </Pressable>
            </View>
            <ScrollView style={{ paddingHorizontal: 12 }} contentContainerStyle={{ paddingBottom: 24 }}>
              {historyLoading ? (
                <Text style={{ color: '#9fb3d1', textAlign: 'center', paddingVertical: 20 }}>加载中...</Text>
              ) : history.length === 0 ? (
                <Text style={{ color: '#9fb3d1', textAlign: 'center', paddingVertical: 20 }}>暂无历史</Text>
              ) : (
                history.map((m) => (
                  <View key={m.id} style={{ marginVertical: 6, flexDirection: 'row', justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                    <View style={{ maxWidth: '82%', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12, backgroundColor: m.sender === 'user' ? 'rgba(74,144,226,0.18)' : 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: m.sender === 'user' ? 'rgba(74,144,226,0.35)' : 'rgba(255,255,255,0.25)' }}>
                      <Text style={{ color: '#eaf2ff', fontSize: 14, lineHeight: 19 }}>
                        {(m.sender === 'system' ? '角色' : m.sender === 'role' ? '角色' : '玩家') + '：'}{m.text || ''}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  dialogWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  inputInnerCenter: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
  },
  dialogBubble: {
    minHeight: 72,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleContent: {
    height: 84,
    width: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillContent: {
    minHeight: 88,
    minWidth: 160,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  pillText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 15,
    lineHeight: 20,
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


