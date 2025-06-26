import moment from 'moment';

export function formatDate(date: Date | string) {
  return moment(new Date(date).toUTCString()).format("MMM Do YYYY, h:mma");
}