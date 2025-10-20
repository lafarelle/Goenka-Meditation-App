import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';

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
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 80,
        }}>
        <Pressable onPress={onClose} />
        {/* Modal Content */}
        <View
          style={{
            borderRadius: 24,
            overflow: 'hidden',
            maxHeight: '100%',
          }}>
          {/* Header */}
          <View
            style={{
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              paddingTop: 12,
              paddingBottom: 16,
              backgroundColor: '#FFFEF6',
            }}>
            <View className="w-full flex-row items-end justify-end">
              <Pressable
                onPress={() => {
                  lightHaptic();
                  onClose();
                }}
                className="p-2">
                <Ionicons name="close" size={30} color="#333333" />
              </Pressable>
            </View>
            <ScrollView
              style={{ maxHeight: '100%' }}
              showsVerticalScrollIndicator={false}
              bounces={true}>
              <SessionPreview />
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
}
