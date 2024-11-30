import { AvatarType } from "./types";

const hairStyles = [
  "ShortHairDreads01",
  "ShortHairFrizzle",
  "ShortHairShaggyMullet",
  "LongHairBigHair",
  "LongHairBob",
  "LongHairCurly",
  "LongHairStraight",
  "NoHair", // 대머리는 남겨둡니다.
];

const accessories = [
  "Blank", // 악세서리 없음
  "Prescription01", // 일반 안경
  "Prescription02",
  "Round",
  "Wayfarers", // 기본 선글라스
];
const hairColors = [
  "Auburn",
  "Black",
  "Blonde",
  "BlondeGolden",
  "Brown",
  "BrownDark",
  "Platinum",
  "SilverGray",
];

const clothes = [
  "BlazerShirt",
  "BlazerSweater",
  "Hoodie",
  "Overall",
  "ShirtCrewNeck",
  "ShirtScoopNeck",
  "ShirtVNeck",
];

const clotheColors = [
  "Black",
  "Blue01",
  "Blue02",
  "Gray01",
  "Gray02",
  "Heather",
  "PastelBlue",
  "PastelGreen",
  "PastelOrange",
  "PastelYellow",
  "White",
];

const backgroundColors = [
  "LightGray",
  "PastelBlue",
  "PastelGreen",
  "PastelYellow",
  "PastelPink",
  "White",
  "LightBeige",
  "Lavender",
];

const eyeTypes = ["Default", "Happy", "Side", "Wink", "Surprised"];

const eyebrowTypes = [
  "Default",
  "DefaultNatural",
  "RaisedExcited",
  "SadConcerned",
  "UpDown",
];

const mouthTypes = ["Default", "Smile", "Serious", "Twinkle"];
const skinColors = [
  "Tanned",
  "Yellow",
  "Pale",
  "Light",
  "Brown",
  "DarkBrown",
  "Black",
];

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const generateRandomAvatar = (): AvatarType => {
  return {
    topType: getRandomElement(hairStyles),
    accessoriesType: getRandomElement(accessories),
    hairColor: getRandomElement(hairColors),
    clotheType: getRandomElement(clothes),
    clotheColor: getRandomElement(clotheColors),
    backgroundColor: getRandomElement(backgroundColors),
    eyeType: getRandomElement(eyeTypes),
    eyebrowType: getRandomElement(eyebrowTypes),
    mouthType: getRandomElement(mouthTypes),
    skinColor: getRandomElement(skinColors),
  };
};
