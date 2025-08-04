import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
import { 
  FlatList, 
  Image, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  TextInput,
  Dimensions,
  StatusBar,
  Platform
} from 'react-native';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInDown, 
  SlideOutUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  runOnJS
} from 'react-native-reanimated';
import { SharedElement } from 'react-navigation-shared-element';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import AudioService from '../components/AudioService';

const { width, height } = Dimensions.get('window');

// 定义角色类型
export type Role = {
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

const roles: Role[] = [
  { 
    id: '1', 
    name: '探索者', 
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face', 
    description: '喜欢探险和未知，充满好奇心。',
    image: { uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop' },
    promote: '勇敢的冒险家',
    tags: ['冒险', '探索', '勇敢'],
    greeting: '你好！我是探索者，准备好和我一起踏上未知的旅程了吗？',
    accompanyDays: 0
  },
  { 
    id: '2', 
    name: '学者', 
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face', 
    description: '热爱学习与知识，智慧深邃。',
    image: { uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop' },
    promote: '智慧的学者',
    tags: ['智慧', '学习', '知识'],
    greeting: '欢迎！我是学者，让我们一起探索知识的海洋吧。',
    accompanyDays: 0
  },
  { 
    id: '3', 
    name: '艺术家', 
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face', 
    description: '富有创造力和艺术天赋。',
    image: { uri: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop' },
    promote: '创意艺术家',
    tags: ['艺术', '创意', '灵感'],
    greeting: '嗨！我是艺术家，让我们一起创造美好的事物吧！',
    accompanyDays: 0
  },
];

export default function Index() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [filteredRoles, setFilteredRoles] = useState(roles);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<TextInput>(null);
  const scrollY = useSharedValue(0);
  const searchBarHeight = useSharedValue(0);
  const audioService = AudioService.getInstance();

  // 搜索功能
  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text.trim() === '') {
      setFilteredRoles(roles);
      setIsSearching(false);
    } else {
      const filtered = roles.filter(role => 
        role.name.toLowerCase().includes(text.toLowerCase()) ||
        role.tags.some(tag => tag.toLowerCase().includes(text.toLowerCase()))
      );
      setFilteredRoles(filtered);
      setIsSearching(true);
    }
  };

  // 角色选择处理
  const handleRoleSelect = async (role: Role) => {
    try {
      // 触觉反馈
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // 播放角色问候语（这里可以集成语音合成）
      console.log(`播放问候语: ${role.greeting}`);
      
      // 跳转到对话页面
      router.push({
        pathname: '/dialogue',
        params: { character: JSON.stringify(role) }
      });
    } catch (error) {
      console.error('选择角色时出错:', error);
    }
  };

  // 搜索栏动画
  const searchBarAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: withSpring(searchBarHeight.value, {
            damping: 15,
            stiffness: 100,
          }),
        },
      ],
    };
  });

  // 列表项动画
  const renderItem = ({ item, index }: { item: Role; index: number }) => (
    <Animated.View
      entering={SlideInDown.delay(index * 100).springify()}
      exiting={FadeOut}
    >
      <TouchableOpacity
        onPress={() => handleRoleSelect(item)}
        activeOpacity={0.8}
        style={styles.cardContainer}
      >
        <SharedElement id={`item.${item.id}.photo`}>
          <View style={styles.card}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.cardContent}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.promote}>{item.promote}</Text>
              </View>
              <Text style={styles.desc}>{item.description}</Text>
              <View style={styles.tagsContainer}>
                {item.tags.map((tag, tagIndex) => (
                  <View key={tagIndex} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.accompanyInfo}>
                <Ionicons name="time-outline" size={14} color="#888" />
                <Text style={styles.accompanyText}>陪伴 {item.accompanyDays} 天</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
          </View>
        </SharedElement>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      
      {/* 搜索栏 */}
      <Animated.View style={[styles.searchContainer, searchBarAnimatedStyle]}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="搜索角色名称或标签..."
            placeholderTextColor="#888"
            value={searchText}
            onChangeText={handleSearch}
            onFocus={() => setIsSearching(true)}
            onBlur={() => !searchText && setIsSearching(false)}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color="#888" />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {/* 角色列表 */}
      <FlatList
        data={filteredRoles}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={() => {
          // 滚动时播放钢琴轻音乐
          audioService.playBackgroundMusic();
        }}
        onScrollEndDrag={() => {
          // 停止音乐播放
          audioService.stopBackgroundMusic();
        }}
      />

      {/* 空状态 */}
      {filteredRoles.length === 0 && searchText && (
        <Animated.View entering={FadeIn} style={styles.emptyState}>
          <Ionicons name="search-outline" size={48} color="#888" />
          <Text style={styles.emptyText}>未找到相关角色</Text>
          <Text style={styles.emptySubtext}>试试其他关键词吧</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
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
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cardContainer: {
    marginBottom: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#2a2a3e',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginRight: 8,
  },
  promote: {
    fontSize: 12,
    color: '#64b5f6',
    backgroundColor: 'rgba(100, 181, 246, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  desc: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 8,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#fff',
  },
  accompanyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accompanyText: {
    fontSize: 12,
    color: '#888',
    marginLeft: 4,
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
}); 