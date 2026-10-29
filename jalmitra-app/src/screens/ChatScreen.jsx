// src/screens/ChatScreen.jsx

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, FlatList,
  KeyboardAvoidingView, Platform,
  ActivityIndicator, Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { chatAPI, pumpAPI } from '../services/api';
import { Theme } from '../constants/theme';

export default function ChatScreen() {
  const { farmer, farmId } = useAuth();
  const { colors } = useTheme();

  const [messages,    setMessages]    = useState([]);
  const [input,       setInput]       = useState('');
  const [sending,     setSending]     = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [speaking,    setSpeaking]    = useState(false);
  const flatListRef = useRef(null);

  const QUICK_CHIPS = [
    { iconName: 'water',  label: 'Aaj ka status',   msg: 'Aaj khet ki sthiti kya hai?' },
    { iconName: 'cog',    label: 'Pump band karo',  msg: 'Pump band karo' },
    { iconName: 'sprout', label: 'Mitti ki nami?',  msg: 'Mitti mein kitni nami hai?' },
  ];

  useEffect(() => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      message: `Namaste ${farmer?.name?.split(' ')[0]} Bhai!\nMain JalMitra Saathi hoon. Aapke khet ke baare mein kuch bhi pooch sakte hain.`,
      timestamp: new Date().toISOString(),
    }]);
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || sending) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      message: msg,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSending(true);
    scrollToBottom();

    try {
      const res = await chatAPI.sendMessage(farmer.id, farmId, msg);
      const reply = res.data.reply;

      const botMsg = {
        id: res.data.message_id || Date.now() + '_a',
        role: 'assistant',
        message: reply,
        timestamp: new Date().toISOString(),
        // Check if pump action needed
        showPumpAction: reply.toLowerCase().includes('pump chalu') ||
                        reply.toLowerCase().includes('irrigat'),
      };
      setMessages(prev => [...prev, botMsg]);

      setSpeaking(true);
      Speech.speak(reply, {
        language: 'hi-IN', pitch: 1.0, rate: 0.85,
        onDone: () => setSpeaking(false),
        onStopped: () => setSpeaking(false),
      });
      scrollToBottom();
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + '_err',
        role: 'assistant',
        message: 'Maafi chahta hoon, thodi dikkat aa rahi hai.',
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setSending(false);
    }
  };

  const handlePumpAction = async (action) => {
    try {
      await pumpAPI.control(farmId, action, 25);
      const confirmMsg = {
        id: Date.now().toString(),
        role: 'assistant',
        message: action === 'ON'
          ? 'Pump chalu kar diya! 25 minute baad auto-band ho jayega.'
          : 'Pump band kar diya!',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, confirmMsg]);
    } catch {
      sendMessage('Pump control mein dikkat aa rahi hai');
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';
    const time = new Date(item.timestamp).toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit'
    });

    return (
      <View style={[styles.msgWrapper, isUser ? styles.msgRight : styles.msgLeft]}>
        {!isUser && (
          <View style={[styles.botAvatar, { backgroundColor: colors.green }]}>
            <MaterialCommunityIcons name="robot" size={14} color={colors.bgScreen} />
          </View>
        )}
        <View style={{ maxWidth: '78%' }}>
          <View style={[
            styles.bubble,
            isUser
              ? [styles.userBubble, { backgroundColor: colors.bgBubbleUser }]
              : [styles.botBubble, { backgroundColor: colors.bgBubbleBot, borderColor: colors.border }]
          ]}>
            <Text style={[
              styles.bubbleTxt,
              { color: colors.textPrimary }
            ]}>
              {item.message}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 4 }}>
              <Text style={[styles.bubbleTime, { color: isUser ? colors.textSecondary : colors.textFaint }]}>
                {time}
              </Text>
              {isUser && (
                <MaterialCommunityIcons name="check-all" size={14} color={colors.textSecondary} />
              )}
            </View>
          </View>

          {/* Embedded action buttons */}
          {!isUser && item.showPumpAction && (
            <View style={[styles.actionCard, { backgroundColor: colors.bgScreen, borderColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.actionBtnPrimary, { backgroundColor: colors.green }]}
                onPress={() => handlePumpAction('ON')}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <MaterialCommunityIcons name="water" size={16} color={colors.bgScreen} />
                  <Text style={styles.actionBtnPrimaryTxt}>Haan, Chalu Karo</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtnSecondary, { backgroundColor: colors.bgBase, borderColor: colors.border }]}
                onPress={() => sendMessage('Nahi, abhi nahi')}
              >
                <Text style={[styles.actionBtnSecondaryTxt, { color: colors.textSecondary }]}>
                  Abhi Nahi
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.bgScreen }}
      edges={['top']}
    >
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.bgBase }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
      {/* Header */}
      <View style={[styles.chatHeader, { backgroundColor: colors.bgScreen, borderBottomColor: colors.border }]}>
        <View style={[styles.botHeaderAvatar, { backgroundColor: colors.green }]}>
          <MaterialCommunityIcons name="robot" size={20} color={colors.bgScreen} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={[styles.botHeaderName, { color: colors.textPrimary }]}>
              JalMitra Saathi
            </Text>
            <MaterialCommunityIcons name="sprout" size={14} color={colors.green} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.green }} />
            <Text style={[styles.botHeaderStatus, { color: colors.green }]}>
              Online
            </Text>
          </View>
        </View>
        <TouchableOpacity style={{ padding: 4 }}>
          <MaterialCommunityIcons name="dots-vertical" size={20} color={colors.textTertiary} />
        </TouchableOpacity>
      </View>

      {/* Date separator */}
      <View style={[styles.dateSep, { backgroundColor: colors.bgBase }]}>
        <View style={[styles.dateChip, { backgroundColor: colors.bgCard2 }]}>
          <Text style={[styles.dateTxt, { color: colors.textTertiary }]}>Aaj</Text>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        style={{ flex: 1 }}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Typing indicator */}
      {sending && (
        <View style={[styles.typingWrap, { backgroundColor: colors.bgBase }]}>
          <View style={[styles.botAvatar, { backgroundColor: colors.green }]}>
            <MaterialCommunityIcons name="robot" size={14} color={colors.bgScreen} />
          </View>
          <View style={[styles.typingBubble, { backgroundColor: colors.bgScreen, borderColor: colors.border }]}>
            <ActivityIndicator size="small" color={colors.green} />
            <Text style={[styles.typingTxt, { color: colors.textTertiary }]}>
              JalMitra soch raha hai...
            </Text>
          </View>
        </View>
      )}

      {/* Quick chips */}
      <View style={[styles.chipsRow, { backgroundColor: colors.bgScreen, borderTopColor: colors.border }]}>
        {QUICK_CHIPS.map((chip, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.chip, { borderColor: colors.greenBorder, backgroundColor: colors.bgBase }]}
            onPress={() => sendMessage(chip.msg)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <MaterialCommunityIcons name={chip.iconName} size={14} color={colors.green} />
              <Text style={[styles.chipTxt, { color: colors.green }]}>{chip.label}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Input bar */}
      <View style={[styles.inputBar, { backgroundColor: colors.bgScreen, borderTopColor: colors.border }]}>
        <TouchableOpacity style={{ padding: 8 }}>
          <MaterialCommunityIcons name="emoticon-happy-outline" size={22} color={colors.textTertiary} />
        </TouchableOpacity>
        <TextInput
          style={[styles.input, {
            backgroundColor: colors.bgBase,
            borderColor: colors.border,
            color: colors.textPrimary,
          }]}
          placeholder="Message likhiye..."
          placeholderTextColor={colors.textFaint}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
        />
        {input.trim() ? null : (
          <TouchableOpacity style={{ padding: 8 }}>
            <MaterialCommunityIcons name="microphone" size={22} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.sendBtn, {
            backgroundColor: input.trim() ? colors.green : colors.bgBase,
            borderColor: input.trim() ? colors.green : colors.border,
          }]}
          onPress={() => sendMessage()}
          disabled={!input.trim() || sending}
        >
          <MaterialCommunityIcons name="send" size={18} color={input.trim() ? colors.bgScreen : colors.textFaint} />
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:           { flex: 1 },
  chatHeader:          { flexDirection: 'row', alignItems: 'center', padding: 12, paddingHorizontal: 16, borderBottomWidth: 1, gap: 12 },
  botHeaderAvatar:     { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  botHeaderName:       { fontSize: 15, fontWeight: '700', fontFamily: Theme.font.family.display },
  botHeaderStatus:     { fontSize: 12, marginTop: 1, fontFamily: Theme.font.family.text },
  dateSep:             { alignItems: 'center', paddingVertical: 8 },
  dateChip:            { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 4 },
  dateTxt:             { fontSize: 12, fontWeight: '500', fontFamily: Theme.font.family.text },
  messageList:         { padding: 12, gap: 8, paddingBottom: 8 },
  msgWrapper:          { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 8 },
  msgLeft:             { justifyContent: 'flex-start' },
  msgRight:            { justifyContent: 'flex-end' },
  botAvatar:           { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  bubble:              { borderRadius: 18, padding: 12 },
  userBubble:          { borderBottomRightRadius: 4 },
  botBubble:           { borderBottomLeftRadius: 4, borderWidth: 1 },
  bubbleTxt:           { fontSize: 15, lineHeight: 22, fontFamily: Theme.font.family.text },
  bubbleTime:          { fontSize: 11, textAlign: 'right', fontFamily: Theme.font.family.text },
  actionCard:          { borderRadius: Theme.radius.md, borderWidth: 1, padding: 10, marginTop: 6, gap: 8 },
  actionBtnPrimary:    { borderRadius: 12, padding: 13, alignItems: 'center' },
  actionBtnPrimaryTxt: { color: '#fff', fontWeight: '800', fontSize: 15, fontFamily: Theme.font.family.display },
  actionBtnSecondary:  { borderRadius: 12, padding: 13, alignItems: 'center', borderWidth: 1 },
  actionBtnSecondaryTxt:{ fontSize: 15, fontWeight: '600', fontFamily: Theme.font.family.text },
  typingWrap:          { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 },
  typingBubble:        { flexDirection: 'row', alignItems: 'center', borderRadius: 18, padding: 10, borderWidth: 1, gap: 8 },
  typingTxt:           { fontSize: 12, fontFamily: Theme.font.family.text },
  chipsRow:            { flexDirection: 'row', padding: 10, gap: 8, borderTopWidth: 1 },
  chip:                { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1 },
  chipTxt:             { fontSize: 12, fontWeight: '600', fontFamily: Theme.font.family.text },
  inputBar:            { flexDirection: 'row', padding: 8, paddingHorizontal: 12, alignItems: 'flex-end', borderTopWidth: 1, gap: 8 },
  input:               { flex: 1, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, maxHeight: 100, borderWidth: 1, fontFamily: Theme.font.family.text },
  sendBtn:             { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
});