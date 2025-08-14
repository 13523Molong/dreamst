/*
 * BLEService
 * 轻量封装 react-native-ble-plx，提供扫描/连接与数据收发的基础能力。
 * 注意：需要安装原生依赖并使用 Dev Client 运行。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Platform } from 'react-native';
import { EventEmitter } from 'events';

// 动态加载，避免在未安装原生依赖时崩溃
let BleManagerClass: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  BleManagerClass = require('react-native-ble-plx').BleManager;
} catch (_) {
  BleManagerClass = null;
}

export type BLEDevice = {
  id: string;
  name: string | null;
  rssi?: number | null;
};

export type BLEConfig = {
  // 你的自定义 GATT UUID，可后续填充
  serviceUUID?: string;
  notifyCharUUID?: string;
  writeCharUUID?: string;
  filterNamePrefix?: string; // 扫描时按名称前缀过滤
};

class BLEService extends EventEmitter {
  private static instance: BLEService;
  private manager: any | null = null;
  private device: any | null = null;
  private config: BLEConfig = {};

  public static getInstance(): BLEService {
    if (!BLEService.instance) BLEService.instance = new BLEService();
    return BLEService.instance;
  }

  get isAvailable(): boolean {
    return !!BleManagerClass && Platform.OS !== 'web';
  }

  async initialize(config?: BLEConfig): Promise<void> {
    this.config = { ...this.config, ...(config || {}) };
    if (!this.isAvailable) return;
    if (!this.manager) {
      this.manager = new BleManagerClass();
    }
  }

  async scanOnce(timeoutMs = 4000): Promise<BLEDevice[]> {
    if (!this.isAvailable || !this.manager) return [];

    const found: Record<string, BLEDevice> = {};

    await new Promise<void>((resolve) => {
      const sub = this.manager.startDeviceScan(
        null,
        { allowDuplicates: false },
        (error: any, device: any) => {
          if (error) {
            try { this.manager?.stopDeviceScan(); } catch {}
            resolve();
            return;
          }
          if (!device) return;

          const d: BLEDevice = { id: device.id, name: device.name ?? null, rssi: device.rssi };
          // 可选名称前缀过滤
          if (this.config.filterNamePrefix && d.name && !d.name.startsWith(this.config.filterNamePrefix)) {
            return;
          }
          found[d.id] = d;
        }
      );

      setTimeout(() => {
        try { this.manager?.stopDeviceScan(); } catch {}
        // 清理订阅（某些实现中 startDeviceScan 不返回订阅，这里保护）
        if (typeof sub?.remove === 'function') {
          try { sub.remove(); } catch {}
        }
        resolve();
      }, timeoutMs);
    });

    return Object.values(found);
  }

  async connect(deviceId: string): Promise<boolean> {
    if (!this.isAvailable || !this.manager) return false;
    try {
      this.device = await this.manager.connectToDevice(deviceId, { autoConnect: false });
      await this.device.discoverAllServicesAndCharacteristics();
      // Android: 提升 MTU（非必须）
      if (Platform.OS === 'android') {
        try { await this.device.requestMTU(247); } catch {}
      }
      this.emit('connected', { id: deviceId });
      return true;
    } catch (e) {
      this.emit('error', e);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.isAvailable || !this.manager || !this.device) return;
    try {
      const id = this.device.id;
      await this.device.cancelConnection();
      this.device = null;
      this.emit('disconnected', { id });
    } catch (e) {
      this.emit('error', e);
    }
  }

  // 监听下行数据（Notify）
  monitorNotifications(onChunk: (base64Chunk: string) => void): () => void {
    if (!this.isAvailable || !this.manager || !this.device) return () => {};
    const { serviceUUID, notifyCharUUID } = this.config;
    if (!serviceUUID || !notifyCharUUID) return () => {};
    const sub = this.manager.monitorCharacteristicForDevice(
      this.device.id,
      serviceUUID,
      notifyCharUUID,
      (error: any, characteristic: any) => {
        if (error) return;
        if (!characteristic?.value) return;
        onChunk(characteristic.value); // base64 字符串
      }
    );
    return () => {
      try { sub?.remove?.(); } catch {}
    };
  }

  // 上行写入（Write Without Response）
  async writeBase64(base64Data: string): Promise<void> {
    if (!this.isAvailable || !this.manager || !this.device) return;
    const { serviceUUID, writeCharUUID } = this.config;
    if (!serviceUUID || !writeCharUUID) return;
    await this.device.writeCharacteristicWithoutResponseForService(
      serviceUUID,
      writeCharUUID,
      base64Data
    );
  }
}

export default BLEService;


