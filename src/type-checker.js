#!/usr/bin/env ts-node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const ts = __importStar(require("typescript"));
const path = __importStar(require("path"));
if (process.argv.length < 3) {
    console.log('Пожалуйста, укажите путь к файлу TypeScript');
    process.exit(1);
}
const filePath = process.argv[2];
const absolutePath = path.resolve(process.cwd(), `./src/${filePath}`);
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
        const { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start);
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
