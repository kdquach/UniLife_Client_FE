
import { api } from '@/services/axios.config';


export async function paymentMomo(payload) {
    const res = await api.post('/momo/create', payload);
    return res.data;
}

export async function getMomoPaymentResult() {
    const res = await api.post('/momo/result');
    return res.data;
}
