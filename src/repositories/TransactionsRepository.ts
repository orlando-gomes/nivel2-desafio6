import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const balance = transactions.reduce(
      (bal: Balance, transaction: Transaction) => {
        if (transaction.type === 'income') {
          bal.income += transaction.value;
        } else {
          bal.outcome += transaction.value;
        }
        bal.total = bal.income - bal.outcome;
        return bal;
      },
      {
        income: 0,
        outcome: 0,
        total: 0,
      },
    );

    return balance;
  }
}

export default TransactionsRepository;
