import 'package:flutter/services.dart';

class MemoryInfo {
  final int totalMB;
  final int usedMB;
  final int availMB;
  final int thresholdMB;
  final bool lowMemory;
  final int usedPercent;

  MemoryInfo({
    required this.totalMB,
    required this.usedMB,
    required this.availMB,
    required this.thresholdMB,
    required this.lowMemory,
    required this.usedPercent,
  });
}

class AppProcess {
  final int pid;
  final String processName;
  final String packageName;
  final int memoryMB;

  AppProcess({
    required this.pid,
    required this.processName,
    required this.packageName,
    required this.memoryMB,
  });
}

class MemoryService {
  static const _channel = MethodChannel('com.cleansweep/memory');

  static Future<MemoryInfo> getMemoryInfo() async {
    try {
      final Map<dynamic, dynamic> result = await _channel.invokeMethod('getMemoryInfo');
      
      final int totalBytes = result['totalMem'] as int;
      final int availBytes = result['availMem'] as int;
      final int thresholdBytes = result['threshold'] as int;
      final bool lowMemory = result['lowMemory'] as bool;

      final int totalMB = totalBytes ~/ (1024 * 1024);
      final int availMB = availBytes ~/ (1024 * 1024);
      final int thresholdMB = thresholdBytes ~/ (1024 * 1024);
      final int usedMB = totalMB - availMB;
      final int usedPercent = ((usedMB / totalMB) * 100).round();

      return MemoryInfo(
        totalMB: totalMB,
        usedMB: usedMB,
        availMB: availMB,
        thresholdMB: thresholdMB,
        lowMemory: lowMemory,
        usedPercent: usedPercent,
      );
    } catch (e) {
      // Mock data for development on web/desktop
      return MemoryInfo(
        totalMB: 8192,
        usedMB: 4200,
        availMB: 3992,
        thresholdMB: 500,
        lowMemory: false,
        usedPercent: 51,
      );
    }
  }

  static Future<List<AppProcess>> getRunningProcesses() async {
    try {
      final List<dynamic> result = await _channel.invokeMethod('getRunningProcesses');
      return result.map((e) {
        final map = e as Map<dynamic, dynamic>;
        return AppProcess(
          pid: map['pid'] as int,
          processName: map['processName'] as String,
          packageName: map['packageName'] as String,
          memoryMB: (map['memoryUsage'] as int) ~/ 1024,
        );
      }).toList()
        ..sort((a, b) => b.memoryMB.compareTo(a.memoryMB));
    } catch (e) {
      // Mock data
      return [
        AppProcess(pid: 1, processName: 'Spotify', packageName: 'com.spotify.music', memoryMB: 450),
        AppProcess(pid: 2, processName: 'Instagram', packageName: 'com.instagram.android', memoryMB: 380),
        AppProcess(pid: 3, processName: 'WhatsApp', packageName: 'com.whatsapp', memoryMB: 210),
        AppProcess(pid: 4, processName: 'Google Chrome', packageName: 'com.android.chrome', memoryMB: 650),
      ]..sort((a, b) => b.memoryMB.compareTo(a.memoryMB));
    }
  }

  static Future<bool> cleanMemory() async {
    try {
      return await _channel.invokeMethod('killBackgroundProcesses') as bool;
    } catch (e) {
      return true; // Pretend it worked on mock
    }
  }

  static Future<bool> stopProcess(String packageName) async {
    try {
      return await _channel.invokeMethod('stopPackage', {'packageName': packageName}) as bool;
    } catch (e) {
      return true;
    }
  }
}
