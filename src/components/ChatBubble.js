import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
export default function ChatBubble({ message, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(message.text);

  const saveEdit = () => {
    setEditing(false);
    onEdit(message.id, text);
  };
  return (
    <View style={[styles.bubble, message.type === 'user' ? styles.user : styles.bot]}>
      {editing ? (
        <TextInput
          value={text}
          onChangeText={setText}
          onBlur={saveEdit}
          style={styles.input}
          autoFocus
        />
      ) : (
        <TouchableOpacity onLongPress={() => setEditing(true)}>
          <Text style={styles.text}>{message.text}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  bubble: { marginVertical: 4, padding: 8, borderRadius: 6, maxWidth: '80%' },
  user: { backgroundColor: '#dcf8c6', alignSelf: 'flex-end' },
  bot: { backgroundColor: '#fff', alignSelf: 'flex-start' },
  text: { fontSize: 16 },
  input: { fontSize: 16, borderBottomWidth: 1 }
});