import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Role } from '../types/role';

interface RoleSelectorProps {
  roles: Role[];
  selectedRole: Role | null;
  onSelect: (role: Role) => void;
}

export default function RoleSelector({ roles, selectedRole, onSelect }: RoleSelectorProps) {
  return (
    <View style={styles.container}>
      {roles.map((role) => (
        <TouchableOpacity
          key={role.id}
          style={[
            styles.roleCard,
            selectedRole?.id === role.id && styles.activeCard
          ]}
          onPress={() => onSelect(role)}
        >
          {role.avatar && (
            <Image
              source={{ uri: role.avatar }}
              style={styles.avatar}
            />
          )}
          <Text style={[
            styles.roleName,
            selectedRole?.id === role.id && styles.activeText
          ]}>
            {role.name}
          </Text>
          {role.description && (
            <Text style={styles.description} numberOfLines={2}>
              {role.description}
            </Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    gap: 10,
  },
  roleCard: {
    width: '45%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    alignItems: 'center',
  },
  activeCard: {
    backgroundColor: '#e3f2fd',
    borderColor: '#1976d2',
    borderWidth: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  roleName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  activeText: {
    color: '#1976d2',
  },
  description: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});