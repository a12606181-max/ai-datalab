export const USER_GENDERS = ["MALE", "FEMALE"] as const;

export type UserGenderValue = (typeof USER_GENDERS)[number];

export type AvatarOption = {
  key: string;
  gender: UserGenderValue;
  label: string;
  src: string;
};

export const AVATAR_OPTIONS: AvatarOption[] = [
  {
    key: "male-cosmos-headphones",
    gender: "MALE",
    label: "Космос в наушниках",
    src: "/avatars/male-cosmos-headphones.svg",
  },
  {
    key: "male-light-headphones",
    gender: "MALE",
    label: "Светлый минимал",
    src: "/avatars/male-light-headphones.svg",
  },
  {
    key: "male-crown-shades",
    gender: "MALE",
    label: "Корона и очки",
    src: "/avatars/male-crown-shades.svg",
  },
  {
    key: "female-pink-bow",
    gender: "FEMALE",
    label: "Розовый бант",
    src: "/avatars/female-pink-bow.svg",
  },
  {
    key: "female-butterfly-glow",
    gender: "FEMALE",
    label: "Бабочка",
    src: "/avatars/female-butterfly-glow.svg",
  },
  {
    key: "female-bow-headphones",
    gender: "FEMALE",
    label: "Наушники с бантиками",
    src: "/avatars/female-bow-headphones.svg",
  },
];

export function isSupportedUserGender(value: string): value is UserGenderValue {
  return USER_GENDERS.includes(value as UserGenderValue);
}

export function getAvatarOptionsByGender(gender: UserGenderValue) {
  return AVATAR_OPTIONS.filter((option) => option.gender === gender);
}

export function isSupportedAvatarKey(value: string) {
  return AVATAR_OPTIONS.some((option) => option.key === value);
}

export function isAvatarKeyForGender(avatarKey: string, gender: UserGenderValue) {
  return AVATAR_OPTIONS.some((option) => option.key === avatarKey && option.gender === gender);
}

export function getDefaultAvatarKey(gender: UserGenderValue) {
  return getAvatarOptionsByGender(gender)[0]?.key ?? AVATAR_OPTIONS[0].key;
}

export function getAvatarOption(avatarKey?: string | null) {
  if (!avatarKey) return null;
  return AVATAR_OPTIONS.find((option) => option.key === avatarKey) ?? null;
}
