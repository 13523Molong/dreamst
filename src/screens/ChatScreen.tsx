import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Keyboard,
  Dimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ChatBubble from '../components/ChatBubble';
import { Role, ChatMessage } from '../types/role';
import { COLORS } from '../assets';

type RootStackParamList = {
  Home: undefined;
  Chat: { role: Role };
};

type ChatScreenProps = NativeStackScreenProps<RootStackParamList, 'Chat'>;

const { width } = Dimensions.get('window');

export default function ChatScreen({ route }: ChatScreenProps) {
  const { role } = route.params;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    // 添加欢迎消息
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      roleId: role.id,
      content: `你好！我是${role.name}。${role.description}`,
      timestamp: Date.now(),
      type: 'text',
    };
    setMessages([welcomeMessage]);

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [role]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      roleId: 'user',
      content: inputText.trim(),
      timestamp: Date.now(),
      type: 'text',
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // 模拟角色回复
    setTimeout(() => {
      const roleResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        roleId: role.id,
        content: `我理解你的意思。作为${role.name}，我会根据我的专长来回应你的消息。`,
        timestamp: Date.now(),
        type: 'text',
      };
      setMessages(prev => [...prev, roleResponse]);
      
      // 滚动到最新消息
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ChatBubble
              message={item}
              isUser={item.roleId === 'user'}
              roleAvatar={item.roleId === role.id ? role.avatar : undefined}
            />
          )}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="输入消息..."
            placeholderTextColor={COLORS.text.light}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled
            ]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <View style={[
              styles.sendButtonInner,
              !inputText.trim() && styles.sendButtonInnerDisabled
            ]} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.default,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    padding: 16,
    paddingBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: COLORS.background.paper,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: COLORS.background.default,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    color: COLORS.text.primary,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.text.light,
  },
  sendButtonInner: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: COLORS.background.paper,
    transform: [{ rotate: '90deg' }],
  },
  sendButtonInnerDisabled: {
    borderBottomColor: COLORS.background.default,
  },
});