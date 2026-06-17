import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import App from '../App';

describe('App shell', () => {
  it('renders heading World Cup 2026 Prediction', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'World Cup 2026 Prediction' })
    ).toBeInTheDocument();
  });
});
