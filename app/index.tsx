/**
 * 角色选择主页面
 * 
 * @description 恋与制作人风格的角色选择界面，支持滑动选择、动态缩放和角色信息展示
 * @author 开发团队
 * @version 1.0.0
 * 
 * 主要功能：
 * - 水平滑动角色列表
 * - 中央角色放大显示
 * - 非中央角色淡化处理
 * - 角色信息动态展示
 * - 触觉反馈和音效
 * - 流畅的页面转场动画
 */

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Platform,
  Image as RNImage,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, {
  Extrapolate,
  FadeOut,
  interpolate,
  SlideInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';

// 导入自定义组件和服务
import AudioService from '../components/AudioService';
import { ANIMATION_CONFIG, ROLES, UI_CONFIG } from '../config/characters';
import type { Role } from '../types';

// 获取设备屏幕尺寸
const { width, height } = Dimensions.get('window');

// 将 AnimatedRoleItem 提升到最外层
import type { ViewStyle } from 'react-native';

  const AnimatedRoleItem = React.memo(({ 
  item, 
  index, 
  scrollX, 
  renderItem,
  selectedIndex
}: { 
  item: Role; 
  index: number; 
  scrollX: import('react-native-reanimated').SharedValue<number>;
  renderItem: ({ item, index, isCentered }: { item: Role; index: number; isCentered: boolean }) => React.ReactElement;
  selectedIndex: number;
}) => {
  const animatedStyle = useAnimatedStyle((): ViewStyle => {
    'worklet';
    
    // 安全检查 scrollX.value
    const scrollValue = scrollX.value || 0;
    
    // 使用配置常量计算布局参数
    const cardWidth = width * UI_CONFIG.CARD_WIDTH_RATIO;
    const spacing = UI_CONFIG.CARD_SPACING;
    const inputRange = [
      (index - 1) * (cardWidth + spacing),
      index * (cardWidth + spacing),
      (index + 1) * (cardWidth + spacing),
    ];

    // 增强动画效果，确保中央角色明显放大，其他角色明显缩小和淡化
    const scale = interpolate(
      scrollValue,
      inputRange,
      [UI_CONFIG.NON_CENTERED_SCALE, UI_CONFIG.CENTERED_SCALE, UI_CONFIG.NON_CENTERED_SCALE],
      Extrapolate.CLAMP
    );
    
    // 更明显的透明度变化，强调中央角色
    const opacity = interpolate(
      scrollValue,
      inputRange,
      [UI_CONFIG.NON_CENTERED_OPACITY, UI_CONFIG.CENTERED_OPACITY, UI_CONFIG.NON_CENTERED_OPACITY],
      Extrapolate.CLAMP
    );

    // 垂直位移效果，让中央角色向上浮起
    const translateY = interpolate(
      scrollValue,
      inputRange,
      [35, -10, 35], // 中央角色向上浮起，其他角色下沉
      Extrapolate.CLAMP
    );

    // 轻微旋转效果增强立体感
    const rotateZ = interpolate(
      scrollValue,
      inputRange,
      [-5, 0, 5],
      Extrapolate.CLAMP
    );

    // 添加模糊效果的模拟（通过透明度和缩放）
    const blur = interpolate(
      scrollValue,
      inputRange,
      [1, 0, 1], // 中央角色清晰，其他模糊
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { scale: scale || 1 },
        { translateY: translateY || 0 },
        { rotateZ: `${rotateZ || 0}deg` }
      ],
      opacity: opacity || 1,
      // 添加阴影效果增强层次感
      shadowOpacity: interpolate(
        scrollValue,
        inputRange,
        [0.1, 0.25, 0.1],
        Extrapolate.CLAMP
      ),
      shadowRadius: interpolate(
        scrollValue,
        inputRange,
        [5, 15, 5],
        Extrapolate.CLAMP
      ),
    };
  });

  // Calculate if this item is centered (or very close to center)
  const isCentered = index === selectedIndex;

      return (
      <Animated.View
        style={[
          animatedStyle,
          { 
            width: width * UI_CONFIG.CARD_WIDTH_RATIO + (isCentered ? width * 0.6 : 0), // 为中央角色的信息区域预留更多宽度
            marginHorizontal: UI_CONFIG.CARD_SPACING / 2,
            // 为中央角色添加额外的z-index
            zIndex: isCentered ? 10 : 1,
            alignItems: 'center',
          }
        ]}
      >
        {renderItem({ item, index, isCentered })}
      </Animated.View>
    );
});

// 动画样式组件
const AnimatedCard = React.memo(({ 
  children,
  isSelected,
  isOtherSelected,
  expandingStyle,
  fadingStyle
}: { 
  children: React.ReactNode;
  isSelected: boolean;
  isOtherSelected: boolean;
  expandingStyle: any;
  fadingStyle: any;
}) => {
  return (
    <Animated.View
      entering={SlideInDown.springify()}
      exiting={FadeOut}
      style={[
        isSelected ? expandingStyle : isOtherSelected ? fadingStyle : undefined,
        { opacity: isOtherSelected ? 0.3 : 1 }
      ]}
    >
      {children}
    </Animated.View>
  );
});

// 动画样式
const useAnimatedStyles = (expandingRoleId: string | null) => {
  const expandingStyle = useAnimatedStyle(() => {
    'worklet';
    if (!expandingRoleId) return {};
    return {
      zIndex: 10,
      transform: [
        { scale: withSpring(1.15) },
        { translateY: withSpring(-20) },
      ],
    };
  });

  const fadingStyle = useAnimatedStyle(() => {
    'worklet';
    if (!expandingRoleId) return {};
    return {
      opacity: withTiming(0, { duration: 300 }),
    };
  });

  return { expandingStyle, fadingStyle };
};

/**
 * 角色选择主页面组件
 * 
 * @description 主要的角色选择界面，管理角色列表展示和用户交互
 * @returns {JSX.Element} 角色选择页面组件
 */
export default function Index() {
  // === 路由和导航 ===
  const router = useRouter();
  
  // === 状态管理 ===
  /** 搜索输入文本 */
  const [searchText, setSearchText] = useState('');
  
  /** 过滤后的角色列表 */
  const [filteredRoles, setFilteredRoles] = useState(ROLES);
  
  /** 是否正在搜索状态 */
  const [isSearching, setIsSearching] = useState(false);
  
  /** 当前选中的角色索引 */
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  /** 正在执行展开动画的角色ID */
  const [expandingRoleId, setExpandingRoleId] = useState<string | null>(null);
  
  // === 引用管理 ===
  /** 搜索输入框引用 */
  const searchInputRef = useRef<TextInput>(null);
  
  /** 角色列表引用 */
  const flatListRef = useRef<FlatList<Role>>(null);
  
  // === 动画共享值 ===
  /** 垂直滚动位置 */
  const scrollY = useSharedValue(0);
  
  /** 搜索栏高度动画 */
  const searchBarHeight = useSharedValue(0);
  
  // === 服务实例 ===
  /** 音频服务实例 */
  const audioService = AudioService.getInstance();

  /**
   * 搜索功能处理函数
   * 
   * @param {string} text - 搜索关键词
   * @description 根据角色名称和标签进行模糊搜索
   */
  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text.trim() === '') {
      setFilteredRoles(ROLES);
      setIsSearching(false);
    } else {
      const filtered = ROLES.filter(role => 
        role.name.toLowerCase().includes(text.toLowerCase()) ||
        role.tags.some(tag => tag.toLowerCase().includes(text.toLowerCase()))
      );
      setFilteredRoles(filtered);
      setIsSearching(true);
    }
  };

  // 角色选择处理
  const handleRoleSelect = async (role: Role, index: number) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setSelectedIndex(index);
      setExpandingRoleId(role.id); // 触发扩展动画
      
      // 将选中的角色滚动到中间
      if (flatListRef.current) {
        flatListRef.current.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.5
        });
      }
    } catch (error) {
      console.error('选择角色时出错:', error);
    }
  };

  // 搜索栏动画
  const searchBarAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    const translateY = searchBarHeight.value || 0;
    return {
      transform: [
        {
          translateY: withSpring(translateY, {
            damping: 15,
            stiffness: 100,
          }),
        },
      ],
    };
  });

  // 列表项动画
/**
* 渲染角色列表项的函数
*
* @param param0 包含角色信息和索引的对象
* @returns 返回渲染后的角色列表项组件
*/
  /**
   * 渲染角色列表项的函数
   * 
   * @description 根据恋与制作人的设计风格渲染角色卡片，文字介绍位于角色下方
   * @param item 角色数据对象
   * @param index 角色在列表中的索引
   * @param isCentered 是否位于屏幕中央
   * @returns 返回渲染后的角色列表项组件
   */
  const renderItem = ({ item, index, isCentered }: { item: Role; index: number; isCentered: boolean }) => {
    const isSelected = selectedIndex === index;
    const { expandingStyle, fadingStyle } = useAnimatedStyles(expandingRoleId);
    
    return (
      <AnimatedCard
        isSelected={isSelected}
        isOtherSelected={false}
        expandingStyle={expandingStyle}
        fadingStyle={fadingStyle}
      >
        <View style={styles.characterItemContainer}>
          {/* 角色卡片 */}
          <TouchableOpacity
            onPress={() => !expandingRoleId && handleRoleSelect(item, index)}
            activeOpacity={0.9}
            style={[
              styles.cardContainer,
              // 中央角色的特殊样式
              isCentered && {
                backgroundColor: 'rgba(255,255,255,0.95)',
                borderColor: '#e8e8e8',
                shadowOpacity: 0.3,
                shadowRadius: 20,
                elevation: 15,
                borderWidth: 2,
              },
              // 非中央角色的淡化样式
              !isCentered && {
                backgroundColor: 'rgba(255,255,255,0.6)',
                borderColor: 'rgba(200,200,200,0.4)',
                shadowOpacity: 0.1,
              }
            ]}
            disabled={!!expandingRoleId}
          >
            {/* 渐变背景 - 根据是否居中调整 */}
            <LinearGradient
              colors={isCentered 
                ? ['#fafafa', '#f0f0f0', '#e8e8e8'] 
                : ['#f5f5f5', '#f0f0f0']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />
            
            {/* 角色剪影容器 */}
            <View style={styles.characterSilhouette}>
              <RNImage
                source={item.silhouette}
                style={[
                  styles.silhouetteImage, 
                  // 中央角色的图片样式增强
                  isCentered && styles.centeredSilhouetteImage
                ]}
                resizeMode="contain"
              />
              
              {/* 高光效果 */}
              <LinearGradient
                colors={isCentered 
                  ? ["rgba(255,255,255,0.4)", "rgba(255,255,255,0.1)", "transparent"]
                  : ["rgba(255,255,255,0.15)", "transparent"]}
                style={[
                  styles.cardHighlight,
                  { opacity: isCentered ? 1 : 0.5 }
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              
              {/* 选中时的光晕效果 */}
              {isCentered && (
                <>
                  <View style={styles.selectionGlow} />
                  {/* 添加脉冲效果 */}
                  <View style={styles.pulseGlow} />
                </>
              )}
            </View>
          </TouchableOpacity>
          
          {/* 角色信息 - 移动到卡片下方，只在居中时显示 */}
          {isCentered && (
            <Animated.View
              entering={SlideInDown.duration(400).springify().damping(15)}
              style={styles.characterInfoContainer}
            >
              {/* 角色名称和标识 */}
              <View style={styles.nameRow}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.promote}>{item.promote}</Text>
              </View>
              
              {/* 角色描述 */}
              <Text style={styles.desc}>{item.description}</Text>
              
              {/* 标签容器 */}
              <View style={styles.tagsContainer}>
                {item.tags.map((tag, tagIndex) => (
                  <View key={tagIndex} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
              
              {/* 陪伴信息 */}
              <View style={styles.accompanyInfo}>
                <Ionicons name="time-outline" size={14} color="#888" />
                <Text style={styles.accompanyText}>陪伴 {item.accompanyDays} 天</Text>
              </View>
              
              {/* 点击提示 */}
              <View style={styles.tapHint}>
                <Text style={styles.tapHintText}>点击进入对话</Text>
                <Ionicons name="chevron-forward" size={16} color="#999" />
              </View>
            </Animated.View>
          )}
        </View>
      </AnimatedCard>
    );
  };

  // 监听扩展动画结束后跳转
  useEffect(() => {
    if (expandingRoleId) {
      const timer = setTimeout(() => {
        const role = ROLES.find(r => r.id === expandingRoleId);
        if (role) {
          router.push({
            pathname: '/dialogue',
            params: { character: JSON.stringify(role) }
          });
        }
        setExpandingRoleId(null);
      }, ANIMATION_CONFIG.TRANSITION_DURATION);
      return () => clearTimeout(timer);
    }
  }, [expandingRoleId]);

  useFocusEffect(
    React.useCallback(() => {
      setExpandingRoleId(null);
    }, [])
  );


  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      {/* 灰白渐变背景 */}
      <LinearGradient
        colors={["#f5f5f5", "#e0e0e0"]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {/* 顶部柔和白色光效 */}
      <LinearGradient
        colors={["rgba(73, 41, 41, 0.5)", "transparent"]}
        style={styles.topGlow}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      {/* 底部柔和白色光效 */}
      <LinearGradient
        colors={["rgba(220,220,220,0.4)", "transparent"]}
        style={styles.bottomGlow}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
      />
      {/* 圆形装饰 */}
      <View style={styles.centerCircle} />
      {/* 标题区域 */}
      <View style={styles.titleContainer}>
        <LinearGradient
          colors={["rgba(255,255,255,0.2)", "transparent"]}
          style={styles.titleGradient}
        />
        <Text style={styles.title}>EVOL LOVE</Text>
      </View>
      {/* 背景花纹图片 */}
      <RNImage
        source={require('../assets/images/partial-react-logo.png')}
        style={styles.bgPattern}
        resizeMode="contain"
      />
      {/* 角色列表 */}
      <View style={styles.roleListContainer}>
        <RoleList 
          renderItem={renderItem} 
          roles={filteredRoles}
          selectedIndex={selectedIndex}
          onSelectIndex={setSelectedIndex}
          flatListRef={flatListRef}
        />
        {/* 添加底部指示器 */}
        <View style={styles.indicatorContainer}>
          {filteredRoles.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.indicator, 
                selectedIndex === index && styles.indicatorActive
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const RoleList = React.memo(({
  renderItem,
  roles,
  selectedIndex,
  onSelectIndex,
  flatListRef
}: {
  renderItem: ({ item, index, isCentered }: { item: Role; index: number; isCentered: boolean }) => React.ReactElement;
  roles: Role[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  flatListRef: React.RefObject<FlatList<Role> | null>;
}): React.ReactElement => {
  const scrollX = useSharedValue(0);
  
  const onScroll = (event: any) => {
    'worklet';
    if (event?.nativeEvent?.contentOffset?.x !== undefined) {
      scrollX.value = event.nativeEvent.contentOffset.x;
    }
  };

  /**
   * 获取FlatList项目布局信息
   * 
   * @param _ 忽略的参数
   * @param index 项目索引
   * @returns 布局信息对象
   */
  const getItemLayout = (_: any, index: number) => {
    const itemWidth = width * UI_CONFIG.CARD_WIDTH_RATIO + UI_CONFIG.CARD_SPACING;
    return {
      length: itemWidth,
      offset: itemWidth * index,
      index,
    };
  };

  /**
   * 处理滚动结束时的对齐逻辑
   * 
   * @param event 滚动事件对象
   * @description 计算最接近中央的角色并更新选中状态
   */
  const snapToAlignment = (event: any) => {
    const position = event.nativeEvent.contentOffset.x;
    const cardWidth = width * UI_CONFIG.CARD_WIDTH_RATIO;
    const spacing = UI_CONFIG.CARD_SPACING;
    const itemWidth = cardWidth + spacing;
    
    // 计算当前最接近中央的角色索引
    let index = Math.round(position / itemWidth);
    
    // 确保索引在有效范围内
    index = Math.max(0, Math.min(index, roles.length - 1));
    
    // 只有当索引真正改变时才更新
    if (index !== selectedIndex && index >= 0 && index < roles.length) {
      // 添加触觉反馈
      Haptics.selectionAsync().catch(() => {});
      onSelectIndex(index);
    }
  };

  const renderAnimatedItem = ({ item, index }: { item: Role; index: number }) => (
    <AnimatedRoleItem
      item={item}
      index={index}
      scrollX={scrollX}
      renderItem={renderItem}
      selectedIndex={selectedIndex}
    />
  );

  return (
    <FlatList
      ref={flatListRef}
      data={roles}
      keyExtractor={(item) => item.id}
      renderItem={renderAnimatedItem}
      contentContainerStyle={[
        styles.listContainer,
        { 
          paddingHorizontal: (width - width * UI_CONFIG.CARD_WIDTH_RATIO) / 2,
          alignItems: 'center',
        }
      ]}
      horizontal
      showsHorizontalScrollIndicator={false}
      onScroll={onScroll}
      scrollEventThrottle={16} // 优化响应性
      decelerationRate={Platform.OS === 'ios' ? 0.85 : 'normal'} // 更平滑的减速
      getItemLayout={getItemLayout}
      onMomentumScrollEnd={snapToAlignment}
      onScrollEndDrag={snapToAlignment} // 添加拖拽结束监听
      initialScrollIndex={0}
      pagingEnabled={false}
      bounces={true}
      // 移除snapToInterval，我们手动处理对齐
      // snapToInterval={width * UI_CONFIG.CARD_WIDTH_RATIO + UI_CONFIG.CARD_SPACING}
      // snapToAlignment="center"
    />
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  titleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    zIndex: 10,
  },
  titleGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  title: {
    position: 'absolute',
    top: 40,
    width: '100%',
    textAlign: 'center',
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 8,
    textShadowColor: 'rgba(74, 158, 255, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  searchContainer: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#1a1a2e',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a3e',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 0,
  },
  listContainer: {
    paddingVertical: height * 0.12,
    paddingHorizontal: width * 0.05,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: height * 0.25, // 为下方文字信息留出更多空间
  },
  cardContainer: {
    width: width * UI_CONFIG.CARD_WIDTH_RATIO, // 使用配置常量设置卡片宽度
    height: height * UI_CONFIG.CARD_HEIGHT_RATIO, // 使用配置常量设置卡片高度
    marginHorizontal: UI_CONFIG.CARD_SPACING / 2, // 使用配置常量设置卡片间距
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(200,200,200,0.3)',
    shadowColor: '#bbb',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  bottomGlow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    zIndex: 1,
  },
  topGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    zIndex: 1,
  },
  card: {
    width: 180,
    height: 320,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderRadius: 12,
    overflow: 'hidden',
    padding: 0,
  },
  characterSilhouette: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  silhouetteImage: {
    width: '80%',
    height: '80%',
    opacity: 0.9,
  },
  centeredSilhouetteImage: {
    width: '85%',
    height: '85%',
    opacity: 1,
  },
  selectionGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 3,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8,
  },
  // 角色整体容器，包含卡片和下方信息
  characterItemContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  // 角色信息容器，位于卡片下方
  characterInfoContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(200,200,200,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    maxWidth: width * 0.8,
    minWidth: width * 0.6,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginRight: 8,
  },
  promote: {
    fontSize: 11,
    color: '#64b5f6',
    backgroundColor: 'rgba(100, 181, 246, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(100, 181, 246, 0.3)',
  },
  desc: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    marginTop: 2,
    lineHeight: 18,
    letterSpacing: 0.3,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(74, 144, 226, 0.3)',
  },
  tagText: {
    fontSize: 12,
    color: '#4a90e2',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  accompanyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  accompanyText: {
    fontSize: 12,
    color: '#888',
    marginLeft: 4,
    fontWeight: '500',
  },
  chevron: {
    marginLeft: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  bgPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0.13,
    zIndex: 0,
  },
  cardHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  centerCircle: {
    position: 'absolute',
    top: '10%',
    left: '10%',
    width: '80%',
    height: '80%',
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.45)',
    zIndex: 0,
  },
  roleListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    height: 10,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginHorizontal: 4,
  },
  indicatorActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4a90e2',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#4a90e2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
  },
  // 新增样式：脉冲光晕效果
  pulseGlow: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 13,
    backgroundColor: 'rgba(74, 144, 226, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.3)',
  },
  // 新增样式：点击提示区域
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    borderRadius: 15,
    borderWidth: 0.5,
    borderColor: 'rgba(74, 144, 226, 0.2)',
  },
  tapHintText: {
    fontSize: 11,
    color: '#4a90e2',
    fontWeight: '500',
    marginRight: 4,
    letterSpacing: 0.3,
  },
}); 