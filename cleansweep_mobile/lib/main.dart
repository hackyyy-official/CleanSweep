import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'screens/home_screen.dart';

void main() {
  runApp(const CleanSweepApp());
}

class CleanSweepApp extends StatelessWidget {
  const CleanSweepApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CleanSweep Mobile',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF4A90D9),
          primary: const Color(0xFF4A90D9),
          background: Colors.white,
          onBackground: Colors.black,
        ),
        scaffoldBackgroundColor: Colors.white,
        textTheme: GoogleFonts.outfitTextTheme(
          Theme.of(context).textTheme,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          elevation: 0,
          centerTitle: false,
          titleTextStyle: TextStyle(
            color: Colors.black,
            fontSize: 24,
            fontWeight: FontWeight.bold,
          ),
          iconTheme: IconThemeData(color: Colors.black),
        ),
        cardTheme: CardTheme(
          color: Colors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
            side: BorderSide(color: Colors.grey.withOpacity(0.1)),
          ),
        ),
      ),
      home: const HomeScreen(),
    );
  }
}
