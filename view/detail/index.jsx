import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import PriceChart from './priceChart'; 

const formatNumber = (num, decimals = 2) => {
  if (num === null || num === undefined) return '-';
  const n = Number(num);
  if (isNaN(n)) return '-';
  const fixed = n.toFixed(decimals);
  const parts = fixed.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
};

const Detail = () => {
  const route = useRoute();
  const { pairId } = route.params || {};

  const [coinData, setCoinData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchCoinDetail = async (id) => {
    if (!id) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const url = `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(
        id
      )}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const json = await res.json();
      setCoinData(json);
    } catch (err) {
      console.log('Error fetching coin detail:', err);
      setErrorMsg('Gagal memuat data. Silakan coba lagi.');
      setCoinData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pairId) fetchCoinDetail(pairId);
  }, [pairId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f3ba2f" />
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: '#fff', marginBottom: 12 }}>{errorMsg}</Text>
        <Text style={{ color: '#f3ba2f' }} onPress={() => fetchCoinDetail(pairId)}>
          Try Again
        </Text>
      </View>
    );
  }

  if (!coinData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: '#fff' }}>Data tidak tersedia</Text>
      </View>
    );
  }

  const market = coinData.market_data || {};
  const imageUri = coinData.image?.large || coinData.image?.thumb || null;

  const openWebsite = async (url) => {
    if (!url) return;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) Linking.openURL(url);
      else Alert.alert('Error', 'Tidak dapat membuka URL');
    } catch (err) {
      Alert.alert('Error', 'Terjadi kesalahan saat membuka URL');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* PriceChart dinamis */}
      <PriceChart coinId={pairId} />

      {/* Header */}
      <View style={styles.header}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.logo} />
        ) : (
          <View style={[styles.logo, { backgroundColor: '#111', borderRadius: 8 }]} />
        )}
        <Text style={styles.title}>
          {coinData.name} ({(coinData.symbol || '').toUpperCase()})
        </Text>
        <Text style={styles.price}>
          ${formatNumber(market?.current_price?.usd ?? 0, 2)}
        </Text>
      </View>

      {/* Market Info */}
      <View style={styles.infoRow}>
        <Text style={styles.label}>Market Cap:</Text>
        <Text style={styles.value}>${formatNumber(market?.market_cap?.usd ?? 0, 0)}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>24h High:</Text>
        <Text style={styles.value}>${formatNumber(market?.high_24h?.usd ?? 0, 2)}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>24h Low:</Text>
        <Text style={styles.value}>${formatNumber(market?.low_24h?.usd ?? 0, 2)}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Total Volume:</Text>
        <Text style={styles.value}>${formatNumber(market?.total_volume?.usd ?? 0, 0)}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Circulating Supply:</Text>
        <Text style={styles.value}>{formatNumber(market?.circulating_supply ?? 0, 0)}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Market Cap Rank:</Text>
        <Text style={styles.value}>#{coinData.market_cap_rank ?? '-'}</Text>
      </View>

      {/* Link */}
      {coinData.links?.homepage?.[0] ? (
        <Text style={styles.link} onPress={() => openWebsite(coinData.links.homepage[0])}>
          Visit Website
        </Text>
      ) : null}
    </ScrollView>
  );
};

export default Detail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 18,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  title: {
    color: '#f3ba2f',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  price: {
    color: '#fff',
    fontSize: 18,
    marginTop: 6,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  label: {
    color: '#fff',
    fontSize: 15,
  },
  value: {
    color: '#f3ba2f',
    fontSize: 15,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 20,
    color: '#1e90ff',
    textAlign: 'center',
    fontSize: 16,
  },
});
