// PriceChart.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Dimensions, ActivityIndicator, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

const formatNumber = (num, decimals = 2) => {
    if (num === null || num === undefined) return '-';
    const n = Number(num);
    if (isNaN(n)) return '-';
    const fixed = n.toFixed(decimals);
    return fixed.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const RANGES = [
    { key: '1H', label: '1H' },
    { key: '24H', label: '24H' },
    { key: '1W', label: '1W' },
    { key: '1M', label: '1M' },
];

const PriceChart = ({ coinId = 'bitcoin' }) => {
    const [range, setRange] = useState('24H');
    const [loading, setLoading] = useState(true);
    const [points, setPoints] = useState([]);
    const [error, setError] = useState(null);
    const [priceChange, setPriceChange] = useState(null);

    const getDays = (r) => {
        if (r === '1H' || r === '24H') return 1;
        if (r === '1W') return 7;
        if (r === '1M') return 30;
        return 7;
    };

    const fetchChart = useCallback(async () => {
        if (!coinId) return;
        setLoading(true);
        setError(null);
        try {
            const days = getDays(range);
            const url = `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(
                coinId
            )}/market_chart?vs_currency=usd&days=${days}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error(`API ${res.status}`);
            const json = await res.json();
            const raw = Array.isArray(json.prices) ? json.prices : [];

            let mapped = raw
                .map((it) => {
                    const t = Number(it[0]);
                    const p = Number(it[1]);
                    if (isNaN(t) || isNaN(p)) return null;
                    return { t, p };
                })
                .filter(Boolean);

            if (mapped.length === 0) {
                setPoints([]);
                setPriceChange(null);
                return;
            }

            if (range === '1H') {
                const cutoff = Date.now() - 60 * 60 * 1000;
                const lastHour = mapped.filter((pt) => pt.t >= cutoff);
                mapped = lastHour.length >= 10 ? lastHour : mapped.slice(-60);
            }

            const MAX_POINTS = 1000;
            if (mapped.length > MAX_POINTS) mapped = mapped.slice(-MAX_POINTS);

            setPoints(mapped);

            const first = mapped[0]?.p;
            const last = mapped[mapped.length - 1]?.p;
            if (first && last) {
                setPriceChange(((last - first) / first) * 100);
            } else {
                setPriceChange(null);
            }
        } catch (err) {
            console.log('Error fetchChart:', err);
            setError('Gagal memuat chart');
            setPoints([]);
            setPriceChange(null);
        } finally {
            setLoading(false);
        }
    }, [coinId, range]);

    useEffect(() => {
        fetchChart();
    }, [fetchChart]);

    const dataSet = points.map((p) => Number(p.p));

    const createLabels = () => {
        const maxLabels = 6;
        const len = points.length;
        if (len === 0) return [];
        const step = Math.max(1, Math.floor(len / maxLabels));
        return points.map((pt, idx) => (idx % step === 0 ? formatLabel(pt.t, range) : ''));
    };

    const formatLabel = (timestampMs, r) => {
        const d = new Date(timestampMs);
        if (r === '1H' || r === '24H') {
            const hh = String(d.getHours()).padStart(2, '0');
            const mm = String(d.getMinutes()).padStart(2, '0');
            return `${hh}:${mm}`;
        } else {
            const day = d.getDate();
            const month = d.getMonth() + 1;
            return `${day}/${month}`;
        }
    };

    return (
        <View style={{ marginVertical: 8, alignItems: 'center' }}>
            {/* Buttons full width */}
            <View style={styles.buttonRow}>
                {RANGES.map((r) => (
                    <TouchableOpacity
                        key={r.key}
                        style={[styles.button, range === r.key && styles.activeButton]}
                        onPress={() => setRange(r.key)}
                    >
                        <Text style={[styles.buttonText, range === r.key && styles.activeButtonText]}>
                            {r.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Summary table */}
            <View style={styles.table}>
                <View style={styles.tableRow}>
                    <Text style={styles.tableLabel}>Price</Text>
                    <Text style={styles.tableValue}>
                        {points.length ? `$${formatNumber(points[points.length - 1].p, 2)}` : '-'}
                    </Text>
                </View>
                <View style={styles.tableRow}>
                    <Text style={styles.tableLabel}>Change</Text>
                    {loading ? (
                        <ActivityIndicator size="small" color="#f3ba2f" />
                    ) : (
                        <Text
                            style={[
                                styles.tableValue,
                                priceChange != null && priceChange >= 0 ? styles.positive : styles.negative,
                            ]}
                        >
                            {priceChange != null
                                ? `${priceChange >= 0 ? '+' : ''}${formatNumber(priceChange, 2)}%`
                                : '-'}
                        </Text>
                    )}
                </View>
            </View>

            {/* Chart area */}
            {error ? (
                <View style={{ padding: 12 }}>
                    <Text style={{ color: '#fff' }}>{error}</Text>
                </View>
            ) : loading ? (
                <View style={{ height: 260, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#f3ba2f" />
                </View>
            ) : (
                <LineChart
                    data={{
                        labels: createLabels(),
                        datasets: [{ data: dataSet }],
                    }}
                    width={Dimensions.get("window").width - 16} // kurangi dikit biar ada spasi
                    height={220}
                    chartConfig={{
                        backgroundColor: "#000",
                        backgroundGradientFrom: "#000",
                        backgroundGradientTo: "#000",
                        decimalPlaces: 2,
                        color: (opacity = 1) => `rgba(243, 186, 47, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                        propsForDots: {
                            r: "2",
                            strokeWidth: "1",
                            stroke: "#f3ba2f",
                        },
                    }}
                    style={{
                        marginVertical: 8,
                        borderRadius: 8,
                        marginLeft: 50
                    }}
                />
            )}
        </View>
    );
};

export default PriceChart;

const styles = StyleSheet.create({
    buttonRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: '100%',
        marginBottom: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 10,
        marginHorizontal: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#f3ba2f',
        backgroundColor: '#1a1a1a',
        alignItems: 'center',
    },
    activeButton: {
        backgroundColor: '#f3ba2f',
    },
    buttonText: {
        color: '#f3ba2f',
        fontWeight: 'bold',
        fontSize: 14,
    },
    activeButtonText: {
        color: '#000',
    },
    table: {
        width: '95%',
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 16,
    },
    tableRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    tableLabel: {
        color: '#aaa',
        fontSize: 14,
    },
    tableValue: {
        color: '#fff',
        fontSize: 15,
        fontWeight: 'bold',
    },
    positive: {
        color: '#4caf50',
    },
    negative: {
        color: '#ff5252',
    },
});
