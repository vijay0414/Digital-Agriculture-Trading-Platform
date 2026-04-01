/**
 * Utility function to get a displayable name for a farmer based on their ID.
 * This aligns with the backend API which returns only farmerId.
 */
export function getFarmerDisplayName(farmerId?: number | string): string {
  if (!farmerId) return "Unknown Farmer";
  return `Farmer #${farmerId}`;
}
