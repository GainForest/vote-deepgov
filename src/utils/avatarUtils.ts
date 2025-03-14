
/**
 * Generates a DiceBear Notionists avatar URL based on the provided name
 * @param name The name to generate an avatar for
 * @returns URL string for the avatar image
 */
export const generateAvatarUrl = (name: string): string => {
  // Encode the name for URL safety
  const encodedName = encodeURIComponent(name.trim());
  
  // Generate the DiceBear Notionists neutral avatar URL
  return `https://api.dicebear.com/7.x/notionists/svg?seed=${encodedName}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
};
