/**
 * Dynamic Security Deposit Calculation Helper
 * 
 * Computes the refundable security deposit according to the product's
 * configured deposit type:
 * - PERCENT_OF_RENTAL: deposit is calculated as a percentage of the base price
 * - FIXED / FIXED_AMOUNT: deposit is a flat fixed amount
 * - Fallback: defaults to 2x the daily rental price
 */
export const calculateProductDeposit = (product, customPrice = null) => {
  if (!product) return 0;
  const price = customPrice !== null && customPrice !== undefined 
    ? Number(customPrice) 
    : Number(product.rentalPrice || product.dailyCharge || 0);

  const calcType = product.securityDepositCalcType;
  const val = Number(product.securityDepositValue);

  if (calcType === 'PERCENT_OF_RENTAL' && !isNaN(val) && val > 0) {
    return (price * val) / 100;
  }

  if ((calcType === 'FIXED' || calcType === 'FIXED_AMOUNT') && !isNaN(val) && val > 0) {
    return val;
  }

  // Dynamic standard fallback if vendor did not specify an override: 2x daily rental rate
  return price * 2;
};
