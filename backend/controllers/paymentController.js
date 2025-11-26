import Payment from '../models/paymentModel.js';
import { getAll, getOne, createOne, updateOne, deleteOne } from './factoryController.js';

export const getAllPayments = getAll(Payment);
export const getPayment = getOne(Payment, [{ path: 'contract' }]);
export const createPayment = createOne(Payment);
export const updatePayment = updateOne(Payment);
export const deletePayment = deleteOne(Payment);
