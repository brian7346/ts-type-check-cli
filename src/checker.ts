import * as ts from 'typescript';
import * as path from 'path';
import chalk from 'chalk';
import * as chokidar from 'chokidar';

interface CheckOptions {
  project?: string;
  watch?: boolean;
}

export async function checkTypes(filePath: string, options: CheckOptions = {}) {
  let isWatching = true;

  const check = async () => {
    if (!isWatching) return;
    
    console.clear();
    console.log(chalk.cyan('Проверка типов...'));
    
    const absolutePath = path.resolve(process.cwd(), `./src/${filePath}`);
    
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
        
        console.log(
          `${chalk.cyan(fileName)}:${chalk.yellow(`${line + 1}:${character + 1}`)} - ` +
          `${chalk.red('error')} ${chalk.gray(`TS${diagnostic.code}`)}: ${message}`
        );

        const lineText = diagnostic.file.text.split('\n')[line];
        const errorLength = diagnostic.length || 1;
        
        console.log();
        console.log(lineText);
        console.log(
          chalk.red(' '.repeat(character) + '~'.repeat(errorLength))
        );
      }
    });
  };

  // Запускаем первую проверку
  await check();

  const watcher = chokidar.watch(filePath, { 
    persistent: true,
    ignoreInitial: true 
  });

  watcher.on('all', async (event, path) => {
    if (!isWatching) return;
    console.log(chalk.gray(`\nФайл изменен (${event}): ${path}`));
    try {
      await check();
    } catch (error) {
      console.error(error instanceof Error ? error.message : 'Неизвестная ошибка');
    }
  });

  console.log(chalk.cyan(`\nОтслеживание изменений в ${filePath}...`));
  console.log(chalk.gray('Нажмите Ctrl+C для выхода'));

  // Обработка выхода
  process.on('SIGINT', () => {
    isWatching = false;
    console.log(chalk.yellow('\nЗавершение работы...'));
    watcher.close().then(() => process.exit(0));
  });

  // Держим процесс активным
  return new Promise<void>(() => {
    // Этот промис никогда не разрешится
  });
}