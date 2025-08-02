

// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import ChatScreen from './src/screens/ChatScreen';

const Stack = createNativeStackNavigator();
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} options={({ route }) => ({ title: route.params.role.name })}/>
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={({ route }) => ({ title: route.params.role.name })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// src/components/RoleSelector.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
export default function RoleSelector({ roles, selectedRole, onSelect }) {
  return (
    <View style={styles.container}>
      {roles.map(role => (
        <TouchableOpacity
          key={role.id}
          style={[styles.button, selectedRole.id === role.id && styles.active]}
          onPress={() => onSelect(role)}
        >
          <Text style={styles.text}>{role.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flexDirection: 'row', marginBottom: 8 },
  button: { padding: 8, borderWidth: 1, borderRadius: 4, marginRight: 8 },
  active: { backgroundColor: '#ddd' },
  text: { fontSize: 14 }
});