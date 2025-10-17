import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, View } from 'react-native';

import { lightHaptic } from '@/utils/haptics';

import { SessionPreview } from './SessionPreview';

interface SessionPreviewModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SessionPreviewModal({ visible, onClose }: SessionPreviewModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent>
      {/* Backdrop */}
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 60,
        }}>
        <Pressable
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          onPress={onClose}
        />
        {/* Modal Content */}
        <View
          style={{
            width: '100%',
            maxWidth: 600,
            maxHeight: '200%',
            backgroundColor: '#F5F5EC',
            borderRadius: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
            overflow: 'hidden',
          }}>
          {/* Header */}
          <View
            style={{
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 24,
              paddingTop: 20,
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#E5E5E5',
              backgroundColor: '#FFFFFF',
            }}>
            <Pressable
              onPress={() => {
                lightHaptic();
                onClose();
              }}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
                backgroundColor: '#F5F5F5',
                borderRadius: 10,
                padding: 8,
              })}>
              <Ionicons name="close" size={20} color="#333333" />
            </Pressable>
            <SessionPreview />
          </View>
        </View>
      </View>
    </Modal>
  );
}
