import { request } from 'umi';

export async function reviews(params, options) {
  return request('/api/reviews', {
    method: 'GET',
    params: { ...params },
    ...(options || {}),
  });
}