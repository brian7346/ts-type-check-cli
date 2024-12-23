#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const checker_1 = require("./checker");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        commander_1.program
            .name('ts-check')
            .description('TypeScript type checker CLI')
            .version('1.0.0')
            .argument('<file>', 'TypeScript file to check')
            .option('-p, --project <path>', 'Path to tsconfig.json')
            .action((file, options) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Создаем промис, который никогда не разрешится
                yield new Promise((resolve) => {
                    (0, checker_1.checkTypes)(`./src/${file}`, {
                        project: options.project,
                        watch: true
                    }).catch((error) => {
                        console.error(error instanceof Error ? error.message : 'Неизвестная ошибка');
                    });
                });
            }
            catch (error) {
                if (error instanceof Error) {
                    console.error(error.message);
                }
                else {
                    console.error('Произошла неизвестная ошибка');
                }
                process.exit(1);
            }
        }));
        yield commander_1.program.parseAsync();
    });
}
run().catch(console.error);
