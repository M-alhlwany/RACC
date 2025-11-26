import Owner from '../models/ownerModel.js';
import { getAll, getOne, createOne, updateOne, deleteOne } from './factoryController.js';

export const getAllOwners = getAll(Owner);
export const getOwner = getOne(Owner);
export const createOwner = createOne(Owner);
export const updateOwner = updateOne(Owner);
export const deleteOwner = deleteOne(Owner);
