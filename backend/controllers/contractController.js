import Contract from '../models/contractModel.js';
import { getAll, getOne, createOne, updateOne, deleteOne } from './factoryController.js';

export const getAllContracts = getAll(Contract);
export const getContract = getOne(Contract, [{ path: 'deed' }, { path: 'owner' }]);
export const createContract = createOne(Contract);
export const updateContract = updateOne(Contract);
export const deleteContract = deleteOne(Contract);
