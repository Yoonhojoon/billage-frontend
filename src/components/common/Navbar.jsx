import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import useUnreadChatCount from '../../storage-provider/zustand/useUnreadChatCount';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo } = useAuth();
  const { unreadChatCount } = useUnreadChatCount();

  if (location.pathname.startsWith('/chat/')) {
    return null;
  }

  const thirdButtonHandler = () => {
    console.log(userInfo);
    userInfo ? navigate('/mypage') : navigate('/login');
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
          <i className='bi bi-chat position-relative'>
            {unreadChatCount > 0 && (
              <span className='position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger'>
                {unreadChatCount} {/* 읽지 않은 채팅 개수 */}
              </span>
            )}
          </i>
          <div className='small'>채팅</div>
        </button>
        <button
          className={`btn btn-link ${location.pathname === '/mypage' ? 'text-primary' : 'text-dark'}`}
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
