import Header from '../components/common/Header';
import RecordList from '../components/rental-record/RecordList';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Tab from '../components/common/Tab';

const MyPurchase = () => {
  const [records, setRecords] = useState([]);
  const [activeTab, setActiveTab] = useState('');

  const tabs = [
    { name: '대여 중', value: 'rental-record?type=대여중/구매' },
    { name: '대여 내역', value: 'rental-record?type=대여내역/구매' },
  ];

  const handleTabChange = async (value) => {
    setActiveTab(value);
    try {
      const response = await axios.get(`/api/${value}`);
      setRecords(response.data);
    } catch (error) {
      console.error('대여기록을 가져오는 데 실패했습니다.', error);
    }
  };

  const defaultTab = 'rental-record?type=대여중/구매';

  useEffect(() => {
    handleTabChange(defaultTab);
  }, []);

  return (
    <>
      <Header title='내가 빌리는 물건' />
      <Tab tabs={tabs} onChangeTab={handleTabChange} defaultTab={defaultTab} />
      <RecordList records={records} activeTab={activeTab} />
    </>
  );
};

export default MyPurchase;