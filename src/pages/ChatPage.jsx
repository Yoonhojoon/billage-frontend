import { useState, useEffect, useRef } from 'react';
import '@/styles/chatting/ChatPage.css';
import ChatPageFooter from '@/components/chatting/ChatPageFooter';
import ChatPageHeader from '@/components/chatting/ChatPageHeader';
import ChatItem from '@/components/chatting/ChatItem';
import { Client } from '@stomp/stompjs';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import SockJS from 'sockjs-client';
import { Container, Button } from 'react-bootstrap';
import { useCookies } from 'react-cookie';

// 사용 예시
const ChatPage = () => {
  // const [client, setClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [page, setPage] = useState(0);
  const [chats, setChats] = useState([]);
  const [isLastPage, setIsLastPage] = useState(false);
  const [isNewMessageAvailable, setIsNewMessageAvailable] = useState(false);
  const [isScrollToDownBtnAvailable, setIsScrollToDownBtnAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [chatroomId, setChatroomId] = useState('');
  const [myId, setMyId] = useState('');

  const [initFinished, setInitFinished] = useState(false);

  const [stompClient, setStompClient] = useState(null);

  const [cookies] = useCookies('accessToken');

  const loadMoreMessageRef = useRef(null);
  const endOfMessageRef = useRef(null);
  const messageContainerRef = useRef(null);

  const location = useLocation();

  const { sellerId, buyerId, productId, opponentName } = location.state || {};

  // const location = useLocation(); // 현재 위치 정보 가져오기
  // const queryParams = queryString.parse(location.search); // 쿼리 파라미터 파싱
  // // const myId = queryParams.token;

  useEffect(() => {
    const payload = JSON.parse(atob(cookies.accessToken.split('.')[1]));
    setMyId(payload.accountId);

    setInitFinished(true);
  }, []);

  useEffect(() => {
    if (!initFinished) return;
    validateChatroom();
    setStompClient(stompClient);
  }, [initFinished]);

  // SockJS 연결 후 STOMP 프로토콜 사용
  useEffect(() => {
    if (!chatroomId) return;
    if (!stompClient) {
      createClient();
    }

    if (!isConnected && stompClient) {
      stompClient.activate();
    }

    return () => {
      if (stompClient) {
        stompClient.deactivate();
      }
    };
  }, [chatroomId, stompClient]);

  useEffect(() => {
    if (!chatroomId) return;
    if (!loadMoreMessageRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchChatData();
        }
      },
      {
        threshold: 0.1,
      }
    );

    observer.observe(loadMoreMessageRef.current);

    return () => observer.disconnect(); // 컴포넌트 언마운트 시 해제
  }, [page, chatroomId]);

  useEffect(() => {
    if (!endOfMessageRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsNewMessageAvailable(false);
        }
      },
      {
        threshold: 0.1,
      }
    );

    observer.observe(endOfMessageRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const container = messageContainerRef.current;
    const handleScroll = () => {
      if (messageContainerRef.current) {
        if (container.scrollTop < 0) setIsScrollToDownBtnAvailable(true);
        else setIsScrollToDownBtnAvailable(false);
      }
    };
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const createClient = () => {
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/connect'),
      // debug: (str) => console.log(str),
      connectHeaders: {
        Authorization: myId,
      },
      onConnect: () => {
        setIsConnected(true);

        client.subscribe(`/sub/chat/${chatroomId}`, (message) => {
          const stompMessage = JSON.parse(message.body);

          setChats((prev) => [stompMessage, ...prev]);
          if (stompMessage.sender.id == myId) {
            scrollToBottom();
          } else {
            lockCurrentPosition('WS');
            setIsNewMessageAvailable(true);

            client.publish({
              destination: `/ack/chat/chatting/${stompMessage.chatId}`,
            });
          }
        });
      },
      onDisconnect: () => {
        setIsConnected(false);
      },
    });

    setStompClient(client);
  };

  const validateChatroom = () => {
    const whatIsMyType = (id) => {
      return myId == id ? myId : id;
    };

    if (!sellerId || !buyerId || !productId) return;

    axios({
      // sellerId, buyerId, productId
      baseURL: '/api/chatroom/valid',
      data: {
        productId: productId,
        sellerId: whatIsMyType(sellerId),
        buyerId: whatIsMyType(buyerId),
      },
      method: 'POST',
    })
      .then((data) => {
        setChatroomId(data.data.chatroomId);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const lockCurrentPosition = (getPrevFlag) => {
    if (!['DB', 'WS'].includes(getPrevFlag)) return;
    const container = messageContainerRef.current;
    const prevScrollHeight = container.scrollHeight;
    const prevScrollTop = container.scrollTop;

    setTimeout(() => {
      const afterScrollHeight = container.scrollHeight;
      const diff = afterScrollHeight - prevScrollHeight;

      if (prevScrollTop > 0.8) {
        setIsNewMessageAvailable(false);
      } else {
        container.scrollTop = prevScrollTop + (getPrevFlag === 'DB' ? 0 : -diff);
      }
    }, 0);
  };

  const fetchChatData = () => {
    setIsLoading(true);
    if (!isLastPage) {
      axios({
        baseURL: `/api/chatroom/${chatroomId}`,
        method: 'GET',
        params: {
          page: page,
          lastLoadChatId: page === 0 ? Number.MAX_SAFE_INTEGER : chats[0].chatId,
        },
        headers: {
          token: myId,
        },
      })
        .then((data) => {
          if (!data.data.length) {
            return;
          }
          setPage((prev) => prev + 1);
          setChats((prev) => [...prev, ...data.data]);
          return data;
        })
        .then((data) => {
          if (data.data.length < 50) {
            setIsLastPage(true);
          }
          if (page === 0) {
            scrollToBottom();
          } else {
            lockCurrentPosition('DB');
          }
        })
        .catch(() => {
          setIsLastPage(true);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  const scrollToBottom = () => {
    setIsNewMessageAvailable(false);
    setTimeout(() => {
      endOfMessageRef.current?.scrollIntoView({ behavior: 'auto' });
    }, 0);
  };

  const handleSendMessage = (message) => {
    if (stompClient && isConnected) {
      try {
        stompClient.publish({
          destination: `/pub/chat/${chatroomId}`,
          body: JSON.stringify({
            message: message,
          }),
        });
      } catch (error) {
        console.error('Fail to send message: ', error);
      }
    }
  };

  const formatDate = (timedata) => {
    const now = new Date();
    const messageDate = new Date(timedata);

    // 오늘 날짜인지 확인
    const isToday =
      now.getDate() === messageDate.getDate() &&
      now.getMonth() === messageDate.getMonth() &&
      now.getFullYear() === messageDate.getFullYear();

    // 오늘이라면 시:분, 아니면 월-일
    if (isToday) {
      const hours = messageDate.getHours().toString().padStart(2, '0');
      const minutes = messageDate.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } else {
      const month = (messageDate.getMonth() + 1).toString().padStart(2, '0');
      const day = messageDate.getDate().toString().padStart(2, '0');
      return `${month}-${day}`;
    }
  };

  const onExitChatroom = async () => {
    try {
      const response = await axios({
        baseURL: `/api/chatroom/${chatroomId}`,
        method: 'DELETE',
      });
      console.log(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Container>
      <ChatPageHeader otherNickname={opponentName} exitButtonHandler={onExitChatroom} />

      <div ref={messageContainerRef} className='messages-container flex-grow-1'>
        <div ref={endOfMessageRef} className='chat-bottom' style={{ height: '1px' }} />

        {chats.map((message, key) => {
          const isMine = message.sender.id == myId;
          return (
            <ChatItem
              message={message.message}
              createdAt={formatDate(message.createdAt)}
              isMine={isMine}
              key={key}
            />
          );
        })}
        {isLastPage && <p>첫 채팅입니다</p>}

        {!isLastPage && !isLoading && (
          <div ref={loadMoreMessageRef} className='load-more-chats' style={{ margin: '1px' }} />
        )}
      </div>

      {isNewMessageAvailable && (
        <Button className='new-message-btn' onClick={scrollToBottom}>
          {'새 메시지'}
          <i className='bi bi-arrow-down'></i>
        </Button>
      )}
      {isScrollToDownBtnAvailable && !isNewMessageAvailable && (
        <Button className='scroll-to-bottom-btn p-0' onClick={scrollToBottom}>
          <i className='bi bi-arrow-down'></i>
        </Button>
      )}
      <ChatPageFooter messageSendHandler={handleSendMessage} />
    </Container>
  );
};

export default ChatPage;