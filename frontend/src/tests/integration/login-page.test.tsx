import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { ApiError } from '../../api/client';
import { Login } from '../../pages/Login';

describe('Login/Register page component', () => {
  test('shows useful error on failed authentication', () => {
    render(
      <Login
        onLogin={vi.fn()}
        onRegister={vi.fn()}
        loginError={new ApiError('Invalid email or password', 401)}
        registerError={null}
        isLoginPending={false}
        isRegisterPending={false}
      />
    );
    expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
  });

  test('submits valid credentials in login mode', () => {
    const onLogin = vi.fn();
    render(
      <Login
        onLogin={onLogin}
        onRegister={vi.fn()}
        loginError={null}
        registerError={null}
        isLoginPending={false}
        isRegisterPending={false}
      />
    );

    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'user@example.test' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(onLogin).toHaveBeenCalledWith({ email: 'user@example.test', password: 'password123' });
  });

  test('register link toggles to register mode and sign-in link toggles back', () => {
    render(
      <Login
        onLogin={vi.fn()}
        onRegister={vi.fn()}
        loginError={null}
        registerError={null}
        isLoginPending={false}
        isRegisterPending={false}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Register' }));
    expect(screen.getByRole('heading', { name: 'Create your account' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(screen.getByRole('heading', { name: 'Sign in to your account' })).toBeInTheDocument();
  });

  test('register submit success path calls register callback', () => {
    const onRegister = vi.fn();
    render(
      <Login
        onLogin={vi.fn()}
        onRegister={onRegister}
        loginError={null}
        registerError={null}
        isLoginPending={false}
        isRegisterPending={false}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'new@example.test' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));
    expect(onRegister).toHaveBeenCalledWith({ email: 'new@example.test', password: 'password123' });
  });
});
