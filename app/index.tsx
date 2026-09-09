import { Text, View } from 'react-native';

export default function Index() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EEF2F6' }}>
      <Text style={{ fontSize: 22, fontWeight: '900', color: '#161D2B' }}>Dinner Decider</Text>
      <Text style={{ marginTop: 8, color: '#5B6B7C' }}>minimal shell — it launched ✅</Text>
    </View>
  );
}
