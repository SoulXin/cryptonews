import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

const { width } = Dimensions.get('window');

const MarketList = () => {
  const navigation = useNavigation();
  const [coins, setCoins] = useState([]);
  const [filteredCoins, setFilteredCoins] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch data coins dari CoinGecko
  const fetchCoins = async () => {
    try {
      const res = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false'
      );
      const data = await res.json();
      setCoins(data);
      setFilteredCoins(data);
    } catch (err) {
      console.log('Error fetching coins:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoins();
  }, []);

  // Filter search
  const handleSearch = (text) => {
    setSearchText(text);
    const filtered = coins.filter(
      (coin) =>
        coin.symbol.toLowerCase().includes(text.toLowerCase()) ||
        coin.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredCoins(filtered);
  };

  // Render tiap item coin
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate('PairDetail', { pairId: item.id })}
    >
      <Image source={{ uri: item.image }} style={styles.logo} resizeMode="contain" />
      <Text style={styles.name}>{item.symbol.toUpperCase()}</Text>
      <Text style={styles.price}>${item.current_price.toLocaleString()}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#f3ba2f', fontSize: 16 }}>Loading...</Text>
      </View>
    );
  }

  return (
    // SafeAreaView untuk menyesuaikan notch / status bar
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search coin..."
        placeholderTextColor="#aaa"
        value={searchText}
        onChangeText={handleSearch}
      />

      {/* FlatList dengan flex:1 supaya banner tetap di bawah */}
      <FlatList
        data={filteredCoins}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ paddingBottom: 16 }}
        style={{ flex: 1 }}
      />

      {/* Banner Ad di bawah */}
      <View style={{ alignItems: 'center', marginTop: 4 }}>
        <BannerAd
          unitId="ca-app-pub-6421233417984358/8028981170" // Test ID AdMob
          size={BannerAdSize.BANNER}
          requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        />
      </View>
    </SafeAreaView>
  );
};

export default MarketList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 8,
  },
  searchInput: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#f3ba2f',
  },
  item: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    margin: 4,
    borderRadius: 10,
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#f3ba2f',
  },
  logo: {
    width: width / 4,
    height: width / 4,
    marginBottom: 8,
  },
  name: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  price: {
    color: '#f3ba2f',
    fontSize: 12,
    marginTop: 4,
  },
});
