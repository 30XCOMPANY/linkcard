import React from 'react';
import { Redirect } from 'expo-router';
import { useCardStore } from '@/src/stores/cardStore';

/**
 * Entry point of the app.
 * Redirects to Onboarding if no card exists, or Glass Home if it does.
 */
export default function HomeScreen() {
  const { card } = useCardStore();

  if (!card) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/glass-home" />;
}

