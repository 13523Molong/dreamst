import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { ChatMessage } from '../types/role';
import { COLORS } from '../assets';

interface ChatBubbleProps {
  message: ChatMessage;
  isUser: boolean;
  roleAvatar?: string;
}

const { width } = Dimensions.get('window');
const MAX_BUBBLE_WIDTH = width * 0.75;

export default function ChatBubble({ message, isUser, roleAvatar }: ChatBubbleProps) {
  return (
    <View style={[
      styles.container,
      isUser ? styles.userContainer : styles.roleContainer
    ]}>
      {!isUser && roleAvatar && (
        <Image
          source={{ uri: roleAvatar }}
          style={styles.avatar}
        />
      )}
      <View style={[
        styles.bubble,
        isUser ? styles.userBubble : styles.roleBubble,
      ]}>
        <Text style={[
          styles.text,
          isUser ? styles.userText : styles.roleText
        ]}>
          {message.content}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 4,
    alignItems: 'flex-end',
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  roleContainer: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: MAX_BUBBLE_WIDTH,
    padding: 12,
    borderRadius: 20,
    marginBottom: 4,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  roleBubble: {
    backgroundColor: COLORS.background.paper,
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 16,
    lineHeight: 20,
  },
  userText: {
    color: COLORS.background.paper,
  },
  roleText: {
    color: COLORS.text.primary,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
});