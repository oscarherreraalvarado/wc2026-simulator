import 'package:flutter/material.dart';

class SimulatorScreen extends StatelessWidget {
  const SimulatorScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('WC2026 Simulator')),
      body: const Center(
        child: Text('Monorepo inicializado. Simulador en desarrollo.'),
      ),
    );
  }
}
