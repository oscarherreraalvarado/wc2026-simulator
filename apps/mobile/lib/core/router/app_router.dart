import 'package:go_router/go_router.dart';
import '../../features/simulator/simulator_screen.dart';

final GoRouter appRouter = GoRouter(
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const SimulatorScreen(),
    ),
  ],
);
