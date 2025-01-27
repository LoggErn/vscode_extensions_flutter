import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import * as yaml from 'js-yaml';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    'onionArchitecture.createFeature',
    async (uri: vscode.Uri | undefined) => {
      // 1. Prompt for the feature name
      const featureNameInput = await vscode.window.showInputBox({
        prompt: 'Enter the feature name',
        placeHolder: 'e.g. user_profile',
        validateInput: (value: string) => {
          const trimmed = value.trim();
          if (!trimmed) {
            return 'Feature name cannot be empty';
          }
          // Enforce a Dart-friendly naming pattern:
          if (!/^[a-z][a-z0-9_]*$/.test(trimmed)) {
            return 'Name must start with a lowercase letter and can only contain letters, digits, underscores.';
          }
          return null;
        }
      });

      if (!featureNameInput) {
        // User pressed Esc or input was invalid
        return;
      }
      const featureName = featureNameInput.trim();

      // 2. Check for an open workspace
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage('Please open a Flutter project folder first.');
        return;
      }

      // If multiple, pick the first or prompt user to select one
      const workspacePath = workspaceFolders[0].uri.fsPath;

      // 3. Attempt to parse pubspec.yaml
      const pubspecPath = path.join(workspacePath, 'pubspec.yaml');

      let isLikelyFlutterProject = false;
      let hasDartzDependency = false;

      if (!fs.existsSync(pubspecPath)) {
        vscode.window.showWarningMessage(
          'No pubspec.yaml found. Make sure this is a Flutter project or proceed with caution.'
        );
      } else {
        try {
          const pubspecContent = fs.readFileSync(pubspecPath, 'utf8');
          const pubspecDoc = yaml.load(pubspecContent) as any; // 'any' for quick usage

          // Check if flutter is a dependency or dev_dependency
          if (pubspecDoc?.dependencies?.flutter?.sdk === 'flutter') {
            isLikelyFlutterProject = true;
          } else if (pubspecDoc?.dev_dependencies?.flutter?.sdk === 'flutter') {
            isLikelyFlutterProject = true;
          }
          // Another optional check
          if (pubspecDoc?.flutter) {
            isLikelyFlutterProject = true;
          }

          // Check if "dartz" is declared
          if (pubspecDoc?.dependencies?.dartz !== undefined) {
            hasDartzDependency = true;
          } else if (pubspecDoc?.dev_dependencies?.dartz !== undefined) {
            hasDartzDependency = true;
          }
        } catch (error) {
          vscode.window.showWarningMessage(
            `Could not parse pubspec.yaml. Error: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        }
      }

      // If we parsed pubspec successfully but didn't detect Flutter, warn user
      if (!isLikelyFlutterProject) {
        vscode.window.showWarningMessage(
          'This does not appear to be a Flutter project (no "flutter" dependency found). Proceed with caution.'
        );
      }

      // If we didn't find dartz but are about to generate code referencing it, warn
      if (!hasDartzDependency) {
        vscode.window.showWarningMessage(
          'The generated code references "dartz", but it is not listed in pubspec.yaml. You may need to add "dartz" to your dependencies.'
        );
      }

      // 4. (Optional) Check if user has the Dart & Flutter VS Code extensions installed
      const dartExtension = vscode.extensions.getExtension('Dart-Code.dart-code');
      const flutterExtension = vscode.extensions.getExtension('Dart-Code.flutter');
      if (!dartExtension || !flutterExtension) {
        vscode.window.showWarningMessage(
          'Dart or Flutter VS Code extensions not detected. Code generation will work, but you may want them installed.'
        );
      }

      // 5. Determine where to create the feature folder
      // By default, we use the lib folder.
      let targetDirectory = path.join(workspacePath, 'lib');

      // If the user invoked the command from a folder, and that folder is inside "lib/",
      // use that folder instead.
      if (uri?.fsPath) {
        try {
          const stat = fs.lstatSync(uri.fsPath);
          if (stat.isDirectory()) {
            // Check if it's within "lib"
            const libPath = path.join(workspacePath, 'lib');
            const relative = path.relative(libPath, uri.fsPath);

            // If relative does NOT start with '..', it's inside "lib"
            if (!relative.startsWith('..')) {
              targetDirectory = uri.fsPath;
            }
          }
        } catch (error) {
          // If any error (e.g., no longer exists), we just fall back to "lib".
        }
      }

      // Ensure lib/ exists at least:
      if (!fs.existsSync(path.join(workspacePath, 'lib'))) {
        vscode.window.showWarningMessage(
          'No "lib" folder found. Creating one automatically.'
        );
        fs.mkdirSync(path.join(workspacePath, 'lib'), { recursive: true });
      }

      // 6. Create the feature folder
      const featurePath = path.join(targetDirectory, featureName);

      // If feature folder exists, prompt overwrite
      if (fs.existsSync(featurePath)) {
        const overwrite = await vscode.window.showWarningMessage(
          `Feature "${featureName}" already exists in "${featurePath}". Overwrite?`,
          'Yes',
          'No'
        );
        if (overwrite !== 'Yes') {
          // User either chose No or cancelled
          return;
        }
      }

      // 7. Create subfolders
      const directories = [
        'presentation/bloc',
        'presentation/pages',
        'presentation/widgets',
        'domain/entities',
        'domain/usecases',
        'domain/repositories',
        'data/models',
        'data/repositories',
        'data/datasources'
      ];

      try {
        directories.forEach((dir) => {
          fs.mkdirSync(path.join(featurePath, dir), { recursive: true });
        });

        // 8. Generate boilerplate files
        generateBoilerplateFiles(featurePath, featureName);

        // 9. Notify success
        vscode.window.showInformationMessage(`Feature "${featureName}" created successfully!`);
      } catch (err) {
        vscode.window.showErrorMessage(
          `Error creating feature: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    }
  );

  context.subscriptions.push(disposable);
}

function generateBoilerplateFiles(featurePath: string, featureName: string) {
  // Example entity file
  const entityContent = `
abstract class ${_toPascalCase(featureName)}Entity {
  final String id;

  const ${_toPascalCase(featureName)}Entity({required this.id});
}
  `;
  fs.writeFileSync(
    path.join(featurePath, `domain/entities/${featureName}_entity.dart`),
    entityContent.trim()
  );

  // Example repository interface file
  const repositoryContent = `
import 'package:dartz/dartz.dart';
import '../entities/${featureName}_entity.dart';

abstract class ${_toPascalCase(featureName)}Repository {
  Future<Either<Exception, ${_toPascalCase(featureName)}Entity>> get${_toPascalCase(featureName)}();
}
  `;
  fs.writeFileSync(
    path.join(featurePath, `domain/repositories/${featureName}_repository.dart`),
    repositoryContent.trim()
  );
}

// Helper for converting "user_profile" -> "UserProfile"
function _toPascalCase(str: string): string {
  return str
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

export function deactivate() {}