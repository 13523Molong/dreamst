import { EventEmitter } from 'events';

export interface HardwareDevice {
  id: string;
  name: string;
  type: 'bluetooth' | 'sensor' | 'controller' | 'other';
  isConnected: boolean;
  batteryLevel?: number;
  signalStrength?: number;
}

class HardwareService extends EventEmitter {
  private static instance: HardwareService;
  private devices: Map<string, HardwareDevice> = new Map();
  private isScanning = false;

  private constructor() {
    super();
  }

  public static getInstance(): HardwareService {
    if (!HardwareService.instance) {
      HardwareService.instance = new HardwareService();
    }
    return HardwareService.instance;
  }

  // 初始化硬件服务
  async initialize() {
    try {
      console.log('🔧 初始化硬件服务');
      
      // 这里可以添加实际的硬件初始化逻辑
      // 例如：蓝牙初始化、传感器初始化等
      
      // 模拟一些默认设备
      this.addDevice({
        id: 'default-controller',
        name: '智能控制器',
        type: 'controller',
        isConnected: false,
        batteryLevel: 85,
        signalStrength: 90
      });

      this.addDevice({
        id: 'default-sensor',
        name: '环境传感器',
        type: 'sensor',
        isConnected: false,
        batteryLevel: 92,
        signalStrength: 95
      });

    } catch (error) {
      console.error('硬件服务初始化失败:', error);
    }
  }

  // 添加设备
  addDevice(device: HardwareDevice) {
    this.devices.set(device.id, device);
    this.emit('deviceAdded', device);
  }

  // 移除设备
  removeDevice(deviceId: string) {
    const device = this.devices.get(deviceId);
    if (device) {
      this.devices.delete(deviceId);
      this.emit('deviceRemoved', device);
    }
  }

  // 连接设备
  async connectDevice(deviceId: string): Promise<boolean> {
    try {
      const device = this.devices.get(deviceId);
      if (!device) {
        throw new Error('设备不存在');
      }

      console.log(`🔗 正在连接设备: ${device.name}`);

      // 模拟连接过程
      await new Promise(resolve => setTimeout(resolve, 2000));

      device.isConnected = true;
      this.devices.set(deviceId, device);
      
      this.emit('deviceConnected', device);
      console.log(`✅ 设备连接成功: ${device.name}`);
      
      return true;
    } catch (error) {
      console.error('设备连接失败:', error);
      this.emit('deviceConnectionFailed', { deviceId, error });
      return false;
    }
  }

  // 断开设备连接
  async disconnectDevice(deviceId: string): Promise<boolean> {
    try {
      const device = this.devices.get(deviceId);
      if (!device) {
        throw new Error('设备不存在');
      }

      console.log(`🔌 正在断开设备: ${device.name}`);

      // 模拟断开过程
      await new Promise(resolve => setTimeout(resolve, 500));

      device.isConnected = false;
      this.devices.set(deviceId, device);
      
      this.emit('deviceDisconnected', device);
      console.log(`❌ 设备已断开: ${device.name}`);
      
      return true;
    } catch (error) {
      console.error('设备断开失败:', error);
      return false;
    }
  }

  // 扫描设备
  async scanDevices(): Promise<HardwareDevice[]> {
    try {
      if (this.isScanning) {
        return Array.from(this.devices.values());
      }

      this.isScanning = true;
      console.log('🔍 开始扫描硬件设备');

      // 模拟扫描过程
      await new Promise(resolve => setTimeout(resolve, 3000));

      // 模拟发现新设备
      const newDevice: HardwareDevice = {
        id: `device-${Date.now()}`,
        name: '新发现设备',
        type: 'bluetooth',
        isConnected: false,
        batteryLevel: 75,
        signalStrength: 80
      };

      this.addDevice(newDevice);
      this.isScanning = false;

      return Array.from(this.devices.values());
    } catch (error) {
      console.error('设备扫描失败:', error);
      this.isScanning = false;
      return [];
    }
  }

  // 获取所有设备
  getDevices(): HardwareDevice[] {
    return Array.from(this.devices.values());
  }

  // 获取已连接的设备
  getConnectedDevices(): HardwareDevice[] {
    return Array.from(this.devices.values()).filter(device => device.isConnected);
  }

  // 检查是否有设备连接
  hasConnectedDevices(): boolean {
    return this.getConnectedDevices().length > 0;
  }

  // 获取设备状态
  getDeviceStatus(deviceId: string): HardwareDevice | null {
    return this.devices.get(deviceId) || null;
  }

  // 更新设备状态
  updateDeviceStatus(deviceId: string, updates: Partial<HardwareDevice>) {
    const device = this.devices.get(deviceId);
    if (device) {
      const updatedDevice = { ...device, ...updates };
      this.devices.set(deviceId, updatedDevice);
      this.emit('deviceStatusUpdated', updatedDevice);
    }
  }

  // 清理资源
  async cleanup() {
    try {
      console.log('🧹 清理硬件服务资源');
      
      // 断开所有设备连接
      for (const device of this.devices.values()) {
        if (device.isConnected) {
          await this.disconnectDevice(device.id);
        }
      }
      
      this.devices.clear();
      this.removeAllListeners();
    } catch (error) {
      console.error('硬件服务清理失败:', error);
    }
  }
}

export default HardwareService; 