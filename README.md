# Flutter Onion Architecture Feature Generator

A simple VS Code extension that helps you quickly scaffold a Clean Architecture feature (with presentation, domain, and data layers) inside your Flutter projects.

## Features

- Prompts for a feature name (Dart-friendly naming).
- Automatically checks your `pubspec.yaml` to see if it’s a Flutter project.
- Generates folders (presentation, domain, data) and minimal boilerplate Dart files:
  - An entity file
  - A repository interface

## Usage

1. **Open** your Flutter project in VS Code.
2. **Press** <kbd>F5</kbd> to launch the extension development host (if testing locally) or install this extension from the Marketplace.
3. **Open** the Command Palette (<kbd>Ctrl+Shift+P</kbd> on Windows/Linux, <kbd>Cmd+Shift+P</kbd> on macOS).
4. **Run** `Create Clean Architecture Feature` and follow the prompts.

## Requirements

- A Flutter project with `pubspec.yaml`.
- (Optional) The `Dart-Code.dart-code` and `Dart-Code.flutter` extensions installed for best results.
- If your project references `dartz`, ensure it’s listed under dependencies in `pubspec.yaml`.

## Known Issues

- Overwrites existing feature folders only if you confirm.  
- If no `lib` folder is detected, one is created automatically—but consider verifying that your project is a valid Flutter project first.

## Release Notes

### 0.0.1

- Initial release: Basic scaffolding for folders and entity/repository boilerplate files.