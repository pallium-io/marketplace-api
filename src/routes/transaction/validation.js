import Validator from 'fastest-validator';

const v = new Validator();

export const validateLastTxns = v.compile({
  $$strict: true, // no additional properties allowed

  where: {
    $$type: 'object',
    address: {
      type: 'string'
    }
  }
});
