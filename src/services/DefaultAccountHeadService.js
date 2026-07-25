import AccountHead from '../models/AccountHead.js';

const DEFAULT_ACCOUNT_HEADS = [
  { name: 'Assets', code: '10000', type: 'ASSET', parentCode: null },
  { name: 'Liabilities', code: '20000', type: 'LIABILITY', parentCode: null },
  { name: 'Equity', code: '30000', type: 'EQUITY', parentCode: null },
  { name: 'Income', code: '40000', type: 'INCOME', parentCode: null },
  { name: 'Expenses', code: '50000', type: 'EXPENSE', parentCode: null },
  { name: 'Cash and Bank Balances', code: '11000', type: 'ASSET', parentCode: '10000' },
  { name: 'Cash in Hand', code: '11001', type: 'ASSET', parentCode: '11000' },
  { name: 'Cash at Bank', code: '11002', type: 'ASSET', parentCode: '11000' },
  { name: 'Loan Receivables', code: '12000', type: 'ASSET', parentCode: '10000' },
  { name: 'Loan Outstanding Ledger', code: '12001', type: 'ASSET', parentCode: '12000' },
  { name: 'Deposits Liabilities', code: '21000', type: 'LIABILITY', parentCode: '20000' },
  { name: 'Savings Deposit Liability', code: '21001', type: 'LIABILITY', parentCode: '21000' },
  { name: 'Recurring Deposit Liability', code: '21002', type: 'LIABILITY', parentCode: '21000' },
  { name: 'Fixed Deposit Liability', code: '21003', type: 'LIABILITY', parentCode: '21000' },
  { name: 'Daily Deposit Liability', code: '21004', type: 'LIABILITY', parentCode: '21000' },
  { name: 'Monthly Investment Scheme Liability', code: '21005', type: 'LIABILITY', parentCode: '21000' },
  { name: 'Share Capital Outstanding', code: '31001', type: 'EQUITY', parentCode: '30000' },
  { name: 'Opening Balance Equity', code: '31002', type: 'EQUITY', parentCode: '30000' },
  { name: 'Operating Income', code: '41000', type: 'INCOME', parentCode: '40000' },
  { name: 'Interest Income Ledger', code: '41001', type: 'INCOME', parentCode: '41000' },
  { name: 'Penalty Income Ledger', code: '41002', type: 'INCOME', parentCode: '41000' },
  { name: 'Membership Fees Income', code: '41003', type: 'INCOME', parentCode: '41000' },
  { name: 'Operating Expenses', code: '51000', type: 'EXPENSE', parentCode: '50000' },
  { name: 'Interest Expenses Ledger', code: '51001', type: 'EXPENSE', parentCode: '51000' },
  { name: 'Write-off Expense Ledger', code: '51002', type: 'EXPENSE', parentCode: '51000' },
  { name: 'Staff Salary Expense', code: '51003', type: 'EXPENSE', parentCode: '51000' },
];

const DEFAULT_ACCOUNT_HEAD_BY_CODE = new Map(
  DEFAULT_ACCOUNT_HEADS.map((head) => [head.code, head])
);

export class DefaultAccountHeadService {
  async ensure(code, session = null) {
    const target = DEFAULT_ACCOUNT_HEAD_BY_CODE.get(code);
    if (!target) return null;

    const docsByCode = new Map();
    const chain = this.#buildChain(target);

    for (const node of chain) {
      let parentAccountId = null;
      if (node.parentCode) {
        const parent = docsByCode.get(node.parentCode)
          || await AccountHead.findOne({ code: node.parentCode }).session(session);
        parentAccountId = parent?._id || null;
      }

      const doc = await AccountHead.findOneAndUpdate(
        { code: node.code, isDeleted: { $in: [false, true] } },
        {
          $setOnInsert: {
            name: node.name,
            code: node.code,
            type: node.type,
            parentAccountId,
            status: 'ACTIVE',
          },
          $set: {
            isDeleted: false,
          },
        },
        { upsert: true, returnDocument: 'after', session }
      );

      docsByCode.set(node.code, doc);
    }

    return docsByCode.get(code) || null;
  }

  #buildChain(node, chain = []) {
    if (node.parentCode) {
      const parent = DEFAULT_ACCOUNT_HEAD_BY_CODE.get(node.parentCode);
      if (parent) this.#buildChain(parent, chain);
    }
    if (!chain.some((item) => item.code === node.code)) {
      chain.push(node);
    }
    return chain;
  }
}

const defaultAccountHeadServiceInstance = new DefaultAccountHeadService();
export default defaultAccountHeadServiceInstance;
export { defaultAccountHeadServiceInstance as DefaultAccountHeadServiceInstance };
