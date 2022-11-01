import dayjs from 'dayjs';

export const formatDate = (date: Date = new Date(), template = 'YYYY-MM-DD') => dayjs(date).format(template);
