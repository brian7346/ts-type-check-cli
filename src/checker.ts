import * as ts from 'typescript';
import * as path from 'path';
import chalk from 'chalk';

interface CheckOptions {
  project?: string;
}

export async function checkTypes(filePath: string, options: CheckOptions = {}) {
  const absolutePath = path.resolve(process.cwd(), filePath);
  
  console.log(chalk.cyan('Проверка типов...'));

  const configPath = options.project 
    ? path.resolve(process.cwd(), options.project)
    : ts.findConfigFile(process.cwd(), ts.sys.fileExists, 'tsconfig.json');

  if (!configPath) {
    throw new Error(chalk.red('Не найден tsconfig.json'));
  }

  const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
  const parsedConfig = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    path.dirname(configPath)
  );

  const program = ts.createProgram([absolutePath], parsedConfig.options);
  const diagnostics = ts.getPreEmitDiagnostics(program);

  if (diagnostics.length === 0) {
    console.log(chalk.green('✓ Проверка типов успешно пройдена!'));
    return;
  }

  console.log(chalk.red(`\nНайдено ошибок: ${diagnostics.length}\n`));

  diagnostics.forEach(diagnostic => {
    if (diagnostic.file) {
      const { line, character } = ts.getLineAndCharacterOfPosition(
        diagnostic.file, 
        diagnostic.start!
      );
      
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      const fileName = path.relative(process.cwd(), diagnostic.file.fileName);
      
      // Форматированный вывод ошибки
      console.log(
        `${chalk.cyan(fileName)}:${chalk.yellow(`${line + 1}:${character + 1}`)} - ` +
        `${chalk.red('error')} ${chalk.gray(`TS${diagnostic.code}`)}: ${message}`
      );

      // Показываем проблемную строку кода с подсветкой
      const lineText = diagnostic.file.text.split('\n')[line];
      const errorLength = diagnostic.length || 1;
      
      console.log();
      console.log(lineText);
      console.log(
        chalk.red(' '.repeat(character) + '~'.repeat(errorLength))
      );
    }
  });

  throw new Error(chalk.red('\nПроверка типов не пройдена'));
} 