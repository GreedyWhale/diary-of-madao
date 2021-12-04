import type { API } from '~/types/API';

import React from 'react';

import styles from '~/assets/styles/pagination.module.scss';

type PaginationProps = API.BasePagination & {
  onClick: (_currentPage: number) => void;
  maxRenderItems?: number;
  step?: number;
}

const Pagination = (props: PaginationProps) => {
  const paginationItems = React.useMemo(() => {
    const totalPages = Math.ceil(props.total / props.pageSize);
    const renderNumber = totalPages > props.maxRenderItems ? props.maxRenderItems : totalPages;
    const renderItems = Array.from({ length: renderNumber }, (value, index) => index + 1);
    if (renderNumber <= 3) {
      return renderItems;
    }

    const centerIndex = Math.ceil((renderNumber - 1) / 2);
    const pageItems = renderItems
      .map((value, index) => {
        if (index < centerIndex) {
          // (index + 1) - 当前次数
          let currentValue = props.currentPage - (index + 1);
          if (currentValue <= 0) {
            // (renderNumber - centerIndex - 1) - 最大递增次数
            currentValue = (renderNumber - centerIndex - 1) + props.currentPage + Math.abs(currentValue) + 1;
          }

          return currentValue;
        }

        if (index === centerIndex) {
          return props.currentPage;
        }

        // (index - centerIndex) - 当前次数
        let currentValue = props.currentPage + (index - centerIndex);
        if (currentValue > totalPages) {
          // centerIndex - 最大递减次数
          currentValue = props.currentPage - centerIndex - (currentValue - totalPages);
        }

        return currentValue;
      })
      .sort((a, b) => a - b);

    pageItems.splice(0, 1, 1);
    pageItems.splice(renderNumber - 1, 1, totalPages);
    return pageItems;
  }, [props.total, props.pageSize, props.maxRenderItems, props.currentPage]);

  return (
    <div>
      <ul className={styles.pagination}>
        {paginationItems.map((value, index) => {
          const nextItem = paginationItems[index + 1];
          return (
            <React.Fragment key={value}>
              <li
                data-active={value === props.currentPage}
                onClick={() => props.onClick(value)}
              >
                {value}
              </li>
              {(nextItem && nextItem - value > 1) && (
                <li
                  title={`${nextItem < props.currentPage ? '向前' : '向后'} ${props.step} 页`}
                  onClick={() => props.onClick(nextItem < props.currentPage ? props.currentPage - props.step : props.currentPage + props.step)}
                >
                  ...
                </li>
              )}
            </React.Fragment>
          );
        })}
      </ul>
    </div>
  );
};

Pagination.defaultProps = {
  maxRenderItems: 7,
  step: 5,
};

export default Pagination;
