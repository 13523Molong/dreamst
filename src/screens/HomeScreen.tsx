import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DEFAULT_ROLES, Role } from '../types/role';
import { COLORS } from '../assets';

type RootStackParamList = {
  Home: undefined;
  Chat: { role: Role };
};

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const GRID_PADDING = 16;
const GRID_SPACING = 12;
const CARD_WIDTH = (width - (GRID_PADDING * 2) - (GRID_SPACING * (COLUMN_COUNT - 1))) / COLUMN_COUNT;

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const renderRoleCard = ({ item }: { item: Role }) => (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: item.backgroundColor || COLORS.background.paper }
      ]}
      onPress={() => navigation.navigate('Chat', { role: item })}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <Image
          source={{ uri: item.avatar }}
          style={styles.avatar}
        />
        <Text style={styles.roleName}>{item.name}</Text>
        <Text style={styles.roleDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>选择角色</Text>
        <Text style={styles.subtitle}>与不同角色开始对话</Text>
      </View>
      <FlatList
        data={DEFAULT_ROLES}
        renderItem={renderRoleCard}
        keyExtractor={item => item.id}
        numColumns={COLUMN_COUNT}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.default,
  },
  header: {
    padding: GRID_PADDING,
    backgroundColor: COLORS.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  grid: {
    padding: GRID_PADDING,
  },
  card: {
    width: CARD_WIDTH,
    marginBottom: GRID_SPACING,
    marginRight: GRID_SPACING,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardContent: {
    padding: 16,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  roleName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  roleDescription: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});