# Flutter Onion Architecture Feature Generator

A simple VS Code extension that helps you quickly scaffold a Clean Architecture feature (with presentation, domain, and data layers) inside your Flutter projects.

## Features

- Prompts for a feature name (Dart-friendly naming).
- Automatically checks your `pubspec.yaml` to see if it’s a Flutter project.
- Generates folders (presentation, domain, data) and minimal boilerplate Dart files:
  - An entity file
  - A repository interface

## Usage

### Demo 1: Right-Click on a Folder
For the first approach, select the folder under `lib` where you want the new feature created. Right-click, then select **"Clean Architecture: Create feature"** from the context menu.

![Demo 1 - Right-click folder](images/capture1.gif)

### Demo 2: Use the Command Palette
For the second approach, open the **Command Palette** (<kbd>Cmd+Shift+P</kbd> on macOS or <kbd>Ctrl+Shift+P</kbd> on Windows/Linux), type **"Clean Architecture: Create feature"**, then enter the feature name. This will create the feature folder directly under the `lib` directory.

![Demo 2 - Command Palette](images/capture2.gif)

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