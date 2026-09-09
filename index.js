// Minimal startup guard: if the router entry throws synchronously while its
// module graph evaluates, show the error on screen instead of a bare crash.
// No ErrorUtils tampering — behaviour is otherwise identical to the stock
// "expo-router/entry" entry point.

const React = require('react');
const { AppRegistry } = require('react-native');

let bootError = null;
try {
  require('expo-router/entry');
} catch (e) {
  bootError = e;
  try {
    // eslint-disable-next-line no-console
    console.error('[boot]', e && (e.stack || e.message || String(e)));
  } catch (_) {}
}

if (bootError) {
  const { ScrollView, Text } = require('react-native');
  const Screen = () =>
    React.createElement(
      ScrollView,
      {
        style: { flex: 1, backgroundColor: '#EEF2F6' },
        contentContainerStyle: { padding: 24, paddingTop: 72 },
      },
      React.createElement(
        Text,
        { style: { fontSize: 20, fontWeight: '900', color: '#161D2B', marginBottom: 10 } },
        'Startup error',
      ),
      React.createElement(
        Text,
        { selectable: true, style: { fontSize: 14, color: '#161D2B', marginBottom: 14 } },
        String((bootError && (bootError.message || bootError)) || 'unknown'),
      ),
      React.createElement(
        Text,
        { selectable: true, style: { fontSize: 11, color: '#5B6B7C', lineHeight: 16 } },
        String((bootError && bootError.stack) || '').slice(0, 6000),
      ),
    );
  AppRegistry.registerComponent('main', () => Screen);
}
