const { prisma } = require("../config/db");

/**
 * Resolves the unit price and total line amount for a product/variant combination,
 * factoring in variants, price lists, duration, and quantity.
 */
async function resolveLinePrice({
  productId,
  productVariantId,
  quantity,
  rentalStart,
  rentalEnd,
  priceListId = null,
}) {
  // 1. Fetch product
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      variants: {
        where: productVariantId ? { id: productVariantId } : undefined,
        include: {
          attributeValues: {
            include: { attributeValue: true },
          },
        },
      },
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  // 2. Base price calculation
  let basePrice = Number(product.rentalPrice);

  // Add extra price from variant attributes if a variant is chosen
  if (productVariantId && product.variants.length > 0) {
    const variant = product.variants[0];
    for (const valLink of variant.attributeValues) {
      if (valLink.attributeValue && valLink.attributeValue.extraPrice) {
        basePrice += Number(valLink.attributeValue.extraPrice);
      }
    }
  }

  // 3. Price List Rule Application
  let resolvedPrice = basePrice;
  const targetPriceListId = priceListId || await getDefaultPriceListId(product.vendorId);

  if (targetPriceListId) {
    const now = new Date();
    // Fetch rules for this price list
    const rules = await prisma.priceListRule.findMany({
      where: {
        priceListId: targetPriceListId,
        OR: [
          { productId: null },
          { productId: product.id },
        ],
        minQty: { lte: quantity },
      },
    });

    // Filter by validity dates if set
    const validRules = rules.filter(rule => {
      if (rule.validFrom && now < new Date(rule.validFrom)) return false;
      if (rule.validTo && now > new Date(rule.validTo)) return false;
      return true;
    });

    if (validRules.length > 0) {
      // Prefer product-specific rules over "All Products" (productId = null) rules
      validRules.sort((a, b) => {
        if (a.productId && !b.productId) return -1;
        if (!a.productId && b.productId) return 1;
        return 0;
      });

      const matchedRule = validRules[0];
      if (matchedRule.priceType === "DISCOUNT" && matchedRule.discountPercent !== null) {
        resolvedPrice = basePrice * (1 - Number(matchedRule.discountPercent) / 100);
      } else if (matchedRule.priceType === "FIXED" && matchedRule.fixedPrice !== null) {
        resolvedPrice = Number(matchedRule.fixedPrice);
      }
    }
  }

  // 4. Calculate duration units
  const durationMs = new Date(rentalEnd).getTime() - new Date(rentalStart).getTime();
  let periodMs = 24 * 60 * 60 * 1000; // default to DAY

  switch (product.periodicity) {
    case "HOUR":
      periodMs = 60 * 60 * 1000;
      break;
    case "DAY":
    case "NIGHT":
      periodMs = 24 * 60 * 60 * 1000;
      break;
    case "WEEK":
      periodMs = 7 * 24 * 60 * 60 * 1000;
      break;
  }

  const durationUnits = Math.max(1, Math.ceil(durationMs / periodMs));
  const lineAmount = resolvedPrice * quantity * durationUnits;

  return {
    basePrice,
    resolvedPrice,
    durationUnits,
    lineAmount,
  };
}

async function getDefaultPriceListId(vendorId) {
  if (!vendorId) return null;
  const settings = await prisma.vendorSettings.findUnique({
    where: { vendorId },
  });
  if (settings?.defaultPriceListId) return settings.defaultPriceListId;

  // Fallback: Pick the first price list created by this vendor if not explicitly designated
  const firstList = await prisma.priceList.findFirst({
    where: { vendorId },
    orderBy: { createdAt: "asc" }
  });
  return firstList?.id || null;
}

module.exports = {
  resolveLinePrice,
};
