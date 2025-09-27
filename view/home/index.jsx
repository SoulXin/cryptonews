import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  Dimensions 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const MarketList = () => {
  const navigation = useNavigation();
  const [coins, setCoins] = useState([]);
  const [filteredCoins, setFilteredCoins] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);

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

  const handleSearch = (text) => {
    setSearchText(text);
    const filtered = coins.filter((coin) =>
      coin.symbol.toLowerCase().includes(text.toLowerCase()) ||
      coin.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredCoins(filtered);
  };

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
    return <Text style={{ color: '#f3ba2f', textAlign: 'center', marginTop: 20 }}>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search coin..."
        placeholderTextColor="#aaa"
        value={searchText}
        onChangeText={handleSearch}
      />

      {/* Grid List */}
      <FlatList
        data={filteredCoins}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </View>
  );
};

export default MarketList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 8,
  },
  searchInput: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
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
