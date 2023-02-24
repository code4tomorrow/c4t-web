import got from 'got'
import lqip from 'lqip-modern'
import pMap from 'p-map'
import pMemoize from 'p-memoize'

import { ExtendedRecordMap, PreviewImage, PreviewImageMap } from 'notion-types'
import { defaultMapImageUrl } from 'react-notion-x'
import { getPageImageUrls } from 'notion-utils'
import getConfig from 'next/config'

const { serverRuntimeConfig } = getConfig();

export async function getPreviewImageMap(
  recordMap: ExtendedRecordMap
): Promise<PreviewImageMap> {
  const urls: string[] = getPageImageUrls(recordMap, {
    mapImageUrl: defaultMapImageUrl
  }).filter(url => !url.includes("amazonaws.com"))

  const previewImagesMap = Object.fromEntries(
    await pMap(urls, async (url) => [url, await getPreviewImage(url)], {
      concurrency: 8
    })
  )

  return previewImagesMap
}

async function createPreviewImage(url: string): Promise<PreviewImage | null> {
  if (!serverRuntimeConfig.authorizedImageDomains.find((domain:string) => url.includes(domain))) {
    return null; 
  }

  try {
    const { body } = await got(url, { responseType: 'buffer' })
    const result = await lqip(body)
    // console.log('lqip', { originalUrl: url, ...result.metadata })
    return {
      originalWidth: result.metadata.originalWidth,
      originalHeight: result.metadata.originalHeight,
      dataURIBase64: result.metadata.dataURIBase64
    }
  } catch (err:any) {
    if (err.message === 'Input buffer contains unsupported image format') {
      return null
    }

    console.warn('failed to create preview image', url, err.message)
    return null
  }
}

export const getPreviewImage = pMemoize(createPreviewImage)