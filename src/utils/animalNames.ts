
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

// Function to get a random animal name
export function getRandomAnimalName(): string {
  const randomIndex = Math.floor(Math.random() * animalNames.length);
  return animalNames[randomIndex];
}
