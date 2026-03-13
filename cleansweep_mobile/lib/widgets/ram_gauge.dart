import 'package:flutter/material.dart';
import 'package:percent_indicator/circular_percent_indicator.dart';

class RamGauge extends StatelessWidget {
  final int percentage;
  final int usedMB;
  final int totalMB;

  const RamGauge({
    super.key,
    required this.percentage,
    required this.usedMB,
    required this.totalMB,
  });

  @override
  Widget build(BuildContext context) {
    Color gaugeColor = const Color(0xFF4A90D9);
    if (percentage > 85) {
      gaugeColor = Colors.redAccent;
    } else if (percentage > 70) {
      gaugeColor = Colors.orangeAccent;
    }

    return CircularPercentIndicator(
      radius: 110.0,
      lineWidth: 18.0,
      animation: true,
      animationDuration: 1200,
      percent: percentage / 100,
      circularStrokeCap: CircularStrokeCap.round,
      progressColor: gaugeColor,
      backgroundColor: Colors.grey.withValues(alpha: 0.1),
      curve: Curves.easeOutCirc,
      center: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            "$percentage%",
            style: const TextStyle(
              fontSize: 42,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
          const Text(
            "RAM USED",
            style: TextStyle(
              fontSize: 12,
              letterSpacing: 1.2,
              color: Colors.black54,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
      footer: Padding(
        padding: const EdgeInsets.only(top: 20),
        child: Text(
          "$usedMB MB / $totalMB MB",
          style: const TextStyle(
            fontSize: 16,
            color: Colors.black45,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
    );
  }
}
