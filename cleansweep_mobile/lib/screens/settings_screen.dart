import 'package:flutter/material.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          _buildStatusCard(context),
          const SizedBox(height: 32),
          _buildSectionTitle('PREFERENCES'),
          _buildSettingRow(
            icon: Icons.auto_mode,
            title: 'Auto-Clean on Launch',
            subtitle: 'Optimize RAM whenever you open the app',
            trailing: Switch(value: false, onChanged: (v) {}),
          ),
          _buildDivider(),
          _buildSettingRow(
            icon: Icons.notifications_none,
            title: 'Usage Alerts',
            subtitle: 'Notify when RAM usage exceeds 85%',
            trailing: Switch(value: true, onChanged: (v) {}),
          ),
          const SizedBox(height: 32),
          _buildSectionTitle('ABOUT'),
          _buildSettingRow(
            icon: Icons.info_outline,
            title: 'Version',
            subtitle: '1.0.0 (Flutter Build)',
          ),
          _buildDivider(),
          _buildSettingRow(
            icon: Icons.code,
            title: 'Source Code',
            subtitle: 'View on GitHub',
            onTap: () {},
          ),
          const SizedBox(height: 48),
          const Center(
            child: Text(
              'Made with ❤️ for CleanSweep',
              style: TextStyle(color: Colors.grey, fontSize: 12),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusCard(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Theme.of(context).primaryColor.withOpacity(0.05),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Theme.of(context).primaryColor.withOpacity(0.1)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.green.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.check, color: Colors.green, size: 20),
          ),
          const SizedBox(width: 16),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Permissions Granted',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
                Text(
                  'CleanSweep can manage apps and optimize RAM usage.',
                  style: TextStyle(color: Colors.black54, fontSize: 13),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16, left: 4),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.bold,
          color: Colors.grey,
          letterSpacing: 1.5,
        ),
      ),
    );
  }

  Widget _buildSettingRow({
    required IconData icon,
    required String title,
    required String subtitle,
    Widget? trailing,
    VoidCallback? onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 4),
        child: Row(
          children: [
            Icon(icon, color: Colors.black87, size: 22),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: const TextStyle(color: Colors.grey, fontSize: 13),
                  ),
                ],
              ),
            ),
            if (trailing != null) trailing,
          ],
        ),
      ),
    );
  }

  Widget _buildDivider() {
    return Divider(color: Colors.grey.withOpacity(0.1), height: 24);
  }
}
