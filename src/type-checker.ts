#!/usr/bin/env ts-node

import * as ts from 'typescript';
import * as path from 'path';

if (process.argv.length < 3) {
  console.log('Пожалуйста, укажите путь к файлу TypeScript');
  process.exit(1);
}

const filePath = process.argv[2];
const absolutePath = path.resolve(filePath);

console.log('Проверка типов...');

const configPath = ts.findConfigFile(process.cwd(), ts.sys.fileExists, 'tsconfig.json');
if (!configPath) {
  throw new Error('Не найден tsconfig.json');
}

const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
const parsedConfig = ts.parseJsonConfigFileContent(configFile.config, ts.sys, path.dirname(configPath));

const program = ts.createProgram([absolutePath], parsedConfig.options);
const diagnostics = ts.getPreEmitDiagnostics(program);

if (diagnostics.length === 0) {
  console.log('Ошибок не найдено!');
  process.exit(0);
}

diagnostics.forEach(diagnostic => {
  if (diagnostic.file) {
    const { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start!);
    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
    const fileName = path.relative(process.cwd(), diagnostic.file.fileName);
    console.log(`В файле${fileName}:${line + 1}:${character + 1} - Ошибка ${diagnostic.code}: ${message}`);
    
    // Выводим строку с ошибкой
    const lineText = diagnostic.file.text.split('\n')[line];
    console.log('');
    console.log(lineText);
    console.log(' '.repeat(character) + '^'.repeat(diagnostic.length || 1));
    console.log('');
  }
  console.log('Исправьте ошибки и попробуйте снова');
});

process.exit(1);