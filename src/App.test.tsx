import { render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  // charts load their data over the network; keep the requests pending in tests
  global.fetch = jest.fn(() => new Promise<Response>(() => {}));
});

test('renders page title and all three charts', () => {
  render(<App />);
  expect(screen.getByText(/react & d3 chart examples/i)).toBeInTheDocument();
  expect(screen.getByText(/line chart/i)).toBeInTheDocument();
  expect(screen.getByText(/time series/i)).toBeInTheDocument();
  expect(screen.getByText(/histogram/i)).toBeInTheDocument();
});
