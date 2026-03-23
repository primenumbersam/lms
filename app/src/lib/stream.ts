export async function generateStreamToken(videoUid: string, jwkStr: string, keyId: string): Promise<string> {
  // TODO: Cloudflare Stream의 Signed Token (JWT)을 서명하여 반환하는 로직 구현.
  // 현재는 임시값 리턴
  return `signed-token-for-${videoUid}`;
}
