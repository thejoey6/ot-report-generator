import React from 'react';
import AuthForm from '../components/Auth';
import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';


function Home() {

    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
      <div>
        <AuthForm />
      </div>
  );
}

export default Home;