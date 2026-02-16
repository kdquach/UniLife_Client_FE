
import { api } from '@/services/axios.config';


export async function paymentMomo(payload) {
    const res = await api.post('/payment/create', payload);
    return res.data;
}

export async function getMomoPaymentResult() {
    const res = await api.post('/payment/result');
    return res.data;
}
