import React, { useState } from 'react';
import { TextInput, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function CustomInput({ 
  placeholder, 
  multiline = false, 
  secureTextEntry, 
  value, 
  onChangeText, 
  label,
  iconName
}) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={styles.inputContainer}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputWrapper}>
        {iconName && (
          <AntDesign name={iconName} size={20} color="#7c7c7c" style={styles.icon} />
        )}
        <TextInput
          style={[styles.input, multiline && styles.multilineInput]}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          value={value}
          multiline={multiline}
          onChangeText={onChangeText}
          placeholderTextColor="#999"
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
            <Ionicons
              name={isPasswordVisible ? 'eye' : 'eye-off'}
              size={22}
              color="#7c7c7c"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    marginVertical: 12,
    width: '100%',
  },
  label: {
    fontSize: 14,
    color: '#4e60ff',
    fontWeight: '600',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 30,
    paddingHorizontal: 12,
    shadowColor: '#ccc',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  multilineInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  eyeIcon: {
    padding: 4,
  },
});
