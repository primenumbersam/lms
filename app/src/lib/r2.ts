import { R2Bucket } from '@cloudflare/workers-types'

export async function generateR2PresignedUrl(bucketUrl: string, key: string): Promise<string> {
  // TODO: R2 Public URL 또는 aws4fetch를 이용한 Presigned URL 생성
  return `${bucketUrl}/${key}`;
}
