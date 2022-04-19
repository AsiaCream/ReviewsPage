import { useEffect, useState } from 'react';
import { useIntl, FormattedMessage } from 'umi';
import { Empty, Tag, Rate, Spin, Menu, Dropdown, Button } from 'antd';
import { DislikeFilled, LikeFilled, LikeOutlined, DislikeOutlined, DownOutlined } from '@ant-design/icons';
import { reviews } from '@/services/swagger/reviews';
import styles from './index.less';

const { CheckableTag } = Tag;

const sorts = ['Relevant', 'Newest', 'Helpful', 'Highest'];
const tags = ['Rating', 'Quality', 'Comfort', 'Fit', 'Material', 'Satisfaction'];

const Reviews = () => {
  const [total, setTotal] = useState(0);
  const [data, setData] = useState([]);
  const [reviewsLoading, setLoading] = useState(false);
  const [sortItem, setSort] = useState('Newest');
  const [displayMore, setDisplayMore] = useState([]);
  const [displayReport, setDisplayReport] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('');
  const intl = useIntl();

  useEffect(() => {
    console.log('B')
    getReviews();
  }, [sortItem, selectedFilter])

  const getReviews = async () => {
    setLoading(true);
    const response = await reviews({ includeLocales: 'en*', limit: 10, offset: 0, sort: sortItem.toLowerCase() });

    setTotal(response?.totalResults)
    setData(response?.reviews);
    setLoading(false);
  }

  const menu = (
    <Menu>
      {
        sorts.map(item =>
          <Menu.Item key={item}>
            <a onClick={() => setSort(item)}>{item}</a>
          </Menu.Item>
        )
      }
    </Menu>
  );

  const handleSelectedFilter = (tag) => {
    const current = tag === selectedFilter ? '' : tag;
    setSelectedFilter(current);
  }

  const handleFeedback = (type, item) => {
    if(item.feedback) return;
    // 正常情况应是 call api，此处模拟
    const newData = data.map(record => {
      if(record.id === item.id) {
        return ({
          ...item,
          positiveFeedbackCount: type === 'positive' ? item.positiveFeedbackCount + 1 : item.positiveFeedbackCount,
          negativeFeedbackCount: type === 'negative' ? item.negativeFeedbackCount + 1 : item.negativeFeedbackCount,
          feedback: type,
        })
      } else {
        return record;
      }
    })
    setData(newData);
  }

  const handleMore = (item) => {
    const moreSet = new Set(displayMore);

    moreSet.add(item);
    setDisplayMore([...moreSet])
  }

  const handleReport = (item) => {
    const reportSet = new Set(displayReport);

    reportSet.add(item);
    setDisplayReport([...reportSet])
  }

  const renderBadges = (badges) => {
    const nodes = badges.map(item => {
      let badge = '';
      for(let c of item) {
        if(c.charCodeAt() >= 65 && c.charCodeAt() <=90) {
          badge = badge + ' ' + c;
        } else {
          badge = badge + c;
        }
      }
      return ` | ${badge}`;
    })
    return nodes;
  }

  return (
    <div className={styles.container}>
      <section className={styles.leftContent}>
        <strong>{total} Reviews</strong>
        <div className={styles.scoreBox}>
          <Rate className={styles.largeStar} allowHalf defaultValue={4.5} disabled={true} /><strong>4.5</strong>
        </div>
        <div className={styles.otherScoreBox}>
          <div className={styles.otherScoreItem}>
            <span>
              <Rate className={styles.star} allowHalf defaultValue={1} count={1} disabled={true} />
              <strong>4.0</strong>
            </span>
            <strong>comfort</strong>
          </div>
          <div className={styles.otherScoreItem}>
            <span>
              <Rate className={styles.star} allowHalf defaultValue={1} count={1} disabled={true} />
              <strong>4.4</strong>
            </span>
            <strong>quality</strong>
          </div>
        </div>
        <div>
          <strong className={styles.subTitleBox}>Fit</strong>
          <Tag color="blue">perfect</Tag>
        </div>
        <div>
          <strong className={styles.subTitleBox}>Length</strong>
          <Tag color="blue">perfect</Tag>
        </div>
        <div>
          <strong className={styles.subTitleBox}>
            {intl.formatMessage({ id: 'filter.reviews.by' })}
          </strong>
          <div>
          {
            tags.map(tag => (
              <CheckableTag
                key={tag}
                checked={selectedFilter.indexOf(tag) > -1}
                onChange={() => handleSelectedFilter(tag)}
                className={styles.filterTag}
              >
                {tag}
              </CheckableTag>
            ))
          }
          </div>
        </div>
      </section>
      <section className={styles.rightContent}>
        <div className={styles.filterBox}>
          <Dropdown overlay={menu} size="large">
            <Button className="ant-dropdown-link" onClick={e => e.preventDefault()}>
             {intl.formatMessage({ id: 'sort.by' })}: {sortItem}<DownOutlined />
            </Button>
          </Dropdown>
        </div>
        <Spin spinning={reviewsLoading}>
        {
          data.length ?
          data.map(item => 
            <div key={item.id} className={styles.reviewBox}>
              <h3>{item.title}</h3>
              <Rate className={styles.smallStar} allowHalf defaultValue={item.rating} disabled={true} />
              <p>{item.text}</p>
              {
                displayMore.includes(item.id) &&
                <p className={styles.moreBox}>{item.userNickname} | {item.formattedDate} {renderBadges(item.badges)}</p>
              }
              <div className={styles.feedbackContent}>
                <div>
                  <span className={styles.marginRight}>Helpful?</span>
                  { item.feedback === 'positive' ? <LikeFilled className={styles.helpfulBox} /> : <LikeOutlined onClick={() => handleFeedback('positive', item)} className={styles.helpfulBox} style={{ cursor: item.feedback === 'negative' ? 'auto' : 'pointer' }}/> }
                  <span className={styles.marginRight}>{item.positiveFeedbackCount}</span>
                  { item.feedback === 'negative' ? <DislikeFilled className={styles.helpfulBox} /> : <DislikeOutlined onClick={() => handleFeedback('negative', item)} className={styles.helpfulBox} style={{ cursor: item.feedback === 'positive' ? 'auto' : 'pointer' }}  /> }
                  <span className={styles.marginRight}>{item.negativeFeedbackCount}</span>
                </div>
                {
                  displayMore.includes(item.id) ? 
                    ( displayReport.includes(item.id) ? <small className={styles.reportedBox}>Review reported.</small> : <a onClick={() => handleReport(item.id)}>Report review</a>)
                    :
                    <a onClick={() => handleMore(item.id)}>
                      {intl.formatMessage({ id: 'common.read.more' })}
                    </a>
                }
              </div>
            </div>
          ) :
          <Empty title="No Record" />
        }
        </Spin>
      </section>
    </div>
  );
};

export default Reviews;