import { Stack } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

export default function RootLayout() {
  return (
    <>
      <View 
        style={{ 
          height: 0,
          backgroundColor: '#1a1a2e',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100
        }} 
      />
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1a1a2e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '600',
          },
          animation: 'slide_from_right',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ 
            title: "角色列表",
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="dialogue" 
          options={{ 
            title: "对话",
            headerShown: false,
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }} 
        />
      </Stack>
    </>
  );
}
