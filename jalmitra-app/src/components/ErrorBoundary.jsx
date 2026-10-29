// src/components/ErrorBoundary.jsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// ── Hardcoded dark colors ──
// ErrorBoundary can't use hooks so we use fixed values
const C = {
  bg:      '#141410',
  card:    '#1a1a14',
  amber:   '#d4a843',
  text:    '#e8e4d0',
  sub:     '#6a6a52',
  border:  '#2a2a22',
  btnText: '#0e0e0a',
};

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.log('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <MaterialCommunityIcons name="emoticon-sad-outline" size={56} color={C.amber} style={{ marginBottom: 16 }} />
          <Text style={styles.title}>Kuch galat ho gaya</Text>
          <Text style={styles.message}>
            App mein kuch dikkat aa gayi.{'\n'}
            Dobara try karein.
          </Text>
          {__DEV__ && this.state.error && (
            <Text style={styles.errorDetail}>
              {this.state.error.toString()}
            </Text>
          )}
          <TouchableOpacity
            style={styles.button}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialCommunityIcons name="refresh" size={16} color={C.btnText} />
              <Text style={styles.buttonText}>
                Dobara Try Karein
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: C.bg,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: C.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: C.sub,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorDetail: {
    fontSize: 10,
    color: '#e07050',
    marginTop: 16,
    padding: 12,
    backgroundColor: C.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0705030',
    maxWidth: '100%',
    textAlign: 'left',
  },
  button: {
    backgroundColor: C.amber,
    borderRadius: 14,
    padding: 16,
    paddingHorizontal: 28,
    marginTop: 24,
  },
  buttonText: {
    color: C.btnText,
    fontWeight: '800',
    fontSize: 15,
  },
});

export default ErrorBoundary;