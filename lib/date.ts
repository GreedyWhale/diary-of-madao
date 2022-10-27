import dayjs from 'dayjs';

export const formatDate = (date: Date, template = 'YYYY-MM-DD') => dayjs(date).format(template);
