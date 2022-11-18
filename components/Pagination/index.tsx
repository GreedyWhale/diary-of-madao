import React from 'react';

import styles from './index.module.scss';

type PaginationProps = {
  totalPage: number;
  current: number;
  viewItem: number;
  onClick: (_page: number) => void;
  step?: number;
};

export const Pagination: React.FC<PaginationProps> = props => {
  const [unPassed, setUnPassed] = React.useState(false);

  const items = React.useMemo(() => {
    if (props.totalPage <= props.viewItem) {
      return Array.from({ length: props.totalPage }, (value, index) => index + 1);
    }

    const result = [...new Set([1, props.current, props.totalPage])];
    // 计算左边填充的元素数量
    const numberOfLeftFill = props.current - 1;
    if (numberOfLeftFill) {
      Array.from({ length: numberOfLeftFill }, (value, index) => index + 1)
        .forEach(value => {
          const child = props.current - value;
          if (child > 1 && result.length < props.viewItem) {
            result.push(child);
          }
        });
    }

    // 计算右边填充的元素数量
    const numberOfRightFill = props.viewItem - result.length;
    if (numberOfRightFill) {
      Array.from({ length: numberOfRightFill }, (value, index) => index + 1)
        .forEach(value => {
          const child = props.current + value;
          if (child < props.totalPage && result.length < props.viewItem) {
            result.push(child);
          }
        });
    }

    return result.sort((a, b) => a - b);
  }, [props]);

  const handleClick = (action: 'minus' | 'add' | 'update', payload: number) => {
    switch (action) {
      case 'update':
        props.onClick(payload);
        break;

      case 'minus': {
        let index = props.current - payload;
        if (index < 1) {
          index = 1;
        }

        props.onClick(index);
        break;
      }

      case 'add': {
        let index = props.current + payload;
        if (index > props.totalPage) {
          index = props.totalPage;
        }

        props.onClick(index);
        break;
      }

      default:
        break;
    }
  };

  React.useEffect(() => {
    const rules = [
      { rule: props.totalPage < 1, message: 'totalPage 必须大于或等于 1' },
      { rule: props.viewItem < 1, message: 'viewItem 不能小于1' },
      { rule: props.current > props.totalPage, message: 'current 不能大于 totalPage' },
    ];

    rules.some(item => {
      if (item.rule) {
        setUnPassed(true);
        throw new Error(item.message);
      }

      return item.rule;
    });
  }, [props]);

  return (
    <div className={styles.pagination}>
      {!unPassed && (<ul>
        <li data-disable={props.current === 1} onClick={() => handleClick('minus', 1)}>上一页</li>
        {items.map((item, index) => {
          const prev = items[index - 1];
          const showEllipsis = prev && (item - prev > 1);
          const isAfter = item > props.current;
          return (
            <React.Fragment key={item}>
              {Boolean(showEllipsis) && (
                <li
                  data-ellipsis='true'
                  title={isAfter ? `向后${props.step!}页` : `向前${props.step!}页`}
                  onClick={() => handleClick(isAfter ? 'add' : 'minus', props.step!)}
                >
                  ...
                </li>
              )}
              <li data-active={props.current === item} onClick={() => handleClick('update', item)}>{item}</li>
            </React.Fragment>
          );
        })}
        <li data-disable={props.current === props.totalPage} onClick={() => handleClick('add', 1)}>下一页</li>
      </ul>)}
    </div>
  );
};

Pagination.defaultProps = {
  step: 5,
};
