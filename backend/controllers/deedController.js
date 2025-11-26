import Deed from '../models/deedModel.js';
import { getAll, getOne, createOne, updateOne, deleteOne } from './factoryController.js';

export const getAllDeeds = getAll(Deed);
export const getDeed = getOne(Deed);
export const createDeed = createOne(Deed);
export const updateDeed = updateOne(Deed);
export const deleteDeed = deleteOne(Deed);
