/*
 * TransferService
 * 将 BLE 下行的 base64 分片重组为完整文件，完成后调用 UploadService 上传。
 * 协议简化：假定每个分片是纯数据（后续可扩展 seq/total/crc 头部）。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Buffer } from 'buffer';
import UploadService from './UploadService';

class TransferService {
  private static instance: TransferService;
  private chunks: string[] = [];
  private receiving = false;

  public static getInstance(): TransferService {
    if (!TransferService.instance) TransferService.instance = new TransferService();
    return TransferService.instance;
  }

  start() {
    this.chunks = [];
    this.receiving = true;
  }

  pushBase64Chunk(b64: string) {
    if (!this.receiving) return;
    this.chunks.push(b64);
  }

  async finalizeAndUpload(filename?: string) {
    if (!this.receiving) return { success: false };
    this.receiving = false;
    const merged = this.chunks.join('');
    this.chunks = [];
    // 写入临时文件并上传
    const uploader = UploadService.getInstance();
    const uri = await uploader.writeTempFile(merged, filename);
    return await uploader.uploadFile(uri, '/upload');
  }
}

export default TransferService;


