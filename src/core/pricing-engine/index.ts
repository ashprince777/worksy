export interface LineItem {
  serviceId: string;
  title: string;
  unitPrice: number;
  quantity: number;
}

export interface CouponDiscountRule {
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  maxDiscountAmount?: number | null;
  minOrderAmount: number;
}

export interface PriceCalculationResult {
  subtotal: number;
  discount: number;
  taxableAmount: number;
  tax: number;
  platformFee: number;
  finalTotal: number;
  commissionRate: number;
  commissionAmount: number;
  professionalPayout: number;
}

export class PricingEngine {
  static readonly DEFAULT_PLATFORM_FEE = 49.0;
  static readonly DEFAULT_GST_PERCENT = 18.0;
  static readonly DEFAULT_COMMISSION_PERCENT = 15.0;

  static calculateTotals(
    items: LineItem[],
    coupon?: CouponDiscountRule | null,
    customPlatformFee = PricingEngine.DEFAULT_PLATFORM_FEE,
    commissionRate = PricingEngine.DEFAULT_COMMISSION_PERCENT
  ): PriceCalculationResult {
    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * (item.quantity || 1), 0);

    let discount = 0;
    if (coupon && subtotal >= coupon.minOrderAmount) {
      if (coupon.discountType === "PERCENTAGE") {
        discount = (subtotal * coupon.discountValue) / 100;
        if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
          discount = coupon.maxDiscountAmount;
        }
      } else {
        discount = Math.min(coupon.discountValue, subtotal);
      }
    }

    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = Math.round((taxableAmount * PricingEngine.DEFAULT_GST_PERCENT) / 100);
    const platformFee = subtotal > 0 ? customPlatformFee : 0;
    const finalTotal = taxableAmount + tax + platformFee;

    // Commission logic: computed on service earnings before taxes
    const commissionAmount = Math.round((taxableAmount * commissionRate) / 100);
    const professionalPayout = Math.max(0, taxableAmount - commissionAmount);

    return {
      subtotal,
      discount: Math.round(discount),
      taxableAmount,
      tax,
      platformFee,
      finalTotal,
      commissionRate,
      commissionAmount,
      professionalPayout,
    };
  }
}
