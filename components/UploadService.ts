/*
 * UploadService
 * 将接收到的二进制/文本数据写入本地临时文件，并通过 HTTP 上传至你的服务器。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import * as FileSystem from 'expo-file-system';

// 简易 API 客户端：用于查询历史会话
export async function fetchHistoryMessages(params: { baseUrl: string; userId: string; roleId?: string; limit?: number }) {
  const { baseUrl, userId, roleId, limit = 50 } = params;
  const qs = new URLSearchParams({ user_id: userId, limit: String(limit) });
  if (roleId) qs.append('role_id', roleId);
  const url = `${baseUrl.replace(/\/$/, '')}/conversations/history?${qs.toString()}`;
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) throw new Error(`历史会话获取失败: ${res.status}`);
  return (await res.json()) as Array<{ id: string; conversation_id: string; sender: 'user' | 'role' | 'system' | 'hardware'; text?: string; created_at: string }>;
}

class UploadService {
  private static instance: UploadService;
  private serverUrl = 'http://172.29.49.109:6006';

  
  public static getInstance(): UploadService {
    if (!UploadService.instance) UploadService.instance = new UploadService();
    return UploadService.instance;
  }

  setServer(url: string) {
    this.serverUrl = url;
  }

  async writeTempFile(base64Data: string, filename = `ble_${Date.now()}.bin`): Promise<string> {
    const uri = `${FileSystem.cacheDirectory}${filename}`;
    await FileSystem.writeAsStringAsync(uri, base64Data, { encoding: FileSystem.EncodingType.Base64 });
    return uri;
  }

  async uploadFile(fileUri: string, path = '/upload'): Promise<{ success: boolean; status: number; body?: any }> {
    const uploadUrl = `${this.serverUrl}${path}`;
    const res = await FileSystem.uploadAsync(uploadUrl, fileUri, {
      httpMethod: 'POST',
      fieldName: 'file',
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
    });
    let body: any = undefined;
    try { body = JSON.parse(res.body); } catch { body = res.body; }
    return { success: res.status >= 200 && res.status < 300, status: res.status, body };
  }
}

export default UploadService;


