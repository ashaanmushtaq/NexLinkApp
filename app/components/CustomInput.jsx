import React from 'react';
import { TextInput, StyleSheet, View, Text } from 'react-native';

export default function CustomInput({ 
  placeholder, 
  multiline = false, 
  secureTextEntry, 
  value, 
  onChangeText, 
  label 
}) {
  return (
    <View style={styles.inputContainer}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, multiline && styles.multilineInput]}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        value={value}
        multiline={multiline}
        onChangeText={onChangeText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    marginVertical: 12,
  },
  label: {
    fontSize: 14,
    color: '#4e60ff',
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    shadowColor: '#ccc',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    transition: 'all 0.3s ease',
  },
  multilineInput: {
    height: 120, // Adjusted for better textarea look
    textAlignVertical: 'top',
  },
});
