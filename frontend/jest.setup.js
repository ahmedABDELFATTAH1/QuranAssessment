import '@testing-library/jest-dom';

// Add custom matchers for jsdom
expect.extend({
  toHaveTextContent(received, expected) {
    const pass = received.textContent === expected;
    return {
      pass,
      message: () => `expected ${received} to have text content "${expected}"`,
    };
  },
});
