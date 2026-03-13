package com.cleansweep.cleansweep_mobile

import android.app.ActivityManager
import android.content.Context
import android.os.Debug
import androidx.annotation.NonNull
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity: FlutterActivity() {
    private val CHANNEL = "com.cleansweep/memory"

    override fun configureFlutterEngine(@NonNull flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL).setMethodCallHandler {
            call, result ->
            when (call.method) {
                "getMemoryInfo" -> {
                    val memInfo = getMemoryInfo()
                    result.success(memInfo)
                }
                "killBackgroundProcesses" -> {
                    val success = killAllBackgroundProcesses()
                    result.success(success)
                }
                "getRunningProcesses" -> {
                    val processes = getRunningProcesses()
                    result.success(processes)
                }
                "stopPackage" -> {
                    val packageName = call.argument<String>("packageName")
                    if (packageName != null) {
                        killBackgroundProcess(packageName)
                        result.success(true)
                    } else {
                        result.error("INVALID_ARGUMENT", "Package name is null", null)
                    }
                }
                else -> {
                    result.notImplemented()
                }
            }
        }
    }

    private fun getMemoryInfo(): Map<String, Any> {
        val am = getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        val memInfo = ActivityManager.MemoryInfo()
        am.getMemoryInfo(memInfo)
        
        return mapOf(
            "totalMem" to memInfo.totalMem,
            "availMem" to memInfo.availMem,
            "lowMemory" to memInfo.lowMemory,
            "threshold" to memInfo.threshold
        )
    }

    private fun killAllBackgroundProcesses(): Boolean {
        val am = getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        val runningProcesses = am.runningAppProcesses
        if (runningProcesses != null) {
            for (processInfo in runningProcesses) {
                if (processInfo.importance >= ActivityManager.RunningAppProcessInfo.IMPORTANCE_BACKGROUND) {
                    for (pkg in processInfo.pkgList) {
                        if (pkg != packageName) { // Don't kill ourself
                            am.killBackgroundProcesses(pkg)
                        }
                    }
                }
            }
        }
        return true
    }

    private fun killBackgroundProcess(pkg: String) {
        val am = getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        am.killBackgroundProcesses(pkg)
    }

    private fun getRunningProcesses(): List<Map<String, Any>> {
        val am = getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        val runningProcesses = am.runningAppProcesses
        val result = mutableListOf<Map<String, Any>>()
        
        if (runningProcesses != null) {
            val pids = IntArray(runningProcesses.size)
            for (i in runningProcesses.indices) {
                pids[i] = runningProcesses[i].pid
            }
            
            val memInfos = am.getProcessMemoryInfo(pids)
            
            for (i in runningProcesses.indices) {
                val process = runningProcesses[i]
                val memInfo = memInfos[i]
                
                // PSS is Proportional Set Size, a more accurate measure of RAM usage
                val memoryUsage = memInfo.totalPss 
                
                result.add(mapOf(
                    "pid" to process.pid,
                    "processName" to process.processName,
                    "memoryUsage" to memoryUsage, // in KB
                    "packageName" to (process.pkgList.firstOrNull() ?: "")
                ))
            }
        }
        return result
    }
}
