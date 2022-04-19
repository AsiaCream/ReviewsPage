import { parse } from 'url'; // mock tableListDataSource
import Data from './reviewsData.json';

let tableListDataSource = Data.reviews;

function getReviews(req, res, u) {
  let realUrl = u;

  if (!realUrl || Object.prototype.toString.call(realUrl) !== '[object String]') {
    realUrl = req.url;
  }

  const { current = 1, pageSize = 10 } = req.query;
  const params = parse(realUrl, true).query;
  let dataSource = [...tableListDataSource].slice((current - 1) * pageSize, current * pageSize);

  if (params.sort) {
    if(params.sort === 'helpful') {
      dataSource = dataSource.sort((prev, next) => {
        let sortNumber = 0;
        const prevHelpful = prev.negativeFeedbackCount + prev.positiveFeedbackCount;
        const nextHelpful = next.negativeFeedbackCount + next.positiveFeedbackCount;
  
        if (prevHelpful > nextHelpful) {
          sortNumber += -1;
        } else {
          sortNumber += 1;
        }
        return sortNumber;
      });
    } else if(params.sort === 'highest') {
      dataSource = dataSource.sort((prev, next) => {
        let sortNumber = 0;

        if (prev.rating > next.rating) {
          sortNumber += -1;
        } else {
          sortNumber += 1;
        }
        return sortNumber;
      });
    } else {
      const randomLen = Math.floor(Math.random() * 10)
      dataSource = dataSource.slice(0, randomLen);
    }
  }

  if (params.filter) {
    const randomLen = Math.floor(Math.random() * 10)
    dataSource = dataSource.slice(0, randomLen);
  }

  const result = {
    reviews: dataSource,
    totalResults: 62,
  };
  return res.json(result);
}

export default {
  'GET /api/reviews': getReviews,
};
