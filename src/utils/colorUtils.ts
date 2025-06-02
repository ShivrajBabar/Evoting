
/**
 * Helper function to get a color based on party name
 * @param partyName The name of the political party
 * @returns A consistent color based on the party name
 */
export function getPartyColor(partyName: string): string {
  // Create a simple hash of the party name to generate a consistent color
  let hash = 0;
  for (let i = 0; i < partyName.length; i++) {
    hash = partyName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Convert to a hue value (0-360)
  const hue = hash % 360;
  
  // Use HSL to generate colors with consistent saturation and lightness
  return `hsl(${hue}, 70%, 50%)`;
}
