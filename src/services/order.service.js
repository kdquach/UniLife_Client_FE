import { api } from '@/services/axios.config';

/** Create order */
export async function createOrder(payload) {
    const res = await api.post('/orders', payload);
    return res.data; // { status, data: { order } }
}


