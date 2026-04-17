import React, { useRef, useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

const OTP_LENGTH = 6;

interface OTPInputProps {
  value: string;
  onChange: (otp: string) => void;
}

export default function OTPInput({ value, onChange }: OTPInputProps) {
  const inputs = useRef<TextInput[]>([]);
  const [digits, setDigits] = useState<string[]>(
    value.split('').concat(Array(OTP_LENGTH - value.length).fill(''))
  );

  const handleChange = (text: string, index: number) => {
    const newDigits = [...digits];
    newDigits[index] = text;
    setDigits(newDigits);
    onChange(newDigits.join(''));

    if (text && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length: OTP_LENGTH }).map((_, i) => (
        <TextInput
          key={i}
          ref={(ref) => { if (ref) inputs.current[i] = ref; }}
          style={[styles.cell, digits[i] ? styles.cellFilled : null]}
          keyboardType="number-pad"
          maxLength={1}
          value={digits[i]}
          onChangeText={(text) => handleChange(text, i)}
          onKeyPress={(e) => handleKeyPress(e, i)}
          selectTextOnFocus
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  cell: {
    width: 48,
    height: 56,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#ddd',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    backgroundColor: '#fff',
    color: '#1a1a1a',
  },
  cellFilled: {
    borderColor: '#1a1a1a',
    backgroundColor: '#FFF3E0',
  },
});
