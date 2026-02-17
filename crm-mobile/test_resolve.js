try {
    const path = require.resolve('babel-preset-expo');
    console.log('SUCCESS: babel-preset-expo found at:', path);
} catch (e) {
    console.error('FAILURE: Could not find babel-preset-expo');
    console.error(e.message);
}
