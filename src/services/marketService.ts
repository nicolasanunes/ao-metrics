import type { SearchItem } from '@/types/items'

export interface PriceData {
  item_id: string
  city: string
  quality: number
  sell_price_min: number
  sell_price_min_date: string
  sell_price_max: number
  sell_price_max_date: string
  buy_price_min: number
  buy_price_min_date: string
  buy_price_max: number
  buy_price_max_date: string
}

export function buildQueryUrl(search: SearchItem): string {
  const base = 'https://west.albion-online-data.com/api/v2/stats/prices/'

  const ids = search.ids.join(',')
  const locations = search.locations.map((l) => encodeURIComponent(l)).join(',')
  const qualities = search.qualities.join(',')

  return `${base}${ids}?locations=${locations}&qualities=${qualities}`
}

export async function fetchPrices(search: SearchItem, signal?: AbortSignal): Promise<PriceData[]> {
  const url = buildQueryUrl(search)
  const response = await fetch(url, { signal })

  if (!response.ok) {
    throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<PriceData[]>
}
