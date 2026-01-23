import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState({
    email: 'admin@avacasa.com',
    password: 'admin@123',
  });
  const [localError, setLocalError] = useState('');
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError('');

    if (!formData.email || !formData.password) {
      setLocalError('Please fill in all fields');
      return;
    }

    try {
      await login(formData);
      navigate('/dashboard');
    } catch (err: any) {
      const message = err.response?.data?.error || 'Login failed. Please try again.';
      setLocalError(message);
    }
  };

  return (
    <div className='w-full max-w-md p-8 rounded-lg border border-gray-200 bg-white shadow-md'>
      <div className='text-center mb-8'>
        <h2 className='text-3xl font-bold text-gray-800'>Welcome Back</h2>
        <p className='text-gray-500 text-sm mt-2'>Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit}>
        {(error || localError) && (
          <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm'>
            {error || localError}
          </div>
        )}

        <div className='mb-5'>
          <label htmlFor="email" className='block  text-sm font-medium text-gray-700 mb-2'>
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder='you@example.com'
            className='w-full px-4 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          />
        </div>

        <div className='mb-6'>
          <label htmlFor="password" className='block text-sm font-medium text-gray-700 mb-2'>
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder='••••••••'
            className='w-full px-4 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className='w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-md transition duration-200'
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>

      </form>


    </div>
  );
};

export default LoginForm;
