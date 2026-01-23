import React from 'react';
import LoginForm from '../components/auth/LoginForm';

export const LoginPage: React.FC = () => {
  return (
    <div className='flex  justify-center items-center '>
      <LoginForm />
      <p>admin@avacasa.com</p>
      <p>pass: admin@123</p>
    </div>
  );
};

export default LoginPage;
