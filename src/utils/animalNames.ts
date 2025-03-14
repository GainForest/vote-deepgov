
// Array of animal names for random generation
export const animalNames = [
  "Alligator", "Antelope", "Armadillo", "Badger", "Bat", "Bear", "Beaver", "Bee",
  "Bison", "Butterfly", "Camel", "Cat", "Cheetah", "Chicken", "Chimpanzee", "Chinchilla",
  "Cobra", "Coyote", "Crab", "Crocodile", "Crow", "Deer", "Dolphin", "Dove",
  "Duck", "Eagle", "Elephant", "Elk", "Falcon", "Ferret", "Finch", "Flamingo",
  "Fox", "Frog", "Gazelle", "Giraffe", "Goat", "Goldfish", "Goose", "Gorilla",
  "Hamster", "Hare", "Hawk", "Hedgehog", "Hippopotamus", "Horse", "Hummingbird", "Hyena",
  "Iguana", "Impala", "Jaguar", "Jellyfish", "Kangaroo", "Koala", "Komodo", "Lemur",
  "Leopard", "Lion", "Llama", "Lobster", "Lynx", "Macaw", "Magpie", "Meerkat",
  "Mongoose", "Monkey", "Moose", "Mouse", "Narwhal", "Newt", "Nightingale", "Octopus",
  "Okapi", "Opossum", "Ostrich", "Otter", "Owl", "Oyster", "Panda", "Panther",
  "Parrot", "Peacock", "Pelican", "Penguin", "Pheasant", "Platypus", "Porcupine", "Puma",
  "Quail", "Quokka", "Rabbit", "Raccoon", "Raven", "Reindeer", "Rhinoceros", "Salamander",
  "Salmon", "Scorpion", "Seahorse", "Seal", "Shark", "Sheep", "Sloth", "Snail",
  "Snake", "Sparrow", "Squid", "Squirrel", "Starfish", "Swan", "Tiger", "Toucan",
  "Turkey", "Turtle", "Vulture", "Walrus", "Weasel", "Whale", "Wolf", "Wolverine",
  "Wombat", "Woodpecker", "Yak", "Zebra"
];

// Array of adjectives for random generation
export const adjectives = [
  "Adorable", "Adventurous", "Agile", "Amazing", "Amusing", "Blazing", "Bold", "Brave",
  "Bright", "Brilliant", "Calm", "Careful", "Charming", "Cheerful", "Clever", "Colorful",
  "Courageous", "Creative", "Curious", "Daring", "Delightful", "Determined", "Eager", "Elegant",
  "Energetic", "Enthusiastic", "Fantastic", "Fast", "Fearless", "Feisty", "Fierce", "Friendly",
  "Funny", "Gentle", "Gigantic", "Graceful", "Happy", "Helpful", "Honest", "Humorous",
  "Impressive", "Incredible", "Intelligent", "Interesting", "Jolly", "Joyful", "Kind", "Lively",
  "Lucky", "Magical", "Majestic", "Marvelous", "Mighty", "Mysterious", "Noble", "Optimistic",
  "Peaceful", "Playful", "Powerful", "Proud", "Quick", "Quiet", "Remarkable", "Resilient",
  "Resourceful", "Respectful", "Silly", "Smart", "Speedy", "Spirited", "Splendid", "Stellar",
  "Strong", "Stunning", "Superb", "Swift", "Talented", "Tenacious", "Thankful", "Thoughtful",
  "Thrilling", "Trustworthy", "Valiant", "Versatile", "Vibrant", "Vigilant", "Warm", "Watchful",
  "Wild", "Wise", "Witty", "Wonderful", "Zany", "Zealous"
];

// Function to get a random animal name
export function getRandomAnimalName(): string {
  const randomAnimalIndex = Math.floor(Math.random() * animalNames.length);
  const randomAdjectiveIndex = Math.floor(Math.random() * adjectives.length);
  
  const adjective = adjectives[randomAdjectiveIndex];
  const animal = animalNames[randomAnimalIndex];
  
  return `${adjective}-${animal}`;
}
