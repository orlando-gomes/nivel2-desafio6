import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    if (type === 'outcome') {
      const { total } = await transactionsRepository.getBalance();

      if (total < value) {
        throw new AppError('Insufficient balance', 400);
      }
    }

    const categoryExists = await categoriesRepository.findOne({
      where: {
        title: category,
      },
    });

    let category_id;

    if (!categoryExists) {
      const categoryModel = categoriesRepository.create({
        title: category,
      });

      const categorySaved = await categoriesRepository.save(categoryModel);
      category_id = categorySaved.id;
    } else {
      const { id } = categoryExists as Category;

      category_id = id;
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id,
    });

    const transactionSaved = await transactionsRepository.save(transaction);

    return transactionSaved;
  }
}

export default CreateTransactionService;
