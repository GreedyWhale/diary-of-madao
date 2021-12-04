import React from 'react';
import ReactDom from 'react-dom';
import { CSSTransition } from 'react-transition-group';

import styles from '~/assets/styles/notification.module.scss';

import { EVENT_UPDATE_NOTIFICATION } from '~/utils/constants';
import eventHub from '~/utils/eventHub';

interface NotificationProps {
  theme?: 'success' | 'fail';
  title?: string;
  content: string;
  id: number;
  onClose: () => void;
  delay?: number;
}

const Notification = (props: NotificationProps) => {
  const [visibleNotification, setVisibleNotification] = React.useState(false);

  React.useEffect(() => {
    setVisibleNotification(true);
  }, []);

  React.useEffect(() => {
    if (props.delay) {
      window.setTimeout(() => {
        setVisibleNotification(false);
      }, props.delay);
    }
  }, [props.delay]);

  return (
    <CSSTransition
      in={visibleNotification}
      timeout={300}
      classNames={{
        enter: styles.notificationAnimationEnter,
        enterActive: styles.notificationAnimationEnterActive,
        exit: styles.notificationAnimationExit,
        exitActive: styles.notificationAnimationExitActive,
      }}
      unmountOnExit
      onExited={() => props.onClose()}
    >
      <div
        data-theme={props.theme || 'success'}
        className={styles.notification}
      >
        <span />
        <div className={styles.content}>
          <div className={styles.title}>
            <h3>{props.title || '提示'}</h3>
            <button onClick={() => setVisibleNotification(false)}/>
          </div>
          <p>{props.content}</p>
        </div>
      </div>
    </CSSTransition>
  );
};

Notification.defaultProps = {
  delay: 3000,
};

const NotificationWrap = (props: { onMounted: () => void }) => {
  const [notificationList, setNotificationList] = React.useState<NotificationProps[]>([]);
  React.useEffect(() => {
    const listener = eventHub.on(EVENT_UPDATE_NOTIFICATION, (notifications: NotificationProps[]) => {
      setNotificationList(notifications);
    });

    return () => eventHub.off(EVENT_UPDATE_NOTIFICATION, listener);
  }, []);

  React.useEffect(() => {
    props.onMounted();
  }, [props]);

  return (
    <div className={styles.notificationWrap}>
      {Boolean(notificationList.length) && notificationList.map(childProps => (
        <Notification {...childProps} key={childProps.id} />
      ))}
    </div>
  );
};

const showNotification = () => {
  let id = 0;
  let notifications: NotificationProps[] = [];
  let mounted: 'initial' | 'pending' | 'done' = 'initial';
  const getAnchorElement = () => {
    let anchor = document.querySelector('.notification-anchor');
    if (anchor) {
      return anchor;
    }

    anchor = document.createElement('div');
    anchor.classList.add('notification-anchor');
    document.body.appendChild(anchor);
    return anchor;
  };

  return (props: Omit<NotificationProps, 'id' | 'onClose'>) => {
    const mountedElement = getAnchorElement();
    id += 1;
    const onClose = ((id: number) => () => {
      notifications = notifications.filter(value => value.id !== id);
      eventHub.emit(EVENT_UPDATE_NOTIFICATION, notifications);
    })(id);

    notifications = [...notifications, { ...props, id, onClose }];

    if (mounted === 'initial') {
      mounted = 'pending';
      ReactDom.render(
        <NotificationWrap onMounted={() => {
          mounted = 'done';
          eventHub.emit(EVENT_UPDATE_NOTIFICATION, notifications);
        }} />,
        mountedElement,
      );
    }

    if (mounted === 'done') {
      eventHub.emit(EVENT_UPDATE_NOTIFICATION, notifications);
    }

    return onClose;
  };
};

export default showNotification();

