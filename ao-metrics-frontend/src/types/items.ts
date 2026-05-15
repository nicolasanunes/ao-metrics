export type Item = string

export interface SearchItem {
  ids: Item[]
  qualities: Quality[]
  locations: string[]
}

export enum Location {
  FortSterling = 'Fort Sterling',
  Lymhurst = 'Lymhurst',
  Bridgewatch = 'Bridgewatch',
  Martlock = 'Martlock',
  Thetford = 'Thetford',
  Caerleon = 'Caerleon',
  Brecilien = 'Brecilien',
}

export enum Quality {
  NORMAL = 1,
  GOOD = 2,
  OUTSTANDING = 3,
  EXCELLENT = 4,
  MASTERPIECE = 5,
}

export enum Market {
  BlackMarket = 'Black Market',
}
