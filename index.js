// Custom entry point with a startup-error overlay.
//
// Builds 4 and 5 crashed ~340ms into launch: the JS bundle threw a fatal
// during initial evaluation and expo-updates' error-recovery path turned that
// into an opaque native abort() with no readable message. This wrapper installs
// a global JS error handler and try/catches the router entry so that ANY
// startup error is rendered full-screen and readable instead of crashing.
//
// Once the underlying error is fixed this file can stay — it's a harmless
// safety net — or `main` can go back to "expo-router/entry" in package.json.

const React = require('react');
const { AppRegistry } = require('react-native');

let startupError = null;
const record = (e) => {
  if (!startupError) startupError = e;
  try {
    // eslint-disable-next-line no-console
    console.error('[startupGuard]', e && (e.stack || e.message || String(e)));
  } catch (_) {}
};

// 1. Catch anything the JS VM reports as a global/uncaught error during boot.
try {
  const g = global;
  if (g && g.ErrorUtils && typeof g.ErrorUtils.setGlobalHandler === 'function') {
    const prev = g.ErrorUtils.getGlobalHandler && g.ErrorUtils.getGlobalHandler();
    g.ErrorUtils.setGlobalHandler((e, isFatal) => {
      record(e);
      // Swallow fatals during startup so we can show the message rather than
      // let it abort the process. Non-fatals fall through to the old handler.
      if (!isFatal && typeof prev === 'function') {
        try { prev(e, isFatal); } catch (_) {}
      }
    });
  }
} catch (_) {}

// 2. Load the real app. A module-eval throw anywhere under app/** lands here.
try {
  require('expo-router/entry');
} catch (e) {
  record(e);
}

// 3. If boot failed, replace the root component with a readable error screen.
//    Registered last, so it wins over whatever expo-router registered.
if (startupError) {
  const Fallback = () =>
    React.createElement(
      require('react-native').ScrollView,
      {
        style: { flex: 1, backgroundColor: '#EEF2F6' },
        contentContainerStyle: { padding: 24, paddingTop: 72 },
      },
      React.createElement(
        require('react-native').Text,
        { style: { fontSize: 20, fontWeight: '900', color: '#161D2B', marginBottom: 10 } },
        'Startup error',
      ),
      React.createElement(
        require('react-native').Text,
        { selectable: true, style: { fontSize: 14, color: '#161D2B', marginBottom: 14 } },
        String((startupError && (startupError.message || startupError)) || 'unknown'),
      ),
      React.createElement(
        require('react-native').Text,
        { selectable: true, style: { fontSize: 11, color: '#5B6B7C', lineHeight: 16 } },
        String((startupError && startupError.stack) || '').slice(0, 6000),
      ),
    );
  AppRegistry.registerComponent('main', () => Fallback);
}
