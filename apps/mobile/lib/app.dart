import 'package:flutter/material.dart';
import 'core/router/app_router.dart';

class Wc2026App extends StatelessWidget {
  const Wc2026App({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'WC2026 Simulator',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.green),
        useMaterial3: true,
      ),
      routerConfig: appRouter,
    );
  }
}
