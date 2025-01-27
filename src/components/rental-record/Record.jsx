import PropTypes from 'prop-types';
import ButtonSection from './ButtonSection';

const Record = ({ record }) => {
  return (
    <>
      <div className='row align-items-center my-3'>
        <div className='col-auto'>
          <img
            src={record.productImageUrl}
            alt='상품 이미지'
            className='img-fluid rounded'
            style={{ width: '150px', height: '150px', objectFit: 'cover' }}
          />
        </div>

        <div
          className='col ms-3 d-flex flex-column justify-content-between text-start'
          style={{ height: '150px' }}
        >
          <h5>{record.title}</h5>

          {record.startDate && (
            <>
              <div className='col-auto d-flex align-items-center'>
                <img
                  src={record.userImageUrl}
                  alt='거래자 이미지'
                  className='img-fluid rounded-circle'
                  style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                />
                <p className='ms-2 mb-0'>{record.nickname}</p>
              </div>
              <p className='text-muted mb-0'>
                대여기간: {record.startDate} ~{' '}
                {record.returnDate ? record.returnDate : record.expectedReturnDate}
              </p>
            </>
          )}
        </div>
      </div>
      <ButtonSection record={record} />
    </>
  );
};

Record.propTypes = {
  record: PropTypes.shape({
    rentalRecordId: PropTypes.number,
    startDate: PropTypes.string,
    expectedReturnDate: PropTypes.string,
    returnDate: PropTypes.string,
    productId: PropTypes.number.isRequired,
    productImageUrl: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    userImageUrl: PropTypes.string,
    nickname: PropTypes.string,
  }).isRequired,
};

export default Record;
