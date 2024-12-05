import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo } = useAuth();

  if (location.pathname.startsWith('/chat/')) {
    return null;
  }

  const thirdButtonHandler = () => {
    console.log(userInfo);
    userInfo ? navigate('/profile') : navigate('/login');
  };

  return (
    <div className='layout-footer bg-white border-top'>
      <div className='d-flex justify-content-around p-2'>
        <button
          className={`btn btn-link ${location.pathname === '/products' ? 'text-primary' : 'text-dark'}`}
          onClick={() => navigate('/products')}
        >
          <i className='bi bi-house-door'></i>
          <div className='small'>홈</div>
        </button>
        <button
          className={`btn btn-link ${location.pathname === '/chats' ? 'text-primary' : 'text-dark'}`}
          onClick={() => navigate('/chats')}
        >
          <i className='bi bi-chat'></i>
          <div className='small'>채팅</div>
        </button>
        <button
          className={`btn btn-link ${location.pathname === '/profile' ? 'text-primary' : 'text-dark'}`}
          onClick={thirdButtonHandler}
        >
          <i className='bi bi-person'></i>
          <div className='small'>{userInfo ? '마이페이지' : '로그인'}</div>
        </button>
      </div>
    </div>
  );
};

export default Navbar;
