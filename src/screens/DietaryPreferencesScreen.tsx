import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DietaryPreferencesScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Dietary Preferences Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});

export default DietaryPreferencesScreen;
