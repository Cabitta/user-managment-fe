import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { ThemeToggle } from '../../src/components/shared/ThemeToggle';
import { ThemeProvider } from 'next-themes';

describe('ThemeToggle', () => {
  it('debería cambiar el tema de light a dark al hacer click', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <ThemeToggle />
      </ThemeProvider>
    );

    const button = screen.getByRole('button', { name: /toggle theme/i });
    expect(button).toBeInTheDocument();

    // Hacemos click en el botón para iterar el toggle
    await user.click(button);

    // next-themes demora un tick en alterar el DOM
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });
});
