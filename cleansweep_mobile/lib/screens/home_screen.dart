import 'package:flutter/material.dart';
import '../services/memory_service.dart';
import '../widgets/ram_gauge.dart';
import 'settings_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  MemoryInfo? _memory;
  List<AppProcess> _processes = [];
  bool _isCleaning = false;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _refreshData();
  }

  Future<void> _refreshData() async {
    setState(() => _isLoading = true);
    final mem = await MemoryService.getMemoryInfo();
    final procs = await MemoryService.getRunningProcesses();
    if (mounted) {
      setState(() {
        _memory = mem;
        _processes = procs;
        _isLoading = false;
      });
    }
  }

  Future<void> _cleanMemory() async {
    if (_isCleaning) return;
    setState(() => _isCleaning = true);
    
    // Simulate cleanup delay for feedback
    await Future.delayed(const Duration(seconds: 2));
    await MemoryService.cleanMemory();
    
    await _refreshData();
    
    if (mounted) {
      setState(() => _isCleaning = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Memory Optimized!'),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          backgroundColor: Theme.of(context).primaryColor,
        ),
      );
    }
  }

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              _getGreeting(),
              style: const TextStyle(fontSize: 14, color: Colors.grey, fontWeight: FontWeight.normal),
            ),
            const Text('CleanSweep'),
          ],
        ),
        actions: [
          IconButton(
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const SettingsScreen()),
            ),
            icon: const Icon(Icons.settings_outlined),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _refreshData,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(24.0),
          child: Column(
            children: [
              const SizedBox(height: 20),
              if (_memory != null)
                Center(
                  child: RamGauge(
                    percentage: _memory!.usedPercent,
                    usedMB: _memory!.usedMB,
                    totalMB: _memory!.totalMB,
                  ),
                ),
              const SizedBox(height: 40),
              
              // Optimize Button
              SizedBox(
                width: 250,
                height: 60,
                child: ElevatedButton(
                  onPressed: _isLoading || _isCleaning ? null : _cleanMemory,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Theme.of(context).primaryColor,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                  ),
                  child: _isCleaning
                      ? const SizedBox(
                          height: 24,
                          width: 24,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : const Text(
                          'OPTIMIZE NOW',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, letterSpacing: 1.2),
                        ),
                ),
              ),
              
              const SizedBox(height: 50),
              
              // Process List Section
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Running Apps',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  TextButton(
                    onPressed: _refreshData,
                    child: const Text('Refresh'),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              
              if (_isLoading)
                const Center(child: Padding(
                  padding: EdgeInsets.all(40.0),
                  child: CircularProgressIndicator(),
                ))
              else
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _processes.length > 5 ? 5 : _processes.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final proc = _processes[index];
                    return Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.grey.withValues(alpha: 0.05),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.grey.withOpacity(0.05)),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 40,
                            height: 40,
                            decoration: BoxDecoration(
                              color: Theme.of(context).primaryColor.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Icon(Icons.apps, color: Theme.of(context).primaryColor, size: 20),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  proc.processName,
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                Text(
                                  proc.packageName,
                                  style: const TextStyle(color: Colors.grey, fontSize: 12),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ),
                          Text(
                            '${proc.memoryMB} MB',
                            style: TextStyle(
                              color: Theme.of(context).primaryColor,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }
}
