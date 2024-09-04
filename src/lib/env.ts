export function getLocalEnvList(): Record<string, string | undefined> {
  const envList: Record<string, string | undefined> = {};
  
  // Daftar nama variabel lingkungan yang ingin Anda ambil
  const envKeys = [
    'KV_REST_API_URL',
    'KV_REST_API_TOKEN',
    'API_RATE_LIMIT',
    'CHAT_RATE_LIMIT',
    // Tambahkan kunci env lainnya di sini
  ];
  
  for (const key of envKeys) {
    envList[key] = process.env[key];
  }
  
  return envList;
}