import { getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const repositoryExists = await transactionsRepository.findOne(id);

    if (!repositoryExists) {
      throw new AppError('Transactions does not exists', 400);
    }

    await transactionsRepository.remove(repositoryExists);
  }
}

export default DeleteTransactionService;
