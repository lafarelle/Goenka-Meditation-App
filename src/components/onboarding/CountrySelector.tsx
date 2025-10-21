import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { lightHaptic } from '@/utils/haptics';

import { ProgressIndicator } from './ProgressIndicator';

// List of common countries
const COUNTRIES = [
  'Afghanistan',
  'Albania',
  'Algeria',
  'Argentina',
  'Australia',
  'Austria',
  'Bangladesh',
  'Belgium',
  'Brazil',
  'Bulgaria',
  'Cambodia',
  'Canada',
  'Chile',
  'China',
  'Colombia',
  'Costa Rica',
  'Croatia',
  'Czech Republic',
  'Denmark',
  'Egypt',
  'Finland',
  'France',
  'Germany',
  'Greece',
  'Hong Kong',
  'Hungary',
  'Iceland',
  'India',
  'Indonesia',
  'Iran',
  'Iraq',
  'Ireland',
  'Israel',
  'Italy',
  'Japan',
  'Jordan',
  'Kenya',
  'Korea',
  'Lebanon',
  'Malaysia',
  'Mexico',
  'Morocco',
  'Myanmar',
  'Nepal',
  'Netherlands',
  'New Zealand',
  'Nigeria',
  'Norway',
  'Pakistan',
  'Peru',
  'Philippines',
  'Poland',
  'Portugal',
  'Romania',
  'Russia',
  'Saudi Arabia',
  'Singapore',
  'South Africa',
  'Spain',
  'Sri Lanka',
  'Sweden',
  'Switzerland',
  'Taiwan',
  'Thailand',
  'Turkey',
  'Ukraine',
  'United Arab Emirates',
  'United Kingdom',
  'United States',
  'Venezuela',
  'Vietnam',
];

interface CountrySelectorProps {
  onContinue: (country: string) => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

export function CountrySelector({
  onContinue,
  onBack,
  currentStep,
  totalSteps,
}: CountrySelectorProps) {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCountries = COUNTRIES.filter((country) =>
    country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCountry = (country: string) => {
    lightHaptic();
    setSelectedCountry(country);
  };

  const handleContinue = () => {
    if (selectedCountry) {
      lightHaptic();
      onContinue(selectedCountry);
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: '#F5F5EC' }}>
      {/* Progress Indicator */}
      <View className="pt-12">
        <ProgressIndicator totalSteps={totalSteps} currentStep={currentStep} />
      </View>

      {/* Back Button */}
      <View className="px-8 pb-4">
        <Pressable
          onPress={() => {
            lightHaptic();
            onBack();
          }}
          className="w-10">
          <Ionicons name="arrow-back" size={24} color="#57534E" />
        </Pressable>
      </View>

      {/* Header */}
      <View className="mb-6 px-8">
        <Text className="mb-2 text-center text-3xl font-bold text-stone-800">
          Where are you from?
        </Text>
      </View>

      {/* Search Input */}
      <View className="mb-4 px-8">
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search country..."
          placeholderTextColor="#A8A29E"
          className="rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-800"
        />
      </View>

      {/* Country List */}
      <ScrollView className="flex-1 px-8" showsVerticalScrollIndicator={false}>
        {filteredCountries.map((country) => (
          <Pressable
            key={country}
            onPress={() => handleSelectCountry(country)}
            className="mb-2 rounded-xl border border-stone-300 bg-white px-4 py-3"
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.7 : 1,
                backgroundColor: selectedCountry === country ? '#FEF3C7' : '#FFFFFF',
                borderColor: selectedCountry === country ? '#D97706' : '#D6D3D1',
              },
            ]}>
            <Text
              className="text-base"
              style={{ color: selectedCountry === country ? '#78350F' : '#57534E' }}>
              {country}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Continue Button */}
      <View className="px-8 py-6">
        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!selectedCountry}
          className={selectedCountry ? '' : 'opacity-50'}
        />
      </View>
    </View>
  );
}
