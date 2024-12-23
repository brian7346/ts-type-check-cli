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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkTypes = checkTypes;
const ts = __importStar(require("typescript"));
const path = __importStar(require("path"));
const chalk_1 = __importDefault(require("chalk"));
function checkTypes(filePath_1) {
    return __awaiter(this, arguments, void 0, function* (filePath, options = {}) {
        const absolutePath = path.resolve(process.cwd(), `./src/${filePath}`);
        console.log(chalk_1.default.cyan('Проверка типов...'));
        const configPath = options.project
            ? path.resolve(process.cwd(), options.project)
            : ts.findConfigFile(process.cwd(), ts.sys.fileExists, 'tsconfig.json');
        if (!configPath) {
            throw new Error(chalk_1.default.red('Не найден tsconfig.json'));
        }
        const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
        const parsedConfig = ts.parseJsonConfigFileContent(configFile.config, ts.sys, path.dirname(configPath));
        const program = ts.createProgram([absolutePath], parsedConfig.options);
        const diagnostics = ts.getPreEmitDiagnostics(program);
        if (diagnostics.length === 0) {
            console.log(chalk_1.default.green('✓ Проверка типов успешно пройдена!'));
            return;
        }
        console.log(chalk_1.default.red(`\nНайдено ошибок: ${diagnostics.length}\n`));
        diagnostics.forEach(diagnostic => {
            if (diagnostic.file) {
                const { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start);
                const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
                const fileName = path.relative(process.cwd(), diagnostic.file.fileName);
                // Форматированный вывод ошибки
                console.log(`${chalk_1.default.cyan(fileName)}:${chalk_1.default.yellow(`${line + 1}:${character + 1}`)} - ` +
                    `${chalk_1.default.red('error')} ${chalk_1.default.gray(`TS${diagnostic.code}`)}: ${message}`);
                // Показываем проблемную строку кода с подсветкой
                const lineText = diagnostic.file.text.split('\n')[line];
                const errorLength = diagnostic.length || 1;
                console.log();
                console.log(lineText);
                console.log(chalk_1.default.red(' '.repeat(character) + '~'.repeat(errorLength)));
            }
        });
        throw new Error(chalk_1.default.red('\nПроверка типов не пройдена'));
    });
}
