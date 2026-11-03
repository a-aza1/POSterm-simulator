// One screen: load the menu, add items, pay with a good or declined test card.
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

// iOS simulator reaches your Mac at localhost; the Android emulator uses 10.0.2.2.
const API = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
const GOOD_CARD = '4242424242424242';
const DECLINED_CARD = '4000000000000002';

type MenuItem = { id: string; name: string; priceCents: number };
const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;

export default function App() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`${API}/menu`)
      .then((res) => res.json())
      .then(setMenu)
      .catch(() => setMessage('Could not load the menu. Is the API running?'));
  }, []);

  const total = menu.reduce((sum, item) => sum + item.priceCents * (quantities[item.id] ?? 0), 0);

  const add = (id: string) => setQuantities((q) => ({ ...q, [id]: (q[id] ?? 0) + 1 }));

  const pay = async (card: string) => {
    const items = Object.entries(quantities).map(([itemId, quantity]) => ({ itemId, quantity }));
    const tab = await fetch(`${API}/tabs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    }).then((res) => res.json());

    const res = await fetch(`${API}/tabs/${tab.id}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ card }),
    });

    if (res.ok) {
      setMessage(`Paid ${money(total)}. Thanks!`);
      setQuantities({});
    } else {
      setMessage('Card declined. Try another card.'); // the tab stays so they can retry
    }
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Your Tab</Text>

      {menu.map((item) => (
        <Pressable key={item.id} onPress={() => add(item.id)} style={styles.row}>
          <Text style={styles.text}>{`${item.name}  ${money(item.priceCents)}`}</Text>
          <Text style={styles.text}>{`x${quantities[item.id] ?? 0}  +`}</Text>
        </Pressable>
      ))}

      <Text style={styles.total}>{`Total: ${money(total)}`}</Text>

      <Pressable disabled={total === 0} onPress={() => pay(GOOD_CARD)} style={[styles.button, total === 0 && styles.off]}>
        <Text style={styles.buttonText}>Pay with good card</Text>
      </Pressable>
      <Pressable disabled={total === 0} onPress={() => pay(DECLINED_CARD)} style={[styles.button, styles.decline, total === 0 && styles.off]}>
        <Text style={styles.buttonText}>Pay with declined card</Text>
      </Pressable>

      {message !== '' && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 24, paddingTop: 80, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '600', marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#eee' },
  text: { fontSize: 17 },
  total: { fontSize: 20, fontWeight: '600', marginVertical: 20 },
  button: { backgroundColor: '#1a7f37', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  decline: { backgroundColor: '#b42318' },
  off: { opacity: 0.4 },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  message: { fontSize: 16, marginTop: 10 },
});
