/**
 * Base rate configuration
 * In a real application, these might be stored in a configuration database.
 */
const BASE_RATES = {
  SHARED: {
    PER_KM: 10.0, // Ethiopian Birr (ETB) per KM
    BASE_FEE: 15.0, // Base starting fee
    MINIMUM_FARE: 30.0,
  },
  PRIVATE: {
    PER_KM: 25.0,
    BASE_FEE: 50.0,
    MINIMUM_FARE: 100.0,
  }
};

/**
 * Calculates the total fare for a ride based on distance and type.
 * Ensures transparent, fixed-fare logic preventing detour inflations.
 * 
 * @param distanceKm Estimated distance in kilometers
 * @param rideType "SHARED" or "PRIVATE"
 * @param surgeMultiplier Surge pricing multiplier (default 1.0)
 * @param discountAmount Any fixed discount amount (default 0)
 * @returns Final fixed fare for the ride
 */
export function calculateFare(
  distanceKm: number,
  rideType: 'SHARED' | 'PRIVATE',
  surgeMultiplier: number = 1.0,
  discountAmount: number = 0
): number {
  const rates = BASE_RATES[rideType] || BASE_RATES.PRIVATE;
  
  const distanceFare = distanceKm * rates.PER_KM;
  let subtotal = (rates.BASE_FEE + distanceFare) * surgeMultiplier;
  
  if (subtotal < rates.MINIMUM_FARE) {
    subtotal = rates.MINIMUM_FARE;
  }
  
  let finalFare = subtotal - discountAmount;
  
  // Ensure fare is not negative
  if (finalFare < 0) {
    finalFare = 0;
  }
  
  // Round to nearest whole number for easier payments
  return Math.round(finalFare);
}

/**
 * Core native cost-splitting algorithm for shared rides.
 * Calculates individual passenger share: fare_share = total_fare / passenger_count
 * 
 * @param totalFare The total fixed fare calculated for the ride
 * @param passengerCount The number of passengers sharing the ride
 * @returns Fare share per passenger
 */
export function splitFare(totalFare: number, passengerCount: number): number {
  if (passengerCount <= 0) return totalFare;
  
  const farePerPerson = totalFare / passengerCount;
  
  // Round up to nearest whole number to ensure total is covered
  return Math.ceil(farePerPerson);
}
