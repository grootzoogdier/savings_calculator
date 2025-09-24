/**
 * Format currency values for display
 * @param amount - The amount to format
 * @returns Formatted currency string in EUR
 */
export const formatCurrency = (amount: number): string => {
  if (isNaN(amount) || !isFinite(amount)) {
    return "€0"
  }

  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
