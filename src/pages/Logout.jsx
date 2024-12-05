// src/pages/Logout.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosCredential } from '@/utils';
import useAuth from './../hooks/useAuth';

const Logout = () => {
  const navigate = useNavigate();

  const { logout } = useAuth();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await axiosCredential.post('/api/logout');
        logout();
        navigate('/login', { replace: true });
      } catch (error) {
        console.error('로그아웃 중 오류 발생:', error);
        navigate('/login');
      }
    };

    handleLogout();
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  return (
    <div className='flex items-center justify-center h-screen'>
      <p>로그아웃 중...</p>
    </div>
  );
};

export default Logout;
