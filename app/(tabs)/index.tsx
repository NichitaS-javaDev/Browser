import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import * as Notifications from 'expo-notifications';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  } as NotificationBehavior),
});

interface NotificationBehavior {
  shouldShowAlert: boolean;
  shouldPlaySound: boolean;
  shouldSetBadge: boolean;
  shouldShowBanner: boolean;
  shouldShowList: boolean;
}

interface SearchHistoryItem {
  id: number;
  query: string;
  timestamp: Date;
}

const SearchHistoryScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);

  useEffect(() => {
    // Request notification permissions
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant notification permissions to use this feature');
      }
    })();
  }, []);

  const handleNotification = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Search Notification",
          body: "Your search history has been updated!",
        },
        trigger: { seconds: 10 } as Notifications.NotificationTriggerInput,
      });
      Alert.alert('Success', 'Notification sent!');
    } catch (error) {
      Alert.alert('Error', 'Failed to schedule notification');
    }
  };

  const handleGoogleSearch = async () => {
    if (searchText.trim()) {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchText)}`;
      await WebBrowser.openBrowserAsync(searchUrl);
      
      // Add to search history
      const newItem = {
        id: Date.now(),
        query: searchText,
        timestamp: new Date(),
      };
      setSearchHistory(prev => [newItem, ...prev]);
      setSearchText(''); // Clear input after search
    } else {
      Alert.alert('Error', 'Please enter a search term');
    }
  };

  const handleRemoveFromHistory = (id: number) => {
    setSearchHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleRemoveAll = () => {
    Alert.alert(
      'Remove All',
      'Are you sure you want to remove all search history?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove All',
          style: 'destructive',
          onPress: () => setSearchHistory([]),
        },
      ]
    );
  };

  const handleSearchFromHistory = (query: string) => {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    WebBrowser.openBrowserAsync(searchUrl);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">Search App</ThemedText>
        </ThemedView>

        <ThemedView style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Enter search term"
            placeholderTextColor="#666"
          />
        </ThemedView>

        <ThemedView style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleGoogleSearch}>
            <ThemedText style={styles.buttonText}>Google Search</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleNotification}>
            <ThemedText style={styles.buttonText}>Send Notification</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.removeAllButton]} onPress={handleRemoveAll}>
            <ThemedText style={styles.buttonText}>Remove All</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={styles.listContainer}>
          <ThemedText type="subtitle" style={styles.listTitle}>Search History</ThemedText>
          {searchHistory.map((item) => (
            <ThemedView key={item.id} style={styles.listItem}>
              <ThemedView style={styles.listItemContent}>
                <ThemedText type="defaultSemiBold">{item.query}</ThemedText>
                <ThemedText style={styles.timestamp}>
                  {item.timestamp.toLocaleTimeString()}
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.listItemActions}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.searchButton]} 
                  onPress={() => handleSearchFromHistory(item.query)}
                >
                  <ThemedText style={styles.actionButtonText}>Search</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.removeButton]} 
                  onPress={() => handleRemoveFromHistory(item.id)}
                >
                  <ThemedText style={styles.actionButtonText}>Remove</ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>
          ))}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    gap: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  removeAllButton: {
    backgroundColor: '#FF3B30',
  },
  listContainer: {
    gap: 10,
  },
  listTitle: {
    marginBottom: 10,
  },
  listItem: {
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
  },
  listItemContent: {
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  listItemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  searchButton: {
    backgroundColor: '#34C759',
  },
  removeButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default SearchHistoryScreen; 