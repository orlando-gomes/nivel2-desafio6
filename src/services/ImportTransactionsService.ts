import fs from 'fs';
import path from 'path';
import csvParse from 'csv-parse';
import uploadConfig from '../config/upload';

import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface Request {
  fileName: string;
}

class ImportTransactionsService {
  async execute({ fileName }: Request): Promise<Transaction[]> {
    const totalPath = path.join(uploadConfig.directory, fileName);
    const readCSVStream = fs.createReadStream(totalPath);
    const createTransactionService = new CreateTransactionService();

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const lines: string[] = [];

    parseCSV.on('data', line => {
      lines.push(line);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    const incomes = lines.filter(line => line[1] === 'income');
    const outcomes = lines.filter(line => line[1] === 'outcome');

    // title, type, value, category
    const incomeTransactions = await Promise.all(
      incomes.map(async line => {
        const transaction = await createTransactionService.execute({
          title: line[0],
          value: Number(line[2]),
          type: line[1] as 'income' | 'outcome',
          category: line[3],
        });

        return transaction;
      }),
    );

    const outcomeTransactions = await Promise.all(
      outcomes.map(async line => {
        const transaction = await createTransactionService.execute({
          title: line[0],
          value: Number(line[2]),
          type: line[1] as 'income' | 'outcome',
          category: line[3],
        });

        return transaction;
      }),
    );

    return [...incomeTransactions, ...outcomeTransactions];
  }
}

export default ImportTransactionsService;
